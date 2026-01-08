---
name: supabase-setup-guide
overview: 为小白用户提供超详细的 Supabase 配置指南，包括获取 API 密钥、执行 SQL 脚本、创建 Storage Bucket、配置环境变量和启动项目的完整步骤。
todos:
  - id: access-supabase-dashboard
    content: 登录 Supabase 并进入项目面板
    status: completed
  - id: obtain-api-credentials
    content: 获取 Project URL 和 API Key 配置信息
    status: completed
    dependencies:
      - access-supabase-dashboard
  - id: execute-sql-scripts
    content: 使用 SQL Editor 执行数据库初始化脚本
    status: completed
    dependencies:
      - access-supabase-dashboard
  - id: create-storage-bucket
    content: 创建 Storage Bucket 并配置公共访问权限
    status: completed
    dependencies:
      - access-supabase-dashboard
  - id: configure-env-variables
    content: 配置项目环境变量文件
    status: completed
    dependencies:
      - obtain-api-credentials
      - create-storage-bucket
  - id: install-and-start
    content: 安装依赖并启动项目验证配置
    status: completed
    dependencies:
      - configure-env-variables
  - id: troubleshooting-guide
    content: 提供常见问题排查和解决方案
    status: completed
    dependencies:
      - install-and-start
---

## 产品概述

一份面向零基础用户的 Supabase 完整配置指南，帮助用户从零开始配置 Supabase 项目，包括获取 API 密钥、执行数据库脚本、创建存储桶、配置环境变量，最终让项目成功运行。

## 核心功能

- 详细图文说明如何获取 Supabase Project URL 和 API Key
- 逐步指导如何使用 SQL Editor 执行数据库初始化脚本
- 手把手教学如何创建和配置 Storage Bucket（包括权限设置）
- 环境变量配置的完整步骤说明
- 项目启动和验证的详细流程
- 常见问题排查和解决方案