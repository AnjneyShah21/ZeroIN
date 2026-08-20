import React from 'react';
import Head from 'next/head';
import { Navbar } from '../../components/Navbar';
import { PasteViewer } from '../../components/PasteViewer';

export default function PastePage() {
  return (
    <div className="min-h-screen bg-black text-emerald-100 font-mono flex flex-col cyber-grid scanlines">
      <Head>
        <title>ZeroIN — View Encrypted Payload</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 sm:px-8 py-12 relative z-10">
        <PasteViewer />
      </main>
    </div>
  );
}
