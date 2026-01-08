---
name: fix-database-relationship-queries
overview: 修复 ideas 和 bounties API 中的数据库关系查询语法错误，将错误的 `profiles:field_name` 语法改为正确的 `profiles!foreign_key_name` 或 `profiles(field)` 语法，解决无法发布创意和赏金任务的问题。
todos:
  - id: explore-api-files
    content: 使用 [subagent:code-explorer] 探索 api/ideas.ts 和 api/bounties.ts，定位所有使用 profiles:field_name 语法的查询
    status: completed
  - id: check-foreign-keys
    content: 检查数据库 schema，确认 ideas 和 bounties 表与 profiles 表的外键约束名称
    status: completed
    dependencies:
      - explore-api-files
  - id: fix-ideas-queries
    content: 修复 api/ideas.ts 中的外键关联语法
    status: completed
    dependencies:
      - check-foreign-keys
  - id: fix-bounties-queries
    content: 修复 api/bounties.ts 中的外键关联语法
    status: completed
    dependencies:
      - check-foreign-keys
  - id: test-and-verify
    content: 本地测试创意和赏金任务的发布功能，验证修复效果
    status: completed
    dependencies:
      - fix-ideas-queries
      - fix-bounties-queries
---

## 产品概述

修复 Vibe Your Mind 项目中 ideas 和 bounties API 的数据库关系查询语法错误，确保用户能够正常发布创意和赏金任务。

## 核心功能

- 修正 ideas API 中的 Supabase 外键关联语法
- 修正 bounties API 中的 Supabase 外键关联语法
- 将错误的 `profiles:field_name` 语法改为正确的 `profiles!foreign_key_name` 或 `profiles(field)` 语法
- 验证修复后的查询能够正确获取用户资料数据

## 技术栈

- 后端框架：Next.js API Routes (TypeScript)
- 数据库：Supabase (PostgreSQL)
- ORM：Supabase Client

## 技术架构

### 系统架构

现有项目采用 Next.js 全栈架构，后端 API 通过 API Routes 实现，数据持久化使用 Supabase 云数据库。本次修复仅涉及查询语法调整，不改变整体架构。

### 模块划分

- **Ideas API 模块** (`api/ideas.ts`)：负责创意的增删改查操作
- **Bounties API 模块** (`api/bounties.ts`)：负责赏金任务的增删改查操作
- **数据库关系层**：ideas/bounties 表与 profiles 表之间的外键关联

### 数据流

```mermaid
flowchart LR
    A[前端发起创建请求] --> B[API Routes处理]
    B --> C{Supabase查询}
    C -->|正确语法| D[成功获取profiles关联数据]
    C -->|错误语法| E[报错: 找不到关系]
    D --> F[返回成功结果]
    E --> G[返回错误信息]
```

## 实施细节

### 核心目录结构

```
project-root/
└── api/
    ├── ideas.ts        # 需修复：ideas表的外键关联语法
    └── bounties.ts     # 需修复：bounties表的外键关联语法
```

### 关键代码结构

**Supabase 外键关联查询语法**：

错误语法示例：

```typescript
// 错误：使用冒号指定字段
.select('*, profiles:user_id(username, avatar_url)')
```

正确语法示例：

```typescript
// 正确方式1：使用感叹号指定外键名称
.select('*, profiles!ideas_user_id_fkey(username, avatar_url)')

// 正确方式2：如果外键命名规范，直接使用括号
.select('*, profiles(username, avatar_url)')
```

### 技术实施方案

#### 问题分析

- **问题根源**：Supabase 查询中使用了不支持的 `profiles:field_name` 语法
- **解决方案**：根据数据库外键约束名称，使用正确的关联语法
- **关键技术**：Supabase 外键关联查询规范

#### 实施步骤

1. **检查数据库外键约束**：确认 ideas 和 bounties 表与 profiles 表的外键约束名称
2. **更新 ideas.ts 查询语法**：将所有 `profiles:user_id` 改为 `profiles!ideas_user_id_fkey` 或 `profiles(username, avatar_url)`
3. **更新 bounties.ts 查询语法**：将所有 `profiles:user_id` 改为 `profiles!bounties_user_id_fkey` 或 `profiles(username, avatar_url)`
4. **本地测试验证**：测试创建和查询功能，确保能正常获取关联的用户资料数据
5. **部署并验证**：确认生产环境问题解决

#### 测试策略

- 单元测试：验证 API 返回数据包含正确的 profiles 字段
- 集成测试：测试完整的创建流程，从前端提交到数据库存储
- 错误处理测试：验证外键约束异常的处理逻辑

### 集成点

- **数据库连接**：使用项目现有的 Supabase 客户端配置
- **外键约束**：依赖数据库表 ideas/bounties 与 profiles 的外键定义
- **API 响应格式**：保持现有 JSON 响应结构不变

## 技术考量

### 日志记录

遵循项目现有的日志规范，记录查询执行情况和错误信息。

### 性能优化

- 仅查询必要的 profiles 字段（username, avatar_url），避免过度获取
- 利用 Supabase 的关联查询优化，减少多次查询开销

### 安全措施

- 验证用户身份后再执行创建操作
- 使用 Supabase RLS（Row Level Security）确保数据访问权限

### 可扩展性

修复后的查询语法符合 Supabase 规范，便于未来添加更多关联表查询。

## Agent Extensions

### SubAgent

- **code-explorer**
- 目的：搜索并定位 api/ideas.ts 和 api/bounties.ts 中所有使用错误外键语法的查询语句
- 预期结果：找到所有需要修改的 `.select()` 查询，并识别正确的外键约束名称