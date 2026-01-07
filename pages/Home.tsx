
import React from 'react';
import { PageView } from '../types';
import { Button } from '../components/Button';
import { GlassCard } from '../components/GlassCard';
import { Sparkles, Rocket, Users, Award, ArrowRight } from 'lucide-react';

interface HomeProps {
  setPage: (page: PageView) => void;
}

export const Home: React.FC<HomeProps> = ({ setPage }) => {
  return (
    <div className="flex flex-col pb-20 overflow-hidden">
      
      {/* Marquee */}
      <div className="w-full bg-black text-vibe-yellow py-3 border-b-4 border-black overflow-hidden whitespace-nowrap">
        <div className="animate-marquee inline-block font-black text-xl uppercase tracking-wider">
           VIBE YOUR MIND • 想法即实现 • JUST VIBE IT • 此时此刻 • VIBE YOUR MIND • 想法即实现 • JUST VIBE IT • 此时此刻 •
           VIBE YOUR MIND • 想法即实现 • JUST VIBE IT • 此时此刻 • VIBE YOUR MIND • 想法即实现 • JUST VIBE IT • 此时此刻 •
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-20">
        
        <div className="mb-8 border-4 border-black bg-white p-4 shadow-neo rotate-2">
          <h1 className="text-6xl md:text-9xl font-black tracking-tighter uppercase leading-[0.9]">
            Vibe 出<br/>你的世界
          </h1>
        </div>
        
        <p className="text-xl md:text-3xl font-bold mb-12 max-w-3xl bg-black text-white p-2 -rotate-1">
          从零开始落地你的Idea！
        </p>

        <div className="flex flex-col sm:flex-row gap-6">
          <Button size="lg" onClick={() => setPage(PageView.BEGINNERS)} icon={<Rocket className="w-6 h-6" />}>
            开始 VIBING (小白)
          </Button>
          <Button size="lg" variant="secondary" onClick={() => setPage(PageView.IDEA_UNIVERSE)}>
            探索灵感
          </Button>
        </div>
      </section>

      {/* Grid Layout */}
      <section className="px-4 max-w-7xl mx-auto w-full">
        <div className="mb-8 flex items-center gap-4">
          <div className="h-1 flex-grow bg-black"></div>
          <h2 className="text-4xl font-black uppercase">探索社区</h2>
          <div className="h-1 flex-grow bg-black"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <GlassCard hoverEffect onClick={() => setPage(PageView.BEGINNERS)} className="group bg-white">
            <div className="flex justify-between items-start mb-6">
               <div className="p-3 bg-blue-500 border-2 border-black shadow-neo-sm">
                 <Rocket className="w-8 h-8 text-white" />
               </div>
               <ArrowRight className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-4 group-hover:translate-x-0" />
            </div>
            <h3 className="text-4xl font-black mb-2 uppercase">小白入门</h3>
            <p className="text-lg font-medium text-gray-700">从零开始。收集整理最基础的教程，带你光速入门 Vibe Coding。</p>
          </GlassCard>

          <GlassCard hoverEffect onClick={() => setPage(PageView.IDEA_UNIVERSE)} className="group bg-white">
            <div className="flex justify-between items-start mb-6">
               <div className="p-3 bg-purple-500 border-2 border-black shadow-neo-sm">
                 <Sparkles className="w-8 h-8 text-white" />
               </div>
               <ArrowRight className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-4 group-hover:translate-x-0" />
            </div>
            <h3 className="text-4xl font-black mb-2 uppercase">Idea 宇宙</h3>
            <p className="text-lg font-medium text-gray-700">脑洞大开。上传你的想法、原型图、Demo，甚至已上线的产品。</p>
          </GlassCard>

          <GlassCard hoverEffect onClick={() => setPage(PageView.BOUNTY_HUNTERS)} className="group bg-white">
            <div className="flex justify-between items-start mb-6">
               <div className="p-3 bg-emerald-500 border-2 border-black shadow-neo-sm">
                 <Users className="w-8 h-8 text-white" />
               </div>
               <ArrowRight className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-4 group-hover:translate-x-0" />
            </div>
            <h3 className="text-4xl font-black mb-2 uppercase">赏金猎人</h3>
            <p className="text-lg font-medium text-gray-700">合作共赢。找合作、约 Coffee Chat、发布任务、寻找你的梦之队。</p>
          </GlassCard>

          <GlassCard hoverEffect onClick={() => setPage(PageView.FEATURED)} className="group bg-white">
            <div className="flex justify-between items-start mb-6">
               <div className="p-3 bg-amber-500 border-2 border-black shadow-neo-sm">
                 <Award className="w-8 h-8 text-white" />
               </div>
               <ArrowRight className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-4 group-hover:translate-x-0" />
            </div>
            <h3 className="text-4xl font-black mb-2 uppercase">精品项目</h3>
            <p className="text-lg font-medium text-gray-700">优中选优。必须是已经上线、真正可用的高质量项目展示。</p>
          </GlassCard>
        </div>
      </section>
    </div>
  );
};
