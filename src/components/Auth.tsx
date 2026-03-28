import React from "react";
import { Shield, Lock, Heart, Brain, Zap, LogIn } from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "../lib/i18n";

interface AuthProps {
  onSignIn: () => void;
  isLoading: boolean;
}

export default function Auth({ onSignIn, isLoading }: AuthProps) {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col items-center justify-center p-6 text-center space-y-12">
      <header className="space-y-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center justify-center w-24 h-24 bg-blue-600 text-white rounded-3xl shadow-2xl shadow-blue-500/30"
        >
          <Shield className="w-12 h-12" />
        </motion.div>
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">PurePath</h1>
          <p className="text-gray-600 font-medium max-w-xs mx-auto">
            {t("auth_subtitle")}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4 max-w-sm w-full">
        <FeatureCard icon={<Lock className="w-5 h-5 text-blue-500" />} text={t("digital_protection")} />
        <FeatureCard icon={<Heart className="w-5 h-5 text-red-500" />} text={t("emotional_support")} />
        <FeatureCard icon={<Brain className="w-5 h-5 text-indigo-500" />} text={t("mental_clarity")} />
        <FeatureCard icon={<Zap className="w-5 h-5 text-yellow-500" />} text={t("vital_energy")} />
      </div>

      <div className="w-full max-w-sm space-y-4">
        <button
          onClick={onSignIn}
          disabled={isLoading}
          className="w-full py-4 bg-white text-gray-900 font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3 border border-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <LogIn className="w-5 h-5 text-blue-600" />
          )}
          {t("sign_in_google")}
        </button>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">
          {t("privacy_no_judgment")}
        </p>
      </div>
    </div>
  );
}

function FeatureCard({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center gap-2">
      {icon}
      <span className="text-xs font-bold text-gray-700">{text}</span>
    </div>
  );
}
