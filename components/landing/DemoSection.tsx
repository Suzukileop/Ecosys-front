'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { brandFrameRadiusClass, brandGradientBg, brandGradientText, brandShadow } from '@/components/landing/landingBrand';

const demoStats = [
  { value: '< 3 min', label: 'Average analysis time' },
  { value: '10', label: 'Sequences detected on average' },
  { value: '30', label: 'Images generated per analysis' },
];

export function DemoSection() {
  const [playing, setPlaying] = useState(false);

  return (
    <section id="demo" className="lp-bg lp-container-x py-24 transition-colors duration-300 lg:py-32">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold lp-text md:text-5xl">See AI in action</h2>
          <p className="text-lg lp-muted">Watch how 32 seconds is all it takes</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`relative mx-auto mb-8 aspect-video max-w-5xl overflow-hidden border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 ${brandFrameRadiusClass}`}
        >
          {!playing ? (
            <>
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#F97316]/6 via-transparent to-[#FB923C]/8">
                <div className="absolute inset-0 opacity-25">
                  <div className="grid h-full grid-cols-4 gap-4 p-8">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className={`border border-neutral-200/80 bg-white/60 dark:border-neutral-700 dark:bg-neutral-800/50 ${brandFrameRadiusClass}`}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setPlaying(true)}
                  className="group relative z-10 flex flex-col items-center gap-3"
                >
                  <div
                    className={`flex h-20 w-20 items-center justify-center rounded-full text-white transition-all duration-300 ${brandGradientBg} ${brandShadow} group-hover:scale-105`}
                  >
                    <svg className="ml-1 h-8 w-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <span className="text-sm lp-muted transition-colors group-hover:text-[#F97316]">
                    Watch the demo
                  </span>
                </button>
              </div>

              <div className="absolute bottom-4 right-4 rounded-md bg-black/50 px-2 py-1 text-xs text-white backdrop-blur">
                2:14
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center lp-bg-surface">
              <div className="text-center">
                <p className="mb-3 text-sm font-semibold lp-text">Demo video loading...</p>
                <p className="text-xs lp-muted">Coming soon</p>
              </div>
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-3 gap-4 md:gap-8">
          {demoStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="text-center"
            >
              <div className={`mb-1 text-2xl font-bold md:text-4xl ${brandGradientText}`}>{stat.value}</div>
              <div className="text-xs lp-muted md:text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
