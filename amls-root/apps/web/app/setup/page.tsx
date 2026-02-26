'use client';

import { useState, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, UploadCloud, FileText, Image as ImageIcon,
  GraduationCap, Award, FileUp, Folder, Lightbulb, UserCog
} from 'lucide-react';
import { useStudyTracker } from '@/hooks/useStudyTracker';
import { useAuth } from '@/components/AuthProvider';
import { createClient } from '@/utils/supabase/client';

interface SetupData {
  topic: string;
  experience: string;
  proficiency: string;
  files: File[];
  requirements: string;
}

function SetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const supabase = createClient();

  // If a topic is passed in the URL (e.g., ?topic=Python), we start at step 2. 
  // Otherwise, we start at step 1 for a "New Skill".
  const initialTopic = searchParams.get('topic') || '';
  const [formData, setFormData] = useState<SetupData>({
    topic: initialTopic,
    experience: "",
    proficiency: "",
    files: [],
    requirements: ""
  });
  const [step, setStep] = useState(initialTopic ? 2 : 1);
  const totalSteps = 5;
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Track time spent learning (falling back to "New Skill" if empty string)
  useStudyTracker(formData.topic || "New Skill Exploration");

  const handleNext = async () => {
    if (!formData.topic.trim()) return;

    // If the auth hook is still resolving, we shouldn't act yet.
    if (authLoading) {
      console.log("Auth is still loading, please wait...");
      return;
    }

    if (!user) {
      router.push('/login');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create a new chat session using the topic
      const { data: chatData, error: chatError } = await supabase
        .from('chat')
        .insert([{ user_id: user.id, title: formData.topic.trim() }])
        .select()
        .single();

      if (chatError) throw chatError;

      // 2. Create the first initial message — exactly what the user typed
      if (chatData) {
        const { error: messageError } = await supabase
          .from('messages')
          .insert([{
            chat_id: chatData.id,
            role: 'user',
            content: formData.topic.trim(),
            type: 'text'
          }]);

        if (messageError) throw messageError;
      }

      // 3. Redirect to the chat page directly
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
            key="bg-icons"
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
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleNext()}
              placeholder="e.g., Python Programming, Digital Marketing..."
              className="w-full max-w-lg p-5 rounded-2xl border-2 border-gray-100 hover:border-gray-200 focus:border-[#FFD700] outline-none shadow-sm text-lg transition-colors bg-white/90 backdrop-blur-sm"
              autoFocus
            />
          </motion.div>
        </AnimatePresence>

        <motion.div className="mt-12" layout>
          <button
            onClick={handleNext}
            disabled={isSubmitting || !formData.topic.trim()}
            className="px-10 py-4 rounded-full bg-[#FFD700] hover:bg-[#E6C200] text-gray-900 font-bold text-lg flex items-center gap-2 shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Starting..." : "Start Exploring 🚀"}
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