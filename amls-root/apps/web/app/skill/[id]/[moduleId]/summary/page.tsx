'use client';

import { use, useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { notFound } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bookmark, Download, Sparkles,
  Play, Link2, Loader2, Clock
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function SummaryPage({ params }: { params: Promise<{ id: string, moduleId: string }> }) {
  const { id, moduleId } = use(params);

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const pdfRef = useRef<HTMLDivElement>(null);

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { createClient } = await import('@/utils/supabase/client');
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        let fetchedData = null;

        if (user) {
          const { data: dbData } = await supabase
            .from('micro_topics_contents')
            .select('content')
            .eq('roadmap_id', id)
            .eq('macro_node_id', moduleId)
            .limit(1);

          if (dbData && dbData.length > 0) {
            fetchedData = dbData[0].content;
          }
        }

        if (fetchedData) {
          setData(fetchedData);
        }
      } catch (err) {
        console.error("Failed to fetch micro content:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [id, moduleId]);

  const handleDownload = async () => {
    if (!pdfRef.current || !data) return;
    setIsDownloading(true);

    try {
      const element = pdfRef.current;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFDF6',
        onclone: (clonedDoc) => {
          const allElements = clonedDoc.getElementsByTagName("*");
          for (let i = 0; i < allElements.length; i++) {
            const el = allElements[i] as HTMLElement;
            const styles = window.getComputedStyle(el);
            for (let j = 0; j < styles.length; j++) {
              const prop = styles[j];
              const value = styles.getPropertyValue(prop);
              if (value && value.includes("okl")) {
                if (prop.includes("shadow") || prop.includes("ring")) {
                  el.style.setProperty(prop, "none", "important");
                } else if (prop.includes("background")) {
                  el.style.setProperty(prop, "#ffffff", "important");
                } else {
                  el.style.setProperty(prop, "#18181b", "important");
                }
              }
            }
            el.style.setProperty("--tw-shadow", "none", "important");
            el.style.setProperty("--tw-ring-color", "transparent", "important");
          }
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${moduleId}_Summary.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFDF6]">
        <Loader2 className="w-12 h-12 text-[#FFD700] animate-spin" />
      </div>
    );
  }

  if (!data) return notFound();

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF6] font-sans text-gray-900">
      <Navbar isLoggedIn={true} />

      <main className="flex-grow relative overflow-hidden flex flex-col items-center py-10">
        <div data-html2canvas-ignore="true" className="absolute inset-0 pointer-events-none z-0 opacity-30 bg-[radial-gradient(#FDE68A_1.5px,transparent_1.5px)] [background-size:24px_24px]" />

        {/* Capture Area starts HERE to include the title */}
        <div ref={pdfRef} id="pdf-content" className="w-full max-w-5xl px-8 z-10">

          {/* Header Section */}
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#B45309] bg-[#FEF3C7] px-2 py-0.5 rounded">
                  {moduleId.split('_').join(' ')}
                </span>
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 capitalize">
                {moduleId.split('_').join(' ')} Summary
              </h1>
            </div>

            {/* Buttons (Ignored during PDF capture) */}
            <div className="flex items-center gap-3" data-html2canvas-ignore="true">
              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`p-2.5 rounded-lg border transition-all duration-300 shadow-sm ${isBookmarked ? 'bg-[#EAB308] border-[#CA8A04] text-white' : 'bg-white border-gray-200 text-gray-400'
                  }`}
              >
                <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>

              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#FFD700] hover:bg-[#E6C200] disabled:bg-gray-300 text-gray-900 rounded-lg shadow-md font-bold text-sm"
              >
                <AnimatePresence mode="wait">
                  {isDownloading ? (
                    <motion.div key="loading" className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                      Generating...
                    </motion.div>
                  ) : (
                    <motion.div key="idle" className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Download PDF
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>

          {/* Main Card Section */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-10">
            <div className="bg-[#F9FAFB] border-b border-gray-100 px-8 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-[#A16207] font-bold uppercase tracking-wide text-sm">
                <Sparkles className="w-4 h-4" />
                AI-Generated Micro Lessons
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                <Clock className="w-4 h-4" />
                ~{data.node_total_time_minutes} mins total
              </div>
            </div>

            <div className="p-8 md:p-12 space-y-12 bg-white">
              {data.micro_topics?.map((topic: any, idx: number) => (
                <section key={idx}>
                  <SectionHeader title={topic.topic_title} />

                  {topic.topic_total_time_minutes && (
                    <div className="mt-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Est. {topic.topic_total_time_minutes} mins
                    </div>
                  )}

                  <div className="mt-6 text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {topic.theory_explanation}
                  </div>

                  {topic.resources && topic.resources.length > 0 && (
                    <div className="mt-8">
                      <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Recommended Resources</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        {topic.resources.map((res: any, rIdx: number) => {
                          const isVideo = res.type?.toLowerCase() === 'youtube' || res.url?.includes('youtube.com') || res.url?.includes('youtu.be');
                          return (
                            <a
                              key={rIdx}
                              href={res.url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-start gap-4 p-4 bg-[#F9FAFB] border border-gray-100 rounded-xl hover:border-[#FFD700] hover:shadow-md hover:-translate-y-0.5 transition-all group"
                            >
                              <div className="mt-0.5 p-2 bg-white rounded-lg shadow-sm border border-gray-100 group-hover:border-[#FFD700] transition-colors">
                                {isVideo ? <Play className="w-5 h-5 text-red-500" /> : <Link2 className="w-5 h-5 text-blue-500" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="font-bold text-gray-900 group-hover:text-yellow-700 transition-colors text-sm line-clamp-2 leading-tight">
                                  {res.title}
                                </h5>
                                <p className="text-[11px] font-bold text-gray-500 mt-1.5 uppercase tracking-wider">
                                  {res.estimated_time_minutes} mins • {res.type || 'Article'}
                                </p>
                              </div>
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </section>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-1.5 h-8 bg-[#FFD700] rounded-full" />
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
    </div>
  );
}