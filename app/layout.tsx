import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'JobCodex',
  description: 'Job application tracker with JSON file persistence',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('theme');
                var appearance = theme === 'mocha' || theme === 'dark' ? 'dark' : 'light';
                if (appearance === 'dark') {
                  document.documentElement.classList.add('dark');
                }
                if (theme === 'mocha') {
                  document.documentElement.classList.add('theme-mocha');
                }
                if (theme === 'frappe') {
                  document.documentElement.classList.add('theme-frappe');
                }
                document.documentElement.style.colorScheme = appearance;
              } catch {}
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
