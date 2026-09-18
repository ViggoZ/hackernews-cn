# HackerNews 中文版

这是一个使用现代技术栈构建的 HackerNews 中文版网站，提供实时翻译的英文科技新闻和讨论。

## 项目特点

- 🚀 实时同步 HackerNews 最新内容
- 🤖 使用 OpenAI API 智能翻译
- 💻 现代化的用户界面设计
- ⚡ 快速的加载速度和响应式设计
- 🌐 支持多种内容分类浏览

## 技术栈

### 前端
- **Next.js 14**: React框架，用于构建现代化的服务端渲染应用
- **Tailwind CSS**: 用于样式开发的实用优先的CSS框架
- **shadcn/ui**: 高质量的UI组件库
- **Lucide Icons**: 现代简约风格的图标库

### 后端
- **Next.js API Routes**: 服务端API实现
- **Prisma**: 现代化的ORM工具
- **PostgreSQL**: 主数据库
- **OpenAI API**: 提供高质量的内容翻译服务

### 部署和基础设施
- **Vercel**: 应用托管和自动部署
- **Vercel Cron Jobs**: 定时任务处理
- **Vercel Postgres**: 数据库服务

## 开发环境要求

- Node.js 18+
- pnpm 8+
- PostgreSQL（本地开发可选）

## 本地开发

1. 克隆项目

```bash
git clone https://github.com/ViggoZ/hackernews-cn.git
cd hackernews-cn
```

2. 安装依赖

```bash
pnpm install
```

3. 配置环境变量

```bash
cp .env.example .env
```

然后编辑 .env 文件，填入必要的环境变量：
- DATABASE_URL: PostgreSQL 数据库连接URL
- OPENAI_API_KEY: OpenAI API密钥
- NEXT_PUBLIC_APP_URL: 应用URL
- CRON_SECRET: 定时任务密钥

4. 初始化数据库

```bash
pnpm prisma db push
```

7. 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000 查看应用。

## 部署

本项目已配置为可以直接部署到 Vercel 平台。

1. Fork 本项目到你的 GitHub 账号
2. 在 Vercel 中导入项目
3. 配置必要的环境变量：
   - `DATABASE_URL`: 推荐使用 Vercel Postgres 数据库，在 Vercel 控制台中创建并获取连接 URL
   - `OPENAI_API_KEY`: 从 OpenAI 获取的 API 密钥
   - `NEXT_PUBLIC_APP_URL`: 您的 Vercel 部署 URL（例如：https://your-app.vercel.app）
   - `CRON_SECRET`: 设置一个安全的随机字符串，用于保护定时任务 API
4. 初始化数据库：
   - 部署完成后，在 Vercel 控制台中打开项目
   - 进入 "Storage" 标签页，创建 Postgres 数据库
   - 数据库会自动完成初始化
5. 部署完成后即可访问

注意：项目已配置每小时自动更新内容，您可以在 Vercel 的 "Cron Jobs" 中监控定时任务的执行情况。

## 项目结构

```
├── src/
│   ├── app/          # Next.js 应用路由和页面
│   ├── components/   # React 组件
│   ├── lib/         # 工具函数和配置
│   └── types/       # TypeScript 类型定义
├── prisma/          # 数据库模型和迁移
├── public/          # 静态资源
└── ...配置文件
```

## 功能特性

- 实时同步 HackerNews 最新内容
  - 每小时自动抓取最新内容
  - 支持多种内容类型：最新、最热、Ask HN、Show HN、Jobs
- 智能翻译
  - 使用 OpenAI API 进行高质量翻译
  - 支持标题和正文的中英对照显示
  - 保留原文链接便于对照
- 用户体验
  - 现代简约的界面设计
  - 响应式布局，完美支持移动端
  - 快速的页面加载和转换
  - 支持深色模式
- 系统特性
  - 基于 Vercel 的可靠部署
  - PostgreSQL 数据持久化
  - 自动的定时更新机制
  - ISR 增量静态再生成

## 贡献指南

欢迎提交 Pull Request 或创建 Issue！

## 问题反馈

如果您在使用过程中遇到任何问题，或有任何建议，请通过以下方式反馈：

1. 在 GitHub 上提交 Issue
2. 在 Twitter 上联系 [@decohack](https://twitter.com/decohack)
3. 发送邮件至 [viggo.zw@gmail.com]（请替换为您的邮箱）

## 开源协议

MIT License
