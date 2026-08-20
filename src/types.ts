/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CountryCode = 'GH' | 'NG';
export type SourceCurrency = 'USD' | 'GBP' | 'EUR' | 'CAD';
export type TargetCurrency = 'GHS' | 'NGN';

export type PurposeCategory = 
  | 'GROCERIES_FOOD'
  | 'FUEL_TRANSPORT'
  | 'HEALTHCARE_PHARMACY'
  | 'UTILITIES_POWER'
  | 'EDUCATION_BOOKS'
  | 'HOLIDAY_HAMPER';

export type GiftCardStatus = 
  | 'ISSUED'
  | 'CLAIMED'
  | 'PARTIALLY_REDEEMED'
  | 'REDEEMED'
  | 'EXPIRED';

export type EscrowStatus = 
  | 'PENDING'
  | 'FUNDED'
  | 'LOCKED'
  | 'PARTIALLY_RELEASED'
  | 'SETTLED'
  | 'REFUNDED';

export type LedgerEntryType = 
  | 'SENDER_DEPOSIT_HELD'
  | 'FX_CONVERSION_LOCK'
  | 'POS_SCAN_RESERVATION'
  | 'MERCHANT_SETTLEMENT_RELEASE'
  | 'MERCHANT_COMMISSION_DEDUCTED'
  | 'MERCHANT_BATCH_SETTLEMENT_PAYOUT'
  | 'ESCROW_REFUND';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  role: 'SENDER' | 'RECEIVER' | 'CASHIER' | 'SYSTEM_ADMIN';
  createdAt: string;
}

export interface MerchantBranch {
  id: string;
  name: string;
  address: string;
  city: string;
  country: CountryCode;
  posTerminalId: string;
}

export interface Merchant {
  id: string;
  name: string;
  category: PurposeCategory;
  country: CountryCode;
  tagline: string;
  logo: string;
  verified: boolean;
  commissionRate: number; // e.g. 0.045 for 4.5%
  acceptedCurrencies: TargetCurrency[];
  branches: MerchantBranch[];
  supportedPosBarcodes: ('EAN-13' | 'UPC-A' | 'CODE-128' | 'QR')[];
  description: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  receiverName: string;
  receiverPhone: string;
  receiverCountry: CountryCode;
  merchantId: string;
  merchantName: string;
  purposeCategory: PurposeCategory;
  sourceCurrency: SourceCurrency;
  sourceAmount: number;
  fxRate: number;
  fxLockExpiresAt: string;
  targetCurrency: TargetCurrency;
  targetAmount: number;
  escrowStatus: EscrowStatus;
  pspReference: string;
  voiceNoteUrl?: string;
  voiceDurationSeconds?: number;
  photoUrl?: string;
  personalMessage: string;
  createdAt: string;
}

export interface GiftCard {
  id: string;
  orderId: string;
  orderNumber: string;
  cardNumber: string; // e.g. "KUA-GH-8892-4410"
  ean13Code: string; // 13 digits for optical POS guns
  upcCode: string;
  claimToken: string; // secure hash for receiver direct link
  status: GiftCardStatus;
  initialBalance: number;
  remainingBalance: number;
  currency: TargetCurrency;
  purposeCategory: PurposeCategory;
  merchantId: string;
  merchantName: string;
  receiverName: string;
  receiverPhone: string;
  senderName: string;
  personalMessage: string;
  voiceNoteUrl?: string;
  photoUrl?: string;
  expiresAt: string;
  createdAt: string;
  lastOtpSentAt?: string;
  redeemedAt?: string;
}

export interface EscrowLedgerEntry {
  id: string;
  transactionId: string;
  orderId: string;
  giftCardId?: string;
  entryType: LedgerEntryType;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  currency: string;
  fxRateApplied?: number;
  merchantId?: string;
  commissionAmount?: number;
  referenceId: string;
  description: string;
  createdAt: string;
}

export interface OtpSession {
  id: string;
  giftCardId: string;
  phoneNumber: string;
  otpCode: string;
  expiresAt: string;
  verified: boolean;
  attempts: number;
}

export interface RedemptionRecord {
  id: string;
  giftCardId: string;
  cardNumber: string;
  orderId: string;
  merchantId: string;
  merchantName: string;
  cashierName: string;
  posTerminalId: string;
  redeemedAmount: number;
  currency: TargetCurrency;
  commissionFee: number;
  netMerchantPayout: number;
  verifiedOtp: string;
  receiverPhone: string;
  timestamp: string;
  escrowLedgerId: string;
}

export interface FXQuote {
  sourceCurrency: SourceCurrency;
  targetCurrency: TargetCurrency;
  rate: number;
  inverseRate: number;
  expiresInSeconds: number;
  expiresAt: string;
  networkFeePercent: number;
  escrowGuaranteed: boolean;
}

export interface MerchantBatchSettlement {
  id: string;
  batchReference: string; // e.g. "BATCH-SETTLE-2026-W34-MELCOM"
  merchantId: string;
  merchantName: string;
  currency: TargetCurrency;
  grossRedemptionsTotal: number;
  commissionFeeTotal: number;
  commissionRatePercent: number;
  netPayoutAmount: number;
  redemptionCount: number;
  settlementStatus: 'PENDING' | 'PROCESSING' | 'SETTLED';
  destinationBank: string;
  destinationAccountNumber: string;
  payoutTxHash: string;
  settledAt: string;
  periodStart: string;
  periodEnd: string;
}

export interface DeepBarcodeValidationResponse {
  valid: boolean;
  giftCardId: string;
  cardNumber: string;
  ean13Code: string;
  status: GiftCardStatus;
  purposeCategory: PurposeCategory;
  authorizedMerchantId: string;
  authorizedMerchantName: string;
  isMerchantMatch: boolean;
  availableBalance: number;
  currency: TargetCurrency;
  receiverName: string;
  maskedPhone: string;
  otpRequired: boolean;
  expiresAt: string;
  integrationMode: 'DEEP_ENTERPRISE_POS';
}

export interface LightReconciliationResponse {
  success: boolean;
  reconciliationReference: string;
  merchantId: string;
  merchantName: string;
  cardNumber: string;
  amountClaimed: number;
  currency: TargetCurrency;
  commissionDeducted: number;
  netPayableToMerchant: number;
  cashierTerminalRef: string;
  batchSettlementQueued: boolean;
  settlementBatchId: string;
  reconciledAt: string;
  integrationMode: 'LIGHT_PORTAL_USSD';
}

