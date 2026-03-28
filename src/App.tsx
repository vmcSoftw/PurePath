/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { UserProfile, JournalEntry, SupportMessage, FocusSession } from "./types";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import Journal from "./components/Journal";
import Protection from "./components/Protection";
import Emergency from "./components/Emergency";
import Auth from "./components/Auth";
import ErrorBoundary from "./components/ErrorBoundary";
import RelapseAnalysis from "./components/RelapseAnalysis";
import { auth, db, googleProvider, OperationType, handleFirestoreError } from "./lib/firebase";
import { onAuthStateChanged, signInWithPopup, signOut, User } from "firebase/auth";
import { doc, onSnapshot, setDoc, collection, query, orderBy, addDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { Toaster, toast } from "sonner";
import { Trophy } from "lucide-react";
import { differenceInDays } from "date-fns";
import { getRelapseAdvice } from "./lib/gemini";
import { LanguageProvider } from "./lib/i18n";
import { ThemeProvider } from "./lib/theme";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
  const [chatMessages, setChatMessages] = useState<SupportMessage[]>([
    {
      role: "model",
      content: "Olá! Sou seu treinador PurePath. Estou aqui para te apoiar em sua jornada de liberdade. Como você está se sentindo hoje?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isLoading, setIsLoading] = useState(true);
  const [showRelapseAnalysis, setShowRelapseAnalysis] = useState(false);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setUserProfile(null);
        setJournalEntries([]);
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // User Profile Listener
  useEffect(() => {
    if (!user) return;

    const userDocRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userDocRef, (snapshot) => {
      if (snapshot.exists()) {
        setUserProfile(snapshot.data() as UserProfile);
      } else {
        // Initialize profile if it doesn't exist
        const initialProfile: UserProfile = {
          uid: user.uid,
          displayName: user.displayName || "Usuário",
          email: user.email || "",
          photoURL: user.photoURL || undefined,
          sobrietyStartDate: new Date().toISOString(),
          longestStreak: 0,
          notifiedMilestones: [],
        };
        setDoc(userDocRef, initialProfile).catch(err => handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`));
      }
      setIsLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.GET, `users/${user.uid}`));

    return () => unsubscribe();
  }, [user]);

  // Journal Entries Listener
  useEffect(() => {
    if (!user) return;

    const journalRef = collection(db, "users", user.uid, "journal");
    const q = query(journalRef, orderBy("date", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const entries = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as JournalEntry[];
      setJournalEntries(entries);
    }, (err) => handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/journal`));

    return () => unsubscribe();
  }, [user]);

  // Focus Sessions Listener
  useEffect(() => {
    if (!user) return;

    const focusRef = collection(db, "users", user.uid, "focus");
    const q = query(focusRef, orderBy("date", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sessions = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as FocusSession[];
      setFocusSessions(sessions);
    }, (err) => handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/focus`));

    return () => unsubscribe();
  }, [user]);

  // Milestone Notification Logic
  useEffect(() => {
    if (!user || !userProfile) return;

    const currentDays = differenceInDays(new Date(), new Date(userProfile.sobrietyStartDate));
    const milestones = [1, 3, 7, 30, 90, 100, 365];
    const notified = userProfile.notifiedMilestones || [];

    const newMilestone = milestones.find(m => currentDays >= m && !notified.includes(m));

    if (newMilestone) {
      toast.success(`Parabéns! Você alcançou ${newMilestone} dias!`, {
        description: "Continue firme na sua jornada. Cada dia é uma vitória.",
        icon: <Trophy className="w-5 h-5 text-yellow-500" />,
        duration: 10000,
      });

      // Update notified milestones in Firestore
      const userDocRef = doc(db, "users", user.uid);
      updateDoc(userDocRef, {
        notifiedMilestones: [...notified, newMilestone]
      }).catch(err => handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`));
    }
  }, [user, userProfile]);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Sign in error:", error);
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const handleRelapse = () => {
    setShowRelapseAnalysis(true);
  };

  const handleRelapseComplete = async (answers: any) => {
    if (userProfile && user) {
      const currentStreak = Math.floor((Date.now() - new Date(userProfile.sobrietyStartDate).getTime()) / (1000 * 60 * 60 * 24));
      const updatedProfile: UserProfile = {
        ...userProfile,
        sobrietyStartDate: new Date().toISOString(),
        longestStreak: Math.max(userProfile.longestStreak, currentStreak),
        lastRelapseDate: new Date().toISOString(),
        notifiedMilestones: [],
      };
      
      try {
        await setDoc(doc(db, "users", user.uid), updatedProfile);
        
        // Add a journal entry automatically about the relapse
        const relapseEntry = {
          uid: user.uid,
          date: new Date().toISOString(),
          content: `Análise de Recaída:\nGatilho: ${answers.trigger}\nSentimento: ${answers.feeling}\nLição: ${answers.lesson}`,
          mood: "struggling" as const,
        };
        await addDoc(collection(db, "users", user.uid, "journal"), relapseEntry);

        // Get AI Coach advice
        const history = chatMessages.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.content }]
        }));

        const advice = await getRelapseAdvice(answers, history, userProfile);
        
        setChatMessages(prev => [...prev, {
          role: "model",
          content: advice || "Sinto muito pelo que aconteceu. Lembre-se que cada dia é uma nova oportunidade.",
          timestamp: new Date().toISOString()
        }]);

      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
      }
    }
    setShowRelapseAnalysis(false);
  };

  const handleAddFocus = async (duration: number) => {
    if (!user) return;
    const newSession = {
      uid: user.uid,
      date: new Date().toISOString(),
      duration,
    };
    try {
      await addDoc(collection(db, "users", user.uid, "focus"), newSession);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/focus`);
    }
  };

  const handleAddJournal = async (content: string, mood: JournalEntry["mood"]) => {
    if (!user) return;
    const newEntry = {
      uid: user.uid,
      date: new Date().toISOString(),
      content,
      mood,
    };
    try {
      await addDoc(collection(db, "users", user.uid, "journal"), newEntry);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/journal`);
    }
  };

  const handleDeleteJournal = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "journal", id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/journal/${id}`);
    }
  };

  if (isLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Auth onSignIn={handleSignIn} isLoading={isLoading} />;
  }

  return (
    <ThemeProvider>
      <LanguageProvider>
        <ErrorBoundary>
          <Toaster position="top-center" richColors />
          <Layout
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onSignOut={handleSignOut}
            userPhoto={user.photoURL || undefined}
          >
            {activeTab === "dashboard" && (
              <Dashboard 
                userProfile={userProfile} 
                journalEntries={journalEntries}
                focusSessions={focusSessions}
                chatMessages={chatMessages}
                setChatMessages={setChatMessages}
                onRelapse={handleRelapse} 
              />
            )}
            {activeTab === "journal" && (
              <Journal
                entries={journalEntries}
                onAdd={handleAddJournal}
                onDelete={handleDeleteJournal}
              />
            )}
            {activeTab === "protection" && <Protection onStartFocus={handleAddFocus} />}
            {activeTab === "emergency" && <Emergency />}
            
            {showRelapseAnalysis && (
              <RelapseAnalysis 
                onComplete={handleRelapseComplete} 
                onCancel={() => setShowRelapseAnalysis(false)} 
              />
            )}
          </Layout>
        </ErrorBoundary>
      </LanguageProvider>
    </ThemeProvider>
  );
}



