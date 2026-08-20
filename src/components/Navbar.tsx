/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, Gift, Store, Terminal, Database, Sparkles } from 'lucide-react';
import { SourceCurrency } from '../types.ts';

interface NavbarProps {
  activeTab: 'dashboard' | 'sender' | 'receiver' | 'cashier' | 'ledger';
  setActiveTab: (tab: 'dashboard' | 'sender' | 'receiver' | 'cashier' | 'ledger') => void;
  currency: SourceCurrency;
  setCurrency: (c: SourceCurrency) => void;
  onReplaySplash?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currency,
  setCurrency,
  onReplaySplash
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-emerald-900/10 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Editorial Wordmark with Serif Italic */}
          <div className="flex items-center space-x-3.5 cursor-pointer select-none" onClick={() => setActiveTab('dashboard')}>
            <div className="relative flex items-center justify-center w-11 h-11 rounded-sm bg-emerald-50 border border-emerald-300 shadow-xs">
              <span className="text-xl select-none">🎄</span>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#C41E3A] rounded-full ring-2 ring-white animate-pulse"></span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-editorial text-2xl font-bold tracking-tight text-[#006837] italic">
                  Kua<span className="text-[#C41E3A]">Gifts</span>
                </span>
                <span className="text-[9px] uppercase tracking-[0.2em] font-bold px-2 py-0.5 rounded-sm bg-[#C41E3A] text-white shadow-xs">
                  ESCROW RAILS
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#4A5568] font-medium mt-0.5">
                Purpose-Locked Diaspora Remittance
              </p>
            </div>
          </div>

          {/* Navigation Role Tabs */}
          <nav className="hidden md:flex items-center p-1 bg-[#F4F5F2] rounded-sm border border-emerald-900/10">
            <button
              id="nav-tab-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-sm text-xs font-medium tracking-wider transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-[#006837] text-white font-bold shadow-xs'
                  : 'text-[#4A5568] hover:text-[#006837] hover:bg-emerald-50'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>KuaGifts Hub</span>
            </button>

            <button
              id="nav-tab-sender"
              onClick={() => setActiveTab('sender')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-sm text-xs font-medium tracking-wider transition-all ${
                activeTab === 'sender'
                  ? 'bg-[#C41E3A] text-white font-bold shadow-xs'
                  : 'text-[#4A5568] hover:text-[#C41E3A] hover:bg-red-50'
              }`}
            >
              <Gift className="w-3.5 h-3.5" />
              <span>Diaspora Sender</span>
            </button>

            <button
              id="nav-tab-receiver"
              onClick={() => setActiveTab('receiver')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-sm text-xs font-medium tracking-wider transition-all ${
                activeTab === 'receiver'
                  ? 'bg-[#D4AF37] text-[#0A1C12] shadow-xs font-bold'
                  : 'text-[#4A5568] hover:text-[#B8860B] hover:bg-amber-50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Receiver Portal</span>
            </button>

            <button
              id="nav-tab-cashier"
              onClick={() => setActiveTab('cashier')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-sm text-xs font-medium tracking-wider transition-all ${
                activeTab === 'cashier'
                  ? 'bg-[#0A1C12] text-white shadow-xs font-bold'
                  : 'text-[#4A5568] hover:text-[#0A1C12] hover:bg-slate-100'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Cashier POS Gun</span>
            </button>

            <button
              id="nav-tab-ledger"
              onClick={() => setActiveTab('ledger')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-sm text-xs font-medium tracking-wider transition-all ${
                activeTab === 'ledger'
                  ? 'bg-emerald-800 text-white shadow-xs font-bold'
                  : 'text-[#4A5568] hover:text-[#006837] hover:bg-emerald-50'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Escrow Ledger</span>
            </button>
          </nav>

          {/* Right Controls: Currency Selector & Escrow Status */}
          <div className="flex items-center space-x-3">
            {/* Currency Selector */}
            <div className="flex items-center bg-[#F4F5F2] rounded-sm border border-emerald-900/10 p-0.5">
              {(['GBP', 'USD', 'EUR', 'CAD'] as SourceCurrency[]).map((c) => (
                <button
                  key={c}
                  id={`curr-btn-${c}`}
                  onClick={() => setCurrency(c)}
                  className={`px-2.5 py-1 text-[10px] font-mono font-bold tracking-wider rounded-sm transition-all ${
                    currency === c
                      ? 'bg-[#006837] text-white shadow-2xs'
                      : 'text-[#4A5568] hover:text-[#006837]'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Escrow Status Indicator & Splash Preview */}
            <div className="hidden lg:flex items-center space-x-2">
              {onReplaySplash && (
                <button
                  onClick={onReplaySplash}
                  title="Replay KuaGifts Loading Screen Animation"
                  className="flex items-center space-x-1 px-2.5 py-1.5 rounded-sm bg-white hover:bg-emerald-50 border border-emerald-200 text-[10px] text-[#006837] font-mono transition-all shadow-2xs font-semibold"
                >
                  <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                  <span>Loading UI</span>
                </button>
              )}
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-sm bg-emerald-50 border border-emerald-200 text-[10px] tracking-widest uppercase font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span className="text-emerald-800 font-bold">PSP Node: Connected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex md:hidden overflow-x-auto py-2 space-x-2 border-t border-emerald-900/10 scrollbar-none">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 text-xs rounded-sm whitespace-nowrap font-medium ${activeTab === 'dashboard' ? 'bg-[#006837] text-white font-bold' : 'bg-[#F4F5F2] text-[#4A5568]'}`}
          >
            KuaGifts Hub
          </button>
          <button
            onClick={() => setActiveTab('sender')}
            className={`px-3 py-1.5 text-xs rounded-sm whitespace-nowrap font-medium ${activeTab === 'sender' ? 'bg-[#C41E3A] text-white font-bold' : 'bg-[#F4F5F2] text-[#4A5568]'}`}
          >
            Sender
          </button>
          <button
            onClick={() => setActiveTab('receiver')}
            className={`px-3 py-1.5 text-xs rounded-sm whitespace-nowrap font-medium ${activeTab === 'receiver' ? 'bg-[#D4AF37] text-[#0A1C12] font-bold' : 'bg-[#F4F5F2] text-[#4A5568]'}`}
          >
            Receiver Claim
          </button>
          <button
            onClick={() => setActiveTab('cashier')}
            className={`px-3 py-1.5 text-xs rounded-sm whitespace-nowrap font-medium ${activeTab === 'cashier' ? 'bg-[#0A1C12] text-white font-bold' : 'bg-[#F4F5F2] text-[#4A5568]'}`}
          >
            Cashier POS
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-3 py-1.5 text-xs rounded-sm whitespace-nowrap font-medium ${activeTab === 'ledger' ? 'bg-emerald-800 text-white font-bold' : 'bg-[#F4F5F2] text-[#4A5568]'}`}
          >
            Escrow Ledger
          </button>
        </div>
      </div>
    </header>
  );
};
