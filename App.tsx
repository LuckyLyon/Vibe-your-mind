
import React, { useState, useEffect } from 'react';
import { PageView, Idea, User } from './types';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { Beginners } from './pages/Beginners';
import { IdeaUniverse } from './pages/IdeaUniverse';
import { IdeaDetail } from './pages/IdeaDetail';
import { BountyHunters } from './pages/BountyHunters';
import { Featured } from './pages/Featured';
import { PromptVinyls } from './pages/PromptVinyls';
import { AuthModal } from './components/AuthModal';
import { ChatWidget } from './components/ChatWidget';

const initialIdeas: Idea[] = [
  {
    id: '1',
    title: 'AI 梦境日志',
    author: 'Alice V.',
    collaborators: ['Dreamer_007'],
    description: '一个醒来后自动记录梦境的 App，通过语音转文字，并使用 Gemini 绘制梦境图像。\n\n**核心功能**：\n- 快速语音输入\n- 梦境解析与图像生成\n- 梦境日历',
    tags: ['AI', 'Mobile', 'Lifestyle'],
    likes: 124,
    hasPrototype: true,
    demoUrl: 'https://github.com',
    status: 'in-progress',
    comments: [
      { id: 'c1', author: 'Dreamer_007', content: '这个想法太棒了！我也想加入开发。', timestamp: Date.now() - 86400000 }
    ]
  },
  {
    id: '2',
    title: 'VibeRadio - 撸码电台',
    author: 'CodeWiz',
    collaborators: [],
    description: '一个 Lo-Fi 电台，根据你的 Github 提交频率自动调整节奏快慢。',
    tags: ['Music', 'DevTools'],
    likes: 89,
    hasPrototype: false,
    status: 'concept',
    comments: []
  }
];

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageView>(PageView.HOME);
  const [ideas, setIdeas] = useState<Idea[]>(initialIdeas);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatTargetUser, setChatTargetUser] = useState<string | null>(null);
  const [chatInitialMessage, setChatInitialMessage] = useState<string | null>(null);

  // Restore session from local storage (mock persistence)
  useEffect(() => {
    const savedUser = localStorage.getItem('vibe_user');
    if (savedUser) {
        try {
            setCurrentUser(JSON.parse(savedUser));
        } catch (e) {
            console.error("Failed to parse user", e);
        }
    }
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('vibe_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('vibe_user');
  };

  const handleOpenIdea = (id: string) => {
    setSelectedIdeaId(id);
    setCurrentPage(PageView.IDEA_DETAIL);
  };

  const handleContactUser = (username: string, initialMessage?: string) => {
    setChatTargetUser(username);
    if (initialMessage) setChatInitialMessage(initialMessage);
    setIsChatOpen(true);
  };

  const renderPage = () => {
    switch (currentPage) {
      case PageView.HOME:
        return <Home setPage={setCurrentPage} />;
      case PageView.BEGINNERS:
        return <Beginners />;
      case PageView.IDEA_UNIVERSE:
        return (
          <IdeaUniverse 
            ideas={ideas} 
            setIdeas={setIdeas} 
            onOpenIdea={handleOpenIdea} 
          />
        );
      case PageView.IDEA_DETAIL:
        const selectedIdea = ideas.find(i => i.id === selectedIdeaId);
        return (
          <IdeaDetail 
            idea={selectedIdea} 
            setIdeas={setIdeas}
            onBack={() => setCurrentPage(PageView.IDEA_UNIVERSE)} 
          />
        );
      case PageView.BOUNTY_HUNTERS:
        return <BountyHunters onContactClick={handleContactUser} />;
      case PageView.FEATURED:
        return <Featured />;
      case PageView.PROMPT_VINYLS:
        return <PromptVinyls />;
      default:
        return <Home setPage={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-vibe-yellow text-vibe-black font-sans selection:bg-black selection:text-vibe-yellow">
      <Header 
        currentPage={currentPage} 
        setPage={setCurrentPage} 
        currentUser={currentUser}
        onLoginClick={() => setIsAuthModalOpen(true)}
        onLogoutClick={handleLogout}
      />
      
      <main className="animate-in fade-in duration-300">
        {renderPage()}
      </main>
      
      <footer className="py-12 text-center text-black font-bold border-t-4 border-black mt-20 bg-white">
        <p className="uppercase tracking-widest">&copy; {new Date().getFullYear()} Vibe Your Mind. Built with Vibe.</p>
      </footer>

      {/* Global Overlays */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onLogin={handleLogin} 
      />
      
      <ChatWidget 
        currentUser={currentUser} 
        onLoginRequest={() => setIsAuthModalOpen(true)} 
        isOpen={isChatOpen}
        onToggle={setIsChatOpen}
        targetUser={chatTargetUser}
        initialMessage={chatInitialMessage}
        onClearTarget={() => {
            setChatTargetUser(null);
            setChatInitialMessage(null);
        }}
      />
    </div>
  );
};

export default App;
