/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Database, 
  ShieldCheck, 
  Code, 
  RefreshCw, 
  ArrowRight, 
  TrendingUp, 
  Lock, 
  CheckCircle2, 
  Layers, 
  FileCode, 
  Play, 
  Copy,
  Terminal,
  Activity
} from 'lucide-react';
import { EscrowLedgerEntry, RedemptionRecord } from '../types.ts';

export const LedgerExplorer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'LEDGER' | 'BATCH_SETTLEMENTS' | 'ARCHITECTURE' | 'SCHEMA' | 'API_TESTER'>('LEDGER');
  
  const [ledgerEntries, setLedgerEntries] = useState<EscrowLedgerEntry[]>([]);
  const [batchSettlements, setBatchSettlements] = useState<any[]>([]);
  const [ledgerSummary, setLedgerSummary] = useState<any>(null);
  const [prismaSchema, setPrismaSchema] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [copiedSchema, setCopiedSchema] = useState<boolean>(false);
  const [batchTriggering, setBatchTriggering] = useState<boolean>(false);

  // API Tester State
  const [apiEndpoint, setApiEndpoint] = useState<string>('/api/v1/health');
  const [apiMethod, setApiMethod] = useState<'GET' | 'POST'>('GET');
  const [apiRequestBody, setApiRequestBody] = useState<string>('{\n  "barcodeOrToken": "6189421045238",\n  "posTerminalId": "POS-MEL-ACC-01"\n}');
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiRunning, setApiRunning] = useState<boolean>(false);

  const fetchLedgerData = async () => {
    setLoading(true);
    try {
      const [entriesRes, summaryRes, schemaRes, batchesRes] = await Promise.all([
        fetch('/api/v1/ledger/records'),
        fetch('/api/v1/ledger/summary'),
        fetch('/api/v1/schema/prisma'),
        fetch('/api/v1/settlements/batches')
      ]);

      const entriesJson = await entriesRes.json();
      const summaryJson = await summaryRes.json();
      const schemaText = await schemaRes.text();
      const batchesJson = await batchesRes.json();

      if (entriesJson.success) setLedgerEntries(entriesJson.data);
      if (summaryJson.success) setLedgerSummary(summaryJson.data);
      if (batchesJson.success) setBatchSettlements(batchesJson.data);
      setPrismaSchema(schemaText);
    } catch (err) {
      console.error('Error fetching ledger data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerWeeklyBatch = async () => {
    setBatchTriggering(true);
    try {
      const res = await fetch('/api/v1/settlements/weekly-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (data.success) {
        await fetchLedgerData();
        setActiveTab('BATCH_SETTLEMENTS');
      }
    } catch (err) {
      console.error('Error triggering weekly batch:', err);
    } finally {
      setBatchTriggering(false);
    }
  };

  useEffect(() => {
    fetchLedgerData();
  }, []);

  const handleRunApiTest = async () => {
    setApiRunning(true);
    setApiResponse(null);
    try {
      const options: RequestInit = {
        method: apiMethod,
        headers: { 'Content-Type': 'application/json' }
      };

      if (apiMethod === 'POST') {
        options.body = apiRequestBody;
      }

      const res = await fetch(apiEndpoint, options);
      const data = await res.json();
      setApiResponse({ status: res.status, ok: res.ok, data });
    } catch (err: any) {
      setApiResponse({ status: 'Error', ok: false, error: err.message });
    } finally {
      setApiRunning(false);
    }
  };

  const copySchemaText = () => {
    navigator.clipboard.writeText(prismaSchema);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Header & Subtabs */}
      <div className="bg-white border border-slate-200/90 rounded-sm p-6 md:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-[#006837]" />
            <h1 className="font-editorial text-2xl md:text-3xl font-bold text-[#0F1C13] italic">
              Escrow Ledger & System Architecture
            </h1>
          </div>
          <p className="text-xs text-[#4A5568] mt-1 font-mono text-[11px]">
            Real-time double-entry custodial accounting, PostgreSQL schema, and REST API controller inspector.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex flex-wrap items-center bg-slate-100 p-1 rounded-sm border border-slate-200">
          <button
            onClick={() => setActiveTab('LEDGER')}
            className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-mono font-bold rounded-sm transition-all ${
              activeTab === 'LEDGER'
                ? 'bg-[#006837] text-white shadow-xs'
                : 'text-[#4A5568] hover:text-[#0F1C13]'
            }`}
          >
            Escrow Ledger
          </button>
          <button
            onClick={() => setActiveTab('BATCH_SETTLEMENTS')}
            className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-mono font-bold rounded-sm transition-all ${
              activeTab === 'BATCH_SETTLEMENTS'
                ? 'bg-[#006837] text-white shadow-xs'
                : 'text-[#4A5568] hover:text-[#0F1C13]'
            }`}
          >
            Merchant Settlements
          </button>
          <button
            onClick={() => setActiveTab('ARCHITECTURE')}
            className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-mono font-bold rounded-sm transition-all ${
              activeTab === 'ARCHITECTURE'
                ? 'bg-[#006837] text-white shadow-xs'
                : 'text-[#4A5568] hover:text-[#0F1C13]'
            }`}
          >
            Blueprint
          </button>
          <button
            onClick={() => setActiveTab('SCHEMA')}
            className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-mono font-bold rounded-sm transition-all ${
              activeTab === 'SCHEMA'
                ? 'bg-[#006837] text-white shadow-xs'
                : 'text-[#4A5568] hover:text-[#0F1C13]'
            }`}
          >
            PostgreSQL
          </button>
          <button
            onClick={() => setActiveTab('API_TESTER')}
            className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-mono font-bold rounded-sm transition-all ${
              activeTab === 'API_TESTER'
                ? 'bg-[#006837] text-white shadow-xs'
                : 'text-[#4A5568] hover:text-[#0F1C13]'
            }`}
          >
            API Playground
          </button>
        </div>
      </div>

      {/* Financial Summary Stats Strip */}
      {ledgerSummary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          
          <div className="bg-white border border-slate-200/90 rounded-sm p-4 shadow-xs">
            <span className="text-[9px] uppercase font-mono text-[#4A5568] tracking-wider block font-semibold">Foreign Deposits</span>
            <div className="text-base font-mono font-bold text-[#0F1C13] mt-1">
              £{ledgerSummary.totalDepositsGBP.toFixed(2)} / ${ledgerSummary.totalDepositsUSD.toFixed(2)}
            </div>
            <span className="text-[9px] text-[#006837] font-mono mt-0.5 block uppercase font-bold">Paystack / Flutterwave</span>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-sm p-4 shadow-xs">
            <span className="text-[9px] uppercase font-mono text-[#4A5568] tracking-wider block font-semibold">Ring-Fenced Escrow</span>
            <div className="text-base font-mono font-bold text-[#006837] mt-1">
              GHS {ledgerSummary.totalEscrowHeldGHS.toLocaleString()} / ₦{ledgerSummary.totalEscrowHeldNGN.toLocaleString()}
            </div>
            <span className="text-[9px] text-[#006837] font-mono mt-0.5 block uppercase font-bold">Guaranteed FX Locked</span>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-sm p-4 shadow-xs">
            <span className="text-[9px] uppercase font-mono text-[#4A5568] tracking-wider block font-semibold">Merchant Settlements</span>
            <div className="text-base font-mono font-bold text-emerald-800 mt-1">
              GHS {ledgerSummary.totalRedeemedGHS.toLocaleString()} / ₦{ledgerSummary.totalRedeemedNGN.toLocaleString()}
            </div>
            <span className="text-[9px] text-[#4A5568] font-mono mt-0.5 block uppercase">{ledgerSummary.totalRedemptionsCount} POS Checkouts</span>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-sm p-4 shadow-xs">
            <span className="text-[9px] uppercase font-mono text-[#4A5568] tracking-wider block font-semibold">Coalition Commission</span>
            <div className="text-base font-mono font-bold text-[#C41E3A] mt-1">
              GHS {ledgerSummary.totalCommissionEarnedGHS.toFixed(2)} / ₦{ledgerSummary.totalCommissionEarnedNGN.toFixed(2)}
            </div>
            <span className="text-[9px] text-[#4A5568] font-mono mt-0.5 block uppercase">3.0% – 5.0% Interchange</span>
          </div>

        </div>
      )}

      {/* TAB 1: DOUBLE-ENTRY LEDGER TABLE */}
      {activeTab === 'LEDGER' && (
        <div className="bg-white border border-slate-200/90 rounded-sm p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-editorial text-2xl font-bold text-[#0F1C13] italic">
                Double-Entry Escrow Audit Trail
              </h2>
              <p className="text-xs text-[#4A5568] mt-0.5">
                Every transaction generates immutable balancing debit and credit entries.
              </p>
            </div>
            <button
              onClick={fetchLedgerData}
              className="p-2 rounded-sm bg-slate-50 border border-slate-200 text-[#006837] hover:bg-slate-100 text-xs uppercase tracking-wider font-bold flex items-center space-x-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-sm border border-slate-200">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 text-[#006837] text-[10px] uppercase tracking-wider border-b border-slate-200 font-bold">
                <tr>
                  <th className="p-3">Tx ID</th>
                  <th className="p-3">Entry Type</th>
                  <th className="p-3">Debit Account</th>
                  <th className="p-3">Credit Account</th>
                  <th className="p-3 text-right">Amount</th>
                  <th className="p-3">Reference / Description</th>
                  <th className="p-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ledgerEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-[#0F1C13] whitespace-nowrap">{entry.transactionId}</td>
                    <td className="p-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-sm text-[9px] font-mono uppercase font-bold ${
                        entry.entryType === 'SENDER_DEPOSIT_HELD' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        entry.entryType === 'FX_CONVERSION_LOCK' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                        entry.entryType === 'POS_SCAN_RESERVATION' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                        entry.entryType === 'MERCHANT_SETTLEMENT_RELEASE' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                        'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {entry.entryType}
                      </span>
                    </td>
                    <td className="p-3 text-amber-800 font-semibold">{entry.debitAccount}</td>
                    <td className="p-3 text-emerald-800 font-semibold">{entry.creditAccount}</td>
                    <td className="p-3 text-right font-bold text-[#0F1C13] whitespace-nowrap">
                      {entry.currency} {entry.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-[#4A5568] max-w-xs truncate" title={entry.description}>
                      {entry.description}
                    </td>
                    <td className="p-3 text-[#718096] whitespace-nowrap">
                      {new Date(entry.createdAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: MERCHANT WEEKLY BATCH SETTLEMENTS */}
      {activeTab === 'BATCH_SETTLEMENTS' && (
        <div className="bg-white border border-slate-200/90 rounded-sm p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-sm bg-emerald-50 text-[#006837] font-mono text-[9px] uppercase font-bold border border-emerald-200">
                  Custodial Escrow Disbursal Rail
                </span>
              </div>
              <h2 className="font-editorial text-2xl font-bold text-[#0F1C13] italic mt-1">
                Weekly Merchant Batch Settlements
              </h2>
              <p className="text-xs text-[#4A5568] mt-0.5">
                Aggregated merchant redemptions settled via automated ACH/NIP banking rails minus platform interchange fee (3.5%–7.0%).
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleTriggerWeeklyBatch}
                disabled={batchTriggering}
                className="px-4 py-2 rounded-sm bg-[#C41E3A] hover:bg-[#a51830] text-white text-xs uppercase font-bold tracking-wider flex items-center space-x-1.5 shadow-md active:scale-98 disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{batchTriggering ? 'Executing Batch...' : 'Run Weekly Settlement Batch'}</span>
              </button>
              <button
                onClick={fetchLedgerData}
                className="p-2 rounded-sm bg-slate-50 border border-slate-200 text-[#006837] hover:bg-slate-100"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-sm p-4">
              <span className="text-[9px] uppercase font-mono text-[#4A5568] tracking-wider font-semibold">Settled Batches</span>
              <div className="text-2xl font-mono font-black text-[#006837] mt-1">{batchSettlements.length} Cycles</div>
              <span className="text-[10px] text-emerald-800 font-mono mt-0.5 block font-bold">100% ACH / NIP Cleared</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-sm p-4">
              <span className="text-[9px] uppercase font-mono text-[#4A5568] tracking-wider font-semibold">Settlement Method</span>
              <div className="text-sm font-mono font-bold text-[#0F1C13] mt-1">Direct Bank Wire (ACH/NIP)</div>
              <span className="text-[10px] text-[#006837] font-mono mt-0.5 block font-bold">Stanbic Ghana & GTBank Nigeria</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-sm p-4">
              <span className="text-[9px] uppercase font-mono text-[#4A5568] tracking-wider font-semibold">Platform Take Rate</span>
              <div className="text-2xl font-mono font-black text-[#C41E3A] mt-1">3.5% – 7.0%</div>
              <span className="text-[10px] text-[#4A5568] font-mono mt-0.5 block">Deducted at settlement release</span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-sm border border-slate-200">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 text-[#006837] text-[10px] uppercase tracking-wider border-b border-slate-200 font-bold">
                <tr>
                  <th className="p-3">Batch Reference</th>
                  <th className="p-3">Merchant</th>
                  <th className="p-3 text-right">Gross Claimed</th>
                  <th className="p-3 text-right">Commission Fee</th>
                  <th className="p-3 text-right">Net Payout</th>
                  <th className="p-3">Destination Bank & Account</th>
                  <th className="p-3">ACH / Wire Hash</th>
                  <th className="p-3">Settled At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {batchSettlements.map((batch: any) => (
                  <tr key={batch.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-[#0F1C13] whitespace-nowrap">
                      {batch.batchReference}
                    </td>
                    <td className="p-3 whitespace-nowrap font-medium text-[#0F1C13]">
                      {batch.merchantName}
                      <span className="block text-[9px] text-[#4A5568]">
                        {batch.redemptionCount} redemptions in period
                      </span>
                    </td>
                    <td className="p-3 text-right font-bold text-[#0F1C13] whitespace-nowrap">
                      {batch.currency} {Number(batch.grossRedemptionsTotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-right text-[#C41E3A] font-bold whitespace-nowrap">
                      -{batch.currency} {Number(batch.commissionFeeTotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      <span className="block text-[9px] text-[#4A5568] font-normal">
                        ({batch.commissionRatePercent}%)
                      </span>
                    </td>
                    <td className="p-3 text-right font-black text-emerald-800 whitespace-nowrap">
                      {batch.currency} {Number(batch.netPayoutAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-[#4A5568] text-[11px] whitespace-nowrap">
                      <div>{batch.destinationBank}</div>
                      <div className="text-[10px] text-[#006837] font-bold">{batch.destinationAccountNumber}</div>
                    </td>
                    <td className="p-3 font-mono text-[10px] text-[#006837] whitespace-nowrap font-semibold">
                      <span className="bg-slate-50 px-2 py-1 rounded border border-slate-200">
                        {batch.payoutTxHash}
                      </span>
                    </td>
                    <td className="p-3 text-[#4A5568] whitespace-nowrap text-[11px]">
                      {new Date(batch.settledAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: MONEY-FLOW ARCHITECTURE BLUEPRINT */}
      {activeTab === 'ARCHITECTURE' && (
        <div className="bg-white border border-slate-200/90 rounded-sm p-6 md:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="font-editorial text-2xl font-bold text-[#0F1C13] italic">
              Escrow Money-Flow & Dual-Factor Security Blueprint
            </h2>
            <p className="text-xs text-[#4A5568] mt-1">
              End-to-end lifecycle architecture preventing cash diversion and remittance arbitrage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            
            <div className="bg-slate-50 border border-slate-200 rounded-sm p-4 space-y-2 flex flex-col justify-between">
              <div>
                <div className="w-7 h-7 rounded-sm bg-blue-100 text-blue-800 flex items-center justify-center font-mono font-bold text-xs mb-2">
                  01
                </div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#0F1C13]">Diaspora FX Deposit</h4>
                <p className="text-[11px] text-[#4A5568] leading-relaxed mt-1">
                  Sender deposits USD/GBP. FX rate is locked and guaranteed for 15 minutes.
                </p>
              </div>
              <div className="text-[9px] font-mono text-blue-900 bg-blue-50 border border-blue-200 p-2 rounded-sm mt-2">
                Debit: PSP_COLLECTION_USD<br/>
                Credit: ESCROW_SOURCE_LIABILITY
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-sm p-4 space-y-2 flex flex-col justify-between">
              <div>
                <div className="w-7 h-7 rounded-sm bg-purple-100 text-purple-800 flex items-center justify-center font-mono font-bold text-xs mb-2">
                  02
                </div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#0F1C13]">Ring-Fenced Custody</h4>
                <p className="text-[11px] text-[#4A5568] leading-relaxed mt-1">
                  Funds locked in GHS/NGN custodial pool with merchant purpose binding.
                </p>
              </div>
              <div className="text-[9px] font-mono text-purple-900 bg-purple-50 border border-purple-200 p-2 rounded-sm mt-2">
                Debit: ESCROW_SOURCE_LIABILITY<br/>
                Credit: RING_FENCED_ESCROW_GHS
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-sm p-4 space-y-2 flex flex-col justify-between">
              <div>
                <div className="w-7 h-7 rounded-sm bg-amber-100 text-amber-800 flex items-center justify-center font-mono font-bold text-xs mb-2">
                  03
                </div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#0F1C13]">POS Barcode Scan</h4>
                <p className="text-[11px] text-[#4A5568] leading-relaxed mt-1">
                  Receiver presents optical barcode at checkout. Cashier POS gun scans EAN-13.
                </p>
              </div>
              <div className="text-[9px] font-mono text-amber-900 bg-amber-50 border border-amber-200 p-2 rounded-sm mt-2">
                Route: /api/v1/giftcards/redeem-otp<br/>
                Action: Temp POS Hold
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-sm p-4 space-y-2 flex flex-col justify-between">
              <div>
                <div className="w-7 h-7 rounded-sm bg-red-100 text-red-800 flex items-center justify-center font-mono font-bold text-xs mb-2">
                  04
                </div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#0F1C13]">Dual-Factor OTP</h4>
                <p className="text-[11px] text-[#4A5568] leading-relaxed mt-1">
                  System sends 6-digit OTP to receiver's phone. Cashier enters OTP into terminal.
                </p>
              </div>
              <div className="text-[9px] font-mono text-red-900 bg-red-50 border border-red-200 p-2 rounded-sm mt-2">
                Security: Anti-Arbitrage<br/>
                Phone Binding: Verified
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-sm p-4 space-y-2 flex flex-col justify-between">
              <div>
                <div className="w-7 h-7 rounded-sm bg-emerald-100 text-emerald-800 flex items-center justify-center font-mono font-bold text-xs mb-2">
                  05
                </div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#0F1C13]">Instant Settlement</h4>
                <p className="text-[11px] text-[#4A5568] leading-relaxed mt-1">
                  95.5% disbursed to Merchant bank account, 4.5% retained by Coalition Network rail.
                </p>
              </div>
              <div className="text-[9px] font-mono text-emerald-900 bg-emerald-50 border border-emerald-200 p-2 rounded-sm mt-2">
                Route: /verify-and-redeem<br/>
                Debit: RING_FENCED_ESCROW
              </div>
            </div>

          </div>

          <div className="bg-slate-50 p-5 rounded-sm border border-slate-200 flex items-start space-x-3 text-xs text-[#0F1C13]">
            <ShieldCheck className="w-5 h-5 text-[#006837] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#0F1C13] block mb-1">Coalition Network Rail Model (Points Africa Interchange)</strong>
              Traditional remittance platforms suffer from 40%+ fund diversion where receivers cash out money intended for holiday food, electricity, or prescription medications. KuaGifts locks the value into verified optical barcodes that only settle upon physical retail checkout with dynamic dual-factor SMS verification.
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: POSTGRESQL & PRISMA SCHEMA */}
      {activeTab === 'SCHEMA' && (
        <div className="bg-white border border-slate-200/90 rounded-sm p-6 md:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-editorial text-2xl font-bold text-[#0F1C13] italic">
                PostgreSQL Database Schema (schema.prisma)
              </h2>
              <p className="text-xs text-[#4A5568] mt-0.5">
                Production-ready database model for Users, Orders, GiftCards, EscrowLedger, OtpSessions, and Merchants.
              </p>
            </div>
            <button
              onClick={copySchemaText}
              className="px-3 py-1.5 rounded-sm bg-[#006837] text-white font-bold text-xs uppercase tracking-wider flex items-center space-x-1 hover:bg-[#00522c]"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedSchema ? 'Copied!' : 'Copy Schema'}</span>
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-sm p-4 max-h-[500px] overflow-y-auto font-mono text-xs text-emerald-300 leading-relaxed">
            <pre>{prismaSchema || '// Loading schema.prisma...'}</pre>
          </div>
        </div>
      )}

      {/* TAB 4: API CONTROLLER PLAYGROUND */}
      {activeTab === 'API_TESTER' && (
        <div className="bg-white border border-slate-200/90 rounded-sm p-6 md:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="font-editorial text-2xl font-bold text-[#0F1C13] italic">
              REST API Controller Playground (/api/v1)
            </h2>
            <p className="text-xs text-[#4A5568] mt-0.5">
              Live test the KuaGifts Express controller endpoints.
            </p>
          </div>

          {/* Quick Endpoint Selector Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setApiEndpoint('/api/v1/health');
                setApiMethod('GET');
              }}
              className="px-3 py-1 text-xs rounded-sm bg-slate-50 text-[#006837] border border-slate-200 font-mono hover:border-[#006837] font-semibold"
            >
              GET /api/v1/health
            </button>
            <button
              onClick={() => {
                setApiEndpoint('/api/v1/merchants');
                setApiMethod('GET');
              }}
              className="px-3 py-1 text-xs rounded-sm bg-slate-50 text-[#006837] border border-slate-200 font-mono hover:border-[#006837] font-semibold"
            >
              GET /api/v1/merchants
            </button>
            <button
              onClick={() => {
                setApiEndpoint('/api/v1/orders/quote-fx');
                setApiMethod('POST');
                setApiRequestBody(JSON.stringify({ sourceCurrency: 'GBP', targetCurrency: 'GHS', amount: 100 }, null, 2));
              }}
              className="px-3 py-1 text-xs rounded-sm bg-slate-50 text-[#006837] border border-slate-200 font-mono hover:border-[#006837] font-semibold"
            >
              POST /api/v1/orders/quote-fx
            </button>
            <button
              onClick={() => {
                setApiEndpoint('/api/v1/giftcards/redeem-otp');
                setApiMethod('POST');
                setApiRequestBody(JSON.stringify({ barcodeOrToken: '6189421045238', posTerminalId: 'POS-MEL-ACC-01', cashierName: 'Cashier Kofi' }, null, 2));
              }}
              className="px-3 py-1 text-xs rounded-sm bg-red-50 text-[#C41E3A] border border-red-200 font-mono hover:bg-red-100 font-bold"
            >
              POST /api/v1/giftcards/redeem-otp (Dual-Factor)
            </button>
            <button
              onClick={() => {
                setApiEndpoint('/api/v1/giftcards/verify-and-redeem');
                setApiMethod('POST');
                setApiRequestBody(JSON.stringify({ barcodeOrCard: '6189421045238', otpCode: '849201', amountToRedeem: 50, posTerminalId: 'POS-MEL-ACC-01', cashierName: 'Cashier Kofi' }, null, 2));
              }}
              className="px-3 py-1 text-xs rounded-sm bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono hover:bg-emerald-100 font-bold"
            >
              POST /api/v1/giftcards/verify-and-redeem
            </button>
            <button
              onClick={() => {
                setApiEndpoint('/api/v1/merchant/deep/validate-barcode');
                setApiMethod('POST');
                setApiRequestBody(JSON.stringify({ barcode: '6189421045238', posTerminalId: 'POS-MELCOM-ACCRA-GUN-01', merchantId: 'merch_melcom_gh' }, null, 2));
              }}
              className="px-3 py-1 text-xs rounded-sm bg-amber-50 text-amber-900 border border-amber-200 font-mono hover:bg-amber-100 font-bold"
            >
              POST /api/v1/merchant/deep/validate-barcode
            </button>
            <button
              onClick={() => {
                setApiEndpoint('/api/v1/merchant/light/reconcile-code');
                setApiMethod('POST');
                setApiRequestBody(JSON.stringify({ manualCode: 'KG-GH-2026-X892', otpCode: '849201', amountToRedeem: 150, cashierName: 'Adwoa Mensah', cashierRef: 'PORTAL-DESK-4', merchantId: 'merch_melcom_gh' }, null, 2));
              }}
              className="px-3 py-1 text-xs rounded-sm bg-blue-50 text-blue-900 border border-blue-200 font-mono hover:bg-blue-100 font-bold"
            >
              POST /api/v1/merchant/light/reconcile-code
            </button>
            <button
              onClick={() => {
                setApiEndpoint('/api/v1/settlements/weekly-batch');
                setApiMethod('POST');
                setApiRequestBody(JSON.stringify({ merchantId: 'merch_melcom_gh' }, null, 2));
              }}
              className="px-3 py-1 text-xs rounded-sm bg-red-50 text-[#C41E3A] border border-red-200 font-mono hover:bg-red-100 font-bold"
            >
              POST /api/v1/settlements/weekly-batch
            </button>
            <button
              onClick={() => {
                setApiEndpoint('/api/v1/settlements/batches');
                setApiMethod('GET');
              }}
              className="px-3 py-1 text-xs rounded-sm bg-purple-50 text-purple-900 border border-purple-200 font-mono hover:bg-purple-100 font-semibold"
            >
              GET /api/v1/settlements/batches
            </button>
          </div>

          {/* Request Config */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <select
                  value={apiMethod}
                  onChange={(e: any) => setApiMethod(e.target.value)}
                  className="bg-slate-50 border border-slate-300 text-xs font-bold text-[#0F1C13] rounded-sm px-3 py-2 focus:outline-none focus:border-[#006837]"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                </select>
                <input
                  type="text"
                  value={apiEndpoint}
                  onChange={(e) => setApiEndpoint(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-300 text-xs font-mono text-[#0F1C13] rounded-sm px-3 py-2 focus:outline-none focus:border-[#006837]"
                />
              </div>

              {apiMethod === 'POST' && (
                <div>
                  <label className="text-[10px] text-[#006837] uppercase font-bold block mb-1 font-mono">Request JSON Body</label>
                  <textarea
                    rows={6}
                    value={apiRequestBody}
                    onChange={(e) => setApiRequestBody(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 text-xs font-mono text-[#0F1C13] rounded-sm p-3 focus:outline-none focus:border-[#006837]"
                  />
                </div>
              )}

              <button
                onClick={handleRunApiTest}
                disabled={apiRunning}
                className="w-full py-3 bg-[#C41E3A] hover:bg-[#a51830] text-white font-bold text-xs uppercase tracking-wider rounded-sm shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{apiRunning ? 'Executing API Request...' : 'Send API Request'}</span>
              </button>
            </div>

            {/* Response Console */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-[#006837] uppercase font-bold">
                <span>API Controller Output Response</span>
                {apiResponse && (
                  <span className={apiResponse.ok ? 'text-emerald-800' : 'text-red-700'}>
                    Status: {apiResponse.status}
                  </span>
                )}
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-sm p-4 h-[240px] overflow-y-auto font-mono text-xs text-emerald-300">
                <pre>{apiResponse ? JSON.stringify(apiResponse, null, 2) : '// Click "Send API Request" to execute live controller'}</pre>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
