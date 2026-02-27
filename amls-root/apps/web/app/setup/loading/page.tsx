'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { createClient } from '@/utils/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings, Sparkles, Brain, Lightbulb,
  GraduationCap
} from 'lucide-react';

const messages = [
  "Analyzing your background...",
  "Curating the best resources...",
  "Assembling daily tasks...",
  "Personalizing your curriculum...",
  "Finalizing your roadmap..."
];

// --- Helper Functions for Roadmap Generation ---
const preInsertRoadmapDB = async (supabase: any, userId: string, activeTopic: string) => {
  const { data, error } = await supabase.from('roadmaps').insert({
    user_id: userId,
    topic: activeTopic,
    content: { status: "generating" }
  }).select().single();

  if (error) {
    console.warn("Failed to pre-insert roadmap:", error);
    return null;
  }
  return data;
};

const fetchRoadmapFromAI = async (sessionId: string, activeTopic: string, payload: any) => {
  const Url = 'http://localhost:8000';
  const response = await fetch(`${Url}/api/start_macro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: sessionId,
      topic: activeTopic,
      experience: payload.experience || "Beginner",
      goal: payload.goal || "None",
      constraints: payload.constraints || "None"
    })
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(`Master Flow API Failed with status ${response.status}: ${text}`);
    throw new Error('Failed to start master flow');
  }

  return response.json();
};

const parseRoadmapData = (rawResult: any) => {
  let parsedRoadmap;
  try {
    const targetPayload = rawResult.state?.blueprint || rawResult.roadmap?.roadmap || rawResult.roadmap || rawResult;
    parsedRoadmap = typeof targetPayload === 'string'
      ? JSON.parse(targetPayload)
      : targetPayload;
  } catch (e) {
    console.error("Failed to parse raw roadmap JSON:", e);
    const fallbackStr = rawResult.roadmap || rawResult;
    parsedRoadmap = typeof fallbackStr === 'string' ? { error_unparsed_raw_text: fallbackStr } : fallbackStr;
  }

  if (!parsedRoadmap) throw new Error("Parsed roadmap payload is null or undefined!");
  return parsedRoadmap;
};

const updateRoadmapDB = async (supabase: any, dbRecordId: string, activeTopic: string, parsedRoadmap: any, totalTimeMinutes: number) => {
  const finalPayload = { topic: activeTopic, roadmap: parsedRoadmap, time: totalTimeMinutes };
  const { error } = await supabase.from('roadmaps').update({ content: finalPayload, time: totalTimeMinutes }).eq('id', dbRecordId);
  if (error) console.error("Failed to update roadmap in Supabase:", error);
};

const insertMicroTopicsDB = async (supabase: any, dbRecordId: string, rawResult: any) => {
  const courseContent = rawResult.state?.completed_modules || rawResult.course_content || rawResult.response?.course_content || [];
  if (!courseContent || courseContent.length === 0) return;

  const microInsertions: any[] = [];
  courseContent.forEach((module: any) => {
    if (module.micro_topics && Array.isArray(module.micro_topics)) {
      module.micro_topics.forEach((topic: any) => {
        microInsertions.push({
          roadmap_id: dbRecordId,
          macro_node_id: module.node_id,
          content: topic
        });
      });
    }
  });

  if (microInsertions.length > 0) {
    const { error } = await supabase.from('micro_topics_contents').insert(microInsertions);
    if (error) console.error("Failed to insert micro topics into Supabase:", error);
  }
};

function LoadingRoadmapContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [topic, setTopic] = useState("");
  const hasGenerated = useRef(false);

  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Read from localStorage without searchParams
    const payloadStr = localStorage.getItem('generation_payload');
    let payload = { topic: "", experience: "Beginner", goal: "None", constraints: "None", session_id: "" };
    try {
      if (payloadStr) payload = JSON.parse(payloadStr);
    } catch (e) { }

    const activeTopic = payload.topic || "";
    setTopic(activeTopic);

    // ALWAYS start the intervals regardless of StrictMode so the UI updates
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 1500);

    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev >= 95 ? 95 : prev + 1));
    }, 950); // Slower progress (95 * ~950ms ≈ 90s)

    const generateRoadmap = async () => {
      try {
        const sessionId = payload.session_id || `temp-${Date.now()}`;
        let targetSkillId = activeTopic.toLowerCase().replace(/ /g, '-');

        const supabase = createClient();
        let dbRecordId: string | null = null;

        // 1. Pre-insert to DB if user exists
        if (user) {
          const record = await preInsertRoadmapDB(supabase, user.id, activeTopic);
          if (record) {
            dbRecordId = record.id;
            targetSkillId = record.id;
          }
        }

        // 2. Fetch from Master Flow API
        const rawResult = await fetchRoadmapFromAI(sessionId, activeTopic, payload);
        console.log("Raw API Response:", rawResult);

        // 3. Parse roadmap safely
        const parsedRoadmap = parseRoadmapData(rawResult);

        // 3.5 Calculate total time
        let totalTimeMinutes = 0;
        const courseContent = rawResult.state?.completed_modules || rawResult.course_content || rawResult.response?.course_content || [];
        if (courseContent && courseContent.length > 0) {
          courseContent.forEach((module: any) => {
            if (module.micro_topics && Array.isArray(module.micro_topics)) {
              module.micro_topics.forEach((topic: any) => {
                if (topic.topic_total_time_minutes) {
                  totalTimeMinutes += topic.topic_total_time_minutes;
                }
              });
            }
          });
        }

        // Inject total time into the parsed object so the overview page can fetch it easily
        parsedRoadmap.estimatedTimeMinutes = totalTimeMinutes;

        // 4. Update the DB and save micro topics
        if (user && dbRecordId) {
          await updateRoadmapDB(supabase, dbRecordId, activeTopic, parsedRoadmap, totalTimeMinutes);
          await insertMicroTopicsDB(supabase, dbRecordId, rawResult);
        }

        // 5. Finalize UI navigation
        localStorage.setItem(`roadmap_${targetSkillId}`, JSON.stringify(parsedRoadmap));
        setProgress(100);
        setTimeout(() => {
          router.push(`/skill/${targetSkillId}/overview`);
        }, 500);

      } catch (error: any) {
        console.error("Roadmap generation failed:", error);
        alert(`Generation Failed: ${error.message}`);
      }
    };

    // Only trigger roadmap generation once
    if (!hasGenerated.current) {
      hasGenerated.current = true;
      generateRoadmap();
    }

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, [router]);

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

export default function LoadingRoadmapPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoadingRoadmapContent />
    </Suspense>
  );
}