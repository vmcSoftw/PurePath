import React, { useState, useEffect } from "react";
import { Home, Book, Shield, AlertTriangle, User, LogOut, Download, Smartphone, X, MoreVertical, Share, Languages, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "../lib/i18n";
import { useTheme } from "../lib/theme";

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSignOut: () => void;
  userPhoto?: string;
}

export default function Layout({ children, activeTab, setActiveTab, onSignOut, userPhoto }: LayoutProps) {
  const { language, setLanguage, t } = useLanguage();
  const { isDarkMode, toggleTheme } = useTheme();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
      }
    } else {
      setShowInstallModal(true);
    }
  };

  const tabs = [
    { id: "dashboard", icon: <Home className="w-5 h-5" />, label: t("dashboard") },
    { id: "journal", icon: <Book className="w-5 h-5" />, label: t("journal") },
    { id: "protection", icon: <Shield className="w-5 h-5" />, label: t("protection") },
    { id: "emergency", icon: <AlertTriangle className="w-5 h-5" />, label: t("emergency") },
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-gray-950" : "bg-gray-50"} flex flex-col transition-colors duration-300`}>
      <header className={`${isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"} border-b p-4 sticky top-0 z-50 transition-colors duration-300`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <Shield className="w-5 h-5" />
            </div>
            <span className={`font-black text-xl tracking-tight ${isDarkMode ? "text-white" : "text-gray-900"}`}>PurePath</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl transition-all ${
                isDarkMode 
                  ? "text-yellow-400 hover:bg-yellow-400/10" 
                  : "text-indigo-600 hover:bg-indigo-50"
              }`}
              title={isDarkMode ? t("light_mode") : t("dark_mode")}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              onClick={handleInstallClick}
              className={`p-2 ${isDarkMode ? "text-blue-400 hover:bg-blue-400/10" : "text-blue-600 hover:bg-blue-50"} rounded-xl transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider`}
              title={t("install_app")}
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">{t("install_app")}</span>
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className={`w-10 h-10 rounded-full border-2 ${isDarkMode ? "border-gray-800 bg-gray-800" : "border-blue-100 bg-gray-100"} overflow-hidden hover:scale-105 transition-transform`}
              >
                {userPhoto ? (
                  <img src={userPhoto} alt="User" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                    <User className="w-5 h-5" />
                  </div>
                )}
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className={`absolute right-0 mt-2 w-56 ${isDarkMode ? "bg-gray-900 border-gray-800 shadow-2xl" : "bg-white border-gray-100 shadow-xl"} rounded-2xl border z-50 overflow-hidden`}
                    >
                      <div className={`p-4 border-b ${isDarkMode ? "border-gray-800" : "border-gray-50"}`}>
                        <div className={`flex items-center gap-2 ${isDarkMode ? "text-gray-500" : "text-gray-400"} mb-2`}>
                          <Languages className="w-4 h-4" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">{t("language")}</span>
                        </div>
                        <div className="grid grid-cols-1 gap-1">
                          {[
                            { id: "pt-BR", label: "Português (BR)" },
                            { id: "en-US", label: "English" },
                            { id: "es-ES", label: "Español" }
                          ].map((lang) => (
                            <button
                              key={lang.id}
                              onClick={() => {
                                setLanguage(lang.id as any);
                                setShowProfileMenu(false);
                              }}
                              className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                language === lang.id 
                                  ? (isDarkMode ? "bg-blue-900/30 text-blue-400 font-bold" : "bg-blue-50 text-blue-600 font-bold") 
                                  : (isDarkMode ? "text-gray-400 hover:bg-gray-800" : "text-gray-600 hover:bg-gray-50")
                              }`}
                            >
                              {lang.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={onSignOut}
                        className={`w-full p-4 flex items-center gap-3 text-red-600 ${isDarkMode ? "hover:bg-red-900/20 border-gray-800" : "hover:bg-red-50 border-gray-50"} transition-colors border-t`}
                      >
                        <LogOut className="w-5 h-5" />
                        <span className="text-sm font-bold">{t("sign_out")}</span>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-24">
        {children}
      </main>

      <nav className={`fixed bottom-0 left-0 right-0 ${isDarkMode ? "bg-gray-900/80 border-gray-800" : "bg-white/80 border-gray-100"} backdrop-blur-xl border-t p-4 z-50 transition-colors duration-300`}>
        <div className="max-w-md mx-auto flex items-center justify-between">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 transition-all ${
                activeTab === tab.id 
                  ? (isDarkMode ? "text-blue-400 scale-110" : "text-blue-600 scale-110") 
                  : (isDarkMode ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600")
              }`}
            >
              <div className={`p-2 rounded-xl transition-colors ${activeTab === tab.id ? (isDarkMode ? "bg-blue-900/30" : "bg-blue-50") : ""}`}>
                {tab.icon}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Manual Install Instructions Modal */}
      <AnimatePresence>
        {showInstallModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`${isDarkMode ? "bg-gray-900 border border-gray-800" : "bg-white"} rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden`}
            >
              <div className="bg-blue-600 p-6 text-white text-center relative">
                <button 
                  onClick={() => setShowInstallModal(false)}
                  className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Download className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold">{t("install_title")}</h3>
                <p className="text-blue-100 text-sm mt-1">{t("install_subtitle")}</p>
              </div>

              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-8 h-8 ${isDarkMode ? "bg-gray-800 text-blue-400" : "bg-gray-100 text-blue-600"} rounded-full flex items-center justify-center shrink-0 font-bold`}>1</div>
                    <div className="space-y-1">
                      <p className={`font-bold ${isDarkMode ? "text-white" : "text-gray-900"} flex items-center gap-2`}>
                        <Smartphone className="w-4 h-4" /> {t("install_android")}
                      </p>
                      <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                        {t("install_android_desc")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className={`w-8 h-8 ${isDarkMode ? "bg-gray-800 text-blue-400" : "bg-gray-100 text-blue-600"} rounded-full flex items-center justify-center shrink-0 font-bold`}>2</div>
                    <div className="space-y-1">
                      <p className={`font-bold ${isDarkMode ? "text-white" : "text-gray-900"} flex items-center gap-2`}>
                        <Smartphone className="w-4 h-4" /> {t("install_ios")}
                      </p>
                      <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                        {t("install_ios_desc")}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowInstallModal(false)}
                  className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100/20"
                >
                  {t("got_it")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
