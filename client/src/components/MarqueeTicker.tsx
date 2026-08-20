import React from 'react';

export const MarqueeTicker: React.FC = () => {
  const tickerText = " /// ZeroIN v2.0 /// CLIENT-SIDE AES-256-GCM /// ZERO SERVER KNOWLEDGE /// BURNS ON READ /// INSTANT PANIC DELETE /// WebCrypto API POWERED ///";

  return (
    <div className="w-full bg-emerald-950/40 border-y border-emerald-500/20 py-2.5 overflow-hidden select-none font-mono text-[11px] uppercase tracking-widest text-emerald-400/90 shadow-inner relative z-10">
      <div className="animate-marquee whitespace-nowrap">
        <span>{tickerText.repeat(4)}</span>
        <span>{tickerText.repeat(4)}</span>
      </div>
    </div>
  );
};
