
import React, { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { Idea } from '../types';
import { refineIdeaWithAI } from '../services/geminiService';
import { Sparkles, Heart, Rocket, Loader2, Lightbulb, Link as LinkIcon, Edit, Trash2, MessageSquare, User, X, Save, UserPlus, AlertTriangle, Check, Plus } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface IdeaUniverseProps {
  ideas: Idea[];
  setIdeas: React.Dispatch<React.SetStateAction<Idea[]>>;
  onOpenIdea: (id: string) => void;
}

export const IdeaUniverse: React.FC<IdeaUniverseProps> = ({ ideas, setIdeas, onOpenIdea }) => {
  const [newIdeaText, setNewIdeaText] = useState('');
  const [newIdeaDemoUrl, setNewIdeaDemoUrl] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  
  // Tab State: 'explore' | 'my-lab'
  const [activeTab, setActiveTab] = useState<'explore' | 'my-lab'>('explore');
  
  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [invitingIdea, setInvitingIdea] = useState<Idea | null>(null);
  const [inviteName, setInviteName] = useState('');

  const handleRefine = async () => {
    if (!newIdeaText.trim()) return;
    setIsRefining(true);
    const result = await refineIdeaWithAI(newIdeaText);
    
    if (result && !result.includes("Error")) {
      setNewIdeaText(result);
    }
    
    setIsRefining(false);
  };

  const handlePublish = () => {
    if (!newIdeaText.trim()) return;
    
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
    } else if (firstLine.startsWith('**标题：')) {
        title = firstLine.replace('**标题：', '').replace('**', '').trim();
    }

    const hasDemo = !!newIdeaDemoUrl.trim();

    const ideaToAdd: Idea = {
      id: Date.now().toString(),
      title: title.length > 30 ? title.substring(0, 30) + '...' : title,
      author: 'You', // Hardcoded current user
      collaborators: [],
      description: description,
      tags: ['New', 'Community'],
      likes: 0,
      hasPrototype: hasDemo,
      demoUrl: hasDemo ? newIdeaDemoUrl.trim() : undefined,
      status: hasDemo ? 'in-progress' : 'concept',
      comments: []
    };

    setIdeas(prevIdeas => [ideaToAdd, ...prevIdeas]);
    setNewIdeaText('');
    setNewIdeaDemoUrl('');
    setShowCreateModal(false); // Close modal
    setActiveTab('my-lab');
  };

  // --- Delete Logic ---
  const initiateDelete = (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = () => {
    if (deletingId) {
      setIdeas(prevIdeas => prevIdeas.filter(i => i.id !== deletingId));
      setDeletingId(null);
    }
  };

  // --- Invite Logic ---
  const initiateInvite = (idea: Idea) => {
    setInvitingIdea(idea);
    setInviteName('');
  };

  const confirmInvite = () => {
    if (invitingIdea && inviteName.trim()) {
        setIdeas(prevIdeas => prevIdeas.map(i => {
            if (i.id === invitingIdea.id) {
                return {
                    ...i,
                    collaborators: [...i.collaborators, inviteName.trim()]
                };
            }
            return i;
        }));
        setInvitingIdea(null);
        setInviteName('');
    }
  };

  const handleSaveEdit = () => {
    if (!editingIdea) return;
    setIdeas(prevIdeas => prevIdeas.map(idea => 
      idea.id === editingIdea.id ? editingIdea : idea
    ));
    setEditingIdea(null);
  };

  const displayedIdeas = activeTab === 'my-lab' 
    ? ideas.filter(idea => idea.author === 'You' || idea.collaborators.includes('You'))
    : ideas;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 relative">
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 p-6 bg-black text-vibe-yellow shadow-neo">
        <div>
            <h2 className="text-5xl font-black mb-2 uppercase">Idea 宇宙</h2>
            <p className="text-xl font-bold text-white">这里是灵感的孵化器。上传你的脑洞、原型和梦想。</p>
        </div>
        <div className="mt-6 md:mt-0">
            <Button 
                onClick={() => setShowCreateModal(true)}
                icon={<Plus className="w-5 h-5"/>}
                className="bg-vibe-yellow text-black hover:bg-white border-white"
            >
                分享你的 Vibe
            </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex mb-8 gap-4 border-b-4 border-black pb-1">
        <button 
          onClick={() => setActiveTab('explore')}
          className={`text-xl font-black uppercase px-6 py-2 transition-all ${activeTab === 'explore' ? 'bg-black text-white' : 'hover:bg-white hover:text-black'}`}
        >
          探索宇宙
        </button>
        <button 
          onClick={() => setActiveTab('my-lab')}
          className={`text-xl font-black uppercase px-6 py-2 flex items-center transition-all ${activeTab === 'my-lab' ? 'bg-black text-white' : 'hover:bg-white hover:text-black'}`}
        >
          <User className="w-5 h-5 mr-2" /> 我的实验室
        </button>
      </div>

      {/* Ideas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayedIdeas.length === 0 ? (
           <div className="col-span-full text-center py-20 bg-white border-4 border-black border-dashed">
             <p className="text-2xl font-bold text-gray-400">暂无内容，快去创造吧！</p>
           </div>
        ) : (
          displayedIdeas.map((idea) => {
            const totalComments = idea.comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0);
            
            return (
                <GlassCard 
                    key={idea.id} 
                    hoverEffect 
                    onClick={() => onOpenIdea(idea.id)} 
                    className="flex flex-col h-full bg-white group relative"
                >
                
                <div className="flex justify-between items-start mb-4 border-b-2 border-black pb-4 border-dashed">
                    <div className="flex gap-2 flex-wrap">
                    {idea.tags.map(tag => (
                        <span key={tag} className="text-xs font-bold px-2 py-1 border border-black bg-gray-100">
                        #{tag}
                        </span>
                    ))}
                    </div>
                    <div className={`px-2 py-1 text-xs font-black border border-black ${
                    idea.status === 'live' ? 'bg-green-400' : idea.status === 'in-progress' ? 'bg-yellow-400' : 'bg-gray-300'
                    }`}>
                    {idea.status === 'live' ? '已上线' : idea.status === 'in-progress' ? '开发中' : '概念'}
                    </div>
                </div>

                <h3 className="text-2xl font-black mb-3 group-hover:text-blue-600 transition-colors">{idea.title}</h3>
                <div className="text-gray-700 font-medium mb-6 flex-grow line-clamp-6 prose prose-sm prose-p:my-1 prose-headings:my-2">
                    <ReactMarkdown>{idea.description}</ReactMarkdown>
                </div>

                <div className="mt-auto">
                    <div className="flex items-center justify-between pt-4 border-t-2 border-black">
                        <div className="flex items-center gap-2">
                            <div className="font-bold text-sm bg-black text-white px-2">
                            @{idea.author}
                            </div>
                            {idea.collaborators.length > 0 && (
                                <span className="text-xs font-bold border border-black px-1" title={idea.collaborators.join(', ')}>
                                    +{idea.collaborators.length}
                                </span>
                            )}
                        </div>
                    
                        <div className="flex gap-3">
                        <div className="flex items-center font-bold px-2">
                            <Heart className="w-5 h-5 mr-1 text-pink-500" /> {idea.likes}
                        </div>
                        <div className="flex items-center font-bold px-2">
                            <MessageSquare className="w-5 h-5 mr-1 text-blue-500" /> {totalComments}
                        </div>
                        
                        {idea.hasPrototype && idea.demoUrl && (
                            <a 
                            href={idea.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()} 
                            className="flex items-center font-bold text-blue-600 bg-blue-50 border-2 border-transparent hover:border-blue-600 hover:bg-blue-100 px-3 py-1 rounded transition-all duration-200"
                            >
                            <Rocket className="w-4 h-4 mr-1" /> Demo
                            </a>
                        )}
                        </div>
                    </div>

                    {/* My Lab Admin Actions */}
                    {activeTab === 'my-lab' && (
                        <div 
                            className="mt-4 pt-3 border-t-2 border-black border-dashed flex justify-between items-center gap-2 animate-in slide-in-from-top-2 relative z-20"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            <div className="flex gap-2">
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => setEditingIdea(idea)}
                                    icon={<Edit className="w-3 h-3"/>}
                                >
                                    修改
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => initiateInvite(idea)}
                                    icon={<UserPlus className="w-3 h-3"/>}
                                >
                                    邀请
                                </Button>
                            </div>
                            <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-red-600 hover:bg-red-50 hover:text-red-700 border-transparent hover:border-red-200"
                                onClick={() => initiateDelete(idea.id)}
                                icon={<Trash2 className="w-3 h-3"/>}
                            >
                                删除
                            </Button>
                        </div>
                    )}
                </div>
                </GlassCard>
            );
          })
        )}
      </div>

      {/* --- MODALS --- */}

      {/* Create Idea Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowCreateModal(false)}>
            <div className="bg-white border-4 border-black shadow-neo w-full max-w-2xl relative" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b-4 border-black bg-vibe-yellow flex justify-between items-center">
                    <h3 className="text-2xl font-black uppercase flex items-center">
                        <Lightbulb className="w-6 h-6 mr-2" /> 分享你的 Vibe
                    </h3>
                    <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-black hover:text-white border-2 border-transparent hover:border-black transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="p-6">
                    <textarea
                        className="w-full bg-white border-2 border-black p-4 text-xl font-medium focus:ring-4 focus:ring-yellow-400 focus:outline-none mb-4 min-h-[200px] shadow-inner placeholder-gray-400 font-mono"
                        placeholder="我有一个大胆的想法..."
                        value={newIdeaText}
                        onChange={(e) => setNewIdeaText(e.target.value)}
                    />

                    <div className="mb-6">
                        <div className="relative">
                            <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input 
                                type="url"
                                className="w-full bg-gray-50 border-2 border-black p-3 pl-10 font-mono focus:ring-4 focus:ring-yellow-400 focus:outline-none"
                                placeholder="Demo 链接 / 原型地址 (可选)"
                                value={newIdeaDemoUrl}
                                onChange={(e) => setNewIdeaDemoUrl(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 flex-wrap justify-between items-center border-t-2 border-black pt-4">
                        <div className="flex gap-4">
                            <Button 
                                onClick={handleRefine} 
                                disabled={isRefining || !newIdeaText}
                                icon={isRefining ? <Loader2 className="animate-spin w-5 h-5"/> : <Sparkles className="w-5 h-5"/>}
                                variant="outline"
                            >
                                {isRefining ? 'AI 润色中...' : 'AI 润色'}
                            </Button>
                        </div>
                        
                        <Button onClick={handlePublish} disabled={!newIdeaText.trim()}>
                            发布 Idea
                        </Button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingIdea && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setEditingIdea(null)}>
          <div className="bg-white border-4 border-black shadow-neo w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col relative" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b-4 border-black bg-vibe-yellow sticky top-0 z-10">
                <h3 className="text-2xl font-black uppercase flex items-center">
                    <Edit className="w-6 h-6 mr-2" /> 编辑创意
                </h3>
                <button onClick={() => setEditingIdea(null)} className="p-1 hover:bg-black hover:text-white transition-colors border-2 border-transparent hover:border-black">
                    <X className="w-6 h-6" />
                </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                 <label className="block font-bold text-sm uppercase mb-1">标题</label>
                 <input type="text" value={editingIdea.title} onChange={(e) => setEditingIdea({...editingIdea, title: e.target.value})} className="w-full border-2 border-black p-2 font-bold" />
              </div>
              <div>
                 <label className="block font-bold text-sm uppercase mb-1">描述 (Markdown)</label>
                 <textarea value={editingIdea.description} onChange={(e) => setEditingIdea({...editingIdea, description: e.target.value})} className="w-full h-64 border-2 border-black p-2 font-mono" />
              </div>
              <div>
                 <label className="block font-bold text-sm uppercase mb-1">Demo 链接</label>
                 <input type="text" value={editingIdea.demoUrl || ''} onChange={(e) => setEditingIdea({...editingIdea, demoUrl: e.target.value, hasPrototype: !!e.target.value})} className="w-full border-2 border-black p-2 font-mono" />
              </div>
              <div className="pt-4 border-t-2 border-black flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setEditingIdea(null)}>取消</Button>
                  <Button icon={<Save className="w-4 h-4" />} onClick={handleSaveEdit}>保存修改</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setDeletingId(null)}>
           <div className="bg-white border-4 border-black shadow-neo p-8 max-w-md w-full relative" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-red-100 p-3 rounded-full border-2 border-black">
                   <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <div>
                   <h3 className="text-2xl font-black uppercase">确认删除？</h3>
                   <p className="font-bold text-gray-500 text-sm">此操作无法撤销。</p>
                </div>
              </div>
              <p className="mb-8 font-medium">您确定要删除这个创意吗？它将永远消失在数字虚空中。</p>
              <div className="flex justify-end gap-4">
                  <Button variant="outline" onClick={() => setDeletingId(null)}>取消</Button>
                  <Button 
                    className="bg-red-500 hover:bg-red-600 text-white border-black" 
                    onClick={confirmDelete}
                    icon={<Trash2 className="w-4 h-4"/>}
                  >
                      确认删除
                  </Button>
              </div>
           </div>
        </div>
      )}

      {/* Invite Collaborator Modal */}
      {invitingIdea && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setInvitingIdea(null)}>
           <div className="bg-white border-4 border-black shadow-neo p-8 max-w-md w-full relative" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-blue-100 p-3 rounded-full border-2 border-black">
                   <UserPlus className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-black uppercase">邀请创作者</h3>
              </div>
              <div className="mb-6">
                  <label className="block font-bold text-sm uppercase mb-2">合作者名字 / ID</label>
                  <input 
                    type="text" 
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="例如: CodeNinja_99"
                    className="w-full border-2 border-black p-3 font-bold text-lg focus:ring-4 focus:ring-yellow-400 outline-none"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && confirmInvite()}
                  />
              </div>
              <div className="flex justify-end gap-4">
                  <Button variant="outline" onClick={() => setInvitingIdea(null)}>取消</Button>
                  <Button 
                    onClick={confirmInvite}
                    icon={<Check className="w-4 h-4"/>}
                    disabled={!inviteName.trim()}
                  >
                      发送邀请
                  </Button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};
