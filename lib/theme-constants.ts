export type ThemeId = 'light' | 'dark' | 'mocha' | 'frappe';

export const themeOptions: Array<{ id: ThemeId; label: string; description: string; preview: [string, string, string] }> = [
  { id: 'light', label: 'Light', description: 'Clean daylight workspace with indigo accents.', preview: ['#f8fafc', '#eef2ff', '#4f46e5'] },
  { id: 'dark', label: 'Dark', description: 'High-contrast slate workspace with cyan focus.', preview: ['#020617', '#0f172a', '#22d3ee'] },
  { id: 'mocha', label: 'Mocha', description: 'Warm Catppuccin dark palette with teal highlights.', preview: ['#1e1e2e', '#313244', '#94e2d5'] },
  { id: 'frappe', label: 'Frappe', description: 'Muted Catppuccin dark palette with lavender-blue highlights.', preview: ['#303446', '#414559', '#babbf1'] },
];

export const themeAppearance: Record<ThemeId, 'light' | 'dark'> = {
  light: 'light',
  dark: 'dark',
  mocha: 'dark',
  frappe: 'dark',
};
