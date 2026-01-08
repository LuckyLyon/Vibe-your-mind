import React, { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { Idea } from '../types';
import { useIdeas } from '../hooks/useIdeas';
import { useAuth } from '../hooks/useAuth';
import { refineIdeaWithAI } from '../lib/deepseek';
import { Sparkles, Heart, Rocket, Loader2, Lightbulb, Link as LinkIcon, Edit, Trash2, MessageSquare, User, X, Save, UserPlus, AlertTriangle, Check, Plus, Search, Filter } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface IdeaUniverseProps {
  onOpenIdea: (id: string) => void;
}

export const IdeaUniverse: React.FC<IdeaUniverseProps> = ({ onOpenIdea }) => {
  const { currentUser } = useAuth();
  const { 
    ideas, 
    loading, 
    error, 
    hasMore, 
    createNewIdea, 
    updateExistingIdea, 
    deleteExistingIdea, 
    toggleLike,
    loadMore,
    loadIdeas
  } = useIdeas({ limit: 12 });

  const [newIdeaText, setNewIdeaText] = useState('');
  const [newIdeaDemoUrl, setNewIdeaDemoUrl] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  
  // Tab State: 'explore' | 'my-lab'
  const [activeTab, setActiveTab] = useState<'explore' | 'my-lab'>('explore');
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'concept' | 'in-progress' | 'live'>('all');
  
  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const handleRefine = async () => {
    if (!newIdeaText.trim()) return;
    setIsRefining(true);
    try {
      const result = await refineIdeaWithAI(newIdeaText);
      if (result && !result.includes("Error")) {
        setNewIdeaText(result);
      }
    } catch (err) {
      console.error('Refine error:', err);
      alert('AI 润色失败,请重试');
    } finally {
      setIsRefining(false);
    }
  };

  const handlePublish = async () => {
    if (!newIdeaText.trim()) return;
    if (!currentUser) {
      alert('请先登录');
      return;
    }
    
    setIsPublishing(true);
    try {
      const lines = newIdeaText.split('\n');
      let title = '社区创意';
      let description = newIdeaText;

      const firstLine = lines[0].trim();
      if (firstLine.startsWith('# ')) {
        title = firstLine.replace('# ', '').trim();
        description = lines.slice(1).join('\n').trim();
      } else if (firstLine.startsWith('## ')) {
        title = firstLine.replace('## ', '').trim();
        description = lines.slice(1).join('\n').trim();
      }

      const hasDemo = !!newIdeaDemoUrl.trim();

      await createNewIdea({
        title: title.length > 50 ? title.substring(0, 50) + '...' : title,
        content: description,
        tags: ['New', 'Community'],
        hasPrototype: hasDemo,
        demoUrl: hasDemo ? newIdeaDemoUrl.trim() : undefined,
        status: hasDemo ? 'in-progress' : 'concept'
      });

      setNewIdeaText('');
      setNewIdeaDemoUrl('');
      setShowCreateModal(false);
      setActiveTab('my-lab');
    } catch (err: any) {
      console.error('Publish error:', err);
      alert(err.message || '发布失败,请重试');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleStartEdit = (idea: Idea) => {
    setEditingIdea(idea);
    setEditTitle(idea.title);
    setEditDescription(idea.description);
  };

  const handleSaveEdit = async () => {
    if (!editingIdea) return;
    
    try {
      await updateExistingIdea(editingIdea.id, {
        title: editTitle,
        content: editDescription
      });
      setEditingIdea(null);
    } catch (err: any) {
      console.error('Update error:', err);
      alert(err.message || '更新失败,请重试');
    }
  };

  const initiateDelete = (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    
    try {
      await deleteExistingIdea(deletingId);
      setDeletingId(null);
    } catch (err: any) {
      console.error('Delete error:', err);
      alert(err.message || '删除失败,请重试');
    }
  };

  const handleLike = async (ideaId: string) => {
    if (!currentUser) {
      alert('请先登录');
      return;
    }

    try {
      await toggleLike(ideaId);
    } catch (err: any) {
      console.error('Like error:', err);
      alert(err.message || '操作失败,请重试');
    }
  };

  const handleSearch = () => {
    loadIdeas({
      search: searchQuery || undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined
    });
  };

  const handleTabChange = (tab: 'explore' | 'my-lab') => {
    setActiveTab(tab);
    if (tab === 'my-lab' && currentUser) {
      loadIdeas({ authorId: currentUser.id });
    } else {
      loadIdeas({});
    }
  };

  const displayedIdeas = ideas;

  return (
    <div className="min-h-screen bg-vibe-yellow py-8 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-3">
            <Lightbulb className="w-12 h-12" />
            <h1 className="text-5xl font-black uppercase">创意宇宙</h1>
          </div>
          <p className="text-lg font-bold max-w-2xl mx-auto">所有疯狂的想法都诞生于此。发布你的创意,寻找志同道合的 Viber。</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 justify-center">
          <Button 
            onClick={() => handleTabChange('explore')}
            className={`px-6 py-3 text-lg font-black uppercase ${
              activeTab === 'explore' 
                ? 'bg-black text-white' 
                : 'bg-white text-black hover:bg-black hover:text-white'
            }`}
          >
            <Rocket className="w-5 h-5 mr-2" /> 探索
          </Button>
          <Button 
            onClick={() => handleTabChange('my-lab')}
            className={`px-6 py-3 text-lg font-black uppercase ${
              activeTab === 'my-lab' 
                ? 'bg-black text-white' 
                : 'bg-white text-black hover:bg-black hover:text-white'
            }`}
          >
            <User className="w-5 h-5 mr-2" /> 我的实验室
          </Button>
        </div>

        {/* Search & Filter */}
        <div className="mb-6 flex gap-4 max-w-4xl mx-auto">
          <div className="flex-1 flex gap-2">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="搜索创意..."
              className="flex-1 border-4 border-black p-3 font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400"
            />
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="border-4 border-black p-3 font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400"
            >
              <option value="all">全部状态</option>
              <option value="concept">概念</option>
              <option value="in-progress">进行中</option>
              <option value="live">已上线</option>
            </select>
            <Button onClick={handleSearch} className="bg-black text-white px-6">
              <Search className="w-5 h-5" />
            </Button>
          </div>
          {currentUser && (
            <Button 
              onClick={() => setShowCreateModal(true)} 
              className="bg-vibe-yellow border-4 border-black hover:bg-black hover:text-white px-6"
            >
              <Plus className="w-5 h-5 mr-2" /> 发布新创意
            </Button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 max-w-4xl mx-auto bg-red-100 border-4 border-black p-4 flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <p className="font-bold text-red-600">{error}</p>
          </div>
        )}

        {/* Ideas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading && ideas.length === 0 ? (
            <div className="col-span-full flex justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin" />
            </div>
          ) : displayedIdeas.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <Lightbulb className="w-20 h-20 mx-auto mb-4 opacity-30" />
              <p className="text-2xl font-black uppercase">暂无创意</p>
              <p className="text-lg font-bold mt-2">成为第一个发布创意的人!</p>
            </div>
          ) : (
            displayedIdeas.map((idea) => {
              const isOwner = currentUser && idea.author === currentUser.username;
              
              return (
                <GlassCard key={idea.id} className="p-5 hover:shadow-neo-lg transition-shadow">
                  {/* Status Badge */}
                  <div className="flex justify-between items-start mb-3">
                    <span className={`px-3 py-1 text-xs font-black uppercase border-2 border-black ${
                      idea.status === 'live' ? 'bg-green-300' :
                      idea.status === 'in-progress' ? 'bg-blue-300' : 'bg-gray-300'
                    }`}>
                      {idea.status === 'live' ? '已上线' : idea.status === 'in-progress' ? '进行中' : '概念'}
                    </span>
                    
                    {isOwner && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleStartEdit(idea)}
                          className="p-1 border-2 border-black hover:bg-black hover:text-white transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => initiateDelete(idea.id)}
                          className="p-1 border-2 border-black hover:bg-red-500 hover:border-red-500 hover:text-white transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <h3 
                    className="text-xl font-black uppercase mb-2 cursor-pointer hover:text-blue-600"
                    onClick={() => onOpenIdea(idea.id)}
                  >
                    {idea.title}
                  </h3>

                  {/* Author & Collaborators */}
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-sm font-bold">by {idea.author}</p>
                    {idea.collaborators.length > 0 && (
                      <span className="text-xs font-bold text-gray-600">
                        + {idea.collaborators.length} 人协作
                      </span>
                    )}
                  </div>

                  {/* Description Preview */}
                  <p className="text-sm font-bold mb-4 line-clamp-3">
                    {idea.description.substring(0, 100)}
                    {idea.description.length > 100 && '...'}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {idea.tags.slice(0, 3).map((tag, i) => (
                      <span 
                        key={i}
                        className="px-2 py-1 bg-white border-2 border-black text-xs font-black uppercase"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t-2 border-black">
                    <button 
                      onClick={() => handleLike(idea.id)}
                      disabled={!currentUser}
                      className={`flex items-center gap-2 font-black uppercase text-sm transition-colors ${
                        currentUser ? 'hover:text-red-500 cursor-pointer' : 'opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <Heart className="w-5 h-5" /> {idea.likes}
                    </button>
                    
                    <button 
                      onClick={() => onOpenIdea(idea.id)}
                      className="flex items-center gap-2 font-black uppercase text-sm hover:text-blue-600"
                    >
                      <MessageSquare className="w-5 h-5" /> {idea.commentsCount || 0}
                    </button>

                    {idea.hasPrototype && idea.demoUrl && (
                      <a 
                        href={idea.demoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm font-black uppercase hover:text-blue-600"
                      >
                        <LinkIcon className="w-4 h-4" /> Demo
                      </a>
                    )}
                  </div>
                </GlassCard>
              );
            })
          )}
        </div>

        {/* Load More */}
        {hasMore && !loading && (
          <div className="text-center mt-8">
            <Button 
              onClick={loadMore}
              className="bg-white border-4 border-black hover:bg-black hover:text-white px-8 py-3 text-lg font-black uppercase"
            >
              加载更多
            </Button>
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-white w-full max-w-3xl border-4 border-black shadow-neo max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b-4 border-black flex justify-between items-center">
                <h2 className="text-2xl font-black uppercase">发布新创意</h2>
                <button onClick={() => setShowCreateModal(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block font-black uppercase text-sm mb-2">创意描述</label>
                  <textarea 
                    value={newIdeaText}
                    onChange={(e) => setNewIdeaText(e.target.value)}
                    className="w-full border-4 border-black p-4 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-yellow-400 min-h-[300px]"
                    placeholder="输入你的想法,可以使用 Markdown 格式..."
                  />
                </div>

                <div>
                  <label className="block font-black uppercase text-sm mb-2">Demo 链接 (可选)</label>
                  <input 
                    type="url"
                    value={newIdeaDemoUrl}
                    onChange={(e) => setNewIdeaDemoUrl(e.target.value)}
                    className="w-full border-4 border-black p-3 font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400"
                    placeholder="https://..."
                  />
                </div>

                <div className="flex gap-4">
                  <Button 
                    onClick={handleRefine}
                    disabled={isRefining || !newIdeaText.trim()}
                    className="flex-1 bg-vibe-yellow border-4 border-black hover:bg-yellow-300"
                  >
                    {isRefining ? (
                      <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> AI 润色中...</>
                    ) : (
                      <><Sparkles className="w-5 h-5 mr-2" /> AI 润色</>
                    )}
                  </Button>
                  
                  <Button 
                    onClick={handlePublish}
                    disabled={isPublishing || !newIdeaText.trim()}
                    className="flex-1 bg-black text-white hover:bg-gray-800"
                  >
                    {isPublishing ? (
                      <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> 发布中...</>
                    ) : (
                      <><Rocket className="w-5 h-5 mr-2" /> 发布</>
                    )}
                  </Button>
                </div>

                {/* Preview */}
                {newIdeaText && (
                  <div className="border-t-4 border-black pt-4">
                    <h3 className="font-black uppercase text-sm mb-2">预览</h3>
                    <div className="border-4 border-black p-4 bg-gray-50 prose prose-sm max-w-none">
                      <ReactMarkdown>{newIdeaText}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingIdea && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-white w-full max-w-3xl border-4 border-black shadow-neo">
              <div className="p-6 border-b-4 border-black flex justify-between items-center">
                <h2 className="text-2xl font-black uppercase">编辑创意</h2>
                <button onClick={() => setEditingIdea(null)}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block font-black uppercase text-sm mb-2">标题</label>
                  <input 
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full border-4 border-black p-3 font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400"
                  />
                </div>

                <div>
                  <label className="block font-black uppercase text-sm mb-2">描述</label>
                  <textarea 
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full border-4 border-black p-4 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-yellow-400 min-h-[300px]"
                  />
                </div>

                <div className="flex gap-4">
                  <Button 
                    onClick={() => setEditingIdea(null)}
                    className="flex-1 bg-gray-300 border-4 border-black hover:bg-gray-400"
                  >
                    取消
                  </Button>
                  <Button 
                    onClick={handleSaveEdit}
                    className="flex-1 bg-black text-white hover:bg-gray-800"
                  >
                    <Save className="w-5 h-5 mr-2" /> 保存
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        {deletingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md border-4 border-black shadow-neo p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
                <h2 className="text-2xl font-black uppercase">确认删除</h2>
              </div>
              <p className="font-bold mb-6">确定要删除这个创意吗?此操作不可撤销。</p>
              <div className="flex gap-4">
                <Button 
                  onClick={() => setDeletingId(null)}
                  className="flex-1 bg-gray-300 border-4 border-black hover:bg-gray-400"
                >
                  取消
                </Button>
                <Button 
                  onClick={confirmDelete}
                  className="flex-1 bg-red-500 text-white border-4 border-black hover:bg-red-600"
                >
                  删除
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
