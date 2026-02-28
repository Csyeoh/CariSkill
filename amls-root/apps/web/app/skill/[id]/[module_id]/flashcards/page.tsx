'use client';

import { use, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Layers, RotateCw } from 'lucide-react';

export default function FlashcardsPage({ params }: { params: Promise<{ id: string, module_id: string }> }) {
    const { id, module_id } = use(params);
    const [isFlipped, setIsFlipped] = useState(false);
    const [currentCard, setCurrentCard] = useState(0);

    const cards = [
        { front: "What data type is defined by a decimal point? (e.g. 3.14)", back: "Float" },
        { front: "Is it required to declare a variable's type when initializing it in Python?", back: "No. Python is dynamically typed, variables assume the type of the value assigned." },
        { front: "What are the boolean values in Python?", back: "True and False (capitalized)" }
    ];

    const handleNext = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentCard((prev) => (prev + 1) % cards.length);
        }, 150);
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#FFFDF6] font-sans text-gray-900">
            <Navbar isLoggedIn={true} />

            <main className="flex-grow w-full max-w-4xl mx-auto py-12 px-4 z-10 relative flex flex-col items-center">
                <div className="absolute inset-0 pointer-events-none z-0 opacity-30 bg-[radial-gradient(#FDE68A_1.5px,transparent_1.5px)] [background-size:24px_24px]" />

                <div className="relative z-10 w-full mb-8">
                    <Link href={`/skill/${id}`} className="inline-flex items-center gap-2 text-yellow-600 hover:text-yellow-700 font-bold mb-4 transition-colors">
                        <ArrowLeft className="w-5 h-5" /> Back
                    </Link>
                    <div className="flex items-center justify-center gap-3">
                        <Layers className="w-8 h-8 text-pink-500" />
                        <h1 className="font-display text-4xl font-bold text-gray-900 text-center">Flashcards Review</h1>
                    </div>
                </div>

                {/* Flashcard Component */}
                <div className="relative z-10 w-full max-w-xl h-80 perspective-1000 mt-8">
                    <motion.div
                        className="w-full h-full relative preserve-3d cursor-pointer"
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                        onClick={() => setIsFlipped(!isFlipped)}
                    >
                        {/* Front */}
                        <div className="absolute inset-0 backface-hidden bg-white border-2 border-gray-100 rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 text-center text-2xl font-bold text-gray-800">
                            <span className="absolute top-6 left-6 text-sm font-medium text-gray-400">Card {currentCard + 1} of {cards.length}</span>
                            {cards[currentCard].front}
                            <div className="absolute bottom-6 flex items-center gap-2 text-sm text-gray-400 font-medium">
                                <RotateCw className="w-4 h-4" /> Click to flip
                            </div>
                        </div>

                        {/* Back */}
                        <div className="absolute inset-0 backface-hidden bg-yellow-50 border-2 border-yellow-300 rounded-3xl shadow-xl flex items-center justify-center p-8 text-center text-2xl font-bold text-yellow-900" style={{ transform: 'rotateY(180deg)' }}>
                            {cards[currentCard].back}
                        </div>
                    </motion.div>
                </div>

                <div className="relative z-10 mt-12">
                    <button onClick={handleNext} className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-lg active:scale-95">
                        Next Card
                    </button>
                </div>

            </main>

            <Footer />
        </div>
    );
}
