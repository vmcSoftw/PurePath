import React, { useState, useEffect } from "react";
import { formatDistanceToNow, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Trophy, Calendar, Flame, RefreshCcw, Heart, Brain, ShieldCheck, Sparkles, Lightbulb, Loader2, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile, JournalEntry, SupportMessage, FocusSession } from "../types";
import AICoach from "./AICoach";
import { getDailyTip } from "../lib/gemini";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { startOfWeek, endOfWeek, subWeeks, format, isWithinInterval } from "date-fns";
import { useLanguage } from "../lib/i18n";
import { useTheme } from "../lib/theme";

interface DashboardProps {
  userProfile: UserProfile | null;
  journalEntries: JournalEntry[];
  focusSessions: FocusSession[];
  chatMessages: SupportMessage[];
  setChatMessages: React.Dispatch<React.SetStateAction<SupportMessage[]>>;
  onRelapse: () => void;
}

export default function Dashboard({ userProfile, journalEntries, focusSessions, chatMessages, setChatMessages, onRelapse }: DashboardProps) {
  const { t } = useLanguage();
  const { isDarkMode } = useTheme();
  const [days, setDays] = useState(0);
  const [timeStr, setTimeStr] = useState("");
  const [dailyTip, setDailyTip] = useState<string>("Sua jornada é única. Cada dia sem pornografia é um dia de cura para o seu cérebro.");
  const [isGeneratingTip, setIsGeneratingTip] = useState(false);

  useEffect(() => {
    if (userProfile?.sobrietyStartDate) {
      const start = new Date(userProfile.sobrietyStartDate);
      const update = () => {
        setDays(differenceInDays(new Date(), start));
        setTimeStr(formatDistanceToNow(start, { locale: ptBR, addSuffix: false }));
      };
      update();
      const interval = setInterval(update, 60000);
      return () => clearInterval(interval);
    }
  }, [userProfile?.sobrietyStartDate]);

  const handleGenerateTip = async () => {
    setIsGeneratingTip(true);
    try {
      const tip = await getDailyTip(userProfile, journalEntries);
      if (tip) setDailyTip(tip);
    } catch (error) {
      console.error("Erro ao gerar dica:", error);
    } finally {
      setIsGeneratingTip(false);
    }
  };

  const getUsageData = () => {
    const weeks = [3, 2, 1, 0].map(weeksAgo => {
      const start = startOfWeek(subWeeks(new Date(), weeksAgo), { weekStartsOn: 1 });
      const end = endOfWeek(start, { weekStartsOn: 1 });
      
      const journalCount = journalEntries.filter(e => 
        isWithinInterval(new Date(e.date), { start, end })
      ).length;
      
      const focusCount = focusSessions.filter(s => 
        isWithinInterval(new Date(s.date), { start, end })
      ).length;
      
      const messageCount = chatMessages.filter(m => 
        m.role === "user" && isWithinInterval(new Date(m.timestamp), { start, end })
      ).length;

      return {
        name: `Semana ${4 - weeksAgo}`,
        "Diário": journalCount,
        "Foco": focusCount,
        "IA Coach": messageCount,
      };
    });
    return weeks;
  };

  const usageData = getUsageData();

  if (!userProfile) return null;

  const stats = [
    { label: t("streak_record"), value: `${userProfile.longestStreak} dias`, icon: <Trophy className="w-5 h-5 text-yellow-500" /> },
    { label: t("start_date"), value: new Date(userProfile.sobrietyStartDate).toLocaleDateString("pt-BR"), icon: <Calendar className="w-5 h-5 text-blue-500" /> },
    { label: t("status"), value: t("status_cleaning"), icon: <ShieldCheck className="w-5 h-5 text-green-500" /> },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <header className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center justify-center w-48 h-48 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/10 blur-2xl animate-pulse" />
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-6xl font-black tracking-tighter">{days}</span>
            <span className="text-sm font-medium uppercase tracking-widest opacity-80">{days === 1 ? "Dia" : "Dias"}</span>
          </div>
        </motion.div>
        <div className="space-y-1">
          <h1 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{t("progress")}</h1>
          <p className={`${isDarkMode ? "text-gray-400" : "text-gray-500"} text-sm italic`}>{t("free_for")} {timeStr}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"} p-4 rounded-2xl shadow-sm border flex items-center gap-4`}
          >
            <div className={`p-3 ${isDarkMode ? "bg-gray-800" : "bg-gray-50"} rounded-xl`}>{stat.icon}</div>
            <div>
              <p className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-500"} font-medium uppercase tracking-wider`}>{stat.label}</p>
              <p className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dica do Dia Section */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-3xl shadow-lg text-white space-y-4 md:col-span-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Lightbulb className="w-32 h-32" />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <h2 className="text-lg font-bold">{t("daily_tip")}</h2>
              </div>
              <button 
                onClick={handleGenerateTip}
                disabled={isGeneratingTip}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors disabled:opacity-50"
                title="Gerar nova dica com IA"
              >
                {isGeneratingTip ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
              </button>
            </div>
            <AnimatePresence mode="wait">
              <motion.p 
                key={dailyTip}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-lg font-medium leading-relaxed italic"
              >
                "{dailyTip}"
              </motion.p>
            </AnimatePresence>
            <p className="text-xs opacity-70">— PurePath Coach</p>
          </div>
        </div>

        <div className={`${isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"} p-6 rounded-3xl shadow-sm border space-y-4`}>
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{t("achievements")}</h2>
          </div>
          <div className="space-y-4">
            <MilestoneItem 
              days={1} 
              currentDays={days} 
              label="Primeiro Passo" 
              description="24 horas de liberdade." 
              isDarkMode={isDarkMode}
            />
            <MilestoneItem 
              days={3} 
              currentDays={days} 
              label="Fase de Retirada" 
              description="Superando os primeiros impulsos." 
              isDarkMode={isDarkMode}
            />
            <MilestoneItem 
              days={7} 
              currentDays={days} 
              label="Uma Semana" 
              description="Seu cérebro está começando a se curar." 
              isDarkMode={isDarkMode}
            />
            <MilestoneItem 
              days={30} 
              currentDays={days} 
              label="Um Mês" 
              description="Novos hábitos estão se formando." 
              isDarkMode={isDarkMode}
            />
          </div>
        </div>

        <div className={`${isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"} p-6 rounded-3xl shadow-sm border space-y-4`}>
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-indigo-500" />
            <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{t("benefits")}</h2>
          </div>
          <ul className="space-y-3">
            <BenefitItem text={t("benefit_focus")} isDarkMode={isDarkMode} />
            <BenefitItem text={t("benefit_energy")} isDarkMode={isDarkMode} />
            <BenefitItem text={t("benefit_emotional")} isDarkMode={isDarkMode} />
            <BenefitItem text={t("benefit_confidence")} isDarkMode={isDarkMode} />
          </ul>
        </div>
      </div>

      <div className={`${isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"} p-6 rounded-3xl shadow-sm border space-y-4`}>
        <div className="flex items-center gap-3">
          <Heart className="w-6 h-6 text-red-500" />
          <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{t("emergency_action")}</h2>
        </div>
        <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
          {t("emergency_desc_dash")}
        </p>
        <button
          onClick={onRelapse}
          className={`w-full py-4 ${isDarkMode ? "bg-red-900/20 text-red-400 hover:bg-red-900/30" : "bg-red-50 text-red-600 hover:bg-red-100"} font-bold rounded-2xl transition-colors flex items-center justify-center gap-2`}
        >
          <RefreshCcw className="w-5 h-5" />
          {t("relapse_button")}
        </button>
      </div>

      <AICoach 
        userProfile={userProfile} 
        journalEntries={journalEntries} 
        messages={chatMessages}
        setMessages={setChatMessages}
      />

      <div className={`${isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"} p-6 rounded-3xl shadow-sm border space-y-6`}>
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{t("recent_activity")}</h2>
        </div>
        <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{t("recent_activity_desc")}</p>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={usageData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#1f2937" : "#f3f4f6"} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: isDarkMode ? "#6b7280" : "#9ca3af" }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: isDarkMode ? "#6b7280" : "#9ca3af" }}
              />
              <Tooltip 
                cursor={{ fill: isDarkMode ? "#111827" : "#f9fafb" }}
                contentStyle={{ 
                  backgroundColor: isDarkMode ? "#111827" : "#ffffff",
                  borderRadius: "16px", 
                  border: isDarkMode ? "1px solid #374151" : "none", 
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  fontSize: "12px",
                  color: isDarkMode ? "#f3f4f6" : "#111827"
                }}
                itemStyle={{ color: isDarkMode ? "#f3f4f6" : "#111827" }}
              />
              <Bar dataKey="Diário" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Foco" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="IA Coach" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex justify-center gap-6 pt-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-indigo-500" />
            <span className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>{t("journal")}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>{t("protection")}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>IA Coach</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MilestoneItem({ days, currentDays, label, description, isDarkMode }: { days: number; currentDays: number; label: string; description: string; isDarkMode: boolean }) {
  const isAchieved = currentDays >= days;
  const progress = Math.min((currentDays / days) * 100, 100);

  return (
    <div className={`space-y-2 ${isAchieved ? "opacity-100" : "opacity-60"}`}>
      <div className="flex justify-between items-end">
        <div>
          <p className={`text-sm font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{label}</p>
          <p className={`text-[10px] ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>{description}</p>
        </div>
        <p className={`text-[10px] font-bold ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}>{isAchieved ? "Concluído" : `${days - currentDays} dias restantes`}</p>
      </div>
      <div className={`h-1.5 w-full ${isDarkMode ? "bg-gray-800" : "bg-gray-100"} rounded-full overflow-hidden`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className={`h-full ${isAchieved ? "bg-green-500" : "bg-blue-500"}`}
        />
      </div>
    </div>
  );
}

function BenefitItem({ text, isDarkMode }: { text: string; isDarkMode: boolean }) {
  return (
    <li className={`flex items-center gap-3 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
      {text}
    </li>
  );
}
