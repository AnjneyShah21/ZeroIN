import React from 'react';
import { Terminal, Plus } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ScrambleText } from './ScrambleText';

export const Navbar: React.FC<{ onScrollToEditor?: () => void }> = ({ onScrollToEditor }) => {
  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 backdrop-blur-xl bg-gradient-to-r from-black via-violet-950/35 to-black border-b border-violet-500/30 font-mono"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="p-2 rounded bg-gradient-to-br from-emerald-950 to-violet-950 border border-violet-400/40 text-emerald-300">
            <Terminal className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-wider text-white uppercase text-glow-emerald">
              <ScrambleText text="ZeroIN" />
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-violet-950/70 border border-violet-400/40 text-violet-300 font-bold uppercase">
              <ScrambleText text="v1.0" />
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-6 text-xs">
          <div className="hidden md:flex items-center gap-2 text-emerald-500/80">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <ScrambleText text="SYS_CHECK: OK" />
          </div>

          {onScrollToEditor && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onScrollToEditor}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-violet-500 hover:from-emerald-400 hover:to-violet-400 text-black font-bold rounded uppercase tracking-wider transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <ScrambleText text="NEW_PASTE" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.header>
  );
};
