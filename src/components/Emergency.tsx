import React, { useState, useRef, useEffect } from "react";
import { Send, AlertTriangle, MessageSquare, Loader2, Trash2, Heart, ShieldAlert, Sparkles, User } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import { getSupportResponse } from "../lib/gemini";
import { SupportMessage } from "../types";
import { useLanguage } from "../lib/i18n";
import { useTheme } from "../lib/theme";

export default function Emergency() {
  const { t } = useLanguage();
  const { isDarkMode } = useTheme();
  const [messages, setMessages] = useState<SupportMessage[]>(() => {
    const saved = localStorage.getItem("purepath_emergency_messages");
    return saved ? JSON.parse(saved) : [
      {
        role: "model",
        content: t("emergency_welcome"),
        timestamp: new Date().toISOString(),
      },
    ];
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem("purepath_emergency_messages", JSON.stringify(messages));
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      const response = await getSupportResponse(input, []);
      const modelMessage: SupportMessage = {
        role: "model",
        content: response || t("error_process"),
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, modelMessage]);
    } catch (error) {
      console.error("Error getting support response:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content: t("error_connection"),
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "model",
        content: t("emergency_welcome"),
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const emergencyActions = [
    { key: "action_temptation", label: t("action_temptation"), icon: <Sparkles className="w-3 h-3" /> },
    { key: "action_relapse", label: t("action_relapse"), icon: <AlertTriangle className="w-3 h-3" /> },
    { key: "action_distraction", label: t("action_distraction"), icon: <Heart className="w-3 h-3" /> },
    { key: "action_why", label: t("action_why"), icon: <MessageSquare className="w-3 h-3" /> },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-3xl mx-auto p-4 space-y-4">
      <header className={`flex items-center justify-between p-4 ${isDarkMode ? "bg-red-950/20 border-red-900/30" : "bg-red-50 border-red-100"} rounded-3xl border backdrop-blur-sm`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 ${isDarkMode ? "bg-red-900/40" : "bg-red-100"} rounded-xl`}>
            <ShieldAlert className={`w-6 h-6 ${isDarkMode ? "text-red-400" : "text-red-600"}`} />
          </div>
          <div>
            <h2 className={`font-bold ${isDarkMode ? "text-red-400" : "text-red-700"}`}>{t("emergency_header")}</h2>
            <p className={`text-[10px] ${isDarkMode ? "text-red-400/60" : "text-red-600/60"} font-medium uppercase tracking-wider`}>{t("emergency_desc")}</p>
          </div>
        </div>
        <button 
          onClick={clearChat}
          className={`p-2 ${isDarkMode ? "text-gray-600 hover:text-gray-400" : "text-gray-400 hover:text-gray-600"} transition-colors`}
          title="Limpar conversa"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto space-y-6 p-4 scrollbar-hide">
        <AnimatePresence initial={false}>
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex items-end gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === "user" 
                  ? (isDarkMode ? "bg-blue-900/40 text-blue-400" : "bg-blue-100 text-blue-600")
                  : (isDarkMode ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-600")
              }`}>
                {msg.role === "user" ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>
              
              <div
                className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : `${isDarkMode ? "bg-gray-900 text-gray-100 border-gray-800" : "bg-white text-gray-800 border-gray-100"} rounded-bl-none border`
                }`}
              >
                <div className={`prose prose-sm max-w-none prose-p:leading-relaxed ${isDarkMode ? "prose-invert" : ""}`}>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
                <div className={`flex items-center gap-1 mt-2 opacity-40 text-[9px] font-medium uppercase tracking-tighter ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-end gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isDarkMode ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-600"}`}>
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <div className={`${isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"} p-4 rounded-2xl border rounded-bl-none flex items-center gap-2`}>
              <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"} font-medium animate-pulse`}>{t("thinking")}...</span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={`${isDarkMode ? "bg-gray-950/50" : "bg-white/50"} backdrop-blur-md p-4 rounded-3xl border ${isDarkMode ? "border-gray-800" : "border-gray-100"} space-y-4 shadow-lg`}>
        <div className="flex flex-wrap gap-2">
          {emergencyActions.map((action) => (
            <button
              key={action.key}
              onClick={() => setInput(action.label)}
              className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${
                isDarkMode 
                  ? "bg-gray-900 hover:bg-gray-800 text-gray-400 border-gray-800" 
                  : "bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-200"
              } py-2 px-4 rounded-xl border transition-all active:scale-95`}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>

        <div className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={t("talk_to_me")}
            className={`w-full p-4 pr-14 ${
              isDarkMode 
                ? "bg-gray-900 border-gray-800 text-white placeholder:text-gray-600" 
                : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400"
            } border rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all`}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-2 p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:grayscale transition-all shadow-md active:scale-90"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
