import React, { useRef, useState } from 'react';
import Head from 'next/head';
import { Navbar } from '../components/Navbar';
import { WelcomeHero } from '../components/WelcomeHero';
import { PasteEditor } from '../components/PasteEditor';
import { MarqueeTicker } from '../components/MarqueeTicker';
import { BootSequence } from '../components/BootSequence';
import { MatrixCanvas } from '../components/MatrixCanvas';
import { ScrambleText } from '../components/ScrambleText';

export default function Home() {
  const [booting, setBooting] = useState(true);
  const editorRef = useRef<HTMLDivElement>(null);

  const scrollToEditor = () => {
    editorRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Do not mount the home screen until the boot sequence has finished.
  if (booting) {
    return <BootSequence onComplete={() => setBooting(false)} />;
  }

  return (
    <div className="min-h-screen bg-black text-emerald-100 font-mono selection:bg-violet-400 selection:text-black flex flex-col cyber-grid scanlines relative overflow-hidden">
      <Head>
        <title>ZeroIN v2.0 :: Zero-Knowledge Encryption Engine</title>
        <meta
          name="description"
          content="Cyberpunk zero-knowledge encrypted paste sharing engine with browser WebCrypto AES-GCM encryption choices."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Live Matrix Digital Rain Animation Layer */}
      <MatrixCanvas />

      <div className="pointer-events-none absolute -top-56 right-[-16rem] h-[42rem] w-[42rem] rounded-full bg-violet-600/15 blur-[150px]" />
      <div className="pointer-events-none absolute top-[42rem] -left-64 h-[34rem] w-[34rem] rounded-full bg-emerald-500/10 blur-[140px]" />

      <Navbar onScrollToEditor={scrollToEditor} />

      {/* Hero Welcome Landing Section */}
      <WelcomeHero onScrollToEditor={scrollToEditor} />

      {/* Continuous Marquee Banner */}
      <MarqueeTicker />

      {/* Main Paste Editor Section */}
      <main ref={editorRef} className="flex-1 max-w-7xl w-full mx-auto px-6 sm:px-8 py-16 relative z-10 bg-[linear-gradient(135deg,transparent_15%,rgba(109,40,217,0.09)_52%,transparent_85%)]">
        <PasteEditor />
      </main>

      <footer className="border-t border-violet-900/40 py-8 bg-gradient-to-r from-black via-violet-950/30 to-black relative z-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-600">
          <div>
            <ScrambleText text={`© ${new Date().getFullYear()} ZeroIN // ZERO-KNOWLEDGE TERMINAL`} />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-400 font-bold uppercase"><ScrambleText text="STATUS: 100% CLIENT-SIDE ENCRYPTED" /></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
