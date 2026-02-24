'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Sidebar from '@/components/Sidebar';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

// --- Helper for date suffix ---
const getOrdinalSuffix = (i: number) => {
  const j = i % 10, k = i % 100;
  if (j == 1 && k != 11) return i + "st";
  if (j == 2 && k != 12) return i + "nd";
  if (j == 3 && k != 13) return i + "rd";
  return i + "th";
};

// --- Mock Event Data ---
const mockEvents: Record<number, string[]> = {
  2: ['UX Research'],
  5: ['Design System', 'Component Lib'],
  8: ['Intro to DB', 'Normalisation'],
  12: ['SQL Basics'],
  20: ['Data Models'],
  26: ['Advanced SQL', 'Optimisation', 'Indexing']
};

// --- Animation Variants ---
const gridVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.02 } // Super fast stagger for 31 items
  }
};

const dayVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 10 },
  show: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 300, damping: 24 } 
  }
};

export default function CalendarPage() {
  const [selectedDay, setSelectedDay] = useState<number>(8);
  
  const daysInMonth = 31;
  const startingBlankDays = 4; 
  
  const blanks = Array.from({ length: startingBlankDays }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF6] font-sans text-gray-900">
      <Navbar isLoggedIn={true} />

      <main className="flex-grow relative flex justify-center py-10 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 pointer-events-none z-0 opacity-30 bg-[radial-gradient(#FDE68A_1.5px,transparent_1.5px)] [background-size:24px_24px]" />

        <div className="w-full max-w-7xl z-10 grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          <Sidebar />

          <section className="lg:col-span-3 flex flex-col h-full">
            <h1 className="font-display text-3xl font-bold text-gray-900 mb-8">Study Calendar</h1>

            <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 flex-grow flex flex-col">
              
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-8">
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900">
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <h2 className="font-display font-bold text-2xl text-gray-900">January 2026</h2>
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900">
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-7 mb-4">
                {daysOfWeek.map(day => (
                  <div key={day} className="text-center text-sm font-semibold text-gray-400 uppercase tracking-wider">
                    {day}
                  </div>
                ))}
              </div>

              {/* Animated Calendar Grid */}
              <motion.div 
                variants={gridVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-7 gap-y-4 gap-x-2 flex-grow"
              >
                {/* Blanks */}
                {blanks.map(blank => (
                  <div key={`blank-${blank}`} className="h-28 p-2"></div>
                ))}

                {/* Actual Days */}
                {days.map(day => {
                  const isSelected = selectedDay === day;
                  const dayEvents = mockEvents[day] || [];

                  return (
                    <motion.div 
                      key={day}
                      variants={dayVariants}
                      whileHover={{ scale: 1.05, y: -4, zIndex: 10 }} // Framer Motion Hover!
                      whileTap={{ scale: 0.95 }} // Click bounce effect
                      onClick={() => setSelectedDay(day)}
                      className={`h-28 p-2 rounded-xl transition-colors cursor-pointer group flex flex-col items-center border bg-white
                        ${isSelected 
                          ? 'bg-yellow-50 border-[#FFD700] shadow-md' 
                          : 'border-transparent hover:border-gray-200 hover:shadow-lg hover:bg-white'
                        }
                      `}
                    >
                      {/* Day Number */}
                      <div className={`w-8 h-8 flex items-center justify-center rounded-full font-medium transition-colors mb-1 flex-shrink-0
                        ${isSelected 
                          ? 'bg-[#FFD700] text-gray-900 font-bold shadow-sm' 
                          : 'bg-transparent text-gray-700'
                        }
                      `}>
                        {day}
                      </div>

                      {/* Event List */}
                      {dayEvents.length > 0 && (
                        <div className="w-full mt-1 flex flex-col gap-1.5 px-1 overflow-hidden">
                          {dayEvents.map((event, idx) => (
                            <div key={idx} className="flex items-center gap-1.5">
                              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isSelected ? 'bg-[#D97706]' : 'bg-[#FFD700]'}`}></div>
                              <span className={`text-[10px] leading-none truncate ${isSelected ? 'text-gray-900 font-medium' : 'text-gray-500 group-hover:text-gray-700'}`}>
                                {event}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Animated Action Button */}
              <div className="flex justify-end mt-8 pt-6 border-t border-gray-100">
                <motion.button 
                  whileHover={{ scale: 1.03, boxShadow: "0 10px 15px -3px rgba(250, 204, 21, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-[#FFD700] text-gray-900 font-bold py-3.5 px-8 rounded-xl transition-colors flex items-center gap-2"
                >
                  <Plus className="w-5 h-5 stroke-[3]" />
                  Add Topic for Jan {getOrdinalSuffix(selectedDay)}
                </motion.button>
              </div>

            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}