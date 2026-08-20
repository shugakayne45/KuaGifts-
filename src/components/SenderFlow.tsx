/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  ShieldAlert, 
  Sparkles, 
  Clock, 
  Send, 
  CreditCard, 
  Share2, 
  Copy, 
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import { 
  CountryCode, 
  PurposeCategory, 
  SourceCurrency, 
  TargetCurrency, 
  Merchant, 
  Order, 
  GiftCard 
} from '../types.ts';
import { 
  MERCHANTS, 
  PURPOSE_CONFIG, 
  FX_BASE_RATES, 
  getLockedQuote 
} from '../data/merchantsData.ts';
import { AudioVoiceRecorder } from './AudioVoiceRecorder.tsx';

interface SenderFlowProps {
  currency: SourceCurrency;
  initialMerchantId?: string;
  onOrderCreated: (order: Order, giftCard: GiftCard, claimUrl: string) => void;
  onJumpToReceiver: (claimToken: string) => void;
}

const HOLIDAY_PHOTO_PRESETS = [
  {
    id: 'photo_xmas_tree',
    title: 'Festive Christmas Tree & Gold Gifts',
    url: 'https://images.unsplash.com/photo-1513297887119-d46091b24bfa?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'photo_hamper',
    title: 'West African Festive Feast & Hampers',
    url: 'https://images.unsplash.com/photo-1543258103-a62bdc06e871?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'photo_warmth',
    title: 'Holiday Family Joy & Celebration',
    url: 'https://images.unsplash.com/photo-1576919228236-a097c32a5cd4?w=800&auto=format&fit=crop&q=80'
  }
];

