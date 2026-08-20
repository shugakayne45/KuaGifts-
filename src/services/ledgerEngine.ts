/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Order,
  GiftCard,
  EscrowLedgerEntry,
  OtpSession,
  RedemptionRecord,
  MerchantBatchSettlement,
  DeepBarcodeValidationResponse,
  LightReconciliationResponse,
  SourceCurrency,
  TargetCurrency,
  PurposeCategory,
  CountryCode
} from '../types.ts';
import { MERCHANTS, FX_BASE_RATES, getLockedQuote } from '../data/merchantsData.ts';

// In-Memory Database Stores with ACID-like transactional operations
let ordersStore: Map<string, Order> = new Map();
let giftCardsStore: Map<string, GiftCard> = new Map();
let ledgerStore: EscrowLedgerEntry[] = [];
let otpSessionsStore: Map<string, OtpSession> = new Map();
let redemptionRecordsStore: RedemptionRecord[] = [];
let batchSettlementsStore: MerchantBatchSettlement[] = [];

// Helper to generate EAN-13 valid barcode (12 digits + 1 checksum digit)
export function generateEan13(): string {
  // Prefix with 618 (Ghana) or 615 (Nigeria) + random digits
  const prefix = Math.random() > 0.5 ? '618' : '615';
  const middle = Math.floor(100000000 + Math.random() * 900000000).toString().substring(0, 9);
  const raw12 = prefix + middle;
  
  // Calculate modulo 10 checksum
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(raw12[i], 10);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return raw12 + checkDigit.toString();
}

export function generateCardNumber(country: CountryCode): string {
  const p1 = Math.floor(1000 + Math.random() * 9000);
  const p2 = Math.floor(1000 + Math.random() * 9000);
  return `KUA-${country}-${p1}-${p2}`;
}

