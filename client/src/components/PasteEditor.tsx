import React, { useState } from 'react';
import { Lock, Clock, Flame, Eye, Upload, FileText, Code2, ShieldAlert, Terminal, Key, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DEFAULT_ENCRYPTION_STRENGTH, EncryptionStrength, encryptData, generateRandomSecret, hashSecret } from '../lib/crypto';
import { ShareModal } from './ShareModal';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '../lib/utils';
import { ScrambleText } from './ScrambleText';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const encryptionGuidance: Record<EncryptionStrength, { label: string; summary: string; caution: string }> = {
  128: {
    label: 'AES-128-GCM — STANDARD',
    summary: 'Strong modern encryption and a sensible choice for most private content.',
    caution: 'Not considered practically breakable today; it has a smaller long-term security margin than AES-256.',
  },
  192: {
    label: 'AES-192-GCM — HIGH',
    summary: 'Adds a larger key size while keeping the same authenticated AES-GCM protection.',
    caution: 'No known practical weakness; AES-256 is the more common choice when maximum key length is wanted.',
  },
  256: {
    label: 'AES-256-GCM — MAXIMUM',
    summary: 'The highest AES level offered here and the default for highly sensitive content.',
    caution: 'No known practical weakness; it is only marginally more computationally demanding than AES-128.',
  },
};

