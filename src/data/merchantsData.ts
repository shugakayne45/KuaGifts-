/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Merchant, FXQuote, SourceCurrency, TargetCurrency } from '../types.ts';

export const MERCHANTS: Merchant[] = [
  {
    id: 'merch_melcom_gh',
    name: 'Melcom Superstores',
    category: 'GROCERIES_FOOD',
    country: 'GH',
    tagline: 'Where Ghana Shops for Groceries, Hampers & Homeware',
    logo: '🏬',
    verified: true,
    commissionRate: 0.045, // 4.5% Points Africa coalition rail
    acceptedCurrencies: ['GHS'],
    branches: [
      { id: 'b_mel_01', name: 'Melcom Accra Mall (Tetteh Quarshie)', address: 'Spintex Rd / Tetteh Quarshie Interchange', city: 'Accra', country: 'GH', posTerminalId: 'POS-MEL-ACC-01' },
      { id: 'b_mel_02', name: 'Melcom Plus Kaneshie', address: 'Kaneshie High St', city: 'Accra', country: 'GH', posTerminalId: 'POS-MEL-KAN-02' },
      { id: 'b_mel_03', name: 'Melcom Kumasi Adum', address: 'Prempeh II Ave', city: 'Kumasi', country: 'GH', posTerminalId: 'POS-MEL-KSI-03' },
      { id: 'b_mel_04', name: 'Melcom Takoradi Market Circle', address: 'Liberation Rd', city: 'Takoradi', country: 'GH', posTerminalId: 'POS-MEL-TAK-04' }
    ],
    supportedPosBarcodes: ['EAN-13', 'CODE-128', 'QR'],
    description: 'National retail chain with 60+ hypermarkets across Ghana. Instant barcode scanning at all cash checkout counters.'
  },
  {
    id: 'merch_shoprite_ng',
    name: 'Shoprite Nigeria',
    category: 'GROCERIES_FOOD',
    country: 'NG',
    tagline: 'Fresh Groceries, Holiday Hampers & Festive Foods',
    logo: '🛒',
    verified: true,
    commissionRate: 0.04, // 4.0%
    acceptedCurrencies: ['NGN'],
    branches: [
      { id: 'b_shp_01', name: 'Shoprite Ikeja City Mall', address: 'Obafemi Awolowo Way, Alausa', city: 'Lagos', country: 'NG', posTerminalId: 'POS-SHP-IKJ-01' },
      { id: 'b_shp_02', name: 'Shoprite The Palms Lekki', address: '1 Bisway St, Maroko', city: 'Lagos', country: 'NG', posTerminalId: 'POS-SHP-LKK-02' },
      { id: 'b_shp_03', name: 'Shoprite Grand Towers Mall', address: 'Maitama Ext', city: 'Abuja', country: 'NG', posTerminalId: 'POS-SHP-ABJ-03' },
      { id: 'b_shp_04', name: 'Shoprite Polo Park', address: 'Abakaliki Rd', city: 'Enugu', country: 'NG', posTerminalId: 'POS-SHP-ENU-04' }
    ],
    supportedPosBarcodes: ['EAN-13', 'UPC-A', 'QR'],
    description: 'Premier supermarket chain offering high-quality grocery hampers, butchery, bakery, and festive provisions across Nigeria.'
  },
  {
    id: 'merch_total_gh',
    name: 'TotalEnergies Ghana',
    category: 'FUEL_TRANSPORT',
    country: 'GH',
    tagline: 'Excellium Petrol, Diesel, Bonjour Mart & Cooking Gas (LPG)',
    logo: '⛽',
    verified: true,
    commissionRate: 0.035, // 3.5%
    acceptedCurrencies: ['GHS'],
    branches: [
      { id: 'b_tot_01', name: 'TotalEnergies Liberation Rd / Airport', address: 'Liberation Rd, Airport Residential', city: 'Accra', country: 'GH', posTerminalId: 'POS-TOT-AIR-01' },
      { id: 'b_tot_02', name: 'TotalEnergies Spintex 18 Junction', address: 'Spintex Main Rd', city: 'Accra', country: 'GH', posTerminalId: 'POS-TOT-SPX-02' },
      { id: 'b_tot_03', name: 'TotalEnergies Kumasi Stadium Rd', address: 'Asokwa', city: 'Kumasi', country: 'GH', posTerminalId: 'POS-TOT-KMS-03' }
    ],
    supportedPosBarcodes: ['CODE-128', 'QR'],
    description: 'Purpose-locked fuel vouchers and Bonjour convenience store provisions across 250+ service stations.'
  },
  {
    id: 'merch_medplus_ng',
    name: 'Medplus Pharmacy Nigeria',
    category: 'HEALTHCARE_PHARMACY',
    country: 'NG',
    tagline: 'Prescription Medicines, Chronic Care & Family Wellness',
    logo: '💊',
    verified: true,
    commissionRate: 0.05, // 5.0%
    acceptedCurrencies: ['NGN'],
    branches: [
      { id: 'b_med_01', name: 'Medplus Victoria Island', address: 'Adeola Odeku St', city: 'Lagos', country: 'NG', posTerminalId: 'POS-MED-VI-01' },
      { id: 'b_med_02', name: 'Medplus Garki II', address: 'Ahmadu Bello Way', city: 'Abuja', country: 'NG', posTerminalId: 'POS-MED-GAR-02' },
      { id: 'b_med_03', name: 'Medplus GRA Phase 2', address: 'Tombia St', city: 'Port Harcourt', country: 'NG', posTerminalId: 'POS-MED-PH-03' }
    ],
    supportedPosBarcodes: ['EAN-13', 'CODE-128', 'QR'],
    description: 'Nigeria’s leading healthcare retail network. Restricts vouchers specifically to licensed pharmaceuticals and clinical care.'
  },
  {
    id: 'merch_healthlane_gh',
    name: 'Healthlane Pharmacy Ghana',
    category: 'HEALTHCARE_PHARMACY',
    country: 'GH',
    tagline: 'Quality Pharmaceuticals, Diagnostics & Elderly Care',
    logo: '🏥',
    verified: true,
    commissionRate: 0.05, // 5.0%
    acceptedCurrencies: ['GHS'],
    branches: [
      { id: 'b_hlt_01', name: 'Healthlane East Legon', address: 'Lagos Ave', city: 'Accra', country: 'GH', posTerminalId: 'POS-HLT-LEG-01' },
      { id: 'b_hlt_02', name: 'Healthlane Osu Oxford Street', address: 'Oxford St, Osu', city: 'Accra', country: 'GH', posTerminalId: 'POS-HLT-OSU-02' },
      { id: 'b_hlt_03', name: 'Healthlane Ahodwo', address: 'Ahodwo Roundabout', city: 'Kumasi', country: 'GH', posTerminalId: 'POS-HLT-KUM-03' }
    ],
    supportedPosBarcodes: ['EAN-13', 'QR'],
    description: 'Ensure medical remittances are never diverted. Redeemable for critical prescriptions, maternity supplies, and routine checkups.'
  },
  {
    id: 'merch_mtn_gh',
    name: 'MTN Ghana Connectivity & Power',
    category: 'UTILITIES_POWER',
    country: 'GH',
    tagline: 'Home Fibre, Prepaid Electricity (ECG) & High-Speed 5G Data',
    logo: '⚡',
    verified: true,
    commissionRate: 0.03, // 3.0%
    acceptedCurrencies: ['GHS'],
    branches: [
      { id: 'b_mtn_01', name: 'MTN Service Centre Osu', address: 'Ring Rd East', city: 'Accra', country: 'GH', posTerminalId: 'POS-MTN-OSU-01' },
      { id: 'b_mtn_02', name: 'MTN Service Centre Ridge', address: 'Independence Ave', city: 'Accra', country: 'GH', posTerminalId: 'POS-MTN-RDG-02' }
    ],
    supportedPosBarcodes: ['CODE-128', 'QR'],
    description: 'Instant utility bill settlements, ECG prepaid electricity top-ups, and unlimited family broadband packages.'
  },
  {
    id: 'merch_spar_ng',
    name: 'SPAR Hypermarket Nigeria',
    category: 'HOLIDAY_HAMPER',
    country: 'NG',
    tagline: 'Curated Christmas Hampers, Electronics & Household Goods',
    logo: '🎄',
    verified: true,
    commissionRate: 0.045, // 4.5%
    acceptedCurrencies: ['NGN'],
    branches: [
      { id: 'b_spr_01', name: 'SPAR Lekki Expressway', address: 'Ikate Elegushi, Lekki', city: 'Lagos', country: 'NG', posTerminalId: 'POS-SPR-LKK-01' },
      { id: 'b_spr_02', name: 'SPAR Ceddi Plaza', address: 'Central Business District', city: 'Abuja', country: 'NG', posTerminalId: 'POS-SPR-CBD-02' }
    ],
    supportedPosBarcodes: ['EAN-13', 'QR'],
    description: 'Specialized holiday hamper distributor. Barcodes apply directly to festive packages, confectionery, turkeys, and electronics.'
  },
  {
    id: 'merch_palace_gh',
    name: 'Palace Mall Hypermarket',
    category: 'HOLIDAY_HAMPER',
    country: 'GH',
    tagline: 'Gourmet Christmas Hampers, Delicatessen & Electronics',
    logo: '🎁',
    verified: true,
    commissionRate: 0.042, // 4.2%
    acceptedCurrencies: ['GHS'],
    branches: [
      { id: 'b_pal_01', name: 'Palace Mall Spintex Road', address: 'Flower Pot / Spintex Rd', city: 'Accra', country: 'GH', posTerminalId: 'POS-PAL-SPX-01' },
      { id: 'b_pal_02', name: 'Palace Mall Tema Comm 25', address: 'Tema Community 25 Mall', city: 'Tema', country: 'GH', posTerminalId: 'POS-PAL-TEM-02' }
    ],
    supportedPosBarcodes: ['EAN-13', 'CODE-128', 'QR'],
    description: 'Accra’s premier destination for luxury holiday gift hampers, imported cheeses, wines, and home decor.'
  }
];

