import React, { useState } from "react";
import { Plus, Save, Trash2, Calendar, Edit3, Smile, Frown, Meh, Zap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { JournalEntry } from "../types";
import { useLanguage } from "../lib/i18n";
import { useTheme } from "../lib/theme";

interface JournalProps {
  entries: JournalEntry[];
  onAdd: (content: string, mood: JournalEntry["mood"]) => void;
  onDelete: (id: string) => void;
}

export default function Journal({ entries, onAdd, onDelete }: JournalProps) {
  const { t } = useLanguage();
  const { isDarkMode } = useTheme();
  const [isAdding, setIsAdding] = useState(false);
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<JournalEntry["mood"]>("calm");

  const handleSubmit = () => {
    if (!content.trim()) return;
    onAdd(content, mood);
    setContent("");
    setMood("calm");
    setIsAdding(false);
  };

  const moodIcons = {
    calm: <Smile className="w-5 h-5 text-green-500" />,
    tempted: <Meh className="w-5 h-5 text-yellow-500" />,
    struggling: <Frown className="w-5 h-5 text-red-500" />,
    victorious: <Zap className="w-5 h-5 text-indigo-500" />,
  };

  const moodLabels = {
    calm: t("mood_calm"),
    tempted: t("mood_tempted"),
    struggling: t("mood_struggling"),
    victorious: t("mood_victorious"),
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{t("journal")}</h1>
          <p className={`${isDarkMode ? "text-gray-400" : "text-gray-500"} text-sm`}>{t("journal_subtitle")}</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all"
        >
          {isAdding ? <Plus className="w-6 h-6 rotate-45 transition-transform" /> : <Plus className="w-6 h-6" />}
        </button>
      </header>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className={`${isDarkMode ? "bg-gray-900 border-gray-800 shadow-2xl" : "bg-white border-blue-100 shadow-xl"} p-6 rounded-3xl border space-y-6`}
          >
            <div className="space-y-2">
              <label className={`text-sm font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{t("how_feeling")}</label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(moodIcons) as Array<JournalEntry["mood"]>).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMood(m)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      mood === m 
                        ? (isDarkMode ? "bg-blue-900/30 text-blue-400 border-2 border-blue-800" : "bg-blue-50 text-blue-600 border-2 border-blue-200") 
                        : (isDarkMode ? "bg-gray-800 text-gray-400 border-2 border-transparent" : "bg-gray-50 text-gray-600 border-2 border-transparent")
                    }`}
                  >
                    {moodIcons[m]}
                    {moodLabels[m]}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className={`text-sm font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{t("what_happened")}</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={t("journal_placeholder")}
                className={`w-full h-32 p-4 ${isDarkMode ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500" : "bg-gray-50 border-gray-200 text-gray-900"} border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none`}
              />
            </div>

            <button
              onClick={handleSubmit}
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {t("save_entry")}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        {entries.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <div className={`inline-flex items-center justify-center w-16 h-16 ${isDarkMode ? "bg-gray-900" : "bg-gray-100"} rounded-full`}>
              <Edit3 className={`w-8 h-8 ${isDarkMode ? "text-gray-600" : "text-gray-400"}`} />
            </div>
            <p className={`${isDarkMode ? "text-gray-500" : "text-gray-500"} font-medium`}>{t("no_entries")}</p>
          </div>
        ) : (
          entries.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`${isDarkMode ? "bg-gray-900 border-gray-800 shadow-sm" : "bg-white border-gray-100 shadow-sm"} p-6 rounded-3xl border space-y-4 relative group`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 ${isDarkMode ? "bg-gray-800" : "bg-gray-50"} rounded-lg`}>{moodIcons[entry.mood]}</div>
                  <div>
                    <p className={`text-sm font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{moodLabels[entry.mood]}</p>
                    <div className={`flex items-center gap-1 text-[10px] ${isDarkMode ? "text-gray-500" : "text-gray-400"} font-medium uppercase tracking-wider`}>
                      <Calendar className="w-3 h-3" />
                      {new Date(entry.date).toLocaleDateString("pt-BR", { day: 'numeric', month: 'long' })}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onDelete(entry.id)}
                  className={`p-2 ${isDarkMode ? "text-gray-700 hover:text-red-400" : "text-gray-300 hover:text-red-500"} transition-colors opacity-0 group-hover:opacity-100`}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <p className={`${isDarkMode ? "text-gray-300" : "text-gray-700"} leading-relaxed whitespace-pre-wrap`}>{entry.content}</p>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
