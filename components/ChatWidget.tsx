
import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, User as UserIcon, Bot, ChevronLeft, Hash, Plus, Users, Zap } from 'lucide-react';
import { User, ChatMessage, ChatChannel } from '../types';
import { Button } from './Button';
import { chatWithVibeBot } from '../services/geminiService';

interface ChatWidgetProps {
  currentUser: User | null;
  onLoginRequest: () => void;
  isOpen: boolean;
  onToggle: (isOpen: boolean) => void;
  targetUser?: string | null;
  initialMessage?: string | null;
  onClearTarget?: () => void;
}

// Mock initial channels
const initialChannels: ChatChannel[] = [
    { id: 'global', name: 'global-vibe', type: 'public', description: '全局灌水 & 摸鱼' },
    { id: 'frontend', name: 'frontend-gods', type: 'public', description: 'React, Vue, CSS 魔法' },
    { id: 'ideas', name: 'idea-storm', type: 'public', description: '脑洞风暴' },
    { id: 'bot-dm', name: 'VibeBot 私聊', type: 'ai', description: '你的私人 AI 助手' },
    { id: 'dm-1', name: 'CodeNinja', type: 'dm', unreadCount: 2 },
];

const initialMessages: Record<string, ChatMessage[]> = {
    'global': [
        { id: '1', senderId: 'system', senderName: 'System', content: '欢迎接入 Vibe Stream 全局频道。', timestamp: Date.now() - 100000, isSystem: true },
        { id: '2', senderId: 'u1', senderName: 'CodeNinja', content: '有人在做 Gemini 的视频生成项目吗？', timestamp: Date.now() - 50000 },
    ],
    'frontend': [
        { id: 'f1', senderId: 'u2', senderName: 'CSS_Master', content: 'Tailwind 4.0 真的太强了。', timestamp: Date.now() - 20000 },
    ],
    'bot-dm': [
        { id: 'b1', senderId: 'bot', senderName: 'VibeBot', content: 'Beep Boop. 这里只有我们两个。有些悄悄话可以在这里问我。', timestamp: Date.now(), isBot: true }
    ],
    'dm-1': [
        { id: 'd1', senderId: 'u1', senderName: 'CodeNinja', content: '嘿，看到你在 Idea 宇宙发布的那个项目了，有空聊聊吗？', timestamp: Date.now() - 300000 },
    ]
};