export const SenderFlow: React.FC<SenderFlowProps> = ({
  currency,
  initialMerchantId,
  onOrderCreated,
  onJumpToReceiver
}) => {
  // Wizard Steps: 1: Destination & Category, 2: Merchant, 3: Amount & FX Lock, 4: Personal Media, 5: Payment & Result
  const [step, setStep] = useState<number>(initialMerchantId ? 2 : 1);
  const [country, setCountry] = useState<CountryCode>('GH');
  const [purposeCategory, setPurposeCategory] = useState<PurposeCategory>('HOLIDAY_HAMPER');
  const [selectedMerchantId, setSelectedMerchantId] = useState<string>(initialMerchantId || 'merch_melcom_gh');
  
  // Amount & FX
  const [amount, setAmount] = useState<number>(100);
  const [fxTimer, setFxTimer] = useState<number>(900); // 15 mins

  // Sender & Receiver details
  const [senderName, setSenderName] = useState<string>('Kwame Mensah');
  const [senderEmail, setSenderEmail] = useState<string>('kwame.mensah@london-diaspora.co.uk');
  const [receiverName, setReceiverName] = useState<string>('Mama Akosua Mensah');
  const [receiverPhone, setReceiverPhone] = useState<string>('+233 24 498 1204');
  const [personalMessage, setPersonalMessage] = useState<string>(
    'Merry Christmas Mama! Please go to Melcom Accra Mall and pick up the royal holiday hamper and provisions for the family.'
  );
  
  // Media
  const [voiceNoteUrl, setVoiceNoteUrl] = useState<string>('https://actions.google.com/sounds/v1/holidays/deck_the_halls_music_box.ogg');
  const [voiceDuration, setVoiceDuration] = useState<number>(18);
  const [selectedPhoto, setSelectedPhoto] = useState<string>(HOLIDAY_PHOTO_PRESETS[0].url);
  
  // Processing & Result State
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [createdResult, setCreatedResult] = useState<{
    order: Order;
    giftCard: GiftCard;
    claimUrl: string;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const targetCurrency: TargetCurrency = country === 'GH' ? 'GHS' : 'NGN';
  const currentQuote = getLockedQuote(currency, targetCurrency, amount);
  const targetAmount = +(amount * currentQuote.rate).toFixed(2);

  // FX Timer Countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setFxTimer((prev) => (prev > 0 ? prev - 1 : 900));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter merchants based on country and category
  const filteredMerchants = MERCHANTS.filter(
    (m) => m.country === country && (purposeCategory ? m.category === purposeCategory || m.category === 'GROCERIES_FOOD' || m.category === 'HOLIDAY_HAMPER' : true)
  );

  const selectedMerchant = MERCHANTS.find((m) => m.id === selectedMerchantId) || filteredMerchants[0] || MERCHANTS[0];

  // Adjust defaults when country changes
  const handleCountryChange = (newCountry: CountryCode) => {
    setCountry(newCountry);
    if (newCountry === 'GH') {
      setSelectedMerchantId('merch_melcom_gh');
      setReceiverPhone('+233 24 498 1204');
      setReceiverName('Mama Akosua Mensah');
      setAmount(100);
    } else {
      setSelectedMerchantId('merch_shoprite_ng');
      setReceiverPhone('+234 803 555 9012');
      setReceiverName('Uncle Chidi Okafor');
      setAmount(150);
    }
  };

  const handleAudioReady = (url: string, durationSec: number) => {
    setVoiceNoteUrl(url);
    setVoiceDuration(durationSec);
  };

  const handleSubmitEscrowOrder = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/v1/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName,
          senderEmail,
          receiverName,
          receiverPhone,
          receiverCountry: country,
          merchantId: selectedMerchant.id,
          purposeCategory,
          sourceCurrency: currency,
          sourceAmount: amount,
          voiceNoteUrl,
          voiceDurationSeconds: voiceDuration,
          photoUrl: selectedPhoto,
          personalMessage
        })
      });

      const data = await response.json();
      if (data.success) {
        setCreatedResult(data.data);
        onOrderCreated(data.data.order, data.data.giftCard, data.data.claimUrl);
        setStep(5);
      } else {
        alert('Order creation failed: ' + data.error);
      }
    } catch (err: any) {
      console.error('Error creating escrow order:', err);
      alert('Network or server error creating order: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const copyClaimLink = () => {
    if (createdResult) {
      navigator.clipboard.writeText(createdResult.claimUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Editorial Hero Banner */}
      <div className="relative rounded-sm bg-gradient-to-br from-[#006837] via-[#05572f] to-[#033b1e] border border-emerald-600/30 p-6 md:p-10 shadow-xl overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-sm bg-[#D4AF37] text-[#0A1C12] text-[10px] font-bold uppercase tracking-[0.2em] mb-4 shadow-xs">
            <Sparkles className="w-3 h-3 text-[#0A1C12]" />
            <span>Christmas & Year-Round Purpose-Locked Escrow</span>
          </div>
          
          <h1 className="font-editorial text-3xl md:text-5xl font-bold text-white leading-tight italic">
            Send purpose-locked holiday gifts to Ghana & Nigeria with <span className="text-[#FFD700]">guaranteed delivery</span>.
          </h1>
          
          <p className="text-xs md:text-sm text-emerald-50 max-w-2xl mt-3 leading-relaxed">
            Funds are locked in a ring-fenced PSP escrow account and redeemable exclusively as verified optical barcodes at retail checkout counters. Zero cash diversion.
          </p>

          {/* Stepper Dots with Clean Precision */}
          <div className="flex items-center space-x-2 mt-8">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-sm transition-all duration-300 ${
                  step === s
                    ? 'w-10 bg-[#FFD700]'
                    : step > s
                    ? 'w-4 bg-white'
                    : 'w-4 bg-emerald-900/60'
                }`}
              />
            ))}
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#FFD700] font-bold ml-2 font-mono">
              {step === 1 && 'Step 1: Destination & Purpose'}
              {step === 2 && 'Step 2: Choose Verified Merchant'}
              {step === 3 && 'Step 3: Lock FX & Recipient'}
              {step === 4 && 'Step 4: Voice Note & Holiday Media'}
              {step === 5 && 'Order Completed & Locked in Escrow'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Flow Content */}
      {step === 1 && (
        <div className="bg-white border border-slate-200/90 rounded-sm p-6 md:p-8 space-y-6 shadow-xs">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#006837] font-bold block font-mono">
              Step 01 / Escrow Config
            </span>
            <h2 className="font-editorial text-2xl font-bold text-[#0F1C13] italic mt-1">
              Choose Recipient Destination & Purpose Lock
            </h2>
            <p className="text-xs text-[#4A5568] mt-1">
              Select where your loved ones reside and restrict the gift card category to prevent cash-out diversion.
            </p>
          </div>

          {/* Country Switcher */}
          <div className="grid grid-cols-2 gap-4">
            <button
              id="country-select-gh"
              onClick={() => handleCountryChange('GH')}
              className={`flex items-center space-x-4 p-5 rounded-sm border transition-all text-left ${
                country === 'GH'
                  ? 'bg-emerald-50/70 border-[#006837] shadow-xs ring-1 ring-[#006837]'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className="text-3xl select-none">🇬🇭</span>
              <div>
                <div className="font-bold text-sm text-[#0F1C13] tracking-wide">Ghana</div>
                <div className="text-[10px] text-[#006837] font-mono uppercase tracking-wider font-semibold">Currency: Ghanaian Cedi (GHS)</div>
              </div>
            </button>

            <button
              id="country-select-ng"
              onClick={() => handleCountryChange('NG')}
              className={`flex items-center space-x-4 p-5 rounded-sm border transition-all text-left ${
                country === 'NG'
                  ? 'bg-emerald-50/70 border-[#006837] shadow-xs ring-1 ring-[#006837]'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className="text-3xl select-none">🇳🇬</span>
              <div>
                <div className="font-bold text-sm text-[#0F1C13] tracking-wide">Nigeria</div>
                <div className="text-[10px] text-[#006837] font-mono uppercase tracking-wider font-semibold">Currency: Nigerian Naira (NGN)</div>
              </div>
            </button>
          </div>

          {/* Purpose Lock Categories */}
          <div>
            <label className="block text-[10px] font-bold text-[#006837] uppercase tracking-[0.2em] mb-3 font-mono">
              Restricted Purpose Category
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(Object.keys(PURPOSE_CONFIG) as PurposeCategory[]).map((key) => {
                const config = PURPOSE_CONFIG[key];
                const isSelected = purposeCategory === key;
                return (
                  <button
                    key={key}
                    id={`purpose-category-${key}`}
                    onClick={() => setPurposeCategory(key)}
                    className={`flex flex-col p-4 rounded-sm border text-left transition-all relative ${
                      isSelected
                        ? 'bg-red-50/50 border-[#C41E3A] shadow-xs ring-1 ring-[#C41E3A]'
                        : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl select-none">{config.icon}</span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-[#C41E3A] animate-ping" />
                      )}
                    </div>
                    <div className="font-bold text-sm text-[#0F1C13]">{config.label}</div>
                    <div className="text-[11px] text-[#4A5568] mt-1 leading-snug">{config.description}</div>
                    <div className="mt-3 pt-2 border-t border-slate-200 text-[9px] font-mono uppercase tracking-wider text-[#B8860B] font-bold">
                      {config.antiArbitrageRule}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={() => setStep(2)}
              className="flex items-center space-x-2 px-6 py-3 rounded-sm bg-[#C41E3A] hover:bg-[#a51830] text-white font-bold text-xs uppercase tracking-widest shadow-md transition-all active:scale-98"
            >
              <span>Next: Select Verified Merchant</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white border border-slate-200/90 rounded-sm p-6 md:p-8 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#006837] font-bold block font-mono">
                Step 02 / Merchant Verification
              </span>
              <h2 className="font-editorial text-2xl font-bold text-[#0F1C13] italic mt-1">
                Select Verified Retailer / Merchant
              </h2>
              <p className="text-xs text-[#4A5568] mt-1">
                Coalition network merchants with optical POS barcode scanners in {country === 'GH' ? 'Ghana 🇬🇭' : 'Nigeria 🇳🇬'}.
              </p>
            </div>
            <button
              onClick={() => setStep(1)}
              className="text-[10px] uppercase tracking-widest font-mono text-[#006837] hover:underline font-bold"
            >
              ← Back
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMerchants.map((merchant) => {
              const isSelected = selectedMerchantId === merchant.id;
              return (
                <div
                  key={merchant.id}
                  id={`merchant-card-${merchant.id}`}
                  onClick={() => setSelectedMerchantId(merchant.id)}
                  className={`p-5 rounded-sm border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-50/50 border-[#006837] shadow-xs ring-1 ring-[#006837]'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl p-2 bg-emerald-50 rounded-sm border border-emerald-200">
                        {merchant.logo}
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <h3 className="font-bold text-sm text-[#0F1C13]">{merchant.name}</h3>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                        <p className="text-[11px] text-[#B8860B] italic line-clamp-1 font-semibold">{merchant.tagline}</p>
                      </div>
                    </div>
                    <span className="text-[9px] uppercase tracking-widest font-mono px-2 py-0.5 rounded-sm bg-emerald-100 text-[#006837] font-bold border border-emerald-200">
                      POS Verified
                    </span>
                  </div>

                  <p className="text-xs text-[#4A5568] mt-3 leading-relaxed">
                    {merchant.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-[#4A5568]">
                      {merchant.branches.length} Verified Hypermarket Branches
                    </span>
                    <span className="text-[#006837] font-bold">
                      Guns: {merchant.supportedPosBarcodes.join(', ')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <button
              onClick={() => setStep(1)}
              className="text-[10px] uppercase tracking-widest font-mono text-[#4A5568] hover:text-[#006837] font-semibold"
            >
              ← Back to Purpose
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex items-center space-x-2 px-6 py-3 rounded-sm bg-[#C41E3A] hover:bg-[#a51830] text-white font-bold text-xs uppercase tracking-widest shadow-md transition-all active:scale-98"
            >
              <span>Next: Lock FX Rate & Recipient</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="bg-white border border-slate-200/90 rounded-sm p-6 md:p-8 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#006837] font-bold block font-mono">
                Step 03 / FX Collateralization
              </span>
              <h2 className="font-editorial text-2xl font-bold text-[#0F1C13] italic mt-1">
                Guaranteed FX Lock & Recipient Phone
              </h2>
              <p className="text-xs text-[#4A5568] mt-1">
                Locks exchange rate into custodial PSP escrow. Dual-factor OTP will bind to receiver's phone number.
              </p>
            </div>
            <button onClick={() => setStep(2)} className="text-[10px] uppercase tracking-widest font-mono text-[#006837] hover:underline font-bold">
              ← Back
            </button>
          </div>

          {/* Guaranteed FX Rate Banner */}
          <div className="bg-gradient-to-r from-emerald-900 to-[#006837] text-white rounded-sm p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-emerald-700/50 pb-3 mb-3">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-[#FFD700] animate-spin" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-emerald-100">Live Escrow FX Rate Lock</span>
              </div>
              <div className="text-xs font-mono text-[#FFD700] font-bold">
                Guaranteed for: {Math.floor(fxTimer / 60)}:{(fxTimer % 60).toString().padStart(2, '0')}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <div>
                <span className="text-[10px] text-emerald-200 uppercase font-bold tracking-widest block mb-1">Send Amount ({currency})</span>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-[#FFD700] font-mono">{currency}</span>
                  <input
                    type="number"
                    min="10"
                    max="5000"
                    value={amount}
                    onChange={(e) => setAmount(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-emerald-950/60 border border-emerald-600/40 rounded-sm pl-14 pr-4 py-2 text-base font-bold text-white font-mono focus:outline-none focus:border-[#FFD700]"
                  />
                </div>
              </div>

              <div className="text-center sm:border-x sm:border-emerald-700/50 py-2">
                <span className="text-[10px] text-[#FFD700] uppercase font-bold tracking-widest block">Locked Exchange Rate</span>
                <span className="text-sm font-mono font-bold text-white">
                  1 {currency} = {currentQuote.rate.toLocaleString()} {targetCurrency}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-emerald-200 block mt-0.5 font-mono">Zero Hidden Sender Markup</span>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-emerald-200 uppercase font-bold tracking-widest block mb-1">Locked In Escrow</span>
                <div className="text-xl font-black font-mono text-[#FFD700]">
                  {targetCurrency} {targetAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>

          {/* Sender and Receiver Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            
            {/* Sender Info */}
            <div className="space-y-3 bg-slate-50/80 p-4 rounded-sm border border-slate-200">
              <span className="text-[10px] font-bold text-[#006837] uppercase tracking-[0.2em] block font-mono">
                Sender (Diaspora)
              </span>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-[#4A5568] block mb-1 font-medium">Your Full Name</label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-sm px-3 py-2 text-xs text-[#0F1C13] focus:outline-none focus:border-[#006837]"
                  placeholder="e.g. Kwame Mensah"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-[#4A5568] block mb-1 font-medium">Your Email (Escrow Receipt)</label>
                <input
                  type="email"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-sm px-3 py-2 text-xs text-[#0F1C13] focus:outline-none focus:border-[#006837]"
                  placeholder="kwame@example.com"
                />
              </div>
            </div>

            {/* Receiver Info */}
            <div className="space-y-3 bg-slate-50/80 p-4 rounded-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#C41E3A] uppercase tracking-[0.2em] font-mono">
                  Receiver in {country === 'GH' ? 'Ghana 🇬🇭' : 'Nigeria 🇳🇬'}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-[#006837] font-mono font-bold">OTP Bound</span>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-[#4A5568] block mb-1 font-medium">Recipient Name</label>
                <input
                  type="text"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-sm px-3 py-2 text-xs text-[#0F1C13] focus:outline-none focus:border-[#006837]"
                  placeholder="e.g. Mama Akosua Mensah"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-[#4A5568] block mb-1 font-medium">
                  Recipient Mobile Phone ({country === 'GH' ? '+233...' : '+234...'})
                </label>
                <input
                  type="tel"
                  value={receiverPhone}
                  onChange={(e) => setReceiverPhone(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-sm px-3 py-2 text-xs text-[#0F1C13] font-mono focus:outline-none focus:border-[#006837]"
                  placeholder={country === 'GH' ? '+233 24 498 1204' : '+234 803 555 9012'}
                />
                <p className="text-[9px] text-[#4A5568] mt-1">
                  *Anti-arbitrage counter OTP is sent directly to this phone number at the cash register.
                </p>
              </div>
            </div>

          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <button onClick={() => setStep(2)} className="text-[10px] uppercase tracking-widest font-mono text-[#4A5568] hover:text-[#006837] font-semibold">
              ← Back to Merchant
            </button>
            <button
              onClick={() => setStep(4)}
              className="flex items-center space-x-2 px-6 py-3 rounded-sm bg-[#C41E3A] hover:bg-[#a51830] text-white font-bold text-xs uppercase tracking-widest shadow-md transition-all active:scale-98"
            >
              <span>Next: Attach Holiday Voice Note</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="bg-white border border-slate-200/90 rounded-sm p-6 md:p-8 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#006837] font-bold block font-mono">
                Step 04 / Personal Payload
              </span>
              <h2 className="font-editorial text-2xl font-bold text-[#0F1C13] italic mt-1">
                Personal Holiday Media & Dedication
              </h2>
              <p className="text-xs text-[#4A5568] mt-1">
                Receiver hears your voice note and unboxes this personalized festive card upon opening the claim link.
              </p>
            </div>
            <button onClick={() => setStep(3)} className="text-[10px] uppercase tracking-widest font-mono text-[#006837] hover:underline font-bold">
              ← Back
            </button>
          </div>

          {/* Voice Recorder Component */}
          <AudioVoiceRecorder
            onAudioReady={handleAudioReady}
            initialAudioUrl={voiceNoteUrl}
          />

          {/* Holiday Photo Selector */}
          <div>
            <label className="block text-[10px] font-bold text-[#006837] uppercase tracking-[0.2em] mb-2 font-mono">
              Holiday Card Cover Photo
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {HOLIDAY_PHOTO_PRESETS.map((p) => {
                const isSelected = selectedPhoto === p.url;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPhoto(p.url)}
                    className={`relative rounded-sm overflow-hidden border-2 cursor-pointer transition-all aspect-video ${
                      isSelected ? 'border-[#006837] ring-2 ring-[#006837]/30' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={p.url} alt={p.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
                      <span className="text-[10px] font-bold text-white leading-tight">{p.title}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Personal Text Message */}
          <div>
            <label className="block text-[10px] font-bold text-[#006837] uppercase tracking-[0.2em] mb-1 font-mono">
              Personal Holiday Message
            </label>
            <textarea
              rows={3}
              value={personalMessage}
              onChange={(e) => setPersonalMessage(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-sm p-3 text-xs text-[#0F1C13] focus:outline-none focus:border-[#006837]"
              placeholder="Write your warmest holiday wishes..."
            />
          </div>

          {/* Checkout Action */}
          <div className="border-t border-slate-100 pt-5 flex items-center justify-between">
            <button onClick={() => setStep(3)} className="text-[10px] uppercase tracking-widest font-mono text-[#4A5568] hover:text-[#006837] font-semibold">
              ← Back
            </button>
            <button
              onClick={handleSubmitEscrowOrder}
              disabled={isProcessing}
              className="flex items-center space-x-2 px-8 py-3.5 rounded-sm bg-[#C41E3A] hover:bg-[#a51830] text-white font-bold text-xs uppercase tracking-widest shadow-xl transition-all active:scale-98 disabled:opacity-50"
            >
              <CreditCard className="w-4 h-4" />
              <span>{isProcessing ? 'Locking in Escrow...' : `Pay ${currency} ${amount} & Fund Escrow`}</span>
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Success Confirmation & Claim Link */}
      {step === 5 && createdResult && (
        <div className="bg-white border border-slate-200 rounded-sm p-6 md:p-10 space-y-6 shadow-md text-center">
          
          <div className="w-16 h-16 bg-emerald-100 text-[#006837] rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500 shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#006837] font-bold">
              Escrow Transaction # {createdResult.order.orderNumber}
            </span>
            <h2 className="font-editorial text-3xl md:text-4xl font-bold text-[#0F1C13] italic mt-1">
              Purpose-Locked Escrow Successfully Funded
            </h2>
            <p className="text-xs md:text-sm text-[#4A5568] max-w-xl mx-auto mt-2">
              {createdResult.order.targetCurrency} {createdResult.order.targetAmount.toLocaleString()} has been locked in the ring-fenced PSP escrow pool for <strong>{createdResult.order.merchantName}</strong>.
            </p>
          </div>

          {/* Web Claim Portal Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-sm p-5 max-w-xl mx-auto text-left space-y-3 shadow-2xs">
            <div className="flex items-center justify-between text-xs border-b border-slate-200 pb-2">
              <span className="text-[10px] uppercase font-mono text-[#4A5568]">Recipient</span>
              <span className="font-bold text-[#0F1C13]">{createdResult.order.receiverName} ({createdResult.order.receiverPhone})</span>
            </div>
            <div className="flex items-center justify-between text-xs border-b border-slate-200 pb-2">
              <span className="text-[10px] uppercase font-mono text-[#4A5568]">Card Number / EAN</span>
              <span className="font-mono font-bold text-[#006837]">{createdResult.giftCard.cardNumber}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[10px] uppercase font-mono text-[#4A5568]">Escrow Security</span>
              <span className="text-emerald-700 font-mono text-[11px] font-bold">Dual-Factor Anti-Arbitrage OTP Active</span>
            </div>
          </div>

          {/* Instant Share Link Box */}
          <div className="max-w-xl mx-auto space-y-3">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#006837] block font-mono">
              Receiver Instant Web Claim Link (No App Required)
            </span>
            
            <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-sm border border-slate-300">
              <input
                type="text"
                readOnly
                value={createdResult.claimUrl}
                className="flex-1 bg-transparent text-xs text-[#0F1C13] font-mono px-2 focus:outline-none"
              />
              <button
                onClick={copyClaimLink}
                className="px-3 py-1.5 rounded-sm bg-[#006837] text-white font-bold text-xs flex items-center space-x-1 hover:bg-[#00522c]"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={() => onJumpToReceiver(createdResult.giftCard.claimToken)}
              className="w-full sm:w-auto px-6 py-3 rounded-sm bg-[#D4AF37] text-[#0A1C12] font-bold text-xs uppercase tracking-widest flex items-center justify-center space-x-2 shadow-md hover:bg-[#c49f2e]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Open Receiver Claim Portal</span>
            </button>

            <button
              onClick={() => {
                setStep(1);
                setCreatedResult(null);
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-sm bg-white border border-slate-300 text-[#0F1C13] font-bold text-xs uppercase tracking-widest hover:bg-slate-50"
            >
              <span>Send Another Holiday Gift</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
