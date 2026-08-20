import React, { useState, useEffect } from 'react';
import { Terminal, Lock, ArrowDown, EyeOff, Flame, QrCode } from 'lucide-react';
import { motion } from 'framer-motion';

export const WelcomeHero: React.FC<{ onScrollToEditor: () => void }> = ({ onScrollToEditor }) => {
  const [demoText, setDemoText] = useState('Top secret payload 123');
  const [cipherPreview, setCipherPreview] = useState('');
  const [activeScore, setActiveScore] = useState(98);

  useEffect(() => {
    let binary = '';
    for (let i = 0; i < 28; i++) {
      binary += String.fromCharCode(33 + Math.floor(Math.random() * 90));
    }
    setCipherPreview(btoa(binary).substring(0, 32));
    setActiveScore(85 + Math.floor(Math.random() * 15));
  }, [demoText]);

  return (
    <div className="relative overflow-hidden pt-12 pb-20 border-b border-emerald-900/30">
      {/* Ambient Neon Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10 space-y-16">
        {/* Cyberpunk Headline with HUGE BOLD Font matching CLONEFEST */}
        <div className="text-center max-w-5xl mx-auto space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-mono tracking-widest uppercase text-glow-emerald"
          >
            <Terminal className="w-4 h-4" />
            <span>&gt;_ SYSTEM INITIALIZED, AWAITING HACKER INPUT..</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl sm:text-9xl font-black tracking-tighter text-white uppercase font-sans leading-none text-glow-emerald"
          >
            ZEROIN <br />
            <span className="text-emerald-400 font-extrabold tracking-tight">
              2.0
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-xl text-emerald-400/90 font-mono max-w-3xl mx-auto leading-relaxed uppercase tracking-wider font-semibold"
          >
            ZERO-KNOWLEDGE ENCRYPTED TEXT & PAYLOAD ENGINE. ALL DATA IS ENCRYPTED CLIENT-SIDE BEFORE HITTING THE WIRE.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onScrollToEditor}
              className="w-full sm:w-auto px-10 py-5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-lg uppercase tracking-widest rounded-xl shadow-[0_0_35px_rgba(16,185,129,0.6)] flex items-center justify-center gap-3 transition-all"
            >
              <Lock className="w-5 h-5" />
              <span>ENTER PORTAL &rarr;</span>
            </motion.button>
          </motion.div>
        </div>

        {/* Live Interactive Terminal Sandbox */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="cyber-card rounded-xl p-6 sm:p-8 w-full shadow-2xl relative overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-emerald-900/40 pb-4 mb-6 text-xs font-mono">
            <span className="text-emerald-400 flex items-center gap-2 font-bold">
              <Terminal className="w-4 h-4" />
              WEB_CRYPTO_SANDBOX :: LIVE ENCRYPTION ENGINE
            </span>
            <span className="text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-500/40 font-bold">
              ENTROPY_SCORE: {activeScore}%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center font-mono">
            <div className="space-y-2">
              <label className="text-xs text-emerald-500 uppercase font-bold">Input Plaintext Buffer</label>
              <input
                type="text"
                value={demoText}
                onChange={(e) => setDemoText(e.target.value)}
                className="w-full bg-black border border-emerald-900/80 rounded p-4 text-base font-semibold text-emerald-300 focus:outline-none focus:border-emerald-500 shadow-inner"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-emerald-500 uppercase font-bold">Encrypted Cipher Payload</label>
              <div className="bg-black border border-emerald-500/40 rounded p-4 text-base font-mono text-emerald-400 truncate text-glow-emerald font-semibold">
                {cipherPreview}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Cyber Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
          <div className="cyber-card rounded-xl p-7 space-y-3">
            <EyeOff className="w-7 h-7 text-emerald-400" />
            <h3 className="text-base font-black text-white uppercase tracking-widest">[ Zero-Knowledge ]</h3>
            <p className="text-xs text-emerald-500/90 leading-relaxed font-semibold">
              Keys reside strictly in the URL hash fragment (`#key=...`). Never transmitted over HTTP requests.
            </p>
          </div>

          <div className="cyber-card rounded-xl p-7 space-y-3">
            <Flame className="w-7 h-7 text-amber-400" />
            <h3 className="text-base font-black text-white uppercase tracking-widest">[ Panic Purge ]</h3>
            <p className="text-xs text-emerald-500/90 leading-relaxed font-semibold">
              Instantly destroy pastes with owner panic tokens or set payload auto-destruct upon reading.
            </p>
          </div>

          <div className="cyber-card rounded-xl p-7 space-y-3">
            <QrCode className="w-7 h-7 text-cyan-400" />
            <h3 className="text-base font-black text-white uppercase tracking-widest">[ Mobile QR Link ]</h3>
            <p className="text-xs text-emerald-500/90 leading-relaxed font-semibold">
              Cross-device instant transfer via client-rendered QR codes or PBKDF2 derived passwords.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
