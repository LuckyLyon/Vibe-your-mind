import React, { useState } from 'react';
import { Comment } from '../types';
import { Button } from '../components/Button';
import { GlassCard } from '../components/GlassCard';
import { useIdea } from '../hooks/useIdeas';
import { useComments } from '../hooks/useComments';
import { useAuth } from '../hooks/useAuth';
import { ArrowLeft, MessageSquare, Send, Heart, Rocket, User, Crown, CornerDownRight, X, Loader2, AlertCircle, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface IdeaDetailProps {
  ideaId: string;
  onBack: () => void;
}

export const IdeaDetail: React.FC<IdeaDetailProps> = ({ ideaId, onBack }) => {
  const { currentUser } = useAuth();
  const { idea, loading, error, userLiked, toggleLike } = useIdea(ideaId);
  const { comments, postComment, removeComment, totalComments: commentCount } = useComments(ideaId);
  const [commentText, setCommentText] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
        <p className="text-xl font-bold">加载中...</p>
      </div>
    );
  }

  if (error || !idea) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
        <h2 className="text-2xl font-bold mb-4">{error || '创意不存在'}</h2>
        <Button onClick={onBack} className="bg-black text-white">
          <ArrowLeft className="w-5 h-5 mr-2" /> 返回
        </Button>
      </div>
    );
  }

  const handlePostComment = async () => {
    if (!commentText.trim() || !currentUser || submitting) return;

    try {
      setSubmitting(true);
      await postComment(commentText);
      setCommentText('');
    } catch (err: any) {
      alert(err.message || '发布评论失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePostReply = async (targetComment: Comment) => {
    if (!replyText.trim() || !currentUser || submitting) return;

    try {
      setSubmitting(true);
      await postComment(replyText, targetComment.id);
      setReplyText('');
      setReplyingToId(null);
    } catch (err: any) {
      alert(err.message || '发布回复失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('确定要删除这条评论吗?')) return;

    try {
      await removeComment(commentId);
    } catch (err: any) {
      alert(err.message || '删除失败');
    }
  };

  const handleLike = async () => {
    if (!currentUser) {
      alert('请先登录');
      return;
    }

    try {
      await toggleLike();
    } catch (err: any) {
      alert(err.message || '操作失败');
    }
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatCommentContent = (content: string) => {
    const parts = content.split(/(@[\w\u4e00-\u9fa5]+)/g); 
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        return <span key={index} className="text-blue-600 font-bold mr-1">{part}</span>;
      }
      return part;
    });
  };

  const renderComment = (comment: Comment, rootId: string, isReply = false) => {
    const isCreator = comment.author === idea.author;
    const isMyComment = comment.author === currentUser?.username;
    const isReplyingToThis = replyingToId === comment.id;
    
    return (
      <div key={comment.id} className={`flex gap-4 ${isReply ? 'mt-4' : 'border-b-2 pb-6 last:border-0'} ${isCreator && !isReply ? 'bg-yellow-50/50 p-4 -mx-4 rounded border-2 border-dashed border-yellow-200' : ''}`}>
        {isReply && <CornerDownRight className="w-5 h-5 text-gray-300 shrink-0" />}
        
        <div className={`w-10 h-10 flex items-center justify-center font-black border-2 border-black shrink-0 ${isCreator ? 'bg-vibe-yellow text-black' : 'bg-black text-white'} ${isReply ? 'w-8 h-8 text-xs' : ''}`}>
          {comment.author.substring(0, 2).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-black">{comment.author}</span>
            {isCreator && <Crown className="w-4 h-4 text-yellow-600" />}
            <span className="text-xs font-bold text-gray-400">{formatDate(comment.timestamp)}</span>
            {isMyComment && (
              <button
                onClick={() => handleDeleteComment(comment.id)}
                className="ml-auto text-gray-400 hover:text-red-600 transition-colors"
                title="删除评论"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <p className="text-sm font-bold leading-relaxed mb-2">
            {formatCommentContent(comment.content)}
          </p>

          {!isReply && (
            <button 
              onClick={() => {
                if (!currentUser) {
                  alert('请先登录');
                  return;
                }
                setReplyingToId(isReplyingToThis ? null : comment.id);
                setReplyText('');
              }}
              className="text-xs font-black uppercase text-gray-500 hover:text-blue-600 transition-colors"
            >
              {isReplyingToThis ? '取消回复' : '回复'}
            </button>
          )}

          {isReplyingToThis && (
            <div className="mt-3 flex gap-2">
              <input 
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handlePostReply(comment)}
                placeholder={`回复 ${comment.author}...`}
                className="flex-1 border-2 border-black p-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400"
                disabled={submitting}
              />
              <Button 
                onClick={() => handlePostReply(comment)}
                className="bg-black text-white px-4 py-2"
                disabled={!replyText.trim() || submitting}
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {comment.replies.map(reply => renderComment(reply, rootId, true))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const isOwner = currentUser && idea.author === currentUser.username;

  return (
    <div className="min-h-screen bg-vibe-yellow py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <Button 
          onClick={onBack} 
          className="mb-6 bg-white border-4 border-black hover:bg-black hover:text-white"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> 返回
        </Button>

        {/* Main Card */}
        <GlassCard className="p-8 mb-6">
          {/* Status Badge */}
          <div className="flex justify-between items-start mb-4">
            <span className={`px-4 py-2 text-sm font-black uppercase border-2 border-black ${
              idea.status === 'live' ? 'bg-green-300' :
              idea.status === 'in-progress' ? 'bg-blue-300' : 'bg-gray-300'
            }`}>
              {idea.status === 'live' ? '已上线' : idea.status === 'in-progress' ? '进行中' : '概念'}
            </span>

            {idea.hasPrototype && idea.demoUrl && (
              <a 
                href={idea.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-black text-white border-2 border-black hover:bg-white hover:text-black font-black uppercase text-sm transition-colors"
              >
                <Rocket className="w-5 h-5" /> 查看 Demo
              </a>
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl font-black uppercase mb-4">{idea.title}</h1>

          {/* Author & Collaborators */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b-4 border-black">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              <span className="font-black">作者: {idea.author}</span>
            </div>

            {idea.collaborators.length > 0 && (
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-600" />
                <span className="font-bold text-gray-600">
                  协作者: {idea.collaborators.join(', ')}
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="prose prose-sm max-w-none mb-6">
            <ReactMarkdown>{idea.description}</ReactMarkdown>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {idea.tags.map((tag, i) => (
              <span 
                key={i}
                className="px-3 py-1 bg-white border-2 border-black text-sm font-black uppercase"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-6 pt-6 border-t-4 border-black">
            <button 
              onClick={handleLike}
              disabled={!currentUser}
              className={`flex items-center gap-2 font-black uppercase text-lg transition-colors ${
                userLiked 
                  ? 'text-red-500' 
                  : currentUser 
                    ? 'hover:text-red-500 cursor-pointer' 
                    : 'opacity-50 cursor-not-allowed'
              }`}
            >
              <Heart className={`w-6 h-6 ${userLiked ? 'fill-red-500' : ''}`} /> 
              {idea.likes}
            </button>
            
            <div className="flex items-center gap-2 font-black uppercase text-lg">
              <MessageSquare className="w-6 h-6" /> {commentCount} 评论
            </div>
          </div>
        </GlassCard>

        {/* Comments Section */}
        <GlassCard className="p-8">
          <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-2">
            <MessageSquare className="w-6 h-6" /> 讨论区
          </h2>

          {/* New Comment Input */}
          {currentUser ? (
            <div className="mb-8 flex gap-3">
              <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-black border-2 border-black shrink-0">
                {currentUser.username.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 flex gap-2">
                <input 
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handlePostComment()}
                  placeholder="发表你的想法..."
                  className="flex-1 border-4 border-black p-3 font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400"
                  disabled={submitting}
                />
                <Button 
                  onClick={handlePostComment}
                  className="bg-black text-white px-6"
                  disabled={!commentText.trim() || submitting}
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </Button>
              </div>
            </div>
          ) : (
            <div className="mb-8 bg-gray-100 border-4 border-black p-6 text-center">
              <p className="font-black text-lg uppercase">登录后参与讨论</p>
            </div>
          )}

          {/* Comments List */}
          {comments.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-xl font-black uppercase opacity-50">暂无评论</p>
              <p className="font-bold mt-2">成为第一个发表评论的人!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {comments.map(comment => renderComment(comment, comment.id))}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};
