-- ============================================
-- Vibe Your Mind - Supabase Database Schema
-- ============================================
-- 请在 Supabase Dashboard → SQL Editor 中执行此脚本
-- ============================================

-- 1. 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 2. 用户配置表 (profiles)
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  role TEXT DEFAULT 'Viber' CHECK (role IN ('Viber', 'Admin', 'Guest')),
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 策略
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" 
  ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" 
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 触发器：新用户注册时自动创建 profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.id),
    'Viber'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 3. 创意宇宙 (ideas)
-- ============================================
CREATE TABLE ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  author_id UUID REFERENCES auth.users(id) NOT NULL,
  tags TEXT[] DEFAULT '{}',
  likes INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  has_prototype BOOLEAN DEFAULT false,
  demo_url TEXT,
  status TEXT DEFAULT 'concept' CHECK (status IN ('concept', 'in-progress', 'live')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引优化
CREATE INDEX idx_ideas_author ON ideas(author_id);
CREATE INDEX idx_ideas_created ON ideas(created_at DESC);
CREATE INDEX idx_ideas_status ON ideas(status);

-- RLS 策略
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ideas are viewable by everyone" 
  ON ideas FOR SELECT USING (true);
CREATE POLICY "Users can insert own ideas" 
  ON ideas FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update own ideas" 
  ON ideas FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete own ideas" 
  ON ideas FOR DELETE USING (auth.uid() = author_id);

-- ============================================
-- 4. 协作者关系表 (idea_collaborators)
-- ============================================
CREATE TABLE idea_collaborators (
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (idea_id, user_id)
);

ALTER TABLE idea_collaborators ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Collaborators are viewable by everyone" 
  ON idea_collaborators FOR SELECT USING (true);
CREATE POLICY "Idea authors can add collaborators"
  ON idea_collaborators FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ideas WHERE id = idea_id AND author_id = auth.uid()
    )
  );

-- ============================================
-- 5. 评论系统 (comments)
-- ============================================
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_idea ON comments(idea_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comments are viewable by everyone" 
  ON comments FOR SELECT USING (true);
CREATE POLICY "Users can insert own comments" 
  ON comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can delete own comments" 
  ON comments FOR DELETE USING (auth.uid() = author_id);

-- 触发器：自动更新 ideas.comments_count 计数
CREATE OR REPLACE FUNCTION update_idea_comments_count() 
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE ideas SET comments_count = comments_count + 1 WHERE id = NEW.idea_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE ideas SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.idea_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER comment_counter 
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_idea_comments_count();

-- ============================================
-- 6. 点赞系统 (likes)
-- ============================================
CREATE TABLE likes (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, idea_id)
);

-- 触发器：自动更新 ideas.likes 计数
CREATE OR REPLACE FUNCTION update_idea_likes() 
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE ideas SET likes = likes + 1 WHERE id = NEW.idea_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE ideas SET likes = GREATEST(likes - 1, 0) WHERE id = OLD.idea_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER like_counter 
  AFTER INSERT OR DELETE ON likes
  FOR EACH ROW EXECUTE FUNCTION update_idea_likes();

ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Likes are viewable by everyone" 
  ON likes FOR SELECT USING (true);
CREATE POLICY "Users can like ideas" 
  ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike ideas" 
  ON likes FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 7. 聊天频道 (channels)
-- ============================================
CREATE TABLE channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('public', 'group', 'dm', 'ai')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 插入默认频道
INSERT INTO channels (id, name, type, description) VALUES
  ('11111111-1111-1111-1111-111111111111', '🌌 Vibe Chat', 'public', '全局聊天室'),
  ('22222222-2222-2222-2222-222222222222', '💡 Idea Lab', 'public', '创意讨论'),
  ('33333333-3333-3333-3333-333333333333', '🤖 Ask VibeBot', 'ai', '与 AI 助手聊天');

ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Channels are viewable by everyone" 
  ON channels FOR SELECT USING (true);

