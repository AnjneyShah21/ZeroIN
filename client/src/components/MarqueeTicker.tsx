import React from 'react';
import { ScrambleText } from './ScrambleText';

export const MarqueeTicker: React.FC = () => {
  const tickerText = " /// ZeroIN v2.0 /// CHOOSE AES-GCM 128 / 192 / 256 /// ZERO SERVER KNOWLEDGE /// BURNS ON READ /// INSTANT PANIC DELETE /// WebCrypto API POWERED ///";

  return (
    <div className="w-full bg-gradient-to-r from-emerald-950/50 via-violet-950/60 to-emerald-950/50 border-y border-violet-400/30 py-2.5 overflow-hidden select-none font-mono text-[11px] uppercase tracking-widest text-emerald-300/90 shadow-[0_0_25px_rgba(139,92,246,0.12)] relative z-10">
      <div className="animate-marquee whitespace-nowrap">
        <ScrambleText text={tickerText.repeat(4)} />
        <ScrambleText text={tickerText.repeat(4)} />
      </div>
    </div>
  );
};
