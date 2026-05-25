'use client';

import { useState, useEffect } from 'react';

export function useTheme() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    const checkDark = () => setIsDark(root.classList.contains('dark'));

    checkDark();

    const observer = new MutationObserver(checkDark);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  return { isDark };
}