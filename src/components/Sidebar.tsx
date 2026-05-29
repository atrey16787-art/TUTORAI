import React, { useState } from 'react';
import { useChatStore } from '../store/chatStore';
import { Plus, MessageSquare, Settings, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import type { DifficultyLevel, TeachingMode } from '../types';

export const Sidebar: React.FC = () => {
  const { 
    sessions, 
    currentSessionId, 
    setCurrentSession, 
    addSession, 
    deleteSession,
    isSidebarOpen, 
    toggleSidebar,
    settings,
    updateSettings
  } = useChatStore();

  const [showSettings, setShowSettings] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(settings.defaultDifficulty);
  const [mode, setMode] = useState<TeachingMode>('Concept Explanation');

  const handleNewSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim()) return;
    
    addSession({
      title: newSubject,
      subject: newSubject,
      difficulty,
      mode
    });
    setNewSubject('');
  };

  if (!isSidebarOpen) {
    return (
      <button 
        onClick={toggleSidebar}
        className="absolute top-4 left-4 z-10 p-2 bg-white dark:bg-gray-800 rounded-md shadow-md border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        <ChevronRight size={20} />
      </button>
    );
  }

  return (
    <div className="w-80 h-full bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <span className="text-blue-500">🎓</span> TutorAI
        </h2>
        <button onClick={toggleSidebar} className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
          <ChevronLeft size={20} />
        </button>
      </div>

      {!showSettings ? (
        <>
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <form onSubmit={handleNewSession} className="space-y-3">
              <input
                type="text"
                placeholder="What do you want to learn?"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
              />
              <div className="flex gap-2">
                <select 
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                  className="w-1/2 px-2 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-300"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
                <select 
                  value={mode}
                  onChange={(e) => setMode(e.target.value as TeachingMode)}
                  className="w-1/2 px-2 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-300"
                >
                  <option value="Concept Explanation">Concepts</option>
                  <option value="Step-by-step Teaching">Step-by-step</option>
                  <option value="Quiz Mode">Quiz</option>
                  <option value="Practice Problems">Practice</option>
                  <option value="Coding Mode">Coding</option>
                  <option value="Doubt Solving">Doubts</option>
                  <option value="Revision Mode">Revision</option>
                  <option value="Exam Preparation">Exam Prep</option>
                  <option value="Interview Preparation">Interview Prep</option>
                </select>
              </div>
              <button 
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                <Plus size={16} /> New Chat
              </button>
            </form>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {sessions.length === 0 ? (
              <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-10 p-4">
                No chats yet. Start learning a new subject!
              </div>
            ) : (
              sessions.map(session => (
                <div 
                  key={session.id}
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-md cursor-pointer transition-colors ${
                    currentSessionId === session.id 
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setCurrentSession(session.id)}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <MessageSquare size={16} className="shrink-0 opacity-70" />
                    <div className="truncate text-sm font-medium">{session.title}</div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  OpenAI API Key
                </label>
                <input
                  type="password"
                  value={settings.apiKey}
                  onChange={(e) => updateSettings({ apiKey: e.target.value })}
                  placeholder="sk-..."
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">Stored locally in your browser.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Theme
                </label>
                <select 
                  value={settings.theme}
                  onChange={(e) => updateSettings({ theme: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-300"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
        >
          <Settings size={18} />
          {showSettings ? 'Back to Chats' : 'Settings'}
        </button>
      </div>
    </div>
  );
};
