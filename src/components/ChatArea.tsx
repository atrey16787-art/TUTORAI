import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { MessageBubble } from './MessageBubble';
import { generateSystemPrompt, streamChatCompletion } from '../services/openai';

export const ChatArea: React.FC = () => {
  const { sessions, currentSessionId, addMessage, updateMessage, settings } = useChatStore();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentSession = sessions.find(s => s.id === currentSessionId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages, isTyping]);

  if (!currentSession) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-gray-950 text-gray-500 dark:text-gray-400">
        <div className="text-6xl mb-4">🤖</div>
        <h2 className="text-2xl font-bold mb-2">Welcome to TutorAI</h2>
        <p>Select a chat from the sidebar or start a new learning session.</p>
      </div>
    );
  }

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isTyping) return;

    if (!settings.apiKey) {
      alert('Please set your OpenAI API Key in the settings first.');
      return;
    }

    const userText = input.trim();
    setInput('');
    
    // Add user message immediately
    addMessage(currentSession.id, {
      role: 'user',
      content: userText
    });

    setIsTyping(true);
    let assistantMessageContent = '';
    
    // Create an empty assistant message first to update as it streams
    const messageId = addMessage(currentSession.id, {
      role: 'assistant',
      content: ''
    });

    try {
      const systemPrompt = generateSystemPrompt(
        currentSession.subject, 
        currentSession.difficulty, 
        currentSession.mode
      );

      // Current messages without the empty one we just added
      const messagesForApi = currentSession.messages.concat({
        id: 'temp', timestamp: Date.now(), role: 'user', content: userText
      });

      await streamChatCompletion(
        settings.apiKey,
        messagesForApi,
        systemPrompt,
        (chunk) => {
          assistantMessageContent += chunk;
          // Dynamically update UI
          updateMessage(currentSession.id, messageId, assistantMessageContent);
        }
      );
      
    } catch (error: any) {
      console.error(error);
      updateMessage(currentSession.id, messageId, assistantMessageContent + `\n\n**Error:** ${error.message}`);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-950 h-full relative">
      {/* Header */}
      <div className="h-14 border-b border-gray-200 dark:border-gray-800 flex items-center px-6 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm z-10 sticky top-0">
        <div>
          <h2 className="font-semibold text-gray-800 dark:text-gray-100">{currentSession.title}</h2>
          <div className="flex gap-2 text-xs text-gray-500">
            <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{currentSession.difficulty}</span>
            <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{currentSession.mode}</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-32">
        <div className="max-w-4xl mx-auto">
          {currentSession.messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-20">
              <div className="text-4xl mb-4">👋</div>
              <p className="text-lg mb-2">Ready to start learning about <strong>{currentSession.subject}</strong>?</p>
              <p className="text-sm">Say hello or ask your first question!</p>
            </div>
          ) : (
            currentSession.messages.map((msg, index) => (
               msg.content ? <MessageBubble key={msg.id || index} message={msg} /> : null
            ))
          )}
          {isTyping && currentSession.messages[currentSession.messages.length - 1]?.content === '' && (
             <div className="flex w-full justify-start mb-4">
                <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm flex items-center gap-2">
                   <Loader2 size={16} className="animate-spin text-blue-500" />
                   <span className="text-sm text-gray-500">TutorAI is thinking...</span>
                </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent dark:from-gray-950 dark:via-gray-950 pt-10 pb-6 px-4 md:px-6">
        <div className="max-w-4xl mx-auto relative">
          <form 
            onSubmit={handleSend}
            className="flex items-end gap-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl shadow-lg p-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-shadow"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question or reply... (Shift+Enter for new line)"
              className="flex-1 max-h-48 min-h-[44px] bg-transparent resize-none outline-none py-2 px-3 text-gray-900 dark:text-gray-100 text-sm"
              rows={1}
              disabled={isTyping && currentSession.messages[currentSession.messages.length - 1]?.content === ''}
            />
            <button
              type="submit"
              disabled={!input.trim() || (isTyping && currentSession.messages[currentSession.messages.length - 1]?.content === '')}
              className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0 mb-0.5"
            >
              <Send size={18} />
            </button>
          </form>
          <div className="text-center text-xs text-gray-400 mt-2">
            TutorAI can make mistakes. Verify important information.
          </div>
        </div>
      </div>
    </div>
  );
};
