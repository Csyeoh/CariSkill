'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Bot, User, Send, MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import { createClient } from '@/utils/supabase/client';

interface MessageRecord {
    id: string;
    created_at: string;
    role: 'user' | 'ai';
    content: string;
    type: string;
    chat_id: string;
}

export default function FloatingChat({ chatId }: { chatId: string }) {
    const { user, isLoading: authLoading } = useAuth();
    const supabase = createClient();

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<MessageRecord[]>([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [inputMessage, setInputMessage] = useState("");
    const [isSending, setIsSending] = useState(false);

    // Fetch Messages when opened
    useEffect(() => {
        if (!chatId || !isOpen) return;

        const fetchMessages = async () => {
            setLoadingMessages(true);
            const { data, error } = await supabase
                .from('messages')
                .select('id, created_at, role, content, type, chat_id')
                .eq('chat_id', chatId)
                .order('created_at', { ascending: true });

            if (!error && data) {
                setMessages(data);
            } else {
                if (error) console.error("Error fetching messages:", error);
                setMessages([]);
            }
            setLoadingMessages(false);
        };

        fetchMessages();

        // Subscribe to real-time changes
        const channel = supabase
            .channel(`messages_${chatId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `chat_id=eq.${chatId}`
                },
                (payload) => {
                    const newMsg = payload.new as MessageRecord;
                    setMessages((prev) => {
                        // Prevent duplicates
                        if (prev.some((m) => m.id === newMsg.id)) return prev;
                        return [...prev, newMsg];
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [chatId, isOpen, supabase]);

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || !chatId || isSending) return;

        const currentMsg = inputMessage.trim();
        setInputMessage("");
        setIsSending(true);

        try {
            const { data: insertedUserMsg, error: insertError } = await supabase
                .from('messages')
                .insert([{ chat_id: chatId, role: 'user', content: currentMsg, type: 'text' }])
                .select()
                .single();

            if (insertError) throw insertError;

            // Instantly display user message
            if (insertedUserMsg) {
                setMessages(prev => {
                    if (prev.some(m => m.id === insertedUserMsg.id)) return prev;
                    return [...prev, insertedUserMsg];
                });
            }

            // Hit the AI worker
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: chatId, message: currentMsg })
            });

            if (!response.ok) throw new Error(`API returned ${response.status}`);

            const data = await response.json();

            let aiReply = "No response from AI";
            if (data.response?.reply) {
                aiReply = data.response.reply;
            } else if (data.response?.result) {
                aiReply = typeof data.response.result === 'string' ? data.response.result : JSON.stringify(data.response.result);
            } else if (typeof data.response === 'string') {
                aiReply = data.response;
            } else if (data.response) {
                aiReply = JSON.stringify(data.response);
            }

            const { data: insertedAiMsg, error: aiInsertError } = await supabase
                .from('messages')
                .insert([{ chat_id: chatId, role: 'ai', content: aiReply, type: 'text' }])
                .select()
                .single();

            if (aiInsertError) throw aiInsertError;

            if (insertedAiMsg) {
                setMessages(prev => {
                    if (prev.some(m => m.id === insertedAiMsg.id)) return prev;
                    return [...prev, insertedAiMsg];
                });
            }

        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setIsSending(false);
        }
    };

    const modalVariants: Variants = {
        hidden: { opacity: 0, scale: 0.95, y: 20 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 25 } },
        exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } }
    };

    const messageVariants: Variants = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="mb-4 w-[380px] h-[550px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-[#FFD900] p-4 flex items-center justify-between border-b border-yellow-500/20">
                            <div className="flex items-center gap-2">
                                <Bot size={20} className="text-gray-900" />
                                <h3 className="font-bold text-gray-900">Masterflow Assistant</h3>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-gray-900 hover:bg-yellow-400 p-1 rounded-md transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 bg-[#FFFDF5] flex flex-col gap-4">
                            {loadingMessages ? (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="animate-spin w-6 h-6 border-3 border-yellow-400 border-t-transparent rounded-full opacity-50"></div>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-70">
                                    <MessageCircle className="w-10 h-10 text-yellow-500 mb-2" />
                                    <p className="text-sm text-gray-600">Start asking about your roadmap!</p>
                                </div>
                            ) : (
                                messages.map((message) => {
                                    if (message.role === 'ai') {
                                        return (
                                            <motion.div key={message.id} variants={messageVariants} initial="hidden" animate="show" className="flex gap-3 items-start pr-8">
                                                <div className="w-8 h-8 rounded-full bg-[#111827] flex items-center justify-center shrink-0 shadow-sm mt-1">
                                                    <Bot size={16} className="text-yellow-400" />
                                                </div>
                                                <div className="bg-white rounded-2xl rounded-tl-sm shadow-sm p-3 border border-gray-100 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                                                    {message.content}
                                                </div>
                                            </motion.div>
                                        );
                                    } else {
                                        return (
                                            <motion.div key={message.id} variants={messageVariants} initial="hidden" animate="show" className="flex gap-3 items-start pl-8 justify-end">
                                                <div className="bg-[#FFD900] rounded-2xl rounded-tr-sm shadow-sm p-3 border border-yellow-500/20 text-gray-900 text-sm leading-relaxed font-medium whitespace-pre-wrap">
                                                    {message.content}
                                                </div>
                                            </motion.div>
                                        );
                                    }
                                })
                            )}
                            {isSending && (
                                <motion.div variants={messageVariants} initial="hidden" animate="show" className="flex gap-3 items-start pr-8">
                                    <div className="w-8 h-8 rounded-full bg-[#111827] flex items-center justify-center shrink-0 shadow-sm mt-1">
                                        <Bot size={16} className="text-yellow-400" />
                                    </div>
                                    <div className="bg-white rounded-2xl rounded-tl-sm shadow-sm p-3 border border-gray-100 text-gray-700 text-sm flex items-center gap-1 h-[42px]">
                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '-0.3s' }}></div>
                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '-0.15s' }}></div>
                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                                    </div>
                                </motion.div>
                            )}
                            {/* A dummy div to push content up and handle scrolling can be added here if needed */}
                        </div>

                        {/* Input Area */}
                        <div className="p-3 bg-white border-t border-gray-100">
                            <div className="relative flex items-center gap-2">
                                <input
                                    type="text"
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    disabled={isSending || loadingMessages}
                                    placeholder={isSending ? "Thinking..." : "Message AI..."}
                                    className="flex-1 h-10 pl-4 pr-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/50 text-sm disabled:opacity-50"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={isSending || loadingMessages || !inputMessage.trim()}
                                    className="h-10 w-10 bg-[#111827] hover:bg-gray-800 rounded-xl flex items-center justify-center transition-colors shadow-md text-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                                >
                                    {isSending ? (
                                        <div className="animate-spin w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full"></div>
                                    ) : (
                                        <Send size={16} className="-ml-0.5" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Toggle Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-14 h-14 rounded-full bg-[#111827] text-yellow-400 shadow-xl flex items-center justify-center border-2 border-transparent hover:border-yellow-400 transition-colors z-50 focus:outline-none"
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={28} />}
            </motion.button>
        </div>
    );
}
