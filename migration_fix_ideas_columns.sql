-- ============================================
-- Migration: Fix ideas table column names
-- ============================================
-- 目的: 将 ideas 表字段名改为与 API 代码一致
-- 时间: 2026-01-08
-- ============================================

-- 重命名 description 为 content
ALTER TABLE ideas RENAME COLUMN description TO content;

-- 重命名 likes 为 likes_count
ALTER TABLE ideas RENAME COLUMN likes TO likes_count;

-- 验证迁移成功
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'ideas' 
  AND column_name IN ('content', 'likes_count')
ORDER BY column_name;

-- ============================================
-- 完成提示
-- ============================================
-- ✅ 字段重命名完成!
-- 
-- 修改内容:
-- 1. description → content
-- 2. likes → likes_count
-- 
-- 下一步:
-- 1. 刷新应用缓存
-- 2. 测试创意发布功能
-- ============================================
