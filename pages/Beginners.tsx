
import React, { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { PlayCircle, BookOpen, Terminal, CheckCircle, Lock, X, Video, FileText, Monitor, ChevronRight, Zap, Trophy, ArrowRight } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'article' | 'challenge';
  duration: string;
  description: string;
  isLocked?: boolean;
  isCompleted?: boolean;
}

interface Module {
  id: string;
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  lessons: Lesson[];
  color: string;
}

const academyModules: Module[] = [
  {
    id: 'm1',
    number: '01',
    title: '思维觉醒: The Vibe Mindset',
    description: '忘记语法，拥抱逻辑。学习如何像产品经理一样思考，像艺术家一样编程。',
    color: 'bg-vibe-yellow',
    icon: <Zap className="w-8 h-8" />,
    lessons: [
      {
        id: 'l1-1',
        title: '什么是 Vibe Coding?',
        type: 'article',
        duration: '5 min read',
        description: 'AI 并没有取代程序员，它只是把我们都变成了技术总监。了解这一范式转移。',
        isCompleted: true
      },
      {
        id: 'l1-2',
        title: '提示词工程基础 (Prompt Engineering)',
        type: 'video',
        duration: '12 min',
        description: '如何精准地向 AI 描述你的需求？学习 "Context-Instruction-Format" 框架。',
        isCompleted: true
      }
    ]
  },
  {
    id: 'm2',
    number: '02',
    title: '神兵利器: Environment Setup',
    description: '工欲善其事，必先利其器。配置最强 AI 辅助开发环境。',
    color: 'bg-blue-300',
    icon: <Monitor className="w-8 h-8" />,
    lessons: [
      {
        id: 'l2-1',
        title: '安装与配置 Cursor',
        type: 'video',
        duration: '15 min',
        description: '从下载到插件配置。设置你的 AI 快捷键，让它成为你手指的延伸。',
        isCompleted: false
      },
      {
        id: 'l2-2',
        title: '配置 API Keys (Gemini/Claude)',
        type: 'article',
        duration: '8 min read',
        description: '获取并安全地配置你的大模型 API Key，解锁无限额度的 Vibe 之力。',
        isCompleted: false
      }
    ]
  },
  {
    id: 'm3',
    number: '03',
    title: '初试锋芒: Hello World',
    description: '不写一行代码，只靠对话生成你的第一个网页组件。',
    color: 'bg-pink-300',
    icon: <Terminal className="w-8 h-8" />,
    lessons: [
      {
        id: 'l3-1',
        title: '实战：生成一个 Neo-Brutalism 卡片',
        type: 'challenge',
        duration: '20 min',
        description: '跟随教程，使用 Tailwind CSS 生成一个响应式的、带悬停效果的玻璃拟态卡片。',
        isCompleted: false
      },
      {
        id: 'l3-2',
        title: '调试：当 AI 犯错时怎么办？',
        type: 'video',
        duration: '10 min',
        description: 'AI 也会写 Bug。学习如何将错误信息反馈给它，让它自己修复自己。',
        isLocked: true
      }
    ]
  },
  {
    id: 'm4',
    number: '04',
    title: '通往世界: Ship It!',
    description: '让全世界看到你的作品。部署、发布与分享。',
    color: 'bg-green-300',
    icon: <Trophy className="w-8 h-8" />,
    lessons: [
      {
        id: 'l4-1',
        title: '使用 Vercel 一键部署',
        type: 'article',
        duration: '10 min read',
        description: '将你的 Localhost 变成 https://your-project.vercel.app。',
        isLocked: true
      }
    ]
  }
];

