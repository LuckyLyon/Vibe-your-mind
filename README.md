<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# 🎨 Vibe Your Mind

**一个充满创意的社区平台 - 让想法碰撞,让创意发光**

[![Status](https://img.shields.io/badge/Status-Production%20Ready-success)](https://github.com) [![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE) [![Supabase](https://img.shields.io/badge/Supabase-Ready-green)](https://supabase.com)

</div>

---

## ✨ 核心功能

- **🌌 创意宇宙**: 发布、编辑、点赞创意,支持 AI 润色和 Markdown
- **💬 评论系统**: 多级回复、@提及、实时同步
- **🔥 实时聊天**: WebSocket 秒级推送、在线状态、AI 机器人
- **💰 赏金猎人**: 发布/接受任务、状态管理、联系发布者
- **📸 文件上传**: 图片/视频上传、自动压缩、CDN 加速
- **👤 用户认证**: 邮箱注册/登录、JWT 管理
- **🤖 AI 集成**: DeepSeek API 驱动的内容润色和聊天

## 🚀 快速启动

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

创建 `.env.local` 文件:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 3. 配置数据库

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 打开 **SQL Editor**
3. 复制 `supabase_setup.sql` 内容并执行
4. 创建 Storage Bucket: `user-uploads` (Public)

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

## 📦 技术栈

- **前端**: React 19 + TypeScript + Tailwind CSS
- **后端**: Supabase (PostgreSQL + Realtime + Storage + Auth)
- **AI**: DeepSeek API
- **构建**: Vite 6
- **部署**: EdgeOne Pages

## 🏗️ 项目结构

```
vibe-your-mind/
├── api/              # Supabase API 封装
│   ├── ideas.ts      # 创意管理
│   ├── comments.ts   # 评论系统
│   ├── chat.ts       # 实时聊天
│   ├── bounties.ts   # 赏金任务
│   └── storage.ts    # 文件上传
├── hooks/            # React Hooks
│   ├── useAuth.ts
│   ├── useIdeas.ts
│   ├── useComments.ts
│   ├── useChat.ts
│   └── useBounties.ts
├── pages/            # 页面组件
│   ├── Home.tsx
│   ├── IdeaUniverse.tsx
│   ├── IdeaDetail.tsx
│   ├── Chat.tsx
│   └── BountyHunters.tsx
├── components/       # UI 组件
│   ├── Header.tsx
│   ├── GlassCard.tsx
│   ├── Button.tsx
│   ├── AuthModal.tsx
│   └── FileUpload.tsx
└── lib/             # 工具库
    └── supabase.ts  # Supabase 客户端

```

## 🔧 开发指南

### 构建生产版本

```bash
npm run build
```

输出目录: `dist/`

### 预览生产构建

```bash
npm run preview
```

### 部署到 EdgeOne Pages

1. 推送代码到 GitHub
2. 连接 EdgeOne Pages
3. 配置环境变量
4. 自动部署

## 📝 数据库 Schema

项目包含 11 张核心表:

- `profiles` - 用户资料
- `ideas` - 创意管理
- `comments` - 评论系统
- `likes` - 点赞记录
- `channels` - 聊天频道
- `messages` - 聊天消息
- `bounties` - 赏金任务
- `vinyls` - 提示词黑胶
- `projects` - 精品项目
- `project_likes` - 项目点赞
- `idea_collaborators` - 创意协作者

详见 `supabase_setup.sql`

## 🎯 特性亮点

- **实时性能**: Supabase Realtime 实现毫秒级消息推送
- **在线状态**: Presence API 自动同步在线用户
- **评论树形结构**: 递归算法构建多级回复
- **自动计数器**: PostgreSQL 触发器维护计数
- **AI 集成**: 聊天机器人自动回复
- **文件压缩**: 客户端自动压缩图片
- **CDN 加速**: Supabase 自动 CDN 分发
- **权限控制**: RLS 行级安全策略

## 📊 项目状态

查看 `PROJECT_STATUS.md` 了解详细进度

**总进度: 100% 完成** ✅

- ✅ 环境配置
- ✅ 数据库架构
- ✅ 用户认证
- ✅ AI 服务
- ✅ Idea 管理
- ✅ 评论系统
- ✅ 实时聊天
- ✅ 赏金任务
- ✅ 文件上传
- ✅ 前端部署

## 🤝 贡献

欢迎提交 Issue 和 PR!

## 📄 许可证

MIT License

---

<div align="center">
  <strong>🎉 Built with Vibe 🎉</strong>
</div>
