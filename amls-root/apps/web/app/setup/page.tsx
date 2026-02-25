'use client';

import { useState, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, GraduationCap, Award } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/utils/supabase/client';

function SetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const supabase = createClient();

  const initialTopic = searchParams.get('topic') || '';
  const [topic, setTopic] = useState(initialTopic);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!topic.trim()) return;
    if (!user) {
      router.push('/login');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create a new chat session
      const { data: chatData, error: chatError } = await supabase
        .from('chat')
        .insert([{ user_id: user.id, title: topic.trim() }])
        .select()
        .single();

      if (chatError) throw chatError;

      // 2. Create the first message from the user
      if (chatData) {
        const { error: messageError } = await supabase
          .from('messages')
          .insert([{
            chat_id: chatData.id,
            role: 'user',
            content: topic.trim(),
            type: 'text'
          }]);

        if (messageError) throw messageError;
      }

      // 3. Redirect to the chat page
      router.push(`/chat?id=${chatData.id}`);
    } catch (error) {
      console.error('Error creating chat session:', error);
      setIsSubmitting(false);
    }
  };

  const slideVariants = {
    enter: { x: 40, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -40, opacity: 0 }
  };

  return (
    <main className="flex-grow relative flex flex-col items-center justify-center py-12 px-4 h-full min-h-[calc(100vh-5rem)]">
      <div className="absolute inset-0 pointer-events-none z-0 opacity-30 bg-[radial-gradient(#FDE68A_1.5px,transparent_1.5px)] [background-size:24px_24px]" />

      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <GraduationCap className="absolute left-[5%] md:left-[10%] top-[45%] w-32 h-32 text-[#FFD700] opacity-20 -rotate-12" />
            <Award className="absolute right-[5%] md:right-[10%] top-[55%] w-32 h-32 text-[#FFD700] opacity-20 rotate-12" />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="w-full max-w-3xl z-10 flex flex-col items-center mt-12">
        <AnimatePresence mode="wait">
          <motion.div
            variants={slideVariants}
            initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full flex flex-col items-center text-center"
          >
            <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              What do you want to learn?
            </h1>
            <p className="text-gray-500 text-lg mb-12 max-w-md">
              Tell us the topic or goal, and our AI will build your personalized path.
            </p>

            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              disabled={isSubmitting || authLoading}
              placeholder="e.g., Python Programming, Digital Marketing..."
              className="w-full max-w-lg p-5 rounded-2xl border-2 border-gray-100 hover:border-gray-200 focus:border-[#FFD700] outline-none shadow-sm text-lg transition-colors bg-white/90 backdrop-blur-sm"
              autoFocus
            />
          </motion.div>
        </AnimatePresence>

        <motion.div className="mt-12" layout>
          <button
            onClick={handleSubmit}
            disabled={!topic.trim() || isSubmitting || authLoading}
            className="w-16 h-16 rounded-full bg-[#FFD700] hover:bg-[#E6C200] text-gray-900 flex items-center justify-center shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="animate-spin w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full"></div>
            ) : (
              <ArrowRight className="w-8 h-8" />
            )}
          </button>
        </motion.div>
      </div>
    </main>
  );
}

// Wrapper to handle useSearchParams safely
export default function SetupPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF6] font-sans text-gray-900 overflow-hidden">
      <Navbar isLoggedIn={true} />
      <Suspense fallback={<div className="flex-grow flex items-center justify-center">Loading...</div>}>
        <SetupContent />
      </Suspense>
      <Footer />
    </div>
  );
}