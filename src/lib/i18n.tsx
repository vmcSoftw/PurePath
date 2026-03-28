import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "pt-BR" | "en-US" | "es-ES";

interface Translations {
  [key: string]: {
    [lang in Language]: string;
  };
}

const translations: Translations = {
  // Tabs
  dashboard: { "pt-BR": "Início", "en-US": "Home", "es-ES": "Inicio" },
  journal: { "pt-BR": "Diário", "en-US": "Journal", "es-ES": "Diario" },
  protection: { "pt-BR": "Proteção", "en-US": "Protection", "es-ES": "Protección" },
  emergency: { "pt-BR": "Emergência", "en-US": "Emergency", "es-ES": "Emergencia" },
  
  // Dashboard
  progress: { "pt-BR": "Seu Progresso", "en-US": "Your Progress", "es-ES": "Tu Progreso" },
  free_for: { "pt-BR": "Você está livre há", "en-US": "You've been free for", "es-ES": "Has estado libre por" },
  streak_record: { "pt-BR": "Recorde", "en-US": "Record", "es-ES": "Récord" },
  start_date: { "pt-BR": "Início", "en-US": "Start", "es-ES": "Inicio" },
  status: { "pt-BR": "Status", "en-US": "Status", "es-ES": "Estado" },
  status_cleaning: { "pt-BR": "Limpando...", "en-US": "Cleaning...", "es-ES": "Limpiando..." },
  daily_tip: { "pt-BR": "Dica do Dia", "en-US": "Daily Tip", "es-ES": "Consejo del Día" },
  achievements: { "pt-BR": "Conquistas", "en-US": "Achievements", "es-ES": "Logros" },
  benefits: { "pt-BR": "Benefícios Atuais", "en-US": "Current Benefits", "es-ES": "Beneficios Actuales" },
  emergency_action: { "pt-BR": "Ação de Emergência", "en-US": "Emergency Action", "es-ES": "Acción de Emergencia" },
  relapse_button: { "pt-BR": "Tive uma recaída", "en-US": "I had a relapse", "es-ES": "Tuve una recaída" },
  recent_activity: { "pt-BR": "Atividade Recente", "en-US": "Recent Activity", "es-ES": "Actividad Reciente" },
  
  // Protection
  focus_mode: { "pt-BR": "Modo Foco", "en-US": "Focus Mode", "es-ES": "Modo Enfoque" },
  focus_description: { "pt-BR": "Bloqueie distrações e gatilhos por um tempo determinado.", "en-US": "Block distractions and triggers for a set time.", "es-ES": "Bloquea distracciones y disparadores por um tiempo determinado." },
  start_focus: { "pt-BR": "Ativar Modo Foco", "en-US": "Start Focus Mode", "es-ES": "Activar Modo Enfoque" },
  stop_focus: { "pt-BR": "Interromper", "en-US": "Stop", "es-ES": "Interrumpir" },
  url_checker: { "pt-BR": "Verificador de Site", "en-US": "Site Checker", "es-ES": "Verificador de Sitio" },
  check_url_placeholder: { "pt-BR": "Cole a URL para verificar...", "en-US": "Paste URL to check...", "es-ES": "Pega la URL para verificar..." },
  check_button: { "pt-BR": "Verificar", "en-US": "Check", "es-ES": "Verificar" },
  checking: { "pt-BR": "Verificando...", "en-US": "Checking...", "es-ES": "Verificando..." },
  check_history: { "pt-BR": "Histórico de Verificações", "en-US": "Check History", "es-ES": "Historial de Verificaciones" },
  
  // Site Checker Notifications
  malicious_detected: { "pt-BR": "⚠️ {category} Detectado!", "en-US": "⚠️ {category} Detected!", "es-ES": "⚠️ ¡{category} Detectado!" },
  safe_site: { "pt-BR": "✅ Site Seguro (Aparentemente)", "en-US": "✅ Safe Site (Apparently)", "es-ES": "✅ Sitio Seguro (Aparentemente)" },
  safe_site_desc: { "pt-BR": "Não encontramos padrões óbvios de conteúdo adulto ou malicioso neste link.", "en-US": "We didn't find obvious patterns of adult or malicious content in this link.", "es-ES": "No encontramos patrones obvios de contenido adulto o malicioso en este enlace." },
  check_error: { "pt-BR": "Erro ao verificar o site. Tente novamente.", "en-US": "Error checking the site. Please try again.", "es-ES": "Error al verificar el sitio. Inténtalo de nuevo." },
  url_blocked_desc: { "pt-BR": "O endereço \"{url}\" foi identificado como perigoso ou contém conteúdo adulto.", "en-US": "The address \"{url}\" was identified as dangerous or contains adult content.", "es-ES": "La dirección \"{url}\" fue identificada como peligrosa o contiene contenido adulto." },
  
  // Journal
  new_entry: { "pt-BR": "Nova Entrada", "en-US": "New Entry", "es-ES": "Nueva Entrada" },
  mood_question: { "pt-BR": "Como você está se sentindo?", "en-US": "How are you feeling?", "es-ES": "¿Cómo te sientes?" },
  content_placeholder: { "pt-BR": "Escreva seus pensamentos aqui...", "en-US": "Write your thoughts here...", "es-ES": "Escribe tus pensamientos aquí..." },
  save_entry: { "pt-BR": "Salvar no Diário", "en-US": "Save to Journal", "es-ES": "Guardar en el Diario" },
  
  // Emergency
  emergency_header: { "pt-BR": "Suporte de Emergência", "en-US": "Emergency Support", "es-ES": "Soporte de Emergencia" },
  emergency_desc: { "pt-BR": "Ajuda imediata quando você mais precisa.", "en-US": "Immediate help when you need it most.", "es-ES": "Ayuda inmediata cuando más la necesitas." },
  talk_to_me: { "pt-BR": "Fale comigo...", "en-US": "Talk to me...", "es-ES": "Habla conmigo..." },
  thinking: { "pt-BR": "Pensando...", "en-US": "Thinking...", "es-ES": "Pensando..." },
  emergency_welcome: { "pt-BR": "Estou aqui para você. Como você está se sentindo agora? Se estiver sentindo tentação, me conte e vamos superar isso juntos.", "en-US": "I'm here for you. How are you feeling right now? If you're feeling temptation, tell me and we'll overcome it together.", "es-ES": "Estoy aquí para ti. ¿Cómo te sientes ahora? Si sientes tentación, cuéntamelo y lo superaremos juntos." },
  error_connection: { "pt-BR": "Estou com problemas de conexão. Respire fundo. Lembre-se do seu 'porquê'. Tente novamente em um momento.", "en-US": "I'm having connection problems. Take a deep breath. Remember your 'why'. Try again in a moment.", "es-ES": "Tengo problemas de conexión. Respira hondo. Recuerda tu 'por qué'. Inténtalo de nuevo en un momento." },
  error_process: { "pt-BR": "Desculpe, não consegui processar isso. Por favor, tente novamente.", "en-US": "Sorry, I couldn't process that. Please try again.", "es-ES": "Lo siento, no he podido procesar eso. Por favor, inténtalo de nuevo." },
  action_temptation: { "pt-BR": "Estou sentindo tentação", "en-US": "I'm feeling temptation", "es-ES": "Siento tentación" },
  action_relapse: { "pt-BR": "Eu acabei de recair", "en-US": "I just relapsed", "es-ES": "Acabo de recaer" },
  action_distraction: { "pt-BR": "Preciso de uma distração", "en-US": "I need a distraction", "es-ES": "Necesito una distracción" },
  action_why: { "pt-BR": "Por que devo continuar?", "en-US": "Why should I continue?", "es-ES": "¿Por qué debo continuar?" },
  action_task: { "pt-BR": "Me dê uma tarefa de distração de 5 min", "en-US": "Give me a 5 min distraction task", "es-ES": "Dame una tarea de distracción de 5 min" },
  action_stronger: { "pt-BR": "Eu sou mais forte que este impulso", "en-US": "I am stronger than this urge", "es-ES": "Soy más fuerte que este impulso" },
  action_calm: { "pt-BR": "Ajude-me a me acalmar (técnica 5-4-3-2-1)", "en-US": "Help me calm down (5-4-3-2-1 technique)", "es-ES": "Ayúdame a calmarme (técnica 5-4-3-2-1)" },
  
  // Auth & Profile
  sign_in_google: { "pt-BR": "Entrar com Google", "en-US": "Sign in with Google", "es-ES": "Iniciar sesión con Google" },
  auth_subtitle: { "pt-BR": "Sua jornada para a liberdade começa com um único passo.", "en-US": "Your journey to freedom begins with a single step.", "es-ES": "Tu viaje hacia la libertad comienza con un solo paso." },
  privacy_no_judgment: { "pt-BR": "Privacidade Total • Sem Julgamentos", "en-US": "Total Privacy • No Judgments", "es-ES": "Privacidad Total • Sin Juicios" },
  digital_protection: { "pt-BR": "Proteção Digital", "en-US": "Digital Protection", "es-ES": "Protección Digital" },
  emotional_support: { "pt-BR": "Apoio Emocional", "en-US": "Emotional Support", "es-ES": "Apoyo Emocional" },
  mental_clarity: { "pt-BR": "Clareza Mental", "en-US": "Mental Clarity", "es-ES": "Claridad Mental" },
  vital_energy: { "pt-BR": "Energia Vital", "en-US": "Vital Energy", "es-ES": "Energía Vital" },
  sign_out: { "pt-BR": "Sair", "en-US": "Sign Out", "es-ES": "Cerrar Sesión" },
  install_app: { "pt-BR": "Instalar App", "en-US": "Install App", "es-ES": "Instalar App" },
  language: { "pt-BR": "Idioma", "en-US": "Language", "es-ES": "Idioma" },
  
  // PWA Install
  install_title: { "pt-BR": "Instalar PurePath", "en-US": "Install PurePath", "es-ES": "Instalar PurePath" },
  install_subtitle: { "pt-BR": "Siga os passos abaixo para o seu celular.", "en-US": "Follow the steps below for your phone.", "es-ES": "Sigue los pasos a continuación para tu teléfono." },
  install_android: { "pt-BR": "No Android (Chrome)", "en-US": "On Android (Chrome)", "es-ES": "En Android (Chrome)" },
  install_android_desc: { "pt-BR": "Clique nos três pontinhos no canto superior e selecione \"Instalar Aplicativo\".", "en-US": "Click on the three dots in the top corner and select \"Install App\".", "es-ES": "Haz clic en los tres puntos en la esquina superior y selecciona \"Instalar Aplicación\"." },
  install_ios: { "pt-BR": "No iPhone (Safari)", "en-US": "On iPhone (Safari)", "es-ES": "En iPhone (Safari)" },
  install_ios_desc: { "pt-BR": "Clique no ícone de Compartilhar e selecione \"Adicionar à Tela de Início\".", "en-US": "Click on the Share icon and select \"Add to Home Screen\".", "es-ES": "Haz clic en el icono de Compartir y selecciona \"Agregar a la Pantalla de Inicio\"." },
  got_it: { "pt-BR": "Entendi", "en-US": "Got it", "es-ES": "Entendido" },
  
  // AI Coach
  ai_coach: { "pt-BR": "Treinador IA", "en-US": "AI Coach", "es-ES": "Entrenador IA" },
  ai_coach_desc: { "pt-BR": "IA de Apoio Personalizado", "en-US": "Personalized Support AI", "es-ES": "IA de Apoyo Personalizado" },
  writing: { "pt-BR": "Escrevendo...", "en-US": "Writing...", "es-ES": "Escribiendo..." },
  ask_advice: { "pt-BR": "Peça um conselho...", "en-US": "Ask for advice...", "es-ES": "Pide un consejo..." },
  error_coach: { "pt-BR": "Desculpe, tive um problema ao processar sua mensagem.", "en-US": "Sorry, I had a problem processing your message.", "es-ES": "Lo siento, he tenido un problema al procesar tu mensaje." },
  error_coach_tech: { "pt-BR": "Estou com dificuldades técnicas no momento. Lembre-se de respirar fundo e focar no seu propósito.", "en-US": "I'm having technical difficulties right now. Remember to take a deep breath and focus on your purpose.", "es-ES": "Tengo dificultades técnicas en este momento. Recuerda respirar hondo y concentrarte en tu propósito." },

  // Relapse Analysis
  relapse_analysis: { "pt-BR": "Análise de Recaída", "en-US": "Relapse Analysis", "es-ES": "Análisis de Recaída" },
  step_of: { "pt-BR": "Passo {step} de {total}", "en-US": "Step {step} of {total}", "es-ES": "Paso {step} de {total}" },
  back: { "pt-BR": "Voltar", "en-US": "Back", "es-ES": "Volver" },
  next: { "pt-BR": "Próximo", "en-US": "Next", "es-ES": "Siguiente" },
  finish: { "pt-BR": "Finalizar", "en-US": "Finish", "es-ES": "Finalizar" },
  relapse_quote: { "pt-BR": "\"Uma recaída é um tropeço, não o fim da estrada. Aprenda com ela.\"", "en-US": "\"A relapse is a stumble, not the end of the road. Learn from it.\"", "es-ES": "\"Una recaída es un tropiezo, no el final del camino. Aprende de ella.\"" },
  q_trigger: { "pt-BR": "O que desencadeou isso?", "en-US": "What triggered this?", "es-ES": "¿Qué desencadenó esto?" },
  p_trigger: { "pt-BR": "Estresse, tédio, solidão, um site específico...", "en-US": "Stress, boredom, loneliness, a specific site...", "es-ES": "Estrés, aburrimiento, soledad, un sitio específico..." },
  q_feeling: { "pt-BR": "Como você estava se sentindo antes?", "en-US": "How were you feeling before?", "es-ES": "¿Cómo te sentías antes?" },
  p_feeling: { "pt-BR": "Ansioso, cansado, triste, eufórico...", "en-US": "Anxious, tired, sad, euphoric...", "es-ES": "Ansioso, cansado, triste, eufórico..." },
  q_location: { "pt-BR": "Onde você estava?", "en-US": "Where were you?", "es-ES": "¿Dónde estabas?" },
  p_location: { "pt-BR": "No quarto, no banheiro, sozinho em casa...", "en-US": "In the bedroom, in the bathroom, home alone...", "es-ES": "En el dormitorio, en el baño, solo en casa..." },
  q_lesson: { "pt-BR": "O que você pode fazer diferente da próxima vez?", "en-US": "What can you do differently next time?", "es-ES": "¿Qué puedes hacer diferente la próxima vez?" },
  p_lesson: { "pt-BR": "Deixar o celular fora do quarto, ligar para um amigo...", "en-US": "Leave the phone out of the room, call a friend...", "es-ES": "Dejar el móvil fuera de la habitación, llamar a un amigo..." },

  // Error Boundary
  error_title: { "pt-BR": "Ops! Algo deu errado.", "en-US": "Oops! Something went wrong.", "es-ES": "¡Ups! Algo salió mal." },
  error_desc: { "pt-BR": "Ocorreu um erro inesperado. Se o problema persistir, verifique sua conexão ou as configurações do Firebase.", "en-US": "An unexpected error occurred. If the problem persists, check your connection or Firebase settings.", "es-ES": "Ha ocurrido un error inesperado. Si el problema persiste, comprueba tu conexión o la configuración de Firebase." },
  reload_app: { "pt-BR": "Recarregar Aplicativo", "en-US": "Reload Application", "es-ES": "Recargar Aplicación" },
  app_blocking: { "pt-BR": "Bloqueio de Apps", "en-US": "App Blocking", "es-ES": "Bloqueo de Apps" },
  app_blocking_desc: { "pt-BR": "Liste os aplicativos que você se compromete a evitar durante o Modo Foco.", "en-US": "List the apps you commit to avoiding during Focus Mode.", "es-ES": "Enumera las aplicaciones que te comprometes a evitar durante el Modo Enfoque." },
  app_placeholder: { "pt-BR": "Nome do app (ex: Instagram)...", "en-US": "App name (e.g., Instagram)...", "es-ES": "Nombre de la app (ej: Instagram)..." },
  app_suggestions: { "pt-BR": "Sugestões de Gatilhos", "en-US": "Trigger Suggestions", "es-ES": "Sugerencias de Disparadores" },
  app_added: { "pt-BR": "adicionado à lista.", "en-US": "added to the list.", "es-ES": "añadido a la lista." },
  app_removed: { "pt-BR": "removido da lista.", "en-US": "removed from the list.", "es-ES": "removido de la lista." },
  how_block_real: { "pt-BR": "Como o bloqueio funciona?", "en-US": "How does blocking work?", "es-ES": "¿Cómo funciona el bloqueo?" },
  how_block_real_desc: { "pt-BR": "Devido a restrições do navegador, não podemos fechar outros apps automaticamente. Esta lista serve como um compromisso visual e lembrete durante o seu Modo Foco.", "en-US": "Due to browser restrictions, we cannot automatically close other apps. This list serves as a visual commitment and reminder during your Focus Mode.", "es-ES": "Debido a restricciones del navegador, no podemos cerrar otras apps automáticamente. Esta lista sirve como un compromiso visual y recordatorio durante tu Modo Enfoque." },
  dark_mode: { "pt-BR": "Modo Escuro", "en-US": "Dark Mode", "es-ES": "Modo Oscuro" },
  light_mode: { "pt-BR": "Modo Claro", "en-US": "Light Mode", "es-ES": "Modo Claro" },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("purepath_language");
    return (saved as Language) || "pt-BR";
  });

  useEffect(() => {
    localStorage.setItem("purepath_language", language);
  }, [language]);

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
