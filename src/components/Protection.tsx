import React, { useState, useEffect } from "react";
import { Moon, Sun, Shield, Globe, Lock, CheckCircle, Info, Timer, Play, Square, AlertCircle, X, Key, Eye, EyeOff, Search, ExternalLink, AlertOctagon, Smartphone, Plus, Trash2, History, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

import { UserProfile, JournalEntry, SupportMessage } from "../types";
import { checkUrlSafety } from "../lib/gemini";
import { useLanguage } from "../lib/i18n";
import { useTheme } from "../lib/theme";

interface CheckHistoryEntry {
  url: string;
  isMalicious: boolean;
  timestamp: string;
}

interface ProtectionProps {
  onStartFocus?: (duration: number) => void;
}

export default function Protection({ onStartFocus }: ProtectionProps) {
  const { t, language } = useLanguage();
  const { isDarkMode } = useTheme();

  const theme = {
    bg: isDarkMode ? "bg-gray-950" : "bg-gray-50/50",
    cardBg: isDarkMode ? "bg-gray-900" : "bg-white",
    text: isDarkMode ? "text-gray-100" : "text-gray-900",
    textMuted: isDarkMode ? "text-gray-400" : "text-gray-500",
    border: isDarkMode ? "border-gray-800" : "border-indigo-100",
    inputBg: isDarkMode ? "bg-gray-800" : "bg-gray-50",
    inputBorder: isDarkMode ? "border-gray-700" : "border-gray-200",
    accentBg: isDarkMode ? "bg-indigo-900/30" : "bg-indigo-50",
    accentText: isDarkMode ? "text-indigo-300" : "text-indigo-600",
    shadow: isDarkMode ? "shadow-none" : "shadow-sm",
    modalBg: isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-transparent",
  };

  const [isFocusModeActive, setIsFocusModeActive] = useState(false);
  const [focusDuration, setFocusDuration] = useState(25); // minutes
  const [timeLeft, setTimeLeft] = useState(0); // seconds
  const [focusPassword, setFocusPassword] = useState("");
  const [isSettingPassword, setIsSettingPassword] = useState(false);
  const [tempPassword, setTempPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);
  const [verificationInput, setVerificationInput] = useState("");
  const [error, setError] = useState("");
  const [urlToCheck, setUrlToCheck] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [blockedApps, setBlockedApps] = useState<string[]>(() => {
    const saved = localStorage.getItem("purepath_blocked_apps");
    return saved ? JSON.parse(saved) : ["Instagram", "Twitter", "TikTok"];
  });
  const [newApp, setNewApp] = useState("");

  const appSuggestions = [
    "Instagram", "TikTok", "X (Twitter)", "Facebook", "YouTube", "Reddit", "Discord", "Snapchat"
  ];

  useEffect(() => {
    localStorage.setItem("purepath_blocked_apps", JSON.stringify(blockedApps));
  }, [blockedApps]);
  const [checkHistory, setCheckHistory] = useState<CheckHistoryEntry[]>(() => {
    const saved = localStorage.getItem("purepath_check_history");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("purepath_check_history", JSON.stringify(checkHistory));
  }, [checkHistory]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isFocusModeActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isFocusModeActive) {
      setIsFocusModeActive(false);
    }
    return () => clearInterval(interval);
  }, [isFocusModeActive, timeLeft]);

  const startFocusMode = () => {
    setTimeLeft(focusDuration * 60);
    setIsFocusModeActive(true);
    if (onStartFocus) onStartFocus(focusDuration);
  };

  const stopFocusMode = () => {
    if (focusPassword) {
      setIsVerifyingPassword(true);
      setVerificationInput("");
      setError("");
    } else {
      if (window.confirm(t("confirm_stop_focus"))) {
        setIsFocusModeActive(false);
        setTimeLeft(0);
      }
    }
  };

  const handleVerifyPassword = () => {
    if (verificationInput === focusPassword) {
      setIsFocusModeActive(false);
      setTimeLeft(0);
      setIsVerifyingPassword(false);
      setVerificationInput("");
      setError("");
    } else {
      setError(t("incorrect_password"));
    }
  };

  const handleSavePassword = () => {
    setFocusPassword(tempPassword);
    setIsSettingPassword(false);
    setTempPassword("");
  };

  const handleCheckUrl = async () => {
    if (!urlToCheck.trim()) return;
    setIsChecking(true);
    
    try {
      // First pass: Local keyword check (fast)
      const maliciousPatterns = [
        "porn", "xxx", "sex", "adult", "gamble", "casino", "bet", "free-money", "phish", "malware", "virus",
        "redtube", "pornhub", "xvideos", "xhamster", "brazzers", "youporn", "chaturbate", "onlyfans"
      ];
      
      const localCheck = maliciousPatterns.some(pattern => urlToCheck.toLowerCase().includes(pattern));
      
      let result;
      if (localCheck) {
        result = { 
          isMalicious: true, 
          category: "Adult", 
          reason: language === "pt-BR" ? "URL contém palavras-chave de conteúdo adulto." : 
                  language === "en-US" ? "URL contains adult content keywords." : 
                  "La URL contiene palabras clave de contenido para adultos."
        };
      } else {
        // Second pass: AI analysis (smarter)
        result = await checkUrlSafety(urlToCheck, language);
      }
      
      const newEntry: CheckHistoryEntry = {
        url: urlToCheck,
        isMalicious: result.isMalicious,
        timestamp: new Date().toISOString(),
      };
      
      setCheckHistory(prev => [newEntry, ...prev].slice(0, 50));

      if (result.isMalicious) {
        toast.error(t("malicious_detected").replace("{category}", result.category), {
          description: result.reason || t("url_blocked_desc").replace("{url}", urlToCheck),
          duration: 8000,
        });
      } else {
        toast.success(t("safe_site"), {
          description: t("safe_site_desc"),
        });
      }
    } catch (error) {
      console.error("Erro na verificação:", error);
      toast.error(t("check_error"));
    } finally {
      setIsChecking(false);
      setUrlToCheck("");
    }
  };

  const addApp = (appName: string) => {
    const name = appName.trim();
    if (name && !blockedApps.includes(name)) {
      setBlockedApps([...blockedApps, name]);
      setNewApp("");
      toast.success(`${name} ${t("app_added")}`);
    }
  };

  const removeApp = (app: string) => {
    setBlockedApps(blockedApps.filter(a => a !== app));
    toast.info(`${app} ${t("app_removed")}`);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const guides = [
    {
      title: "DNS-Level Blocking",
      description: "A forma mais eficaz de bloquear conteúdo adulto em toda a sua rede.",
      steps: [
        "Altere suas configurações de DNS para CleanBrowsing (185.228.168.168) ou Cloudflare for Families (1.1.1.3).",
        "Isso bloqueia o conteúdo na fonte, dificultando o acesso mesmo em modo anônimo.",
      ],
      icon: <Globe className="w-6 h-6 text-blue-500" />,
    },
    {
      title: "Browser Extensions",
      description: "Adicione uma camada extra de proteção diretamente no seu navegador.",
      steps: [
        "Instale extensões como 'BlockSite' ou 'Cold Turkey Blocker'.",
        "Configure uma senha e entregue-a a um amigo de confiança.",
      ],
      icon: <Shield className="w-6 h-6 text-green-500" />,
    },
    {
      title: "Safe Search",
      description: "Force o Google e outros motores de busca a filtrar resultados explícitos.",
      steps: [
        "Vá para as Configurações de Busca do Google e ative o 'SafeSearch'.",
        "Bloqueie o SafeSearch para evitar que seja desativado facilmente.",
      ],
      icon: <Lock className="w-6 h-6 text-purple-500" />,
    },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme.bg}`}>
      <div className="p-6 max-w-4xl mx-auto space-y-8">
        <header className="flex items-center justify-between gap-4">
          <div className="flex-1 text-center md:text-left space-y-2">
            <h1 className={`text-3xl font-bold ${theme.text}`}>{t("protection")}</h1>
            <p className={theme.textMuted}>
              {t("protection_subtitle")}
            </p>
          </div>
        </header>

        {/* Focus Mode Section */}
        <section className={`${theme.cardBg} p-6 rounded-3xl ${theme.shadow} border ${theme.border} space-y-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 ${theme.accentBg} rounded-2xl`}>
                <Timer className={`w-6 h-6 ${theme.accentText}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className={`text-xl font-bold ${theme.text}`}>{t("focus_mode")}</h2>
                  <motion.div
                    animate={isFocusModeActive ? { scale: [1, 1.2, 1], opacity: [1, 0.5, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className={`w-2.5 h-2.5 rounded-full ${isFocusModeActive ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-gray-300"}`}
                  />
                </div>
                <p className={`text-sm ${theme.textMuted}`}>{t("focus_mode_desc_short")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {!isFocusModeActive && (
                <button
                  onClick={() => setIsSettingPassword(true)}
                  className={`p-2 ${isDarkMode ? "text-gray-400 hover:text-indigo-400" : "text-gray-400 hover:text-indigo-600"} transition-colors flex items-center gap-2 text-sm font-medium`}
                  title={t("setup_password")}
                >
                  <Key className="w-4 h-4" />
                  {focusPassword ? t("change_password") : t("set_password")}
                </button>
              )}
              {isFocusModeActive && (
                <div className="px-4 py-2 bg-indigo-600 text-white rounded-full font-mono font-bold animate-pulse">
                  {formatTime(timeLeft)}
                </div>
              )}
            </div>
          </div>

          {!isFocusModeActive ? (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                {[15, 25, 45, 60, 90, 120].map((duration) => (
                  <button
                    key={duration}
                    onClick={() => setFocusDuration(duration)}
                    className={`py-3 rounded-2xl font-bold transition-all ${
                      focusDuration === duration
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 scale-105"
                        : `${isDarkMode ? "bg-gray-800 text-gray-400 hover:bg-gray-700" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`
                    }`}
                  >
                    {duration} min
                  </button>
                ))}
              </div>
              <button
                onClick={startFocusMode}
                className={`w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 ${isDarkMode ? "" : "shadow-xl shadow-indigo-100"}`}
              >
                <Play className="w-5 h-5 fill-current" />
                {t("start_focus")}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className={`p-4 ${isDarkMode ? "bg-indigo-900/20 border-indigo-900/30" : "bg-indigo-50 border-indigo-100"} rounded-2xl border flex gap-3 items-center`}>
                <AlertCircle className={`w-5 h-5 ${isDarkMode ? "text-indigo-400" : "text-indigo-600"} shrink-0`} />
                <p className={`text-sm font-medium ${isDarkMode ? "text-indigo-200" : "text-indigo-900"}`}>
                  {t("focus_active_desc_short")}
                </p>
              </div>
              <button
                onClick={stopFocusMode}
                className={`w-full py-4 font-bold rounded-2xl border-2 transition-all flex items-center justify-center gap-2 ${
                  isDarkMode 
                    ? "bg-gray-800 text-red-400 border-red-900/30 hover:bg-red-900/10" 
                    : "bg-white text-red-600 border-red-50 hover:bg-red-50"
                }`}
              >
                <Square className="w-5 h-5 fill-current" />
                {t("stop_focus")}
              </button>
            </div>
          )}
        </section>

        {/* App Blocking Section */}
        <section className={`${theme.cardBg} p-6 rounded-3xl ${theme.shadow} border ${theme.border} space-y-6`}>
          <div className="flex items-center gap-3">
            <div className={`p-3 ${theme.accentBg} rounded-2xl`}>
              <Smartphone className={`w-6 h-6 ${theme.accentText}`} />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${theme.text}`}>{t("app_blocking")}</h2>
              <p className={`text-sm ${theme.textMuted}`}>{t("app_blocking_desc")}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newApp}
                onChange={(e) => setNewApp(e.target.value)}
                placeholder={t("app_placeholder")}
                className={`flex-1 p-3 ${theme.inputBg} border ${theme.inputBorder} rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${isDarkMode ? "text-white placeholder:text-gray-500" : "text-gray-900"}`}
                onKeyDown={(e) => e.key === "Enter" && addApp(newApp)}
              />
              <button
                onClick={() => addApp(newApp)}
                className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Suggestions */}
            <div className="space-y-2">
              <p className={`text-[10px] font-bold ${isDarkMode ? "text-gray-500" : "text-gray-400"} uppercase tracking-wider px-1`}>
                {t("app_suggestions")}
              </p>
              <div className="flex flex-wrap gap-2">
                {appSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => addApp(suggestion)}
                    disabled={blockedApps.includes(suggestion)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                      blockedApps.includes(suggestion)
                        ? `${isDarkMode ? "bg-gray-800 text-gray-600 border-gray-700" : "bg-gray-50 text-gray-300 border-gray-100"} cursor-not-allowed`
                        : `${isDarkMode ? "bg-gray-700 text-gray-300 border-gray-600 hover:border-indigo-500 hover:text-indigo-400" : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600"}`
                    }`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {blockedApps.map((app) => (
              <motion.div
                layout
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                key={app}
                className={`flex items-center gap-2 px-3 py-1.5 ${isDarkMode ? "bg-indigo-900/30 text-indigo-300 border-indigo-800/50" : "bg-indigo-50 text-indigo-700 border-indigo-100"} rounded-full text-sm font-medium border`}
              >
                {app}
                <button onClick={() => removeApp(app)} className={`transition-colors ${isDarkMode ? "hover:text-red-400" : "hover:text-red-600"}`}>
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
          </div>

          <div className={`p-4 ${isDarkMode ? "bg-blue-900/20 border-blue-900/30" : "bg-blue-50 border-blue-100"} rounded-2xl border space-y-3`}>
            <div className={`flex gap-2 items-center font-bold text-sm ${isDarkMode ? "text-blue-300" : "text-blue-900"}`}>
              <Info className="w-4 h-4" />
              {t("how_block_real")}
            </div>
            <p className={`text-xs leading-relaxed ${isDarkMode ? "text-blue-200/70" : "text-blue-800"}`}>
              {t("how_block_real_desc")}
            </p>
          </div>
        </section>

        {/* Site Checker Section */}
        <section className={`${theme.cardBg} p-6 rounded-3xl ${theme.shadow} border ${isDarkMode ? "border-red-900/30" : "border-red-100"} space-y-6`}>
          <div className="flex items-center gap-3">
            <div className={`p-3 ${isDarkMode ? "bg-red-900/30" : "bg-red-50"} rounded-2xl`}>
              <Shield className={`w-6 h-6 ${isDarkMode ? "text-red-400" : "text-red-600"}`} />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${theme.text}`}>{t("site_checker")}</h2>
              <p className={`text-sm ${theme.textMuted}`}>{t("site_checker_desc")}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={urlToCheck}
                onChange={(e) => setUrlToCheck(e.target.value)}
                placeholder="https://exemplo.com/pagina..."
                className={`w-full p-4 pl-12 ${theme.inputBg} border ${theme.inputBorder} rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 ${isDarkMode ? "text-white placeholder:text-gray-500" : "text-gray-900"}`}
                onKeyDown={(e) => e.key === "Enter" && handleCheckUrl()}
              />
            </div>
            <button
              onClick={handleCheckUrl}
              disabled={isChecking || !urlToCheck.trim()}
              className="px-8 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {isChecking ? t("checking") : t("check")}
              {!isChecking && <ExternalLink className="w-4 h-4" />}
            </button>
          </div>

          <div className={`p-4 ${isDarkMode ? "bg-red-900/20 border-red-900/30" : "bg-red-50 border-red-100"} rounded-2xl border flex gap-3 items-center`}>
            <AlertOctagon className={`w-5 h-5 ${isDarkMode ? "text-red-400" : "text-red-600"} shrink-0`} />
            <p className={`text-xs font-medium ${isDarkMode ? "text-red-200" : "text-red-900"}`}>
              {t("site_checker_note")}
            </p>
          </div>
        </section>

        {/* Check History Section */}
        <section className={`${theme.cardBg} p-6 rounded-3xl ${theme.shadow} border ${isDarkMode ? "border-gray-800" : "border-gray-100"} space-y-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 ${isDarkMode ? "bg-gray-800" : "bg-gray-50"} rounded-2xl`}>
                <History className={`w-6 h-6 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`} />
              </div>
              <div>
                <h2 className={`text-xl font-bold ${theme.text}`}>{t("check_history")}</h2>
                <p className={`text-sm ${theme.textMuted}`}>{t("check_history_desc")}</p>
              </div>
            </div>
            {checkHistory.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm(t("confirm_clear_history"))) {
                    setCheckHistory([]);
                  }
                }}
                className={`text-xs font-bold hover:underline ${isDarkMode ? "text-red-400" : "text-red-600"}`}
              >
                {t("clear_all")}
              </button>
            )}
          </div>

          {checkHistory.length === 0 ? (
            <div className={`text-center py-12 ${isDarkMode ? "bg-gray-900/50 border-gray-800" : "bg-gray-50 border-gray-200"} rounded-2xl border border-dashed`}>
              <p className={`text-sm ${isDarkMode ? "text-gray-600" : "text-gray-400"}`}>{t("no_checks")}</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2 scrollbar-hide">
              {checkHistory.map((entry, index) => (
                <motion.div
                  key={entry.timestamp + index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                    entry.isMalicious 
                      ? `${isDarkMode ? "bg-red-900/20 border-red-900/30" : "bg-red-50 border-red-100"}` 
                      : `${isDarkMode ? "bg-green-900/20 border-green-900/30" : "bg-green-50 border-green-100"}`
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {entry.isMalicious ? (
                      <AlertTriangle className={`w-5 h-5 ${isDarkMode ? "text-red-400" : "text-red-600"} shrink-0`} />
                    ) : (
                      <CheckCircle className={`w-5 h-5 ${isDarkMode ? "text-green-400" : "text-green-600"} shrink-0`} />
                    )}
                    <div className="min-w-0">
                      <p className={`text-sm font-bold truncate ${entry.isMalicious ? (isDarkMode ? "text-red-200" : "text-red-900") : (isDarkMode ? "text-green-200" : "text-green-900")}`}>
                        {entry.url}
                      </p>
                      <p className={`text-[10px] opacity-60 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {new Date(entry.timestamp).toLocaleString(language === "pt-BR" ? "pt-BR" : "en-US")}
                      </p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    entry.isMalicious 
                      ? `${isDarkMode ? "bg-red-900/40 text-red-300" : "bg-red-200 text-red-800"}` 
                      : `${isDarkMode ? "bg-green-900/40 text-green-300" : "bg-green-200 text-green-800"}`
                  }`}>
                    {entry.isMalicious ? t("blocked") : t("safe")}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Password Setup Modal */}
        <AnimatePresence>
          {isSettingPassword && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[300] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className={`${theme.modalBg} p-8 rounded-3xl shadow-2xl max-w-sm w-full space-y-6`}
              >
                <div className="text-center space-y-2">
                  <div className={`w-12 h-12 ${isDarkMode ? "bg-indigo-900/30" : "bg-indigo-50"} rounded-2xl flex items-center justify-center mx-auto`}>
                    <Key className={`w-6 h-6 ${isDarkMode ? "text-indigo-400" : "text-indigo-600"}`} />
                  </div>
                  <h3 className={`text-xl font-bold ${theme.text}`}>{t("setup_password")}</h3>
                  <p className={`text-sm ${theme.textMuted}`}>
                    {t("setup_password_desc")}
                  </p>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={tempPassword}
                    onChange={(e) => setTempPassword(e.target.value)}
                    placeholder={t("password_placeholder")}
                    className={`w-full p-4 pr-12 ${theme.inputBg} border ${theme.inputBorder} rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${isDarkMode ? "text-white" : "text-gray-900"}`}
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setIsSettingPassword(false);
                      setTempPassword("");
                    }}
                    className={`flex-1 py-3 font-bold rounded-2xl transition-colors ${isDarkMode ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  >
                    {t("cancel")}
                  </button>
                  <button
                    onClick={handleSavePassword}
                    className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-colors"
                  >
                    {t("save")}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Password Verification Modal */}
        <AnimatePresence>
          {isVerifyingPassword && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[300] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className={`${theme.modalBg} p-8 rounded-3xl shadow-2xl max-w-sm w-full space-y-6`}
              >
                <div className="text-center space-y-2">
                  <div className={`w-12 h-12 ${isDarkMode ? "bg-red-900/30" : "bg-red-50"} rounded-2xl flex items-center justify-center mx-auto`}>
                    <Lock className={`w-6 h-6 ${isDarkMode ? "text-red-400" : "text-red-600"}`} />
                  </div>
                  <h3 className={`text-xl font-bold ${theme.text}`}>{t("password_verification")}</h3>
                  <p className={`text-sm ${theme.textMuted}`}>
                    {t("password_verification_desc")}
                  </p>
                </div>

                <div className="space-y-2">
                  <input
                    type="password"
                    value={verificationInput}
                    onChange={(e) => setVerificationInput(e.target.value)}
                    placeholder={t("password_placeholder")}
                    className={`w-full p-4 ${theme.inputBg} border ${theme.inputBorder} rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${isDarkMode ? "text-white" : "text-gray-900"}`}
                    onKeyDown={(e) => e.key === "Enter" && handleVerifyPassword()}
                    autoFocus
                  />
                  {error && <p className="text-xs text-red-600 font-medium text-center">{error}</p>}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setIsVerifyingPassword(false)}
                    className={`flex-1 py-3 font-bold rounded-2xl transition-colors ${isDarkMode ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  >
                    {t("back")}
                  </button>
                  <button
                    onClick={handleVerifyPassword}
                    className="flex-1 py-3 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-colors"
                  >
                    {t("verify")}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide, index) => (
            <motion.div
              key={guide.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${theme.cardBg} p-6 rounded-2xl shadow-sm border ${theme.border} space-y-4`}
            >
              <div className="flex items-center gap-3">
                {guide.icon}
                <h2 className={`font-semibold text-lg ${theme.text}`}>{guide.title}</h2>
              </div>
              <p className={`text-sm ${theme.textMuted}`}>{guide.description}</p>
              <ul className="space-y-2">
                {guide.steps.map((step, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span className={isDarkMode ? "text-gray-300" : "text-gray-700"}>{step}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <div className={`p-6 rounded-2xl border flex gap-4 ${isDarkMode ? "bg-blue-900/20 border-blue-900/30" : "bg-blue-50 border-blue-100"}`}>
          <Info className={`w-6 h-6 shrink-0 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
          <div className="space-y-1">
            <h3 className={`font-semibold ${isDarkMode ? "text-blue-300" : "text-blue-900"}`}>{t("blocking_note")}</h3>
            <p className={`text-sm ${isDarkMode ? "text-blue-200/70" : "text-blue-800"}`}>
              {t("blocking_note_desc")}
            </p>
          </div>
        </div>

        {/* Focus Overlay */}
        <AnimatePresence>
          {isFocusModeActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-indigo-900/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="max-w-md space-y-8"
              >
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-indigo-400 blur-3xl opacity-20 animate-pulse" />
                  <Timer className="w-24 h-24 text-white relative z-10 mx-auto" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-4xl font-black text-white tracking-tight">{t("focus_active")}</h2>
                  <p className="text-indigo-200 font-medium">
                    {t("focus_overlay_desc")}
                  </p>
                </div>

                <div className="text-7xl font-mono font-black text-white tracking-tighter">
                  {formatTime(timeLeft)}
                </div>

                {blockedApps.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest">{t("apps_restricted")}:</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {blockedApps.map(app => (
                        <span key={app} className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-white text-xs font-medium">
                          {app}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-6 bg-white/10 rounded-3xl border border-white/10 backdrop-blur-md">
                  <p className="text-white italic font-serif text-lg">
                    "{t("focus_quote")}"
                  </p>
                </div>

                <button
                  onClick={stopFocusMode}
                  className="text-indigo-300 hover:text-white transition-colors flex items-center gap-2 mx-auto font-bold uppercase tracking-widest text-xs"
                >
                  <X className="w-4 h-4" />
                  {t("stop_focus")}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
