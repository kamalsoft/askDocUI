"use client";
import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export const ThemeToggle = () => {
  const { theme, toggleTheme, primaryColor, setPrimaryColor } = useTheme();
const [mounted, setMounted] = useState(false);
useEffect(() => {
  setMounted(true);
}, []);

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className="flex items-center justify-center p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
      >
        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
      </button>
          {/* Color picker removed per user request */}
    </div>
  );
};
