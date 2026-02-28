'use client';

import { use, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckSquare, CheckCircle2, XCircle } from 'lucide-react';

export default function QuizPage({ params }: { params: Promise<{ id: string, module_id: string }> }) {
    const { id, module_id } = use(params);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Mock quiz question for the module
    const question = "Which of the following is NOT a primitive data type in Python?";
    const options = [
        { text: "Integer (int)", isCorrect: false },
        { text: "Float (float)", isCorrect: false },
        { text: "List (list)", isCorrect: true },
        { text: "Boolean (bool)", isCorrect: false }
    ];

    const handleSelect = (index: number) => {
        if (!isSubmitted) setSelectedAnswer(index);
    };

    const handleSubmit = () => {
        if (selectedAnswer !== null) setIsSubmitted(true);
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#FFFDF6] font-sans text-gray-900">
            <Navbar isLoggedIn={true} />

            <main className="flex-grow w-full max-w-4xl mx-auto py-12 px-4 z-10 relative">
                <div className="absolute inset-0 pointer-events-none z-0 opacity-30 bg-[radial-gradient(#FDE68A_1.5px,transparent_1.5px)] [background-size:24px_24px]" />

                <div className="relative z-10">
                    <Link href={`/skill/${id}`} className="inline-flex items-center gap-2 text-yellow-600 hover:text-yellow-700 font-bold mb-8 transition-colors">
                        <ArrowLeft className="w-5 h-5" /> Back to Module Focus
                    </Link>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
                        <div className="flex items-center justify-center gap-3 mb-2">
                            <CheckSquare className="w-8 h-8 text-green-500" />
                            <h1 className="font-display text-4xl font-bold text-gray-900">Module Quiz</h1>
                        </div>
                        <p className="text-gray-500 text-lg">Test your knowledge on Variables!</p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="bg-white rounded-3xl p-8 md:p-12 border-2 border-gray-100 shadow-xl max-w-2xl mx-auto">
                        <h2 className="text-2xl font-bold mb-8 text-gray-800 leading-snug">{question}</h2>

                        <div className="space-y-4 mb-8">
                            {options.map((option, idx) => {
                                const isSelected = selectedAnswer === idx;
                                let stateClass = "bg-white border-2 border-gray-200 hover:border-yellow-400 hover:bg-yellow-50 text-gray-700";

                                if (isSubmitted) {
                                    if (option.isCorrect) stateClass = "bg-green-50 border-2 border-green-500 text-green-900";
                                    else if (isSelected && !option.isCorrect) stateClass = "bg-red-50 border-2 border-red-500 text-red-900";
                                    else stateClass = "bg-gray-50 border-2 border-gray-200 opacity-50";
                                } else if (isSelected) {
                                    stateClass = "bg-yellow-100 border-2 border-yellow-500 text-yellow-900 font-bold shadow-md";
                                }

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleSelect(idx)}
                                        disabled={isSubmitted}
                                        className={`w-full text-left p-5 rounded-xl transition-all flex items-center justify-between ${stateClass}`}
                                    >
                                        <span className="text-lg">{option.text}</span>
                                        {isSubmitted && option.isCorrect && <CheckCircle2 className="w-6 h-6 text-green-500" />}
                                        {isSubmitted && isSelected && !option.isCorrect && <XCircle className="w-6 h-6 text-red-500" />}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="text-center">
                            {!isSubmitted ? (
                                <button
                                    onClick={handleSubmit}
                                    disabled={selectedAnswer === null}
                                    className="px-10 py-4 bg-primary text-gray-900 font-bold rounded-full disabled:opacity-50 hover:bg-yellow-400 transition-colors shadow-lg active:scale-95 text-xl"
                                >
                                    Submit Answer
                                </button>
                            ) : (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                    <p className={`text-xl font-bold ${options[selectedAnswer!].isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                        {options[selectedAnswer!].isCorrect ? "Correct! Amazing job." : "Not quite. Arrays/Lists are complex data structures."}
                                    </p>
                                    <button onClick={() => { setIsSubmitted(false); setSelectedAnswer(null); }} className="px-8 py-3 bg-gray-900 text-white font-bold rounded-full hover:bg-gray-800 transition-colors shadow-lg active:scale-95">
                                        Try Again
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
