'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, Sparkles, Brain, Lightbulb, 
  GraduationCap, BookOpen, Loader2 
} from 'lucide-react';

const messages = [
  "Analyzing your background...",
  "Curating the best resources...",
  "Assembling daily tasks...",
  "Personalizing your curriculum...",
  "Finalizing your roadmap..."
];

export default function LoadingRoadmapPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const topic = searchParams.get('topic') || "Skill";
  
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 1. Get the topic from URL and create a URL-friendly ID (slug)
    const topic = searchParams.get('topic') || "skill";
    const skillId = topic.toLowerCase().replace(/ /g, '-'); // e.g., "Python Programming" -> "python-programming"

    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 1500);

    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 100 : prev + 1));
    }, 60);

    const redirectTimeout = setTimeout(() => {
      // 2. Use the generated 'skillId' here instead of the undefined 'id'
      router.push(`/skill/${skillId}/overview`); 
    }, 6500);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
      clearTimeout(redirectTimeout);
    };
  }, [router, searchParams]); // Added searchParams to dependency array

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF6] font-sans text-gray-900 overflow-hidden">
      {/* Dimmed Navbar */}
      <div className="opacity-40 pointer-events-none">
        <Navbar isLoggedIn={true} />
      </div>

      <main className="flex-grow bg-pattern relative flex flex-col items-center justify-center py-12 px-4 overflow-hidden">
        
        {/* Floating Background Icons */}
        <motion.div 
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-10 top-1/4 opacity-10 hidden lg:block"
        >
          <Brain className="w-32 h-32 text-[#CA8A04]" />
        </motion.div>
        
        <motion.div 
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute right-12 bottom-1/4 opacity-10 hidden lg:block"
        >
          <Lightbulb className="w-32 h-32 text-[#CA8A04]" />
        </motion.div>

        <motion.div 
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-1/4 bottom-10 opacity-5 hidden lg:block"
        >
          <GraduationCap className="w-24 h-24 text-[#CA8A04]" />
        </motion.div>

        {/* Central Loading Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg bg-white/60 backdrop-blur-xl rounded-[40px] p-12 shadow-2xl border border-white/50 flex flex-col items-center text-center relative z-10"
        >
          {/* Animated Icon Logic */}
          <div className="relative w-40 h-40 mb-10 flex items-center justify-center">
            {/* Outer Rings */}
            <div className="absolute inset-0 bg-yellow-200/40 rounded-full animate-ping opacity-75" />
            <div className="absolute inset-4 bg-[#FEF9C3] rounded-full animate-pulse" />
            
            {/* Main Icon Container */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="relative z-10 bg-gradient-to-br from-[#FFD700] to-[#E6C200] p-7 rounded-[32px] shadow-xl border-4 border-white transform rotate-3"
            >
              <Settings className="w-16 h-16 text-gray-900 stroke-[1.5]" />
              <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-white animate-pulse" />
            </motion.div>

            {/* Floating Dots */}
            <div className="absolute top-0 right-0 h-3 w-3 bg-[#FFD700] rounded-full animate-bounce" />
            <div className="absolute bottom-2 left-2 h-2 w-2 bg-[#B45309] rounded-full animate-bounce delay-150" />
          </div>

          <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            Building your perfect {topic} roadmap...
          </h1>

          {/* Cycling Message Display */}
          <div className="h-8 mb-10 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.p 
                key={messageIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-gray-500 text-lg font-medium"
              >
                {messages[messageIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-100 rounded-full h-3 mb-4 overflow-hidden shadow-inner p-[1px]">
            <motion.div 
              className="bg-[#FFD700] h-full rounded-full shadow-[0_0_15px_rgba(255,215,0,0.6)]"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "linear" }}
            />
          </div>

          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-2">
            AI Processing Unit Active
          </p>
        </motion.div>
      </main>

      {/* Dimmed Footer */}
      <div className="opacity-60 pointer-events-none">
        <Footer />
      </div>
    </div>
  );
}