import { supabase } from '../lib/supabase';
import { Comment } from '../types';

/**
 * 评论系统 API
 * 包含: 创建评论、获取评论、删除评论、多级回复
 */

export interface DatabaseComment {
  id: string;
  idea_id: string;
  author_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  profiles: {
    username: string;
    avatar_url?: string;
  };
}

/**
 * 将数据库评论转换为前端 Comment 类型
 */
function transformComment(dbComment: DatabaseComment): Comment {
  return {
    id: dbComment.id,
    author: dbComment.profiles.username,
    content: dbComment.content,
    timestamp: new Date(dbComment.created_at).getTime(),
    replies: []
  };
}

/**
 * 获取 Idea 的所有评论(包括多级回复)
 */
export async function fetchComments(ideaId: string): Promise<Comment[]> {
  try {
    // 获取所有评论(包括子评论)
    const { data, error } = await supabase
      .from('comments')
      .select(`
        id,
        idea_id,
        author_id,
        parent_id,
        content,
        created_at,
        profiles!comments_author_id_fkey (
          username,
          avatar_url
        )
      `)
      .eq('idea_id', ideaId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // 构建树形结构
    const commentsMap = new Map<string, Comment>();
    const rootComments: Comment[] = [];

    // 第一遍遍历:创建所有评论对象
    data.forEach((dbComment: any) => {
      const comment = transformComment(dbComment);
      commentsMap.set(comment.id, comment);
    });

    // 第二遍遍历:构建树形结构
    data.forEach((dbComment: any) => {
      const comment = commentsMap.get(dbComment.id)!;
      
      if (dbComment.parent_id) {
        // 这是一个回复,添加到父评论的 replies
        const parent = commentsMap.get(dbComment.parent_id);
        if (parent) {
          if (!parent.replies) parent.replies = [];
          parent.replies.push(comment);
        }
      } else {
        // 这是一个根评论
        rootComments.push(comment);
      }
    });

    return rootComments;
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
}

/**
 * 创建新评论
 */
export async function createComment(
  ideaId: string,
  content: string,
  parentId?: string | null
): Promise<Comment> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('用户未登录');

    // 插入评论
    const { data, error } = await supabase
      .from('comments')
      .insert({
        idea_id: ideaId,
        author_id: user.id,
        content: content.trim(),
        parent_id: parentId || null
      })
      .select(`
        id,
        idea_id,
        author_id,
        parent_id,
        content,
        created_at,
        profiles!comments_author_id_fkey (
          username,
          avatar_url
        )
      `)
      .single();

    if (error) throw error;

    return transformComment(data as any);
  } catch (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
}

/**
 * 删除评论(仅作者可删除)
 */
export async function deleteComment(commentId: string): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('用户未登录');

    // 验证权限
    const { data: comment, error: fetchError } = await supabase
      .from('comments')
      .select('author_id')
      .eq('id', commentId)
      .single();

    if (fetchError) throw fetchError;
    if (comment.author_id !== user.id) {
      throw new Error('无权删除此评论');
    }

    // 删除评论(CASCADE 会自动删除子评论)
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
}

/**
 * 实时订阅评论变化
 */
export function subscribeToComments(
  ideaId: string,
  callback: (payload: any) => void
) {
  const channel = supabase
    .channel(`comments:${ideaId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'comments',
        filter: `idea_id=eq.${ideaId}`
      },
      callback
    )
    .subscribe();

  return () => {
    channel.unsubscribe();
  };
}

/**
 * 获取评论统计(总数、最新评论时间)
 */
export async function getCommentStats(ideaId: string) {
  try {
    const { count, error } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('idea_id', ideaId);

    if (error) throw error;

    return { total: count || 0 };
  } catch (error) {
    console.error('Error fetching comment stats:', error);
    return { total: 0 };
  }
}
