# WorkNote - 工作记录

个人工作日志工具：按天记录工作内容，支持月/季度视图浏览，导出 Markdown 总结。

## 功能

- 按天记录工作内容（Markdown、标签、工时）
- 月视图日历 + 记录列表
- 季度视图 + 周视图
- 标签搜索
- 月/季度总结 Markdown 导出
- JSON 文件本地存储，支持备份/恢复

## 快速开始

```bash
npm install
cp .env.example .env   # 可选
npm run dev
```

- 前端：http://localhost:5173
- 后端：http://localhost:3001
- 数据目录：`./data/`（JSON 文件）

## 数据存储

```
data/
└── entries/
    └── 2026-06.json    # 按月分片的日记
```

## 导出总结

在月视图点击「导出本月总结」，或在季度视图点击「导出季度总结」，会下载包含该周期全部工作记录的 Markdown 文件。

## 脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 同时启动前端和后端 |
| `npm run dev:client` | 仅前端 |
| `npm run dev:server` | 仅后端 |
| `npm run dev:netlify` | 本地模拟 Netlify 环境（含 Functions） |
| `npm run build` | 构建前端 |

## Netlify 部署

本项目已配置 Netlify 静态站点 + Serverless Functions，数据在 Netlify 上使用 [Netlify Blobs](https://docs.netlify.com/blobs/overview/) 持久化存储。

### 部署步骤

1. 将仓库连接到 [Netlify](https://app.netlify.com/)
2. 构建设置会自动从 `netlify.toml` 读取：
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`
3. **不要**设置 `VITE_API_BASE` 环境变量（或留空），前端会通过同域 `/api/*` 访问 Functions
4. 部署完成后，在应用内使用「备份/恢复」功能导入本地 `data/` 目录中的数据

### 本地 Netlify 开发

```bash
npm install
npm run dev:netlify
```

### 架构说明

```
浏览器 → /api/* → Netlify Function (Express) → Netlify Blobs
浏览器 → /*     → dist/ (Vue SPA)
```

本地开发仍可使用 `npm run dev`，数据存储在 `./data/` 目录的 JSON 文件中。

