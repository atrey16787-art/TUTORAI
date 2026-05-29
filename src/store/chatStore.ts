import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChatSession, Message, UserSettings } from '../types';

interface ChatState {
  sessions: ChatSession[];
  currentSessionId: string | null;
  settings: UserSettings;
  isSidebarOpen: boolean;
  
  // Actions
  addSession: (session: Omit<ChatSession, 'id' | 'createdAt' | 'updatedAt' | 'messages'>) => void;
  setCurrentSession: (id: string | null) => void;
  deleteSession: (id: string) => void;
  addMessage: (sessionId: string, message: Omit<Message, 'id' | 'timestamp'>) => string;
  updateMessage: (sessionId: string, messageId: string, newContent: string) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  toggleSidebar: () => void;
  clearAllData: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      sessions: [],
      currentSessionId: null,
      settings: {
        apiKey: '',
        theme: 'system',
        defaultDifficulty: 'Beginner',
      },
      isSidebarOpen: true,

      addSession: (sessionData) => set((state) => {
        const newSession: ChatSession = {
          ...sessionData,
          id: crypto.randomUUID(),
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        return {
          sessions: [newSession, ...state.sessions],
          currentSessionId: newSession.id,
        };
      }),

      setCurrentSession: (id) => set({ currentSessionId: id }),

      deleteSession: (id) => set((state) => ({
        sessions: state.sessions.filter(s => s.id !== id),
        currentSessionId: state.currentSessionId === id ? null : state.currentSessionId,
      })),

      addMessage: (sessionId, messageData) => {
        const newId = crypto.randomUUID();
        set((state) => {
          const newMessage: Message = {
            ...messageData,
            id: newId,
            timestamp: Date.now(),
          };

          const updatedSessions = state.sessions.map(session => {
            if (session.id === sessionId) {
              return {
                ...session,
                messages: [...session.messages, newMessage],
                updatedAt: Date.now(),
              };
            }
            return session;
          });

          return { sessions: updatedSessions };
        });
        return newId;
      },

      updateMessage: (sessionId, messageId, newContent) => set((state) => {
        const updatedSessions = state.sessions.map(session => {
          if (session.id === sessionId) {
            return {
              ...session,
              messages: session.messages.map(msg => 
                msg.id === messageId ? { ...msg, content: newContent } : msg
              ),
              updatedAt: Date.now(),
            };
          }
          return session;
        });
        return { sessions: updatedSessions };
      }),

      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),

      toggleSidebar: () => set((state) => ({
        isSidebarOpen: !state.isSidebarOpen
      })),

      clearAllData: () => set({
        sessions: [],
        currentSessionId: null,
      }),
    }),
    {
      name: 'tutorai-storage',
      partialize: (state) => ({
        sessions: state.sessions,
        settings: state.settings,
      }), // Persist sessions and settings
    }
  )
);
