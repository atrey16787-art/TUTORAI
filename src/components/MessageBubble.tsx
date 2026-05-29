import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'katex/dist/katex.min.css';
import type { Message } from '../types';
import { Play } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const [output, setOutput] = useState<{ [key: string]: string }>({});

  const handleRunCode = async (code: string, language: string, id: string) => {
    setOutput(prev => ({ ...prev, [id]: 'Running...' }));
    try {
      // @ts-expect-error custom property on window
      if (window.electronAPI && window.electronAPI.runCode) {
        // @ts-expect-error custom property on window
        const result = await window.electronAPI.runCode(code, language);
        setOutput(prev => ({ ...prev, [id]: result.output || 'No output' }));
      } else {
        setOutput(prev => ({ ...prev, [id]: 'Code runner only available in desktop app.' }));
      }
    } catch (e: any) {
      setOutput(prev => ({ ...prev, [id]: `Error: ${e.message}` }));
    }
  };

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[85%] rounded-2xl px-5 py-4 shadow-sm ${
          isUser
            ? 'bg-blue-600 text-white rounded-tr-sm'
            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-tl-sm'
        }`}
      >
        <div className={`prose ${isUser ? 'prose-invert' : 'dark:prose-invert'} max-w-none text-sm md:text-base break-words`}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '');
                const language = match ? match[1] : '';
                const isRunnable = language === 'python' || language === 'javascript' || language === 'js' || language === 'node';
                const codeString = String(children).replace(/\n$/, '');
                // Generate a pseudo-unique ID for this block based on its content length
                const blockId = `${message.id}-${codeString.length}`;

                return !inline && match ? (
                  <div className="relative my-4">
                    <div className="flex justify-between items-center bg-gray-900 text-gray-400 px-4 py-1 text-xs rounded-t-md">
                      <span>{language}</span>
                      {isRunnable && (
                        <button 
                          onClick={() => handleRunCode(codeString, language, blockId)}
                          className="flex items-center gap-1 hover:text-white transition-colors"
                        >
                          <Play size={12} /> Run
                        </button>
                      )}
                    </div>
                    <SyntaxHighlighter
                      {...props}
                      style={vscDarkPlus}
                      language={language}
                      PreTag="div"
                      customStyle={{ margin: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
                    >
                      {codeString}
                    </SyntaxHighlighter>
                    {output[blockId] && (
                       <div className="mt-2 bg-black text-green-400 p-3 rounded-md text-sm font-mono whitespace-pre-wrap">
                          <div className="text-gray-500 text-xs mb-1">Output:</div>
                          {output[blockId]}
                       </div>
                    )}
                  </div>
                ) : (
                  <code {...props} className={`${className} bg-gray-200 dark:bg-gray-700 px-1 rounded text-sm`}>
                    {children}
                  </code>
                );
              }
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
        <div className={`text-xs mt-2 ${isUser ? 'text-blue-200' : 'text-gray-400 dark:text-gray-500'} text-right`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};
