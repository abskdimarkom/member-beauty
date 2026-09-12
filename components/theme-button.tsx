'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from '@phosphor-icons/react';

/** Light/dark toggle. Defaults to light; dark only when the visitor picks it. */
export function ThemeButton() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const next = localStorage.getItem('beauty-theme') === 'dark';
    setDark(next);
    document.documentElement.dataset.theme = next ? 'dark' : 'light';
  }, []);
  return (
    <button
      className="icon-button theme-button"
      aria-label={dark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
      onClick={() => {
        setDark(!dark);
        document.documentElement.dataset.theme = dark ? 'light' : 'dark';
        localStorage.setItem('beauty-theme', dark ? 'light' : 'dark');
      }}
    >
      {dark ? <Sun size={21} /> : <Moon size={21} />}
    </button>
  );
}
