'use client';

import React from 'react';
import { History, Bot, User, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';

export default function ChatPage() {
    const chatContainerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.15 }
        }
    };

    const messageVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 250, damping: 24 } }
    };

    const sidebarVariants = {
        hidden: { opacity: 0, x: -30 },
        show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } }
    };

    const inputVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { delay: 0.6, duration: 0.4, ease: 'easeOut' } }
    };

    return (
        <div className="flex flex-col h-screen bg-white overflow-hidden">
            <Navbar isLoggedIn={true} />

            <div className="flex flex-1 w-full overflow-hidden">
                {/* Sidebar for Chat History */}
                <motion.div
                    variants={sidebarVariants}
                    initial="hidden"
                    animate="show"
                    className="w-80 border-r border-gray-100 flex flex-col bg-white overflow-y-auto"
                >
                    <div className="p-6 pb-4 flex items-center gap-3 font-semibold text-gray-900 text-lg">
                        <History className="w-5 h-5 text-gray-600" />
                        Chat History
                    </div>
                    <div className="flex-1 px-4 space-y-2">
                        {/* Active Chat */}
                        <div className="p-4 bg-[#FFFDF0] border border-[#fef08a] rounded-xl cursor-pointer">
                            <h3 className="font-semibold text-gray-900 text-sm">Mastering Python</h3>
                            <p className="text-xs text-gray-500 mt-1">Today, 10:45 AM</p>
                        </div>

                        {/* Inactive Chats */}
                        <div className="p-4 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors">
                            <h3 className="font-medium text-gray-700 text-sm">UI Design Basics</h3>
                            <p className="text-xs text-gray-400 mt-1">Yesterday, 4:20 PM</p>
                        </div>
                        <div className="p-4 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors">
                            <h3 className="font-medium text-gray-700 text-sm">Data Science Path</h3>
                            <p className="text-xs text-gray-400 mt-1">Oct 24, 2023</p>
                        </div>
                        <div className="p-4 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors">
                            <h3 className="font-medium text-gray-700 text-sm">Marketing Strategy</h3>
                            <p className="text-xs text-gray-400 mt-1">Oct 20, 2023</p>
                        </div>
                    </div>
                </motion.div>

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col relative bg-[#FFFDF5]">
                    {/* Background Pattern */}
                    <div
                        className="absolute inset-0 z-0 pointer-events-none opacity-[0.15]"
                        style={{
                            backgroundImage: 'radial-gradient(circle at 2px 2px, #ca8a04 1px, transparent 0)',
                            backgroundSize: '32px 32px'
                        }}
                    />

                    {/* Decorative Watermark Vectors */}
                    <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-between opacity-[0.05] p-20">
                        <div className="text-yellow-600">
                            <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-10 10c0 5.523 4.477 10 10 10s10-4.477 10-10A10 10 0 0 0 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm-1-13h2v4h-2V7zm0 6h2v2h-2v-2z" /></svg>
                        </div>
                        <div className="text-yellow-600">
                            <svg width="300" height="300" viewBox="0 0 24 24" fill="currentColor"><path d="M22.956 16.513c-.156-1.026-1.127-1.745-2.155-1.587l-1.397.214a10.02 10.02 0 0 0-1.603-3.877l1.01-1.01c.732-.731.732-1.916 0-2.648l-2.022-2.022c-.732-.731-1.916-.731-2.648 0l-1.01 1.01a10.02 10.02 0 0 0-3.877-1.603l.214-1.397c.158-1.028-.561-1.999-1.587-2.155l-2.822-.43A2.001 2.001 0 0 0 2.766 2.8l-.43 2.822c-.156 1.026.561 1.999 1.587 2.155l1.397-.214a10.02 10.02 0 0 0 1.603 3.877l-1.01 1.01c-.732.731-.732 1.916 0 2.648l2.022 2.022c.732.731 1.916.731 2.648 0l1.01-1.01a10.02 10.02 0 0 0 3.877 1.603l-.214 1.397c-.158 1.028.561 1.999 1.587 2.155l2.822.43c1.109.17 2.139-.623 2.296-1.792l.43-2.822z" /></svg>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <motion.div
                        variants={chatContainerVariants}
                        initial="hidden"
                        animate="show"
                        className="flex-1 overflow-y-auto px-8 py-10 z-10 flex flex-col gap-8 max-w-5xl mx-auto w-full"
                    >
                        {/* Bot Message */}
                        <motion.div variants={messageVariants} className="flex gap-4 items-start pr-12">
                            <div className="w-10 h-10 rounded-full bg-[#111827] flex items-center justify-center shrink-0 border-2 border-transparent shadow-sm">
                                <Bot size={20} className="text-yellow-400" />
                            </div>
                            <div className="bg-white rounded-2xl rounded-tl-sm shadow-[0_2px_10px_rgba(0,0,0,0.04)] p-5 border border-gray-100 text-gray-700 text-[15px] leading-relaxed max-w-[85%]">
                                Great choice! To build the perfect roadmap for <span className="font-semibold text-gray-900">Python Development</span>, I need to ask a few more things. How much time can you realistically dedicate to learning each week?
                            </div>
                        </motion.div>

                        {/* User Message */}
                        <motion.div variants={messageVariants} className="flex gap-4 items-start pl-12 justify-end">
                            <div className="bg-[#FFD900] rounded-2xl rounded-tr-sm shadow-[0_4px_15px_rgba(255,215,0,0.2)] p-5 border border-black text-gray-900 text-[15px] leading-relaxed max-w-[85%] font-medium">
                                I can spend about 10-15 hours a week, mostly during evenings and weekends.
                            </div>
                            <div className="w-10 h-10 rounded-full bg-[#FFD900] border border-black flex items-center justify-center shrink-0 shadow-sm">
                                <User size={18} className="text-black" />
                            </div>
                        </motion.div>

                        {/* Bot Message */}
                        <motion.div variants={messageVariants} className="flex gap-4 items-start pr-12">
                            <div className="w-10 h-10 rounded-full bg-[#111827] flex items-center justify-center shrink-0 border-2 border-transparent shadow-sm">
                                <Bot size={20} className="text-yellow-400" />
                            </div>
                            <div className="bg-white rounded-2xl rounded-tl-sm shadow-[0_2px_10px_rgba(0,0,0,0.04)] p-5 border border-gray-100 text-gray-700 text-[15px] leading-relaxed max-w-[85%]">
                                That's a solid commitment! 🚀 At that pace, we can cover the fundamentals and move into web frameworks like Django within 3 months. Are you interested in a specific field
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Input Area */}
                    <motion.div
                        variants={inputVariants}
                        initial="hidden"
                        animate="show"
                        className="z-10 pb-6 pt-4 px-8 max-w-5xl mx-auto w-full"
                    >
                        <div className="relative flex items-center justify-center gap-4">
                            <div className="flex-1 relative shadow-[0_4px_20px_rgba(0,0,0,0.05)] rounded-2xl">
                                <input
                                    type="text"
                                    placeholder="Type your response..."
                                    className="w-full h-14 pl-6 pr-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-yellow-400/50 text-[15px]"
                                    disabled
                                />
                            </div>
                            <button className="h-14 bg-[#FFD900] rounded-2xl px-8 flex items-center justify-center gap-2 hover:bg-yellow-400 transition-colors shadow-[0_4px_15px_rgba(255,215,0,0.3)] border border-black shrink-0 font-medium text-black">
                                Send <Send size={18} className="ml-1" />
                            </button>
                        </div>
                        <div className="text-center mt-4">
                            <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">
                                CARISKILL AI PERSONALIZATION ENGINE
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
