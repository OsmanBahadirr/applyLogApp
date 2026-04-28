export type ThemeId = 'light' | 'dark' | 'mocha' | 'frappe';

export const themeOptions: Array<{ id: ThemeId; label: string; description: string }> = [
  { id: 'light', label: 'Classic Light', description: 'Airy neutral palette with indigo accents.' },
  { id: 'dark', label: 'Classic Dark', description: 'Slate-driven night mode with cyan highlights.' },
  { id: 'mocha', label: 'Catppuccin Mocha', description: 'Deep mocha tones with bright teal accents.' },
  { id: 'frappe', label: 'Catppuccin Frappe', description: 'Soft frappé neutrals with violet accents.' },
];

export const themeAppearance: Record<ThemeId, 'light' | 'dark'> = {
  light: 'light',
  dark: 'dark',
  mocha: 'dark',
  frappe: 'light',
};
