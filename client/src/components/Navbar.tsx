import React from 'react';
import { Terminal, Lock, Plus } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export const Navbar: React.FC<{ onScrollToEditor?: () => void }> = ({ onScrollToEditor }) => {
  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 backdrop-blur-xl bg-black/80 border-b border-emerald-900/40 font-mono"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="p-2 rounded bg-emerald-950 border border-emerald-500/30 text-emerald-400">
            <Terminal className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-wider text-white uppercase text-glow-emerald">
              ZeroIN
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-400 font-bold uppercase">
              v2.0
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-6 text-xs">
          <div className="hidden md:flex items-center gap-2 text-emerald-500/80">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>SYS_CHECK: OK</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-emerald-400">
            <Lock className="w-3.5 h-3.5" />
            <span>AES-256: ARMED</span>
          </div>

          {onScrollToEditor && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onScrollToEditor}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded uppercase tracking-wider transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>NEW_PASTE</span>
            </motion.button>
          )}
        </div>
      </div>
    </motion.header>
  );
};
