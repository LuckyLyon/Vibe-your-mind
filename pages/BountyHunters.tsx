import React, { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { useBounties } from '../hooks/useBounties';
import { useAuth } from '../hooks/useAuth';
import { Bounty } from '../api/bounties';
import { Briefcase, Coffee, Code2, PenTool, MessageCircle, Plus, X, DollarSign, Clock, MapPin, Trash2, Edit, AlertTriangle, Check, User, Loader2 } from 'lucide-react';

const bountyTypes = ['Coding', 'Design', 'Marketing', 'Coffee Chat'];

interface BountyHuntersProps {
  onContactClick: (username: string, initialMessage?: string) => void;
}

export const BountyHunters: React.FC<BountyHuntersProps> = ({ onContactClick }) => {
  const { currentUser } = useAuth();
  const { bounties, loading, error, createBounty, updateBounty, deleteBounty, closeBounty, reopenBounty } = useBounties();
  
  // Modal States
  const [viewingBounty, setViewingBounty] = useState<Bounty | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    type: 'Coding' | 'Design' | 'Marketing' | 'Coffee Chat';
    reward: string;
    description: string;
    location: string;
  }>({
    title: '',
    type: 'Coding',
    reward: '',
    description: '',
    location: 'Remote'
  });

  // --- Actions ---
  const handleOpenCreate = () => {
    if (!currentUser) {
      alert('请先登录');
      return;
    }
    setFormData({
      title: '',
      type: 'Coding',
      reward: '',
      description: '',
      location: 'Remote'
    });
    setIsEditing(false);
    setShowFormModal(true);
  };

  const handleOpenEdit = (bounty: Bounty) => {
    setFormData({
      title: bounty.title,
      type: bounty.type,
      reward: bounty.reward,
      description: bounty.description,
      location: bounty.location
    });
    setIsEditing(true);
    setShowFormModal(true);
    setViewingBounty(null);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.reward || !formData.description) {
      alert('请填写所有必填字段');
      return;
    }

    try {
      setSubmitting(true);
      if (isEditing && viewingBounty) {
        await updateBounty(viewingBounty.id, formData);
      } else {
        await createBounty(formData);
      }
      setShowFormModal(false);
    } catch (err: any) {
      alert(err.message || '操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBounty(id);
      setDeletingId(null);
      setViewingBounty(null);
    } catch (err: any) {
      alert(err.message || '删除失败');
    }
  };

  const handleToggleStatus = async (bounty: Bounty) => {
    try {
      if (bounty.status === 'Open') {
        await closeBounty(bounty.id);
      } else {
        await reopenBounty(bounty.id);
      }
    } catch (err: any) {
      alert(err.message || '操作失败');
    }
  };

  const handleContactBountyOwner = (bountyTitle: string, requester: string) => {
    const message = `你好，我对你发布的悬赏项目 "${bountyTitle}" 很感兴趣，想聊聊合作细节。`;
    onContactClick(requester, message);
  };

  const getBountyIcon = (type: string) => {
    switch (type) {
      case 'Coding': return <Code2 className="w-6 h-6"/>;
      case 'Design': return <PenTool className="w-6 h-6"/>;
      case 'Coffee Chat': return <Coffee className="w-6 h-6"/>;
      case 'Marketing': return <MessageCircle className="w-6 h-6"/>;
      default: return <Briefcase className="w-6 h-6"/>;
    }
  };

  const formatTimestamp = (ts: number) => {
    const diff = Date.now() - ts;
    const days = Math.floor(diff / 86400000);
    if (days === 0) return '今天';
    if (days === 1) return '昨天';
    return `${days} 天前`;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
        <p className="text-xl font-bold">加载中...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-5xl font-black uppercase mb-3 flex items-center gap-3">
            <Briefcase className="w-12 h-12" /> 赏金猎人
          </h1>
          <p className="text-xl font-bold text-gray-700">找合作、发任务、赚外快</p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-black text-white gap-2">
          <Plus className="w-5 h-5" /> 发布悬赏
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-100 border-4 border-red-500 p-4">
          <p className="font-bold text-red-700">{error}</p>
        </div>
      )}

      {/* Bounties Grid */}
      {bounties.length === 0 ? (
        <div className="text-center py-20">
          <Briefcase className="w-24 h-24 mx-auto mb-6 opacity-20" />
          <h2 className="text-3xl font-black uppercase mb-4">暂无悬赏</h2>
          <p className="text-xl font-bold text-gray-600 mb-6">成为第一个发布悬赏的人!</p>
          <Button onClick={handleOpenCreate} className="bg-black text-white">
            <Plus className="w-5 h-5 mr-2" /> 发布悬赏
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bounties.map((bounty) => {
            const isMyBounty = currentUser?.id === bounty.requesterId;
            
            return (
              <GlassCard 
                key={bounty.id}
                className={`p-6 hover:shadow-neo-lg transition-all cursor-pointer ${
                  bounty.status === 'Closed' ? 'opacity-60' : ''
                }`}
                onClick={() => setViewingBounty(bounty)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 border-2 border-black ${
                    bounty.status === 'Open' ? 'bg-vibe-yellow' : 'bg-gray-300'
                  }`}>
                    {getBountyIcon(bounty.type)}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-3 py-1 text-xs font-black uppercase border-2 border-black ${
                      bounty.status === 'Open' ? 'bg-green-400' : 'bg-gray-400'
                    }`}>
                      {bounty.status}
                    </span>
                    {isMyBounty && (
                      <span className="px-2 py-0.5 text-xs font-bold bg-blue-200 border border-blue-400">
                        我的
                      </span>
                    )}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-black uppercase mb-2 line-clamp-2">
                  {bounty.title}
                </h3>

                {/* Meta */}
                <div className="flex items-center gap-3 mb-3 text-sm font-bold text-gray-600">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" /> {bounty.requester}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" /> {formatTimestamp(bounty.timestamp)}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm font-bold text-gray-700 line-clamp-3 mb-4">
                  {bounty.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t-2 border-black">
                  <span className="flex items-center gap-1 text-sm font-black text-green-600">
                    <DollarSign className="w-4 h-4" /> {bounty.reward}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-bold text-gray-500">
                    <MapPin className="w-3 h-3" /> {bounty.location}
                  </span>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {viewingBounty && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setViewingBounty(null)}>
          <GlassCard className="max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`p-4 border-2 border-black ${
                  viewingBounty.status === 'Open' ? 'bg-vibe-yellow' : 'bg-gray-300'
                }`}>
                  {getBountyIcon(viewingBounty.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-3 py-1 text-xs font-black border-2 border-black bg-white">
                      {viewingBounty.type}
                    </span>
                    <span className={`px-3 py-1 text-xs font-black uppercase border-2 border-black ${
                      viewingBounty.status === 'Open' ? 'bg-green-400' : 'bg-gray-400'
                    }`}>
                      {viewingBounty.status}
                    </span>
                  </div>
                  <h2 className="text-3xl font-black uppercase">{viewingBounty.title}</h2>
                </div>
              </div>
              <button onClick={() => setViewingBounty(null)} className="p-2 hover:bg-gray-200 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Meta Info */}
            <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 border-2 border-black">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">发布者</p>
                <p className="font-black text-lg">{viewingBounty.requester}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">奖励</p>
                <p className="font-black text-lg text-green-600">{viewingBounty.reward}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">地点</p>
                <p className="font-black">{viewingBounty.location}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">发布时间</p>
                <p className="font-black">{formatTimestamp(viewingBounty.timestamp)}</p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="font-black uppercase text-lg mb-3">项目描述</h3>
              <p className="text-sm font-bold leading-relaxed whitespace-pre-line">
                {viewingBounty.description}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {currentUser?.id === viewingBounty.requesterId ? (
                <>
                  <Button 
                    onClick={() => handleOpenEdit(viewingBounty)}
                    className="bg-blue-500 text-white gap-2"
                  >
                    <Edit className="w-4 h-4" /> 编辑
                  </Button>
                  <Button 
                    onClick={() => handleToggleStatus(viewingBounty)}
                    className={`${viewingBounty.status === 'Open' ? 'bg-gray-500' : 'bg-green-500'} text-white gap-2`}
                  >
                    {viewingBounty.status === 'Open' ? '关闭' : '重新开放'}
                  </Button>
                  <Button 
                    onClick={() => setDeletingId(viewingBounty.id)}
                    className="bg-red-500 text-white gap-2"
                  >
                    <Trash2 className="w-4 h-4" /> 删除
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={() => handleContactBountyOwner(viewingBounty.title, viewingBounty.requester)}
                  className="bg-black text-white gap-2"
                  disabled={viewingBounty.status === 'Closed'}
                >
                  <MessageCircle className="w-5 h-5" /> 联系发布者
                </Button>
              )}
            </div>
          </GlassCard>
        </div>
      )}

      {/* Create/Edit Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowFormModal(false)}>
          <GlassCard className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-black uppercase">
                {isEditing ? '编辑悬赏' : '发布悬赏'}
              </h2>
              <button onClick={() => setShowFormModal(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block font-black mb-2">标题 *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full border-4 border-black p-3 font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400"
                  placeholder="急需 React 高手做动画"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block font-black mb-2">类型 *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                  className="w-full border-4 border-black p-3 font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400"
                >
                  {bountyTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Reward */}
              <div>
                <label className="block font-black mb-2">奖励 *</label>
                <input
                  type="text"
                  value={formData.reward}
                  onChange={(e) => setFormData({...formData, reward: e.target.value})}
                  className="w-full border-4 border-black p-3 font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400"
                  placeholder="$500 或 收入分成"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block font-black mb-2">地点</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full border-4 border-black p-3 font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400"
                  placeholder="Remote / Shanghai / Online"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-black mb-2">项目描述 *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full border-4 border-black p-3 font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400 min-h-[200px]"
                  placeholder="详细描述项目需求、技能要求、时间安排等..."
                />
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={handleSubmit}
                  className="flex-1 bg-black text-white"
                  disabled={submitting || !formData.title || !formData.reward || !formData.description}
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (isEditing ? '保存' : '发布')}
                </Button>
                <Button onClick={() => setShowFormModal(false)} className="bg-gray-300">
                  取消
                </Button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <GlassCard className="max-w-md w-full p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-2xl font-black uppercase mb-4">确认删除?</h3>
            <p className="font-bold mb-6">删除后无法恢复</p>
            <div className="flex gap-3">
              <Button onClick={() => handleDelete(deletingId)} className="flex-1 bg-red-500 text-white">
                确认删除
              </Button>
              <Button onClick={() => setDeletingId(null)} className="flex-1 bg-gray-300">
                取消
              </Button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};
