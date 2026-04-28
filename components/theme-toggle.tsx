"use client";

import { useEffect, useRef, useState } from 'react';
import { flavors } from '@catppuccin/palette';
import { themeAppearance, themeOptions, type ThemeId } from '@/lib/theme-constants';

function getStoredTheme(): ThemeId {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem('theme') as ThemeId | null;
  if (stored && themeOptions.some((option) => option.id === stored)) {
    return stored;
  }
  return 'light';
}

function setCssVariable(name: string, value: string) {
  document.documentElement.style.setProperty(name, value);
}

function applyCatppuccinTheme(flavor: 'mocha' | 'frappe') {
  const palette = flavors[flavor];
  const colors = palette.colors;

  setCssVariable('--theme-surface-0', colors.base.hex);
  setCssVariable('--theme-surface-1', colors.mantle.hex);
  setCssVariable('--theme-surface-2', colors.crust.hex);
  setCssVariable('--theme-text', colors.text.hex);
  setCssVariable('--theme-text-muted', colors.subtext1.hex);
  setCssVariable('--theme-border', colors.surface0.hex);
  setCssVariable('--theme-border-strong', colors.surface1.hex);
  setCssVariable('--theme-accent', colors.teal.hex);
  setCssVariable('--theme-accent-strong', colors.sapphire.hex);
  setCssVariable('--theme-accent-soft', colors.sky.hex);
  setCssVariable('--theme-glow', colors.lavender.hex);
  setCssVariable('--theme-glow-soft', colors.mauve.hex);
  setCssVariable('--theme-overlay', colors.overlay0.hex);
  setCssVariable('--theme-card', colors.surface0.hex);
  setCssVariable('--theme-card-strong', colors.surface1.hex);
  setCssVariable('--theme-focus', colors.blue.hex);
}

function clearCatppuccinTheme() {
  const keys = [
    '--theme-surface-0',
    '--theme-surface-1',
    '--theme-surface-2',
    '--theme-text',
    '--theme-text-muted',
    '--theme-border',
    '--theme-border-strong',
    '--theme-accent',
    '--theme-accent-strong',
    '--theme-accent-soft',
    '--theme-glow',
    '--theme-glow-soft',
    '--theme-overlay',
    '--theme-card',
    '--theme-card-strong',
    '--theme-focus',
  ];

  keys.forEach((key) => document.documentElement.style.removeProperty(key));
}

function applyTheme(theme: ThemeId) {
  const appearance = themeAppearance[theme];
  document.documentElement.classList.toggle('dark', appearance === 'dark');
  document.documentElement.classList.toggle('theme-mocha', theme === 'mocha');
  document.documentElement.classList.toggle('theme-frappe', theme === 'frappe');
  document.documentElement.style.colorScheme = appearance;

  if (theme === 'mocha' || theme === 'frappe') {
    applyCatppuccinTheme(theme);
  } else {
    clearCatppuccinTheme();
  }
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeId>('light');
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const storedTheme = getStoredTheme();
    setTheme(storedTheme);
    applyTheme(storedTheme);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen]);

  const setThemeSelection = (nextTheme: ThemeId) => {
    setTheme(nextTheme);
    window.localStorage.setItem('theme', nextTheme);
    applyTheme(nextTheme);
    setIsOpen(false);
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        aria-label="Open menu"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <span className="flex w-5 flex-col gap-1" aria-hidden="true">
          <span className="h-0.5 rounded-full bg-current" />
          <span className="h-0.5 rounded-full bg-current" />
          <span className="h-0.5 rounded-full bg-current" />
        </span>
      </button>

      {isOpen ? (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-2 w-72 rounded-lg border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/30"
        >
          <div className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Theme
          </div>
          <div className="flex flex-col gap-1">
            {themeOptions.map((option) => {
              const isActive = theme === option.id;
              const appearance = themeAppearance[option.id];
              return (
                <button
                  key={option.id}
                  type="button"
                  role="menuitem"
                  onClick={() => setThemeSelection(option.id)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition ${isActive ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100' : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800'}`}
                >
                  <span>
                    <span className="block">{option.label}</span>
                    <span className="block text-xs font-normal text-slate-400">{option.description}</span>
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    {isActive ? 'Active' : appearance}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
