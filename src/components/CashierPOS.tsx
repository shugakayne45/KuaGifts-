/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Scan, 
  ShieldCheck, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  Receipt, 
  DollarSign, 
  ArrowRight, 
  RefreshCw, 
  Sparkles,
  ShoppingBag,
  Store,
  Printer
} from 'lucide-react';
import { MERCHANTS } from '../data/merchantsData.ts';
import { RedemptionRecord, TargetCurrency } from '../types.ts';

interface CashierPOSProps {
  initialBarcode?: string;
  onRedemptionCompleted?: () => void;
}

export const CashierPOS: React.FC<CashierPOSProps> = ({
  initialBarcode = '6189421045238',
  onRedemptionCompleted
}) => {
  const [selectedMerchantId, setSelectedMerchantId] = useState<string>('merch_melcom_gh');
  const [barcodeInput, setBarcodeInput] = useState<string>(initialBarcode);
  const [cashierName, setCashierName] = useState<string>('Kofi Ansah (Lane 04)');
  const [posTerminalId, setPosTerminalId] = useState<string>('POS-MEL-ACC-01');

  // Flow State: 'SCAN' -> 'OTP_VERIFY' -> 'SETTLED'
  const [posStage, setPosStage] = useState<'SCAN' | 'OTP_VERIFY' | 'SETTLED'>('SCAN');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // OTP Session details from backend /api/v1/giftcards/redeem-otp
  const [otpSessionData, setOtpSessionData] = useState<{
    otpSessionId: string;
    giftCardId: string;
    cardNumber: string;
    merchantName: string;
    purposeCategory: string;
    availableBalance: number;
    currency: TargetCurrency;
    receiverName: string;
    maskedPhone: string;
    otpCode: string; // Provided in simulation for testing ease
    expiresInSeconds: number;
  } | null>(null);

  // Redemption Form
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [redeemAmount, setRedeemAmount] = useState<number>(100);
  const [settlementResult, setSettlementResult] = useState<{
    redemptionRecord: RedemptionRecord;
    remainingBalance: number;
    commissionSummary: {
      grossAmount: number;
      commissionRatePercent: number;
      commissionFee: number;
      netMerchantPayout: number;
    };
    settlementReceipt: string;
  } | null>(null);

  // Sync initial barcode
  useEffect(() => {
    if (initialBarcode) {
      setBarcodeInput(initialBarcode);
    }
  }, [initialBarcode]);

  const selectedMerchant = MERCHANTS.find(m => m.id === selectedMerchantId) || MERCHANTS[0];

  // 1. Cashier Scans Barcode -> Triggers Dual-Factor OTP Engine (/api/v1/giftcards/redeem-otp)
  const handleScanBarcode = async () => {
    if (!barcodeInput.trim()) {
      setErrorMsg('Please enter or scan a valid barcode / card number.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/v1/giftcards/redeem-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barcodeOrToken: barcodeInput.trim(),
          posTerminalId,
          cashierName
        })
      });

      const data = await response.json();
      if (data.success) {
        setOtpSessionData(data);
        setRedeemAmount(data.availableBalance);
        setEnteredOtp(data.otpCode); // Pre-fill simulation OTP for convenience
        setPosStage('OTP_VERIFY');
      } else {
        setErrorMsg(data.error || 'Failed to scan card.');
      }
    } catch (err: any) {
      setErrorMsg('POS Network Error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Cashier Submits Customer OTP & Cart Amount -> Verify & Redeem (/api/v1/giftcards/verify-and-redeem)
  const handleVerifyAndRedeem = async () => {
    if (!otpSessionData) return;

    if (!enteredOtp.trim()) {
      setErrorMsg('Please enter the 6-digit customer OTP.');
      return;
    }

    if (redeemAmount <= 0 || redeemAmount > otpSessionData.availableBalance) {
      setErrorMsg(`Amount must be between 1 and ${otpSessionData.availableBalance} ${otpSessionData.currency}`);
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/v1/giftcards/verify-and-redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barcodeOrCard: barcodeInput.trim(),
          otpCode: enteredOtp.trim(),
          amountToRedeem: Number(redeemAmount),
          cashierName,
          posTerminalId
        })
      });

      const data = await response.json();
      if (data.success) {
        setSettlementResult(data);
        setPosStage('SETTLED');
        if (onRedemptionCompleted) {
          onRedemptionCompleted();
        }
      } else {
        setErrorMsg(data.error || 'Redemption rejected by anti-arbitrage engine.');
      }
    } catch (err: any) {
      setErrorMsg('Verification Error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetForNextCustomer = () => {
    setPosStage('SCAN');
    setBarcodeInput('6189421045238');
    setOtpSessionData(null);
    setSettlementResult(null);
    setEnteredOtp('');
    setErrorMsg(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* POS Terminal Header Bar */}
      <div className="bg-white border border-slate-200/90 rounded-sm p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-sm bg-slate-50 border border-slate-200 flex items-center justify-center text-xl shadow-xs">
            🏬
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-editorial text-2xl font-bold text-[#0F1C13] italic">
                Cashier POS Terminal
              </span>
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm bg-emerald-50 text-emerald-800 border border-emerald-200">
                Online
              </span>
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#006837] font-mono font-bold mt-0.5">
              KuaGifts Retail Checkout & Anti-Arbitrage Scanner
            </p>
          </div>
        </div>

        {/* Terminal & Merchant Config */}
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="text-[9px] uppercase tracking-widest font-mono text-[#4A5568] block mb-0.5 font-bold">Store Location</label>
            <select
              value={selectedMerchantId}
              onChange={(e) => {
                setSelectedMerchantId(e.target.value);
                const m = MERCHANTS.find(x => x.id === e.target.value);
                if (m && m.branches[0]) {
                  setPosTerminalId(m.branches[0].posTerminalId);
                }
              }}
              className="bg-slate-50 border border-slate-300 text-xs font-semibold text-[#0F1C13] rounded-sm px-3 py-1.5 focus:outline-none focus:border-[#006837]"
            >
              {MERCHANTS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.country === 'GH' ? '🇬🇭' : '🇳🇬'} {m.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[9px] uppercase tracking-widest font-mono text-[#4A5568] block mb-0.5 font-bold">Terminal ID</label>
            <span className="text-xs font-mono font-bold text-[#006837] px-2.5 py-1.5 rounded-sm bg-emerald-50 border border-emerald-200 block">
              {posTerminalId}
            </span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-sm flex items-center space-x-3 text-red-700 text-xs shadow-xs">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STAGE 1: SCAN BARCODE */}
      {posStage === 'SCAN' && (
        <div className="bg-white border border-slate-200/90 rounded-sm p-6 md:p-8 space-y-6 shadow-xs">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#006837] font-bold block font-mono">
              Step 01 / Optical Scan
            </span>
            <h2 className="font-editorial text-2xl font-bold text-[#0F1C13] italic mt-1">
              Scan Customer Optical Barcode
            </h2>
            <p className="text-xs text-[#4A5568] mt-1">
              Aim optical POS gun at customer's EAN-13 / Code-128 barcode or enter card number manually.
            </p>
          </div>

          {/* Optical Scanner Gun Simulation Box */}
          <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-sm p-8 text-center relative overflow-hidden">
            <div className="absolute inset-x-8 top-1/2 h-0.5 bg-[#C41E3A] shadow-[0_0_8px_#C41E3A] animate-pulse pointer-events-none" />
            
            <div className="max-w-md mx-auto space-y-4 relative z-10">
              <div className="w-14 h-14 bg-white text-[#006837] rounded-sm flex items-center justify-center mx-auto border border-slate-200 shadow-xs">
                <Scan className="w-7 h-7" />
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#006837] font-bold">
                  Laser Gun Input
                </span>
                <input
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  placeholder="Scan EAN-13 (e.g. 6189421045238)"
                  className="w-full bg-white border-2 border-slate-300 rounded-sm px-4 py-3 text-center text-lg font-mono font-bold text-[#0F1C13] focus:outline-none focus:border-[#006837] mt-2 tracking-widest shadow-xs"
                />
              </div>

              {/* Sample Quick Barcode Presets */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <span className="text-[10px] text-[#4A5568] uppercase font-mono font-semibold">Test Codes:</span>
                <button
                  onClick={() => setBarcodeInput('6189421045238')}
                  className="px-2.5 py-1 rounded-sm bg-white text-[#006837] border border-slate-300 text-[10px] font-mono hover:border-[#006837] font-bold shadow-xs"
                >
                  🇬🇭 Melcom (6189421045238)
                </button>
                <button
                  onClick={() => setBarcodeInput('6158291074312')}
                  className="px-2.5 py-1 rounded-sm bg-white text-[#006837] border border-slate-300 text-[10px] font-mono hover:border-[#006837] font-bold shadow-xs"
                >
                  🇳🇬 Shoprite (6158291074312)
                </button>
              </div>

              <button
                id="pos-scan-btn"
                onClick={handleScanBarcode}
                disabled={isLoading}
                className="w-full py-3.5 rounded-sm bg-[#C41E3A] hover:bg-[#a51830] text-white font-bold text-xs uppercase tracking-widest shadow-md transition-all flex items-center justify-center space-x-2 active:scale-98 disabled:opacity-50"
              >
                <Scan className="w-4 h-4" />
                <span>{isLoading ? 'Checking Escrow Vault...' : 'Scan & Trigger Dual-Factor OTP'}</span>
              </button>
            </div>
          </div>

          <div className="bg-emerald-50/70 p-4 rounded-sm border border-emerald-200 flex items-center space-x-3 text-xs text-[#0F1C13]">
            <ShieldCheck className="w-5 h-5 text-[#006837] shrink-0" />
            <span>
              <strong>Anti-Arbitrage Security Rail:</strong> When you scan, the system dispatches an instant SMS OTP to the customer's registered phone number to prevent unauthorized screenshot redemptions.
            </span>
          </div>
        </div>
      )}

      {/* STAGE 2: DUAL-FACTOR OTP & REDEMPTION CONFIRMATION */}
      {posStage === 'OTP_VERIFY' && otpSessionData && (
        <div className="bg-white border border-slate-200/90 rounded-sm p-6 md:p-8 space-y-6 shadow-xs">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#006837] font-bold">
                Card Validated & Purpose-Locked
              </span>
              <h2 className="font-editorial text-2xl md:text-3xl font-bold text-[#0F1C13] italic mt-1">
                Enter Customer 1-Time OTP
              </h2>
            </div>
            <button
              onClick={() => setPosStage('SCAN')}
              className="text-[10px] uppercase tracking-widest font-mono text-[#006837] hover:underline font-bold"
            >
              ← Cancel / Re-scan
            </button>
          </div>

          {/* Card Summary Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-5 rounded-sm border border-slate-200">
            <div>
              <span className="text-[9px] uppercase font-mono text-[#4A5568] block">Cardholder</span>
              <div className="font-bold text-sm text-[#0F1C13]">{otpSessionData.receiverName}</div>
              <div className="text-xs text-[#006837] font-mono font-bold">{otpSessionData.maskedPhone}</div>
            </div>

            <div>
              <span className="text-[9px] uppercase font-mono text-[#4A5568] block">Purpose Category</span>
              <div className="font-bold text-sm text-emerald-800">{otpSessionData.purposeCategory}</div>
              <div className="text-[10px] text-[#4A5568]">Zero cash-out permitted</div>
            </div>

            <div className="text-right">
              <span className="text-[9px] uppercase font-mono text-[#4A5568] block">Available Balance</span>
              <div className="text-xl font-black font-mono text-[#006837]">
                {otpSessionData.currency} {otpSessionData.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Interactive Simulation Helper Alert */}
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-sm flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Simulated SMS Alert:</strong> OTP <strong>{otpSessionData.otpCode}</strong> dispatched to recipient's mobile ({otpSessionData.maskedPhone}).
              </span>
            </div>
            <button
              onClick={() => setEnteredOtp(otpSessionData.otpCode)}
              className="px-2.5 py-1 rounded-sm bg-amber-200/80 text-amber-900 border border-amber-300 font-mono font-bold hover:bg-amber-300 text-[10px] uppercase tracking-wider"
            >
              Fill OTP
            </button>
          </div>

          {/* Cashier Checkout Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-bold text-[#006837] uppercase tracking-[0.2em] mb-2 font-mono">
                Cart Total to Deduct ({otpSessionData.currency})
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-sm font-bold text-[#006837] font-mono">{otpSessionData.currency}</span>
                <input
                  type="number"
                  min="1"
                  max={otpSessionData.availableBalance}
                  value={redeemAmount}
                  onChange={(e) => setRedeemAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border-2 border-slate-300 rounded-sm pl-14 pr-4 py-3 text-lg font-mono font-bold text-[#0F1C13] focus:outline-none focus:border-[#006837]"
                />
              </div>
              <p className="text-[9px] text-[#4A5568] mt-1">
                *Supports partial basket redemption. Remaining balance stays in card.
              </p>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#C41E3A] uppercase tracking-[0.2em] mb-2 font-mono">
                6-Digit Customer Checkout OTP
              </label>
              <input
                type="text"
                maxLength={6}
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value)}
                placeholder="0 0 0 0 0 0"
                className="w-full bg-slate-50 border-2 border-slate-300 rounded-sm px-4 py-3 text-center text-xl font-mono font-black text-[#0F1C13] tracking-[0.5em] focus:outline-none focus:border-[#C41E3A]"
              />
              <p className="text-[9px] text-[#4A5568] mt-1 text-center">
                Ask customer for the verification code displayed on their phone screen.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setPosStage('SCAN')}
              className="text-[10px] uppercase tracking-widest font-mono text-[#4A5568] hover:text-[#0F1C13]"
            >
              ← Cancel
            </button>

            <button
              id="pos-verify-redeem-btn"
              onClick={handleVerifyAndRedeem}
              disabled={isLoading}
              className="px-8 py-3.5 rounded-sm bg-[#006837] hover:bg-[#00522c] text-white font-bold text-xs uppercase tracking-widest shadow-md transition-all flex items-center space-x-2 active:scale-98 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isLoading ? 'Verifying & Releasing Escrow...' : `Approve & Deduct ${otpSessionData.currency} ${redeemAmount}`}</span>
            </button>
          </div>

        </div>
      )}

      {/* STAGE 3: SETTLEMENT RECEIPT */}
      {posStage === 'SETTLED' && settlementResult && (
        <div className="bg-white border border-slate-200/90 rounded-sm p-6 md:p-8 space-y-6 shadow-xs">
          
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-emerald-50 text-[#006837] rounded-full flex items-center justify-center mx-auto border-2 border-emerald-300 shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="font-editorial text-3xl font-bold text-[#0F1C13] italic">
              Redemption Approved & Escrow Released
            </h2>
            <p className="text-xs text-[#006837] font-mono font-bold">
              Receipt # {settlementResult.settlementReceipt}
            </p>
          </div>

          {/* Cashier Slip Printout Styling */}
          <div className="bg-slate-50 text-[#0F1C13] rounded-sm p-6 font-mono text-xs max-w-lg mx-auto shadow-xs border-2 border-dashed border-slate-300 space-y-3">
            <div className="text-center border-b-2 border-slate-300 pb-3">
              <h3 className="font-black text-sm uppercase">{selectedMerchant.name}</h3>
              <p className="text-[10px] text-[#4A5568]">{posTerminalId} • {cashierName}</p>
              <p className="text-[9px] text-[#4A5568]">{new Date(settlementResult.redemptionRecord.timestamp).toLocaleString()}</p>
            </div>

            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between">
                <span>CARD NUMBER:</span>
                <span className="font-bold">{settlementResult.redemptionRecord.cardNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>CUSTOMER:</span>
                <span>{settlementResult.redemptionRecord.receiverPhone}</span>
              </div>
              <div className="flex justify-between">
                <span>OTP VERIFIED:</span>
                <span className="font-bold text-emerald-800">AUTH-{settlementResult.redemptionRecord.verifiedOtp}</span>
              </div>
            </div>

            <div className="border-t-2 border-dashed border-slate-300 pt-2 space-y-1.5">
              <div className="flex justify-between text-sm font-black">
                <span>GROSS REDEEMED:</span>
                <span>{settlementResult.redemptionRecord.currency} {settlementResult.commissionSummary.grossAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-[#4A5568]">
                <span>COALITION COMMISSION ({settlementResult.commissionSummary.commissionRatePercent}%):</span>
                <span>- {settlementResult.redemptionRecord.currency} {settlementResult.commissionSummary.commissionFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-black border-t border-slate-300 pt-1 text-emerald-800">
                <span>NET MERCHANT PAYOUT:</span>
                <span>{settlementResult.redemptionRecord.currency} {settlementResult.commissionSummary.netMerchantPayout.toFixed(2)}</span>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-2 flex justify-between text-[11px]">
              <span>REMAINING CARD BALANCE:</span>
              <span className="font-bold">{settlementResult.redemptionRecord.currency} {settlementResult.remainingBalance.toFixed(2)}</span>
            </div>

            <div className="text-center pt-3 border-t border-slate-300 text-[10px] text-[#4A5568]">
              SETTLED VIA KUAGIFTS ESCROW RAILS (POINTS AFRICA NETWORK)
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={() => window.print()}
              className="w-full sm:w-auto px-6 py-3 rounded-sm bg-white border border-slate-300 text-[#0F1C13] font-bold text-xs uppercase tracking-widest flex items-center justify-center space-x-2 hover:bg-slate-50 shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print Cashier Receipt</span>
            </button>

            <button
              onClick={handleResetForNextCustomer}
              className="w-full sm:w-auto px-6 py-3 rounded-sm bg-[#C41E3A] hover:bg-[#a51830] text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center space-x-2 shadow-md"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Scan Next Customer</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
