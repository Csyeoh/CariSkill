'use client';

import { use, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { materialTopics } from '@/lib/materials-data';
import { notFound, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Bookmark, Flag, Play,
  Volume2, Maximize2, ChevronLeft, ChevronRight
} from 'lucide-react';

export default function MaterialsPage({ params }: { params: Promise<{ id: string, moduleId: string }> }) {
  const { id, moduleId } = use(params);
  const data = materialTopics[moduleId];
  const router = useRouter();

  const [isBookmarked, setIsBookmarked] = useState(false);

  if (!data) return notFound();

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF6] font-sans text-gray-900">
      <Navbar isLoggedIn={true} />

      <main className="flex-grow relative flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 pointer-events-none z-0 opacity-30 bg-[radial-gradient(#FDE68A_1.5px,transparent_1.5px)] [background-size:24px_24px]" />

        <div className="w-full max-w-7xl mb-8 z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-2">{data.title}</h1>
              <div className="flex items-center gap-3 text-gray-600">
                <span className="bg-[#FEF3C7] text-[#B45309] text-xs font-bold px-2.5 py-1 rounded border border-[#FDE68A]">
                  {data.part}
                </span>
                <span className="text-sm">•</span>
                <span className="text-sm font-medium">{data.topic_total_time_minutes ? `${data.topic_total_time_minutes} mins total` : data.duration}</span>
              </div>
            </motion.div>
            <button
              onClick={() => router.push(`/skill/${id}`)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-sm font-bold shadow-sm active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Roadmap
            </button>
          </div>
        </div>

        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 z-10">
          <aside className="lg:col-span-3 hidden lg:block">
            <div className="sticky top-28 bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="font-display font-bold text-lg text-gray-900 mb-6">Topic Outline</h3>
              <div className="relative pl-2">
                <div className="absolute left-[11px] top-2 bottom-8 w-0.5 bg-gray-100" />
                {data.outline.map((item) => (
                  <div key={item.id} className={`relative flex items-start mb-8 transition-opacity ${!item.isActive && !item.isCompleted ? 'opacity-60' : ''}`}>
                    {item.type === 'start' || item.type === 'finish' ? (
                      <div className="absolute -left-1 bg-[#FFFDF6] p-1 z-10">
                        <Flag className={`w-5 h-5 ${item.isCompleted || item.isActive ? 'text-[#EAB308] fill-current' : 'text-gray-300'}`} />
                      </div>
                    ) : (
                      <div className={`absolute left-[3px] top-1.5 w-4 h-4 rounded-full border-4 border-[#FFFDF6] shadow-sm z-10 ${item.isActive ? 'bg-[#FFD700] ring-4 ring-[#FEF9C3]' : 'bg-gray-300'}`} />
                    )}
                    <div className="ml-8">
                      <span className={`text-sm block leading-tight ${item.isActive ? 'font-bold text-gray-900' : 'font-medium text-gray-600'}`}>
                        {item.label}
                      </span>
                      {item.subLabel && <span className="text-[10px] text-gray-400 font-medium">{item.subLabel}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <div className="lg:col-span-9 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-gray-100 relative">
              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`absolute top-8 right-8 p-2.5 rounded-full transition-all duration-300 shadow-sm ${isBookmarked ? 'bg-[#FFD700] text-white' : 'text-gray-400 hover:text-[#CA8A04] hover:bg-[#FEF9C3]'
                  }`}
              >
                <Bookmark className={`w-6 h-6 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>

              <div className="mb-10 pr-12">
                <h2 className="font-display font-bold text-2xl text-gray-900 mb-6">{data.topic_title || data.title}</h2>
                {data.theory_explanation ? (
                  <div className="text-gray-700 leading-relaxed text-[17px] space-y-4">
                    {data.theory_explanation.split('\n').map((line, i) => {
                      if (!line.trim()) return null;
                      // Basic regex for **bold** and `code`
                      const formattedLine = line
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/`([^`]+)`/g, '<code style="background-color: rgba(243, 244, 246, 0.5); color: #db2777; padding: 2px 6px; border-radius: 4px; font-size: 14px;">$1</code>')
                        .replace(/\*   /g, '• '); // basic bullet point conversion
                      return <p key={i} dangerouslySetInnerHTML={{ __html: formattedLine }} />;
                    })}
                  </div>
                ) : (
                  data.description?.map((para, i) => (
                    <p key={i} className="text-gray-600 leading-relaxed text-lg mb-4">{para}</p>
                  ))
                )}
              </div>

              {data.resources ? (
                <div className="space-y-6">
                  <h3 className="font-display font-bold text-xl text-gray-900 mb-4 flex items-center gap-2">
                    <Bookmark className="w-5 h-5 text-[#CA8A04]" />
                    Learning Resources
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.resources.map((res, i) => (
                      <a key={i} href={res.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 p-5 rounded-2xl border border-gray-100 bg-[#FAFAFA] hover:bg-white hover:shadow-md hover:border-[#FFD700] transition-all group">
                        <div className="w-12 h-12 shrink-0 rounded-xl bg-[#FEF9C3] text-[#CA8A04] flex items-center justify-center">
                          {res.type === 'youtube' ? <Play className="w-6 h-6 ml-0.5" /> : <Bookmark className="w-6 h-6" />}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 group-hover:text-[#CA8A04] transition-colors mb-1 line-clamp-2">{res.title}</h4>
                          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                            <span className="capitalize">{res.type}</span>
                            <span>•</span>
                            <span>{res.estimated_time_minutes} mins</span>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              ) : data.video && (
                <>
                  <div className="bg-[#18181B] rounded-3xl overflow-hidden shadow-2xl relative aspect-video w-full group">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                      <button className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-all transform group-hover:scale-110 border border-white/40 shadow-xl">
                        <Play className="text-white w-8 h-8 fill-current ml-1" />
                      </button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 z-20 flex items-center justify-between text-white/90">
                      <span className="text-xs font-bold tracking-widest">04:20 / 12:45</span>
                      <div className="flex items-center gap-4">
                        <Volume2 className="w-5 h-5 cursor-pointer" />
                        <Maximize2 className="w-5 h-5 cursor-pointer" />
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/10 z-20">
                      <div className="h-full w-1/3 bg-[#FFD700]" />
                    </div>
                  </div>
                  <p className="mt-4 text-center text-sm text-gray-500 font-medium italic">{data.video.title}</p>
                </>
              )}
            </motion.div>

            <div className="flex justify-between items-center bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <button className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-all">
                <ChevronLeft className="w-5 h-5" /> Previous
              </button>
              <button className="flex items-center gap-2 bg-[#FFD700] text-gray-900 font-bold px-6 py-2.5 rounded-xl hover:bg-[#E6C200] transition-all shadow-md active:scale-95">
                Next Topic <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}