import { supabase } from '../lib/supabase';
import { Idea } from '../types';

// 数据库类型映射
interface DbIdea {
  id: string;
  title: string;
  content: string;
  author_id: string;
  ai_summary?: string;
  tags: string[];
  likes_count: number;
  comments_count: number;
  has_prototype: boolean;
  demo_url?: string;
  status: 'concept' | 'in-progress' | 'live';
  created_at: string;
  updated_at: string;
  profiles: {
    username: string;
    avatar_url?: string;
  };
  idea_collaborators?: Array<{
    profiles: {
      username: string;
    };
  }>;
}

// 转换数据库格式到前端格式
const mapDbIdeaToIdea = (dbIdea: DbIdea): Idea => ({
  id: dbIdea.id,
  title: dbIdea.title,
  author: dbIdea.profiles.username,
  collaborators: dbIdea.idea_collaborators?.map(c => c.profiles.username) || [],
  description: dbIdea.content,
  tags: dbIdea.tags || [],
  likes: dbIdea.likes_count,
  commentsCount: dbIdea.comments_count,
  hasPrototype: dbIdea.has_prototype,
  demoUrl: dbIdea.demo_url,
  status: dbIdea.status,
  comments: [] // 评论单独加载
});

// 获取 Ideas 列表(支持分页、搜索、过滤)
export interface FetchIdeasParams {
  page?: number;
  limit?: number;
  search?: string;
  tags?: string[];
  status?: 'concept' | 'in-progress' | 'live';
  authorId?: string;
  sortBy?: 'created_at' | 'likes_count' | 'updated_at';
  sortOrder?: 'asc' | 'desc';
}

export const fetchIdeas = async (params: FetchIdeasParams = {}): Promise<{ ideas: Idea[]; total: number }> => {
  const {
    page = 1,
    limit = 12,
    search,
    tags,
    status,
    authorId,
    sortBy = 'created_at',
    sortOrder = 'desc'
  } = params;

  let query = supabase
    .from('ideas')
    .select(`
      *,
      profiles!ideas_author_id_fkey (username, avatar_url),
      idea_collaborators (
        profiles (username)
      )
    `, { count: 'exact' });

  // 搜索过滤
  if (search) {
    query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
  }

  // 标签过滤
  if (tags && tags.length > 0) {
    query = query.contains('tags', tags);
  }

  // 状态过滤
  if (status) {
    query = query.eq('status', status);
  }

  // 作者过滤
  if (authorId) {
    query = query.eq('author_id', authorId);
  }

  // 排序
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });

  // 分页
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error('Fetch ideas error:', error);
    throw new Error(`获取创意失败: ${error.message}`);
  }

  return {
    ideas: (data || []).map(mapDbIdeaToIdea),
    total: count || 0
  };
};