export const PURPOSE_CONFIG: Record<string, { label: string; icon: string; description: string; antiArbitrageRule: string }> = {
  GROCERIES_FOOD: {
    label: 'Groceries & Provisions',
    icon: '🛒',
    description: 'Fresh food, staples, rice, oil, and festive provisions at verified supermarket checkout lanes.',
    antiArbitrageRule: 'Cashier checkout locks item category. Zero cash-back allowed.'
  },
  HOLIDAY_HAMPER: {
    label: 'Festive Holiday Hampers',
    icon: '🎁',
    description: 'Curated Christmas & New Year luxury hampers, treats, and gifts for family back home.',
    antiArbitrageRule: 'Redeemable for sealed gift packages & seasonal items.'
  },
  HEALTHCARE_PHARMACY: {
    label: 'Healthcare & Pharmacy',
    icon: '💊',
    description: 'Prescription medicines, chronic disease management, maternity and diagnostics.',
    antiArbitrageRule: 'Strictly restricted to licensed pharmacist counter validation.'
  },
  FUEL_TRANSPORT: {
    label: 'Fuel, LPG & Transport',
    icon: '⛽',
    description: 'Automotive petrol, diesel, cooking gas (LPG), and service station provisions.',
    antiArbitrageRule: 'Pump attendant scan with instant electronic fuel receipt.'
  },
  UTILITIES_POWER: {
    label: 'Electricity & Utilities',
    icon: '⚡',
    description: 'Prepaid power (ECG/NEPA/Disco), clean water tokens, and family fiber broadband.',
    antiArbitrageRule: 'Direct account meter credit with zero cash disbursement.'
  },
  EDUCATION_BOOKS: {
    label: 'School Fees & Supplies',
    icon: '📚',
    description: 'School term tuition vouchers, textbooks, uniforms, and stationary stores.',
    antiArbitrageRule: 'Direct bursar/bookshop POS redemption.'
  }
};

// Real-time indicative locked FX rates with Escrow guarantee
export const FX_BASE_RATES: Record<SourceCurrency, Record<TargetCurrency, number>> = {
  USD: {
    GHS: 15.65,
    NGN: 1520.00
  },
  GBP: {
    GHS: 19.85,
    NGN: 1935.50
  },
  EUR: {
    GHS: 16.92,
    NGN: 1648.00
  },
  CAD: {
    GHS: 11.45,
    NGN: 1115.00
  }
};

export function getLockedQuote(sourceCurrency: SourceCurrency, targetCurrency: TargetCurrency, amount: number): FXQuote {
  const baseRate = FX_BASE_RATES[sourceCurrency][targetCurrency];
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minute lock
  
  return {
    sourceCurrency,
    targetCurrency,
    rate: baseRate,
    inverseRate: +(1 / baseRate).toFixed(6),
    expiresInSeconds: 900,
    expiresAt,
    networkFeePercent: 0, // Zero fee for senders
    escrowGuaranteed: true
  };
}
