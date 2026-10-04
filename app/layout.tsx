import type { Metadata } from 'next';
import '@/lib/fonts/portfolio-fonts';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/components/landing/ThemeProvider';
import { ChunkLoadRecovery } from '@/components/ChunkLoadRecovery';
import { ThemeInitScript } from '@/components/ThemeInitScript';
import { geist } from '@/lib/fonts/geist';

const initThemeScript = `
  (function(){
    try {
      if (location.pathname.indexOf('/portfolio') === 0) {
        document.documentElement.classList.remove('dark');
        return;
      }
      var t = localStorage.getItem('lp-theme');
      if(!t || t === 'dark') document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    } catch(e){
      document.documentElement.classList.add('dark');
    }
  })();
`;

export const metadata: Metadata = {
  title: 'Skraft — Plateforme SaaS',
  description: 'Création de contenu assistée par IA',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={geist.variable}
      style={{ ['--font-geist' as string]: 'var(--font-geist-sans)' }}
    >
      <head>
        <ThemeInitScript code={initThemeScript} />
      </head>
      <body spellCheck={false} className={`${geist.className} font-sans antialiased`}>
        <ChunkLoadRecovery />
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
