export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type TeachingMode = 'Concept Explanation' | 'Step-by-step Teaching' | 'Quiz Mode' | 'Practice Problems' | 'Coding Mode' | 'Doubt Solving' | 'Revision Mode' | 'Exam Preparation' | 'Interview Preparation';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  subject: string;
  difficulty: DifficultyLevel;
  mode: TeachingMode;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface UserSettings {
  apiKey: string;
  theme: 'light' | 'dark' | 'system';
  defaultDifficulty: DifficultyLevel;
}
