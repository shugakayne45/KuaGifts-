/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Gift, 
  MapPin, 
  ShieldCheck, 
  PhoneCall, 
  ArrowRight, 
  Key, 
  CheckCircle2, 
  ExternalLink,
  Store,
  Volume2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GiftCard, Order, Merchant } from '../types.ts';
import { MERCHANTS, PURPOSE_CONFIG } from '../data/merchantsData.ts';
import { BarcodeCard } from './BarcodeCard.tsx';
import { AudioVoiceRecorder } from './AudioVoiceRecorder.tsx';

interface ReceiverPortalProps {
  initialClaimToken?: string;
  onJumpToCashier: (barcode: string) => void;
}

export const ReceiverPortal: React.FC<ReceiverPortalProps> = ({
  initialClaimToken = 'xmas-melcom-accra-2026',
  onJumpToCashier
}) => {
  const [tokenInput, setTokenInput] = useState<string>(initialClaimToken);
  const [giftData, setGiftData] = useState<{
    giftCard: GiftCard;
    order: Order;
    merchant: Merchant;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isUnboxed, setIsUnboxed] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Live polling for incoming checkout OTP when cashier scans
  const [activeOtpBanner, setActiveOtpBanner] = useState<{
    otpCode: string;
    expiresAt: string;
    merchantName: string;
  } | null>(null);

  const fetchGiftCard = async (token: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/v1/giftcards/lookup?q=${encodeURIComponent(token)}`);
      const json = await res.json();
      if (json.success && json.data) {
        setGiftData(json.data);
      } else {
        setErrorMsg(json.error || 'Gift card not found. Please verify the link.');
      }
    } catch (err: any) {
      setErrorMsg('Failed to connect to KuaGifts escrow API: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialClaimToken) {
      setTokenInput(initialClaimToken);
      fetchGiftCard(initialClaimToken);
    }
  }, [initialClaimToken]);

  const handleUnbox = () => {
    setIsUnboxed(true);
    // Trigger celebratory holiday confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#C41E3A', '#D4AF37', '#0F1C13', '#FFFFFF']
      });
    } catch (e) {
      // Confetti fallback
    }
  };

  const purposeMeta = giftData ? PURPOSE_CONFIG[giftData.giftCard.purposeCategory] || PURPOSE_CONFIG['GROCERIES_FOOD'] : null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Quick Lookup Bar */}
      <div className="bg-white border border-slate-200/90 rounded-sm p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center space-x-2 text-xs text-[#4A5568]">
          <Key className="w-4 h-4 text-[#006837]" />
          <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-[#006837] font-bold">Receiver Direct Claim Token:</span>
        </div>
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <input
            type="text"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="Enter claim token or EAN barcode"
            className="bg-slate-50 border border-slate-300 rounded-sm px-3 py-1.5 text-xs text-[#0F1C13] font-mono focus:outline-none focus:border-[#006837] w-full sm:w-64"
          />
          <button
            onClick={() => fetchGiftCard(tokenInput)}
            className="px-4 py-1.5 rounded-sm bg-[#006837] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#00522c] whitespace-nowrap shadow-xs"
          >
            Lookup
          </button>
        </div>
      </div>

      {loading && (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-2 border-[#006837] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#006837] font-mono font-bold">Retrieving Escrow Purpose Card...</p>
        </div>
      )}

      {errorMsg && !loading && (
        <div className="bg-red-50 border border-red-200 p-6 rounded-sm text-center space-y-3">
          <p className="text-sm font-semibold text-red-700">{errorMsg}</p>
          <button
            onClick={() => fetchGiftCard('xmas-melcom-accra-2026')}
            className="px-4 py-2 rounded-sm bg-[#006837] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#00522c]"
          >
            Load Sample Melcom Ghana Christmas Card
          </button>
        </div>
      )}

      {!loading && giftData && (
        <>
          {/* Unboxed Interactive Stage */}
          {!isUnboxed ? (
            <div className="relative bg-white border border-slate-200 rounded-sm p-8 md:p-14 text-center shadow-md overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-red-100/40 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10 max-w-lg mx-auto space-y-6">
                <div className="w-20 h-20 bg-gradient-to-tr from-[#C41E3A] to-[#8B0000] text-white rounded-full flex items-center justify-center mx-auto shadow-lg border-2 border-[#D4AF37] transform hover:scale-105 transition-transform">
                  <Gift className="w-10 h-10 animate-pulse" />
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#006837] font-bold">
                    Special Holiday Delivery For You
                  </span>
                  <h1 className="font-editorial text-3xl md:text-5xl font-bold text-[#0F1C13] italic mt-2">
                    {giftData.giftCard.receiverName}
                  </h1>
                  <p className="text-xs md:text-sm text-[#4A5568] mt-2">
                    You have received a purpose-locked holiday gift card from <strong>{giftData.giftCard.senderName}</strong>.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-sm p-4 text-left space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#4A5568]">Merchant</span>
                    <span className="font-bold text-[#006837]">{giftData.merchant.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#4A5568]">Purpose Locked</span>
                    <span className="font-semibold text-emerald-800">{purposeMeta?.label}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#4A5568]">Locked Value</span>
                    <span className="font-mono font-bold text-[#0F1C13] text-base">
                      {giftData.giftCard.currency} {giftData.giftCard.remainingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <button
                  id="unbox-gift-btn"
                  onClick={handleUnbox}
                  className="w-full py-3.5 rounded-sm bg-gradient-to-r from-[#C41E3A] via-[#d62846] to-[#C41E3A] hover:from-[#a51830] hover:to-[#851325] text-white font-bold text-xs uppercase tracking-widest shadow-lg transition-all transform active:scale-98 flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-4 h-4 text-[#FFD700]" />
                  <span>Unbox & Reveal Your Holiday Gift</span>
                </button>
              </div>
            </div>
          ) : (
            /* Unboxed Full View */
            <div className="space-y-6">
              
              {/* Receiver Greeting & Holiday Media Box */}
              <div className="bg-white border border-slate-200/90 rounded-sm p-6 md:p-8 space-y-6 shadow-xs relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#006837] font-bold">
                      Holiday Gift From {giftData.giftCard.senderName}
                    </span>
                    <h2 className="font-editorial text-3xl font-bold text-[#0F1C13] italic mt-1">
                      Hello {giftData.giftCard.receiverName} 🎄
                    </h2>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-sm text-right">
                    <span className="text-[9px] text-[#4A5568] uppercase font-mono block">Current Balance</span>
                    <span className="text-xl font-mono font-black text-[#006837]">
                      {giftData.giftCard.currency} {giftData.giftCard.remainingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Holiday Photo & Sender Dedication */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
                  {giftData.giftCard.photoUrl && (
                    <div className="rounded-sm overflow-hidden border border-slate-200 shadow-xs aspect-video md:aspect-square">
                      <img
                        src={giftData.giftCard.photoUrl}
                        alt="Holiday gift cover"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="md:col-span-2 space-y-4">
                    <div className="bg-slate-50 border border-slate-200 rounded-sm p-4">
                      <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-[#006837] block mb-1 font-mono">
                        Personal Dedication
                      </span>
                      <p className="text-xs md:text-sm text-[#0F1C13] italic leading-relaxed font-serif">
                        "{giftData.giftCard.personalMessage}"
                      </p>
                      <div className="mt-2 text-right text-[10px] uppercase tracking-wider text-[#4A5568] font-mono">
                        — Sent with love by {giftData.giftCard.senderName}
                      </div>
                    </div>

                    {/* Audio Voice Note Player */}
                    {giftData.giftCard.voiceNoteUrl && (
                      <AudioVoiceRecorder
                        initialAudioUrl={giftData.giftCard.voiceNoteUrl}
                        onAudioReady={() => {}}
                        readOnly={true}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Barcode Display Section */}
              <div className="space-y-4">
                <div className="text-center">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-[#006837] font-bold block">
                    Retail Checkout Pass
                  </span>
                  <h3 className="font-editorial text-2xl font-bold text-[#0F1C13] italic mt-1">
                    Optical POS Checkout Barcode
                  </h3>
                  <p className="text-xs text-[#4A5568]">
                    Present this barcode to the cashier gun at any {giftData.merchant.name} checkout lane.
                  </p>
                </div>

                <BarcodeCard
                  ean13Code={giftData.giftCard.ean13Code}
                  cardNumber={giftData.giftCard.cardNumber}
                  merchantName={giftData.merchant.name}
                  currency={giftData.giftCard.currency}
                  balance={giftData.giftCard.remainingBalance}
                  purposeLabel={purposeMeta?.label || 'Provisions & Groceries'}
                  claimToken={giftData.giftCard.claimToken}
                />
              </div>

              {/* Verified Merchant Branches & POS Instructions */}
              <div className="bg-white border border-slate-200/90 rounded-sm p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <Store className="w-4 h-4 text-[#006837]" />
                    <h4 className="font-editorial text-lg font-bold text-[#0F1C13] italic">
                      Where to Redeem: {giftData.merchant.name}
                    </h4>
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-[#006837] font-mono font-bold">
                    {giftData.merchant.branches.length} Branches Available
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {giftData.merchant.branches.map((b) => (
                    <div
                      key={b.id}
                      className="bg-slate-50 p-3.5 rounded-sm border border-slate-200 flex items-start space-x-2.5 text-xs"
                    >
                      <MapPin className="w-4 h-4 text-[#C41E3A] shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-[#0F1C13]">{b.name}</div>
                        <div className="text-[11px] text-[#4A5568]">{b.address}, {b.city}</div>
                        <div className="text-[9px] uppercase tracking-widest text-[#006837] font-mono mt-1 font-semibold">Terminal: {b.posTerminalId}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cashier Test Shortcut */}
              <div className="bg-emerald-50/70 border border-emerald-200 p-5 rounded-sm flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
                <div>
                  <h5 className="font-bold text-xs uppercase tracking-wider text-[#006837]">Want to simulate POS scanning & redemption?</h5>
                  <p className="text-[11px] text-[#4A5568]">
                    Switch to the Cashier POS Gun to scan this barcode ({giftData.giftCard.ean13Code}) and test dual-factor OTP verification.
                  </p>
                </div>
                <button
                  onClick={() => onJumpToCashier(giftData.giftCard.ean13Code)}
                  className="px-5 py-2.5 rounded-sm bg-[#C41E3A] hover:bg-[#a51830] text-white font-bold text-xs uppercase tracking-widest flex items-center space-x-1.5 shadow-xs whitespace-nowrap active:scale-98 transition-all"
                >
                  <span>Open Cashier POS Scanner</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          )}
        </>
      )}

    </div>
  );
};