export const ChatWidget: React.FC<ChatWidgetProps> = ({ currentUser, onLoginRequest, isOpen, onToggle, targetUser, initialMessage, onClearTarget }) => {
  // Removed internal isOpen state
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [channels, setChannels] = useState<ChatChannel[]>(initialChannels);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(initialMessages);
  const [inputText, setInputText] = useState('');
  const [isBotThinking, setIsBotThinking] = useState(false);
  
  // Ref for scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && activeChannelId) scrollToBottom();
  }, [messages, isOpen, activeChannelId]);

  // Handle Target User (Deep Link)
  useEffect(() => {
    if (targetUser && isOpen) {
        // 1. Check if we already have a DM channel with this user
        let channelIdToUse = '';
        const existingChannel = channels.find(c => c.name === targetUser && c.type === 'dm');
        
        if (existingChannel) {
            channelIdToUse = existingChannel.id;
        } else {
            // 2. Create new DM channel
            channelIdToUse = `dm-${Date.now()}`;
            const newChannel: ChatChannel = {
                id: channelIdToUse,
                name: targetUser,
                type: 'dm',
                unreadCount: 0
            };
            
            setChannels(prev => [...prev, newChannel]);
            setMessages(prev => ({
                ...prev,
                [channelIdToUse]: [
                    {
                        id: 'system-start',
                        senderId: 'system',
                        senderName: 'System',
                        content: `开始与 ${targetUser} 的加密会话。`,
                        timestamp: Date.now(),
                        isSystem: true
                    }
                ]
            }));
        }

        // 3. Handle Initial Message (Auto-send)
        if (initialMessage) {
            if (currentUser) {
                 // Add message directly to history
                 const autoMsg: ChatMessage = {
                    id: `msg-${Date.now()}`,
                    senderId: currentUser.id,
                    senderName: currentUser.username,
                    content: initialMessage,
                    timestamp: Date.now()
                 };
                 setMessages(prev => ({
                    ...prev,
                    [channelIdToUse]: [...(prev[channelIdToUse] || []), autoMsg]
                 }));
            } else {
                // If not logged in, put in input box
                setInputText(initialMessage);
            }
        }

        setActiveChannelId(channelIdToUse);

        // Clear target so we don't reset if user navigates manually later
        if (onClearTarget) onClearTarget();
    }
  }, [targetUser, isOpen]); 
  // IMPORTANT: Removed other dependencies to prevent infinite loop or stale closures issues, 
  // relying on `targetUser` changing to trigger this flow.

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || !activeChannelId) return;

    if (!currentUser) {
      onLoginRequest();
      return;
    }

    const currentChannel = channels.find(c => c.id === activeChannelId);

    // 1. Add User Message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      senderName: currentUser.username,
      content: inputText,
      timestamp: Date.now()
    };

    setMessages(prev => ({
        ...prev,
        [activeChannelId]: [...(prev[activeChannelId] || []), userMsg]
    }));

    const messageContent = inputText;
    setInputText('');

    // 2. Bot Processing Logic (Only in AI Channel)
    if (currentChannel?.type === 'ai') {
        setIsBotThinking(true);
        const botResponseText = await chatWithVibeBot(messageContent);
        
        const botMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            senderId: 'bot',
            senderName: 'VibeBot',
            content: botResponseText,
            timestamp: Date.now(),
            isBot: true
        };

        // Add Bot Message
        setMessages(prev => ({
            ...prev,
            [activeChannelId]: [...(prev[activeChannelId] || []), botMsg]
        }));
        setIsBotThinking(false);
    }
  };

  const getChannelIcon = (type: string) => {
      switch(type) {
          case 'public': return <Hash className="w-4 h-4" />;
          case 'ai': return <Bot className="w-4 h-4" />;
          case 'dm': return <Users className="w-4 h-4" />;
          default: return <Hash className="w-4 h-4" />;
      }
  };

  const activeChannel = channels.find(c => c.id === activeChannelId);

  return (
    <>
      {/* Toggle Button */}
      <button 
        onClick={() => onToggle(!isOpen)}
        className={`fixed bottom-6 right-6 z-40 p-4 border-4 border-black shadow-neo hover:shadow-neo-hover transition-all duration-300 rounded-full flex items-center justify-center group ${isOpen ? 'bg-white text-black rotate-90' : 'bg-vibe-yellow text-black'}`}
      >
        {isOpen ? <X className="w-8 h-8" /> : <MessageSquare className="w-8 h-8 group-hover:scale-110 transition-transform" />}
        {!isOpen && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-black px-2 py-1 border-2 border-black rounded-full animate-bounce">
                LIVE
            </span>
        )}
      </button>

      {/* Chat Drawer */}
      <div className={`fixed bottom-24 right-6 w-[90vw] md:w-[400px] h-[600px] bg-white border-4 border-black shadow-neo z-40 flex flex-col transition-all duration-300 origin-bottom-right overflow-hidden ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
        
        {/* VIEW 1: Channel List (Show if no active channel) */}
        {!activeChannelId && (
            <div className="flex flex-col h-full animate-in slide-in-from-left duration-300">
                <div className="bg-black text-vibe-yellow p-4 border-b-4 border-black flex justify-between items-center">
                    <h3 className="font-black text-xl uppercase tracking-wider flex items-center gap-2">
                        <Zap className="w-5 h-5 fill-current" />
                        Vibe Channels
                    </h3>
                    <button className="bg-white/10 p-1.5 rounded hover:bg-white/20">
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-6">
                    {/* Public Channels */}
                    <div>
                        <h4 className="font-bold text-xs uppercase text-gray-500 mb-2 px-2">Public Rooms</h4>
                        <div className="space-y-2">
                            {channels.filter(c => c.type === 'public').map(channel => (
                                <button 
                                    key={channel.id}
                                    onClick={() => setActiveChannelId(channel.id)}
                                    className="w-full text-left p-3 border-2 border-black bg-white shadow-neo-sm hover:translate-x-1 hover:bg-yellow-50 transition-all flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="bg-black text-white p-1.5">
                                            <Hash className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="font-black text-sm">#{channel.name}</div>
                                            <div className="text-xs text-gray-500">{channel.description}</div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* AI & DMs */}
                    <div>
                        <h4 className="font-bold text-xs uppercase text-gray-500 mb-2 px-2">Direct Messages</h4>
                        <div className="space-y-2">
                             {channels.filter(c => c.type === 'ai' || c.type === 'dm').map(channel => (
                                <button 
                                    key={channel.id}
                                    onClick={() => setActiveChannelId(channel.id)}
                                    className={`w-full text-left p-3 border-2 border-black shadow-neo-sm hover:translate-x-1 transition-all flex items-center justify-between ${channel.type === 'ai' ? 'bg-purple-100' : 'bg-white'}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className={`p-1.5 border border-black ${channel.type === 'ai' ? 'bg-purple-500 text-white' : 'bg-gray-200'}`}>
                                            {channel.type === 'ai' ? <Bot className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                                        </div>
                                        <div className="font-black text-sm">{channel.name}</div>
                                    </div>
                                    {channel.unreadCount && (
                                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full border border-black">
                                            {channel.unreadCount}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* VIEW 2: Active Chat Room */}
        {activeChannel && (
            <div className="flex flex-col h-full animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className={`p-3 border-b-4 border-black flex justify-between items-center ${activeChannel.type === 'ai' ? 'bg-purple-500 text-white' : 'bg-vibe-yellow text-black'}`}>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setActiveChannelId(null)} className="hover:bg-black/10 p-1 rounded transition-colors">
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <h3 className="font-black text-lg uppercase tracking-wider flex items-center gap-2 leading-none">
                                {getChannelIcon(activeChannel.type)}
                                {activeChannel.name}
                            </h3>
                            {isBotThinking && activeChannel.type === 'ai' && (
                                <span className="text-[10px] font-bold bg-black text-yellow-400 px-1.5 py-0.5 inline-block mt-1 animate-pulse">
                                    THINKING...
                                </span>
                            )}
                        </div>
                    </div>
                    {/* Status Indicator */}
                    <div className="w-3 h-3 bg-green-400 rounded-full border border-black animate-pulse"></div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 relative">
                    {/* Watermark for AI Channel */}
                    {activeChannel.type === 'ai' && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                            <Bot className="w-48 h-48" />
                        </div>
                    )}

                    {(messages[activeChannel.id] || []).length === 0 ? (
                        <div className="text-center text-gray-400 py-10">
                            <p className="text-sm font-bold">频道已创建。开始聊天吧！</p>
                        </div>
                    ) : (
                        (messages[activeChannel.id] || []).map((msg) => {
                            const isMe = currentUser && msg.senderId === currentUser.id;
                            return (
                                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                    <div className="flex items-end gap-2 max-w-[85%]">
                                        {!isMe && (
                                            <div className={`w-8 h-8 border-2 border-black flex items-center justify-center shrink-0 ${msg.isBot ? 'bg-purple-500 text-white' : 'bg-white'}`}>
                                                {msg.isBot ? <Bot className="w-5 h-5"/> : msg.senderName[0].toUpperCase()}
                                            </div>
                                        )}
                                        
                                        <div className={`
                                            p-3 border-2 border-black shadow-neo-sm relative text-sm font-medium
                                            ${isMe ? 'bg-vibe-yellow text-black' : msg.isSystem ? 'bg-gray-200 text-gray-600 text-xs w-full text-center border-dashed' : msg.isBot ? 'bg-black text-white' : 'bg-white text-black'}
                                        `}>
                                            {!isMe && !msg.isSystem && (
                                                <div className={`text-[10px] font-black mb-1 opacity-70 ${msg.isBot ? 'text-vibe-yellow' : 'text-gray-500'}`}>
                                                    {msg.senderName}
                                                </div>
                                            )}
                                            {msg.content}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-3 border-t-4 border-black bg-white">
                    {!currentUser ? (
                        <div className="text-center py-2">
                            <Button size="sm" onClick={onLoginRequest} className="w-full">立即登录以发言</Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                            <input 
                                className="flex-1 border-2 border-black p-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-vibe-yellow bg-gray-50"
                                placeholder={activeChannel.type === 'ai' ? "问我任何事..." : "发送消息..."}
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                            />
                            <button 
                                type="submit"
                                disabled={!inputText.trim()}
                                className="p-2 border-2 border-black bg-black text-white hover:bg-vibe-yellow hover:text-black transition-colors disabled:opacity-50"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    )}
                </div>
            </div>
        )}

      </div>
    </>
  );
};
