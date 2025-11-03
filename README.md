# Move Car Notice - PartyKit Server

独立的 PartyKit 服务器，为挪车通知系统提供实时消息推送服务。

## 项目结构

```
move-car-notice-partykit/
├── package.json          # 依赖配置
├── partykit.json         # PartyKit 配置
├── partykit-server.ts    # PartyKit 服务器代码
└── README.md            # 说明文档
```

## 部署说明

### 1. 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 2. 部署到 PartyKit

```bash
# 部署到 PartyKit 平台
npm run deploy
```

### 3. 环境配置

部署后，需要在主项目中更新环境变量：

```env
# 生产环境配置
PARTYKIT_HOST=your-project.partykit.dev
PARTYKIT_PROTOCOL=https
NEXT_PUBLIC_PARTYKIT_HOST=your-project.partykit.dev
NEXT_PUBLIC_PARTYKIT_PROTOCOL=wss
```

## 功能特性

- ✅ 动态会话房间管理
- ✅ 实时消息推送
- ✅ HTTP API 支持
- ✅ 生产环境就绪

## 与主项目集成

主项目通过环境变量配置 PartyKit 服务器地址，实现无缝集成。