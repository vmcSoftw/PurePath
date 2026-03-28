import { GoogleGenAI } from "@google/genai";
import { UserProfile, JournalEntry } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getCoachResponse(
  message: string, 
  history: { role: "user" | "model", parts: { text: string }[] }[],
  profile: UserProfile | null,
  journalEntries: JournalEntry[]
) {
  const model = "gemini-3-flash-preview";
  
  const sobrietyDays = profile ? Math.floor((Date.now() - new Date(profile.sobrietyStartDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const recentJournal = journalEntries.slice(0, 5).map(e => `[${new Date(e.date).toLocaleDateString()}] Mood: ${e.mood}, Content: ${e.content}`).join("\n");

  const systemInstruction = `You are PurePath Coach, a compassionate, non-judgmental recovery coach for someone overcoming pornography addiction.
  
  USER CONTEXT:
  - Days Sober: ${sobrietyDays}
  - Longest Streak: ${profile?.longestStreak || 0} days
  - Recent Journal Entries:
  ${recentJournal || "No entries yet."}

  GUIDELINES:
  1. Use the user's progress and journal entries to provide personalized advice.
  2. If they are struggling (based on journal or current message), offer specific grounding techniques.
  3. Celebrate their ${sobrietyDays} days of progress.
  4. Be concise, empathetic, and actionable.
  5. Never judge. Focus on the future and the "why" of their journey.
  6. If they mention a relapse, help them analyze it without shame.
  7. IMPORTANT: Always respond in Portuguese (PT-BR).`;

  const chat = ai.chats.create({
    model,
    config: {
      systemInstruction,
    },
    history: history.length > 0 ? history : undefined,
  });

  const response = await chat.sendMessage({ message });
  return response.text;
}

export async function getRelapseAdvice(
  analysis: { trigger: string; feeling: string; lesson: string },
  history: { role: "user" | "model", parts: { text: string }[] }[],
  profile: UserProfile | null
) {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `You are PurePath Coach. The user just completed a relapse analysis.
  
  ANALYSIS DATA:
  - Trigger: ${analysis.trigger}
  - Feeling: ${analysis.feeling}
  - Lesson Learned: ${analysis.lesson}
  
  USER CONTEXT:
  - Longest Streak: ${profile?.longestStreak || 0} days
  
  GUIDELINES:
  1. Provide a very concise summary of their analysis.
  2. Offer a personalized, highly encouraging piece of advice based on the trigger and lesson.
  3. Remind them that a relapse is a data point, not a failure.
  4. Keep it under 100 words.
  5. Use a supportive, coaching tone.
  6. IMPORTANT: Always respond in Portuguese (PT-BR).`;

  const chat = ai.chats.create({
    model,
    config: {
      systemInstruction,
    },
    history: history.length > 0 ? history : undefined,
  });

  const prompt = "Please provide your summary and personalized advice based on my relapse analysis.";
  const response = await chat.sendMessage({ message: prompt });
  return response.text;
}

export async function getDailyTip(profile: UserProfile | null, journalEntries: JournalEntry[]) {
  const model = "gemini-3-flash-preview";
  
  const sobrietyDays = profile ? Math.floor((Date.now() - new Date(profile.sobrietyStartDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const recentMoods = journalEntries.slice(0, 3).map(e => e.mood).join(", ");

  const systemInstruction = `You are PurePath Coach. Provide a single, powerful "Tip of the Day" for someone in recovery from pornography addiction.
  
  USER CONTEXT:
  - Days Sober: ${sobrietyDays}
  - Recent Moods: ${recentMoods || "No data"}
  
  GUIDELINES:
  1. The tip must be actionable and encouraging.
  2. Focus on mental health, habit replacement, or biological recovery (dopamine receptors, etc.).
  3. Keep it very short (max 40 words).
  4. Use a supportive, coaching tone.
  5. IMPORTANT: Always respond in Portuguese (PT-BR).`;

  const response = await ai.models.generateContent({
    model,
    config: {
      systemInstruction,
    },
    contents: "Please provide a personalized daily tip for my recovery journey.",
  });

  return response.text;
}

export async function checkUrlSafety(url: string, lang: string = "pt-BR") {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `You are a web safety expert specializing in identifying adult content (pornography), gambling, and malicious websites.
  Analyze the provided URL and determine if it belongs to any of these categories:
  1. Adult Content / Pornography
  2. Gambling / Casino
  3. Malicious / Phishing / Malware
  
  Respond ONLY with a JSON object in this format:
  {
    "isMalicious": boolean,
    "category": "Adult" | "Gambling" | "Malicious" | "Safe",
    "reason": "Brief explanation in the requested language"
  }
  
  LANGUAGE: ${lang}
  
  If the URL is clearly safe (e.g., google.com, wikipedia.org, news sites), mark it as Safe.
  If you are unsure but it looks suspicious, err on the side of caution (isMalicious: true).`;

  const response = await ai.models.generateContent({
    model,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
    },
    contents: `Analyze this URL: ${url}`,
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    return { isMalicious: false, category: "Safe", reason: "Não foi possível analisar detalhadamente." };
  }
}

export async function getSupportResponse(message: string, history: { role: "user" | "model", parts: { text: string }[] }[]) {
  const model = "gemini-3-flash-preview";
  
  const chat = ai.chats.create({
    model,
    config: {
      systemInstruction: `You are a compassionate, non-judgmental recovery coach for someone trying to overcome pornography addiction. 
      Your goal is to provide immediate support, distraction techniques, and psychological insights.
      If the user is feeling tempted, offer grounding exercises (like 5-4-3-2-1) or suggest immediate physical changes (leaving the room, cold water).
      Always be supportive and remind them of their progress and why they started this journey.
      Keep responses concise and actionable.
      IMPORTANT: Always respond in Portuguese (PT-BR).`,
    },
  });

  const response = await chat.sendMessage({ message });
  return response.text;
}
