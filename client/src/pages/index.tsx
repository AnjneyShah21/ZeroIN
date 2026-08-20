import React, { useRef, useState } from 'react';
import Head from 'next/head';
import { Navbar } from '../components/Navbar';
import { WelcomeHero } from '../components/WelcomeHero';
import { PasteEditor } from '../components/PasteEditor';
import { MarqueeTicker } from '../components/MarqueeTicker';
import { BootSequence } from '../components/BootSequence';
import { MatrixCanvas } from '../components/MatrixCanvas';

export default function Home() {
  const [booting, setBooting] = useState(true);
  const editorRef = useRef<HTMLDivElement>(null);

  const scrollToEditor = () => {
    editorRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-black text-emerald-100 font-mono selection:bg-emerald-500 selection:text-black flex flex-col cyber-grid scanlines relative">
      <Head>
        <title>ZeroIN v2.0 :: Zero-Knowledge Encryption Engine</title>
        <meta
          name="description"
          content="Cyberpunk zero-knowledge encrypted paste sharing engine. Browser WebCrypto AES-256-GCM."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Live Matrix Digital Rain Animation Layer */}
      <MatrixCanvas />

      {/* BIOS Boot Sequence */}
      {booting && <BootSequence onComplete={() => setBooting(false)} />}

      <Navbar onScrollToEditor={scrollToEditor} />

      {/* Hero Welcome Landing Section */}
      <WelcomeHero onScrollToEditor={scrollToEditor} />

      {/* Continuous Marquee Banner */}
      <MarqueeTicker />

      {/* Main Paste Editor Section */}
      <main ref={editorRef} className="flex-1 max-w-7xl w-full mx-auto px-6 sm:px-8 py-16 relative z-10">
        <PasteEditor />
      </main>

      <footer className="border-t border-emerald-900/40 py-8 bg-black relative z-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-600">
          <div>
            <span>© {new Date().getFullYear()} ZeroIN // ZERO-KNOWLEDGE TERMINAL</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-400 font-bold uppercase">STATUS: 100% CLIENT-SIDE ENCRYPTED</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