-- ============================================
-- 8. 聊天消息 (messages)
-- ============================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id),
  sender_name TEXT NOT NULL,
  content TEXT NOT NULL,
  is_bot BOOLEAN DEFAULT false,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_channel ON messages(channel_id, created_at DESC);

-- 启用 Realtime 功能
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Messages are viewable by everyone" 
  ON messages FOR SELECT USING (true);
CREATE POLICY "Users can insert own messages" 
  ON messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id OR is_bot = true OR is_system = true
  );

-- ============================================
-- 9. 赏金悬赏 (bounties)
-- ============================================
CREATE TABLE bounties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('Coding', 'Design', 'Marketing', 'Coffee Chat')),
  reward TEXT NOT NULL,
  requester_id UUID REFERENCES auth.users(id) NOT NULL,
  description TEXT,
  location TEXT DEFAULT 'Remote',
  status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'Closed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bounties_status ON bounties(status);

ALTER TABLE bounties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Bounties are viewable by everyone" 
  ON bounties FOR SELECT USING (true);
CREATE POLICY "Users can create bounties" 
  ON bounties FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Users can manage own bounties" 
  ON bounties FOR ALL USING (auth.uid() = requester_id);

-- ============================================
-- 10. 提示词黑胶 (vinyls)
-- ============================================
CREATE TABLE vinyls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  artist_id UUID REFERENCES auth.users(id) NOT NULL,
  mood TEXT,
  bpm INT,
  genre TEXT CHECK (genre IN ('Frontend', 'Backend', 'Architecture', 'Creative')),
  prompt_content TEXT NOT NULL,
  price TEXT DEFAULT 'Free',
  cover_color TEXT DEFAULT 'bg-pink-400',
  copy_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 全文搜索索引
CREATE INDEX vinyls_prompt_search 
  ON vinyls USING gin(to_tsvector('english', prompt_content));

ALTER TABLE vinyls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vinyls are viewable by everyone" 
  ON vinyls FOR SELECT USING (true);
CREATE POLICY "Users can create vinyls" 
  ON vinyls FOR INSERT WITH CHECK (auth.uid() = artist_id);
CREATE POLICY "Users can manage own vinyls" 
  ON vinyls FOR ALL USING (auth.uid() = artist_id);

-- ============================================
-- 11. 精品项目 (projects)
-- ============================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  url TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) NOT NULL,
  tags TEXT[] DEFAULT '{}',
  likes INT DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Projects are viewable by everyone" 
  ON projects FOR SELECT USING (true);
CREATE POLICY "Users can create projects" 
  ON projects FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can manage own projects" 
  ON projects FOR ALL USING (auth.uid() = author_id);

-- 项目点赞表
CREATE TABLE project_likes (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, project_id)
);

-- 触发器：自动更新 projects.likes 计数
CREATE OR REPLACE FUNCTION update_project_likes() 
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE projects SET likes = likes + 1 WHERE id = NEW.project_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE projects SET likes = GREATEST(likes - 1, 0) WHERE id = OLD.project_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER project_like_counter 
  AFTER INSERT OR DELETE ON project_likes
  FOR EACH ROW EXECUTE FUNCTION update_project_likes();

ALTER TABLE project_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Project likes are viewable by everyone" 
  ON project_likes FOR SELECT USING (true);
CREATE POLICY "Users can like projects" 
  ON project_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike projects" 
  ON project_likes FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 12. Storage Buckets 配置
-- ============================================
-- 请在 Supabase Dashboard → Storage 中手动创建以下 Buckets:
-- 1. avatars (public)
-- 2. project-images (public)
-- 3. idea-prototypes (public)

-- ============================================
-- 完成提示
-- ============================================
-- ✅ 数据库 Schema 创建完成!
-- 
-- 下一步:
-- 1. 在 Storage 中创建 buckets (avatars, project-images)
-- 2. 配置 Email Templates (Settings → Auth → Email Templates)
-- 3. 测试用户注册/登录流程
-- ============================================
