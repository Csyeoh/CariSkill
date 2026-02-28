'use client';

import { use } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Code } from 'lucide-react';

export default function MaterialsPage({ params }: { params: Promise<{ id: string, module_id: string }> }) {
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

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <BookOpen className="w-8 h-8 text-[#4da6ff]" />
                            <h1 className="font-display text-4xl font-bold text-gray-900">Learning Materials</h1>
                        </div>
                        <p className="text-gray-500 text-lg">Variables & Primitive Types ({module_id})</p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-3xl p-8 border-2 border-gray-100 shadow-xl space-y-8">
                        <section>
                            <h2 className="text-2xl font-bold mb-4 font-display">1. What is a variable?</h2>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                A variable is simply a container for storing data values. In Python, a variable is created the moment you first assign a value to it. Unlike statically typed languages like C++ or Java, Python has no command for declaring a variable and its type beforehand.
                            </p>
                            <div className="bg-gray-900 rounded-xl p-4 font-mono text-sm text-green-400">
                                <p>x = 5</p>
                                <p>name = "Data Science"</p>
                                <p>print(x)</p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 font-display">2. Primitive Types</h2>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-4 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                                    <div className="p-2 bg-yellow-200 rounded-lg"><Code className="w-5 h-5 text-yellow-800" /></div>
                                    <div>
                                        <strong className="block text-yellow-900 text-lg">Integers (int)</strong>
                                        <p className="text-yellow-800 mt-1">Whole numbers, positive or negative, without decimals. E.g., `age = 25`</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4 p-4 bg-[#ebf5ff] rounded-xl border border-[#cce6ff]">
                                    <div className="p-2 bg-[#99ccff] rounded-lg"><Code className="w-5 h-5 text-blue-900" /></div>
                                    <div>
                                        <strong className="block text-blue-900 text-lg">Floats (float)</strong>
                                        <p className="text-blue-800 mt-1">Floating point numbers containing decimals. E.g., `pi = 3.14159`</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4 p-4 bg-pink-50 rounded-xl border border-pink-100">
                                    <div className="p-2 bg-pink-200 rounded-lg"><Code className="w-5 h-5 text-pink-900" /></div>
                                    <div>
                                        <strong className="block text-pink-900 text-lg">Booleans (bool)</strong>
                                        <p className="text-pink-800 mt-1">Logical truth values evaluating to exactly `True` or `False`.</p>
                                    </div>
                                </li>
                            </ul>
                        </section>
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
