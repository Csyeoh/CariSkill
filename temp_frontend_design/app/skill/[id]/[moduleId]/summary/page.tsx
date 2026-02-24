'use client';

import { use, useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { summaryNotes } from '@/lib/summary-data';
import { notFound } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bookmark, Download, Sparkles, CheckCircle2, 
  Table2, Database, Key, Link2, Code2
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const conceptIconMap: Record<string, any> = {
  table_chart: Table2,
  dns: Database,
  key: Key,
  link: Link2,
};

export default function SummaryPage({ params }: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = use(params);
  const data = summaryNotes[moduleId];
  const pdfRef = useRef<HTMLDivElement>(null);

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!data) return notFound();

  const handleDownload = async () => {
    if (!pdfRef.current) return;
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
              // Nuclear Fix for oklch and oklab
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
      pdf.save(`${data.title.replace(/\s+/g, '_')}_Summary.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF6] font-sans text-gray-900">
      <Navbar isLoggedIn={true} />

      <main className="flex-grow relative overflow-hidden flex flex-col items-center py-10">
        <div data-html2canvas-ignore="true" className="absolute inset-0 pointer-events-none z-0 opacity-30 bg-[radial-gradient(#FDE68A_1.5px,transparent_1.5px)] [background-size:24px_24px]" />

        {/* Capture Area starts HERE to include the title */}
        <div ref={pdfRef} id="pdf-content" className="w-full max-w-5xl px-8 z-10">
          
          {/* Header Section (Now inside pdfRef) */}
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#B45309] bg-[#FEF3C7] px-2 py-0.5 rounded">
                  {data.topicTag}
                </span>
                <span className="text-sm text-gray-500 font-medium">{data.subject}</span>
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900">{data.title}</h1>
            </div>

            {/* Buttons (Ignored during PDF capture) */}
            <div className="flex items-center gap-3" data-html2canvas-ignore="true">
              <button 
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`p-2.5 rounded-lg border transition-all duration-300 shadow-sm ${
                  isBookmarked ? 'bg-[#EAB308] border-[#CA8A04] text-white' : 'bg-white border-gray-200 text-gray-400'
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
            <div className="bg-[#F9FAFB] border-b border-gray-100 px-8 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#A16207] font-bold uppercase tracking-wide text-sm">
                <Sparkles className="w-4 h-4" />
                AI-Generated Summary Notes
              </div>
              <div className="text-xs text-gray-400">Last updated: {data.lastUpdated}</div>
            </div>

            <div className="p-8 md:p-12 space-y-12 bg-white">
              <section>
                <SectionHeader title="Key Takeaways" />
                <ul className="space-y-4 mt-6">
                  {data.keyTakeaways.map((item, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <CheckCircle2 className="w-5 h-5 text-[#22C55E] mt-1 shrink-0" />
                      <p className="text-gray-700 leading-relaxed">{item}</p>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <SectionHeader title="Core Concepts" />
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  {data.coreConcepts.map((concept, i) => {
                    const Icon = conceptIconMap[concept.icon] || Database;
                    return (
                      <div key={i} className="p-6 bg-[#F9FAFB] border border-gray-100 rounded-2xl">
                        <div className="flex items-center gap-3 mb-3">
                          <Icon className="w-5 h-5 text-[#CA8A04]" />
                          <h3 className="font-bold text-gray-900">{concept.title}</h3>
                        </div>
                        <p className="text-sm text-gray-600">{concept.description}</p>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section>
                <SectionHeader title="Quick Cheat Sheet" />
                <div className="mt-6 bg-[#18181B] rounded-2xl p-6 md:p-8 font-mono text-sm text-[#D4D4D8]">
                  <div className="mb-8 bg-[#09090B] p-4 rounded-xl border border-white/10 text-[#FEF9C3]">
                    <pre><code className="whitespace-pre-wrap">{data.cheatSheet.sqlStructure}</code></pre>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-[#71717A] text-xs font-bold uppercase mb-4">ACID Properties</p>
                      {data.cheatSheet.properties.map((p, i) => <div key={i} className="mb-1">• {p}</div>)}
                    </div>
                    <div>
                      <p className="text-[#71717A] text-xs font-bold uppercase mb-4">Data Types</p>
                      {data.cheatSheet.dataTypes.map((t, i) => <div key={i} className="mb-1">• {t}</div>)}
                    </div>
                  </div>
                </div>
              </section>
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