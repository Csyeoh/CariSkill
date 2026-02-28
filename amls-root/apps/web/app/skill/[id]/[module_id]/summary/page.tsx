'use client';

import { use } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, CheckCircle } from 'lucide-react';

export default function SummaryPage({ params }: { params: Promise<{ id: string, module_id: string }> }) {
    const { id, module_id } = use(params);

    return (
        <div className="min-h-screen flex flex-col bg-[#FFFDF6] font-sans text-gray-900">
            <Navbar isLoggedIn={true} />

            <main className="flex-grow w-full max-w-4xl mx-auto py-12 px-4 z-10 relative">
                <div className="absolute inset-0 pointer-events-none z-0 opacity-30 bg-[radial-gradient(#FDE68A_1.5px,transparent_1.5px)] [background-size:24px_24px]" />

                <div className="relative z-10">
                    <Link href={`/skill/${id}`} className="inline-flex items-center gap-2 text-yellow-600 hover:text-yellow-700 font-bold mb-8 transition-colors">
                        <ArrowLeft className="w-5 h-5" /> Back to Module Focus
                    </Link>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                        <div className="flex items-center gap-3 mb-2">
                            <FileText className="w-8 h-8 text-purple-500" />
                            <h1 className="font-display text-4xl font-bold text-gray-900">Module Summary</h1>
                        </div>
                        <p className="text-gray-500 text-lg">Quick recap of Variables and Primitive Types</p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-3xl p-8 border-2 border-gray-100 shadow-xl space-y-6">
                        <div className="p-6 bg-purple-50 rounded-2xl border border-purple-100 text-purple-900 text-lg leading-relaxed">
                            <strong>Key Takeaway:</strong> Variables in programming act as storage containers that hold information securely in memory so that it can be manipulated later. Python infers types automatically, making it extremely easy to declare integers, floats, and strings without restrictive syntax.
                        </div>

                        <h3 className="text-xl font-bold border-b border-gray-100 pb-2 mt-8">Core Concepts Covered</h3>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500" /> <span><strong>Integers (`int`):</strong> Whole numbers without decimal points.</span></li>
                            <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500" /> <span><strong>Floats (`float`):</strong> Numbers that require decimal precision.</span></li>
                            <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500" /> <span><strong>Booleans (`bool`):</strong> True/False values for evaluating logic gates.</span></li>
                            <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500" /> <span><strong>Dynamic Typing:</strong> Python allows variable types to completely change during execution if you overwrite them.</span></li>
                        </ul>

                        <div className="flex justify-center mt-12 pt-8">
                            <span className="bg-green-100 text-green-800 px-6 py-2 rounded-full font-bold shadow-sm inline-flex items-center gap-2">
                                <CheckCircle className="w-5 h-5" /> You're ready to proceed to the next module!
                            </span>
                        </div>
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
