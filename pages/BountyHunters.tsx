
import React, { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { Bounty } from '../types';
import { Briefcase, Coffee, Code2, PenTool, MessageCircle, Plus, X, DollarSign, Clock, MapPin, Trash2, Edit, AlertTriangle, Check, User } from 'lucide-react';

// Extended Bounty interface locally to include status/location for more detail
interface ExtendedBounty extends Bounty {
  status: 'Open' | 'Closed';
  location: string;
  timestamp: number;
}

const initialBounties: ExtendedBounty[] = [
  {
    id: '1',
    title: '急需 React 高手做 Vibe 动画',
    type: 'Coding',
    reward: '$500 或 收入分成',
    requester: 'StartupX',
    description: '寻找能为我们的落地页实现复杂 GSAP 动画的开发者。我们需要那种“像黄油一样顺滑”的滚动效果和跟随鼠标的微交互。\n\n**要求：**\n- 精通 React & Tailwind\n- 熟悉 GSAP 或 Framer Motion\n- 有审美，懂 Neo-Brutalism 风格',
    status: 'Open',
    location: 'Remote',
    timestamp: Date.now() - 1000000
  },
  {
    id: '2',
    title: 'Coffee Chat: AI 伦理探讨',
    type: 'Coffee Chat',
    reward: '免费咖啡 & 闲聊',
    requester: 'Sarah J.',
    description: '想找人聊聊 DeepSeek 集成带来的影响。特别是关于 AI 生成代码的版权归属问题。如果你是法律背景或资深开发者，请务必联系我！坐标上海，或者我们可以 Zoom。',
    status: 'Open',
    location: 'Shanghai / Online',
    timestamp: Date.now() - 5000000
  },
  {
    id: '3',
    title: '"VibeFlow" Logo 设计',
    type: 'Design',
    reward: '$200',
    requester: 'FlowMaster',
    description: '为一个新的 VS Code 插件设计 Logo，需要极简、霓虹风格。关键词：流动、连接、未来感。不需要复杂的 3D 渲染，平面矢量即可。',
    status: 'Closed',
    location: 'Remote',
    timestamp: Date.now() - 10000000
  }
];

const bountyTypes = ['Coding', 'Design', 'Marketing', 'Coffee Chat', 'Other'];

interface BountyHuntersProps {
    onContactClick: (username: string, initialMessage?: string) => void;
}

export const BountyHunters: React.FC<BountyHuntersProps> = ({ onContactClick }) => {
  const [bounties, setBounties] = useState<ExtendedBounty[]>(initialBounties);
  
  // Modal States
  const [viewingBounty, setViewingBounty] = useState<ExtendedBounty | null>(null);
  const [isEditing, setIsEditing] = useState(false); // True if editing, false if creating
  const [showFormModal, setShowFormModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<ExtendedBounty>>({
    title: '',
    type: 'Coding',
    reward: '',
    description: '',
    location: 'Remote',
    requester: 'You' // Default author
  });

  // --- Actions ---

  const handleOpenCreate = () => {
    setFormData({
      title: '',
      type: 'Coding',
      reward: '',
      description: '',
      location: 'Remote',
      requester: 'You'
    });
    setIsEditing(false);
    setShowFormModal(true);
  };

  const handleOpenEdit = (bounty: ExtendedBounty) => {
    setFormData(bounty);
    setIsEditing(true);
    setShowFormModal(true);
    // Close detail view if open, or keep it open? Let's close detail to focus on edit
    setViewingBounty(null); 
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.reward || !formData.description) return;

    if (isEditing && formData.id) {
      // Update
      setBounties(prev => prev.map(b => b.id === formData.id ? { ...b, ...formData } as ExtendedBounty : b));
    } else {
      // Create
      const newBounty: ExtendedBounty = {
        id: Date.now().toString(),
        title: formData.title!,
        type: formData.type as any,
        reward: formData.reward!,
        requester: formData.requester || 'You',
        description: formData.description!,
        location: formData.location || 'Remote',
        status: 'Open',
        timestamp: Date.now()
      };
      setBounties([newBounty, ...bounties]);
    }
    setShowFormModal(false);
  };

  const handleDelete = () => {
    if (deletingId) {
      setBounties(prev => prev.filter(b => b.id !== deletingId));
      setDeletingId(null);
      setViewingBounty(null); // Close detail view if it was the one deleted
    }
  };

  const handleContact = (requester: string, bountyTitle: string) => {
    // 1. Close the modal first for better UX
    setViewingBounty(null);
    
    // 2. Prepare the context message
    const message = `你好，我对你发布的悬赏项目 "${bountyTitle}" 很感兴趣，想聊聊合作细节。`;
    
    // 3. Open chat
    onContactClick(requester, message);
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'Coding': return <Code2 className="w-6 h-6"/>;
      case 'Design': return <PenTool className="w-6 h-6"/>;
      case 'Coffee Chat': return <Coffee className="w-6 h-6"/>;
      case 'Marketing': return <MessageCircle className="w-6 h-6"/>;
      default: return <Briefcase className="w-6 h-6"/>;
    }
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString('zh-CN');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 relative">
      {/* Header */}
      <div className="mb-10 text-center md:text-left flex flex-col md:flex-row justify-between items-center bg-white border-4 border-black p-8 shadow-neo">
        <div>
          <h2 className="text-5xl font-black mb-2 uppercase">赏金猎人</h2>
          <p className="text-xl font-bold text-gray-600">协作、搞钱、结识你的队伍。</p>
        </div>
        <div className="mt-6 md:mt-0">
          <Button icon={<Plus className="w-5 h-5"/>} onClick={handleOpenCreate}>发布悬赏</Button>
        </div>
      </div>

      {/* Grid List */}
      <div className="flex flex-col gap-6">
        {bounties.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 border-4 border-dashed border-black">
                <p className="text-2xl font-bold text-gray-400">暂无悬赏，来发布第一个任务吧！</p>
            </div>
        ) : (
            bounties.map((bounty) => (
            <GlassCard 
                key={bounty.id} 
                hoverEffect 
                onClick={() => setViewingBounty(bounty)}
                className={`flex flex-col md:flex-row items-center justify-between gap-6 border-l-[12px] cursor-pointer group ${
                    bounty.status === 'Closed' ? 'border-l-gray-400 bg-gray-50' : 'border-l-black'
                }`}
            >
                <div className="flex items-center gap-6 flex-1 w-full">
                <div className={`hidden md:flex w-20 h-20 border-2 border-black items-center justify-center shadow-neo-sm group-hover:scale-110 transition-transform ${
                    bounty.status === 'Closed' ? 'bg-gray-200 grayscale' :
                    bounty.type === 'Coding' ? 'bg-blue-300' :
                    bounty.type === 'Design' ? 'bg-pink-300' : 'bg-amber-300'
                }`}>
                    {getIcon(bounty.type)}
                </div>
                <div className="w-full">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h3 className={`text-2xl font-black ${bounty.status === 'Closed' ? 'text-gray-500 line-through decoration-2' : ''}`}>
                        {bounty.title}
                    </h3>
                    <span className="px-2 py-1 border-2 border-black text-xs font-bold bg-white uppercase">
                        {bounty.type}
                    </span>
                    {bounty.status === 'Closed' && (
                        <span className="px-2 py-1 border-2 border-black text-xs font-bold bg-gray-200 text-gray-600 uppercase">
                            已关闭
                        </span>
                    )}
                    </div>
                    <p className="text-lg font-medium text-gray-800 mb-3 line-clamp-1">{bounty.description}</p>
                    <div className="flex gap-4 text-sm font-bold text-gray-500">
                        <span className="flex items-center"><User className="w-3 h-3 mr-1"/> @{bounty.requester}</span>
                        <span className="flex items-center"><MapPin className="w-3 h-3 mr-1"/> {bounty.location}</span>
                        <span className="flex items-center"><Clock className="w-3 h-3 mr-1"/> {formatDate(bounty.timestamp)}</span>
                    </div>
                </div>
                </div>

                <div className="flex flex-col md:items-end gap-3 min-w-[180px] w-full md:w-auto border-t-2 border-black md:border-t-0 pt-4 md:pt-0">
                <div className={`text-2xl font-black px-2 border-2 border-black shadow-neo-sm text-center md:text-right ${
                    bounty.status === 'Closed' ? 'bg-gray-200 text-gray-500' : 'bg-green-400'
                }`}>
                    {bounty.reward}
                </div>
                <Button size="sm" variant="outline" className="w-full md:w-auto group-hover:bg-black group-hover:text-white">
                    查看详情
                </Button>
                </div>
            </GlassCard>
            ))
        )}
      </div>

      {/* --- MODALS --- */}

      {/* Detail Modal */}
      {viewingBounty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setViewingBounty(null)}>
            <div className="bg-white border-4 border-black shadow-neo w-full max-w-3xl max-h-[90vh] overflow-y-auto relative" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className={`p-6 border-b-4 border-black flex justify-between items-start ${
                    viewingBounty.status === 'Closed' ? 'bg-gray-200' : 'bg-vibe-yellow'
                }`}>
                    <div className="flex items-start gap-4">
                        <div className={`p-4 border-2 border-black bg-white shadow-neo-sm hidden sm:block`}>
                            {getIcon(viewingBounty.type)}
                        </div>
                        <div>
                             <div className="flex gap-2 mb-2">
                                <span className="bg-black text-white px-2 py-1 text-xs font-bold uppercase">{viewingBounty.type}</span>
                                {viewingBounty.status === 'Closed' && <span className="bg-gray-600 text-white px-2 py-1 text-xs font-bold uppercase">Closed</span>}
                             </div>
                             <h2 className="text-3xl font-black uppercase mb-1">{viewingBounty.title}</h2>
                             <div className="flex items-center gap-4 text-sm font-bold">
                                 <span className="flex items-center"><User className="w-4 h-4 mr-1"/> {viewingBounty.requester}</span>
                                 <span className="flex items-center"><Clock className="w-4 h-4 mr-1"/> {formatDate(viewingBounty.timestamp)}</span>
                             </div>
                        </div>
                    </div>
                    <button onClick={() => setViewingBounty(null)} className="p-2 hover:bg-black hover:text-white transition-colors border-2 border-black bg-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8">
                    <div className="flex flex-col md:flex-row gap-8 mb-8">
                        <div className="flex-1">
                            <h4 className="text-xl font-black mb-4 flex items-center"><Briefcase className="w-5 h-5 mr-2"/> 任务详情</h4>
                            <div className="text-lg leading-relaxed whitespace-pre-wrap font-medium text-gray-800 bg-gray-50 p-4 border-2 border-black rounded-sm">
                                {viewingBounty.description}
                            </div>
                        </div>
                        <div className="md:w-1/3 space-y-4">
                            <div className="bg-green-100 border-2 border-black p-4 shadow-neo-sm">
                                <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">赏金 / 报酬</label>
                                <div className="text-2xl font-black text-green-700">{viewingBounty.reward}</div>
                            </div>
                            <div className="bg-blue-100 border-2 border-black p-4 shadow-neo-sm">
                                <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">地点 / 方式</label>
                                <div className="text-lg font-bold flex items-center"><MapPin className="w-4 h-4 mr-2"/> {viewingBounty.location}</div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-6 border-t-2 border-dashed border-black flex justify-between items-center">
                        {/* Owner Actions (Simulated) */}
                        <div className="flex gap-3">
                             {viewingBounty.requester === 'You' && (
                                <>
                                    <Button size="sm" variant="outline" icon={<Edit className="w-4 h-4"/>} onClick={() => handleOpenEdit(viewingBounty)}>
                                        编辑
                                    </Button>
                                    <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        className="text-red-600 hover:bg-red-50 border-transparent"
                                        icon={<Trash2 className="w-4 h-4"/>}
                                        onClick={() => setDeletingId(viewingBounty.id)}
                                    >
                                        删除
                                    </Button>
                                </>
                             )}
                        </div>

                        <Button 
                            icon={<MessageCircle className="w-5 h-5"/>} 
                            disabled={viewingBounty.status === 'Closed'}
                            onClick={() => handleContact(viewingBounty.requester, viewingBounty.title)}
                        >
                             {viewingBounty.status === 'Closed' ? '已结束' : '联系发布者'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowFormModal(false)}>
            <div className="bg-white border-4 border-black shadow-neo w-full max-w-2xl max-h-[90vh] overflow-y-auto relative" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b-4 border-black bg-vibe-yellow flex justify-between items-center sticky top-0 z-10">
                    <h3 className="text-2xl font-black uppercase flex items-center">
                        {isEditing ? <Edit className="w-6 h-6 mr-2"/> : <Plus className="w-6 h-6 mr-2"/>} 
                        {isEditing ? '编辑悬赏' : '发布新悬赏'}
                    </h3>
                    <button onClick={() => setShowFormModal(false)} className="p-1 hover:bg-black hover:text-white border-2 border-transparent hover:border-black transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block font-bold text-sm uppercase mb-1">标题 *</label>
                        <input 
                            type="text" 
                            className="w-full border-2 border-black p-3 font-bold focus:ring-4 focus:ring-yellow-400 outline-none"
                            placeholder="一句话描述你的需求"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block font-bold text-sm uppercase mb-1">类型</label>
                            <select 
                                className="w-full border-2 border-black p-3 font-bold bg-white focus:ring-4 focus:ring-yellow-400 outline-none"
                                value={formData.type}
                                onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                            >
                                {bountyTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block font-bold text-sm uppercase mb-1">地点 / 方式</label>
                            <input 
                                type="text" 
                                className="w-full border-2 border-black p-3 font-bold focus:ring-4 focus:ring-yellow-400 outline-none"
                                placeholder="Remote, Shanghai, etc."
                                value={formData.location}
                                onChange={(e) => setFormData({...formData, location: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block font-bold text-sm uppercase mb-1">赏金 / 回报 *</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"/>
                            <input 
                                type="text" 
                                className="w-full border-2 border-black p-3 pl-10 font-bold focus:ring-4 focus:ring-yellow-400 outline-none"
                                placeholder="$500, 请喝咖啡, 股权..."
                                value={formData.reward}
                                onChange={(e) => setFormData({...formData, reward: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block font-bold text-sm uppercase mb-1">详细描述 *</label>
                        <textarea 
                            className="w-full border-2 border-black p-3 min-h-[150px] font-medium focus:ring-4 focus:ring-yellow-400 outline-none resize-y"
                            placeholder="具体要求、技术栈、截止日期等..."
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                    </div>

                    {isEditing && (
                        <div>
                             <label className="block font-bold text-sm uppercase mb-1">状态</label>
                             <div className="flex gap-4">
                                 <label className="flex items-center gap-2 cursor-pointer border-2 border-black p-2 bg-gray-50">
                                     <input 
                                        type="radio" 
                                        name="status" 
                                        checked={formData.status === 'Open'} 
                                        onChange={() => setFormData({...formData, status: 'Open'})}
                                     />
                                     <span className="font-bold">Open (进行中)</span>
                                 </label>
                                 <label className="flex items-center gap-2 cursor-pointer border-2 border-black p-2 bg-gray-50">
                                     <input 
                                        type="radio" 
                                        name="status" 
                                        checked={formData.status === 'Closed'} 
                                        onChange={() => setFormData({...formData, status: 'Closed'})}
                                     />
                                     <span className="font-bold text-gray-500">Closed (已结束)</span>
                                 </label>
                             </div>
                        </div>
                    )}

                    <div className="pt-4 border-t-2 border-black flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setShowFormModal(false)}>取消</Button>
                        <Button onClick={handleSubmit} icon={<Check className="w-4 h-4"/>}>
                            {isEditing ? '保存修改' : '立即发布'}
                        </Button>
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
                   <h3 className="text-2xl font-black uppercase">撤回悬赏？</h3>
                </div>
              </div>
              <p className="mb-8 font-medium">确定要删除这条悬赏吗？删除后其他人将无法看到此任务。</p>
              <div className="flex justify-end gap-4">
                  <Button variant="outline" onClick={() => setDeletingId(null)}>取消</Button>
                  <Button 
                    className="bg-red-500 hover:bg-red-600 text-white border-black" 
                    onClick={handleDelete}
                    icon={<Trash2 className="w-4 h-4"/>}
                  >
                      确认删除
                  </Button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};
