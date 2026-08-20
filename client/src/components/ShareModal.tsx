import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, ShieldCheck, QrCode, ExternalLink, AlertTriangle, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

interface ShareModalProps {
  pasteId: string;
  rawKeyBase64: string;
  panicSecret: string;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  pasteId,
  rawKeyBase64,
  panicSecret,
  onClose,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPanic, setCopiedPanic] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const fullShareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/p/${pasteId}#key=${rawKeyBase64}`
    : `/p/${pasteId}#key=${rawKeyBase64}`;

  const panicDeleteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/p/${pasteId}?panic=${panicSecret}`
    : `/p/${pasteId}?panic=${panicSecret}`;

  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#818cf8', '#34d399', '#f8fafc'] // Indigo, Emerald, White
    });
  }, []);

  const copyToClipboard = (text: string, isPanic = false) => {
    navigator.clipboard.writeText(text);
    if (isPanic) {
      setCopiedPanic(true);
      setTimeout(() => setCopiedPanic(false), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md" 
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", bounce: 0.4, duration: 0.5 }}
        className="bg-zinc-900 border border-white/10 rounded-2xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative z-10 overflow-hidden"
      >
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[150px] bg-emerald-500/10 blur-[80px] pointer-events-none" />

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-100 bg-zinc-800/50 hover:bg-zinc-700 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4 mb-8 relative z-10">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20 shadow-inner">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-zinc-100 tracking-tight">Paste Encrypted & Stored</h3>
            <p className="text-sm text-zinc-400 mt-1 leading-relaxed">
              The decryption key is strictly appended in the URL hash fragment. Our servers cannot read this paste.
            </p>
          </div>
        </div>

        {/* Primary Share Link */}
        <div className="space-y-3 mb-8 relative z-10">
          <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
            Shareable Encrypted Link
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1 bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-3 shadow-inner overflow-hidden">
              <input
                type="text"
                readOnly
                value={fullShareUrl}
                className="w-full bg-transparent text-sm text-indigo-300 font-mono focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => copyToClipboard(fullShareUrl)}
                className={cn(
                  "flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all shadow-lg",
                  copiedLink 
                    ? "bg-emerald-500 text-white shadow-emerald-500/20" 
                    : "bg-zinc-100 text-zinc-900 hover:bg-white shadow-white/10"
                )}
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowQr(!showQr)}
                title="Toggle QR Code"
                className="p-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl border border-white/5 transition-colors shadow-sm"
              >
                <QrCode className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* QR Code Container */}
        <AnimatePresence>
          {showQr && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mb-8 p-6 bg-zinc-950/80 border border-zinc-800 rounded-2xl flex flex-col items-center justify-center shadow-inner relative z-10">
                <div className="bg-white p-4 rounded-xl shadow-lg ring-4 ring-white/5">
                  <QRCodeSVG value={fullShareUrl} size={160} />
                </div>
                <p className="text-xs text-zinc-400 mt-4 font-medium">Scan with mobile camera to view instantly</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Panic Delete URL */}
        <div className="p-5 bg-rose-950/20 border border-rose-900/30 rounded-2xl space-y-3 mb-6 relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-rose-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Panic Delete Link
            </span>
            <span className="text-[10px] uppercase tracking-wider font-bold text-rose-500/80 bg-rose-950/50 px-2 py-0.5 rounded-md">Owner Only</span>
          </div>
          <p className="text-xs text-rose-400/80 pb-1">Save this unique link to manually destroy the paste from the server at any time.</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-zinc-950/50 border border-rose-900/20 rounded-xl px-4 py-2.5 shadow-inner overflow-hidden">
              <input
                type="text"
                readOnly
                value={panicDeleteUrl}
                className="w-full bg-transparent text-xs text-rose-300/80 font-mono focus:outline-none"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => copyToClipboard(panicDeleteUrl, true)}
              className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold border border-rose-500/20 transition-colors flex items-center gap-2"
            >
              {copiedPanic ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedPanic ? 'Copied' : 'Copy'}</span>
            </motion.button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-zinc-800/50 relative z-10">
          <a
            href={fullShareUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors flex items-center gap-1.5"
          >
            <span>Open in new tab</span>
            <ExternalLink className="w-4 h-4" />
          </a>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            Done
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
