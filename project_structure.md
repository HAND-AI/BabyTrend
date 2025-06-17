# 🧱 项目代码结构建议

以下是前后端的项目结构设计，便于使用 Cursor 快速生成并扩展项目。

---

## 🔙 后端结构（Flask）
backend/
├── app.py # 主入口
├── config.py # 配置文件
├── database.py # 数据库初始化
├── models/ # 数据模型
│ ├── user.py
│ ├── upload.py
│ ├── price.py
│ └── duty.py
├── routes/ # 路由
│ ├── auth.py
│ ├── user.py
│ └── admin.py
├── services/ # 业务逻辑模块
│ ├── file_parser.py
│ ├── price_matcher.py
│ └── validator.py
├── utils/ # 工具模块
│ └── jwt.py # JWT 生成与解析
└── requirements.txt

## 🎨 前端结构（React + Vite）
frontend/
├── public/
├── src/
│ ├── assets/ # 图片或图标资源
│ ├── components/ # 可复用组件
│ │ ├── FileUploader.tsx
│ │ ├── RecordTable.tsx
│ │ └── AuthForm.tsx
│ ├── pages/
│ │ ├── LoginPage.tsx
│ │ ├── RegisterPage.tsx
│ │ ├── DashboardPage.tsx
│ │ └── AdminPage.tsx
│ ├── services/ # API 调用封装
│ │ ├── api.ts
│ │ └── auth.ts
│ ├── utils/
│ │ └── token.ts # 本地存储JWT
│ ├── App.tsx
│ ├── main.tsx
│ └── router.tsx # 路由配置
├── tailwind.config.js
├── index.html
└── package.json

---

## 🔑 页面说明

| 页面           | 权限       | 说明                             |
|----------------|------------|----------------------------------|
| /register       | 所有人     | 注册页面                         |
| /login          | 所有人     | 登录页面                         |
| /dashboard      | 用户       | 上传文件 + 查看上传历史          |
| /admin          | 管理员     | 上传 Price List、审批记录        |

---

## 🧪 前端交互逻辑建议

- 登录成功后保存 JWT → 注入请求头
- Dashboard:
  - 上传后实时展示上传结果（Success / Pending）
  - 表格按时间排序，状态高亮
- Admin:
  - 分页展示所有上传记录
  - 支持状态筛选（pending）
  - 每条 pending 项目点开后可审批（Approve/Reject + 留言）

---

## ✅ 模块化建议

- **组件可复用**：UploadForm, RecordTable, AuthModal
- **状态管理**：建议使用简单的 `useState` / `useContext`，避免引入 Redux
- **样式**：使用 Tailwind CSS 实现快速原型开发

---
