
import React, { useState } from 'react';
import { PageView, User } from '../types';
import { Menu, X, Zap, Disc, LogIn, User as UserIcon, LogOut } from 'lucide-react';

interface HeaderProps {
  currentPage: PageView;
  setPage: (page: PageView) => void;
  currentUser: User | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPage, setPage, currentUser, onLoginClick, onLogoutClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const navItems = [
    { id: PageView.HOME, label: '首页' },
    { id: PageView.BEGINNERS, label: '小白入门' },
    { id: PageView.IDEA_UNIVERSE, label: 'Idea 宇宙' },
    { id: PageView.PROMPT_VINYLS, label: '提示词黑胶', icon: <Disc className="w-4 h-4 mr-1 inline" /> },
    { id: PageView.BOUNTY_HUNTERS, label: '赏金猎人' },
    { id: PageView.FEATURED, label: '精品项目' },
  ];

  const handleNavClick = (page: PageView) => {
    setPage(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-vibe-yellow border-b-4 border-black">
      <div className="max-w-7xl mx-auto flex h-20 items-center justify-between px-6 relative z-30 bg-vibe-yellow">
        {/* Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer group select-none" 
          onClick={() => setPage(PageView.HOME)}
        >
          <div className="p-2 border-2 border-black bg-black text-vibe-yellow group-hover:bg-white group-hover:text-black transition-colors">
            <Zap className="h-6 w-6 fill-current" />
          </div>
          <span className="font-black text-2xl tracking-tighter uppercase italic hidden sm:inline">
            Vibe<span className="text-white text-shadow-sm px-1 bg-black ml-1">Your Mind</span>
          </span>
          <span className="font-black text-2xl tracking-tighter uppercase italic sm:hidden">VYM</span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex gap-2 xl:gap-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`px-3 py-2 font-bold text-base xl:text-lg border-2 border-transparent hover:border-black hover:bg-white transition-all flex items-center ${
                currentPage === item.id 
                  ? 'bg-black text-white border-black shadow-neo-sm' 
                  : 'text-black'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right Side: Auth & Mobile Menu */}
        <div className="flex items-center gap-3">
            
            {/* User Profile / Login */}
            {currentUser ? (
                <div className="relative">
                    <button 
                        onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                        className="flex items-center gap-2 border-2 border-black bg-white px-3 py-1.5 shadow-neo-sm hover:translate-y-0.5 hover:shadow-none transition-all"
                    >
                        <div className="w-6 h-6 bg-black text-white flex items-center justify-center font-black text-xs">
                            {currentUser.username[0].toUpperCase()}
                        </div>
                        <span className="font-bold hidden md:inline max-w-[100px] truncate">{currentUser.username}</span>
                    </button>
                    
                    {/* Dropdown */}
                    {profileMenuOpen && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white border-4 border-black shadow-neo z-50">
                            <div className="p-3 border-b-2 border-black bg-gray-50">
                                <p className="text-xs font-bold text-gray-500 uppercase">Signed in as</p>
                                <p className="font-black truncate">{currentUser.username}</p>
                            </div>
                            <button className="w-full text-left px-4 py-3 hover:bg-vibe-yellow font-bold flex items-center gap-2 border-b-2 border-black">
                                <UserIcon className="w-4 h-4" /> 个人资料
                            </button>
                            <button 
                                onClick={() => {
                                    onLogoutClick();
                                    setProfileMenuOpen(false);
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-red-500 hover:text-white font-bold flex items-center gap-2 text-red-600"
                            >
                                <LogOut className="w-4 h-4" /> 退出登录
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <button 
                    onClick={onLoginClick}
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white font-bold border-2 border-black hover:bg-white hover:text-black transition-colors shadow-neo-sm"
                >
                    <LogIn className="w-4 h-4" />
                    <span className="hidden md:inline">Login / Join</span>
                </button>
            )}

            {/* Mobile Menu Button */}
            <button 
                className="lg:hidden p-2 text-black border-2 border-black bg-white shadow-neo-sm active:translate-y-1 active:shadow-none transition-transform"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      <div 
        className={`lg:hidden absolute top-full left-0 w-full bg-white border-black overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${
          mobileMenuOpen 
            ? 'max-h-[600px] border-b-4 shadow-neo opacity-100' 
            : 'max-h-0 border-b-0 opacity-0'
        }`}
      >
        <div className="px-4 py-6 space-y-4">
          {navItems.map((item, index) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              style={{ 
                transitionDelay: mobileMenuOpen ? `${index * 75}ms` : '0ms',
                transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-20px)',
                opacity: mobileMenuOpen ? 1 : 0
              }}
              className={`block w-full text-left px-4 py-3 font-bold text-lg border-2 border-black shadow-neo-sm transition-all duration-500 ${
                currentPage === item.id 
                  ? 'bg-black text-white translate-x-2' 
                  : 'bg-vibe-yellow text-black hover:translate-x-1 hover:bg-yellow-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
