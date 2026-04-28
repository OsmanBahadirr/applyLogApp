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

function mixWithTransparent(color: string, amount: number) {
  return `color-mix(in srgb, ${color} ${amount}%, transparent)`;
}

function applyCatppuccinTheme(flavor: 'mocha' | 'frappe') {
  const palette = flavors[flavor];
  const colors = palette.colors;
  const accent = flavor === 'mocha' ? colors.teal.hex : colors.lavender.hex;
  const accentStrong = flavor === 'mocha' ? colors.sky.hex : colors.blue.hex;
  const glow = flavor === 'mocha' ? colors.lavender.hex : colors.sapphire.hex;
  const focus = flavor === 'mocha' ? colors.blue.hex : colors.sapphire.hex;

  setCssVariable('--theme-surface-0', colors.base.hex);
  setCssVariable('--theme-surface-1', colors.mantle.hex);
  setCssVariable('--theme-surface-2', colors.crust.hex);
  setCssVariable('--theme-text', colors.text.hex);
  setCssVariable('--theme-text-muted', colors.subtext1.hex);
  setCssVariable('--theme-border', mixWithTransparent(colors.surface2.hex, 52));
  setCssVariable('--theme-border-strong', mixWithTransparent(colors.surface2.hex, 76));
  setCssVariable('--theme-accent', accent);
  setCssVariable('--theme-accent-strong', accentStrong);
  setCssVariable('--theme-accent-soft', mixWithTransparent(accent, 20));
  setCssVariable('--theme-glow', mixWithTransparent(glow, 22));
  setCssVariable('--theme-glow-soft', mixWithTransparent(colors.mauve.hex, 14));
  setCssVariable('--theme-overlay', mixWithTransparent(colors.base.hex, 72));
  setCssVariable('--theme-card', mixWithTransparent(colors.base.hex, 82));
  setCssVariable('--theme-card-strong', mixWithTransparent(colors.surface0.hex, 92));
  setCssVariable('--theme-focus', focus);
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
        className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[color:var(--theme-border)] bg-[color:var(--theme-card-strong)] text-[color:var(--theme-text)] shadow-soft transition hover:bg-[color:var(--theme-surface-1)]"
        aria-label="Open theme menu"
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
          className="absolute right-0 z-20 mt-2 w-80 rounded-2xl border border-[color:var(--theme-border)] bg-[color:var(--theme-card-strong)] p-2 shadow-xl shadow-slate-900/10 backdrop-blur-sm"
        >
          <div className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--theme-text-muted)]">
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
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-medium transition ${isActive ? 'bg-[color:var(--theme-accent-soft)] text-[color:var(--theme-text)] ring-1 ring-[color:var(--theme-border-strong)]' : 'text-[color:var(--theme-text)] hover:bg-[color:var(--theme-surface-1)]'}`}
                >
                  <span className="min-w-0">
                    <span className="block">{option.label}</span>
                    <span className="mt-1 block text-xs font-normal text-[color:var(--theme-text-muted)]">{option.description}</span>
                  </span>
                  <span className="ml-4 flex shrink-0 items-center gap-3">
                    <span className="flex items-center gap-1.5" aria-hidden="true">
                      {option.preview.map((color) => (
                        <span
                          key={color}
                          className="h-3 w-3 rounded-full ring-1 ring-black/10 dark:ring-white/10"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--theme-text-muted)]">
                      {isActive ? 'Active' : appearance === 'dark' ? 'Dark' : 'Light'}
                    </span>
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
