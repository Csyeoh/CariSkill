'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Network, Database, Code2, Brain, Check, Lock, PlusCircle } from 'lucide-react';
import { mockSkillTracks } from '@/lib/progress-data';

const iconMap: Record<string, React.ElementType> = {
  Database: Database,
  Code2: Code2,
  Brain: Brain,
};

export default function ProgressPage() {
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

  const tracksToDisplay = isJingen ? mockSkillTracks : [];

  const popNode = {
    hidden: { opacity: 0, scale: 0.6, y: 30 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 250, damping: 20 }
    }
  };

  const breathingGlow = {
    animate: {
      boxShadow: [
        "0px 0px 0px 0px rgba(255, 215, 0, 0.2)",
        "0px 0px 20px 8px rgba(255, 215, 0, 0.5)",
        "0px 0px 0px 0px rgba(255, 215, 0, 0.2)"
      ]
    },
    transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" as const }
  };

  const SkillNode = ({ title, status, percentage }: any) => {
    const isCompleted = status === 'completed';
    const isInProgress = status === 'progress';
    const isLocked = status === 'locked';

    return (
      <motion.div
        variants={popNode}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-15% 0px" }}
        className={`flex flex-col items-center group w-full z-10 ${isLocked ? 'opacity-60 hover:opacity-100 transition-opacity cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div className="relative w-16 h-16 flex items-center justify-center">
          {isInProgress && (
            <motion.div animate={breathingGlow.animate} transition={breathingGlow.transition} className="absolute inset-0 rounded-full bg-yellow-400/30" />
          )}

          <div className={`
            w-14 h-14 rounded-full flex items-center justify-center relative z-10 transition-transform group-hover:scale-110
            ${isCompleted ? 'bg-primary shadow-[0_4px_14px_rgba(255,215,0,0.4)] border-4 border-white' : ''}
            ${isInProgress ? 'border-4 border-primary bg-white text-yellow-600 font-extrabold text-sm shadow-md' : ''}
            ${isLocked ? 'border-[3px] border-gray-300 bg-gray-50 text-gray-400 shadow-inner' : ''}
          `}>
            {isCompleted && <Check className="text-gray-900 w-6 h-6 stroke-[3]" />}
            {isInProgress && <span>{percentage}</span>}
            {isLocked && <Lock className="w-5 h-5" />}
          </div>
        </div>

        <span className={`
          mt-3 text-sm font-bold px-4 py-1.5 rounded-lg whitespace-nowrap
          ${isCompleted ? 'text-gray-800 bg-white border border-gray-100 shadow-sm group-hover:border-primary transition-colors' : ''}
          ${isInProgress ? 'text-yellow-700 bg-white border border-yellow-200 shadow-sm' : ''}
          ${isLocked ? 'text-gray-500 bg-white/60 border border-gray-200 font-medium' : ''}
        `}>
          {title}
        </span>
      </motion.div>
    );
  };

  const dynamicLineOffset = tracksToDisplay.length > 0 ? `calc(50% / ${tracksToDisplay.length})` : '50%';

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF6] font-sans text-gray-900">
      <Navbar isLoggedIn={true} />

      <main className="flex-grow relative overflow-hidden flex flex-col items-center py-12 z-10">
        <div className="absolute inset-0 pointer-events-none z-0 opacity-40 bg-[radial-gradient(#FDE68A_1.5px,transparent_1.5px)] [background-size:24px_24px]" />

        <div className="text-center z-10 mb-8 mt-4">
          <motion.h1
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-3"
          >
            Skill Mastery
          </motion.h1>
        </div>

        <div className="relative w-full max-w-6xl mx-auto px-4 z-10 mt-8">

          <div className="flex flex-col items-center relative z-20">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }} className="relative z-20 flex flex-col items-center">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <motion.div animate={breathingGlow.animate} transition={breathingGlow.transition} className="absolute inset-0 rounded-full bg-yellow-400/20" />
                <div className="w-20 h-20 rounded-full bg-white border-4 border-primary shadow-lg flex items-center justify-center z-10">
                  <Network className="text-yellow-500 w-10 h-10" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 0.4 }}
              className="h-10 w-[2px] bg-gray-300 origin-top"
            />
          </div>

          {tracksToDisplay.length === 0 ? (
            <div className="text-center mt-12 mb-20">
              <p className="text-xl text-gray-400 font-medium">You haven&apos;t started any skill tracks yet.</p>
              <p className="text-gray-400 mt-2">Generate a new roadmap to begin your journey!</p>
            </div>
          ) : (
            <div className="relative w-full flex flex-col md:flex-row md:justify-center md:items-start">

              <motion.div
                initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.5, delay: 0.4 }}
                className="hidden md:block absolute top-0 h-[2px] bg-gray-300 origin-center"
                style={{ left: dynamicLineOffset, right: dynamicLineOffset }}
              />

              {tracksToDisplay.map((track) => {
                const TrackIcon = iconMap[track.icon];

                return (
                  <div key={track.id} className="flex-1 flex flex-col items-center relative px-2 sm:px-4">

                    <motion.div
                      initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 0.4, delay: 0.9 }}
                      className="hidden md:block h-10 w-[2px] bg-gray-300 origin-top"
                    />

                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={popNode} className="flex flex-col items-center z-20 bg-[#FFFDF6] w-full pt-4 md:pt-0">

                      {/* WRAPPED ICON AND TITLE IN A LINK */}
                      <Link href={`/skill/${track.id}`} className="flex flex-col items-center group cursor-pointer focus:outline-none">
                        <div className="w-20 h-20 rounded-2xl bg-white border border-gray-100 shadow-md flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:border-yellow-400 group-hover:scale-105 transition-all duration-300">
                          {TrackIcon && <TrackIcon className="text-yellow-500 w-10 h-10 group-hover:text-yellow-600 transition-colors" />}
                        </div>
                        <h3 className="text-gray-900 font-display font-bold text-xl whitespace-nowrap text-center group-hover:text-yellow-600 transition-colors">
                          {track.title}
                        </h3>
                      </Link>

                      <span className="text-xs text-yellow-700 font-bold bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full mt-2 border border-yellow-200 shadow-sm uppercase tracking-wider text-center">
                        {track.overallProgress}
                      </span>
                    </motion.div>

                    <div className="relative flex flex-col items-center gap-16 w-full pt-16 mt-4">
                      <motion.div
                        initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true, margin: "0px 0px -20% 0px" }} transition={{ duration: 1.5, ease: "linear" as const }}
                        className="absolute top-0 bottom-[2rem] w-[2px] bg-gray-300 -z-10 origin-top"
                      />

                      {track.skills.map((skill) => (
                        <SkillNode
                          key={skill.id}
                          title={skill.title}
                          status={skill.status}
                          percentage={skill.percentage}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}

            </div>
          )}
        </div>

        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "0px 0px -10% 0px" }} variants={popNode}
          className="mt-24 z-10 pb-10"
        >
          <button className="flex items-center gap-2 px-8 py-4 bg-primary text-gray-900 rounded-full font-bold text-lg hover:bg-yellow-400 transition-all shadow-[0_4px_20px_rgba(255,215,0,0.4)] hover:shadow-[0_8px_25px_rgba(255,215,0,0.6)] transform hover:-translate-y-1 ring-4 ring-yellow-100 active:scale-95">
            <PlusCircle className="w-6 h-6 stroke-[2.5]" />
            Expand My Tree
          </button>
        </motion.div>

      </main>

      <Footer />
    </div>
  );
}