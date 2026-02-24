'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { exploreData, BubbleSize } from '@/lib/explore-data';
import { motion } from 'framer-motion';
import {
  Upload, Plus, Sparkles, TrendingUp, Users
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, x: 50 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 }
  }
};

// 1. UPDATED: Added onClick to the Bubble props
const FloatingBubble = ({ text, size, top, left, delay, onClick }: {
  text: string, size: BubbleSize, top: string, left: string, delay: number, onClick: () => void
}) => {
  const styleVariants = {
    sm: 'w-20 h-20 text-sm ring-4 ring-[#FEF9C3] shadow-md shadow-[#FFD700]/20',
    md: 'w-28 h-28 text-base ring-6 ring-[#FEF9C3] shadow-lg shadow-[#FFD700]/30',
    lg: 'w-36 h-36 text-xl ring-8 ring-[#FEF9C3] shadow-xl shadow-[#FFD700]/40'
  };

  return (
    <motion.div
      onClick={onClick} // 2. UPDATED: Apply the onClick handler here
      className={`absolute rounded-full flex items-center justify-center bg-white font-bold text-gray-800 border border-yellow-100 cursor-pointer hover:scale-105 hover:shadow-2xl hover:ring-[#FFD700]/40 transition-all duration-300 z-20
        ${styleVariants[size]}
      `}
      style={{ top, left, transform: 'translate(-50%, -50%)' }}
      animate={{
        y: [0, -15, 0],
        x: [0, Math.random() * 10 - 5, 0]
      }}
      transition={{
        duration: 4 + Math.random() * 2,
        repeat: Infinity,
        ease: "easeInOut",
        delay
      }}
    >
      {text}
    </motion.div>
  );
};

export default function ExplorePage() {
  const router = useRouter();
  const [isJingen, setIsJingen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { createClient } = await import('@/utils/supabase/client');
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user?.email === 'jingen@gmail.com') {
        setIsJingen(true);
      }
    };
    checkAuth();
  }, []);

  const suggestionsToDisplay = isJingen ? exploreData.suggestions : [];
  const popularToDisplay = isJingen ? exploreData.popularSkills : [];

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF6] font-sans text-gray-900 overflow-hidden">
      <Navbar isLoggedIn={true} />

      <style dangerouslySetInnerHTML={{
        __html: `
        .horizontal-scroll::-webkit-scrollbar { height: 8px; }
        .horizontal-scroll::-webkit-scrollbar-track { background: transparent; }
        .horizontal-scroll::-webkit-scrollbar-thumb { background-color: #E5E7EB; border-radius: 10px; }
        .horizontal-scroll::-webkit-scrollbar-thumb:hover { background-color: #D1D5DB; }
      `}} />

      <main className="flex-grow relative flex flex-col items-center py-12 px-4 h-full w-full">
        <div className="absolute inset-0 pointer-events-none z-0 opacity-30 bg-[radial-gradient(#FDE68A_1.5px,transparent_1.5px)] [background-size:24px_24px]" />

        <div className="w-full max-w-7xl mx-auto z-10">

          <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-6 mb-24 relative">
            <button
              onClick={() => router.push('/analyse')}
              className="w-full bg-[#FFD700] hover:bg-[#E6C200] text-gray-900 rounded-3xl p-6 md:p-8 flex items-center justify-between shadow-lg shadow-[#FFD700]/20 transition-all active:scale-95 group border-2 border-[#FFD700]"
            >
              <div className="text-left">
                <h3 className="font-display font-bold text-xl md:text-2xl mb-1 group-hover:translate-x-1 transition-transform">
                  {exploreData.hero.analyseTitle}
                </h3>
                <p className="text-sm font-medium text-gray-800">
                  {exploreData.hero.analyseDesc}
                </p>
              </div>
              <div className="bg-white/90 p-3 md:p-4 rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-sm">
                <Upload className="w-6 h-6 md:w-8 md:h-8 text-[#A16207] stroke-[2.5]" />
              </div>
            </button>

            <button
              onClick={() => router.push('/setup')}
              className="bg-white hover:bg-gray-50 text-gray-900 rounded-2xl px-8 py-4 flex items-center justify-center gap-3 border border-gray-200 font-bold shadow-sm transition-all active:scale-95 hover:shadow-md hover:border-[#FFD700]/50 group"
            >
              <div className="bg-[#FFD700] rounded-full p-1.5 flex items-center justify-center group-hover:rotate-90 transition-transform">
                <Plus className="w-4 h-4 text-gray-900 stroke-[3]" />
              </div>
              {exploreData.hero.newSkillTitle}
            </button>
          </div>

          <div className="mb-32 flex flex-col items-center">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2 mb-12">
              <Sparkles className="w-6 h-6 text-[#CA8A04] animate-pulse" />
              {exploreData.suggestionsTitle}
            </h2>

            <div className="relative w-full max-w-4xl h-[400px] md:h-[500px]">
              {suggestionsToDisplay.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <p className="text-xl text-gray-400 font-medium">No suggestions available right now.</p>
                </div>
              ) : (
                suggestionsToDisplay.map((bubble) => (
                  <FloatingBubble
                    key={bubble.id}
                    text={bubble.text}
                    size={bubble.size}
                    top={bubble.top}
                    left={bubble.left}
                    delay={bubble.delay}
                    onClick={() => router.push(`/setup?topic=${encodeURIComponent(bubble.text)}`)}
                  />
                ))
              )}
            </div>
          </div>

          <div className="mb-12 w-full">
            <div className="flex items-center mb-8">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-[#CA8A04]" />
                {exploreData.popularTitle}
              </h2>
            </div>

            <div className="w-full overflow-x-auto pb-8 pt-4 -mt-4 horizontal-scroll">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-100px" }}
                className="flex gap-6 w-max px-2"
              >
                {popularToDisplay.length === 0 ? (
                  <div className="w-full text-center py-12 px-8 bg-white rounded-3xl border border-gray-100 italic text-gray-400 shadow-sm mx-auto">
                    Check back later for trending courses!
                  </div>
                ) : (
                  popularToDisplay.map((skill) => (
                    <motion.div
                      key={skill.id}
                      variants={cardVariants}
                      onClick={() => router.push(`/setup?topic=${encodeURIComponent(skill.title)}`)}
                      className="w-[280px] shrink-0 bg-white rounded-[24px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 border border-gray-100 flex flex-col h-full cursor-pointer transition-all duration-300 group"
                    >
                      <div className="bg-[#FEF9C3] w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <skill.icon className="w-6 h-6 text-[#A16207]" />
                      </div>
                      <h3 className="font-bold text-lg text-gray-900 mb-2">{skill.title}</h3>
                      <p className="text-sm text-gray-500 mb-6 flex-grow leading-relaxed">
                        {skill.desc}
                      </p>
                      <div className="mt-auto">
                        <span className="inline-flex items-center gap-1.5 bg-[#FFFBEB] text-[#B45309] text-xs font-bold px-3 py-1.5 rounded-lg border border-[#FEF3C7]">
                          <Users className="w-3.5 h-3.5" />
                          {skill.learners} Learners
                        </span>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}