import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const BootSequence: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const bootLogs = [
    "> ZeroIN_v2.0 :: BOOT SEQUENCE INITIATED",
    "> mounting /realworld/crypto_engine ............ OK",
    "> initializing WebCrypto AES-GCM (128/192/256) .. OK",
    "> salt_derivation.load(PBKDF2) ................. 100,000 ITERATIONS",
    "> zero_knowledge.engine ........................ ARMED",
    "> uptime: ONLINE | zero server knowledge ........ ACTIVE",
    "> ACCESS GRANTED - WELCOME HACKER",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return Math.min(prev + 1, 100);
      });
    }, 48);

    return () => clearInterval(interval);
  }, [onComplete]);

  useEffect(() => {
    const logIndex = Math.min(
      Math.floor((progress / 100) * bootLogs.length),
      bootLogs.length - 1
    );
    setLogs(bootLogs.slice(0, logIndex + 1));
  }, [progress]);

  const handleSkip = () => {
    onComplete();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleSkip}
        className="fixed top-0 left-0 z-[200] h-screen min-h-[100dvh] w-screen bg-[radial-gradient(circle_at_75%_20%,rgba(124,58,237,0.2),transparent_35%),linear-gradient(135deg,#020617,#000000_55%,#17072c)] text-emerald-500 font-mono p-6 sm:p-12 flex flex-col justify-between cursor-pointer select-none scanlines"
      >
        <div className="flex items-center justify-between text-xs text-emerald-600/80 border-b border-emerald-900/40 pb-4">
          <span>ZeroIN BIOS v2.0.26</span>
          <span>RAM CHECK: 64GB -- OK</span>
        </div>

        <div className="w-full max-w-3xl mx-auto my-auto border border-violet-500/25 bg-black/35 p-6 sm:p-8 shadow-[0_0_45px_rgba(124,58,237,0.14)]">
          <div className="mb-6 flex items-center justify-between border-b border-emerald-900/50 pb-4 text-[10px] uppercase tracking-[0.2em] text-violet-300/80">
            <span>ZeroIN secure boot</span>
            <span>Client-side only</span>
          </div>
          <div className="h-48 space-y-3 overflow-hidden text-xs sm:text-sm">
            {logs.map((log, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                className={idx === logs.length - 1 ? 'text-emerald-400 font-bold' : 'text-emerald-600'}
              >
                {log}
              </motion.div>
            ))}
          </div>

          <div className="border-t border-violet-500/20 pt-6">
            <div className="flex items-center justify-between text-xs mb-2 text-emerald-500">
              <span>LOADING MODULES</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-emerald-950/60 border border-violet-500/35 h-3 p-0.5 rounded-sm">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-violet-500 shadow-[0_0_10px_#10b981]"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.12, ease: 'linear' }}
              />
            </div>
          </div>
        </div>

        <div className="text-center text-[11px] text-emerald-700 uppercase tracking-widest animate-pulse border-t border-emerald-900/40 pt-4">
          [ CLICK ANYWHERE TO SKIP ]
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
