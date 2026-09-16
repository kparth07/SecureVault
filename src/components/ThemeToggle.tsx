import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('securevault-theme') as Theme) || 'system';
  });

  useEffect(() => {
    const applyTheme = (t: Theme) => {
      const isDark =
        t === 'dark' ||
        (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme(theme);
    localStorage.setItem('securevault-theme', theme);

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  return (
    <div className="flex bg-surface-container-low dark:bg-surface-container-high dark:bg-gray-700est p-1 rounded-full border border-outline-variant/30 dark:border-gray-700">
      <button
        onClick={() => setTheme('light')}
        className={`px-3 py-1.5 rounded-full text-label-sm font-medium transition-all flex items-center gap-1.5 ${
          theme === 'light' ? 'bg-surface-container-low dark:bg-gray-800est dark:bg-inverse-surface shadow-sm text-primary dark:text-inverse-primary' : 'text-on-surface-variant dark:text-gray-400 hover:text-on-surface dark:text-gray-100'
        }`}
      >
        <span className="material-symbols-outlined text-[16px]">light_mode</span>
        <span className="hidden sm:inline">Light</span>
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`px-3 py-1.5 rounded-full text-label-sm font-medium transition-all flex items-center gap-1.5 ${
          theme === 'dark' ? 'bg-surface-container-low dark:bg-gray-800est dark:bg-inverse-surface shadow-sm text-primary dark:text-inverse-primary' : 'text-on-surface-variant dark:text-gray-400 hover:text-on-surface dark:text-gray-100'
        }`}
      >
        <span className="material-symbols-outlined text-[16px]">dark_mode</span>
        <span className="hidden sm:inline">Dark</span>
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`px-3 py-1.5 rounded-full text-label-sm font-medium transition-all flex items-center gap-1.5 ${
          theme === 'system' ? 'bg-surface-container-low dark:bg-gray-800est dark:bg-inverse-surface shadow-sm text-primary dark:text-inverse-primary' : 'text-on-surface-variant dark:text-gray-400 hover:text-on-surface dark:text-gray-100'
        }`}
      >
        <span className="material-symbols-outlined text-[16px]">desktop_windows</span>
        <span className="hidden sm:inline">System</span>
      </button>
    </div>
  );
}



