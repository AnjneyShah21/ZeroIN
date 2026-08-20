import React from 'react';
import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';
import { AnimatePresence, motion } from 'framer-motion';
import '../styles/globals.css';

// Load Inter font
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export default function App({ Component, pageProps, router }: AppProps) {
  return (
    <div className={`${inter.variable} font-sans antialiased`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={router.route}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <Component {...pageProps} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
