'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { bookmarkUIData } from '@/lib/bookmark-store';
import { motion } from 'framer-motion';
import { 
  Bookmark, FolderOpen, ChevronRight, 
  BookOpen, Layers, AlignLeft, HelpCircle 
} from 'lucide-react';
import Link from 'next/link';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

// Map content types to specific Lucide icons
const typeIconMap = {
  material: BookOpen,
  flashcard: Layers,
  summary: AlignLeft,
  quiz: HelpCircle,
};

export default function BookmarkPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF6] font-sans text-gray-900">
      <Navbar isLoggedIn={true} />

      <main className="flex-grow relative overflow-hidden flex flex-col items-center py-12 px-4">
        {/* Background Pattern */}
        <div className="absolute inset-0 pointer-events-none z-0 opacity-30 bg-[radial-gradient(#FDE68A_1.5px,transparent_1.5px)] [background-size:24px_24px]" />

        {/* Header */}
        <div className="text-center z-10 mb-12 max-w-2xl w-full">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-3"
          >
            Saved Bookmarks
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="flex items-center justify-center gap-2 text-gray-600 font-medium"
          >
            <Bookmark className="w-4 h-4 text-[#CA8A04] fill-current" />
            <p>Your curated list of learning materials</p>
          </motion.div>
        </div>

        {/* Bookmarks List Container */}
        <div className="w-full max-w-4xl z-10 space-y-12 pb-12">
          {bookmarkUIData.map((categoryGroup, catIndex) => {
            const CategoryIcon = categoryGroup.icon;
            
            return (
              <motion.div 
                key={categoryGroup.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: catIndex * 0.1 }} 
                className="space-y-4"
              >
                {/* Category Header */}
                <h2 className="font-display text-2xl font-bold text-gray-900 flex items-center gap-3 ml-2">
                  <CategoryIcon className="w-6 h-6 text-[#CA8A04]" />
                  {categoryGroup.category}
                </h2>

                {/* Staggered Items Container */}
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-50px" }}
                  className="flex flex-col gap-4"
                >
                  {categoryGroup.items.map((item) => {
                    // Get the specific icon for this content type, fallback to Bookmark
                    const ItemIcon = typeIconMap[item.type] || Bookmark;

                    return (
                      <motion.div key={item.id} variants={itemVariants}>
                        {/* THE LINK: Navigates exactly to the content type URL */}
                        <Link href={item.link} className="block group outline-none">
                          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-[#FFD700]/60 transition-all duration-300 flex items-center justify-between focus:ring-4 focus:ring-yellow-100 active:scale-[0.98]">
                            
                            <div className="flex items-center gap-5 w-full">
                              {/* Dynamic Icon Box */}
                              <div className="h-14 w-14 rounded-xl bg-[#FEF9C3] flex items-center justify-center shrink-0 group-hover:bg-[#FFD700] transition-colors duration-300">
                                <ItemIcon className="text-[#A16207] group-hover:text-gray-900 w-6 h-6 transition-colors duration-300" />
                              </div>
                              
                              {/* Text Content */}
                              <div className="flex flex-col">
                                <h3 className="font-bold text-gray-900 text-lg group-hover:text-[#A16207] transition-colors duration-300">
                                  {item.title}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                  <FolderOpen className="w-4 h-4 stroke-[2.5]" />
                                  <span className="font-medium">{item.module}</span>
                                  <span className="text-gray-300 mx-1">•</span>
                                  <span className="capitalize text-xs font-bold text-[#A16207] bg-yellow-50 px-2 py-0.5 rounded-md border border-yellow-100">
                                    {item.type}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Arrow */}
                            <div className="shrink-0 pl-4">
                              <ChevronRight className="text-gray-300 w-7 h-7 group-hover:text-[#CA8A04] group-hover:translate-x-1.5 transition-all duration-300" />
                            </div>
                            
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}