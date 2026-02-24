'use client';

import { use } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { skillRoadmaps } from '@/lib/skill-details';
import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Users, Calendar, BookOpen, Layers, 
  CheckSquare, FileText, Lock, Zap 
} from 'lucide-react';

export default function SkillDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const data = skillRoadmaps[id];

  if (!data) return notFound();

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF6] font-sans text-gray-900">
      <Navbar isLoggedIn={true} />

      <main className="flex-grow relative overflow-hidden flex flex-col items-center py-12">
        <div className="absolute inset-0 pointer-events-none z-0 opacity-30 bg-[radial-gradient(#FDE68A_1.5px,transparent_1.5px)] [background-size:24px_24px]" />

        {/* Header Section */}
        <div className="text-center z-10 mb-12 max-w-2xl px-4">
          <motion.h1 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-2"
          >
            {data.title}
          </motion.h1>
          <div className="flex items-center justify-center gap-2 text-gray-600 font-medium">
            <Users className="w-4 h-4 text-yellow-500" />
            <p>{data.userCount} users are learning this</p>
          </div>
        </div>

        {/* Visual Roadmap Tracker */}
        <div className="w-full max-w-4xl px-4 z-10 mb-10 relative">
          <div className="bg-white rounded-3xl p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-gray-100 relative overflow-hidden">
            <div className="overflow-x-auto hide-scroll pb-12 pt-8">
              <div className="min-w-[700px] px-12 relative">
                <div className="relative h-4 bg-gray-100 rounded-full shadow-inner w-full flex items-center justify-between">
                  <motion.div 
                    initial={{ width: 0 }} animate={{ width: `${data.progressPercent}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute top-0 left-0 h-full bg-primary rounded-l-full z-10"
                    style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.2) 10px, rgba(255,255,255,0.2) 20px)' }}
                  />

                  <motion.div 
                    initial={{ left: 0 }} animate={{ left: `${data.progressPercent}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute top-1/2 z-30 -translate-y-full -translate-x-1/2"
                  >
                    <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.6 }}>
                      <Zap className="w-10 h-10 text-orange-500 fill-orange-500 filter drop-shadow-md" />
                    </motion.div>
                  </motion.div>

                  {data.steps.map((step, index) => {
                    const isReached = index <= data.currentStepIndex;
                    return (
                      <div key={index} className="relative z-20 flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full border-4 border-white shadow-md transition-colors duration-500 ${isReached ? 'bg-primary' : 'bg-gray-300'}`} />
                        <div className="absolute top-10 w-32 text-center">
                          <span className={`block text-xs font-bold uppercase tracking-tight ${isReached ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</span>
                          <span className="text-[10px] font-medium text-gray-400 leading-tight block">{step.subLabel}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-center">
            <span className="bg-gray-900 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
              {data.progressPercent}% COMPLETE
            </span>
          </div>
        </div>

        {/* Modules List */}
        <div className="w-full max-w-4xl px-4 z-10 space-y-6">
          {data.modules.map((module, idx) => (
            <motion.div 
              key={module.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`bg-white rounded-2xl p-6 border border-gray-200 transition-all group relative ${module.isLocked ? 'opacity-60 grayscale cursor-not-allowed' : 'hover:shadow-xl hover:border-yellow-400'}`}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className={`font-display font-bold text-xl ${module.isLocked ? 'text-gray-500' : 'text-gray-900 group-hover:text-yellow-600 transition-colors'}`}>
                    {module.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{module.description}</p>
                </div>
                {!module.isLocked ? (
                  <button className="text-gray-300 hover:text-yellow-500 transition-colors">
                    <Calendar className="w-6 h-6" />
                  </button>
                ) : (
                  <Lock className="w-5 h-5 text-gray-400" />
                )}
              </div>

              {/* Dynamic Action Grid */}
              <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-gray-50 ${module.isLocked ? 'pointer-events-none' : ''}`}>
                <ToolButton 
                  icon={BookOpen} 
                  label="Materials" 
                  href={`/skill/${id}/${module.id}/materials`} 
                />
                <ToolButton 
                  icon={Layers} 
                  label="Flashcards" 
                  href={`/skill/${id}/${module.id}/flashcards`} 
                />
                <ToolButton 
                  icon={CheckSquare} 
                  label="Quiz" 
                  href={`/skill/${id}/${module.id}/quiz`} 
                />
                <ToolButton 
                  icon={FileText} 
                  label="Summary" 
                  href={`/skill/${id}/${module.id}/summary`} 
                />
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}

// Sub-component for the module buttons using Next.js Link
function ToolButton({ icon: Icon, label, href }: { icon: any, label: string, href: string }) {
  return (
    <Link 
      href={href}
      className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-yellow-400/50 rounded-xl text-gray-700 font-bold text-xs hover:bg-yellow-50 hover:border-yellow-400 transition-all active:scale-95"
    >
      <Icon className="w-4 h-4 text-yellow-600" />
      {label}
    </Link>
  );
}