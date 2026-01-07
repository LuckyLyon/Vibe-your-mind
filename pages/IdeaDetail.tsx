
import React, { useState } from 'react';
import { Idea, Comment } from '../types';
import { Button } from '../components/Button';
import { GlassCard } from '../components/GlassCard';
import { ArrowLeft, MessageSquare, Send, Heart, Rocket, User, Crown, CornerDownRight, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface IdeaDetailProps {
  idea?: Idea;
  setIdeas: React.Dispatch<React.SetStateAction<Idea[]>>;
  onBack: () => void;
}

export const IdeaDetail: React.FC<IdeaDetailProps> = ({ idea, setIdeas, onBack }) => {
  const [commentText, setCommentText] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  if (!idea) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold">Idea not found.</h2>
        <Button onClick={onBack} className="mt-4">Back</Button>
      </div>
    );
  }

  // Helper to count total comments including replies
  const totalComments = idea.comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0);

  const handlePostComment = () => {
    if (!commentText.trim()) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      author: 'You', // Hardcoded for now
      content: commentText,
      timestamp: Date.now(),
      replies: []
    };

    setIdeas(prev => prev.map(i => {
      if (i.id === idea.id) {
        return {
          ...i,
          comments: [...i.comments, newComment]
        };
      }
      return i;
    }));

    setCommentText('');
  };

  const handlePostReply = (targetComment: Comment, rootId: string) => {
    if (!replyText.trim()) return;

    // Check if we need to prepend @User
    let finalContent = replyText;
    // If we are replying to a nested reply (target != root), prepend @Author if not present
    if (targetComment.id !== rootId) {
       const prefix = `@${targetComment.author} `;
       if (!replyText.startsWith(`@`)) {
           finalContent = `${prefix}${replyText}`;
       }
    }

    const newReply: Comment = {
      id: Date.now().toString(),
      author: 'You',
      content: finalContent,
      timestamp: Date.now()
    };

    setIdeas(prev => prev.map(i => {
      if (i.id === idea.id) {
        return {
          ...i,
          comments: i.comments.map(c => {
             if (c.id === rootId) {
                 return {
                     ...c,
                     replies: [...(c.replies || []), newReply]
                 };
             }
             return c;
          })
        };
      }
      return i;
    }));

    setReplyText('');
    setReplyingToId(null);
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
    const isCreator = comment.author === idea.author || idea.collaborators.includes(comment.author);
    const isReplyingToThis = replyingToId === comment.id;
    
    return (
        <div key={comment.id} className={`flex gap-4 ${isReply ? 'mt-4' : 'border-b-2 pb-6 last:border-0'} ${isCreator && !isReply ? 'bg-yellow-50/50 p-4 -mx-4 rounded border-2 border-dashed border-yellow-200' : ''}`}>
            {isReply && <CornerDownRight className="w-5 h-5 text-gray-300 shrink-0" />}
            
            <div className={`w-10 h-10 flex items-center justify-center font-black border-2 border-black shrink-0 ${isCreator ? 'bg-vibe-yellow text-black' : 'bg-black text-white'} ${isReply ? 'w-8 h-8 text-xs' : ''}`}>
                {comment.author[0].toUpperCase()}
            </div>
            
            <div className="flex-grow">
                <div className="flex justify-between items-baseline mb-2">
                    <div className="flex items-center gap-2">
                        <span className={`font-bold ${isReply ? 'text-base' : 'text-lg'}`}>{comment.author}</span>
                        {isCreator && (
                            <span className="text-xs font-black bg-black text-vibe-yellow px-2 py-0.5 uppercase tracking-wider flex items-center">
                                <Crown className="w-3 h-3 mr-1" /> 创作者
                            </span>
                        )}
                    </div>
                    <span className="text-xs font-bold text-gray-400">{formatDate(comment.timestamp)}</span>
                </div>
                <p className="text-gray-800 whitespace-pre-wrap text-sm md:text-base">
                    {formatCommentContent(comment.content)}
                </p>
                
                <button 
                    onClick={() => {
                        if (isReplyingToThis) {
                            setReplyingToId(null);
                            setReplyText('');
                        } else {
                            setReplyingToId(comment.id);
                            // Pre-fill @User if it's a nested reply
                            if (isReply) {
                                setReplyText(`@${comment.author} `);
                            } else {
                                setReplyText('');
                            }
                        }
                    }}
                    className={`text-xs font-bold mt-2 flex items-center gap-1 transition-colors ${isReplyingToThis ? 'text-black' : 'text-gray-400 hover:text-black'}`}
                >
                    <MessageSquare className="w-3 h-3" /> {isReplyingToThis ? '取消回复' : '回复'}
                </button>

                {/* Reply Input */}
                {isReplyingToThis && (
                    <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                         <div className="flex gap-2">
                             <input 
                                 autoFocus
                                 className="flex-1 border-2 border-black p-2 text-sm focus:ring-2 focus:ring-yellow-400 outline-none bg-white"
                                 placeholder={`回复 @${comment.author}...`}
                                 value={replyText}
                                 onChange={e => setReplyText(e.target.value)}
                                 onKeyDown={e => e.key === 'Enter' && handlePostReply(comment, rootId)}
                             />
                             <Button size="sm" onClick={() => handlePostReply(comment, rootId)} disabled={!replyText.trim()}>回复</Button>
                         </div>
                    </div>
                )}
            </div>
        </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Button variant="ghost" onClick={onBack} icon={<ArrowLeft className="w-4 h-4" />} className="mb-6 pl-0 hover:bg-transparent hover:underline">
        返回 Idea 宇宙
      </Button>

      <GlassCard className="mb-8 p-0 overflow-hidden bg-white border-4 border-black">
        <div className="p-8 border-b-4 border-black bg-vibe-yellow relative overflow-hidden">
           {/* Background Decoration */}
           <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
             <Rocket className="w-48 h-48" />
           </div>

           <div className="relative z-10">
             <div className="flex gap-2 mb-4">
               {idea.tags.map(tag => (
                  <span key={tag} className="text-xs font-bold px-2 py-1 border border-black bg-white shadow-neo-sm">
                    #{tag}
                  </span>
                ))}
             </div>
             <h1 className="text-4xl md:text-6xl font-black uppercase mb-4 leading-tight">{idea.title}</h1>
             <div className="flex items-center gap-4 text-lg font-bold flex-wrap">
               <span className="flex items-center bg-black text-white px-3 py-1">
                 <User className="w-4 h-4 mr-2" /> {idea.author}
               </span>
               {idea.collaborators.length > 0 && (
                   <span className="flex items-center bg-white border-2 border-black px-3 py-1 shadow-neo-sm">
                     <Crown className="w-4 h-4 mr-2 text-yellow-600" /> {idea.collaborators.length} 合作者
                   </span>
               )}
               <span className="flex items-center bg-white border-2 border-black px-3 py-1 shadow-neo-sm">
                 <Heart className="w-4 h-4 mr-2 text-pink-500" /> {idea.likes}
               </span>
             </div>
           </div>
        </div>

        <div className="p-8 md:p-12 text-lg leading-relaxed text-gray-800 prose prose-lg prose-headings:font-black prose-a:text-blue-600 max-w-none">
           <ReactMarkdown>{idea.description}</ReactMarkdown>
        </div>

        {idea.hasPrototype && idea.demoUrl && (
          <div className="p-8 bg-gray-50 border-t-4 border-black flex justify-center">
             <a 
                href={idea.demoUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full md:w-auto text-center"
             >
               <Button size="lg" icon={<Rocket className="w-5 h-5" />} className="w-full md:w-auto">
                 体验 Demo / 原型
               </Button>
             </a>
          </div>
        )}
      </GlassCard>

      {/* Comments Section */}
      <div className="bg-white border-4 border-black shadow-neo p-6 md:p-8">
        <h3 className="text-2xl font-black uppercase mb-6 flex items-center">
          <MessageSquare className="w-6 h-6 mr-3" /> 社区讨论 ({totalComments})
        </h3>

        {/* Comment List */}
        <div className="space-y-6 mb-8">
          {idea.comments.length === 0 ? (
            <p className="text-gray-500 italic">还没有人评论，快来抢沙发！</p>
          ) : (
            idea.comments.map(comment => (
                <div key={comment.id}>
                    {/* Parent Comment */}
                    {renderComment(comment, comment.id, false)}
                    
                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                        <div className="ml-8 md:ml-12 border-l-2 border-black border-dashed pl-4 md:pl-6 pb-2">
                            {comment.replies.map(reply => renderComment(reply, comment.id, true))}
                        </div>
                    )}
                </div>
            ))
          )}
        </div>

        {/* Add Main Comment */}
        <div className="flex gap-4 items-start pt-6 border-t-4 border-black border-dotted">
          <div className="w-10 h-10 bg-vibe-yellow border-2 border-black flex items-center justify-center font-black shrink-0">
            Y
          </div>
          <div className="flex-grow relative">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="发表你的看法..."
              className="w-full border-2 border-black p-4 min-h-[100px] focus:ring-4 focus:ring-yellow-400 focus:outline-none shadow-neo-sm font-medium resize-none"
            />
            <div className="mt-2 flex justify-end">
              <Button onClick={handlePostComment} icon={<Send className="w-4 h-4" />} disabled={!commentText.trim()}>
                发送评论
              </Button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
