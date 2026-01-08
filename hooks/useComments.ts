import { useState, useEffect } from 'react';
import { Comment } from '../types';
import {
  fetchComments,
  createComment,
  deleteComment,
  subscribeToComments
} from '../api/comments';

/**
 * 评论管理 Hook
 * 支持: 获取评论、发布评论、删除评论、实时更新
 */
export function useComments(ideaId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载评论
  const loadComments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchComments(ideaId);
      setComments(data);
    } catch (err: any) {
      setError(err.message || '加载评论失败');
      console.error('Load comments error:', err);
    } finally {
      setLoading(false);
    }
  };

  // 发布评论
  const postComment = async (content: string, parentId?: string | null) => {
    try {
      const newComment = await createComment(ideaId, content, parentId);
      
      if (parentId) {
        // 这是一个回复,需要找到父评论并添加到 replies
        setComments(prev => {
          const updated = [...prev];
          
          // 递归查找父评论
          const findAndAddReply = (commentList: Comment[]): boolean => {
            for (const comment of commentList) {
              if (comment.id === parentId) {
                if (!comment.replies) comment.replies = [];
                comment.replies.push(newComment);
                return true;
              }
              if (comment.replies && findAndAddReply(comment.replies)) {
                return true;
              }
            }
            return false;
          };

          findAndAddReply(updated);
          return updated;
        });
      } else {
        // 这是一个根评论
        setComments(prev => [...prev, newComment]);
      }

      return newComment;
    } catch (err: any) {
      setError(err.message || '发布评论失败');
      throw err;
    }
  };

  // 删除评论
  const removeComment = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      
      // 从状态中移除评论
      setComments(prev => {
        const removeFromList = (commentList: Comment[]): Comment[] => {
          return commentList.filter(comment => {
            if (comment.id === commentId) return false;
            if (comment.replies) {
              comment.replies = removeFromList(comment.replies);
            }
            return true;
          });
        };

        return removeFromList([...prev]);
      });
    } catch (err: any) {
      setError(err.message || '删除评论失败');
      throw err;
    }
  };

  // 统计总评论数(包括回复)
  const totalComments = () => {
    const countComments = (commentList: Comment[]): number => {
      return commentList.reduce((total, comment) => {
        return total + 1 + (comment.replies ? countComments(comment.replies) : 0);
      }, 0);
    };
    return countComments(comments);
  };

  // 初始化加载
  useEffect(() => {
    if (ideaId) {
      loadComments();
    }
  }, [ideaId]);

  // 实时订阅
  useEffect(() => {
    if (!ideaId) return;

    const unsubscribe = subscribeToComments(ideaId, (payload) => {
      console.log('Comment change:', payload);
      
      // 简单处理:重新加载所有评论
      // 可以优化为仅更新变化的部分
      loadComments();
    });

    return unsubscribe;
  }, [ideaId]);

  return {
    comments,
    loading,
    error,
    postComment,
    removeComment,
    totalComments: totalComments(),
    refresh: loadComments
  };
}
