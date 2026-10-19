import React from 'react';
import { createRoot } from 'react-dom/client';
import { FaqTriGridDesign } from '../components/portfolio/portfolio-faq-tri-grid';
const root = createRoot(document.getElementById('root')!);
(window as any).renderFaq = (count = 6, mode: 'light' | 'dark' = 'light') => root.render(
  <FaqTriGridDesign activeColorMode={mode} header={<h2>Frequently asked questions</h2>}
    items={Array.from({ length: count }, (_, i) => ({
      id: `q-${i}`, question: `Question ${i + 1} : comment se déroule la collaboration ?`,
      answer: '<texte> & contenu préservé.\n' + 'Une réponse claire sur tous les écrans. '.repeat(i % 3 + 2),
    }))} />,
);
(window as any).renderFaq();
