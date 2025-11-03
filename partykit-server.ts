// PartyKit 服务器 - 实时消息推送服务（动态房间版本）
import { PartyKitServer } from "partykit/server";

// 会话房间服务器 - 每个会话一个独立房间
const SessionServer: PartyKitServer = {
  async onConnect(ws, room) {
    console.log(`客户端连接: ${ws.id} 加入会话房间: ${room.id}`);
    
    // 发送欢迎消息
    ws.send(JSON.stringify({
      type: 'welcome',
      message: '欢迎使用挪车系统实时消息服务',
      roomId: room.id,
      timestamp: new Date().toISOString()
    }));
  },

  async onMessage(message: string | ArrayBuffer | ArrayBufferView, ws, room) {
    try {
      // 将消息转换为字符串
      const messageString = typeof message === 'string' ? message : new TextDecoder().decode(message as ArrayBuffer);
      const data = JSON.parse(messageString) as {
        type: string;
        [key: string]: any;
      };
      
      switch (data.type) {
        case 'join_room':
          // 客户端加入房间确认
          console.log(`客户端 ${ws.id} 确认加入房间: ${room.id}`);
          
          // 发送确认消息
          ws.send(JSON.stringify({
            type: 'room_joined',
            roomId: room.id,
            message: `成功加入会话房间: ${room.id}`
          }));
          break;
          
        default:
          console.log('未知消息类型:', data.type);
      }
    } catch (error) {
      console.error('消息处理错误:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: '消息格式错误'
      }));
    }
  },

  async onClose(ws, room) {
    console.log(`客户端断开连接: ${ws.id} 离开会话房间: ${room.id}`);
  },

  // 会话房间的 HTTP API
  async onRequest(request: any, room) {
    if (request.method === 'POST' && request.url.includes('/api/push-reply')) {
      try {
        const data = await request.json() as {
          roomId: string;
          message: string;
          senderName: string;
          senderRole?: string;
          timestamp?: string;
          recordId?: string;
        };
        
        // 验证必要字段
        if (!data.message || !data.senderName) {
          return new Response(JSON.stringify({ error: '缺少必要字段' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        console.log(`在会话房间 ${room.id} 推送消息:`, data.message);
        
        // 广播消息到当前会话房间的所有客户端
        room.broadcast(JSON.stringify({
          type: 'reply_message',
          id: Date.now().toString(),
          message: data.message,
          senderName: data.senderName,
          senderRole: data.senderRole,
          timestamp: data.timestamp || new Date().toISOString(),
          recordId: data.recordId
        }));

        return new Response(JSON.stringify({
          success: true,
          message: '消息推送成功',
          roomId: room.id
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
        
      } catch (error) {
        console.error('会话房间 API 错误:', error);
        return new Response(JSON.stringify({ error: '内部服务器错误' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // 默认响应 - 显示完整的房间ID
    return new Response(JSON.stringify({
      message: '会话房间运行中',
      roomId: room.id
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// 主服务器 - 处理房间路由
const MainServer: PartyKitServer = {
  async onRequest(request: any, room) {
    if (request.method === 'POST' && request.url.includes('/api/push-reply')) {
      try {
        const data = await request.json() as {
          roomId: string;
          message: string;
          senderName: string;
          senderRole?: string;
          timestamp?: string;
          recordId?: string;
        };
        
        // 验证必要字段
        if (!data.roomId || !data.message || !data.senderName) {
          return new Response(JSON.stringify({ error: '缺少必要字段' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        // 获取指定房间并广播消息
        const targetRoom = room.context.parties.session.get(data.roomId);
        if (!targetRoom) {
          return new Response(JSON.stringify({ error: '房间不存在' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        // 通过房间的 HTTP API 推送消息
        const response = await targetRoom.fetch("/api/push-reply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });

        return response;
        
      } catch (error) {
        console.error('PartyKit API 错误:', error);
        return new Response(JSON.stringify({ error: '内部服务器错误' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // 默认响应
    return new Response(JSON.stringify({
      message: 'PartyKit 主服务器运行中',
      endpoints: ['POST /api/push-reply']
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// 导出服务器配置
// 使用会话服务器作为主服务器，支持动态房间
export default SessionServer;