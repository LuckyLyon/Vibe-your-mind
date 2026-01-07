import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  icon,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-bold transition-all duration-200 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-1 active:shadow-none";
  
  const variants = {
    primary: "bg-black text-white hover:bg-white hover:text-black shadow-neo",
    secondary: "bg-white text-black hover:bg-gray-100 shadow-neo",
    outline: "bg-transparent text-black border-black hover:bg-black hover:text-white",
    ghost: "bg-transparent border-transparent text-black hover:bg-black/5 shadow-none"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm shadow-neo-sm",
    md: "px-6 py-3 text-base shadow-neo",
    lg: "px-10 py-4 text-xl shadow-neo"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};