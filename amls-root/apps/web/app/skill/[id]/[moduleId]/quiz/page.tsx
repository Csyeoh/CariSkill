'use client';

import { use, useState, useEffect, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { quizSets } from '@/lib/quiz-data';
import { notFound, useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Bookmark, 
  BookOpen, Lightbulb, HelpCircle, CheckCircle2, XCircle
} from 'lucide-react';

// Wrapper component to safely use useSearchParams
function QuizContent({ id, moduleId }: { id: string, moduleId: string }) {
  const data = quizSets[moduleId];
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Check if we arrived via "Review Mistakes"
  const isReviewMode = searchParams.get('mode') === 'review';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // If in review mode, automatically reveal the answers
  useEffect(() => {
    if (isReviewMode) {
      setIsSubmitted(true);
      // We don't know what they originally selected, but we can highlight the correct answer
      setSelectedOption(data?.questions[currentIndex]?.correctAnswerIndex || null);
    }
  }, [isReviewMode, currentIndex, data]);

  if (!data) return notFound();

  const totalQuestions = data.questions.length;
  const currentQuestion = data.questions[currentIndex];
  const isCorrect = selectedOption === currentQuestion.correctAnswerIndex;

  const handleSelect = (idx: number) => {
    if (!isSubmitted) {
      setSelectedOption(idx);
      setIsSubmitted(true);
      setShowHint(false); 
      if (idx === currentQuestion.correctAnswerIndex) {
        setScore(prev => prev + 1);
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
      // Only reset states if we are NOT in review mode
      if (!isReviewMode) {
        setSelectedOption(null);
        setIsSubmitted(false);
      }
      setShowHint(false); 
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      // Only reset states if we are NOT in review mode
      if (!isReviewMode) {
        setSelectedOption(null);
        setIsSubmitted(false);
      }
      setShowHint(false); 
    }
  };

  const labels = ['A', 'B', 'C', 'D'];

  return (
    <main className="flex-grow relative flex flex-col items-center py-8 px-4 h-full min-h-[calc(100vh-5rem)]">
      <div className="absolute inset-0 pointer-events-none z-0 opacity-30 bg-[radial-gradient(#FDE68A_1.5px,transparent_1.5px)] [background-size:24px_24px]" />

      <div className="text-center z-10 mb-8 max-w-3xl w-full">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-6">
          {isReviewMode ? `Reviewing: ${data.title}` : data.title}
        </h1>
        
        <div className="flex items-center justify-center w-full max-w-lg mx-auto mb-4">
          <div className="relative w-full flex items-center justify-between">
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-gray-200 z-0" />
            
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-[#FFD700] z-0 transition-all duration-500" 
              style={{ width: totalQuestions > 1 ? `${(currentIndex / (totalQuestions - 1)) * 100}%` : '100%' }} 
            />
            
            {data.questions.map((_, idx) => (
              <div 
                key={idx} 
                className={`relative z-10 rounded-full transition-all duration-300 shadow-sm
                  ${idx < currentIndex ? 'w-4 h-4 border-2 border-[#FFD700] bg-[#FFD700]' : ''}
                  ${idx === currentIndex ? 'w-5 h-5 border-[3px] border-[#FFD700] bg-white ring-4 ring-[#FEF9C3] scale-110' : ''}
                  ${idx > currentIndex ? 'w-4 h-4 border-2 border-gray-300 bg-white' : ''}
                `}
              />
            ))}
          </div>
        </div>
        <p className="text-sm text-gray-500 font-medium">Question {currentIndex + 1} of {totalQuestions}</p>
      </div>

      <div className="w-full max-w-6xl mx-auto flex flex-col items-center gap-6 relative z-10">
        <div className="w-full flex items-center justify-center gap-4 md:gap-8">
          
          <button 
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="hidden md:flex items-center justify-center w-14 h-14 shrink-0 text-gray-400 hover:text-[#CA8A04] transition-all duration-200 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-10 h-10" />
          </button>

          <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl border border-gray-100 flex flex-col relative overflow-hidden p-8 md:p-10 min-h-[400px]">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#FFD700] to-[#E6C200]" />
            
            <div className="mb-8">
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wide rounded-full mb-4">
                {isReviewMode ? 'Review Mode' : 'Multiple Choice'}
              </span>
              <AnimatePresence mode="wait">
                <motion.h2 
                  key={currentQuestion.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="font-display text-2xl md:text-3xl font-bold text-gray-900 leading-tight"
                >
                  {currentQuestion.question}
                </motion.h2>
              </AnimatePresence>
            </div>

            <div className="grid grid-cols-1 gap-3 w-full pb-8">
              {currentQuestion.options.map((option, idx) => {
                let btnStateClass = "border-gray-100 hover:border-[#FFD700]/50 bg-white group";
                let letterStateClass = "bg-gray-100 text-gray-600 group-hover:bg-[#FFD700] group-hover:text-gray-900";
                
                if (isSubmitted) {
                  if (idx === currentQuestion.correctAnswerIndex) {
                    btnStateClass = "border-green-500 bg-green-50 text-green-900";
                    letterStateClass = "bg-green-500 text-white";
                  } else if (idx === selectedOption && !isReviewMode) {
                    // Only show red if they actually guessed it wrong (not in review mode)
                    btnStateClass = "border-red-500 bg-red-50 text-red-900";
                    letterStateClass = "bg-red-500 text-white";
                  } else {
                    btnStateClass = "border-gray-100 opacity-50 bg-white";
                    letterStateClass = "bg-gray-100 text-gray-400";
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    disabled={isSubmitted || isReviewMode}
                    className={`flex items-center w-full p-4 text-left border-2 rounded-2xl transition-all duration-200 focus:outline-none ${btnStateClass}`}
                  >
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full font-bold flex items-center justify-center mr-4 transition-colors ${letterStateClass}`}>
                      {labels[idx]}
                    </div>
                    <span className="text-lg font-medium flex-grow">{option}</span>
                    
                    {isSubmitted && idx === currentQuestion.correctAnswerIndex && (
                      <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0 ml-2" />
                    )}
                    {isSubmitted && idx === selectedOption && !isReviewMode && idx !== currentQuestion.correctAnswerIndex && (
                      <XCircle className="w-6 h-6 text-red-600 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Hint Display Area (Hidden in Review Mode since answer is shown) */}
            <AnimatePresence>
              {showHint && !isSubmitted && !isReviewMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-[#FEF9C3] border border-[#FDE68A] rounded-xl p-4 flex items-start gap-3 mb-8">
                    <Lightbulb className="w-5 h-5 text-[#CA8A04] shrink-0 mt-0.5" />
                    <p className="text-[#854D0E] text-sm font-medium leading-relaxed">
                      {currentQuestion.hint}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="absolute bottom-6 right-6 flex gap-3 z-10">
              <button 
                onClick={() => setShowHint(!showHint)}
                disabled={isSubmitted || isReviewMode}
                className={`w-10 h-10 flex items-center justify-center rounded-full transition-all shadow-sm group ${showHint ? 'bg-[#FFD700] text-gray-900 border-[#E6C200]' : 'bg-white text-gray-400 hover:text-[#CA8A04] hover:bg-[#FEF9C3] border-gray-200'} disabled:opacity-50 disabled:cursor-not-allowed`} 
                title="Need a hint?"
              >
                <Lightbulb className={`w-5 h-5 ${(!showHint && !isSubmitted && !isReviewMode) && 'group-hover:animate-pulse'}`} />
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-gray-400 hover:text-blue-500 hover:bg-blue-50 border border-gray-200 transition-all shadow-sm group" title="Get help">
                <HelpCircle className="w-5 h-5" />
              </button>
            </div>
          </div>

          <button 
            onClick={handleNext}
            disabled={currentIndex === totalQuestions - 1 || (!isSubmitted && !isReviewMode)}
            className="hidden md:flex items-center justify-center w-14 h-14 shrink-0 text-gray-400 hover:text-[#CA8A04] transition-all duration-200 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-10 h-10" />
          </button>
        </div>

        <div className="w-full max-w-2xl mx-auto min-h-[4rem] flex items-center justify-center text-center px-4">
          <AnimatePresence mode="wait">
            {isSubmitted || isReviewMode ? (
              <motion.div 
                key="explanation"
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className={`text-sm md:text-base font-medium rounded-xl p-4 border ${isCorrect || isReviewMode ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}
              >
                {!isReviewMode && <strong className="block mb-1">{isCorrect ? 'Spot on!' : 'Not quite.'}</strong>}
                {isReviewMode && <strong className="block mb-1">Explanation:</strong>}
                {currentQuestion.explanation}
              </motion.div>
            ) : (
              <motion.p 
                key="placeholder"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-gray-500 italic opacity-60"
              >
                (Explanation will appear here after answering)
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="flex gap-4 mt-2 mb-6">
          <button 
            onClick={() => router.push(`/skill/${id}/${moduleId}/materials`)}
            className="flex flex-col items-center gap-1 group" title="Materials"
          >
            <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white text-gray-600 group-hover:text-[#CA8A04] group-hover:bg-[#FEF9C3] border border-gray-200 transition-all shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
          </button>
          <button 
            onClick={() => setIsBookmarked(!isBookmarked)}
            className="flex flex-col items-center gap-1 group" title="Bookmark"
          >
            <div className={`w-12 h-12 flex items-center justify-center rounded-2xl border transition-all shadow-sm ${
              isBookmarked ? 'bg-[#FFD700] text-white border-[#E6C200]' : 'bg-white text-gray-600 hover:text-[#CA8A04] hover:bg-[#FEF9C3] border-gray-200'
            }`}>
              <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
            </div>
          </button>
        </div>

        <AnimatePresence>
          {!isReviewMode && isSubmitted && currentIndex === totalQuestions - 1 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <button 
                onClick={() => router.push(`/skill/${id}/${moduleId}/quiz/summary?score=${score}`)}
                className="flex items-center gap-2 px-8 py-3.5 bg-[#FFD700] hover:bg-[#E6C200] text-gray-900 rounded-full font-bold shadow-lg transition-all active:scale-95"
              >
                View Results
                <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {isReviewMode && currentIndex === totalQuestions - 1 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <button 
                onClick={() => router.push(`/skill/${id}`)}
                className="flex items-center gap-2 px-8 py-3.5 bg-gray-900 hover:bg-gray-800 text-white rounded-full font-bold shadow-lg transition-all active:scale-95"
              >
                Return to Roadmap
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      <div className="flex md:hidden justify-between w-full max-w-md px-4 mt-auto mb-6">
        <button 
          onClick={handlePrev} disabled={currentIndex === 0}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-white border border-gray-200 text-gray-600 shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button 
          onClick={handleNext} disabled={currentIndex === totalQuestions - 1 || (!isSubmitted && !isReviewMode)}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-[#FFD700] text-gray-900 shadow-md disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </main>
  );
}

// Export a wrapped component with Suspense boundary
export default function QuizPage({ params }: { params: Promise<{ id: string, moduleId: string }> }) {
  const { id, moduleId } = use(params);

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF6] font-sans text-gray-900">
      <Navbar isLoggedIn={true} />
      <Suspense fallback={<div className="flex-grow flex items-center justify-center">Loading quiz...</div>}>
        <QuizContent id={id} moduleId={moduleId} />
      </Suspense>
      <Footer />
    </div>
  );
}