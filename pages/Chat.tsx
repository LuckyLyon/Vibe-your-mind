import React, { useState, useEffect, useRef } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import { useChat } from '../hooks/useChat';
import { Send, Loader2, Users, Bot, AlertCircle, MessageCircle } from 'lucide-react';
import { chatWithVibeBot } from '../lib/deepseek';

export const Chat: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    channels,
    currentChannelId,
    messages,
    onlineUsers,
    loading,
    error,
    sending,
    sendMessage,
    switchChannel
  } = useChat();

  const [messageText, setMessageText] = useState('');
  const [aiProcessing, setAiProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || sending || !currentUser) return;

    const userMessage = messageText.trim();
    setMessageText('');

    try {
      await sendMessage(userMessage);

      // 如果是 AI 频道,触发 AI 回复
      const currentChannel = channels.find(ch => ch.id === currentChannelId);
      if (currentChannel?.type === 'ai') {
        setAiProcessing(true);
        try {
          const aiReply = await chatWithVibeBot(userMessage);
          await sendMessage(`🤖 ${aiReply}`);
        } catch (err) {
          console.error('AI reply error:', err);
        } finally {
          setAiProcessing(false);
        }
      }
    } catch (err: any) {
      alert(err.message || '发送失败');
      setMessageText(userMessage); // 恢复消息
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - timestamp;
    
    // 今天显示时间
    if (diff < 86400000) {
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    }
    // 昨天
    if (diff < 172800000) {
      return '昨天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    }
    // 其他显示日期
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  const currentChannel = channels.find(ch => ch.id === currentChannelId);

  if (!currentUser) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <MessageCircle className="w-24 h-24 mx-auto mb-6 opacity-20" />
        <h2 className="text-3xl font-black uppercase mb-4">请先登录</h2>
        <p className="text-xl font-bold text-gray-600">登录后即可参与聊天</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
        {/* 左侧频道列表 */}
        <div className="md:col-span-1 overflow-y-auto">
          <GlassCard className="p-4 h-full">
            <h3 className="font-black uppercase text-lg mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" /> 频道
            </h3>
            <div className="space-y-2">
              {channels.map(channel => (
                <button
                  key={channel.id}
                  onClick={() => switchChannel(channel.id)}
                  className={`w-full text-left px-4 py-3 font-bold border-2 transition-colors ${
                    currentChannelId === channel.id
                      ? 'bg-vibe-yellow border-black'
                      : 'bg-white border-gray-300 hover:border-black'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {channel.type === 'ai' && <Bot className="w-4 h-4" />}
                    {channel.name}
                  </div>
                  {channel.description && (
                    <div className="text-xs text-gray-500 mt-1">{channel.description}</div>
                  )}
                </button>
              ))}
            </div>

            {/* 在线用户 */}
            {onlineUsers.length > 0 && (
              <div className="mt-6 pt-4 border-t-2 border-gray-300">
                <h4 className="font-black text-sm uppercase mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" /> 在线 ({onlineUsers.length})
                </h4>
                <div className="space-y-1">
                  {onlineUsers.map(user => (
                    <div key={user.userId} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-bold">{user.username}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </GlassCard>
        </div>

        {/* 右侧消息区域 */}
        <div className="md:col-span-3 flex flex-col">
          <GlassCard className="p-6 flex-1 flex flex-col h-full">
            {/* 频道标题 */}
            <div className="border-b-4 border-black pb-4 mb-4">
              <h2 className="text-2xl font-black uppercase flex items-center gap-2">
                {currentChannel?.name || '选择频道'}
              </h2>
              {currentChannel?.description && (
                <p className="text-sm font-bold text-gray-600 mt-1">{currentChannel.description}</p>
              )}
            </div>

            {/* 消息列表 */}
            <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-12 h-12 animate-spin" />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                  <p className="font-bold text-lg">{error}</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageCircle className="w-16 h-16 opacity-20 mb-4" />
                  <p className="font-black text-xl uppercase opacity-50">暂无消息</p>
                  <p className="font-bold text-gray-600 mt-2">发送第一条消息开始聊天!</p>
                </div>
              ) : (
                <>
                  {messages.map(message => {
                    const isMyMessage = message.senderId === currentUser.id;
                    const isSystem = message.isSystem;
                    const isBot = message.isBot;

                    if (isSystem) {
                      return (
                        <div key={message.id} className="text-center">
                          <span className="inline-block px-4 py-1 bg-gray-200 border-2 border-gray-300 text-sm font-bold rounded-full">
                            {message.content}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${isMyMessage ? 'flex-row-reverse' : ''}`}
                      >
                        {/* 头像 */}
                        <div className={`w-10 h-10 flex-shrink-0 flex items-center justify-center font-black border-2 border-black ${
                          isBot ? 'bg-purple-400' : isMyMessage ? 'bg-vibe-yellow' : 'bg-black text-white'
                        }`}>
                          {isBot ? '🤖' : message.senderName.substring(0, 2).toUpperCase()}
                        </div>

                        {/* 消息内容 */}
                        <div className={`flex-1 max-w-2xl ${isMyMessage ? 'items-end' : ''}`}>
                          <div className={`flex items-center gap-2 mb-1 ${isMyMessage ? 'justify-end' : ''}`}>
                            <span className="font-black text-sm">{message.senderName}</span>
                            <span className="text-xs text-gray-400 font-bold">{formatTime(message.timestamp)}</span>
                          </div>
                          <div className={`px-4 py-3 border-2 border-black font-bold ${
                            isMyMessage
                              ? 'bg-vibe-yellow text-black'
                              : isBot
                                ? 'bg-purple-100'
                                : 'bg-white'
                          }`}>
                            {message.content}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {aiProcessing && (
                    <div className="flex gap-3">
                      <div className="w-10 h-10 bg-purple-400 flex items-center justify-center border-2 border-black">
                        🤖
                      </div>
                      <div className="px-4 py-3 bg-purple-100 border-2 border-black">
                        <Loader2 className="w-5 h-5 animate-spin" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* 消息输入框 */}
            <div className="border-t-4 border-black pt-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder="输入消息..."
                  className="flex-1 border-4 border-black px-4 py-3 font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400"
                  disabled={sending || aiProcessing || !currentChannelId}
                />
                <Button
                  onClick={handleSendMessage}
                  className="bg-black text-white px-6"
                  disabled={!messageText.trim() || sending || aiProcessing || !currentChannelId}
                >
                  {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </Button>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
