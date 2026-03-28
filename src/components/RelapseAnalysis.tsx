import React, { useState } from "react";
import { AlertCircle, CheckCircle2, XCircle, ArrowRight, HelpCircle } from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "../lib/i18n";

interface RelapseAnalysisProps {
  onComplete: (data: any) => void;
  onCancel: () => void;
}

export default function RelapseAnalysis({ onComplete, onCancel }: RelapseAnalysisProps) {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    trigger: "",
    feeling: "",
    location: "",
    time: "",
    lesson: "",
  });

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
    else onComplete(answers);
  };

  const questions = [
    {
      id: "trigger",
      label: t("q_trigger"),
      placeholder: t("p_trigger"),
      icon: <AlertCircle className="w-6 h-6 text-red-500" />,
    },
    {
      id: "feeling",
      label: t("q_feeling"),
      placeholder: t("p_feeling"),
      icon: <HelpCircle className="w-6 h-6 text-blue-500" />,
    },
    {
      id: "location",
      label: t("q_location"),
      placeholder: t("p_location"),
      icon: <CheckCircle2 className="w-6 h-6 text-green-500" />,
    },
    {
      id: "lesson",
      label: t("q_lesson"),
      placeholder: t("p_lesson"),
      icon: <XCircle className="w-6 h-6 text-purple-500" />,
    },
  ];

  const currentQuestion = questions[step - 1];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-8 space-y-6">
          <header className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-gray-900">{t("relapse_analysis")}</h2>
              <p className="text-sm text-gray-500">
                {t("step_of").replace("{step}", step.toString()).replace("{total}", questions.length.toString())}
              </p>
            </div>
            <button onClick={onCancel} className="p-2 text-gray-400 hover:text-gray-600">
              <XCircle className="w-6 h-6" />
            </button>
          </header>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {currentQuestion.icon}
              <label className="text-lg font-semibold text-gray-800">{currentQuestion.label}</label>
            </div>
            <textarea
              autoFocus
              value={(answers as any)[currentQuestion.id]}
              onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
              placeholder={currentQuestion.placeholder}
              className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
            />
          </div>

          <div className="flex gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex-1 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all"
              >
                {t("back")}
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!(answers as any)[currentQuestion.id].trim()}
              className="flex-[2] py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {step === questions.length ? t("finish") : t("next")}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="bg-blue-50 p-4 text-center">
          <p className="text-xs text-blue-700 font-medium italic">
            {t("relapse_quote")}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