export const Beginners: React.FC = () => {
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  const getIcon = (type: string) => {
    switch(type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'article': return <FileText className="w-4 h-4" />;
      case 'challenge': return <Terminal className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 relative">
      
      {/* Hero Header */}
      <div className="mb-12 border-b-4 border-black pb-8">
        <div className="flex flex-col md:flex-row justify-between items-end">
            <div>
                <div className="inline-block bg-black text-white px-4 py-1 font-bold text-sm mb-2 uppercase tracking-widest transform -rotate-1">
                    Vibe Academy
                </div>
                <h1 className="text-6xl md:text-8xl font-black uppercase leading-[0.9] mb-4">
                    从零到<br /><span className="text-stroke-2 text-transparent bg-clip-text bg-gradient-to-r from-black to-gray-800" style={{ WebkitTextStroke: '2px black' }}>Viber</span>
                </h1>
                <p className="text-xl font-bold max-w-2xl text-gray-700">
                    欢迎来到 Vibe Coding 学院。这里不教你背诵 API，只教你如何驾驭 AI，让灵感瞬间落地。
                </p>
            </div>
            <div className="mt-6 md:mt-0 bg-white border-4 border-black p-4 shadow-neo flex flex-col items-center">
                <div className="text-xs font-black uppercase text-gray-400 mb-1">当前进度</div>
                <div className="text-4xl font-black">25%</div>
                <div className="w-32 h-2 bg-gray-200 mt-2 border border-black rounded-full overflow-hidden">
                    <div className="h-full bg-vibe-yellow w-1/4 border-r-2 border-black"></div>
                </div>
            </div>
        </div>
      </div>

      {/* Modules List */}
      <div className="space-y-12">
        {academyModules.map((module, index) => (
          <div key={module.id} className="relative">
             {/* Connector Line */}
             {index !== academyModules.length - 1 && (
                <div className="absolute left-8 top-20 bottom-[-48px] w-1 bg-black z-0 hidden md:block border-l-2 border-black border-dashed"></div>
             )}

             <GlassCard className="relative z-10 p-0 overflow-hidden flex flex-col md:flex-row">
                {/* Left: Module Info */}
                <div className={`md:w-1/3 p-8 border-b-4 md:border-b-0 md:border-r-4 border-black ${module.color} flex flex-col justify-between`}>
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-6xl font-black opacity-20">{module.number}</span>
                            <div className="p-3 bg-white border-2 border-black shadow-neo-sm">
                                {module.icon}
                            </div>
                        </div>
                        <h2 className="text-3xl font-black uppercase leading-tight mb-2">{module.title}</h2>
                        <p className="font-medium text-black/80">{module.description}</p>
                    </div>
                </div>

                {/* Right: Lessons */}
                <div className="md:w-2/3 bg-white p-6 md:p-8">
                    <div className="space-y-4">
                        {module.lessons.map((lesson) => (
                            <button 
                                key={lesson.id}
                                disabled={lesson.isLocked}
                                onClick={() => setActiveLesson(lesson)}
                                className={`w-full text-left group relative border-2 border-black p-4 transition-all duration-200 
                                    ${lesson.isLocked 
                                        ? 'bg-gray-50 opacity-60 cursor-not-allowed border-dashed' 
                                        : 'bg-white hover:-translate-y-1 hover:shadow-neo-sm active:translate-y-0 active:shadow-none'
                                    }
                                `}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 pr-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`px-2 py-0.5 text-xs font-bold uppercase border border-black flex items-center gap-1 ${lesson.isLocked ? 'bg-gray-200' : 'bg-vibe-yellow'}`}>
                                                {getIcon(lesson.type)} {lesson.type}
                                            </span>
                                            <span className="text-xs font-bold text-gray-400 font-mono">{lesson.duration}</span>
                                        </div>
                                        <h3 className="text-lg font-black mb-1 group-hover:underline decoration-2">{lesson.title}</h3>
                                        <p className="text-sm font-medium text-gray-600 line-clamp-1">{lesson.description}</p>
                                    </div>
                                    <div className="mt-1">
                                        {lesson.isLocked ? (
                                            <Lock className="w-5 h-5 text-gray-400" />
                                        ) : lesson.isCompleted ? (
                                            <CheckCircle className="w-6 h-6 text-green-500 fill-green-100" />
                                        ) : (
                                            <div className="w-6 h-6 rounded-full border-2 border-black flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                                                <PlayCircle className="w-4 h-4" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
             </GlassCard>
          </div>
        ))}
      </div>

      {/* Lesson Modal */}
      {activeLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setActiveLesson(null)}>
            <div className="bg-white border-4 border-black shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col relative" onClick={e => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="p-4 border-b-4 border-black bg-vibe-yellow flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-black text-white border-2 border-black">
                            {getIcon(activeLesson.type)}
                        </div>
                        <div>
                            <div className="text-xs font-black uppercase mb-0.5">正在学习</div>
                            <h3 className="text-xl font-black uppercase leading-none">{activeLesson.title}</h3>
                        </div>
                    </div>
                    <button onClick={() => setActiveLesson(null)} className="p-2 hover:bg-black hover:text-white border-2 border-transparent hover:border-black transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Modal Content - Simulator */}
                <div className="flex-1 overflow-y-auto bg-gray-50 p-0 relative">
                    {activeLesson.type === 'video' ? (
                        <div className="w-full h-full flex items-center justify-center bg-black relative group">
                            {/* Fake Video Player UI */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <PlayCircle className="w-20 h-20 text-white opacity-80 group-hover:scale-110 transition-transform cursor-pointer" />
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex items-center gap-4 text-white">
                                <div className="font-mono text-xs">00:00 / {activeLesson.duration}</div>
                                <div className="h-1 flex-1 bg-gray-600 rounded-full overflow-hidden">
                                    <div className="h-full w-1/3 bg-vibe-yellow"></div>
                                </div>
                            </div>
                            <img src={`https://picsum.photos/1200/800?random=${activeLesson.id}`} className="w-full h-full object-cover opacity-60" alt="Video Placeholder" />
                        </div>
                    ) : (
                        <div className="max-w-3xl mx-auto p-8 md:p-12">
                            <div className="prose prose-lg prose-headings:font-black">
                                <h1>{activeLesson.title}</h1>
                                <p className="lead text-xl font-medium text-gray-600 border-l-4 border-vibe-yellow pl-4 italic">
                                    "{activeLesson.description}"
                                </p>
                                <hr className="border-2 border-black border-dashed my-8"/>
                                <h3>1. 核心概念</h3>
                                <p>这里是教程的具体内容占位符。在真实的 Vibe Coding 应用中，这里会详细讲解如何操作。</p>
                                <div className="bg-black text-white p-6 rounded-none font-mono text-sm border-l-4 border-vibe-yellow my-6">
                                    {`// 示例代码
const vibeCheck = () => {
  return "All Systems Go!";
};`}
                                </div>
                                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                                <h3>2. 动手实践</h3>
                                <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t-4 border-black bg-white flex justify-between items-center">
                    <Button variant="outline" onClick={() => setActiveLesson(null)}>稍后继续</Button>
                    <Button icon={<CheckCircle className="w-5 h-5" />}>完成本节</Button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};
