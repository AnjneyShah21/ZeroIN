import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const BootSequence: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [skipped, setSkipped] = useState(false);

  const bootLogs = [
    "> ZeroIN_v2.0 :: BOOT SEQUENCE INITIATED",
    "> mounting /realworld/crypto_engine ............ OK",
    "> initializing WebCrypto AES-256-GCM ............ OK",
    "> salt_derivation.load(PBKDF2) ................. 100,000 ITERATIONS",
    "> zero_knowledge.engine ........................ ARMED",
    "> uptime: ONLINE | zero server knowledge ........ ACTIVE",
    "> ACCESS GRANTED - WELCOME HACKER",
  ];

  useEffect(() => {
    if (skipped) {
      onComplete();
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 400);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [skipped, onComplete]);

  useEffect(() => {
    const logIndex = Math.min(
      Math.floor((progress / 100) * bootLogs.length),
      bootLogs.length - 1
    );
    setLogs(bootLogs.slice(0, logIndex + 1));
  }, [progress]);

  const handleSkip = () => {
    setSkipped(true);
    onComplete();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleSkip}
        className="fixed inset-0 z-[200] bg-black text-emerald-500 font-mono p-6 sm:p-12 flex flex-col justify-between cursor-pointer select-none scanlines"
      >
        <div className="flex items-center justify-between text-xs text-emerald-600/80 border-b border-emerald-900/40 pb-4">
          <span>ZeroIN BIOS v2.0.26</span>
          <span>RAM CHECK: 64GB -- OK</span>
        </div>

        <div className="max-w-3xl space-y-3 text-xs sm:text-sm my-auto">
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

          <div className="pt-6">
            <div className="flex items-center justify-between text-xs mb-2 text-emerald-500">
              <span>LOADING MODULES</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-emerald-950/60 border border-emerald-800/40 h-3 p-0.5 rounded-sm">
              <motion.div
                className="bg-emerald-500 h-full shadow-[0_0_10px_#10b981]"
                style={{ width: `${progress}%` }}
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
