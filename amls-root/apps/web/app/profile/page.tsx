'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Sidebar from '@/components/Sidebar'; // 1. IMPORT IT HERE
import { createClient } from '@/utils/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreHorizontal, Clock, PlayCircle, Loader2 } from 'lucide-react';
import type { SkillStatus } from '@/lib/profile-data';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};

export default function ProfilePage() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<SkillStatus>('Ongoing');
  const [skills, setSkills] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch from Supabase
  useEffect(() => {
    const fetchProfileData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch Skills
      const { data: skillsData } = await supabase
        .from('user_skills')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (skillsData) setSkills(skillsData);

      setIsLoading(false);
    };

    fetchProfileData();
  }, []);

  const displayedSkills = skills.filter(skill => skill.status === activeTab);
  // DYNAMIC COUNTS FOR THE TABS
  const counts = {
    Ongoing: skills.filter(s => s.status === 'Ongoing').length,
    Done: skills.filter(s => s.status === 'Done').length,
    Cancelled: skills.filter(s => s.status === 'Cancelled').length,
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF6] font-sans text-gray-900">
      <Navbar isLoggedIn={true} />

      <main className="flex-grow relative flex justify-center py-10 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 pointer-events-none z-0 opacity-30 bg-[radial-gradient(#FDE68A_1.5px,transparent_1.5px)] [background-size:24px_24px]" />

        <div className="w-full max-w-7xl z-10 grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* 2. DROP IT IN HERE! */}
          <Sidebar />

          {/* MAIN CONTENT AREA */}
          <section className="lg:col-span-3">
            <h1 className="font-display text-3xl font-bold text-gray-900 mb-8">My Skills</h1>

            {/* Tabs */}
            <div className="flex items-center gap-8 border-b border-gray-200 mb-8">
              {(['Ongoing', 'Done', 'Cancelled'] as SkillStatus[]).map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-4 flex items-center gap-2 font-semibold transition-all relative ${isActive ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {tab}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${isActive ? 'bg-[#FFD700] text-gray-900' : 'bg-gray-100 text-gray-500'}`}>
                      {counts[tab]}
                    </span>
                    {isActive && (
                      <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-1 bg-[#FFD700] rounded-t-full" />
                    )}
                  </button>
                );
              })}
            </div>

            <h2 className="font-display text-2xl font-bold text-gray-900 mt-12 mb-6">Course Path</h2>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              key={activeTab} // Adding the key forces the animation to replay when switching tabs
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {isLoading ? (
                <div className="col-span-full flex justify-center py-20">
                  <Loader2 className="w-10 h-10 animate-spin text-[#FFD700]" />
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {displayedSkills.length > 0 ? (
                    displayedSkills.map((skill) => (
                      <motion.div
                        key={skill.id}
                        variants={cardVariants}
                        whileHover={{ y: -8 }}
                        layout
                        className="bg-white rounded-[24px] p-6 shadow-sm hover:shadow-xl border border-gray-100 flex flex-col transition-shadow duration-300 group cursor-pointer h-[260px]"
                      >
                        <div className="flex justify-between items-start mb-6">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gray-50 text-gray-500 group-hover:scale-110 transition-transform`}>
                            <PlayCircle className="w-6 h-6" />
                          </div>
                          <button className="text-gray-400 hover:text-gray-600 p-1">
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                        </div>

                        <h3 className="font-bold text-xl text-gray-900 mb-1 leading-tight line-clamp-1">{skill.title}</h3>
                        <p className="text-sm text-gray-500 mb-4">{skill.category}</p>

                        <div className="mt-auto">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-600">Progress</span>
                            <span className="text-sm font-bold text-gray-900">{skill.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2.5 mb-5 overflow-hidden">
                            <motion.div
                              className={`h-2.5 rounded-full ${skill.progress === 100 ? 'bg-green-500' : 'bg-[#FFD700]'}`}
                              initial={{ width: 0 }} animate={{ width: `${skill.progress}%` }} transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                            />
                          </div>

                          <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                            <div className="flex items-center gap-1.5 text-gray-500">
                              <Clock className="w-4 h-4" />
                              <span className="text-xs font-medium">{skill.total_time_spent || 0} mins</span>
                            </div>
                            <span className={`text-sm font-bold flex items-center gap-1 transition-colors ${skill.status === 'Done' ? 'text-green-600 group-hover:text-green-700' :
                              skill.status === 'Cancelled' ? 'text-gray-400 group-hover:text-gray-600' :
                                'text-[#CA8A04] group-hover:text-yellow-600'
                              }`}>
                              {skill.status === 'Ongoing' && <PlayCircle className="w-4 h-4" />}
                              {skill.status === 'Ongoing' ? 'Continue' : skill.status === 'Done' ? 'Review' : 'Restart'}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full py-12 text-center text-gray-500">
                      No {activeTab.toLowerCase()} skills found. Time to start learning!
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </motion.div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}