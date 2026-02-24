'use client';

import { use, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { flashcardSets } from '@/lib/flashcards-data';
import { notFound, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Bookmark, 
  BookOpen, RotateCw, Touchpad, CheckCircle 
} from 'lucide-react';

export default function FlashcardsPage({ params }: { params: Promise<{ id: string, moduleId: string }> }) {
  const { id, moduleId } = use(params);
  const data = flashcardSets[moduleId];
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [bookmarkedCards, setBookmarkedCards] = useState<Set<string>>(new Set());

  if (!data) return notFound();

  const totalCards = data.cards.length;
  const currentCard = data.cards[currentIndex];

  const handleNext = () => {
    if (currentIndex < totalCards - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev + 1), 150);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev - 1), 150);
    }
  };

  const toggleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    setBookmarkedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentCard.id)) {
        newSet.delete(currentCard.id);
      } else {
        newSet.add(currentCard.id);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF6] font-sans text-gray-900">
      <Navbar isLoggedIn={true} />

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #E5E7EB; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #D1D5DB; }
      `}} />

      <main className="flex-grow relative flex flex-col items-center py-8 px-4 h-full min-h-[calc(100vh-5rem)]">
        <div className="absolute inset-0 pointer-events-none z-0 opacity-30 bg-[radial-gradient(#FDE68A_1.5px,transparent_1.5px)] [background-size:24px_24px]" />

        {/* Header & Dynamic Progress Bar */}
        <div className="text-center z-10 mb-8 max-w-3xl w-full">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-6">{data.title}</h1>
          
          <div className="flex items-center justify-center w-full max-w-lg mx-auto mb-4">
            <div className="relative w-full flex items-center justify-between">
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-gray-200 z-0" />
              
              <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-[#FFD700] z-0 transition-all duration-500" 
                style={{ width: totalCards > 1 ? `${(currentIndex / (totalCards - 1)) * 100}%` : '100%' }} 
              />
              
              {data.cards.map((_, idx) => (
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
          <p className="text-sm text-gray-500 font-medium">Card {currentIndex + 1} of {totalCards}</p>
        </div>

        {/* Interactive Flashcard Area */}
        <div className="w-full max-w-6xl mx-auto flex flex-col items-center flex-1 relative z-10">
          
          <div className="flex items-center justify-center w-full gap-4 md:gap-8">
            {/* Desktop Prev Button */}
            <button 
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="hidden md:flex items-center justify-center w-14 h-14 shrink-0 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-[#CA8A04] hover:border-[#FFD700] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all duration-200 active:scale-95"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            {/* The Flashcard */}
            <div 
              className="w-full max-w-3xl aspect-[4/3] md:aspect-[16/9] relative cursor-pointer"
              style={{ perspective: '1000px' }}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <motion.div
                className="w-full h-full relative"
                style={{ transformStyle: 'preserve-3d' }}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
              >
                {/* FRONT OF CARD */}
                <div 
                  className="absolute inset-0 w-full h-full bg-white rounded-3xl shadow-xl border border-gray-100 flex flex-col overflow-hidden hover:shadow-2xl transition-shadow duration-300"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="h-2 flex-shrink-0 w-full bg-gradient-to-r from-[#FFD700] to-[#E6C200]" />
                  <div className="flex-grow flex flex-col items-center justify-center p-8 md:p-16 text-center overflow-y-auto custom-scrollbar">
                    <span className="inline-block px-3 py-1 bg-[#FEF9C3] text-[#A16207] text-xs font-bold uppercase tracking-wide rounded-full mb-6">
                      {currentCard.tag}
                    </span>
                    <h2 className="font-display text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
                      {currentCard.front}
                    </h2>
                    <p className="text-gray-400 text-sm mt-12 flex items-center gap-2">
                      <Touchpad className="w-5 h-5 animate-pulse" />
                      Click anywhere to reveal answer
                    </p>
                  </div>
                </div>

                {/* BACK OF CARD */}
                <div 
                  className="absolute inset-0 w-full h-full bg-[#FAFAFA] rounded-3xl shadow-xl border border-[#FEF9C3] flex flex-col overflow-hidden"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <div className="h-2 flex-shrink-0 w-full bg-gradient-to-r from-[#EAB308] to-[#CA8A04]" />
                  
                  <div className="flex-grow overflow-y-auto p-6 md:p-12 pb-28 custom-scrollbar">
                    <div className="w-full max-w-xl mx-auto flex flex-col justify-center min-h-full space-y-4">
                      {currentCard.back.map((point, idx) => (
                        <div key={idx} className="flex gap-4 items-start bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-100">
                          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#FFD700] text-gray-900 flex items-center justify-center font-bold text-sm shadow-sm mt-0.5">
                            {idx + 1}
                          </span>
                          <p className="text-gray-700 text-base md:text-lg font-medium leading-relaxed">
                            {point}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Floating Action Buttons */}
              <div className="absolute bottom-6 right-6 flex gap-3 z-20">
                <button 
                  onClick={(e) => { e.stopPropagation(); router.push(`/skill/${id}/${moduleId}/materials`); }}
                  className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/90 backdrop-blur text-gray-600 hover:bg-[#FEF9C3] hover:text-[#CA8A04] border border-gray-200 transition-all shadow-sm group"
                  title="View Material"
                >
                  <BookOpen className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
                <button 
                  onClick={toggleBookmark}
                  className={`w-12 h-12 flex items-center justify-center rounded-xl backdrop-blur border transition-all shadow-sm group ${
                    bookmarkedCards.has(currentCard.id) 
                    ? 'bg-[#FFD700] border-[#E6C200] text-white' 
                    : 'bg-white/90 text-gray-600 border-gray-200 hover:bg-[#FEF9C3] hover:text-[#CA8A04]'
                  }`}
                  title="Bookmark Card"
                >
                  <Bookmark className={`w-5 h-5 group-hover:scale-110 transition-transform ${bookmarkedCards.has(currentCard.id) ? 'fill-current' : ''}`} />
                </button>
              </div>
              
              <div className="absolute bottom-6 left-6 z-20">
                <button 
                  className="flex items-center gap-2 text-gray-500 hover:text-[#CA8A04] transition-colors text-sm font-bold bg-white/90 backdrop-blur px-4 py-2 rounded-xl border border-gray-200 shadow-sm"
                >
                  <RotateCw className="w-4 h-4" />
                  Flip Card
                </button>
              </div>
            </div>

            {/* Desktop Next Button */}
            <button 
              onClick={handleNext}
              disabled={currentIndex === totalCards - 1}
              className="hidden md:flex items-center justify-center w-14 h-14 shrink-0 rounded-full bg-[#FFD700] text-gray-900 border border-[#FFD700] hover:bg-[#E6C200] disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </div>

          {/* FINISH BUTTON AREA - Appears below the card layout */}
          <div className="h-16 mt-8 flex justify-center items-center w-full max-w-3xl">
            <AnimatePresence>
              {currentIndex === totalCards - 1 && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: 0.1 }}
                >
                  <button 
                    onClick={() => router.push(`/skill/${id}/${moduleId}/flashcards/summary`)}
                    className="flex items-center gap-3 px-8 py-3.5 bg-[#FFD700] hover:bg-[#E6C200] text-gray-900 rounded-full font-bold shadow-lg hover:shadow-xl transition-all active:scale-95"
                  >
                    Finish Deck
                    <CheckCircle className="w-5 h-5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Mobile Navigation Controls */}
        <div className="flex md:hidden justify-between w-full max-w-md px-4 mt-4 z-10">
          <button 
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-white border border-gray-200 text-gray-600 shadow-sm disabled:opacity-50"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={handleNext}
            disabled={currentIndex === totalCards - 1}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-[#FFD700] text-gray-900 shadow-md disabled:opacity-50"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}