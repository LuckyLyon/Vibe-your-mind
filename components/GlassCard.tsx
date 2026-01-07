import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', hoverEffect = false, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        bg-white border-2 border-black 
        shadow-neo rounded-none
        p-6 
        ${hoverEffect ? 'transition-all duration-200 hover:-translate-y-1 hover:shadow-neo-hover cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};