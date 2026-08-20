/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Sparkles, 
  Scan, 
  CreditCard, 
  Send, 
  Gift, 
  Store, 
  ArrowUpRight, 
  ShieldCheck, 
  TrendingUp,
  Award,
  Clock,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { SourceCurrency, CountryCode } from '../types.ts';
import { MERCHANTS } from '../data/merchantsData.ts';

interface PointsAfricaDashboardProps {
  currency: SourceCurrency;
  onSendGift: () => void;
  onOpenScanner: () => void;
  onOpenMyGifts: () => void;
  onSelectMerchant: (merchantId: string) => void;
}

export const PointsAfricaDashboard: React.FC<PointsAfricaDashboardProps> = ({
  currency,
  onSendGift,
  onOpenScanner,
  onOpenMyGifts,
  onSelectMerchant
}) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top KuaGifts Hero Card: Lush Emerald Green with Gold & White accents */}
      <div 
        id="kuagifts-top-card"
        className="relative bg-gradient-to-br from-[#006837] via-[#05572f] to-[#033b1e] rounded-sm p-6 md:p-8 shadow-xl border border-emerald-600/30 overflow-hidden text-white"
      >
        {/* Subtle Festive Glow Ribbons */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
        <div className="absolute -bottom-10 -right-10 opacity-10 text-white pointer-events-none">
          <svg width="240" height="240" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <rect x="3" y="8" width="18" height="13" rx="2"/>
            <path d="M12 8v13"/>
            <path d="M19 8H5"/>
            <path d="M12 8a3 3 0 1 0-3-3c2 0 3 3 3 3z"/>
            <path d="M12 8a3 3 0 1 1 3-3c-2 0-3 3-3 3z"/>
          </svg>
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Left Column: Points & Balance Overview */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-ping" />
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] font-bold text-[#FFD700]">
                KuaGifts Purpose-Locked Remittance & Escrow Vault
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-1">
              {/* Member Gold Points Balance */}
              <div className="bg-black/25 backdrop-blur-xs border border-[#D4AF37]/40 rounded-sm p-4 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase font-mono tracking-widest text-emerald-100/80">
                    Member Rewards Points
                  </span>
                  <Award className="w-4 h-4 text-[#FFD700]" />
                </div>
                <div className="text-3xl font-mono font-black text-[#FFD700] mt-1">
                  14,850 <span className="text-xs font-serif italic text-white/90">PTS</span>
                </div>
                <div className="text-[10px] text-emerald-300 font-mono mt-1 flex items-center space-x-1">
                  <TrendingUp className="w-3 h-3 text-emerald-300" />
                  <span>+450 pts earned on last Melcom Ghana gift</span>
                </div>
              </div>

              {/* Active Remittance Escrow Capacity */}
              <div className="bg-black/25 backdrop-blur-xs border border-white/20 rounded-sm p-4 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase font-mono tracking-widest text-emerald-100/80">
                    Active Gift Card Balances
                  </span>
                  <Gift className="w-4 h-4 text-[#FF6B81]" />
                </div>
                <div className="text-3xl font-mono font-black text-white mt-1">
                  {currency === 'GBP' && '£380.00'}
                  {currency === 'USD' && '$450.00'}
                  {currency === 'EUR' && '€410.00'}
                  {currency === 'CAD' && 'C$580.00'}
                </div>
                <div className="text-[10px] text-[#FFD700] font-mono mt-1">
                  {currency === 'GBP' && '≈ GHS 7,543 / ₦735,490 in Escrow Custody'}
                  {currency === 'USD' && '≈ GHS 7,042 / ₦684,000 in Escrow Custody'}
                  {currency === 'EUR' && '≈ GHS 6,937 / ₦675,680 in Escrow Custody'}
                  {currency === 'CAD' && '≈ GHS 6,641 / ₦646,700 in Escrow Custody'}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Status & Tier Badge */}
          <div className="lg:border-l lg:border-white/15 lg:pl-8 flex flex-col justify-between space-y-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-sm bg-[#D4AF37] text-[#0A1C12] text-[10px] font-mono uppercase tracking-widest font-black shadow-xs">
                  Diaspora Elite Tier
                </span>
                <span className="text-[10px] text-emerald-200 font-mono font-semibold">3.5% Cash-Back</span>
              </div>
              <p className="text-xs text-emerald-50 max-w-xs mt-2 leading-relaxed font-normal">
                Zero remittance transfer fees when locked into verified retail merchant gift cards.
              </p>
            </div>

            <button
              onClick={onSendGift}
              className="w-full sm:w-auto px-6 py-3 rounded-sm bg-[#C41E3A] hover:bg-[#a51830] text-white font-bold text-xs uppercase tracking-widest shadow-lg flex items-center justify-center space-x-2 transition-all active:scale-98 border border-red-400/30"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send New Purpose Gift</span>
            </button>
          </div>

        </div>
      </div>

      {/* Quick Actions: Crisp white tiles with conspicuous Christmas color highlights */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#006837] font-mono">
            Quick Actions & Operations
          </span>
          <span className="text-[10px] text-[#4A5568]/80 font-mono font-medium">KuaGifts Escrow Rails</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          
          {/* Tile 1: Scan & Earn */}
          <button
            id="quick-action-scan-earn"
            onClick={onOpenScanner}
            className="group bg-white hover:bg-emerald-50/40 text-[#0F1C13] p-5 rounded-sm shadow-xs hover:shadow-md border border-slate-200/90 hover:border-[#006837]/50 transition-all text-left flex flex-col justify-between h-32 active:scale-98"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-sm bg-[#006837] text-white flex items-center justify-center shadow-xs">
                <Scan className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#006837] transition-colors" />
            </div>
            <div>
              <div className="font-bold text-xs uppercase tracking-wider text-[#0F1C13] group-hover:text-[#006837] transition-colors">Scan & Earn</div>
              <div className="text-[10px] text-[#4A5568] mt-0.5">POS Barcode Reader</div>
            </div>
          </button>

          {/* Tile 2: Pay & Earn */}
          <button
            id="quick-action-pay-earn"
            onClick={onSendGift}
            className="group bg-white hover:bg-red-50/40 text-[#0F1C13] p-5 rounded-sm shadow-xs hover:shadow-md border border-slate-200/90 hover:border-[#C41E3A]/50 transition-all text-left flex flex-col justify-between h-32 active:scale-98"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-sm bg-[#C41E3A] text-white flex items-center justify-center shadow-xs">
                <CreditCard className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#C41E3A] transition-colors" />
            </div>
            <div>
              <div className="font-bold text-xs uppercase tracking-wider text-[#0F1C13] group-hover:text-[#C41E3A] transition-colors">Pay & Earn</div>
              <div className="text-[10px] text-[#4A5568] mt-0.5">Lock Foreign FX</div>
            </div>
          </button>

          {/* Tile 3: Send Gift */}
          <button
            id="quick-action-send-gift"
            onClick={onSendGift}
            className="group bg-white hover:bg-emerald-50/40 text-[#0F1C13] p-5 rounded-sm shadow-xs hover:shadow-md border border-slate-200/90 hover:border-[#006837]/50 transition-all text-left flex flex-col justify-between h-32 active:scale-98"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-sm bg-emerald-100 text-[#006837] border border-emerald-300 flex items-center justify-center shadow-xs">
                <Send className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#006837] transition-colors" />
            </div>
            <div>
              <div className="font-bold text-xs uppercase tracking-wider text-[#0F1C13] group-hover:text-[#006837] transition-colors">Send Gift</div>
              <div className="text-[10px] text-[#4A5568] mt-0.5">Ghana & Nigeria</div>
            </div>
          </button>

          {/* Tile 4: My Gifts */}
          <button
            id="quick-action-my-gifts"
            onClick={onOpenMyGifts}
            className="group bg-white hover:bg-amber-50/40 text-[#0F1C13] p-5 rounded-sm shadow-xs hover:shadow-md border border-slate-200/90 hover:border-[#D4AF37]/60 transition-all text-left flex flex-col justify-between h-32 active:scale-98"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-sm bg-amber-100 text-[#B8860B] border border-amber-300 flex items-center justify-center shadow-xs">
                <Gift className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#B8860B] transition-colors" />
            </div>
            <div>
              <div className="font-bold text-xs uppercase tracking-wider text-[#0F1C13] group-hover:text-[#B8860B] transition-colors">My Gifts</div>
              <div className="text-[10px] text-[#4A5568] mt-0.5">Receiver Claim Portal</div>
            </div>
          </button>

        </div>
      </div>

      {/* Merchant Grid: Display cards for Melcom, Total Fuel, and Telecom Subscriptions with sharp clean borders */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#006837] font-mono block">
              Verified Retail Coalition Partners
            </span>
            <h2 className="font-editorial text-2xl font-bold text-[#0F1C13] italic mt-0.5">
              Select Merchant to Issue Purpose-Locked Card
            </h2>
          </div>
          <span className="text-[10px] uppercase tracking-wider font-mono text-[#006837] bg-emerald-50 px-2.5 py-1 rounded-sm border border-emerald-200 font-semibold">
            100% Optical Gun Compatible
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MERCHANTS.map((m) => (
            <div
              key={m.id}
              onClick={() => {
                onSelectMerchant(m.id);
                onSendGift();
              }}
              className="group bg-white hover:bg-slate-50/80 border border-slate-200/90 hover:border-[#006837] rounded-sm p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-sm bg-emerald-50 border border-emerald-200 flex items-center justify-center text-2xl shadow-xs">
                      {m.logo}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#0F1C13] group-hover:text-[#006837] transition-colors">
                        {m.name}
                      </h3>
                      <span className="text-[10px] text-[#4A5568] font-mono">
                        {m.country === 'GH' ? '🇬🇭 Ghana' : '🇳🇬 Nigeria'} • {m.category.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] uppercase tracking-widest font-mono text-[#006837] bg-emerald-50 px-2 py-0.5 rounded-sm border border-emerald-200 font-bold">
                    POS
                  </span>
                </div>

                <p className="text-xs text-[#4A5568] mt-3 line-clamp-2 leading-relaxed">
                  {m.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono">
                <span className="text-[#B8860B] font-bold">
                  {m.branches.length} Branches Available
                </span>
                <span className="flex items-center space-x-1 text-[#006837] font-bold group-hover:translate-x-0.5 transition-transform">
                  <span>Send Card</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
