import React from 'react';
import { createRoot } from 'react-dom/client';
import { FaqEditorialMasonryDesign } from '../components/portfolio/portfolio-faq-editorial-masonry';
const root = createRoot(document.getElementById('root')!);
(window as any).renderFaq = (count: number) => root.render(
  <FaqEditorialMasonryDesign key={count} items={Array.from({ length: count }, (_, i) => ({
    id: `q-${i}`, question: `Question ${i + 1} : comment se déroule notre collaboration ?`,
    answer: '<texte> & contenu préservé.\n' + 'Une réponse détaillée et lisible sur tous les écrans. '.repeat(12),
  }))} />,
);
(window as any).renderFaq(6);
