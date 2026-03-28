import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

const translations: any = {
  "pt-BR": {
    error_title: "Ops! Algo deu errado.",
    error_desc: "Ocorreu um erro inesperado. Se o problema persistir, verifique sua conexão ou as configurações do Firebase.",
    reload_app: "Recarregar Aplicativo",
  },
  "en-US": {
    error_title: "Oops! Something went wrong.",
    error_desc: "An unexpected error occurred. If the problem persists, check your connection or Firebase settings.",
    reload_app: "Reload Application",
  },
  "es-ES": {
    error_title: "¡Ups! Algo salió mal.",
    error_desc: "Ha ocurrido un error inesperado. Si el problema persiste, comprueba tu conexión o la configuración de Firebase.",
    reload_app: "Recargar Aplicación",
  }
};

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorDetails = "";
      try {
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          errorDetails = JSON.stringify(parsed, null, 2);
        }
      } catch (e) {
        errorDetails = this.state.error?.message || "Unknown error";
      }

      const lang = (localStorage.getItem("purepath_language") as any) || "pt-BR";
      const t = translations[lang] || translations["pt-BR"];

      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-red-100 space-y-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 text-red-600 rounded-full">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">{t.error_title}</h1>
              <p className="text-gray-600 text-sm">
                {t.error_desc}
              </p>
            </div>
            {errorDetails && (
              <pre className="bg-gray-50 p-4 rounded-xl text-[10px] text-left overflow-auto max-h-40 font-mono text-gray-500">
                {errorDetails}
              </pre>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              {t.reload_app}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
