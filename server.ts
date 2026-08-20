/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { LedgerEngine } from './src/services/ledgerEngine.ts';
import { CountryCode, PurposeCategory, SourceCurrency, TargetCurrency } from './src/types.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser
  app.use(express.json());

  // ----------------------------------------------------
  // KuaGifts REST API Controller Routes (/api/v1)
  // ----------------------------------------------------

  // 1. Health & Core Engine Status
  app.get('/api/v1/health', (req: Request, res: Response) => {
    res.json({
      status: 'operational',
      platform: 'KuaGifts West Africa Remittance & Escrow Rails',
      version: '1.0.0-christmas-edition',
      escrowCustody: 'Ring-Fenced Licensed PSP Rails (Paystack/Flutterwave)',
      antiArbitrage: 'Dual-Factor Phone Binding OTP Engine Active',
      timestamp: new Date().toISOString()
    });
  });

  // 2. Verified Merchant Directory
  app.get('/api/v1/merchants', (req: Request, res: Response) => {
    try {
      const country = req.query.country as CountryCode | undefined;
      const category = req.query.category as PurposeCategory | undefined;
      const merchants = LedgerEngine.getMerchants(country, category);
      res.json({ success: true, count: merchants.length, data: merchants });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 3. Guaranteed FX Quote Engine
  app.post('/api/v1/orders/quote-fx', (req: Request, res: Response) => {
    try {
      const { sourceCurrency, targetCurrency, amount } = req.body;
      if (!sourceCurrency || !targetCurrency || !amount) {
        return res.status(400).json({ success: false, error: 'Missing sourceCurrency, targetCurrency, or amount' });
      }
      const quote = LedgerEngine.quoteFX(sourceCurrency as SourceCurrency, targetCurrency as TargetCurrency, Number(amount));
      res.json({ success: true, data: quote });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 4. Create Order & Lock Funds into Escrow
  app.post('/api/v1/orders/create', (req: Request, res: Response) => {
    try {
      const {
        senderName,
        senderEmail,
        receiverName,
        receiverPhone,
        receiverCountry,
        merchantId,
        purposeCategory,
        sourceCurrency,
        sourceAmount,
        voiceNoteUrl,
        voiceDurationSeconds,
        photoUrl,
        personalMessage
      } = req.body;

      if (!senderName || !receiverName || !receiverPhone || !merchantId || !sourceAmount) {
        return res.status(400).json({
          success: false,
          error: 'Missing required order fields (senderName, receiverName, receiverPhone, merchantId, sourceAmount)'
        });
      }

      const result = LedgerEngine.createOrder({
        senderName,
        senderEmail: senderEmail || 'sender@kua-diaspora.com',
        receiverName,
        receiverPhone,
        receiverCountry: receiverCountry || 'GH',
        merchantId,
        purposeCategory: purposeCategory || 'GROCERIES_FOOD',
        sourceCurrency: sourceCurrency || 'USD',
        sourceAmount: Number(sourceAmount),
        voiceNoteUrl,
        voiceDurationSeconds,
        photoUrl,
        personalMessage: personalMessage || 'Wishing you holiday joy and prosperity!'
      });

      res.status(201).json({
        success: true,
        message: 'Order created and foreign currency locked into PSP Escrow ledger successfully.',
        data: result
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 5. Look up Gift Card by Token or Barcode
  app.get('/api/v1/giftcards/lookup', (req: Request, res: Response) => {
    try {
      const query = (req.query.q as string) || (req.query.token as string);
      if (!query) {
        return res.status(400).json({ success: false, error: 'Query parameter "q" or "token" is required' });
      }

      const result = LedgerEngine.findGiftCard(query);
      if (!result) {
        return res.status(404).json({ success: false, error: 'Gift card not found' });
      }

      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 6. Dual-Factor Anti-Arbitrage OTP Engine: /api/v1/giftcards/redeem-otp
  app.post('/api/v1/giftcards/redeem-otp', (req: Request, res: Response) => {
    try {
      const { barcodeOrToken, posTerminalId, cashierName } = req.body;
      if (!barcodeOrToken) {
        return res.status(400).json({ success: false, error: 'barcodeOrToken parameter is required' });
      }

      const terminalId = posTerminalId || 'POS-TERMINAL-01';
      const otpResponse = LedgerEngine.requestRedemptionOtp(barcodeOrToken, terminalId, cashierName);

      res.json(otpResponse);
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 7. Verify OTP & Process Redemption: /api/v1/giftcards/verify-and-redeem
  app.post('/api/v1/giftcards/verify-and-redeem', (req: Request, res: Response) => {
    try {
      const { barcodeOrCard, otpCode, amountToRedeem, cashierName, posTerminalId } = req.body;

      if (!barcodeOrCard || !otpCode || amountToRedeem === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameters (barcodeOrCard, otpCode, amountToRedeem)'
        });
      }

      const result = LedgerEngine.verifyAndRedeem({
        barcodeOrCard,
        otpCode,
        amountToRedeem: Number(amountToRedeem),
        cashierName: cashierName || 'Cashier Desk #1',
        posTerminalId: posTerminalId || 'POS-TERMINAL-01'
      });

      res.json(result);
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 8. Escrow Ledger Audit Trail & Summary
  app.get('/api/v1/ledger/records', (req: Request, res: Response) => {
    try {
      const records = LedgerEngine.getLedgerEntries();
      res.json({ success: true, count: records.length, data: records });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/v1/ledger/summary', (req: Request, res: Response) => {
    try {
      const summary = LedgerEngine.getLedgerSummary();
      res.json({ success: true, data: summary });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 9. Merchant Deep Integration: Dynamic Barcode Validation Endpoint
  app.post('/api/v1/merchant/deep/validate-barcode', (req: Request, res: Response) => {
    try {
      const { barcode, posTerminalId, merchantId } = req.body;
      if (!barcode || !posTerminalId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameters: "barcode" and "posTerminalId" are required.'
        });
      }

      const validation = LedgerEngine.validateMerchantBarcodeDeep({
        barcode,
        posTerminalId,
        merchantId
      });

      res.json({
        success: true,
        message: 'Dynamic optical barcode verified against KuaGifts Escrow registry.',
        data: validation
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 10. Merchant Light Integration: Manual Code Reconciliation Endpoint (Portal / USSD Fallback)
  app.post('/api/v1/merchant/light/reconcile-code', (req: Request, res: Response) => {
    try {
      const { manualCode, otpCode, amountToRedeem, cashierName, cashierRef, merchantId } = req.body;

      if (!manualCode || !otpCode || amountToRedeem === undefined || !merchantId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameters (manualCode, otpCode, amountToRedeem, merchantId)'
        });
      }

      const reconciliation = LedgerEngine.reconcileMerchantCodeLight({
        manualCode,
        otpCode,
        amountToRedeem: Number(amountToRedeem),
        cashierName: cashierName || 'Light Portal Operator',
        cashierRef: cashierRef || 'RECON-CASHIER-01',
        merchantId
      });

      res.json({
        success: true,
        message: 'Light integration code reconciled and queued for weekly merchant payout batch.',
        data: reconciliation
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 11. Escrow Money-Flow: Weekly Merchant Batch Settlements Execution
  app.post('/api/v1/settlements/weekly-batch', (req: Request, res: Response) => {
    try {
      const { merchantId } = req.body;
      const batches = LedgerEngine.executeWeeklyMerchantSettlement(merchantId);

      res.status(200).json({
        success: true,
        message: `Executed weekly batch settlement for ${batches.length} merchant(s) minus platform commission.`,
        batchesProcessed: batches.length,
        data: batches
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 12. View Batch Settlement History
  app.get('/api/v1/settlements/batches', (req: Request, res: Response) => {
    try {
      const batches = LedgerEngine.getBatchSettlements();
      res.json({ success: true, count: batches.length, data: batches });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 13. Raw PostgreSQL Prisma Schema inspection endpoint
  app.get('/api/v1/schema/prisma', (req: Request, res: Response) => {
    try {
      const prismaPath = path.join(process.cwd(), 'src', 'db', 'schema.prisma');
      if (fs.existsSync(prismaPath)) {
        const content = fs.readFileSync(prismaPath, 'utf8');
        res.type('text/plain').send(content);
      } else {
        res.status(404).send('Prisma schema file not found');
      }
    } catch (err: any) {
      res.status(500).send('Error reading schema: ' + err.message);
    }
  });

  // ----------------------------------------------------
  // Vite Integration (Dev Middleware & Production Static)
  // ----------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[KuaGifts Engine] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server boot error:', err);
  process.exit(1);
});
