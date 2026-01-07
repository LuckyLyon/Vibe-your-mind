
import React, { useState } from 'react';
import { Vinyl } from '../types';
import { Button } from '../components/Button';
import { Disc, Copy, Music, Plus, X, Save } from 'lucide-react';

const initialVinyls: Vinyl[] = [
  {
    id: '1',
    title: 'Neo-Brutalist CSS Engine',
    artist: 'StyleMaster_99',
    mood: 'Aggressive / Bold',
    bpm: 120,
    genre: 'Frontend',
    promptContent: '你是一个世界级的前端工程师，擅长 Neo-Brutalist 风格。请为以下组件编写 Tailwind CSS 类：需要粗黑边框（border-4 border-black）、高饱和度背景色、以及硬阴影（box-shadow: 6px 6px 0px 0px black）。不要使用圆角，保持直角或极小圆角。字体使用大写、加粗。',
    price: 'Free',
    coverColor: 'bg-pink-400'
  },
  {
    id: '2',
    title: 'React Hook Refactorer',
    artist: 'CleanCodeJoe',
    mood: 'Chill / Organized',
    bpm: 85,
    genre: 'Architecture',
    promptContent: '分析这段 React 代码。找出所有过长的 useEffect 依赖项，并建议如何将其拆分为自定义 Hook。保持逻辑的纯净性，并添加详细的 JSDoc 注释。风格要求：简洁、函数式、不可变数据。',
    price: '0.5 VIBE',
    coverColor: 'bg-cyan-400'
  },
  {
    id: '3',
    title: 'DeepSeek Thinking Protocol',
    artist: 'AI_Whisperer',
    mood: 'Deep / Complex',
    bpm: 60,
    genre: 'Creative',
    promptContent: '开启深度思考模式。不要直接给出答案。首先，列出用户问题的三个潜在意图。然后，模拟两个不同观点的专家进行辩论。最后，综合辩论结果，给出一个超越常规的解决方案。输出格式要求结构化，使用 Markdown 表格。',
    price: '2.0 VIBE',
    coverColor: 'bg-purple-400'
  }
];

const genreOptions = ['Frontend', 'Backend', 'Architecture', 'Creative'];
const colorOptions = [
    { label: 'Pink', value: 'bg-pink-400' },
    { label: 'Cyan', value: 'bg-cyan-400' },
    { label: 'Purple', value: 'bg-purple-400' },
    { label: 'Green', value: 'bg-green-400' },
    { label: 'Yellow', value: 'bg-yellow-400' },
    { label: 'Orange', value: 'bg-orange-400' },
];

