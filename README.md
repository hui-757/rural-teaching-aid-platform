# 乡村教学辅助平台

> 基于 Supabase 的乡村小学教学辅助系统，面向四年级数学教学，提供授课辅助、基础测试、闯关游戏等核心功能。

## 技术栈

- **后端 BaaS**: [Supabase](https://supabase.com)（PostgreSQL + Auth + RLS + Realtime）
- **前端框架**: React 18 + TypeScript + Vite + Tailwind CSS v4
- **状态管理**: Zustand
- **路由**: React Router v7
- **图标**: Lucide React
- **部署**: 静态前端 + Supabase Edge Functions

## 项目结构

```
rural-teaching-aid-platform/
├── docs/                          # 设计文档
│   ├── 需求设计文档.md
│   ├── 详细设计文档（Supabase版）.docx
│   └── 接口协议文档_模块拆分与对接规范.docx
├── rural-teaching-aid-frontend/   # 前端源码（React + TypeScript）
│   ├── src/
│   │   ├── pages/                 # 页面组件
│   │   ├── components/            # UI 组件（长城风格）
│   │   ├── store/                 # Zustand 状态管理
│   │   ├── lib/                   # Supabase 客户端 + 工具
│   │   └── types/                 # TypeScript 类型定义
│   ├── .env.example               # 前端环境变量模板
│   └── package.json
├── supabase/
│   ├── migrations/                # 数据库迁移脚本
│   ├── functions/                 # Edge Functions
│   └── seed.sql                   # 初始数据
├── assets/                        # 教材内容（Markdown + 配图）
├── data/                          # 题库数据（JSON/CSV）
├── .env.example                   # 环境变量模板（真实值不提交）
├── .gitignore
└── README.md
```

## 快速开始

### 1. 环境变量

复制 `.env.example` 为 `.env`，填入真实值：

```bash
cp .env.example .env
```

### 前端开发

```bash
cd rural-teaching-aid-frontend
npm install
npm run dev
```

前端环境变量（`rural-teaching-aid-frontend/.env`）：

```
VITE_SUPABASE_URL=https://kcavasttvezmhaixuvmd.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 数据库迁移（Supabase CLI）

```bash
supabase db push
```

## 文档索引

| 文档 | 说明 | 阅读对象 |
|------|------|----------|
| 需求设计文档 | 原始需求，产品背景、用户痛点、功能概述 | 全员 |
| 详细设计文档 | 系统架构、数据库设计、模块详细设计、接口设计 | 主干团队 + 外包技术负责人 |
| 接口协议文档 | 模块拆分、可外包范围、输入输出规格、验收标准 | 外包团队 + 主干团队 |

## 协作规范

- **代码仓库**: GitHub（本项目）
- **问题追踪**: GitHub Issues（标注模块代号，如 `[模块A]` `[模块B]`）
- **接口变更**: 任何契约变更需提交《接口变更申请单》，双方评审通过后更新文档版本
- **验收测试**: 按接口协议文档附录中的测试用例执行，P0 功能必须全部通过

## 版本记录

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| v0.1 | 2026-07-09 | 项目初始化，创建 GitHub 仓库 |

## 版权

代码版权归项目方所有，外包团队保留署名权。

---

> 关于详细接口规范和模块拆分，请查阅 `docs/接口协议文档_模块拆分与对接规范.docx`
