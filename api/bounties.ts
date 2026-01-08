import { supabase } from '../lib/supabase';

/**
 * 赏金任务系统 API
 * 支持任务发布、接受、状态管理
 */

export interface Bounty {
  id: string;
  title: string;
  type: 'Coding' | 'Design' | 'Marketing' | 'Coffee Chat';
  reward: string;
  requester: string;
  requesterId: string;
  description: string;
  status: 'Open' | 'Closed';
  location: string;
  timestamp: number;
}

interface DbBounty {
  id: string;
  title: string;
  type: string;
  reward: string;
  requester_id: string;
  description: string;
  status: string;
  location: string;
  created_at: string;
  profiles: {
    username: string;
  };
}

// 转换数据库格式到前端格式
function mapDbBountyToBounty(dbBounty: DbBounty): Bounty {
  return {
    id: dbBounty.id,
    title: dbBounty.title,
    type: dbBounty.type as any,
    reward: dbBounty.reward,
    requester: dbBounty.profiles.username,
    requesterId: dbBounty.requester_id,
    description: dbBounty.description || '',
    status: dbBounty.status as any,
    location: dbBounty.location,
    timestamp: new Date(dbBounty.created_at).getTime()
  };
}

/**
 * 获取所有赏金任务(支持过滤)
 */
export async function fetchBounties(params?: {
  status?: 'Open' | 'Closed';
  type?: string;
  requesterId?: string;
}): Promise<Bounty[]> {
  try {
    let query = supabase
      .from('bounties')
      .select(`
        *,
        profiles!bounties_requester_id_fkey(username)
      `)
      .order('created_at', { ascending: false });

    // 状态过滤
    if (params?.status) {
      query = query.eq('status', params.status);
    }

    // 类型过滤
    if (params?.type) {
      query = query.eq('type', params.type);
    }

    // 发布者过滤
    if (params?.requesterId) {
      query = query.eq('requester_id', params.requesterId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data.map((item: any) => mapDbBountyToBounty(item));
  } catch (error) {
    console.error('Error fetching bounties:', error);
    throw error;
  }
}

/**
 * 获取单个赏金任务详情
 */
export async function fetchBounty(id: string): Promise<Bounty> {
  try {
    const { data, error } = await supabase
      .from('bounties')
      .select(`
        *,
        profiles!bounties_requester_id_fkey(username)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    return mapDbBountyToBounty(data as any);
  } catch (error) {
    console.error('Error fetching bounty:', error);
    throw error;
  }
}

/**
 * 创建赏金任务
 */
export async function createBounty(data: {
  title: string;
  type: 'Coding' | 'Design' | 'Marketing' | 'Coffee Chat';
  reward: string;
  description: string;
  location?: string;
}): Promise<Bounty> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('用户未登录');

    const { data: newBounty, error } = await supabase
      .from('bounties')
      .insert({
        title: data.title,
        type: data.type,
        reward: data.reward,
        description: data.description,
        location: data.location || 'Remote',
        requester_id: user.id,
        status: 'Open'
      })
      .select(`
        *,
        profiles!bounties_requester_id_fkey(username)
      `)
      .single();

    if (error) throw error;

    return mapDbBountyToBounty(newBounty as any);
  } catch (error) {
    console.error('Error creating bounty:', error);
    throw error;
  }
}

/**
 * 更新赏金任务
 */
export async function updateBounty(
  id: string,
  data: {
    title?: string;
    type?: 'Coding' | 'Design' | 'Marketing' | 'Coffee Chat';
    reward?: string;
    description?: string;
    location?: string;
    status?: 'Open' | 'Closed';
  }
): Promise<Bounty> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('用户未登录');

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.reward !== undefined) updateData.reward = data.reward;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.status !== undefined) updateData.status = data.status;

    const { data: updated, error } = await supabase
      .from('bounties')
      .update(updateData)
      .eq('id', id)
      .eq('requester_id', user.id)
      .select(`
        *,
        profiles!bounties_requester_id_fkey(username)
      `)
      .single();

    if (error) throw error;

    return mapDbBountyToBounty(updated as any);
  } catch (error) {
    console.error('Error updating bounty:', error);
    throw error;
  }
}

/**
 * 删除赏金任务
 */
export async function deleteBounty(id: string): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('用户未登录');

    const { error } = await supabase
      .from('bounties')
      .delete()
      .eq('id', id)
      .eq('requester_id', user.id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting bounty:', error);
    throw error;
  }
}

/**
 * 关闭赏金任务
 */
export async function closeBounty(id: string): Promise<Bounty> {
  return updateBounty(id, { status: 'Closed' });
}

/**
 * 重新开放赏金任务
 */
export async function reopenBounty(id: string): Promise<Bounty> {
  return updateBounty(id, { status: 'Open' });
}
