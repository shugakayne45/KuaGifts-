/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Copy, Check, Sun, QrCode, BarChart3, Sparkles, ShieldCheck } from 'lucide-react';
import QRCode from 'qrcode';

interface BarcodeCardProps {
  ean13Code: string;
  cardNumber: string;
  merchantName: string;
  currency: string;
  balance: number;
  purposeLabel: string;
  claimToken: string;
}

export const BarcodeCard: React.FC<BarcodeCardProps> = ({
  ean13Code,
  cardNumber,
  merchantName,
  currency,
  balance,
  purposeLabel,
  claimToken
}) => {
  const [copied, setCopied] = useState(false);
  const [brightnessBoost, setBrightnessBoost] = useState(false);
  const [viewMode, setViewMode] = useState<'ean13' | 'qr'>('ean13');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Generate QR Code data
  useEffect(() => {
    const payload = JSON.stringify({
      app: 'KuaGifts',
      ean: ean13Code,
      card: cardNumber,
      token: claimToken,
      posDirect: `${window.location.origin}?posScan=${ean13Code}`
    });

    QRCode.toDataURL(payload, {
      width: 260,
      margin: 1,
      color: {
        dark: '#0F1C13',
        light: '#FFFFFF'
      }
    })
      .then((url: string) => setQrDataUrl(url))
      .catch((err: any) => console.error('QR generation error:', err));
  }, [ean13Code, cardNumber, claimToken]);

  const copyCode = () => {
    navigator.clipboard.writeText(ean13Code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate standard SVG pattern for EAN-13
  // EAN-13 structure: Left guard (101), 6 Left digits, Center guard (01010), 6 Right digits, Right guard (101)
  const renderSvgBarcode = () => {
    // Generate bars deterministically from EAN digits
    const bars: boolean[] = [];
    
    // Left Guard: 101
    bars.push(true, false, true);

    // 6 Left Characters
    for (let i = 0; i < 6; i++) {
      const digit = parseInt(ean13Code[i] || '0', 10);
      const pattern = [
        [false, false, false, true, true, false, true],
        [false, false, true, true, false, false, true],
        [false, false, true, false, false, true, true],
        [false, true, true, true, true, false, true],
        [false, true, false, false, false, true, true],
        [false, true, true, false, false, false, true],
        [false, true, false, true, true, true, true],
        [false, true, true, true, false, true, true],
        [false, true, true, false, true, true, true],
        [false, false, false, true, false, true, true]
      ][digit % 10];
      bars.push(...pattern);
    }

    // Center Guard: 01010
    bars.push(false, true, false, true, false);

    // 6 Right Characters
    for (let i = 6; i < 12; i++) {
      const digit = parseInt(ean13Code[i] || '0', 10);
      const pattern = [
        [true, true, true, false, false, true, false],
        [true, true, false, false, true, true, false],
        [true, true, false, true, true, false, false],
        [true, false, false, false, false, true, false],
        [true, false, true, true, true, false, false],
        [true, false, false, true, true, true, false],
        [true, false, true, false, false, false, false],
        [true, false, false, false, true, false, false],
        [true, false, false, true, false, false, false],
        [true, true, true, false, true, false, false]
      ][digit % 10];
      bars.push(...pattern);
    }

    // Right Guard: 101
    bars.push(true, false, true);

    const barWidth = 2.4;
    const totalWidth = bars.length * barWidth;
    const height = 80;

    return (
      <svg
        viewBox={`0 0 ${totalWidth} ${height + 25}`}
        className="w-full max-w-[340px] h-auto mx-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        <rect width={totalWidth} height={height + 25} fill="#FFFFFF" />
        {bars.map((isBar, idx) => {
          if (!isBar) return null;
          // Guard bars are taller
          const isGuard = idx < 3 || (idx >= 45 && idx < 50) || idx >= 92;
          const barHeight = isGuard ? height + 10 : height;
          return (
            <rect
              key={idx}
              x={idx * barWidth}
              y={5}
              width={barWidth}
              height={barHeight}
              fill="#0F1C13"
            />
          );
        })}
        {/* Human Readable digits beneath */}
        <text
          x={totalWidth / 2}
          y={height + 20}
          fill="#0F1C13"
          fontSize="14"
          fontWeight="bold"
          fontFamily="JetBrains Mono, monospace"
          textAnchor="middle"
          letterSpacing="3"
        >
          {ean13Code.slice(0, 1)} {ean13Code.slice(1, 7)} {ean13Code.slice(7, 13)}
        </text>
      </svg>
    );
  };

  return (
    <div className={`relative transition-all duration-300 ${brightnessBoost ? 'filter drop-shadow-2xl scale-[1.02]' : ''}`}>
      
      {/* Scanner Card Container with high-contrast white inner plate for optical gun compatibility */}
      <div className="bg-[#FFFFFF] text-[#0F1C13] rounded-sm p-6 shadow-2xl border-2 border-[#D4AF37] relative overflow-hidden">
        
        {/* Decorative Luxury Festive Stamp */}
        <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
          <div className="w-18 h-18 bg-gradient-to-br from-[#C41E3A] to-[#8B0000] text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white transform rotate-12">
            <div className="text-center">
              <span className="text-[9px] font-bold uppercase tracking-wider block">Valid</span>
              <span className="text-[11px] font-black font-mono">100%</span>
            </div>
          </div>
        </div>

        {/* Card Header */}
        <div className="border-b border-[#0F1C13]/10 pb-4 mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-base">🎄</span>
            <span className="font-editorial text-xl font-bold tracking-tight text-[#0F1C13] italic">
              Kua<span className="text-[#C41E3A]">Gifts</span> Purpose Card
            </span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div>
              <span className="text-[9px] uppercase font-bold tracking-[0.2em] font-mono text-[#0F1C13]/50">Merchant Partner</span>
              <h3 className="text-base font-extrabold text-[#0F1C13] leading-tight">{merchantName}</h3>
            </div>
            <div className="text-right">
              <span className="text-[9px] uppercase font-bold tracking-[0.2em] font-mono text-[#0F1C13]/50">Balance Available</span>
              <div className="text-xl font-black font-mono text-[#C41E3A]">
                {currency} {balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>

        {/* Purpose Lock Badge */}
        <div className="bg-[#0F1C13]/5 border border-[#0F1C13]/10 rounded-sm p-2.5 mb-5 flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="text-xs font-semibold text-[#0F1C13]/80">
            Locked Category: <strong className="text-[#0F1C13]">{purposeLabel}</strong>
          </span>
        </div>

        {/* Barcode/QR View Switcher */}
        <div className="flex justify-center space-x-2 mb-4">
          <button
            onClick={() => setViewMode('ean13')}
            className={`px-3 py-1 text-xs font-bold rounded-sm uppercase tracking-wider flex items-center space-x-1.5 transition-all ${
              viewMode === 'ean13'
                ? 'bg-[#0F1C13] text-[#F4F3EF]'
                : 'bg-[#F4F3EF] text-[#0F1C13] hover:bg-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>EAN-13 Laser Barcode</span>
          </button>
          <button
            onClick={() => setViewMode('qr')}
            className={`px-3 py-1 text-xs font-bold rounded-sm uppercase tracking-wider flex items-center space-x-1.5 transition-all ${
              viewMode === 'qr'
                ? 'bg-[#0F1C13] text-[#F4F3EF]'
                : 'bg-[#F4F3EF] text-[#0F1C13] hover:bg-slate-200'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Digital QR Code</span>
          </button>
        </div>

        {/* Optical Barcode Scanning Stage with laser line */}
        <div className="relative bg-[#FFFFFF] p-4 rounded-sm border-2 border-dashed border-[#0F1C13]/20 flex flex-col items-center justify-center my-2 min-h-[160px]">
          
          {/* Animated Red Laser Scan Line */}
          <div className="absolute inset-x-4 top-1/2 h-0.5 bg-[#C41E3A] opacity-75 shadow-[0_0_8px_#C41E3A] animate-pulse pointer-events-none" />

          {viewMode === 'ean13' ? (
            renderSvgBarcode()
          ) : (
            <div className="flex flex-col items-center">
              {qrDataUrl && <img src={qrDataUrl} alt="KuaGifts POS QR Code" className="w-48 h-48 rounded-sm shadow-sm" />}
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold text-[#0F1C13] mt-2">
                SCAN FOR CASHIER TERMINAL
              </span>
            </div>
          )}
        </div>

        {/* Card Number & Action Bar */}
        <div className="mt-4 pt-3 border-t border-[#0F1C13]/10 flex items-center justify-between">
          <div>
            <span className="text-[9px] text-[#0F1C13]/50 uppercase font-mono tracking-widest block">Card Serial</span>
            <span className="text-xs font-bold font-mono tracking-wider text-[#0F1C13]">{cardNumber}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={copyCode}
              title="Copy EAN barcode code"
              className="p-2 rounded-sm bg-[#0F1C13]/5 hover:bg-[#0F1C13]/10 text-[#0F1C13] text-xs font-semibold flex items-center space-x-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={() => setBrightnessBoost(!brightnessBoost)}
              title="Boost display contrast for cashier scanner guns"
              className={`p-2 rounded-sm text-xs font-semibold flex items-center space-x-1 transition-all ${
                brightnessBoost
                  ? 'bg-[#D4AF37] text-[#0F1C13] font-bold'
                  : 'bg-[#0F1C13]/5 hover:bg-[#0F1C13]/10 text-[#0F1C13]'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>{brightnessBoost ? 'Max Brightness' : 'Boost Screen'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* POS Cashier Tip Footer */}
      <div className="mt-2 text-center text-[11px] text-[#4A5568]">
        Present this barcode directly to the cashier at checkout. Cashier will trigger a 1-time OTP to your phone.
      </div>
    </div>
  );
};
