'use client';

import React, { useEffect, useState, useRef } from 'react';
import { History, Bot, User, Send, Compass } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/components/AuthProvider';
import { createClient } from '@/utils/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';

interface ChatRecord {
    id: string;
    created_at: string;
    title: string;
    user_id: string;
}

interface MessageRecord {
    id: string;
    created_at: string;
    role: 'user' | 'ai';
    content: string;
    type: string;
    chat_id: string;
}

export default function ChatPage() {
    return (
        <React.Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
            <ChatContent />
        </React.Suspense>
    );
}

function ChatContent() {
    const { user, isLoading: authLoading } = useAuth();
    const supabase = createClient();
    const router = useRouter();
    const searchParams = useSearchParams();
    const specificChatId = searchParams.get('id');

    const [chats, setChats] = useState<ChatRecord[]>([]);
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const [messages, setMessages] = useState<MessageRecord[]>([]);
    const [loadingChats, setLoadingChats] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);

    const [inputMessage, setInputMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const initialTriggerRef = useRef<Set<string>>(new Set());

    // Fetch Chats
    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.push('/login');
            return;
        }

        const fetchChats = async () => {
            setLoadingChats(true);
            const { data, error } = await supabase
                .from('chat')
                .select('id, created_at, title, user_id')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (!error && data && data.length > 0) {
                setChats(data);
            } else {
                setChats([]);
            }
            setLoadingChats(false);
        };

        fetchChats();
    }, [user, authLoading, router, supabase]);

    // Handle Active Chat Selection
    useEffect(() => {
        if (chats.length > 0) {
            const validSpecificId = specificChatId && chats.some(c => c.id === specificChatId);
            const desiredId = validSpecificId ? specificChatId : chats[0].id;

            if (selectedChatId !== desiredId) {
                setSelectedChatId(desiredId);
                // Help sync the url if there wasn't one at all
                if (!validSpecificId) {
                    router.replace(`/chat?id=${desiredId}`);
                }
            }
        }
    }, [chats, specificChatId, router, selectedChatId]);

    // Fetch Messages when selected chat changes
    useEffect(() => {
        if (!selectedChatId) return;

        const fetchMessages = async () => {
            setLoadingMessages(true);
            const { data, error } = await supabase
                .from('messages')
                .select('id, created_at, role, content, type, chat_id')
                .eq('chat_id', selectedChatId)
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

        // Subscribe to real-time changes so AI messages appear automatically
        const channel = supabase
            .channel(`messages_${selectedChatId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `chat_id=eq.${selectedChatId}`
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
    }, [selectedChatId, supabase]);

    // Auto-trigger API for fresh chats directly from /setup
    useEffect(() => {
        if (messages.length === 1 && messages[0].role === 'user' && !loadingMessages && selectedChatId) {
            if (initialTriggerRef.current.has(selectedChatId)) return;

            initialTriggerRef.current.add(selectedChatId);
            setIsSending(true);

            const triggerInitialAI = async () => {
                try {
                    const response = await fetch('http://localhost:8080/api/chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ session_id: selectedChatId, message: messages[0].content })
                    });

                    if (response.ok) {
                        const data = await response.json();
                        let aiReply = "No response";
                        if (data.response?.reply) {
                            aiReply = data.response.reply;
                        } else if (data.response?.result) {
                            aiReply = typeof data.response.result === 'string' ? data.response.result : JSON.stringify(data.response.result);
                        } else if (typeof data.response === 'string') {
                            aiReply = data.response;
                        } else {
                            aiReply = JSON.stringify(data.response);
                        }

                        const { data: insertedMsg, error: insertAiError } = await supabase
                            .from('messages')
                            .insert([{ chat_id: selectedChatId, role: 'ai', content: aiReply, type: 'text' }])
                            .select()
                            .single();

                        if (!insertAiError && insertedMsg) {
                            setMessages(prev => {
                                if (prev.some(m => m.id === insertedMsg.id)) return prev;
                                return [...prev, insertedMsg];
                            });
                        }
                    }
                } catch (error) {
                    console.error("Error triggering initial AI response:", error);
                } finally {
                    setIsSending(false);
                }
            };
            triggerInitialAI();
        }
    }, [messages, selectedChatId, loadingMessages, supabase]);

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || !selectedChatId || isSending) return;

        const currentMsg = inputMessage.trim();
        setInputMessage("");
        setIsSending(true);

        try {
            const { data: insertedUserMsg, error: insertError } = await supabase
                .from('messages')
                .insert([{ chat_id: selectedChatId, role: 'user', content: currentMsg, type: 'text' }])
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

            const response = await fetch('http://localhost:8080/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: selectedChatId, message: currentMsg })
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
                .insert([{ chat_id: selectedChatId, role: 'ai', content: aiReply, type: 'text' }])
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

    const chatContainerVariants: Variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.15 }
        }
    };

    const messageVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 250, damping: 24 } }
    };

    const sidebarVariants: Variants = {
        hidden: { opacity: 0, x: -30 },
        show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } }
    };

    const inputVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { delay: 0.6, duration: 0.4, ease: 'easeOut' } }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    };

    // Global loading state while checking auth or loading initial chats
    if (authLoading || loadingChats) {
        return (
            <div className="flex flex-col h-screen bg-white overflow-hidden">
                <Navbar isLoggedIn={!!user} />
                <div className="flex flex-1 w-full items-center justify-center">
                    <div className="animate-spin w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-white overflow-hidden">
            <Navbar isLoggedIn={!!user} />

            <div className="flex flex-1 w-full overflow-hidden">
                {/* Sidebar for Chat History (Removed for focused flow) */}

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

                    {/* EMPTY STATE */}
                    {chats.length === 0 ? (
                        <div className="flex-1 z-10 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
                            <Compass className="w-16 h-16 text-yellow-500 mb-6 opacity-80" />
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Active Chats</h2>
                            <p className="text-gray-600 mb-8 leading-relaxed">
                                You haven't started any personalized learning flows yet! Head over to the explore page to discover new AI-guided courses or generate your own roadmaps designed precisely for you!
                            </p>
                            <button
                                onClick={() => router.push('/explore')}
                                className="bg-[#FFD900] hover:bg-yellow-400 text-black font-semibold rounded-2xl px-8 py-4 shadow-[0_4px_15px_rgba(255,215,0,0.3)] border border-black transition-transform active:scale-95"
                            >
                                Browse Roadmaps
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Messages Area */}
                            {loadingMessages ? (
                                <div className="flex-1 overflow-y-auto px-8 py-10 z-10 flex flex-col items-center justify-center gap-8 max-w-5xl mx-auto w-full">
                                    <div className="animate-spin w-6 h-6 border-3 border-yellow-400 border-t-transparent rounded-full opacity-50"></div>
                                </div>
                            ) : (
                                <motion.div
                                    key={selectedChatId}
                                    variants={chatContainerVariants}
                                    initial="hidden"
                                    animate="show"
                                    className="flex-1 overflow-y-auto px-8 py-10 z-10 flex flex-col gap-8 max-w-5xl mx-auto w-full"
                                >
                                    {messages.map((message) => {
                                        if (message.role === 'ai') {
                                            return (
                                                <motion.div key={message.id} variants={messageVariants} initial="hidden" animate="show" className="flex gap-4 items-start pr-12">
                                                    <div className="w-10 h-10 rounded-full bg-[#111827] flex items-center justify-center shrink-0 border-2 border-transparent shadow-sm">
                                                        <Bot size={20} className="text-yellow-400" />
                                                    </div>
                                                    <div className="bg-white rounded-2xl rounded-tl-sm shadow-[0_2px_10px_rgba(0,0,0,0.04)] p-5 border border-gray-100 text-gray-700 text-[15px] leading-relaxed max-w-[85%] whitespace-pre-wrap">
                                                        {message.content}
                                                    </div>
                                                </motion.div>
                                            );
                                        } else {
                                            return (
                                                <motion.div key={message.id} variants={messageVariants} initial="hidden" animate="show" className="flex gap-4 items-start pl-12 justify-end">
                                                    <div className="bg-[#FFD900] rounded-2xl rounded-tr-sm shadow-[0_4px_15px_rgba(255,215,0,0.2)] p-5 border border-black text-gray-900 text-[15px] leading-relaxed max-w-[85%] font-medium whitespace-pre-wrap">
                                                        {message.content}
                                                    </div>
                                                    <div className="w-10 h-10 rounded-full bg-[#FFD900] border border-black flex items-center justify-center shrink-0 shadow-sm">
                                                        <User size={18} className="text-black" />
                                                    </div>
                                                </motion.div>
                                            );
                                        }
                                    })}
                                    {isSending && (
                                        <motion.div variants={messageVariants} initial="hidden" animate="show" className="flex gap-4 items-start pr-12">
                                            <div className="w-10 h-10 rounded-full bg-[#111827] flex items-center justify-center shrink-0 border-2 border-transparent shadow-sm">
                                                <Bot size={20} className="text-yellow-400" />
                                            </div>
                                            <div className="bg-white rounded-2xl rounded-tl-sm shadow-[0_2px_10px_rgba(0,0,0,0.04)] p-5 border border-gray-100 text-gray-700 text-[15px] leading-relaxed max-w-[85%] flex items-center gap-1.5 h-[56px]">
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '-0.3s' }}></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '-0.15s' }}></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                            </div>
                                        </motion.div>
                                    )}
                                </motion.div>
                            )}

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
                                            value={inputMessage}
                                            onChange={(e) => setInputMessage(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                            disabled={isSending || loadingMessages}
                                            placeholder={isSending ? "AI is thinking..." : "Type your response..."}
                                            className="w-full h-14 pl-6 pr-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-yellow-400/50 text-[15px] disabled:opacity-50"
                                        />
                                    </div>
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={isSending || loadingMessages || !inputMessage.trim()}
                                        className="h-14 bg-[#FFD900] rounded-2xl px-8 flex items-center justify-center gap-2 hover:bg-yellow-400 transition-colors shadow-[0_4px_15px_rgba(255,215,0,0.3)] border border-black shrink-0 font-medium text-black disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSending ? (
                                            <div className="animate-spin w-5 h-5 border-2 border-black border-t-transparent rounded-full"></div>
                                        ) : (
                                            <>Send <Send size={18} className="ml-1" /></>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
