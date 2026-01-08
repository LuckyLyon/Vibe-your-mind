

import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { X, Fingerprint, Zap, Key, UserPlus, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'register';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { signUp, signIn } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setMode('login');
      setFormData({ email: '', username: '', password: '' });
      setError(null);
      setSuccessMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证输入
    if (mode === 'register') {
      if (!formData.email.trim() || !formData.username.trim() || !formData.password.trim()) {
        setError("请填写所有字段");
        return;
      }
      if (formData.password.length < 6) {
        setError("密码长度至少 6 位");
        return;
      }
    } else {
      if (!formData.email.trim() || !formData.password.trim()) {
        setError("请输入邮箱和密码");
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      if (mode === 'register') {
        await signUp(formData.email, formData.password, formData.username);
        setSuccessMessage("注册成功!请检查邮箱验证链接。");
        setTimeout(() => {
          setMode('login');
          setSuccessMessage(null);
        }, 3000);
      } else {
        await signIn(formData.email, formData.password);
        onClose();
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || '操作失败,请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-vibe-yellow w-full max-w-md border-4 border-black shadow-neo relative overflow-hidden" onClick={e => e.stopPropagation()}>
        
        {/* Decorative background text */}
        <div className="absolute -right-10 -top-10 text-9xl font-black text-black/10 select-none pointer-events-none rotate-12">
          {mode === 'login' ? 'IN' : 'UP'}
        </div>

        {/* Header */}
        <div className="p-4 border-b-4 border-black bg-white flex justify-between items-center relative z-10">
          <h2 className="text-2xl font-black uppercase flex items-center gap-2">
            <Fingerprint className="w-6 h-6" /> 身份认证
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-black hover:text-white transition-colors border-2 border-transparent hover:border-black">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b-4 border-black font-black text-lg relative z-10">
            <button 
                onClick={() => setMode('login')}
                className={`flex-1 py-3 uppercase flex items-center justify-center gap-2 transition-colors ${mode === 'login' ? 'bg-vibe-yellow text-black' : 'bg-gray-100 text-gray-400 hover:bg-white hover:text-black'}`}
            >
                <LogIn className="w-4 h-4" /> 登录
            </button>
            <button 
                onClick={() => setMode('register')}
                className={`flex-1 py-3 uppercase flex items-center justify-center gap-2 transition-colors border-l-4 border-black ${mode === 'register' ? 'bg-vibe-yellow text-black' : 'bg-gray-100 text-gray-400 hover:bg-white hover:text-black'}`}
            >
                <UserPlus className="w-4 h-4" /> 注册
            </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 relative z-10 bg-white">
           <div className="mb-6 text-center">
             <div className="w-16 h-16 bg-black mx-auto mb-4 flex items-center justify-center border-4 border-white shadow-neo">
                <Zap className="w-8 h-8 text-vibe-yellow fill-vibe-yellow" />
             </div>
             <p className="font-bold text-lg">
               {mode === 'login' ? '欢迎回来，Viber。' : '创建你的数字身份。'}
             </p>
           </div>

           {error && (
               <div className="mb-4 bg-red-100 border-2 border-black p-3 flex items-start gap-2 animate-in slide-in-from-top-2">
                   <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                   <p className="text-sm font-bold text-red-600 leading-tight">{error}</p>
               </div>
           )}

           {successMessage && (
               <div className="mb-4 bg-green-100 border-2 border-black p-3 flex items-start gap-2 animate-in slide-in-from-top-2">
                   <Zap className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                   <p className="text-sm font-bold text-green-600 leading-tight">{successMessage}</p>
               </div>
           )}

           <div className="space-y-4">
             <div>
               <label className="block font-black uppercase text-sm mb-1">邮箱 (Email)</label>
               <input 
                 autoFocus
                 type="email" 
                 name="email"
                 value={formData.email}
                 onChange={handleInputChange}
                 className="w-full border-4 border-black p-3 font-bold text-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 bg-gray-50 placeholder-gray-400"
                 placeholder="your@email.com"
               />
             </div>

             {mode === 'register' && (
               <div>
                 <label className="block font-black uppercase text-sm mb-1">代号 (Username)</label>
                 <input 
                   type="text" 
                   name="username"
                   value={formData.username}
                   onChange={handleInputChange}
                   className="w-full border-4 border-black p-3 font-bold text-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 bg-gray-50 placeholder-gray-400"
                   placeholder="例如: Neo_Coder"
                 />
               </div>
             )}
             
             <div>
               <label className="block font-black uppercase text-sm mb-1">密钥 (Password)</label>
               <div className="relative">
                   <input 
                     type="password" 
                     name="password"
                     value={formData.password}
                     onChange={handleInputChange}
                     className="w-full border-4 border-black p-3 font-bold text-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 bg-gray-50 placeholder-gray-400 pr-10"
                     placeholder="******"
                   />
                   <Key className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
               </div>
             </div>

             <Button 
               type="submit" 
               className="w-full bg-black text-white hover:bg-vibe-yellow hover:text-black border-4 text-xl py-4 mt-2"
               disabled={isLoading}
             >
               {isLoading ? '处理中...' : (mode === 'login' ? '接入系统' : '确认注册')}
             </Button>
             
             {mode === 'login' && (
                 <p className="text-center text-xs font-bold text-gray-400 mt-2">
                     忘记密钥? 请联系管理员。
                 </p>
             )}
           </div>
        </form>
      </div>
    </div>
  );
};

