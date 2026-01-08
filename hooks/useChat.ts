import { useState, useEffect, useRef } from 'react';
import { ChatMessage, ChatChannel } from '../types';
import {
  fetchChannels,
  fetchMessages,
  sendMessage as apiSendMessage,
  subscribeToChannel,
  subscribeToPresence
} from '../api/chat';

/**
 * 聊天 Hook
 * 管理频道、消息、实时订阅和在线用户
 */
export function useChat(initialChannelId?: string) {
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [currentChannelId, setCurrentChannelId] = useState<string | null>(initialChannelId || null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Array<{ userId: string; username: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const presenceUnsubscribeRef = useRef<(() => void) | null>(null);

  // 加载频道列表
  const loadChannels = async () => {
    try {
      const data = await fetchChannels();
      setChannels(data);
      
      // 如果没有选中的频道且有可用频道,选择第一个
      if (!currentChannelId && data.length > 0) {
        setCurrentChannelId(data[0].id);
      }
    } catch (err: any) {
      setError(err.message || '加载频道失败');
      console.error('Load channels error:', err);
    }
  };

  // 加载消息
  const loadMessages = async (channelId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchMessages(channelId, 50);
      setMessages(data);
    } catch (err: any) {
      setError(err.message || '加载消息失败');
      console.error('Load messages error:', err);
    } finally {
      setLoading(false);
    }
  };

  // 发送消息
  const sendMessage = async (content: string) => {
    if (!currentChannelId || !content.trim()) return;

    try {
      setSending(true);
      await apiSendMessage(currentChannelId, content);
      // 消息会通过实时订阅自动添加到列表
    } catch (err: any) {
      setError(err.message || '发送消息失败');
      throw err;
    } finally {
      setSending(false);
    }
  };

  // 切换频道
  const switchChannel = (channelId: string) => {
    setCurrentChannelId(channelId);
  };

  // 初始化加载频道
  useEffect(() => {
    loadChannels();
  }, []);

  // 加载消息并订阅实时更新
  useEffect(() => {
    if (!currentChannelId) return;

    // 清理之前的订阅
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    if (presenceUnsubscribeRef.current) {
      presenceUnsubscribeRef.current();
      presenceUnsubscribeRef.current = null;
    }

    // 加载历史消息
    loadMessages(currentChannelId);

    // 订阅实时消息
    unsubscribeRef.current = subscribeToChannel(
      currentChannelId,
      (newMessage) => {
        setMessages(prev => {
          // 避免重复消息
          if (prev.some(msg => msg.id === newMessage.id)) {
            return prev;
          }
          return [...prev, newMessage];
        });
      },
      (err) => {
        console.error('Subscription error:', err);
        setError('实时连接失败');
      }
    );

    // 订阅在线用户
    presenceUnsubscribeRef.current = subscribeToPresence(
      currentChannelId,
      (users) => {
        setOnlineUsers(users);
      }
    );

    // 清理订阅
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      if (presenceUnsubscribeRef.current) {
        presenceUnsubscribeRef.current();
      }
    };
  }, [currentChannelId]);

  return {
    channels,
    currentChannelId,
    messages,
    onlineUsers,
    loading,
    error,
    sending,
    sendMessage,
    switchChannel,
    refreshChannels: loadChannels
  };
}