// 获取单个 Idea 详情
export const fetchIdeaById = async (id: string): Promise<Idea | null> => {
  const { data, error } = await supabase
    .from('ideas')
    .select(`
      *,
      profiles!ideas_author_id_fkey (username, avatar_url),
      idea_collaborators (
        profiles (username)
      ),
      comments (
        id,
        content,
        created_at,
        profiles (username, avatar_url)
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Fetch idea error:', error);
    return null;
  }

  if (!data) return null;

  const idea = mapDbIdeaToIdea(data);
  
  // 添加评论
  if (data.comments) {
    idea.comments = data.comments.map((c: any) => ({
      id: c.id,
      author: c.profiles.username,
      content: c.content,
      timestamp: new Date(c.created_at).getTime()
    }));
  }

  return idea;
};

// 创建新 Idea
export interface CreateIdeaData {
  title: string;
  content: string;
  tags?: string[];
  hasPrototype?: boolean;
  demoUrl?: string;
  status?: 'concept' | 'in-progress' | 'live';
}

export const createIdea = async (data: CreateIdeaData): Promise<Idea> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('请先登录');
  }

  const { data: newIdea, error } = await supabase
    .from('ideas')
    .insert({
      title: data.title,
      content: data.content,
      author_id: user.id,
      tags: data.tags || [],
      has_prototype: data.hasPrototype || false,
      demo_url: data.demoUrl,
      status: data.status || 'concept',
      likes_count: 0
    })
    .select(`
      *,
      profiles!ideas_author_id_fkey (username, avatar_url)
    `)
    .single();

  if (error) {
    console.error('Create idea error:', error);
    throw new Error(`创建失败: ${error.message}`);
  }

  return mapDbIdeaToIdea({ ...newIdea, idea_collaborators: [] });
};

// 更新 Idea
export interface UpdateIdeaData {
  title?: string;
  content?: string;
  tags?: string[];
  hasPrototype?: boolean;
  demoUrl?: string;
  status?: 'concept' | 'in-progress' | 'live';
}

export const updateIdea = async (id: string, data: UpdateIdeaData): Promise<Idea> => {
  const updateData: any = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.content !== undefined) updateData.content = data.content;
  if (data.tags !== undefined) updateData.tags = data.tags;
  if (data.hasPrototype !== undefined) updateData.has_prototype = data.hasPrototype;
  if (data.demoUrl !== undefined) updateData.demo_url = data.demoUrl;
  if (data.status !== undefined) updateData.status = data.status;

  const { data: updatedIdea, error } = await supabase
    .from('ideas')
    .update(updateData)
    .eq('id', id)
    .select(`
      *,
      profiles!ideas_author_id_fkey (username, avatar_url),
      idea_collaborators (
        profiles (username)
      )
    `)
    .single();

  if (error) {
    console.error('Update idea error:', error);
    throw new Error(`更新失败: ${error.message}`);
  }

  return mapDbIdeaToIdea(updatedIdea);
};

// 删除 Idea
export const deleteIdea = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('ideas')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Delete idea error:', error);
    throw new Error(`删除失败: ${error.message}`);
  }
};

// 点赞/取消点赞 Idea
export const toggleIdeaLike = async (ideaId: string): Promise<{ liked: boolean; likesCount: number }> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('请先登录');
  }

  // 检查是否已点赞
  const { data: existingLike } = await supabase
    .from('idea_likes')
    .select('id')
    .eq('idea_id', ideaId)
    .eq('user_id', user.id)
    .single();

  if (existingLike) {
    // 取消点赞
    const { error } = await supabase
      .from('idea_likes')
      .delete()
      .eq('idea_id', ideaId)
      .eq('user_id', user.id);

    if (error) throw new Error(`取消点赞失败: ${error.message}`);

    // 获取最新点赞数
    const { data: idea } = await supabase
      .from('ideas')
      .select('likes_count')
      .eq('id', ideaId)
      .single();

    return { liked: false, likesCount: idea?.likes_count || 0 };
  } else {
    // 点赞
    const { error } = await supabase
      .from('idea_likes')
      .insert({ idea_id: ideaId, user_id: user.id });

    if (error) throw new Error(`点赞失败: ${error.message}`);

    // 获取最新点赞数
    const { data: idea } = await supabase
      .from('ideas')
      .select('likes_count')
      .eq('id', ideaId)
      .single();

    return { liked: true, likesCount: idea?.likes_count || 0 };
  }
};

// 检查用户是否点赞了某个 Idea
export const checkUserLiked = async (ideaId: string): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return false;

  const { data } = await supabase
    .from('idea_likes')
    .select('id')
    .eq('idea_id', ideaId)
    .eq('user_id', user.id)
    .single();

  return !!data;
};

// 添加协作者
export const addCollaborator = async (ideaId: string, userId: string): Promise<void> => {
  const { error } = await supabase
    .from('idea_collaborators')
    .insert({ idea_id: ideaId, user_id: userId });

  if (error) {
    console.error('Add collaborator error:', error);
    throw new Error(`添加协作者失败: ${error.message}`);
  }
};

// 移除协作者
export const removeCollaborator = async (ideaId: string, userId: string): Promise<void> => {
  const { error } = await supabase
    .from('idea_collaborators')
    .delete()
    .eq('idea_id', ideaId)
    .eq('user_id', userId);

  if (error) {
    console.error('Remove collaborator error:', error);
    throw new Error(`移除协作者失败: ${error.message}`);
  }
};

// 获取用户的 Ideas(作者或协作者)
export const fetchUserIdeas = async (userId: string): Promise<Idea[]> => {
  const { data, error } = await supabase
    .from('ideas')
    .select(`
      *,
      profiles!ideas_author_id_fkey (username, avatar_url),
      idea_collaborators!inner (
        user_id,
        profiles (username)
      )
    `)
    .or(`author_id.eq.${userId},idea_collaborators.user_id.eq.${userId}`);

  if (error) {
    console.error('Fetch user ideas error:', error);
    throw new Error(`获取用户创意失败: ${error.message}`);
  }

  return (data || []).map(mapDbIdeaToIdea);
};