export const PasteEditor: React.FC = () => {
  const [content, setContent] = useState('');
  const [expiry, setExpiry] = useState('1d');
  const [burnAfterReading, setBurnAfterReading] = useState(false);
  const [password, setPassword] = useState('');
  const [encryptionStrength, setEncryptionStrength] = useState<EncryptionStrength>(DEFAULT_ENCRYPTION_STRENGTH);
  const [maxViews, setMaxViews] = useState(0);
  const [viewMode, setViewMode] = useState<'write' | 'preview'>('write');
  const [attachment, setAttachment] = useState<{ name: string; type: string; base64: string } | null>(null);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdResult, setCreatedResult] = useState<{
    id: string;
    rawKeyBase64: string;
    panicSecret: string;
  } | null>(null);
  const [isIntroHovered, setIsIntroHovered] = useState(false);
  const selectedEncryption = encryptionGuidance[encryptionStrength];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('Attachment must be under 5MB'); return; }
    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachment({ name: file.name, type: file.type, base64: event.target?.result as string });
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleCreatePaste = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !attachment) { setError('Please provide text content or a file attachment.'); return; }
    setIsEncrypting(true);
    setError(null);
    try {
      const encrypted = await encryptData(JSON.stringify({ text: content, attachment: attachment || null, createdAt: new Date().toISOString() }), password, encryptionStrength);
      const panicSecret = generateRandomSecret(24);
      const panicDeleteHash = await hashSecret(panicSecret);
      const response = await fetch(`${API_BASE}/api/pastes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ciphertext: encrypted.ciphertext, iv: encrypted.iv, salt: encrypted.salt, algorithm: encrypted.algorithm, keyLength: encrypted.keyLength, isPasswordProtected: Boolean(password), burnAfterReading, expiry, maxViews: Number(maxViews), panicDeleteHash }),
      });
      if (!response.ok) { const errData = await response.json(); throw new Error(errData.error || 'Server rejected encrypted payload.'); }
      const resData = await response.json();
      setCreatedResult({ id: resData.id, rawKeyBase64: encrypted.rawKeyBase64, panicSecret });
    } catch (err: any) {
      setError(err.message || 'An error occurred while encrypting the paste.');
    } finally {
      setIsEncrypting(false);
    }
  };

  return (
    <div className="w-full space-y-8 pb-20">
      {/* Banner */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onHoverStart={() => setIsIntroHovered(true)} onHoverEnd={() => setIsIntroHovered(false)} className="cyber-card rounded-xl p-8 relative overflow-hidden cursor-crosshair">
        <div className="flex items-center gap-4 mb-4">
          <Terminal className="w-6 h-6 text-emerald-400 flex-shrink-0" />
          <h2 className="text-2xl font-black text-white uppercase tracking-widest"><ScrambleText active={isIntroHovered} text="ZERO-KNOWLEDGE ENCRYPTED PASTE" /></h2>
        </div>
        <p className="text-sm text-emerald-500/90 font-mono font-semibold leading-relaxed">
          <ScrambleText active={isIntroHovered} text="CHOOSE YOUR ENCRYPTION LEVEL. YOUR CONTENT IS ENCRYPTED RIGHT HERE IN YOUR BROWSER WITH AUTHENTICATED AES-GCM BEFORE BEING SENT OVER THE NETWORK. THE DECRYPTION KEY NEVER TOUCHES OUR SERVERS. PERIOD." />
        </p>
      </motion.div>

      {/* Editor Main Card */}
      <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} onSubmit={handleCreatePaste} className="cyber-card rounded-xl p-8 space-y-8">
        {/* Tab Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-emerald-900/40 pb-5 gap-4">
          <div className="flex items-center gap-1 p-1 bg-black/80 rounded border border-emerald-900/60">
            <button type="button" onClick={() => setViewMode('write')} className={cn("relative px-5 py-2 text-sm font-bold uppercase tracking-wider rounded flex items-center gap-2 transition-all", viewMode === 'write' ? "bg-emerald-500 text-black" : "text-emerald-500 hover:text-emerald-300")}>
              <Code2 className="w-4 h-4" /><span>Editor</span>
            </button>
            <button type="button" onClick={() => setViewMode('preview')} className={cn("relative px-5 py-2 text-sm font-bold uppercase tracking-wider rounded flex items-center gap-2 transition-all", viewMode === 'preview' ? "bg-emerald-500 text-black" : "text-emerald-500 hover:text-emerald-300")}>
              <FileText className="w-4 h-4" /><span>Preview</span>
            </button>
          </div>
          <div className="text-xs text-emerald-600 font-mono font-bold bg-black/80 px-3 py-1.5 rounded border border-emerald-900/60">
            {content.length} CHARS | {content.split(/\s+/).filter(Boolean).length} WORDS
          </div>
        </div>

        {/* Editor Area */}
        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
            {viewMode === 'write' ? (
              <motion.textarea key="write" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} value={content} onChange={(e) => setContent(e.target.value)}
                placeholder="> Paste raw text, code snippets, confidential notes, or markdown..."
                className="w-full h-full min-h-[400px] bg-black border border-emerald-900/60 rounded p-5 text-sm font-mono text-emerald-300 focus:outline-none focus:border-emerald-500 transition-all resize-y leading-relaxed"
              />
            ) : (
              <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="w-full min-h-[400px] bg-black border border-emerald-900/60 rounded p-5 text-sm font-mono text-emerald-300 prose prose-invert max-w-none"
              >
                {content ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown> : <span className="text-emerald-700 italic">&gt;_ NOTHING TO PREVIEW...</span>}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Attachment */}
        <div className="bg-black/60 border border-emerald-900/60 rounded p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Upload className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-wider">ENCRYPTED ATTACHMENT <span className="text-emerald-600 font-bold">(OPTIONAL)</span></h3>
                <p className="text-xs text-emerald-600 font-mono mt-0.5">FILE ENCRYPTED BROWSER-SIDE (MAX 5MB)</p>
              </div>
            </div>
            <label className="px-4 py-2 bg-emerald-950 border border-emerald-500/40 text-emerald-400 text-xs font-bold rounded uppercase cursor-pointer hover:bg-emerald-900 transition-colors">
              <span>{attachment ? 'CHANGE' : 'CHOOSE FILE'}</span>
              <input type="file" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
          <AnimatePresence>
            {attachment && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mt-3">
                <div className="text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 rounded p-3 flex items-center justify-between font-mono font-bold">
                  <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5" /><span>[ENCRYPTED] {attachment.name}</span></div>
                  <button type="button" onClick={() => setAttachment(null)} className="text-red-400 hover:text-red-300 uppercase text-[10px] font-black tracking-widest">REMOVE</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Security Settings */}
        <div className="space-y-4 pt-4 border-t border-emerald-900/40">
          <h3 className="text-lg font-black text-white uppercase tracking-widest">SECURITY & EXPIRATION</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
            {/* Expiration */}
            <div className="bg-black/60 border border-emerald-900/60 hover:border-emerald-500/40 transition-colors rounded p-4 space-y-3">
              <label className="text-sm font-black text-emerald-400 flex items-center gap-2 uppercase tracking-wider">
                <Clock className="w-4 h-4" /><span>TIME-BASED EXPIRY</span>
              </label>
              <div className="relative">
                <select value={expiry} onChange={(e) => setExpiry(e.target.value)} className="w-full appearance-none bg-black border border-emerald-900/60 rounded px-3 pr-8 py-2.5 text-sm font-bold text-emerald-300 focus:outline-none focus:border-emerald-500 cursor-pointer uppercase">
                  <option value="5m">5 MINUTES</option>
                  <option value="1h">1 HOUR</option>
                  <option value="1d">24 HOURS (DEFAULT)</option>
                  <option value="1w">7 DAYS</option>
                  <option value="never">NEVER (PERSISTENT)</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none w-4 h-4 text-emerald-600" />
              </div>
            </div>

            {/* Burn After Reading */}
            <div className="bg-black/60 border border-emerald-900/60 hover:border-emerald-500/40 transition-colors rounded p-4 space-y-3">
              <label className="text-sm font-black text-emerald-400 flex items-center justify-between cursor-pointer uppercase tracking-wider" onClick={() => setBurnAfterReading(!burnAfterReading)}>
                <div className="flex items-center gap-2"><Flame className="w-4 h-4 text-amber-400" /><span>BURN AFTER READ</span></div>
                <div className={cn("w-12 h-6 rounded flex items-center px-0.5 transition-colors", burnAfterReading ? "bg-amber-500/30 border border-amber-500" : "bg-black border border-emerald-900/60")}>
                  <motion.div layout className={cn("w-5 h-5 rounded-sm", burnAfterReading ? "bg-amber-400" : "bg-emerald-800")} style={{ x: burnAfterReading ? 24 : 0 }} />
                </div>
              </label>
              <p className="text-xs text-emerald-600 font-bold">SELF-DESTRUCT IMMEDIATELY AFTER FIRST VIEW.</p>
            </div>

            {/* Password */}
            <div className="bg-black/60 border border-emerald-900/60 hover:border-emerald-500/40 transition-colors rounded p-4 space-y-3">
              <label className="text-sm font-black text-emerald-400 flex items-center gap-2 uppercase tracking-wider">
                <Key className="w-4 h-4 text-emerald-400" /><span>OPTIONAL PASSWORD</span>
              </label>
              <input type="password" placeholder="> REQUIRES KEY + PASSWORD TO DECRYPT" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border border-emerald-900/60 rounded px-3 py-2.5 text-sm font-mono font-bold text-emerald-300 placeholder:text-emerald-900 focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            {/* Max Views */}
            <div className="bg-black/60 border border-emerald-900/60 hover:border-emerald-500/40 transition-colors rounded p-4 space-y-3">
              <label className="text-sm font-black text-emerald-400 flex items-center gap-2 uppercase tracking-wider">
                <Eye className="w-4 h-4 text-emerald-400" /><span>MAX VIEW LIMIT (0 = UNLIMITED)</span>
              </label>
              <input type="number" min={0} max={1000} value={maxViews} onChange={(e) => setMaxViews(parseInt(e.target.value) || 0)}
                className="w-full bg-black border border-emerald-900/60 rounded px-3 py-2.5 text-sm font-mono font-bold text-emerald-300 focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* Encryption choice — intentionally kept below the other paste settings. */}
          <div className="bg-emerald-950/20 border border-emerald-500/40 rounded-lg p-5 space-y-4 font-mono">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-black text-emerald-300 flex items-center gap-2 uppercase tracking-wider">
                <Lock className="w-4 h-4" /><span>CHOOSE ENCRYPTION LEVEL</span>
              </label>
              <p className="text-xs text-emerald-600 font-bold">AES-GCM IS AUTHENTICATED ENCRYPTION: IT PROTECTS CONTENT AND DETECTS TAMPERING.</p>
            </div>

            <div className="relative max-w-xl">
              <select aria-label="Choose encryption level" value={encryptionStrength} onChange={(e) => setEncryptionStrength(Number(e.target.value) as EncryptionStrength)} className="w-full appearance-none bg-black border border-emerald-500/60 rounded-md px-4 pr-10 py-3 text-sm font-black text-emerald-300 focus:outline-none focus:border-emerald-300 cursor-pointer uppercase">
                <option value={128}>AES-128-GCM — STANDARD</option>
                <option value={192}>AES-192-GCM — HIGH</option>
                <option value={256}>AES-256-GCM — MAXIMUM</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none w-5 h-5 text-emerald-400" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-relaxed">
              <div className="border border-emerald-900/70 bg-black/50 rounded p-3">
                <div className="font-black text-emerald-400 uppercase">{selectedEncryption.label}</div>
                <p className="mt-1 text-emerald-500/90 font-semibold">{selectedEncryption.summary}</p>
              </div>
              <div className="border border-amber-500/30 bg-amber-950/10 rounded p-3">
                <div className="font-black text-amber-400 uppercase">Security note</div>
                <p className="mt-1 text-amber-100/75 font-semibold">{selectedEncryption.caution}</p>
              </div>
            </div>

            <p className="text-[11px] text-emerald-700 font-bold leading-relaxed">OTHER AES MODES SUCH AS CBC OR CTR ARE NOT OFFERED: WITHOUT CAREFUL EXTRA AUTHENTICATION THEY CAN BE EASIER TO MISUSE. ALL AVAILABLE LEVELS USE AES-GCM.</p>
          </div>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="p-4 bg-red-950/40 border border-red-800/60 rounded text-sm text-red-300 flex items-center gap-3 font-mono font-bold overflow-hidden">
              <ShieldAlert className="w-5 h-5 flex-shrink-0 text-red-400" />
              <span>[ERROR] {error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isEncrypting}
          className={cn("w-full py-5 rounded text-base font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-lg",
            isEncrypting ? "bg-emerald-950 text-emerald-700 cursor-not-allowed border border-emerald-900" : "bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.4)]"
          )}
        >
          {isEncrypting ? (
            <><div className="w-5 h-5 border-2 border-emerald-700 border-t-emerald-400 rounded-full animate-spin" /><span>ENCRYPTING CLIENT-SIDE...</span></>
          ) : (
            <><Lock className="w-5 h-5" /><ScrambleText text="ENCRYPT & CREATE SECURE LINK" hoverColor="#000000" /></>
          )}
        </motion.button>
      </motion.form>

      <AnimatePresence>
        {createdResult && (
          <ShareModal pasteId={createdResult.id} rawKeyBase64={createdResult.rawKeyBase64} panicSecret={createdResult.panicSecret} onClose={() => setCreatedResult(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};
