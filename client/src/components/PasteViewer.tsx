import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { decryptData } from '../lib/crypto';
import type { EncryptionStrength } from '../lib/crypto';
import { Lock, Download, Copy, Check, Flame, ShieldAlert, Key, Clock, Eye, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface PasteData {
  id: string;
  ciphertext: string;
  iv: string;
  salt?: string;
  algorithm: 'AES-GCM';
  keyLength: EncryptionStrength;
  isPasswordProtected: boolean;
  burnAfterReading: boolean;
  maxViews: number;
  viewCount: number;
  createdAt: number;
}

export const PasteViewer: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(true);
  const [paste, setPaste] = useState<PasteData | null>(null);
  const [password, setPassword] = useState('');
  const [decryptedPayload, setDecryptedPayload] = useState<{
    text: string;
    attachment?: { name: string; type: string; base64: string } | null;
  } | null>(null);
  
  const [error, setError] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState(false);
  const [isBurning, setIsBurning] = useState(false);
  const [panicDeleted, setPanicDeleted] = useState(false);

  useEffect(() => {
    if (!id || typeof id !== 'string') return;
    if (router.query.panic && typeof router.query.panic === 'string') {
      handlePanicDelete(id, router.query.panic);
      return;
    }
    fetchPaste(id);
  }, [id, router.query]);

  useEffect(() => {
    if (decryptedPayload) {
      Prism.highlightAll();
    }
  }, [decryptedPayload]);

  const handlePanicDelete = async (pasteId: string, panicSecret: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/pastes/${pasteId}/panic`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ panicSecret }),
      });

      if (res.ok) {
        setPanicDeleted(true);
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to destroy paste.');
      }
    } catch (e) {
      setError('Panic delete request failed.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaste = async (pasteId: string) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_BASE}/api/pastes/${pasteId}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error('This paste has expired, been burned, or does not exist.');
        throw new Error('Failed to load paste from server.');
      }

      const data: PasteData = await res.json();
      setPaste(data);
      if (data.burnAfterReading) setIsBurning(true);

      const hash = window.location.hash;
      let rawKeyBase64 = hash.includes('#key=') ? hash.replace('#key=', '').trim() : undefined;

      if (!data.isPasswordProtected && rawKeyBase64) {
        await attemptDecryption(data, rawKeyBase64, undefined);
      }
    } catch (err: any) {
      setError(err.message || 'Error retrieving paste.');
    } finally {
      setLoading(false);
    }
  };

  const attemptDecryption = async (pasteData: PasteData, rawKeyBase64?: string, userPass?: string) => {
    try {
      setError(null);
      const decryptedBuffer = await decryptData(
        pasteData.ciphertext,
        pasteData.iv,
        rawKeyBase64,
        userPass,
        pasteData.salt,
        pasteData.keyLength || 256
      );

      const jsonStr = new TextDecoder().decode(decryptedBuffer);
      const parsed = JSON.parse(jsonStr);
      setDecryptedPayload(parsed);
    } catch (err: any) {
      console.error('Decryption error:', err);
      setError('Decryption failed. Invalid decryption key or wrong password.');
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paste) return;
    const hash = window.location.hash;
    const rawKeyBase64 = hash.includes('#key=') ? hash.replace('#key=', '').trim() : undefined;
    attemptDecryption(paste, rawKeyBase64, password);
  };

  const copyContent = () => {
    if (!decryptedPayload?.text) return;
    navigator.clipboard.writeText(decryptedPayload.text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto py-32 text-center space-y-6">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="w-12 h-12 border-[3px] border-indigo-500/30 border-t-indigo-500 rounded-full mx-auto"
        />
        <p className="text-sm text-zinc-400 font-medium tracking-wide">Decrypting payload zero-knowledge style...</p>
      </div>
    );
  }

  if (panicDeleted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl mx-auto py-16 glass-panel rounded-2xl p-10 text-center space-y-5"
      >
        <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <Trash2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">Paste Destroyed</h2>
        <p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
          Your panic deletion was verified. The encrypted payload has been permanently wiped from our servers.
        </p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="max-w-xl mx-auto py-16 glass-panel rounded-2xl p-10 text-center space-y-5"
      >
        <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">Unable to Decrypt</h2>
        <p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">{error}</p>
      </motion.div>
    );
  }

  if (paste?.isPasswordProtected && !decryptedPayload) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto mt-12 glass-panel border border-white/5 rounded-2xl p-8 space-y-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 w-[200px] h-[200px] bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="flex flex-col items-center text-center gap-4 relative z-10">
          <div className="p-4 bg-zinc-950/50 text-emerald-400 rounded-2xl border border-emerald-500/20 shadow-inner">
            <Key className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-zinc-100 tracking-tight">Encrypted with Password</h3>
            <p className="text-sm text-zinc-400 mt-2">Enter the password to derive the decryption key client-side.</p>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-5 relative z-10">
          <input
            type="password"
            placeholder="Enter secure password..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl p-3.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-inner"
          />
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            <span>Decrypt Content</span>
          </motion.button>
        </form>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <AnimatePresence>
        {isBurning && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-orange-950/20 border border-orange-500/30 rounded-2xl flex items-center gap-3 text-sm text-orange-400 shadow-inner"
          >
            <motion.div animate={{ rotate: [0, -10, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
              <Flame className="w-5 h-5 flex-shrink-0" />
            </motion.div>
            <span>
              <strong className="font-semibold text-orange-300">Burn-after-reading active:</strong> This paste has now been permanently erased from the server.
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800 pb-5 gap-4">
          <div className="flex items-center gap-5 text-sm text-zinc-400">
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              {paste ? new Date(paste.createdAt).toLocaleString() : ''}
            </span>
            <span className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-pink-400" />
              Views: <span className="font-semibold text-zinc-300">{paste?.viewCount}</span>
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
            onClick={copyContent}
            className={cn(
              "flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm",
              copiedText 
                ? "bg-emerald-500 text-white shadow-emerald-500/20 border-emerald-500" 
                : "bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 hover:border-zinc-600"
            )}
          >
            {copiedText ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedText ? 'Copied' : 'Copy Content'}</span>
          </motion.button>
        </div>

        {decryptedPayload?.text && (
          <div className="bg-zinc-950/50 border border-zinc-800/80 rounded-xl p-5 overflow-x-auto shadow-inner">
            <pre className="font-mono text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
              <code>{decryptedPayload.text}</code>
            </pre>
          </div>
        )}

        {decryptedPayload?.attachment && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-5 bg-zinc-950/50 border border-zinc-800/80 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-inner"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-semibold text-zinc-200 block">Decrypted File Attachment</span>
                <p className="text-xs text-zinc-500 font-mono mt-0.5">{decryptedPayload.attachment.name}</p>
              </div>
            </div>

            <motion.a
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
              href={decryptedPayload.attachment.base64}
              download={decryptedPayload.attachment.name}
              className="w-full sm:w-auto px-5 py-2.5 bg-zinc-100 hover:bg-white text-zinc-900 rounded-xl text-sm font-semibold transition-all shadow-lg text-center"
            >
              Download File
            </motion.a>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
