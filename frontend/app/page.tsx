"use client";

import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initially no session ID, backend will generate one if not provided
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isComplete) return;

    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      console.log("=====================================");
      console.log("🚀 [DEBUG] SENDING REQUEST TO BACKEND");
      console.log(`⏱️ Time: ${new Date().toISOString()}`);
      console.log(`💬 User Message: "${userMsg}"`);
      console.log(`🔑 Current Session ID: ${sessionId || "None (New Session)"}`);

      const payload: { message: string; session_id?: string } = { message: userMsg };
      if (sessionId) {
        payload.session_id = sessionId;
      }

      console.log("📦 Request Payload:", payload);

      const startTime = performance.now();
      const res = await fetch("http://127.0.0.1:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      const endTime = performance.now();

      console.log("✅ [DEBUG] RESPONSE RECEIVED FROM BACKEND");
      console.log(`⏱️ Time taken: ${(endTime - startTime).toFixed(2)} ms`);
      console.log(`📈 Response Status: ${res.status} ${res.statusText}`);
      console.log("📄 Raw Response Data:", JSON.stringify(data, null, 2));
      console.log("=====================================");

      // Save the returned session ID so we can pass it on the next request
      if (data.session_id && !sessionId) {
        setSessionId(data.session_id);
      }

      // Update with history from state if available, or just append the reply
      if (data.state && data.state.chat_history) {
        setMessages(data.state.chat_history);
      } else if (data.response && data.response.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.response.reply }]);
      }

      // Check if all requirements are gathered
      // MasterFlow returns "trigger_research" or similar when done
      if (
        data.response === "trigger_research" ||
        (data.response?.status === "completed" && data.response?.result === "trigger_research") ||
        data.response?.result === "trigger_research"
      ) {
        setIsComplete(true);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error connecting to the API." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-4">
      <main className="w-full max-w-2xl bg-gray-800 rounded-2xl shadow-xl overflow-hidden flex flex-col h-[80vh]">

        {/* Header */}
        <header className="bg-blue-600 p-4 text-center shadow-md z-10">
          <h1 className="text-xl font-bold tracking-wide">Master Learning Flow</h1>
          <p className="text-blue-200 text-sm">Requirements Gathering Chat</p>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-10">
              <p>No messages yet.</p>
              <p className="text-sm">Start the conversation Below.</p>
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl ${msg.role === "user"
                  ? "bg-blue-600 text-white rounded-tr-none"
                  : "bg-gray-700 text-gray-200 rounded-tl-none"
                  }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-700 text-gray-200 px-4 py-3 rounded-2xl rounded-tl-none flex space-x-2 items-center">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
              </div>
            </div>
          )}

          {isComplete && (
            <div className="mt-6 p-4 rounded-xl bg-green-500/20 border border-green-500 text-center animate-fade-in">
              <h2 className="text-green-400 font-bold text-xl mb-1">🎉 Requirements Gathered!</h2>
              <p className="text-green-300 text-sm">All necessary information has been successfully collected.</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <footer className="p-4 bg-gray-900 border-t border-gray-700">
          <form onSubmit={sendMessage} className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading || isComplete}
              placeholder={isComplete ? "Chat completed" : "Type your answer..."}
              className="flex-1 bg-gray-700 text-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim() || isComplete}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>
        </footer>
      </main>
    </div>
  );
}
