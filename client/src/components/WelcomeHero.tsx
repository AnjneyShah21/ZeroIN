import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ScrambleText } from './ScrambleText';

export const WelcomeHero: React.FC<{ onScrollToEditor: () => void }> = ({ onScrollToEditor }) => {
  const [demoText, setDemoText] = useState('Top secret payload 123');
  const [cipherPreview, setCipherPreview] = useState('');
  const [activeScore, setActiveScore] = useState(98);
  const description = 'ZERO-KNOWLEDGE ENCRYPTED TEXT AND PAYLOAD ENGINE. ALL DATA IS ENCRYPTED CLIENT-SIDE BEFORE HITTING THE WIRE.';
  const [hoveredWord, setHoveredWord] = useState<number | null>(null);
  const [scrambledWord, setScrambledWord] = useState('');
  const [isBrandHovered, setIsBrandHovered] = useState(false);
  const [displayBrand, setDisplayBrand] = useState('ZEROIN');
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  useEffect(() => {
    let binary = '';
    for (let i = 0; i < 28; i++) {
      binary += String.fromCharCode(33 + Math.floor(Math.random() * 90));
    }
    setCipherPreview(btoa(binary).substring(0, 32));
    setActiveScore(85 + Math.floor(Math.random() * 15));
  }, [demoText]);

  useEffect(() => {
    if (hoveredWord === null) {
      setScrambledWord('');
      return;
    }

    const cipherChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*?';
    const words = description.split(/(\s+)/).filter((word) => !/^\s+$/.test(word));
    const sourceWord = words[hoveredWord] || '';
    const scramble = () => setScrambledWord(sourceWord.split('').map((character) => (
      /[A-Z0-9]/.test(character) ? cipherChars[Math.floor(Math.random() * cipherChars.length)] : character
    )).join(''));
    scramble();
    const interval = window.setInterval(() => {
      scramble();
    }, 70);

    return () => window.clearInterval(interval);
  }, [hoveredWord, description]);

  useEffect(() => {
    if (!isBrandHovered) {
      setDisplayBrand('ZEROIN');
      return;
    }

    const cipherChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*?';
    const interval = window.setInterval(() => {
      setDisplayBrand('ZEROIN'.split('').map(() => cipherChars[Math.floor(Math.random() * cipherChars.length)]).join(''));
    }, 70);

    return () => window.clearInterval(interval);
  }, [isBrandHovered]);

  return (
    <div className="relative overflow-hidden pt-16 pb-24 border-b border-emerald-900/30">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10 space-y-20">

        {/* HERO */}
        <div className="text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-5 py-2 bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-mono tracking-widest uppercase"
          >
            <ScrambleText text=">_ SYSTEM INITIALIZED, AWAITING HACKER INPUT.." />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative mx-auto flex h-56 w-full max-w-5xl items-center justify-center sm:h-72"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 12, ease: 'linear', repeat: Infinity }}
              className="pointer-events-none absolute -inset-x-20 -inset-y-12 z-20 rounded-[50%] border border-dashed border-violet-300/55 shadow-[0_0_38px_rgba(139,92,246,0.28)]"
            >
              <motion.span
                animate={{ rotate: -360 }}
                transition={{ duration: 12, ease: 'linear', repeat: Infinity }}
                className="absolute left-1/2 top-[-3rem] flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full border-2 border-emerald-200 bg-gradient-to-br from-emerald-400 via-emerald-500 to-violet-500 text-xl font-black tracking-tighter text-black shadow-[0_0_28px_rgba(16,185,129,0.75)] sm:h-24 sm:w-24 sm:text-3xl"
              >
                1.0
              </motion.span>
            </motion.div>
            <motion.h1
              onHoverStart={() => setIsBrandHovered(true)}
              onHoverEnd={() => setIsBrandHovered(false)}
              animate={{ scale: isBrandHovered ? 1.025 : 1 }}
              transition={{ duration: 0.12 }}
              className="relative z-10 cursor-crosshair text-7xl sm:text-[10rem] font-black tracking-tighter text-white uppercase leading-none"
              style={{ textShadow: '0 0 40px rgba(16,185,129,0.4)' }}
            >
              {displayBrand}
            </motion.h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="cursor-default text-lg sm:text-2xl text-emerald-400/90 font-mono uppercase tracking-wider font-bold max-w-4xl mx-auto leading-relaxed"
          >
            {(() => {
              let wordIndex = -1;
              return description.split(/(\s+)/).map((token, tokenIndex) => {
                if (/^\s+$/.test(token)) return token;
                wordIndex += 1;
                const currentWordIndex = wordIndex;
                const isHovered = currentWordIndex === hoveredWord;
                return (
                  <motion.span
                    key={`${token}-${tokenIndex}`}
                    onHoverStart={() => setHoveredWord(currentWordIndex)}
                    onHoverEnd={() => setHoveredWord(null)}
                    animate={{ scale: isHovered ? 1.16 : 1, color: isHovered ? '#c4b5fd' : '#34d399' }}
                    transition={{ duration: 0.12 }}
                    className="inline-block cursor-crosshair"
                  >
                    {isHovered ? scrambledWord : token}
                  </motion.span>
                );
              });
            })()}
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onScrollToEditor}
            className="px-12 py-5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xl uppercase tracking-widest rounded-xl transition-all"
            style={{ boxShadow: '0 0 40px rgba(16,185,129,0.6)' }}
          >
            <ScrambleText text="ENTER PORTAL" hoverColor="#000000" />
          </motion.button>
        </div>

        {/* LIVE SANDBOX */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="cyber-card rounded-xl p-8 w-full"
        >
          <div className="flex items-center justify-between border-b border-emerald-900/40 pb-5 mb-6">
            <span className="text-base font-black text-emerald-400 uppercase tracking-widest">
              WEB CRYPTO SANDBOX — LIVE ENCRYPTION ENGINE
            </span>
            <span className="text-sm text-emerald-400 bg-emerald-950 px-3 py-1 border border-emerald-500/40 font-black uppercase tracking-wider">
              ENTROPY: {activeScore}%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-3">
              <label className="text-sm font-black text-emerald-500 uppercase tracking-widest block">INPUT PLAINTEXT BUFFER</label>
              <input
                type="text"
                value={demoText}
                onChange={(e) => setDemoText(e.target.value)}
                className="w-full bg-black border border-emerald-900 rounded p-4 text-base font-mono font-bold text-emerald-300 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-black text-emerald-500 uppercase tracking-widest block">ENCRYPTED CIPHER PAYLOAD</label>
              <div className="bg-black border border-emerald-500/50 rounded p-4 text-base font-mono font-bold text-emerald-400 truncate"
                style={{ textShadow: '0 0 10px rgba(16,185,129,0.5)' }}>
                {cipherPreview}
              </div>
            </div>
          </div>
        </motion.div>

        {/* FEATURE CARDS — no icons, big text only */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div onHoverStart={() => setHoveredFeature(1)} onHoverEnd={() => setHoveredFeature(null)} className="cyber-card rounded-xl p-8 space-y-4">
            <div className="text-xs font-black text-emerald-600 uppercase tracking-widest"><ScrambleText active={hoveredFeature === 1} text="FEATURE 01" /></div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tight leading-tight">
              <ScrambleText active={hoveredFeature === 1} text="ZERO KNOWLEDGE" />
            </h3>
            <p className="text-sm font-bold text-emerald-500/90 font-mono uppercase leading-relaxed">
              <ScrambleText active={hoveredFeature === 1} text="KEYS RESIDE IN THE URL HASH FRAGMENT ONLY. NEVER TRANSMITTED OVER HTTP. SERVER SEES ONLY CIPHERTEXT." />
            </p>
          </motion.div>

          <motion.div onHoverStart={() => setHoveredFeature(2)} onHoverEnd={() => setHoveredFeature(null)} className="cyber-card rounded-xl p-8 space-y-4">
            <div className="text-xs font-black text-emerald-600 uppercase tracking-widest"><ScrambleText active={hoveredFeature === 2} text="FEATURE 02" /></div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tight leading-tight">
              <ScrambleText active={hoveredFeature === 2} text="PANIC PURGE" />
            </h3>
            <p className="text-sm font-bold text-emerald-500/90 font-mono uppercase leading-relaxed">
              <ScrambleText active={hoveredFeature === 2} text="INSTANTLY DESTROY PASTES VIA OWNER PANIC TOKENS OR SET AUTO-DESTRUCT ON FIRST READ." />
            </p>
          </motion.div>

          <motion.div onHoverStart={() => setHoveredFeature(3)} onHoverEnd={() => setHoveredFeature(null)} className="cyber-card rounded-xl p-8 space-y-4">
            <div className="text-xs font-black text-emerald-600 uppercase tracking-widest"><ScrambleText active={hoveredFeature === 3} text="FEATURE 03" /></div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tight leading-tight">
              <ScrambleText active={hoveredFeature === 3} text="ENCRYPTION CHOICE" />
            </h3>
            <p className="text-sm font-bold text-emerald-500/90 font-mono uppercase leading-relaxed">
              <ScrambleText active={hoveredFeature === 3} text="CHOOSE AES-GCM ENCRYPTION AT 128-, 192-, OR 256-BIT LEVELS. YOUR SELECTED PROTECTION STAYS CLIENT-SIDE." />
            </p>
          </motion.div>
        </div>

      </div>
    </div>
  );
};
