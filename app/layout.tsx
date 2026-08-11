import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/components/landing/ThemeProvider';
import { ChunkLoadRecovery } from '@/components/ChunkLoadRecovery';
import { aeonik } from '@/lib/fonts/aeonik';

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
  title: 'NoProbleme — Plateforme SaaS',
  description: 'Création de contenu assistée par IA',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning data-scroll-behavior="smooth" className={aeonik.variable}>
      <head>
        {/* eslint-disable-next-line @next/next/no-before-interactive-script-outside-document */}
        <script dangerouslySetInnerHTML={{ __html: initThemeScript }} />
      </head>
      <body className={`${aeonik.className} font-sans antialiased`}>
        <ChunkLoadRecovery />
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
