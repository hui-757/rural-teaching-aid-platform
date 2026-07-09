# Supabase 环境变量配置说明

## 必需环境变量

| 变量名 | 说明 | 示例格式 |
|--------|------|----------|
| SUPABASE_URL | Supabase 项目 API 地址 | `https://<project-ref>.supabase.co` |
| SUPABASE_ANON_KEY | Supabase 匿名（anon）公钥，用于客户端初始化 | `eyJhbG...` |
| APP_ENV | 应用运行环境 | `development` / `production` |
| APP_PORT | 应用服务端口 | `3000` |

## 配置方式

1. 在项目根目录创建 `.env` 文件
2. 填入上述变量值（真实值请从 Supabase Dashboard 获取）
3. 应用启动时读取 `.env`，使用 Supabase Client 初始化连接

## 注意事项

- `SUPABASE_ANON_KEY` 属于客户端可见的公钥，**禁止**用于服务端敏感操作
- 服务端如需执行管理员操作（如批量删除、绕过 RLS），应使用 `SUPABASE_SERVICE_ROLE_KEY`（该 key 必须保存在服务端，不得暴露给前端）
- `.env` 文件已加入 `.gitignore`，防止密钥提交到代码仓库