export function generateClaimToken(): string {
  return 'claim_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

// Seed initial realistic data for instant demonstration
function initializeSeedData() {
  if (ordersStore.size > 0) return;

  const melcom = MERCHANTS.find(m => m.id === 'merch_melcom_gh')!;
  const shoprite = MERCHANTS.find(m => m.id === 'merch_shoprite_ng')!;
  const totalGh = MERCHANTS.find(m => m.id === 'merch_total_gh')!;

  // 1. Order 1: Melcom Christmas Hamper (Claimed & Ready for POS test)
  const order1Id = 'ord_seed_melcom_01';
  const card1Id = 'gc_seed_melcom_01';
  const claimToken1 = 'xmas-melcom-accra-2026';
  const ean1 = '6189421045238';

  const order1: Order = {
    id: order1Id,
    orderNumber: 'KUA-ORD-8821-GH',
    senderId: 'user_kwame_uk',
    senderName: 'Kwame Mensah (London, UK)',
    senderEmail: 'kwame.mensah@kua-diaspora.co.uk',
    receiverName: 'Mama Akosua Mensah',
    receiverPhone: '+233 24 498 1204',
    receiverCountry: 'GH',
    merchantId: melcom.id,
    merchantName: melcom.name,
    purposeCategory: 'HOLIDAY_HAMPER',
    sourceCurrency: 'GBP',
    sourceAmount: 100.00,
    fxRate: 19.85,
    fxLockExpiresAt: new Date(Date.now() + 86400000).toISOString(),
    targetCurrency: 'GHS',
    targetAmount: 1985.00,
    escrowStatus: 'FUNDED',
    pspReference: 'PSTK_ESCROW_TX_992147',
    voiceNoteUrl: 'https://actions.google.com/sounds/v1/holidays/deck_the_halls_music_box.ogg',
    voiceDurationSeconds: 18,
    photoUrl: 'https://images.unsplash.com/photo-1513297887119-d46091b24bfa?w=800&auto=format&fit=crop&q=80',
    personalMessage: 'Merry Christmas Mama! Please go to Melcom Accra Mall and pick up the royal festive hamper, quality cooking oils, and provisions for the family celebration. Love from London!',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
  };

  const giftCard1: GiftCard = {
    id: card1Id,
    orderId: order1Id,
    orderNumber: order1.orderNumber,
    cardNumber: 'KUA-GH-8821-9904',
    ean13Code: ean1,
    upcCode: '882199040123',
    claimToken: claimToken1,
    status: 'CLAIMED',
    initialBalance: 1985.00,
    remainingBalance: 1985.00,
    currency: 'GHS',
    purposeCategory: 'HOLIDAY_HAMPER',
    merchantId: melcom.id,
    merchantName: melcom.name,
    receiverName: 'Mama Akosua Mensah',
    receiverPhone: '+233 24 498 1204',
    senderName: 'Kwame Mensah',
    personalMessage: order1.personalMessage,
    voiceNoteUrl: order1.voiceNoteUrl,
    photoUrl: order1.photoUrl,
    expiresAt: new Date(Date.now() + 90 * 86400000).toISOString(),
    createdAt: order1.createdAt
  };

  ordersStore.set(order1Id, order1);
  giftCardsStore.set(card1Id, giftCard1);

  // Escrow Ledger for Order 1
  ledgerStore.push({
    id: 'ledg_tx_01',
    transactionId: 'TXN-ESC-GBP-001',
    orderId: order1Id,
    giftCardId: card1Id,
    entryType: 'SENDER_DEPOSIT_HELD',
    debitAccount: 'PAYSTACK_CUSTODIAL_GBP',
    creditAccount: 'ESCROW_SOURCE_LIABILITY',
    amount: 100.00,
    currency: 'GBP',
    referenceId: 'PSTK_ESCROW_TX_992147',
    description: 'Diaspora sender deposit captured into ring-fenced PSP escrow pool',
    createdAt: order1.createdAt
  });

  ledgerStore.push({
    id: 'ledg_tx_02',
    transactionId: 'TXN-ESC-GHS-002',
    orderId: order1Id,
    giftCardId: card1Id,
    entryType: 'FX_CONVERSION_LOCK',
    debitAccount: 'ESCROW_SOURCE_LIABILITY',
    creditAccount: 'RING_FENCED_ESCROW_GHS',
    amount: 1985.00,
    currency: 'GHS',
    fxRateApplied: 19.85,
    referenceId: 'FX-LOCK-GBP-GHS-8821',
    description: 'Guaranteed FX Rate lock @ 19.85 GHS/GBP. Purpose-locked for Melcom Groceries.',
    createdAt: order1.createdAt
  });

  // 2. Order 2: Shoprite Nigeria (Lagos Festive Groceries)
  const order2Id = 'ord_seed_shoprite_02';
  const card2Id = 'gc_seed_shoprite_02';
  const claimToken2 = 'xmas-shoprite-lagos-2026';
  const ean2 = '6158291074312';

  const order2: Order = {
    id: order2Id,
    orderNumber: 'KUA-ORD-7714-NG',
    senderId: 'user_emeka_us',
    senderName: 'Emeka Okafor (Atlanta, USA)',
    senderEmail: 'emeka.okafor@kua-diaspora.com',
    receiverName: 'Uncle Chidi & Family',
    receiverPhone: '+234 803 555 9012',
    receiverCountry: 'NG',
    merchantId: shoprite.id,
    merchantName: shoprite.name,
    purposeCategory: 'GROCERIES_FOOD',
    sourceCurrency: 'USD',
    sourceAmount: 150.00,
    fxRate: 1520.00,
    fxLockExpiresAt: new Date(Date.now() + 86400000).toISOString(),
    targetCurrency: 'NGN',
    targetAmount: 228000.00,
    escrowStatus: 'FUNDED',
    pspReference: 'FLW_ESCROW_TX_330912',
    voiceNoteUrl: 'https://actions.google.com/sounds/v1/holidays/jingle_bells_orchestral.ogg',
    voiceDurationSeconds: 22,
    photoUrl: 'https://images.unsplash.com/photo-1543258103-a62bdc06e871?w=800&auto=format&fit=crop&q=80',
    personalMessage: 'Compliments of the season Uncle Chidi! Use this at Shoprite Ikeja City Mall for all your Christmas feast items.',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  };

  const giftCard2: GiftCard = {
    id: card2Id,
    orderId: order2Id,
    orderNumber: order2.orderNumber,
    cardNumber: 'KUA-NG-7714-3321',
    ean13Code: ean2,
    upcCode: '771433210456',
    claimToken: claimToken2,
    status: 'CLAIMED',
    initialBalance: 228000.00,
    remainingBalance: 228000.00,
    currency: 'NGN',
    purposeCategory: 'GROCERIES_FOOD',
    merchantId: shoprite.id,
    merchantName: shoprite.name,
    receiverName: 'Uncle Chidi & Family',
    receiverPhone: '+234 803 555 9012',
    senderName: 'Emeka Okafor',
    personalMessage: order2.personalMessage,
    voiceNoteUrl: order2.voiceNoteUrl,
    photoUrl: order2.photoUrl,
    expiresAt: new Date(Date.now() + 90 * 86400000).toISOString(),
    createdAt: order2.createdAt
  };

  ordersStore.set(order2Id, order2);
  giftCardsStore.set(card2Id, giftCard2);

  ledgerStore.push({
    id: 'ledg_tx_03',
    transactionId: 'TXN-ESC-USD-003',
    orderId: order2Id,
    giftCardId: card2Id,
    entryType: 'SENDER_DEPOSIT_HELD',
    debitAccount: 'FLUTTERWAVE_CUSTODIAL_USD',
    creditAccount: 'ESCROW_SOURCE_LIABILITY',
    amount: 150.00,
    currency: 'USD',
    referenceId: 'FLW_ESCROW_TX_330912',
    description: 'Diaspora USD deposit captured into ring-fenced escrow',
    createdAt: order2.createdAt
  });

  ledgerStore.push({
    id: 'ledg_tx_04',
    transactionId: 'TXN-ESC-NGN-004',
    orderId: order2Id,
    giftCardId: card2Id,
    entryType: 'FX_CONVERSION_LOCK',
    debitAccount: 'ESCROW_SOURCE_LIABILITY',
    creditAccount: 'RING_FENCED_ESCROW_NGN',
    amount: 228000.00,
    currency: 'NGN',
    fxRateApplied: 1520.00,
    referenceId: 'FX-LOCK-USD-NGN-7714',
    description: 'Guaranteed FX Rate lock @ 1,520 NGN/USD. Purpose-locked for Shoprite Groceries.',
    createdAt: order2.createdAt
  });

  // Seed Batch Settlement 1: Melcom Ghana Prior Week Settlement
  batchSettlementsStore.push({
    id: 'batch_seed_01',
    batchReference: 'BATCH-SETTLE-2026-W33-MELCOM',
    merchantId: melcom.id,
    merchantName: melcom.name,
    currency: 'GHS',
    grossRedemptionsTotal: 14500.00,
    commissionFeeTotal: 652.50,
    commissionRatePercent: 4.5,
    netPayoutAmount: 13847.50,
    redemptionCount: 18,
    settlementStatus: 'SETTLED',
    destinationBank: 'Stanbic Bank Ghana (Airport City Branch)',
    destinationAccountNumber: '9040001889421',
    payoutTxHash: 'ACH_GHIPSS_TX_8829104',
    periodStart: new Date(Date.now() - 86400000 * 14).toISOString(),
    periodEnd: new Date(Date.now() - 86400000 * 7).toISOString(),
    settledAt: new Date(Date.now() - 86400000 * 6).toISOString()
  });

  // Seed Batch Settlement 2: Shoprite Nigeria Prior Week Settlement
  batchSettlementsStore.push({
    id: 'batch_seed_02',
    batchReference: 'BATCH-SETTLE-2026-W33-SHOPRITE',
    merchantId: shoprite.id,
    merchantName: shoprite.name,
    currency: 'NGN',
    grossRedemptionsTotal: 3450000.00,
    commissionFeeTotal: 138000.00,
    commissionRatePercent: 4.0,
    netPayoutAmount: 3312000.00,
    redemptionCount: 24,
    settlementStatus: 'SETTLED',
    destinationBank: 'Guaranty Trust Bank (Victoria Island Branch)',
    destinationAccountNumber: '0129948123',
    payoutTxHash: 'NIP_CBN_TX_9934102',
    periodStart: new Date(Date.now() - 86400000 * 14).toISOString(),
    periodEnd: new Date(Date.now() - 86400000 * 7).toISOString(),
    settledAt: new Date(Date.now() - 86400000 * 6).toISOString()
  });
}

// Initialize immediately
initializeSeedData();

// Core Ledger & API Service Object
export const LedgerEngine = {
  // 1. Get Merchant Directory
  getMerchants(country?: CountryCode, category?: PurposeCategory) {
    let result = [...MERCHANTS];
    if (country) {
      result = result.filter(m => m.country === country);
    }
    if (category) {
      result = result.filter(m => m.category === category);
    }
    return result;
  },

  getMerchantById(merchantId: string) {
    return MERCHANTS.find(m => m.id === merchantId);
  },

  // 2. Lock FX Quote
  quoteFX(sourceCurrency: SourceCurrency, targetCurrency: TargetCurrency, amount: number) {
    return getLockedQuote(sourceCurrency, targetCurrency, amount);
  },

  // 3. Create Order & Lock Funds into Escrow Ledger
  createOrder(payload: {
    senderName: string;
    senderEmail: string;
    receiverName: string;
    receiverPhone: string;
    receiverCountry: CountryCode;
    merchantId: string;
    purposeCategory: PurposeCategory;
    sourceCurrency: SourceCurrency;
    sourceAmount: number;
    voiceNoteUrl?: string;
    voiceDurationSeconds?: number;
    photoUrl?: string;
    personalMessage: string;
  }): { order: Order; giftCard: GiftCard; claimUrl: string; ledgerEntries: EscrowLedgerEntry[] } {
    const merchant = this.getMerchantById(payload.merchantId);
    if (!merchant) {
      throw new Error(`Merchant with id "${payload.merchantId}" not found`);
    }

    const targetCurrency: TargetCurrency = payload.receiverCountry === 'GH' ? 'GHS' : 'NGN';
    const quote = getLockedQuote(payload.sourceCurrency, targetCurrency, payload.sourceAmount);
    const targetAmount = +(payload.sourceAmount * quote.rate).toFixed(2);

    const orderId = 'ord_' + Math.random().toString(36).substring(2, 9);
    const orderNumber = `KUA-ORD-${Math.floor(1000 + Math.random() * 9000)}-${payload.receiverCountry}`;
    const pspReference = `PSTK_ESCROW_${Math.random().toString(36).substring(2, 11).toUpperCase()}`;

    const order: Order = {
      id: orderId,
      orderNumber,
      senderId: 'user_' + Math.random().toString(36).substring(2, 7),
      senderName: payload.senderName,
      senderEmail: payload.senderEmail,
      receiverName: payload.receiverName,
      receiverPhone: payload.receiverPhone,
      receiverCountry: payload.receiverCountry,
      merchantId: merchant.id,
      merchantName: merchant.name,
      purposeCategory: payload.purposeCategory,
      sourceCurrency: payload.sourceCurrency,
      sourceAmount: payload.sourceAmount,
      fxRate: quote.rate,
      fxLockExpiresAt: quote.expiresAt,
      targetCurrency,
      targetAmount,
      escrowStatus: 'FUNDED',
      pspReference,
      voiceNoteUrl: payload.voiceNoteUrl,
      voiceDurationSeconds: payload.voiceDurationSeconds,
      photoUrl: payload.photoUrl,
      personalMessage: payload.personalMessage,
      createdAt: new Date().toISOString()
    };

    const cardId = 'gc_' + Math.random().toString(36).substring(2, 9);
    const ean13Code = generateEan13();
    const upcCode = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    const claimToken = generateClaimToken();
    const cardNumber = generateCardNumber(payload.receiverCountry);

    const giftCard: GiftCard = {
      id: cardId,
      orderId,
      orderNumber,
      cardNumber,
      ean13Code,
      upcCode,
      claimToken,
      status: 'ISSUED',
      initialBalance: targetAmount,
      remainingBalance: targetAmount,
      currency: targetCurrency,
      purposeCategory: payload.purposeCategory,
      merchantId: merchant.id,
      merchantName: merchant.name,
      receiverName: payload.receiverName,
      receiverPhone: payload.receiverPhone,
      senderName: payload.senderName,
      personalMessage: payload.personalMessage,
      voiceNoteUrl: payload.voiceNoteUrl,
      photoUrl: payload.photoUrl,
      expiresAt: new Date(Date.now() + 90 * 86400000).toISOString(), // 90 days validity
      createdAt: order.createdAt
    };

    ordersStore.set(orderId, order);
    giftCardsStore.set(cardId, giftCard);

    // Double-Entry Ledger Entry 1: Source Currency Inflow
    const ledgerTx1: EscrowLedgerEntry = {
      id: 'ledg_' + Math.random().toString(36).substring(2, 9),
      transactionId: `TXN-DEP-${orderId.substring(4, 9).toUpperCase()}`,
      orderId,
      giftCardId: cardId,
      entryType: 'SENDER_DEPOSIT_HELD',
      debitAccount: `PSP_ESCROW_CUSTODY_${payload.sourceCurrency}`,
      creditAccount: 'ESCROW_SOURCE_LIABILITY',
      amount: payload.sourceAmount,
      currency: payload.sourceCurrency,
      referenceId: pspReference,
      description: `Diaspora deposit from ${payload.senderName} held in ring-fenced custodial vault`,
      createdAt: order.createdAt
    };

    // Double-Entry Ledger Entry 2: Target Currency Purpose Lock
    const ledgerTx2: EscrowLedgerEntry = {
      id: 'ledg_' + Math.random().toString(36).substring(2, 9),
      transactionId: `TXN-LCK-${orderId.substring(4, 9).toUpperCase()}`,
      orderId,
      giftCardId: cardId,
      entryType: 'FX_CONVERSION_LOCK',
      debitAccount: 'ESCROW_SOURCE_LIABILITY',
      creditAccount: `RING_FENCED_ESCROW_${targetCurrency}`,
      amount: targetAmount,
      currency: targetCurrency,
      fxRateApplied: quote.rate,
      referenceId: `FX-LOCK-${orderNumber}`,
      description: `Locked @ ${quote.rate} ${targetCurrency}/${payload.sourceCurrency}. Purpose-locked for ${merchant.name}`,
      createdAt: order.createdAt
    };

    ledgerStore.unshift(ledgerTx2);
    ledgerStore.unshift(ledgerTx1);

    const claimUrl = `${window.location.origin}?claim=${claimToken}`;

    return {
      order,
      giftCard,
      claimUrl,
      ledgerEntries: [ledgerTx1, ledgerTx2]
    };
  },

  // 4. Look up Gift Card by Claim Token or Card/EAN Code
  findGiftCard(query: string): { giftCard: GiftCard; order: Order; merchant: typeof MERCHANTS[0] } | null {
    const clean = query.trim().toLowerCase();
    
    // Search by claim token, EAN-13, Card Number, or ID
    for (const card of giftCardsStore.values()) {
      if (
        card.claimToken.toLowerCase() === clean ||
        card.ean13Code === clean ||
        card.cardNumber.toLowerCase() === clean ||
        card.upcCode === clean ||
        card.id === clean
      ) {
        const order = ordersStore.get(card.orderId);
        const merchant = MERCHANTS.find(m => m.id === card.merchantId);
        if (order && merchant) {
          return { giftCard: card, order, merchant };
        }
      }
    }
    return null;
  },

  // 5. Dual-Factor Anti-Arbitrage OTP Engine: /api/v1/giftcards/redeem-otp
  requestRedemptionOtp(barcodeOrToken: string, posTerminalId: string, cashierName?: string) {
    const lookup = this.findGiftCard(barcodeOrToken);
    if (!lookup) {
      throw new Error(`Invalid or unknown gift card code "${barcodeOrToken}"`);
    }

    const { giftCard, order, merchant } = lookup;

    if (giftCard.status === 'EXPIRED') {
      throw new Error('This gift card has expired.');
    }

    if (giftCard.remainingBalance <= 0 || giftCard.status === 'REDEEMED') {
      throw new Error('This gift card has already been fully redeemed.');
    }

    // Generate real-time 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes TTL

    const otpSessionId = 'otp_' + Math.random().toString(36).substring(2, 9);
    const otpSession: OtpSession = {
      id: otpSessionId,
      giftCardId: giftCard.id,
      phoneNumber: giftCard.receiverPhone,
      otpCode,
      expiresAt,
      verified: false,
      attempts: 0
    };

    otpSessionsStore.set(giftCard.id, otpSession);
    giftCard.lastOtpSentAt = new Date().toISOString();

    // Mask phone number for security: e.g. "+233 24 ••• •812"
    const phone = giftCard.receiverPhone;
    const maskedPhone = phone.length > 8 
      ? `${phone.substring(0, 7)} ••• •${phone.substring(phone.length - 3)}`
      : phone;

    // Record POS scan reservation in ledger audit trail
    const scanLedgerEntry: EscrowLedgerEntry = {
      id: 'ledg_' + Math.random().toString(36).substring(2, 9),
      transactionId: `POS-SCAN-${Math.floor(1000 + Math.random() * 9000)}`,
      orderId: order.id,
      giftCardId: giftCard.id,
      entryType: 'POS_SCAN_RESERVATION',
      debitAccount: `RING_FENCED_ESCROW_${giftCard.currency}`,
      creditAccount: `TEMP_POS_HOLD_${posTerminalId}`,
      amount: giftCard.remainingBalance,
      currency: giftCard.currency,
      referenceId: posTerminalId,
      description: `POS Scan at ${posTerminalId} (${merchant.name}). Dispatched dual-factor counter OTP to ${maskedPhone}`,
      createdAt: new Date().toISOString()
    };
    ledgerStore.unshift(scanLedgerEntry);

    return {
      success: true,
      message: `Anti-Arbitrage Counter OTP sent to ${maskedPhone}`,
      otpSessionId,
      giftCardId: giftCard.id,
      cardNumber: giftCard.cardNumber,
      merchantName: merchant.name,
      purposeCategory: giftCard.purposeCategory,
      availableBalance: giftCard.remainingBalance,
      currency: giftCard.currency,
      receiverName: giftCard.receiverName,
      maskedPhone,
      otpCode, // Returned for sandbox interactive simulation
      expiresInSeconds: 300
    };
  },

  // 6. Verify OTP & Process Redemption: /api/v1/giftcards/verify-and-redeem
  verifyAndRedeem(payload: {
    barcodeOrCard: string;
    otpCode: string;
    amountToRedeem: number;
    cashierName: string;
    posTerminalId: string;
  }): {
    success: boolean;
    redemptionRecord: RedemptionRecord;
    remainingBalance: number;
    commissionSummary: {
      grossAmount: number;
      commissionRatePercent: number;
      commissionFee: number;
      netMerchantPayout: number;
    };
    settlementReceipt: string;
  } {
    const lookup = this.findGiftCard(payload.barcodeOrCard);
    if (!lookup) {
      throw new Error(`Gift card "${payload.barcodeOrCard}" not found`);
    }

    const { giftCard, order, merchant } = lookup;
    const otpSession = otpSessionsStore.get(giftCard.id);

    if (!otpSession) {
      throw new Error('No active OTP session found. Please scan the card again to generate a checkout OTP.');
    }

    if (new Date(otpSession.expiresAt).getTime() < Date.now()) {
      throw new Error('OTP has expired. Please request a new counter OTP.');
    }

    if (otpSession.otpCode.trim() !== payload.otpCode.trim()) {
      otpSession.attempts += 1;
      throw new Error(`Invalid OTP entered. (Attempt ${otpSession.attempts} of 3). Anti-arbitrage check failed.`);
    }

    if (payload.amountToRedeem <= 0) {
      throw new Error('Redemption amount must be greater than zero.');
    }

    if (payload.amountToRedeem > giftCard.remainingBalance) {
      throw new Error(
        `Insufficient balance. Requested: ${payload.amountToRedeem} ${giftCard.currency}, Available: ${giftCard.remainingBalance} ${giftCard.currency}`
      );
    }

    // Mark OTP verified
    otpSession.verified = true;

    // Calculate Merchant Coalition Commission (e.g. 3% - 7%)
    const commissionRate = merchant.commissionRate;
    const commissionFee = +(payload.amountToRedeem * commissionRate).toFixed(2);
    const netMerchantPayout = +(payload.amountToRedeem - commissionFee).toFixed(2);

    // Update Gift Card State
    const prevBalance = giftCard.remainingBalance;
    const newBalance = +(prevBalance - payload.amountToRedeem).toFixed(2);
    giftCard.remainingBalance = newBalance;
    giftCard.status = newBalance === 0 ? 'REDEEMED' : 'PARTIALLY_REDEEMED';
    giftCard.redeemedAt = new Date().toISOString();

    // Generate Double-Entry Settlement Releases
    const ledgerTxSettlement: EscrowLedgerEntry = {
      id: 'ledg_' + Math.random().toString(36).substring(2, 9),
      transactionId: `TXN-SETTLE-${Math.floor(10000 + Math.random() * 90000)}`,
      orderId: order.id,
      giftCardId: giftCard.id,
      merchantId: merchant.id,
      entryType: 'MERCHANT_SETTLEMENT_RELEASE',
      debitAccount: `RING_FENCED_ESCROW_${giftCard.currency}`,
      creditAccount: `MERCHANT_SETTLEMENT_PAYABLE_${merchant.id}`,
      amount: payload.amountToRedeem,
      currency: giftCard.currency,
      referenceId: payload.posTerminalId,
      description: `Escrow release for POS checkout @ ${merchant.name} (${payload.cashierName}). Net payout: ${netMerchantPayout} ${giftCard.currency}`,
      createdAt: new Date().toISOString()
    };

    const ledgerTxCommission: EscrowLedgerEntry = {
      id: 'ledg_' + Math.random().toString(36).substring(2, 9),
      transactionId: `TXN-COMM-${Math.floor(10000 + Math.random() * 90000)}`,
      orderId: order.id,
      giftCardId: giftCard.id,
      merchantId: merchant.id,
      entryType: 'MERCHANT_COMMISSION_DEDUCTED',
      debitAccount: `MERCHANT_SETTLEMENT_PAYABLE_${merchant.id}`,
      creditAccount: 'KUA_COALITION_NETWORK_REVENUE',
      amount: commissionFee,
      currency: giftCard.currency,
      commissionAmount: commissionFee,
      referenceId: `COMM-${order.orderNumber}`,
      description: `Coalition network interchange fee (${(commissionRate * 100).toFixed(1)}%) deducted for Points Africa rail`,
      createdAt: new Date().toISOString()
    };

    ledgerStore.unshift(ledgerTxCommission);
    ledgerStore.unshift(ledgerTxSettlement);

    // Record Redemption Event
    const redemptionId = 'red_' + Math.random().toString(36).substring(2, 9);
    const redemptionRecord: RedemptionRecord = {
      id: redemptionId,
      giftCardId: giftCard.id,
      cardNumber: giftCard.cardNumber,
      orderId: order.id,
      merchantId: merchant.id,
      merchantName: merchant.name,
      cashierName: payload.cashierName,
      posTerminalId: payload.posTerminalId,
      redeemedAmount: payload.amountToRedeem,
      currency: giftCard.currency,
      commissionFee,
      netMerchantPayout,
      verifiedOtp: payload.otpCode,
      receiverPhone: giftCard.receiverPhone,
      timestamp: new Date().toISOString(),
      escrowLedgerId: ledgerTxSettlement.transactionId
    };
    redemptionRecordsStore.unshift(redemptionRecord);

    const settlementReceipt = `KUA-POS-RCPT-${Math.floor(100000 + Math.random() * 900000)}`;

    return {
      success: true,
      redemptionRecord,
      remainingBalance: newBalance,
      commissionSummary: {
        grossAmount: payload.amountToRedeem,
        commissionRatePercent: +(commissionRate * 100).toFixed(1),
        commissionFee,
        netMerchantPayout
      },
      settlementReceipt
    };
  },

  // 7. Get All Escrow Ledger Entries
  getLedgerEntries() {
    return [...ledgerStore];
  },

  // 8. Get Escrow Financial Balance Summary
  getLedgerSummary() {
    let totalDepositsUSD = 0;
    let totalDepositsGBP = 0;
    let totalDepositsEUR = 0;
    let totalEscrowHeldGHS = 0;
    let totalEscrowHeldNGN = 0;
    let totalRedeemedGHS = 0;
    let totalRedeemedNGN = 0;
    let totalCommissionEarnedGHS = 0;
    let totalCommissionEarnedNGN = 0;

    for (const entry of ledgerStore) {
      if (entry.entryType === 'SENDER_DEPOSIT_HELD') {
        if (entry.currency === 'USD') totalDepositsUSD += entry.amount;
        if (entry.currency === 'GBP') totalDepositsGBP += entry.amount;
        if (entry.currency === 'EUR') totalDepositsEUR += entry.amount;
      }
      if (entry.entryType === 'FX_CONVERSION_LOCK') {
        if (entry.currency === 'GHS') totalEscrowHeldGHS += entry.amount;
        if (entry.currency === 'NGN') totalEscrowHeldNGN += entry.amount;
      }
      if (entry.entryType === 'MERCHANT_SETTLEMENT_RELEASE') {
        if (entry.currency === 'GHS') totalRedeemedGHS += entry.amount;
        if (entry.currency === 'NGN') totalRedeemedNGN += entry.amount;
      }
      if (entry.entryType === 'MERCHANT_COMMISSION_DEDUCTED') {
        if (entry.currency === 'GHS') totalCommissionEarnedGHS += entry.amount;
        if (entry.currency === 'NGN') totalCommissionEarnedNGN += entry.amount;
      }
    }

    return {
      totalDepositsUSD: +totalDepositsUSD.toFixed(2),
      totalDepositsGBP: +totalDepositsGBP.toFixed(2),
      totalDepositsEUR: +totalDepositsEUR.toFixed(2),
      totalEscrowHeldGHS: +totalEscrowHeldGHS.toFixed(2),
      totalEscrowHeldNGN: +totalEscrowHeldNGN.toFixed(2),
      totalRedeemedGHS: +totalRedeemedGHS.toFixed(2),
      totalRedeemedNGN: +totalRedeemedNGN.toFixed(2),
      outstandingEscrowGHS: +(totalEscrowHeldGHS - totalRedeemedGHS).toFixed(2),
      outstandingEscrowNGN: +(totalEscrowHeldNGN - totalRedeemedNGN).toFixed(2),
      totalCommissionEarnedGHS: +totalCommissionEarnedGHS.toFixed(2),
      totalCommissionEarnedNGN: +totalCommissionEarnedNGN.toFixed(2),
      totalOrdersCount: ordersStore.size,
      totalGiftCardsCount: giftCardsStore.size,
      totalRedemptionsCount: redemptionRecordsStore.length
    };
  },

  // 9. Merchant Deep Integration: Real-time Barcode / POS Gun Validation
  validateMerchantBarcodeDeep(payload: {
    barcode: string;
    posTerminalId: string;
    merchantId?: string;
  }): DeepBarcodeValidationResponse {
    const lookup = this.findGiftCard(payload.barcode);
    if (!lookup) {
      throw new Error(`Barcode/Code "${payload.barcode}" does not exist in KuaGifts Escrow registry.`);
    }

    const { giftCard, order, merchant } = lookup;
    const isMerchantMatch = !payload.merchantId || payload.merchantId === merchant.id;

    if (!isMerchantMatch) {
      throw new Error(
        `Purpose-Lock Conflict: This gift card is locked for "${merchant.name}". Cannot be redeemed at terminal ${payload.posTerminalId}.`
      );
    }

    if (giftCard.status === 'EXPIRED') {
      throw new Error(`Card expired on ${new Date(giftCard.expiresAt).toLocaleDateString()}.`);
    }

    if (giftCard.remainingBalance <= 0 || giftCard.status === 'REDEEMED') {
      throw new Error('Card has zero remaining balance. Already fully redeemed.');
    }

    const phone = giftCard.receiverPhone;
    const maskedPhone = phone.length > 8 
      ? `${phone.substring(0, 7)} ••• •${phone.substring(phone.length - 3)}`
      : phone;

    return {
      valid: true,
      giftCardId: giftCard.id,
      cardNumber: giftCard.cardNumber,
      ean13Code: giftCard.ean13Code,
      status: giftCard.status,
      purposeCategory: giftCard.purposeCategory,
      authorizedMerchantId: merchant.id,
      authorizedMerchantName: merchant.name,
      isMerchantMatch: true,
      availableBalance: giftCard.remainingBalance,
      currency: giftCard.currency,
      receiverName: giftCard.receiverName,
      maskedPhone,
      otpRequired: true,
      expiresAt: giftCard.expiresAt,
      integrationMode: 'DEEP_ENTERPRISE_POS'
    };
  },

  // 10. Merchant Light Integration: Manual Code Reconciliation (Portal / USSD Fallback)
  reconcileMerchantCodeLight(payload: {
    manualCode: string;
    otpCode: string;
    amountToRedeem: number;
    cashierName: string;
    cashierRef: string;
    merchantId: string;
  }): LightReconciliationResponse {
    const lookup = this.findGiftCard(payload.manualCode);
    if (!lookup) {
      throw new Error(`Manual code "${payload.manualCode}" is invalid.`);
    }

    const { giftCard, merchant } = lookup;

    // Verify merchant authorization
    if (giftCard.merchantId !== payload.merchantId) {
      throw new Error(
        `Merchant Mismatch: Card is bound to ${giftCard.merchantName}, not authorized for merchant ID ${payload.merchantId}`
      );
    }

    // Process redemption via core engine
    const redemptionResult = this.verifyAndRedeem({
      barcodeOrCard: payload.manualCode,
      otpCode: payload.otpCode,
      amountToRedeem: payload.amountToRedeem,
      cashierName: payload.cashierName || 'Light Portal Cashier',
      posTerminalId: payload.cashierRef || 'LIGHT-WEB-PORTAL-01'
    });

    const reconciliationRef = `RECON-${giftCard.currency}-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const settlementBatchId = `BATCH-QUEUED-W${Math.ceil(new Date().getDate() / 7)}-${merchant.slug.toUpperCase()}`;

    return {
      success: true,
      reconciliationReference: reconciliationRef,
      merchantId: merchant.id,
      merchantName: merchant.name,
      cardNumber: giftCard.cardNumber,
      amountClaimed: payload.amountToRedeem,
      currency: giftCard.currency,
      commissionDeducted: redemptionResult.commissionSummary.commissionFee,
      netPayableToMerchant: redemptionResult.commissionSummary.netMerchantPayout,
      cashierTerminalRef: payload.cashierRef,
      batchSettlementQueued: true,
      settlementBatchId,
      reconciledAt: new Date().toISOString(),
      integrationMode: 'LIGHT_PORTAL_USSD'
    };
  },

  // 11. Weekly Merchant Batch Settlement Engine
  executeWeeklyMerchantSettlement(targetMerchantId?: string): MerchantBatchSettlement[] {
    const now = new Date();
    const periodEnd = now.toISOString();
    const periodStart = new Date(Date.now() - 7 * 86400000).toISOString();
    const weekNumber = Math.ceil(now.getDate() / 7);

    const merchantsToProcess = targetMerchantId
      ? MERCHANTS.filter(m => m.id === targetMerchantId)
      : MERCHANTS;

    const newBatches: MerchantBatchSettlement[] = [];

    for (const merchant of merchantsToProcess) {
      // Find redemptions for this merchant
      const merchantRedemptions = redemptionRecordsStore.filter(r => r.merchantId === merchant.id);
      
      const grossRedemptionsTotal = merchantRedemptions.reduce((sum, r) => sum + r.redeemedAmount, 0);
      
      // If there are redemptions (or generate realistic scheduled cycle for demo if requested)
      const grossAmount = grossRedemptionsTotal > 0 
        ? grossRedemptionsTotal 
        : merchant.country === 'GH' ? 4850.00 : 1250000.00;

      const commissionFee = +(grossAmount * merchant.commissionRate).toFixed(2);
      const netPayout = +(grossAmount - commissionFee).toFixed(2);
      const currency: TargetCurrency = merchant.country === 'GH' ? 'GHS' : 'NGN';

      const batchRef = `BATCH-SETTLE-${now.getFullYear()}-W${weekNumber}-${merchant.name.split(' ')[0].toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
      const payoutTxHash = merchant.country === 'GH'
        ? `ACH_GHIPSS_${Date.now().toString(36).toUpperCase()}`
        : `NIP_CBN_${Date.now().toString(36).toUpperCase()}`;

      const batch: MerchantBatchSettlement = {
        id: 'batch_' + Math.random().toString(36).substring(2, 9),
        batchReference: batchRef,
        merchantId: merchant.id,
        merchantName: merchant.name,
        currency,
        grossRedemptionsTotal: grossAmount,
        commissionFeeTotal: commissionFee,
        commissionRatePercent: +(merchant.commissionRate * 100).toFixed(1),
        netPayoutAmount: netPayout,
        redemptionCount: merchantRedemptions.length > 0 ? merchantRedemptions.length : 8,
        settlementStatus: 'SETTLED',
        destinationBank: merchant.country === 'GH' ? 'Stanbic Bank Ghana (Airport Branch)' : 'Guaranty Trust Bank (VI Branch)',
        destinationAccountNumber: merchant.country === 'GH' ? '9040001889421' : '0129948123',
        payoutTxHash,
        settledAt: now.toISOString(),
        periodStart,
        periodEnd
      };

      // Double-Entry Ledger Entry: Merchant Batch Settlement Payout Release
      const batchLedgerEntry: EscrowLedgerEntry = {
        id: 'ledg_' + Math.random().toString(36).substring(2, 9),
        transactionId: `TXN-BATCH-${batch.id.substring(6, 12).toUpperCase()}`,
        orderId: 'BATCH_SETTLEMENT',
        merchantId: merchant.id,
        entryType: 'MERCHANT_BATCH_SETTLEMENT_PAYOUT',
        debitAccount: `MERCHANT_SETTLEMENT_PAYABLE_${merchant.id}`,
        creditAccount: `SETTLEMENT_BANK_ACH_${currency}`,
        amount: netPayout,
        currency,
        commissionAmount: commissionFee,
        referenceId: batchRef,
        description: `Weekly ACH Settlement Payout dispatched to ${merchant.name}. Gross: ${grossAmount} ${currency}, Platform Fee: ${commissionFee} ${currency}, Net: ${netPayout} ${currency}`,
        createdAt: now.toISOString()
      };

      ledgerStore.unshift(batchLedgerEntry);
      batchSettlementsStore.unshift(batch);
      newBatches.push(batch);
    }

    return newBatches;
  },

  // 12. Get Batch Settlements
  getBatchSettlements() {
    return [...batchSettlementsStore];
  },

  // 13. Get all orders and cards
  getAllOrders() {
    return Array.from(ordersStore.values());
  },

  getAllGiftCards() {
    return Array.from(giftCardsStore.values());
  },

  getAllRedemptions() {
    return [...redemptionRecordsStore];
  }
};

