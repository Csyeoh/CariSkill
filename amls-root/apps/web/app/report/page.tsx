'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Sidebar from '@/components/Sidebar';
import { motion } from 'framer-motion';
import {
  Clock, CheckCircle2, BrainCircuit, TrendingUp,
  Award, ShieldCheck, CalendarHeart, Trophy, Loader2
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { ActivityCalendar } from 'react-activity-calendar';

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

// --- Custom Data & SVG Logic ---
const lineChartPath = "M 0 150 L 100 130 L 200 145 L 300 80 L 400 110 L 500 90 L 600 100";
const lineChartFill = "M 0 200 L 0 150 L 100 130 L 200 145 L 300 80 L 400 110 L 500 90 L 600 100 L 600 200 Z";
const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];


export default function LearningReportPage() {
  const supabase = createClient();
  const [activityData, setActivityData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Real Analytics States
  const [totalStudyHours, setTotalStudyHours] = useState('0.0');
  const [completionRate, setCompletionRate] = useState(0);
  const [skillDistribution, setSkillDistribution] = useState<any[]>([]);
  const [totalSkillsCount, setTotalSkillsCount] = useState(0);

  useEffect(() => {
    const fetchActivityData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch Skills for Completion Rate & Donut Chart
      const { data: skillsData } = await supabase
        .from('user_skills')
        .select('status, category')
        .eq('user_id', user.id);

      if (skillsData && skillsData.length > 0) {
        setTotalSkillsCount(skillsData.length);

        // Completion Rate
        const doneCount = skillsData.filter(s => s.status === 'Done').length;
        setCompletionRate(Math.round((doneCount / skillsData.length) * 100));

        // Group by category
        const categoryCounts: Record<string, number> = {};
        skillsData.forEach(skill => {
          const cat = skill.category || 'Other';
          categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        });

        // Convert to Donut Chart Format
        const colors = ['#FFD700', '#FEF08A', '#27272A', '#6B7280', '#A1A1AA'];
        let currentRotation = -90;

        const distribution = Object.entries(categoryCounts).map(([label, count], index) => {
          const percentage = Math.round((count / skillsData.length) * 100);
          const segment = {
            label,
            value: percentage,
            color: colors[index % colors.length],
            rotation: currentRotation
          };
          currentRotation += (percentage / 100) * 360;
          return segment;
        });

        setSkillDistribution(distribution);
      } else {
        setSkillDistribution([]);
        setTotalSkillsCount(0);
        setCompletionRate(0);
      }

      // 2. Fetch Study Sessions for the Heatmap & Total Time
      const { data: sessionData } = await supabase
        .from('study_sessions')
        .select('date, duration_minutes')
        .eq('user_id', user.id);

      if (sessionData && sessionData.length > 0) {
        // Group by date
        const aggregated: Record<string, number> = {};
        let totalMinutes = 0;

        sessionData.forEach(session => {
          const mins = session.duration_minutes || 0;
          aggregated[session.date] = (aggregated[session.date] || 0) + mins;
          totalMinutes += mins;
        });

        setTotalStudyHours((totalMinutes / 60).toFixed(1));

        const formattedActivity = Object.entries(aggregated).map(([date, minutes]) => {
          let level = 0;
          if (minutes > 0 && minutes <= 30) level = 1;
          else if (minutes > 30 && minutes <= 60) level = 2;
          else if (minutes > 60 && minutes <= 120) level = 3;
          else if (minutes > 120) level = 4;
          return { date, count: minutes, level };
        });

        setActivityData(formattedActivity);
      } else {
        setTotalStudyHours('0.0');
      }

      setIsLoading(false);
    };

    fetchActivityData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF6] font-sans text-gray-900">
      <Navbar isLoggedIn={true} />

      <main className="flex-grow relative flex justify-center py-10 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 pointer-events-none z-0 opacity-30 bg-[radial-gradient(#FDE68A_1.5px,transparent_1.5px)] [background-size:24px_24px]" />

        <div className="w-full max-w-7xl z-10 grid grid-cols-1 lg:grid-cols-4 gap-8">

          <Sidebar />

          {/* MAIN CONTENT AREA */}
          <section className="lg:col-span-3 flex flex-col h-full">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <div>
                <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">Learning Analytics</h1>
                <p className="text-gray-600">Track your progress and performance insights.</p>
              </div>
              <p className="text-sm text-gray-400 font-medium">Last updated: Today, 2:30 PM</p>
            </div>

            <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col gap-6">

              {/* Top Metrics Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Study Time */}
                <motion.div variants={cardVariants as any} whileHover={{ y: -4, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)' }} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-yellow-50 flex items-center justify-center text-[#CA8A04]">
                        <Clock className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-gray-500 text-sm">Total Study Time</span>
                    </div>
                  </div>
                  <h2 className="font-display text-4xl font-bold text-gray-900 mb-2">
                    {totalStudyHours} <span className="text-lg text-gray-400 font-normal">hrs</span>
                  </h2>
                  <p className="text-sm text-green-500 font-semibold flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" /> +12% vs last week
                  </p>
                </motion.div>

                {/* Completion Rate */}
                <motion.div variants={cardVariants as any} whileHover={{ y: -4, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)' }} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-gray-500 text-sm">Completion Rate</span>
                    </div>
                  </div>
                  <h2 className="font-display text-4xl font-bold text-gray-900 mb-4">{completionRate}%</h2>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <motion.div
                      className="bg-blue-500 h-2.5 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${completionRate}%` }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                    />
                  </div>
                </motion.div>

                {/* Quiz Score */}
                <motion.div variants={cardVariants as any} whileHover={{ y: -4, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)' }} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-500">
                        <BrainCircuit className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-gray-500 text-sm">Quiz Avg. Score</span>
                    </div>
                  </div>
                  <h2 className="font-display text-4xl font-bold text-gray-900 mb-2">88%</h2>
                  <p className="text-sm text-gray-400 font-medium">Top 15% of learners</p>
                </motion.div>

              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Light-Themed Line Chart (Spans 2 cols) */}
                <motion.div variants={cardVariants as any} className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="font-display text-xl font-bold text-gray-900">Learning Activity</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="w-3 h-3 rounded-full bg-[#FFD700]" /> Hours spent
                    </div>
                  </div>

                  <div className="w-full flex justify-center py-4">
                    {isLoading ? (
                      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    ) : activityData.length > 0 ? (
                      <ActivityCalendar
                        data={activityData}
                        theme={{
                          light: ['#f0f0f0', '#fee783', '#fede49', '#fdd600', '#c2a100']
                        }}
                        labels={{
                          legend: { less: 'Less', more: 'More' },
                          months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                          totalCount: '{{count}} mins studied in {{year}}',
                        }}
                      />
                    ) : (
                      <div className="text-gray-500 text-center py-10">No study activity yet. Start a learning module to track time!</div>
                    )}
                  </div>
                </motion.div>

                {/* Donut Chart (Spans 1 col) */}
                <motion.div variants={cardVariants as any} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col">
                  <h3 className="font-display text-xl font-bold text-gray-900 mb-6">Skill Distribution</h3>

                  <div className="relative w-48 h-48 mx-auto mb-8">
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                      {/* Background Track */}
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="16" />

                      {/* Animated Segments */}
                      {skillDistribution.map((segment, index) => (
                        <motion.circle
                          key={index}
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke={segment.color}
                          strokeWidth="16"
                          style={{ transformOrigin: 'center', transform: `rotate(${segment.rotation}deg)` }}
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: segment.value / 100 }}
                          transition={{ duration: 1.5, delay: index * 0.2, ease: "easeOut" }}
                        />
                      ))}
                    </svg>

                    {/* Inner Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-display font-bold text-3xl text-gray-900 leading-none">{totalSkillsCount}</span>
                      <span className="text-xs font-bold tracking-widest text-gray-400 mt-1">SKILLS</span>
                    </div>
                  </div>

                  {/* Custom Legend */}
                  <div className="grid grid-cols-2 gap-y-4 gap-x-2 mt-auto">
                    {skillDistribution.map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-xs font-semibold text-gray-600 truncate">{item.label} ({item.value}%)</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

              </div>

              {/* Achievements Section */}
              <motion.div variants={cardVariants as any} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-display text-xl font-bold text-gray-900">Recent Achievements</h3>
                  <button className="text-[#CA8A04] hover:text-yellow-600 font-bold text-sm transition-colors">View All</button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                  <motion.div whileHover={{ y: -4 }} className="border border-gray-100 rounded-2xl p-4 flex items-center gap-4 hover:border-yellow-200 transition-colors cursor-default">
                    <div className="w-12 h-12 rounded-full bg-yellow-50 text-[#CA8A04] flex items-center justify-center flex-shrink-0">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">Fast Learner</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Completed 5 lessons in a day</p>
                    </div>
                  </motion.div>

                  <motion.div whileHover={{ y: -4 }} className="border border-gray-100 rounded-2xl p-4 flex items-center gap-4 hover:border-blue-200 transition-colors cursor-default">
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">SQL Master</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Passed Advanced SQL</p>
                    </div>
                  </motion.div>

                  <motion.div whileHover={{ y: -4 }} className="border border-gray-100 rounded-2xl p-4 flex items-center gap-4 hover:border-green-200 transition-colors cursor-default">
                    <div className="w-12 h-12 rounded-full bg-green-50 text-green-500 flex items-center justify-center flex-shrink-0">
                      <CalendarHeart className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">7 Day Streak</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Consistent learning habit</p>
                    </div>
                  </motion.div>

                  <motion.div whileHover={{ y: -4 }} className="border border-gray-100 rounded-2xl p-4 flex items-center gap-4 hover:border-purple-200 transition-colors cursor-default">
                    <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center flex-shrink-0">
                      <Trophy className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">Quiz Whiz</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Scored 100% on 3 quizzes</p>
                    </div>
                  </motion.div>

                </div>
              </motion.div>

            </motion.div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}