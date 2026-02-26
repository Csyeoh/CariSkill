'use client';

import { useState, useEffect, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRouter } from 'next/navigation';
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

function LoadingRoadmapContent() {
  const router = useRouter();
  const [topic, setTopic] = useState("");

  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Read from localStorage without searchParams
    const payloadStr = localStorage.getItem('generation_payload');
    const payload = payloadStr ? JSON.parse(payloadStr) : {};
    const activeTopic = payload.topic || "";
    setTopic(activeTopic);
    const skillId = activeTopic.toLowerCase().replace(/ /g, '-');

    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 1500);

    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev >= 95 ? 95 : prev + 1));
    }, 600); // Slower progress while waiting for 50s backend

    const generateRoadmap = async () => {
      try {
        const payloadStr = localStorage.getItem('generation_payload');
        const payload = payloadStr ? JSON.parse(payloadStr) : {};
        const activeTopic = payload.topic || "";
        const experience = payload.experience || "Beginner";
        const goal = payload.goal || "None";
        const constraints = payload.constraints || "None";
        const sessionId = payload.session_id || `temp-${Date.now()}`;

        const workerUrl = 'http://localhost:8000';
        const response = await fetch(`${workerUrl}/api/start_macro`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            topic: activeTopic,
            experience: experience,
            goal: goal,
            constraints: constraints
          })
        });

        if (!response.ok) {
          const text = await response.text();
          console.error(`Master Flow API Failed with status ${response.status}: ${text}`);
          throw new Error('Failed to start master flow');
        }

        const rawResult = await response.json();
        console.log("Raw API Response:", rawResult);

        if (rawResult.status === "error") {
          console.error("Backend returned an explicit error:", rawResult.message);
          throw new Error(rawResult.message || "The AI generated an invalid response.");
        }

        let parsedRoadmap;
        try {
          const targetPayload = rawResult.state?.blueprint || rawResult.roadmap?.roadmap || rawResult.roadmap || rawResult;
          parsedRoadmap = typeof targetPayload === 'string'
            ? JSON.parse(targetPayload)
            : targetPayload;
        } catch (e) {
          console.error("Failed to parse raw roadmap JSON:", e);
          const fallbackStr = rawResult.roadmap || rawResult;
          // Supabase JSONB expects an object. If the payload is a raw string/invalid JSON, wrap it!
          parsedRoadmap = typeof fallbackStr === 'string' ? { error_unparsed_raw_text: fallbackStr } : fallbackStr;
        }

        if (!parsedRoadmap) {
          throw new Error("Parsed roadmap payload is null or undefined!");
        }

        // Always save to localStorage as a fallback for immediate rendering/guests
        localStorage.setItem(`roadmap_${skillId}`, JSON.stringify(parsedRoadmap));

        // Try to save to Supabase if the user is logged in
        try {
          const { createClient } = await import('@/utils/supabase/client');
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();

          if (user) {
            console.log("Attempting to save to Supabase for User:", user.id);

            // The frontend overview page expects an object structure, but Supabase stores it in a jsonb column
            // We should wrap the payload to ensure it is always a valid JSON object matching our schema
            const finalPayload = {
              topic: topic,
              roadmap: parsedRoadmap
            };

            const { error: insertError } = await supabase.from('roadmaps').insert({
              user_id: user.id,
              topic: topic,
              content: finalPayload
            });
            if (insertError) {
              console.error("Failed to save roadmap to Supabase | Code:", insertError.code, "Message:", insertError.message, "Details:", insertError.details);
              // Fallback: try inserting as stringified json
              const { error: retryError } = await supabase.from('roadmaps').insert({
                user_id: user.id,
                topic: topic,
                content: JSON.stringify(finalPayload)
              });
              if (retryError) console.error("Retry insert failed | Code:", retryError.code, "Message:", retryError.message, "Details:", retryError.details);
            } else {
              console.log("Roadmap permanently saved to Supabase cloud!");
            }
          }
        } catch (dbError) {
          console.error("Supabase integration error:", dbError);
        }

        setProgress(100);
        setTimeout(() => {
          router.push(`/skill/${skillId}/overview`);
        }, 500);

      } catch (error: any) {
        console.error("Roadmap generation failed:", error);
        // Display the direct 500 error or CrewAI Error to the user
        alert(`Generation Failed: ${error.message}`);
      }
    };

    generateRoadmap();

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