export const PromptVinyls: React.FC = () => {
  const [vinyls, setVinyls] = useState<Vinyl[]>(initialVinyls);
  const [activeVinylId, setActiveVinylId] = useState<string | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    mood: '',
    bpm: 100,
    genre: 'Frontend',
    promptContent: '',
    price: '',
    coverColor: 'bg-pink-400'
  });

  const toggleVinyl = (id: string) => {
    setActiveVinylId(activeVinylId === id ? null : id);
  };

  const copyPrompt = async (e: React.MouseEvent, content: string) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(content);
      alert('Prompt 已复制到剪贴板！去 Vibe 吧！');
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('复制失败，请尝试手动复制。');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.promptContent) {
        alert("标题和内容是必填项！");
        return;
    }

    const newVinyl: Vinyl = {
      id: Date.now().toString(),
      title: formData.title,
      artist: formData.artist || 'Anonymous',
      mood: formData.mood || 'Neutral',
      bpm: Number(formData.bpm) || 100,
      genre: formData.genre as any,
      promptContent: formData.promptContent,
      price: formData.price || 'Free',
      coverColor: formData.coverColor
    };

    setVinyls([newVinyl, ...vinyls]);
    setIsMinting(false);
    // Reset form
    setFormData({
        title: '',
        artist: '',
        mood: '',
        bpm: 100,
        genre: 'Frontend',
        promptContent: '',
        price: '',
        coverColor: 'bg-pink-400'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 relative">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b-4 border-black pb-8">
        <div>
          <div className="inline-block bg-black text-white px-4 py-1 font-bold text-sm mb-2 transform -rotate-2">
            限量版提示词
          </div>
          <h2 className="text-6xl md:text-8xl font-black uppercase leading-none mb-4">
            提示词<br/>黑胶唱片
          </h2>
          <p className="text-xl font-bold bg-white inline-block px-2 border-2 border-black">
            收藏高级指令。让代码像音乐一样流淌。
          </p>
        </div>
        <div className="mt-6 md:mt-0">
          <Button size="lg" icon={<Plus className="w-5 h-5"/>} onClick={() => setIsMinting(true)}>
            铸造新黑胶
          </Button>
        </div>
      </div>

      {/* Minting Modal */}
      {isMinting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border-4 border-black shadow-neo w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col relative">
            <div className="flex justify-between items-center p-4 border-b-4 border-black bg-vibe-yellow sticky top-0 z-10">
                <h3 className="text-2xl font-black uppercase flex items-center">
                    <Disc className="w-6 h-6 mr-2" /> 铸造工作台
                </h3>
                <button onClick={() => setIsMinting(false)} className="p-1 hover:bg-black hover:text-white transition-colors border-2 border-transparent hover:border-black">
                    <X className="w-6 h-6" />
                </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block font-bold text-sm uppercase mb-1">黑胶标题 *</label>
                        <input 
                            type="text" 
                            name="title" 
                            value={formData.title} 
                            onChange={handleInputChange}
                            placeholder="例如：量子速读代码助手"
                            className="w-full border-2 border-black p-2 font-bold focus:ring-2 focus:ring-yellow-400 outline-none shadow-neo-sm"
                            required
                        />
                    </div>
                    <div>
                        <label className="block font-bold text-sm uppercase mb-1">艺术家 (你)</label>
                        <input 
                            type="text" 
                            name="artist" 
                            value={formData.artist} 
                            onChange={handleInputChange}
                            placeholder="你的大名"
                            className="w-full border-2 border-black p-2 font-bold focus:ring-2 focus:ring-yellow-400 outline-none shadow-neo-sm"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block font-bold text-sm uppercase mb-1">BPM (复杂度)</label>
                        <input 
                            type="number" 
                            name="bpm" 
                            value={formData.bpm} 
                            onChange={handleInputChange}
                            className="w-full border-2 border-black p-2 font-mono focus:ring-2 focus:ring-yellow-400 outline-none shadow-neo-sm"
                        />
                    </div>
                    <div>
                        <label className="block font-bold text-sm uppercase mb-1">流派</label>
                        <select 
                            name="genre" 
                            value={formData.genre} 
                            onChange={handleInputChange}
                            className="w-full border-2 border-black p-2 font-bold focus:ring-2 focus:ring-yellow-400 outline-none shadow-neo-sm bg-white"
                        >
                            {genreOptions.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block font-bold text-sm uppercase mb-1">价格</label>
                        <input 
                            type="text" 
                            name="price" 
                            value={formData.price} 
                            onChange={handleInputChange}
                            placeholder="Free / 1.0 VIBE"
                            className="w-full border-2 border-black p-2 font-bold focus:ring-2 focus:ring-yellow-400 outline-none shadow-neo-sm"
                        />
                    </div>
                </div>

                <div>
                    <label className="block font-bold text-sm uppercase mb-1">封面颜色</label>
                    <div className="flex gap-2 flex-wrap">
                        {colorOptions.map((color) => (
                            <button
                                type="button"
                                key={color.value}
                                onClick={() => setFormData({...formData, coverColor: color.value})}
                                className={`w-10 h-10 border-2 border-black shadow-neo-sm ${color.value} ${formData.coverColor === color.value ? 'ring-2 ring-offset-2 ring-black transform -translate-y-1' : ''}`}
                                title={color.label}
                            />
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block font-bold text-sm uppercase mb-1">MOOD (标签)</label>
                    <input 
                        type="text" 
                        name="mood" 
                        value={formData.mood} 
                        onChange={handleInputChange}
                        placeholder="例如：Focus / Chill / Hardcore"
                        className="w-full border-2 border-black p-2 font-bold focus:ring-2 focus:ring-yellow-400 outline-none shadow-neo-sm"
                    />
                </div>

                <div>
                    <label className="block font-bold text-sm uppercase mb-1">Prompt 内容 (歌词谱) *</label>
                    <textarea 
                        name="promptContent" 
                        value={formData.promptContent} 
                        onChange={handleInputChange}
                        placeholder="在此输入你的神奇 Prompt..."
                        className="w-full h-40 border-2 border-black p-2 font-mono text-sm focus:ring-2 focus:ring-yellow-400 outline-none shadow-neo-sm resize-none"
                        required
                    />
                </div>

                <div className="pt-4 border-t-2 border-black flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => setIsMinting(false)}>取消</Button>
                    <Button type="submit" icon={<Save className="w-4 h-4" />}>确认铸造</Button>
                </div>
            </form>
          </div>
        </div>
      )}

      {/* Vinyl Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {vinyls.map((vinyl) => {
          const isActive = activeVinylId === vinyl.id;
          
          return (
            <div key={vinyl.id} className="relative group h-[500px] perspective-1000">
              
              {/* The Card Container */}
              <div 
                className={`relative w-full h-full transition-all duration-700 preserve-3d cursor-pointer ${isActive ? 'rotate-y-180' : ''}`}
                onClick={() => toggleVinyl(vinyl.id)}
              >
                
                {/* FRONT: The Sleeve & Record */}
                <div className="absolute inset-0 backface-hidden">
                  {/* Sleeve */}
                  <div className={`w-full h-full ${vinyl.coverColor} border-4 border-black shadow-neo flex flex-col relative overflow-hidden z-20`}>
                    
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 p-4">
                      <Disc className="w-12 h-12 text-black opacity-20" />
                    </div>
                    <div className="absolute bottom-12 left-0 w-full h-1 bg-black"></div>
                    <div className="absolute bottom-16 left-0 w-full h-1 bg-black"></div>
                    
                    {/* Content */}
                    <div className="p-6 mt-auto bg-white border-t-4 border-black relative z-10">
                      <div className="flex justify-between items-start mb-2">
                        <span className="bg-black text-white px-2 py-1 text-xs font-bold uppercase">{vinyl.genre}</span>
                        <span className="font-mono font-bold text-sm border border-black px-1">BPM: {vinyl.bpm}</span>
                      </div>
                      <h3 className="text-3xl font-black uppercase leading-tight mb-1 line-clamp-2">{vinyl.title}</h3>
                      <p className="text-lg font-bold text-gray-600 mb-4">艺术家: {vinyl.artist}</p>
                      
                      <div className="flex justify-between items-center border-t-2 border-black pt-3">
                         <span className="font-black text-xl">{vinyl.price}</span>
                         <span className="text-xs font-bold uppercase tracking-wider text-gray-500">点击播放 (翻转)</span>
                      </div>
                    </div>
                  </div>

                  {/* The Record (Enhanced Visualization) */}
                  <div className={`absolute right-4 top-4 w-[280px] h-[280px] bg-black rounded-full border-4 border-black z-10 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] 
                      ${isActive ? 'translate-x-0 rotate-0' : 'group-hover:translate-x-24 group-hover:rotate-12'}
                  `}>
                      {/* Record Grooves / Texture */}
                      <div className="absolute inset-2 rounded-full border border-gray-800 opacity-50"></div>
                      <div className="absolute inset-4 rounded-full border border-gray-800 opacity-50"></div>
                      <div className="absolute inset-8 rounded-full border border-gray-800 opacity-50"></div>

                      {/* Record Label */}
                      <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-4 border-black ${vinyl.coverColor} flex items-center justify-center shadow-inner`}>
                          <div className="w-3 h-3 bg-black rounded-full"></div>
                      </div>
                  </div>
                </div>

                {/* BACK: The Prompt Lyrics */}
                {/* z-30 added to ensure it's clickable when flipped */}
                <div className="absolute inset-0 bg-white border-4 border-black shadow-neo rotate-y-180 backface-hidden flex flex-col p-6 z-30">
                  <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-4">
                    <div className="flex items-center gap-2">
                       <div className="w-3 h-3 rounded-full bg-red-500 border border-black animate-pulse"></div>
                       <span className="font-black uppercase tracking-widest text-sm">正在播放</span>
                    </div>
                    <Music className="w-6 h-6 animate-bounce" />
                  </div>

                  <div className="flex-grow overflow-y-auto font-mono text-sm bg-gray-100 p-4 border-2 border-black mb-6">
                    <p className="whitespace-pre-wrap">{vinyl.promptContent}</p>
                  </div>

                  <div className="mt-auto flex flex-col gap-3">
                    <div className="flex justify-between text-xs font-bold uppercase">
                       <span>MOOD: {vinyl.mood}</span>
                       <span>长度: {vinyl.promptContent.length} 字符</span>
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={(e) => copyPrompt(e, vinyl.promptContent)}
                      icon={<Copy className="w-4 h-4"/>}
                    >
                      复制
                    </Button>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
