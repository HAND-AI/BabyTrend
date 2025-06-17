# 📦 Packing List Management System 项目说明文档

## 1. 系统简介

本系统支持用户上传 Packing List（Excel），自动解析其中的 Item Code、Quantity、Price，并与系统中已有的 Price List 匹配验证。管理员可管理 Price List 和 Duty Rate，并审批用户上传的异常记录。

---

## 2. 用户角色与权限

### 👤 普通用户
- 注册与登录
- 上传 Packing List
- 查看个人上传记录及状态

### 🛡 管理员
- 登录
- 上传 Price List
- 上传 Duty Rate 表
- 查看所有上传记录
- 审批 pending 状态记录（Approve / Reject）

---

## 3. 核心功能流程

### 📥 Packing List 上传流程

1. 用户上传 Excel 文件（Packing List）
2. 系统自动提取：Item Code、Quantity、Price
3. 逐项比对：
   - 是否成功提取？
   - 是否能在 Price List 中找到对应 Item Code？
   - 是否 Unit Price 匹配？
4. 校验结果：
   - 全部通过 → 状态为 `success`
   - 任一失败 → 状态为 `pending`
5. 用户查看上传历史和结果

---

## 4. 数据表结构（数据库）

### 🧍 User

| 字段        | 类型       | 说明         |
|-------------|------------|--------------|
| id          | int (PK)   | 用户ID       |
| username    | string     | 用户名       |
| password    | string     | 密码哈希     |
| is_admin    | boolean    | 是否为管理员 |

---

### 📄 UploadRecord

| 字段        | 类型           | 说明                       |
|-------------|----------------|----------------------------|
| id          | int (PK)       | 上传记录ID                 |
| user_id     | int (FK)       | 上传用户ID                 |
| filename    | string         | 文件名                     |
| upload_time | datetime       | 上传时间                   |
| status      | enum           | success / pending / approved / rejected |
| items       | JSON           | 解析后的内容               |
| review_comment | string/null | 审批备注（仅admin可填）     |

---

### 🧾 PriceList

| 字段        | 类型       | 说明         |
|-------------|------------|--------------|
| item_code   | string (PK)| 产品编号     |
| unit_price  | float      | 单价         |
| updated_at  | datetime   | 更新时间     |

---

### 💰 DutyRate

| 字段        | 类型       | 说明         |
|-------------|------------|--------------|
| item_code   | string (PK)| 产品编号     |
| rate        | float      | 税率         |
| updated_at  | datetime   | 更新时间     |

---

## 5. 后端 API 接口文档

### 👤 用户接口 `/api/user/*`

| 方法 | 路径                  | 描述             |
|------|-----------------------|------------------|
| POST | `/register`           | 用户注册         |
| POST | `/login`              | 用户登录（返回JWT）|
| POST | `/upload/packing-list`| 上传 Packing List|
| GET  | `/uploads`            | 获取用户上传记录 |

---

### 🛡 管理员接口 `/api/admin/*`

| 方法 | 路径                  | 描述             |
|------|-----------------------|------------------|
| POST | `/upload/price-list`  | 上传 Price List  |
| POST | `/upload/duty-rate`   | 上传 Duty Rate   |
| GET  | `/uploads`            | 获取所有上传记录 |
| POST | `/review/{upload_id}` | 审批上传记录（状态修改）|

---

## 6. 校验逻辑说明

- ✅ 成功：
  - 所有 Item 能成功提取，匹配到价格，价格一致
- ⚠️ Pending：
  - Item 缺失字段、未匹配到 Item Code、价格不一致
- ❌ Reject/Approve：
  - 由管理员手动处理 pending 状态

---

## 7. 启动说明

### 后端
'''bash
cd backend
pip install -r requirements.txt
flask run
###前端

cd frontend
npm install
npm run dev