import { useState, useEffect } from 'react';
import {
  fetchBounties,
  createBounty as apiCreateBounty,
  updateBounty as apiUpdateBounty,
  deleteBounty as apiDeleteBounty,
  closeBounty as apiCloseBounty,
  reopenBounty as apiReopenBounty,
  Bounty
} from '../api/bounties';

/**
 * 赏金任务管理 Hook
 */
export function useBounties(filters?: {
  status?: 'Open' | 'Closed';
  type?: string;
  requesterId?: string;
}) {
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载赏金列表
  const loadBounties = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchBounties(filters);
      setBounties(data);
    } catch (err: any) {
      setError(err.message || '加载失败');
      console.error('Load bounties error:', err);
    } finally {
      setLoading(false);
    }
  };

  // 创建赏金
  const createBounty = async (data: {
    title: string;
    type: 'Coding' | 'Design' | 'Marketing' | 'Coffee Chat';
    reward: string;
    description: string;
    location?: string;
  }) => {
    try {
      const newBounty = await apiCreateBounty(data);
      setBounties(prev => [newBounty, ...prev]);
      return newBounty;
    } catch (err: any) {
      setError(err.message || '创建失败');
      throw err;
    }
  };

  // 更新赏金
  const updateBounty = async (
    id: string,
    data: {
      title?: string;
      type?: 'Coding' | 'Design' | 'Marketing' | 'Coffee Chat';
      reward?: string;
      description?: string;
      location?: string;
      status?: 'Open' | 'Closed';
    }
  ) => {
    try {
      const updated = await apiUpdateBounty(id, data);
      setBounties(prev => prev.map(b => (b.id === id ? updated : b)));
      return updated;
    } catch (err: any) {
      setError(err.message || '更新失败');
      throw err;
    }
  };

  // 删除赏金
  const deleteBounty = async (id: string) => {
    try {
      await apiDeleteBounty(id);
      setBounties(prev => prev.filter(b => b.id !== id));
    } catch (err: any) {
      setError(err.message || '删除失败');
      throw err;
    }
  };

  // 关闭赏金
  const closeBounty = async (id: string) => {
    try {
      const updated = await apiCloseBounty(id);
      setBounties(prev => prev.map(b => (b.id === id ? updated : b)));
      return updated;
    } catch (err: any) {
      setError(err.message || '操作失败');
      throw err;
    }
  };

  // 重新开放赏金
  const reopenBounty = async (id: string) => {
    try {
      const updated = await apiReopenBounty(id);
      setBounties(prev => prev.map(b => (b.id === id ? updated : b)));
      return updated;
    } catch (err: any) {
      setError(err.message || '操作失败');
      throw err;
    }
  };

  // 初始化加载
  useEffect(() => {
    loadBounties();
  }, [filters?.status, filters?.type, filters?.requesterId]);

  return {
    bounties,
    loading,
    error,
    createBounty,
    updateBounty,
    deleteBounty,
    closeBounty,
    reopenBounty,
    refresh: loadBounties
  };
}
