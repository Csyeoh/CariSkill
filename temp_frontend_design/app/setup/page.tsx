'use client';

import { useState, useEffect, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, UploadCloud, FileText, Image as ImageIcon, 
  GraduationCap, Award, FileUp, Folder, Lightbulb, UserCog
} from 'lucide-react';

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
  
  // If a topic is passed in the URL (e.g., ?topic=Python), we start at step 2. 
  // Otherwise, we start at step 1 for a "New Skill".
  const initialTopic = searchParams.get('topic') || '';
  const initialStep = initialTopic ? 2 : 1;

  const [step, setStep] = useState(initialStep);
  const [formData, setFormData] = useState<SetupData>({
    topic: initialTopic,
    experience: '',
    proficiency: '',
    files: [],
    requirements: ''
  });

  const totalSteps = 5;

  const handleNext = () => {
  if (step < totalSteps) {
    setStep(prev => prev + 1);
  } else {
    // Route to the loading screen
    router.push(`/setup/loading?topic=${encodeURIComponent(formData.topic)}`);
  }
};

  const slideVariants = {
    enter: { x: 40, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -40, opacity: 0 }
  };

  const getBackgroundIcons = () => {
    switch (step) {
      case 1:
      case 2:
      case 3:
        return (
          <>
            <GraduationCap className="absolute left-[5%] md:left-[10%] top-[45%] w-32 h-32 text-[#FFD700] opacity-20 -rotate-12" />
            <Award className="absolute right-[5%] md:right-[10%] top-[55%] w-32 h-32 text-[#FFD700] opacity-20 rotate-12" />
          </>
        );
      case 4:
        return (
          <>
            <FileUp className="absolute left-[8%] md:left-[12%] top-[40%] w-28 h-28 text-[#FFD700] opacity-20 -rotate-6" />
            <Folder className="absolute right-[8%] md:right-[12%] top-[60%] w-28 h-28 text-[#FFD700] opacity-20 rotate-6" />
          </>
        );
      case 5:
        return (
          <>
            <UserCog className="absolute left-[5%] md:left-[10%] top-[50%] w-32 h-32 text-[#FFD700] opacity-20 -rotate-12" />
            <Lightbulb className="absolute right-[5%] md:right-[10%] top-[60%] w-24 h-24 text-[#FFD700] opacity-20 rotate-12" />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <main className="flex-grow relative flex flex-col items-center justify-center py-12 px-4 h-full min-h-[calc(100vh-5rem)]">
      <div className="absolute inset-0 pointer-events-none z-0 opacity-30 bg-[radial-gradient(#FDE68A_1.5px,transparent_1.5px)] [background-size:24px_24px]" />
      
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div 
            key={step}
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            {getBackgroundIcons()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress Bar (Now 5 steps) */}
      <div className="w-full max-w-sm mx-auto z-10 absolute top-12 flex items-center justify-center gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div 
            key={i} 
            className={`h-2 rounded-full transition-all duration-500 ${
              i <= step ? 'bg-[#FFD700] w-12' : 'bg-gray-200 w-8'
            }`}
          />
        ))}
      </div>

      <div className="w-full max-w-3xl z-10 flex flex-col items-center mt-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={slideVariants}
            initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full flex flex-col items-center text-center"
          >
            
            {/* NEW STEP 1: Topic */}
            {step === 1 && (
              <>
                <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                  What do you want to learn?
                </h1>
                <p className="text-gray-500 text-lg mb-12 max-w-md">
                  Tell us the topic or goal, and our AI will build your personalized path.
                </p>
                
                <input 
                  type="text" 
                  value={formData.topic}
                  onChange={(e) => setFormData({...formData, topic: e.target.value})}
                  onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                  placeholder="e.g., Python Programming, Digital Marketing..." 
                  className="w-full max-w-lg p-5 rounded-2xl border-2 border-gray-100 hover:border-gray-200 focus:border-[#FFD700] outline-none shadow-sm text-lg transition-colors bg-white/90 backdrop-blur-sm"
                  autoFocus
                />
              </>
            )}

            {/* STEP 2: Experience */}
            {step === 2 && (
              <>
                <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                  Have you learned<br />this topic before?
                </h1>
                <p className="text-gray-500 text-lg mb-12 max-w-md">
                  Tell us briefly about your past experience so we can adjust the content difficulty.
                </p>
                
                <input 
                  type="text" 
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                  onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                  placeholder="Enter your experience..." 
                  className="w-full max-w-lg p-5 rounded-2xl border-2 border-gray-100 hover:border-gray-200 focus:border-[#FFD700] outline-none shadow-sm text-lg transition-colors bg-white/90 backdrop-blur-sm"
                  autoFocus
                />
              </>
            )}

            {/* STEP 3: Proficiency */}
            {step === 3 && (
              <>
                <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                  What is your current<br />proficiency level?
                </h1>
                <p className="text-gray-500 text-lg mb-12 max-w-md">
                  This helps us tailor the learning roadmap to your exact starting point.
                </p>
                
                <div className="w-full max-w-lg relative">
                  <select 
                    value={formData.proficiency}
                    onChange={(e) => setFormData({...formData, proficiency: e.target.value})}
                    className="w-full p-5 rounded-2xl border-2 border-gray-100 hover:border-gray-200 focus:border-[#FFD700] outline-none shadow-sm text-lg appearance-none bg-white/90 backdrop-blur-sm cursor-pointer transition-colors text-gray-700 font-medium"
                  >
                    <option value="" disabled>Select your level...</option>
                    <option value="beginner">Beginner (No prior knowledge)</option>
                    <option value="intermediate">Intermediate (Some basic knowledge)</option>
                    <option value="advanced">Advanced (Looking for deep dives)</option>
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg width="16" height="10" viewBox="0 0 16 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 2L8 8L14 2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </>
            )}

            {/* STEP 4: Files */}
            {step === 4 && (
              <>
                <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                  Do you have any related<br />study materials?
                </h1>
                <p className="text-gray-500 text-lg mb-12 max-w-lg">
                  Upload your notes, past exams, or syllabus. We'll analyze them to personalize your curriculum.
                </p>
                
                <div className="w-full max-w-2xl bg-white/70 backdrop-blur-md rounded-[32px] border-2 border-dashed border-gray-300 p-12 flex flex-col items-center hover:border-[#FFD700] transition-colors cursor-pointer group">
                  <div className="w-20 h-20 bg-[#FEF9C3] rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-8 h-8 text-[#A16207]" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-gray-900 mb-2">Drag & drop files here</h3>
                  <p className="text-gray-400 text-sm mb-8">Supported formats: PDF, DOCX, TXT (Max 10MB)</p>
                  
                  <button className="bg-[#FFD700] hover:bg-[#E6C200] text-gray-900 font-bold py-3.5 px-8 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2">
                    <Folder className="w-5 h-5 fill-current" />
                    Browse Files
                  </button>

                  <div className="flex gap-4 mt-8 text-gray-300">
                    <FileText className="w-6 h-6" />
                    <ImageIcon className="w-6 h-6" />
                    <FileUp className="w-6 h-6" />
                  </div>
                </div>
              </>
            )}

            {/* STEP 5: Requirements */}
            {step === 5 && (
              <>
                <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                  Any specific requirements?
                </h1>
                <p className="text-gray-500 text-lg mb-10 max-w-lg">
                  Let us know if you have any preferences, constraints, or specific goals so we can fine-tune your roadmap.
                </p>
                
                <div className="w-full max-w-2xl relative">
                  <textarea 
                    value={formData.requirements}
                    onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                    placeholder="e.g., I prefer video tutorials over reading, I can only study on weekends, I want to focus on practical projects..." 
                    className="w-full p-6 rounded-3xl border-2 border-gray-100 hover:border-gray-200 focus:border-[#FFD700] outline-none shadow-sm h-48 resize-none text-lg transition-colors bg-white/90 backdrop-blur-sm"
                  />
                  <span className="absolute bottom-5 right-6 text-gray-400 text-sm font-medium">Optional</span>
                </div>
              </>
            )}

          </motion.div>
        </AnimatePresence>

        <motion.div className="mt-12" layout>
          {step < totalSteps ? (
            <button 
              onClick={handleNext}
              disabled={step === 1 && !formData.topic.trim()} // Disable next on step 1 if empty
              className="w-16 h-16 rounded-full bg-[#FFD700] hover:bg-[#E6C200] text-gray-900 flex items-center justify-center shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowRight className="w-8 h-8" />
            </button>
          ) : (
            <button 
              onClick={handleNext}
              className="px-10 py-4 rounded-full bg-[#FFD700] hover:bg-[#E6C200] text-gray-900 font-bold text-lg flex items-center gap-2 shadow-lg transition-transform active:scale-95"
            >
              Start Learning 🚀
            </button>
          )}
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