
import React, { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { Project } from '../types';
import { ExternalLink, Star, Plus, Heart, X, Check, Edit, Trash2, Rocket, Globe, Tag, Eye, Upload } from 'lucide-react';

// Extend Project type locally to support richer features
interface ExtendedProject extends Project {
  tags: string[];
  likes: number;
  featured: boolean; // "Official Selection" badge
  timestamp: number;
  likedByCurrentUser?: boolean; // Track if user has liked this specific project
}

const initialProjects: ExtendedProject[] = [
  {
    id: '1',
    name: 'MindMap AI',
    description: '一个全功能的无限画布头脑风暴工具，由 Gemini 1.5 驱动。支持多人实时协作，节点自动补全，以及一键生成思维导图 PPT。前端使用 React Flow，后端使用 Supabase。',
    image: 'https://picsum.photos/800/600?random=10',
    url: 'https://example.com',
    author: 'DevTeam One',
    tags: ['React', 'AI', 'Canvas'],
    likes: 1242,
    featured: true,
    timestamp: Date.now() - 10000000,
    likedByCurrentUser: false
  },
  {
    id: '2',
    name: 'Vibe Beats',
    description: '开源生成式音乐播放器，能根据你的打字速度自动调整节奏。Product Hunt 当日榜首项目。专为开发者设计的 Lo-Fi 伴侣，让你在 Coding 时保持绝对的心流状态。',
    image: 'https://picsum.photos/800/600?random=11',
    url: 'https://example.com',
    author: 'AudioLabs',
    tags: ['Audio', 'Open Source', 'Vibe'],
    likes: 896,
    featured: true,
    timestamp: Date.now() - 5000000,
    likedByCurrentUser: false
  },
  {
    id: '3',
    name: 'Neo-Portfolio',
    description: '一个极简主义的新粗野风格个人作品集模板。开箱即用，支持 Notion 作为 CMS。',
    image: 'https://picsum.photos/800/600?random=12',
    url: 'https://example.com',
    author: 'DesignGuru',
    tags: ['Template', 'Next.js', 'Tailwind'],
    likes: 45,
    featured: false,
    timestamp: Date.now() - 200000,
    likedByCurrentUser: false
  }
];

export const Featured: React.FC = () => {
  const [projects, setProjects] = useState<ExtendedProject[]>(initialProjects);
  
  // Modal States
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [viewingProject, setViewingProject] = useState<ExtendedProject | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    image: '',
    url: '',
    tags: '',
    author: 'You'
  });

  // --- Actions ---

  const handleLike = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setProjects(prev => prev.map(p => {
      if (p.id === id) {
        const isLiked = !!p.likedByCurrentUser;
        return { 
          ...p, 
          likes: isLiked ? p.likes - 1 : p.likes + 1,
          likedByCurrentUser: !isLiked
        };
      }
      return p;
    }));
  };

  const handleOpenCreate = () => {
    setFormData({
      id: '',
      name: '',
      description: '',
      image: '', // Empty by default for upload
      url: '',
      tags: '',
      author: 'You'
    });
    setIsEditing(false);
    setShowForm(true);
  };

  const handleOpenEdit = (project: ExtendedProject) => {
    setFormData({
      id: project.id,
      name: project.name,
      description: project.description,
      image: project.image,
      url: project.url,
      tags: project.tags.join(', '),
      author: project.author
    });
    setIsEditing(true);
    setShowForm(true);
    setViewingProject(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.description || !formData.url) return;

    const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
    // Use a placeholder if no image uploaded
    const finalImage = formData.image || `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`;

    if (isEditing && formData.id) {
      setProjects(prev => prev.map(p => p.id === formData.id ? {
        ...p,
        name: formData.name,
        description: formData.description,
        image: finalImage,
        url: formData.url,
        tags: tagsArray
      } : p));
    } else {
      const newProject: ExtendedProject = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        image: finalImage,
        url: formData.url,
        author: 'You',
        tags: tagsArray.length > 0 ? tagsArray : ['Vibe Coding'],
        likes: 0,
        featured: false,
        timestamp: Date.now(),
        likedByCurrentUser: false
      };
      setProjects([newProject, ...projects]);
    }
    setShowForm(false);
  };

  const handleDelete = () => {
    if (deletingId) {
      setProjects(prev => prev.filter(p => p.id !== deletingId));
      setDeletingId(null);
      setViewingProject(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 relative">
      {/* Header */}
      <div className="mb-12 flex flex-col md:flex-row justify-between items-end border-b-4 border-black pb-8">
        <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-black text-vibe-yellow px-4 py-1 font-bold text-sm mb-4 transform -rotate-1">
                <Star className="w-4 h-4 fill-current" />
                <span>COMMUNITY SHOWCASE</span>
            </div>
            <h2 className="text-6xl font-black uppercase mb-4 text-black leading-[0.9]">
            精品项目
            </h2>
            <p className="text-xl font-bold max-w-2xl text-gray-600">
            社区精选。真正可用的 Vibe Coding 精神之作。
            </p>
        </div>
        <div className="mt-6 md:mt-0">
             <Button size="lg" icon={<Plus className="w-5 h-5"/>} onClick={handleOpenCreate}>
                提交项目
             </Button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project) => (
          <div 
            key={project.id} 
            onClick={() => setViewingProject(project)}
            className="group relative bg-white border-4 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-2 transition-all duration-300 cursor-pointer flex flex-col h-full"
          >
            {/* Image Container */}
            <div className="relative aspect-[4/3] overflow-hidden border-b-4 border-black bg-gray-100">
              <img 
                src={project.image} 
                alt={project.name} 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
              />
              {project.featured && (
                <div className="absolute top-4 left-4 bg-vibe-yellow text-black px-3 py-1 text-xs font-black uppercase border-2 border-black shadow-neo-sm flex items-center gap-1 z-10">
                  <Star className="w-3 h-3 fill-black" /> Official Pick
                </div>
              )}
              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-[2px]">
                 <Button variant="secondary" size="sm" icon={<Eye className="w-4 h-4"/>}>预览</Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-grow">
              <div className="flex justify-between items-start mb-2">
                 <h3 className="text-2xl font-black uppercase leading-tight line-clamp-1 group-hover:underline decoration-4 decoration-yellow-400 underline-offset-2">
                   {project.name}
                 </h3>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-xs font-bold px-1.5 py-0.5 border border-black text-gray-600 bg-gray-50">
                          {tag}
                      </span>
                  ))}
              </div>

              <p className="text-gray-700 font-medium line-clamp-2 mb-6 flex-grow">
                {project.description}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t-2 border-black border-dashed mt-auto">
                 <div className="text-sm font-bold truncate max-w-[50%]">
                    by @{project.author}
                 </div>
                 <div className="flex gap-2">
                     <button 
                       onClick={(e) => handleLike(e, project.id)}
                       className={`flex items-center gap-1 px-3 py-1 bg-white border-2 transition-all rounded-full group/like ${
                         project.likedByCurrentUser 
                           ? 'border-red-500 bg-red-50 text-red-600' 
                           : 'border-transparent hover:border-black hover:bg-red-50'
                       }`}
                     >
                       <Heart 
                         className={`w-4 h-4 transition-colors ${
                           project.likedByCurrentUser 
                             ? 'text-red-500 fill-red-500' 
                             : 'text-gray-400 group-hover/like:text-red-500 group-hover/like:fill-red-500'
                         }`} 
                       />
                       <span className={`font-black text-sm ${project.likedByCurrentUser ? 'text-red-600' : ''}`}>
                         {project.likes}
                       </span>
                     </button>
                     <a 
                       href={project.url} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       onClick={e => e.stopPropagation()}
                       className="p-1.5 bg-black text-white hover:bg-vibe-yellow hover:text-black transition-colors border-2 border-black"
                     >
                       <ExternalLink className="w-4 h-4" />
                     </a>
                 </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- MODALS --- */}

      {/* Detail Modal */}
      {viewingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setViewingProject(null)}>
            <div className="bg-white border-4 border-black shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto relative flex flex-col md:flex-row" onClick={e => e.stopPropagation()}>
                
                {/* Left: Image */}
                <div className="md:w-1/2 bg-black border-r-4 border-black relative min-h-[300px] md:min-h-full">
                    <img src={viewingProject.image} alt={viewingProject.name} className="absolute inset-0 w-full h-full object-cover opacity-90" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                    <div className="absolute bottom-0 left-0 p-6 text-white w-full">
                        <h2 className="text-4xl md:text-5xl font-black uppercase mb-2 leading-none text-shadow">{viewingProject.name}</h2>
                        <div className="flex items-center gap-2">
                            <span className="bg-vibe-yellow text-black px-2 py-1 font-bold text-xs uppercase">by {viewingProject.author}</span>
                            {viewingProject.featured && <span className="border border-white text-white px-2 py-1 font-bold text-xs uppercase flex items-center"><Star className="w-3 h-3 mr-1 fill-white"/> Featured</span>}
                        </div>
                    </div>
                </div>

                {/* Right: Info */}
                <div className="md:w-1/2 p-8 flex flex-col">
                    <div className="flex justify-end mb-4">
                         <button onClick={() => setViewingProject(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                             <X className="w-6 h-6" />
                         </button>
                    </div>

                    <div className="mb-6">
                        <h4 className="font-black text-gray-400 uppercase text-sm mb-3 tracking-wider">About Project</h4>
                        <p className="text-lg font-medium leading-relaxed text-gray-800">
                            {viewingProject.description}
                        </p>
                    </div>

                    <div className="mb-8">
                        <h4 className="font-black text-gray-400 uppercase text-sm mb-3 tracking-wider">Tech Stack</h4>
                        <div className="flex flex-wrap gap-2">
                            {viewingProject.tags.map(tag => (
                                <span key={tag} className="flex items-center gap-1 px-3 py-1.5 border-2 border-black font-bold text-sm shadow-neo-sm bg-white">
                                    <Tag className="w-3 h-3" /> {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="mt-auto pt-6 border-t-2 border-gray-100 flex flex-col gap-4">
                        <a href={viewingProject.url} target="_blank" rel="noopener noreferrer" className="w-full">
                            <Button size="lg" className="w-full" icon={<Globe className="w-5 h-5"/>}>
                                访问官方网站
                            </Button>
                        </a>
                        
                        {viewingProject.author === 'You' && (
                            <div className="flex gap-4">
                                <Button variant="outline" className="flex-1" icon={<Edit className="w-4 h-4"/>} onClick={() => handleOpenEdit(viewingProject)}>
                                    编辑
                                </Button>
                                <Button variant="ghost" className="text-red-600 hover:bg-red-50" icon={<Trash2 className="w-4 h-4"/>} onClick={() => setDeletingId(viewingProject.id)}>
                                    删除
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Submission Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowForm(false)}>
            <div className="bg-white border-4 border-black shadow-neo w-full max-w-xl max-h-[90vh] overflow-y-auto relative" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b-4 border-black bg-vibe-yellow flex justify-between items-center sticky top-0 z-10">
                    <h3 className="text-2xl font-black uppercase flex items-center">
                        {isEditing ? <Edit className="w-6 h-6 mr-2"/> : <Rocket className="w-6 h-6 mr-2"/>} 
                        {isEditing ? '编辑项目' : '提交项目'}
                    </h3>
                    <button onClick={() => setShowForm(false)} className="p-1 hover:bg-black hover:text-white border-2 border-transparent hover:border-black transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block font-bold text-sm uppercase mb-1">项目名称 *</label>
                        <input 
                            required
                            type="text" 
                            className="w-full border-2 border-black p-3 font-bold focus:ring-4 focus:ring-yellow-400 outline-none"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block font-bold text-sm uppercase mb-1">一句话简介 *</label>
                        <textarea 
                            required
                            className="w-full border-2 border-black p-3 min-h-[100px] font-medium focus:ring-4 focus:ring-yellow-400 outline-none resize-none"
                            placeholder="这个项目是做什么的？用了什么技术？"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block font-bold text-sm uppercase mb-1">项目链接 (URL) *</label>
                        <input 
                            required
                            type="url" 
                            className="w-full border-2 border-black p-3 font-mono text-sm focus:ring-4 focus:ring-yellow-400 outline-none"
                            placeholder="https://..."
                            value={formData.url}
                            onChange={(e) => setFormData({...formData, url: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block font-bold text-sm uppercase mb-1">封面图片</label>
                        <div className="border-2 border-black border-dashed bg-gray-50 p-6 flex flex-col items-center justify-center text-center relative hover:bg-gray-100 transition-colors group/upload">
                            {formData.image ? (
                                <div className="relative w-full aspect-video">
                                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover border-2 border-black" />
                                    <button 
                                        type="button"
                                        onClick={() => setFormData({...formData, image: ''})}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-2 border-2 border-black hover:bg-red-600 shadow-neo-sm"
                                        title="Remove Image"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center py-4">
                                    <div className="bg-white p-4 border-2 border-black shadow-neo-sm mb-3 group-hover/upload:scale-110 transition-transform">
                                        <Upload className="w-6 h-6" />
                                    </div>
                                    <span className="font-bold text-lg uppercase underline decoration-2 underline-offset-2">点击上传封面</span>
                                    <span className="text-xs font-bold text-gray-500 mt-2">支持 JPG, PNG, GIF (Max 5MB)</span>
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        className="hidden" 
                                        onChange={handleImageUpload}
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block font-bold text-sm uppercase mb-1">标签 (逗号分隔)</label>
                        <input 
                            type="text" 
                            className="w-full border-2 border-black p-3 font-bold focus:ring-4 focus:ring-yellow-400 outline-none"
                            placeholder="React, AI, Design..."
                            value={formData.tags}
                            onChange={(e) => setFormData({...formData, tags: e.target.value})}
                        />
                    </div>

                    <div className="pt-4 border-t-2 border-black flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => setShowForm(false)}>取消</Button>
                        <Button type="submit" icon={<Check className="w-4 h-4"/>}>
                            {isEditing ? '保存修改' : '提交审核'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setDeletingId(null)}>
           <div className="bg-white border-4 border-black shadow-neo p-8 max-w-md w-full relative" onClick={e => e.stopPropagation()}>
              <h3 className="text-2xl font-black uppercase mb-4 text-red-600">删除项目？</h3>
              <p className="mb-8 font-medium">确认要下架该项目吗？此操作无法撤销。</p>
              <div className="flex justify-end gap-4">
                  <Button variant="outline" onClick={() => setDeletingId(null)}>取消</Button>
                  <Button className="bg-red-500 hover:bg-red-600 text-white border-black" onClick={handleDelete} icon={<Trash2 className="w-4 h-4"/>}>
                      确认删除
                  </Button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};
