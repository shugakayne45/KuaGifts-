/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { SplashScreen } from './components/SplashScreen.tsx';
import { PointsAfricaDashboard } from './components/PointsAfricaDashboard.tsx';
import { SenderFlow } from './components/SenderFlow.tsx';
import { ReceiverPortal } from './components/ReceiverPortal.tsx';
import { CashierPOS } from './components/CashierPOS.tsx';
import { LedgerExplorer } from './components/LedgerExplorer.tsx';
import { SourceCurrency, Order, GiftCard } from './types.ts';
import { ShieldCheck, Heart, Sparkles } from 'lucide-react';

export default function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'sender' | 'receiver' | 'cashier' | 'ledger'>('dashboard');
  const [currency, setCurrency] = useState<SourceCurrency>('GBP');
  const [activeClaimToken, setActiveClaimToken] = useState<string>('xmas-melcom-accra-2026');
  const [activePosBarcode, setActivePosBarcode] = useState<string>('6189421045238');
  const [selectedMerchantId, setSelectedMerchantId] = useState<string | undefined>(undefined);

  // Handle URL query parameters for direct web links
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const claim = params.get('claim');
    const posScan = params.get('posScan');

    if (claim) {
      setActiveClaimToken(claim);
      setActiveTab('receiver');
      setShowSplash(false);
    } else if (posScan) {
      setActivePosBarcode(posScan);
      setActiveTab('cashier');
      setShowSplash(false);
    }
  }, []);

  const handleOrderCreated = (order: Order, giftCard: GiftCard, claimUrl: string) => {
    setActiveClaimToken(giftCard.claimToken);
    setActivePosBarcode(giftCard.ean13Code);
  };

  const handleJumpToReceiver = (claimToken: string) => {
    setActiveClaimToken(claimToken);
    setActiveTab('receiver');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleJumpToCashier = (barcode: string) => {
    setActivePosBarcode(barcode);
    setActiveTab('cashier');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF8] text-[#0F1C13]">
      
      {/* Splash Screen & Sequence with 1.5s gold ring and confetti burst */}
      {showSplash && (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      )}

      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currency={currency}
        setCurrency={setCurrency}
        onReplaySplash={() => setShowSplash(true)}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {activeTab === 'dashboard' && (
          <PointsAfricaDashboard
            currency={currency}
            onSendGift={() => {
              setSelectedMerchantId(undefined);
              setActiveTab('sender');
            }}
            onOpenScanner={() => setActiveTab('cashier')}
            onOpenMyGifts={() => setActiveTab('receiver')}
            onSelectMerchant={(merchantId) => {
              setSelectedMerchantId(merchantId);
              setActiveTab('sender');
            }}
          />
        )}

        {activeTab === 'sender' && (
          <SenderFlow
            currency={currency}
            initialMerchantId={selectedMerchantId}
            onOrderCreated={handleOrderCreated}
            onJumpToReceiver={handleJumpToReceiver}
          />
        )}

        {activeTab === 'receiver' && (
          <ReceiverPortal
            initialClaimToken={activeClaimToken}
            onJumpToCashier={handleJumpToCashier}
          />
        )}

        {activeTab === 'cashier' && (
          <CashierPOS
            initialBarcode={activePosBarcode}
            onRedemptionCompleted={() => {}}
          />
        )}

        {activeTab === 'ledger' && (
          <LedgerExplorer />
        )}
      </main>

      {/* Festive Holiday Footer with Christmas Green Background */}
      <footer className="border-t border-[#D4AF37]/30 bg-[#006837] py-10 mt-16 text-xs text-white/90 shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center space-x-3 text-left">
            <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xl shadow-xs">
              🎄
            </div>
            <div>
              <div className="font-editorial text-base font-bold text-white">
                Kua<span className="text-[#FFD700]">Gifts</span> <span className="text-[#D4AF37]">Remittance Rails</span>
              </div>
              <p className="text-[11px] text-white/80">
                Purpose-Locked Diaspora Remittance & Escrow Infrastructure for West Africa (Ghana 🇬🇭 & Nigeria 🇳🇬).
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-medium">
            <div className="flex items-center space-x-1.5 text-white bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
              <span>Licensed PSP Ring-Fenced Escrow</span>
            </div>
            <div className="flex items-center space-x-1.5 text-amber-200 bg-black/20 px-3 py-1.5 rounded-full border border-amber-300/30">
              <Sparkles className="w-4 h-4 text-[#FFD700]" />
              <span>Dual-Factor Anti-Arbitrage OTP Engine</span>
            </div>
          </div>

          <div className="text-[11px] text-white/70 text-center md:text-right font-mono">
            © 2026 KuaGifts Financial Technologies. Built for Diaspora Communities.
          </div>

        </div>
      </footer>

    </div>
  );
}
