import { useState, useEffect, useCallback } from 'react';
import { Idea } from '../types';
import { 
  fetchIdeas, 
  fetchIdeaById, 
  createIdea, 
  updateIdea, 
  deleteIdea, 
  toggleIdeaLike,
  checkUserLiked,
  FetchIdeasParams,
  CreateIdeaData,
  UpdateIdeaData
} from '../api/ideas';

interface UseIdeasReturn {
  ideas: Idea[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  hasMore: boolean;
  loadIdeas: (params?: FetchIdeasParams) => Promise<void>;
  loadMore: () => Promise<void>;
  createNewIdea: (data: CreateIdeaData) => Promise<Idea>;
  updateExistingIdea: (id: string, data: UpdateIdeaData) => Promise<Idea>;
  deleteExistingIdea: (id: string) => Promise<void>;
  toggleLike: (ideaId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export const useIdeas = (initialParams?: FetchIdeasParams): UseIdeasReturn => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [params, setParams] = useState<FetchIdeasParams>(initialParams || {});

  const limit = params.limit || 12;
  const hasMore = ideas.length < total;

  const loadIdeas = useCallback(async (newParams?: FetchIdeasParams) => {
    setLoading(true);
    setError(null);
    
    try {
      const mergedParams = { ...params, ...newParams, page: 1 };
      setParams(mergedParams);
      
      const result = await fetchIdeas(mergedParams);
      setIdeas(result.ideas);
      setTotal(result.total);
      setPage(1);
    } catch (err: any) {
      console.error('Load ideas error:', err);
      setError(err.message || '加载失败');
    } finally {
      setLoading(false);
    }
  }, [params]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const nextPage = page + 1;
      const result = await fetchIdeas({ ...params, page: nextPage });
      setIdeas(prev => [...prev, ...result.ideas]);
      setPage(nextPage);
    } catch (err: any) {
      console.error('Load more error:', err);
      setError(err.message || '加载失败');
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, params]);

  const createNewIdea = useCallback(async (data: CreateIdeaData): Promise<Idea> => {
    try {
      const newIdea = await createIdea(data);
      setIdeas(prev => [newIdea, ...prev]);
      setTotal(prev => prev + 1);
      return newIdea;
    } catch (err: any) {
      console.error('Create idea error:', err);
      throw err;
    }
  }, []);

  const updateExistingIdea = useCallback(async (id: string, data: UpdateIdeaData): Promise<Idea> => {
    try {
      const updatedIdea = await updateIdea(id, data);
      setIdeas(prev => prev.map(idea => idea.id === id ? updatedIdea : idea));
      return updatedIdea;
    } catch (err: any) {
      console.error('Update idea error:', err);
      throw err;
    }
  }, []);

  const deleteExistingIdea = useCallback(async (id: string): Promise<void> => {
    try {
      await deleteIdea(id);
      setIdeas(prev => prev.filter(idea => idea.id !== id));
      setTotal(prev => prev - 1);
    } catch (err: any) {
      console.error('Delete idea error:', err);
      throw err;
    }
  }, []);

  const toggleLike = useCallback(async (ideaId: string): Promise<void> => {
    try {
      const result = await toggleIdeaLike(ideaId);
      setIdeas(prev => prev.map(idea => 
        idea.id === ideaId 
          ? { ...idea, likes: result.likesCount }
          : idea
      ));
    } catch (err: any) {
      console.error('Toggle like error:', err);
      throw err;
    }
  }, []);

  const refresh = useCallback(async () => {
    await loadIdeas(params);
  }, [loadIdeas, params]);

  // 初始加载
  useEffect(() => {
    loadIdeas();
  }, []); // 只在挂载时执行一次

  return {
    ideas,
    loading,
    error,
    total,
    page,
    hasMore,
    loadIdeas,
    loadMore,
    createNewIdea,
    updateExistingIdea,
    deleteExistingIdea,
    toggleLike,
    refresh
  };
};

// 获取单个 Idea 的 Hook
interface UseIdeaReturn {
  idea: Idea | null;
  loading: boolean;
  error: string | null;
  userLiked: boolean;
  toggleLike: () => Promise<void>;
  updateIdea: (data: UpdateIdeaData) => Promise<void>;
  deleteIdea: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const useIdea = (ideaId: string): UseIdeaReturn => {
  const [idea, setIdea] = useState<Idea | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLiked, setUserLiked] = useState(false);

  const loadIdea = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [ideaData, liked] = await Promise.all([
        fetchIdeaById(ideaId),
        checkUserLiked(ideaId)
      ]);

      if (!ideaData) {
        throw new Error('创意不存在');
      }

      setIdea(ideaData);
      setUserLiked(liked);
    } catch (err: any) {
      console.error('Load idea error:', err);
      setError(err.message || '加载失败');
    } finally {
      setLoading(false);
    }
  }, [ideaId]);

  const handleToggleLike = useCallback(async () => {
    if (!idea) return;

    try {
      const result = await toggleIdeaLike(ideaId);
      setIdea(prev => prev ? { ...prev, likes: result.likesCount } : null);
      setUserLiked(result.liked);
    } catch (err: any) {
      console.error('Toggle like error:', err);
      throw err;
    }
  }, [ideaId, idea]);

  const handleUpdateIdea = useCallback(async (data: UpdateIdeaData) => {
    if (!idea) return;

    try {
      const updatedIdea = await updateIdea(ideaId, data);
      setIdea(updatedIdea);
    } catch (err: any) {
      console.error('Update idea error:', err);
      throw err;
    }
  }, [ideaId, idea]);

  const handleDeleteIdea = useCallback(async () => {
    if (!idea) return;

    try {
      await deleteIdea(ideaId);
      setIdea(null);
    } catch (err: any) {
      console.error('Delete idea error:', err);
      throw err;
    }
  }, [ideaId, idea]);

  const refresh = useCallback(async () => {
    await loadIdea();
  }, [loadIdea]);

  useEffect(() => {
    loadIdea();
  }, [loadIdea]);

  return {
    idea,
    loading,
    error,
    userLiked,
    toggleLike: handleToggleLike,
    updateIdea: handleUpdateIdea,
    deleteIdea: handleDeleteIdea,
    refresh
  };
};
