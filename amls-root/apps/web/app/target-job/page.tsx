'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Sidebar from '@/components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ChevronRight, Plus, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { PenTool, Code, LayoutTemplate } from 'lucide-react'; // Fallback icons

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

// --- Helper for Icon Colors ---
const getColorClasses = (theme: string) => {
  switch (theme) {
    case 'blue': return 'bg-blue-50 text-blue-500';
    case 'purple': return 'bg-purple-50 text-purple-500';
    case 'green': return 'bg-green-50 text-green-500';
    default: return 'bg-gray-50 text-gray-500';
  }
};

export default function TargetJobPage() {
  const router = useRouter();
  const supabase = createClient();

  // Define state to hold fetched jobs
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch from Supabase
  useEffect(() => {
    const fetchJobs = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('target_jobs')
        .select('id, title, company, created_at, color_theme')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setJobs(data.map((job: any) => ({
          ...job,
          // Format the date for display
          dateAdded: new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          // Mock an icon for now based on theme
          icon: job.color_theme === 'blue' ? PenTool : (job.color_theme === 'purple' ? Code : LayoutTemplate)
        })));
      }
      setIsLoading(false);
    };

    fetchJobs();
  }, []);

  // Handles deleting a job from the list
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    // Optimistic UI update
    setJobs(jobs.filter(job => job.id !== id));

    // Actually delete from DB
    await supabase.from('target_jobs').delete().eq('id', id);
  };

  // Navigates to the detail page
  const handleCardClick = (id: string) => {
    router.push(`/target-job/${id}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF6] font-sans text-gray-900">
      <Navbar isLoggedIn={true} />

      <main className="flex-grow relative flex justify-center py-10 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 pointer-events-none z-0 opacity-30 bg-[radial-gradient(#FDE68A_1.5px,transparent_1.5px)] [background-size:24px_24px]" />

        <div className="w-full max-w-7xl z-10 grid grid-cols-1 lg:grid-cols-4 gap-8">

          <Sidebar />

          {/* MAIN CONTENT AREA */}
          <section className="lg:col-span-3 flex flex-col h-full">
            <h1 className="font-display text-3xl font-bold text-gray-900 mb-8">Target Job History</h1>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="flex flex-col gap-4"
            >
              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : (
                <AnimatePresence>
                  {jobs.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">No Target Jobs Yet</h3>
                      <p className="text-gray-500 mb-6">Upload a job description to see how your skills match up.</p>
                    </div>
                  ) : (
                    jobs.map((job) => (
                      <motion.div
                        key={job.id}
                        variants={cardVariants as any}
                        layout
                        whileHover={{ scale: 1.01, y: -2 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleCardClick(job.id)}
                        className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md border border-gray-100 flex items-center justify-between cursor-pointer transition-shadow group"
                      >
                        {/* Left Side: Icon & Info */}
                        <div className="flex items-center gap-4 sm:gap-6">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getColorClasses(job.color_theme)}`}>
                            <job.icon className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-gray-900 leading-tight">
                              {job.title} <span className="text-gray-500 font-normal">@ {job.company}</span>
                            </h3>
                            <p className="text-sm text-gray-400 mt-1">Added on {job.dateAdded}</p>
                          </div>
                        </div>

                        {/* Right Side: Actions */}
                        <div className="flex items-center gap-2 sm:gap-4">
                          <button
                            onClick={(e) => handleDelete(job.id, e)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Job"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                          <div className="text-gray-300 group-hover:text-[#CA8A04] transition-colors">
                            <ChevronRight className="w-6 h-6" />
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              )}

              {/* Add New Button */}
              <Link
                href="/target-job/new"
                className="w-full mt-2 bg-transparent rounded-2xl p-6 border-2 border-dashed border-gray-200 hover:border-[#FFD700] flex items-center justify-center gap-2 text-blue-500 hover:text-[#CA8A04] font-bold text-lg transition-colors group"
              >
                <Plus className="w-5 h-5 stroke-[3] group-hover:scale-110 transition-transform" />
                New
              </Link>
            </motion.div>

          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}