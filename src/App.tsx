import { useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { useChatStore } from './store/chatStore';

function App() {
  const { settings } = useChatStore();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (settings.theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(settings.theme);
    }
  }, [settings.theme]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans">
      <Sidebar />
      <ChatArea />
    </div>
  );
}

export default App;
