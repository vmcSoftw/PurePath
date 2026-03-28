import React, { useState, useRef, useEffect } from "react";
import { Send, MessageSquare, Loader2, User, Bot, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import { getCoachResponse } from "../lib/gemini";
import { UserProfile, JournalEntry, SupportMessage } from "../types";
import { useLanguage } from "../lib/i18n";

interface AICoachProps {
  userProfile: UserProfile | null;
  journalEntries: JournalEntry[];
  messages: SupportMessage[];
  setMessages: React.Dispatch<React.SetStateAction<SupportMessage[]>>;
}

export default function AICoach({ userProfile, journalEntries, messages, setMessages }: AICoachProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: SupportMessage = {
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Convert history to Gemini format
      const history = messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      }));

      const response = await getCoachResponse(input, history, userProfile, journalEntries);
      
      const modelMessage: SupportMessage = {
        role: "model",
        content: response || t("error_coach"),
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, modelMessage]);
    } catch (error) {
      console.error("Error getting coach response:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content: t("error_coach_tech"),
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 p-4 bg-indigo-600 text-white rounded-full shadow-2xl z-40 flex items-center gap-2"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="font-bold text-sm pr-2">{t("ai_coach")}</span>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 100 }}
            className="fixed bottom-24 right-6 w-[calc(100vw-3rem)] sm:w-96 h-[500px] bg-white rounded-3xl shadow-2xl z-50 flex flex-col border border-indigo-100 overflow-hidden"
          >
            <header className="p-4 bg-indigo-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">PurePath Coach</h3>
                  <p className="text-[10px] opacity-80">{t("ai_coach_desc")}</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex gap-2 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`p-2 rounded-lg shrink-0 h-fit ${msg.role === "user" ? "bg-indigo-100" : "bg-gray-100"}`}>
                      {msg.role === "user" ? <User className="w-4 h-4 text-indigo-600" /> : <Bot className="w-4 h-4 text-gray-600" />}
                    </div>
                    <div className={`p-3 rounded-2xl text-sm ${
                      msg.role === "user" 
                        ? "bg-indigo-600 text-white rounded-tr-none" 
                        : "bg-gray-50 text-gray-800 rounded-tl-none border border-gray-100"
                    }`}>
                      <div className="prose prose-sm max-w-none prose-p:leading-relaxed">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-2 max-w-[85%]">
                    <div className="p-2 rounded-lg bg-gray-100 h-fit">
                      <Bot className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 rounded-tl-none flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                      <span className="text-xs text-gray-500 italic">{t("writing")}</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={t("ask_advice")}
                  className="w-full p-3 pr-12 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-1.5 top-1.5 p-1.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
