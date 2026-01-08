import { supabase } from '../lib/supabase';
import { ChatMessage, ChatChannel } from '../types';

/**
 * 实时聊天 API
 * 使用 Supabase Realtime 实现秒级消息推送
 */

// 获取所有聊天频道
export async function fetchChannels(): Promise<ChatChannel[]> {
  try {
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;

    return data.map(channel => ({
      id: channel.id,
      name: channel.name,
      type: channel.type as 'public' | 'group' | 'dm' | 'ai',
      description: channel.description,
      unreadCount: 0 // 需要额外计算
    }));
  } catch (error) {
    console.error('Error fetching channels:', error);
    throw error;
  }
}

// 获取频道的历史消息(分页)
export async function fetchMessages(
  channelId: string,
  limit: number = 50,
  before?: string // 消息 ID,用于加载更早的消息
): Promise<ChatMessage[]> {
  try {
    let query = supabase
      .from('messages')
      .select('*')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (before) {
      // 加载指定消息之前的消息
      const { data: beforeMessage } = await supabase
        .from('messages')
        .select('created_at')
        .eq('id', before)
        .single();

      if (beforeMessage) {
        query = query.lt('created_at', beforeMessage.created_at);
      }
    }

    const { data, error } = await query;

    if (error) throw error;

    // 反转顺序使最新消息在底部
    return data.reverse().map(msg => ({
      id: msg.id,
      senderId: msg.sender_id,
      senderName: msg.sender_name,
      content: msg.content,
      timestamp: new Date(msg.created_at).getTime(),
      isSystem: msg.is_system || false,
      isBot: msg.is_bot || false
    }));
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
}

// 发送消息
export async function sendMessage(
  channelId: string,
  content: string,
  isBot: boolean = false
): Promise<ChatMessage> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('用户未登录');

    // 获取用户名
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single();

    const { data, error } = await supabase
      .from('messages')
      .insert({
        channel_id: channelId,
        sender_id: user.id,
        sender_name: profile?.username || 'Anonymous',
        content: content.trim(),
        is_bot: isBot,
        is_system: false
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      senderId: data.sender_id,
      senderName: data.sender_name,
      content: data.content,
      timestamp: new Date(data.created_at).getTime(),
      isBot: data.is_bot,
      isSystem: data.is_system
    };
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

// 发送系统消息(不需要登录)
export async function sendSystemMessage(
  channelId: string,
  content: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('messages')
      .insert({
        channel_id: channelId,
        sender_id: null,
        sender_name: 'System',
        content,
        is_system: true,
        is_bot: false
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error sending system message:', error);
    throw error;
  }
}

// 订阅频道的实时消息
export function subscribeToChannel(
  channelId: string,
  onMessage: (message: ChatMessage) => void,
  onError?: (error: Error) => void
) {
  const channel = supabase
    .channel(`messages:${channelId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `channel_id=eq.${channelId}`
      },
      (payload: any) => {
        const newMessage: ChatMessage = {
          id: payload.new.id,
          senderId: payload.new.sender_id,
          senderName: payload.new.sender_name,
          content: payload.new.content,
          timestamp: new Date(payload.new.created_at).getTime(),
          isBot: payload.new.is_bot || false,
          isSystem: payload.new.is_system || false
        };
        onMessage(newMessage);
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`Subscribed to channel ${channelId}`);
      } else if (status === 'CHANNEL_ERROR') {
        onError?.(new Error('Failed to subscribe to channel'));
      }
    });

  return () => {
    channel.unsubscribe();
  };
}

// 订阅在线状态(Presence API)
export function subscribeToPresence(
  channelId: string,
  onPresenceChange: (users: Array<{ userId: string; username: string }>) => void
) {
  const channel = supabase.channel(`presence:${channelId}`, {
    config: {
      presence: {
        key: 'user_id'
      }
    }
  });

  channel
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const users = Object.values(state).map((presence: any) => ({
        userId: presence[0].user_id,
        username: presence[0].username
      }));
      onPresenceChange(users);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', user.id)
            .single();

          channel.track({
            user_id: user.id,
            username: profile?.username || 'Anonymous',
            online_at: new Date().toISOString()
          });
        }
      }
    });

  return () => {
    channel.unsubscribe();
  };
}

// 删除消息(仅发送者可删除)
export async function deleteMessage(messageId: string): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('用户未登录');

    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)
      .eq('sender_id', user.id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
}
