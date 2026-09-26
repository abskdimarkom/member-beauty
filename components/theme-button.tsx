'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from '@phosphor-icons/react';

const STORAGE_KEY = 'beauty-theme';

/**
 * Light/dark toggle. Defaults to light; dark only when the visitor picks it.
 * The layout's inline script applies a saved choice before first paint, so this
 * only has to read the result back and keep it in sync.
 */
export function ThemeButton() {
  const [dark, setDark] = useState(false);
  useEffect(() => { setDark(document.documentElement.dataset.theme === 'dark'); }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? 'dark' : 'light';
    try { localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light'); } catch { /* private mode: the choice lasts this visit */ }
  }

  return (
    <button className="icon-button theme-button" aria-label={dark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'} aria-pressed={dark} onClick={toggle}>
      {dark ? <Sun size={21} /> : <Moon size={21} />}
    </button>
  );
}
