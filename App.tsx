
import React, { useState } from 'react';
import { PageView, Idea } from './types';
import { useAuth } from './hooks/useAuth';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { Beginners } from './pages/Beginners';
import { IdeaUniverse } from './pages/IdeaUniverse';
import { IdeaDetail } from './pages/IdeaDetail';
import { BountyHunters } from './pages/BountyHunters';
import { Featured } from './pages/Featured';
import { PromptVinyls } from './pages/PromptVinyls';
import { Chat } from './pages/Chat';
import { AuthModal } from './components/AuthModal';
import { ChatWidget } from './components/ChatWidget';

const App: React.FC = () => {
  const { currentUser, loading, signOut } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageView>(PageView.HOME);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  
  // Auth State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatTargetUser, setChatTargetUser] = useState<string | null>(null);
  const [chatInitialMessage, setChatInitialMessage] = useState<string | null>(null);

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
            onOpenIdea={handleOpenIdea} 
          />
        );
      case PageView.IDEA_DETAIL:
        return (
          <IdeaDetail 
            ideaId={selectedIdeaId || ''}
            onBack={() => setCurrentPage(PageView.IDEA_UNIVERSE)} 
          />
        );
      case PageView.BOUNTY_HUNTERS:
        return <BountyHunters onContactClick={handleContactUser} />;
      case PageView.CHAT:
        return <Chat />;
      case PageView.FEATURED:
        return <Featured />;
      case PageView.PROMPT_VINYLS:
        return <PromptVinyls />;
      default:
        return <Home setPage={setCurrentPage} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-vibe-yellow flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-black text-xl uppercase">Loading Vibe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vibe-yellow text-vibe-black font-sans selection:bg-black selection:text-vibe-yellow">
      <Header 
        currentPage={currentPage} 
        setPage={setCurrentPage} 
        currentUser={currentUser}
        onLoginClick={() => setIsAuthModalOpen(true)}
        onLogoutClick={signOut}
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
