import express from 'express';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import {
  VTUNetwork,
  VTUDataPlan,
  VTUTransaction,
  VTUConfig
} from './src/types/index.ts';
import {
  INITIAL_VTU_CONFIG,
  INITIAL_VTU_DATA_PLANS,
  INITIAL_VTU_TRANSACTIONS,
  VTU_NETWORKS
} from './src/data/vtuData.ts';
import { validateNigerianPhone } from './src/utils/nigerianPhone.ts';
import { createVTUProvider } from './src/server/vtu/VTUProvider.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// SERVER-SIDE IN-MEMORY & PERSISTENT STATE FOR VTU MODULE
// Secrets (PAYSTACK_SECRET_KEY, VTU_API_KEY, VTU_API_SECRET) never leave server
// ============================================================================
let vtuDataPlans: VTUDataPlan[] = [...INITIAL_VTU_DATA_PLANS];
let vtuTransactions: VTUTransaction[] = [...INITIAL_VTU_TRANSACTIONS];
const processedIdempotencyKeys = new Map<string, string>(); // key -> transaction.id

function getServerPaystackSecret(): string {
  return (process.env.PAYSTACK_SECRET_KEY || '').trim();
}

function isLivePaystackConfigured(): boolean {
  const key = getServerPaystackSecret();
  return Boolean(key && key.startsWith('sk_'));
}

let vtuConfig: VTUConfig = {
  ...INITIAL_VTU_CONFIG,
  isLivePaystack: isLivePaystackConfigured(),
  mode: isLivePaystackConfigured() ? 'LIVE_MODE' : 'TEST_MODE',
  vtuProviderName: createVTUProvider(vtuDataPlans).providerName
};

function generateTransactionId(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `FDC-${yyyy}${mm}${dd}-${randomDigits}`;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // --------------------------------------------------------------------------
  // 1. GET /api/vtu/config — Safe public configuration & mode status
  // --------------------------------------------------------------------------
  app.get('/api/vtu/config', (_req, res) => {
    const provider = createVTUProvider(vtuDataPlans);
    const livePaystack = isLivePaystackConfigured();
    const currentConfig: VTUConfig = {
      ...vtuConfig,
      isLivePaystack: livePaystack,
      mode: livePaystack && provider.isLive ? 'LIVE_MODE' : 'TEST_MODE',
      vtuProviderName: provider.providerName
    };
    res.json({
      success: true,
      config: currentConfig,
      networks: VTU_NETWORKS.map((n) => ({
        ...n,
        enabled: currentConfig.networksEnabled[n.id] ?? true
      }))
    });
  });

  // --------------------------------------------------------------------------
  // 2. GET /api/vtu/networks — Supported Nigerian networks
  // --------------------------------------------------------------------------
  app.get('/api/vtu/networks', async (_req, res) => {
    const provider = createVTUProvider(vtuDataPlans);
    const networks = await provider.getNetworks();
    res.json({
      success: true,
      networks: networks.map((n) => ({
        ...n,
        enabled: vtuConfig.networksEnabled[n.id] ?? true
      }))
    });
  });

  // --------------------------------------------------------------------------
  // 3. GET /api/vtu/data-plans — Dynamic Data Bundles by Network
  // --------------------------------------------------------------------------
  app.get('/api/vtu/data-plans', async (req, res) => {
    const network = (req.query.network as VTUNetwork | undefined)?.toUpperCase() as VTUNetwork | undefined;
    const includeInactive = req.query.includeInactive === 'true';

    let plans = [...vtuDataPlans];
    if (!includeInactive) {
      plans = plans.filter((p) => p.status === 'ACTIVE');
    }
    if (network && ['MTN', 'AIRTEL', 'GLO', '9MOBILE'].includes(network)) {
      plans = plans.filter((p) => p.network === network);
    }

    res.json({
      success: true,
      mode: isLivePaystackConfigured() ? 'LIVE_MODE' : 'TEST_MODE',
      plans
    });
  });

  // --------------------------------------------------------------------------
  // 4. POST /api/vtu/transactions/initiate — Create Pending Order & Init Paystack
  // --------------------------------------------------------------------------
  app.post('/api/vtu/transactions/initiate', async (req, res) => {
    try {
      const {
        type,
        network,
        phoneNumber,
        amount,
        planId,
        customerName,
        customerEmail,
        paymentMethod,
        idempotencyKey
      } = req.body;

      // Idempotency check
      if (idempotencyKey && processedIdempotencyKeys.has(idempotencyKey)) {
        const existingId = processedIdempotencyKeys.get(idempotencyKey)!;
        const existingTx = vtuTransactions.find((t) => t.id === existingId);
        if (existingTx) {
          return res.json({
            success: true,
            idempotentReplay: true,
            transaction: existingTx
          });
        }
      }

      // Validate Network
      const validNetworks: VTUNetwork[] = ['MTN', 'AIRTEL', 'GLO', '9MOBILE'];
      if (!validNetworks.includes(network)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid mobile network selected. Choose MTN, Airtel, Glo, or 9mobile.'
        });
      }

      if (!vtuConfig.networksEnabled[network as VTUNetwork]) {
        return res.status(400).json({
          success: false,
          error: `${network} VTU service is temporarily disabled for maintenance.`
        });
      }

      // Validate Nigerian Phone Number
      const phoneValidation = validateNigerianPhone(phoneNumber);
      if (!phoneValidation.isValid) {
        return res.status(400).json({
          success: false,
          error: phoneValidation.error || 'Invalid Nigerian 11-digit phone number.'
        });
      }

      const normalizedPhone = phoneValidation.normalized;
      let nominalAmount = Number(amount);
      let serviceFee = 0;
      let providerCost = 0;
      let resolvedPlan: VTUDataPlan | undefined;

      if (type === 'AIRTIME') {
        if (
          isNaN(nominalAmount) ||
          nominalAmount < vtuConfig.minAirtimeAmount ||
          nominalAmount > vtuConfig.maxAirtimeAmount
        ) {
          return res.status(400).json({
            success: false,
            error: `Airtime amount must be between ₦${vtuConfig.minAirtimeAmount.toLocaleString()} and ₦${vtuConfig.maxAirtimeAmount.toLocaleString()}.`
          });
        }
        serviceFee = vtuConfig.airtimeServiceFee || 0;
        providerCost = Math.round(nominalAmount * 0.98);
      } else if (type === 'DATA') {
        resolvedPlan = vtuDataPlans.find(
          (p) => p.planId === planId && p.network === network && p.status === 'ACTIVE'
        );
        if (!resolvedPlan) {
          return res.status(400).json({
            success: false,
            error: 'Selected data plan is unavailable or inactive.'
          });
        }
        nominalAmount = resolvedPlan.customerPrice;
        serviceFee = vtuConfig.dataServiceFee || 0;
        providerCost = resolvedPlan.providerPrice;
      } else {
        return res.status(400).json({
          success: false,
          error: 'Invalid VTU service type. Must be AIRTIME or DATA.'
        });
      }

      const totalAmount = nominalAmount + serviceFee;
      const txId = generateTransactionId();
      const reference = `PSTK_${txId.replace(/-/g, '_')}`;
      const provider = createVTUProvider(vtuDataPlans);
      const isLive = isLivePaystackConfigured();

      const newTx: VTUTransaction = {
        id: txId,
        reference,
        idempotencyKey: idempotencyKey || undefined,
        type,
        network,
        phoneNumber: normalizedPhone,
        customerName: customerName || 'Valued Customer',
        customerEmail: customerEmail || 'customer@flourishdestiny.ng',
        amount: nominalAmount,
        serviceFee,
        totalAmount,
        providerCost,
        planId: resolvedPlan?.planId,
        planName: resolvedPlan?.name,
        planValidity: resolvedPlan?.validity,
        paymentMethod: paymentMethod || 'PAYSTACK_CARD',
        paymentStatus: 'PENDING',
        vtuProvider: provider.providerName,
        vtuStatusMessage: 'Awaiting payment confirmation from Paystack gateway.',
        status: 'PAYMENT_PENDING',
        mode: isLive && provider.isLive ? 'LIVE_MODE' : 'TEST_MODE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // If Live Paystack Secret Key is configured, initialize transaction with Paystack API
      let paystackAuthorizationUrl: string | undefined;
      let paystackAccessCode: string | undefined;

      if (isLive) {
        try {
          const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${getServerPaystackSecret()}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: newTx.customerEmail,
              amount: Math.round(totalAmount * 100), // Amount in Kobo
              reference: newTx.reference,
              currency: 'NGN',
              metadata: {
                transactionId: newTx.id,
                serviceType: newTx.type,
                network: newTx.network,
                phoneNumber: newTx.phoneNumber,
                planId: newTx.planId
              }
            })
          });
          const paystackData = await paystackRes.json();
          if (paystackData.status && paystackData.data) {
            paystackAuthorizationUrl = paystackData.data.authorization_url;
            paystackAccessCode = paystackData.data.access_code;
          }
        } catch (err) {
          console.error('Paystack live initialization error, falling back to interactive checkout:', err);
        }
      }

      vtuTransactions = [newTx, ...vtuTransactions];
      if (idempotencyKey) {
        processedIdempotencyKeys.set(idempotencyKey, newTx.id);
      }

      return res.json({
        success: true,
        transaction: newTx,
        paymentSession: {
          mode: isLive ? 'LIVE_MODE' : 'TEST_MODE',
          reference: newTx.reference,
          amountNaira: totalAmount,
          amountKobo: Math.round(totalAmount * 100),
          authorizationUrl: paystackAuthorizationUrl,
          accessCode: paystackAccessCode
        }
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: err?.message || 'Failed to initiate VTU transaction.'
      });
    }
  });

  // --------------------------------------------------------------------------
  // 5. POST /api/vtu/payments/verify — Verify Payment & Trigger VTU Fulfillment
  //    CRITICAL: Backend verifies payment BEFORE calling VTUProvider!
  // --------------------------------------------------------------------------
  app.post('/api/vtu/payments/verify', async (req, res) => {
    try {
      const {
        reference,
        simulatedPaymentOutcome = 'SUCCESS', // Used in TEST_MODE: 'SUCCESS' | 'FAILED' | 'ABANDONED'
        simulateProviderFailure = false
      } = req.body;

      const txIndex = vtuTransactions.findIndex(
        (t) => t.reference === reference || t.id === reference
      );

      if (txIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'Transaction reference not found.'
        });
      }

      const tx = { ...vtuTransactions[txIndex] };

      // Idempotency safeguard: if already SUCCESSFUL or REFUNDED, return current state without re-dispensing
      if (tx.status === 'SUCCESSFUL' || tx.status === 'REFUNDED' || tx.status === 'REVERSED') {
        return res.json({
          success: true,
          alreadyProcessed: true,
          transaction: tx
        });
      }

      const isLive = isLivePaystackConfigured();
      let isPaymentVerifiedSuccess = false;
      let gatewayReference = tx.paymentGatewayRef || '';

      if (isLive) {
        // Real Paystack Server-Side Verification
        const verifyRes = await fetch(
          `https://api.paystack.co/transaction/verify/${encodeURIComponent(tx.reference)}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${getServerPaystackSecret()}`
            }
          }
        );
        const verifyData = await verifyRes.json();
        if (
          verifyData.status &&
          verifyData.data &&
          verifyData.data.status === 'success' &&
          verifyData.data.amount >= Math.round(tx.totalAmount * 100)
        ) {
          isPaymentVerifiedSuccess = true;
          gatewayReference = String(verifyData.data.id || verifyData.data.reference);
        } else {
          tx.paymentStatus =
            verifyData?.data?.status === 'abandoned' ? 'ABANDONED' : 'FAILED';
          tx.status = 'FAILED';
          tx.vtuStatusMessage =
            'Paystack payment verification failed or was not completed. No airtime/data dispensed.';
          tx.updatedAt = new Date().toISOString();
          vtuTransactions[txIndex] = tx;
          return res.json({
            success: false,
            error: tx.vtuStatusMessage,
            transaction: tx
          });
        }
      } else {
        // TEST / DEMO PAYMENT MODE Verification
        if (simulatedPaymentOutcome === 'SUCCESS') {
          isPaymentVerifiedSuccess = true;
          gatewayReference = `PSTK_TEST_${Math.floor(100000 + Math.random() * 900000)}`;
        } else if (simulatedPaymentOutcome === 'ABANDONED') {
          tx.paymentStatus = 'ABANDONED';
          tx.status = 'FAILED';
          tx.vtuStatusMessage =
            '[TEST MODE] Payment checkout was abandoned by customer. VTU request cancelled.';
          tx.updatedAt = new Date().toISOString();
          vtuTransactions[txIndex] = tx;
          return res.json({
            success: false,
            error: tx.vtuStatusMessage,
            transaction: tx
          });
        } else {
          tx.paymentStatus = 'FAILED';
          tx.status = 'FAILED';
          tx.paymentGatewayRef = `PSTK_TEST_DECLINED_${Date.now().toString().slice(-5)}`;
          tx.vtuStatusMessage =
            '[TEST MODE] Simulated payment declined by bank. VTU fulfillment blocked safely.';
          tx.updatedAt = new Date().toISOString();
          vtuTransactions[txIndex] = tx;
          return res.json({
            success: false,
            error: tx.vtuStatusMessage,
            transaction: tx
          });
        }
      }

      // Payment Confirmed! Transition to PAYMENT_SUCCESSFUL -> PROCESSING
      if (!isPaymentVerifiedSuccess) {
        return res.status(400).json({
          success: false,
          error: 'Payment could not be verified.'
        });
      }

      tx.paymentStatus = 'SUCCESSFUL';
      tx.paymentGatewayRef = gatewayReference;
      tx.paymentVerifiedAt = new Date().toISOString();
      tx.status = 'PROCESSING';
      tx.updatedAt = new Date().toISOString();
      vtuTransactions[txIndex] = tx;

      // Now invoke the VTU Provider to deliver Airtime or Data
      const provider = createVTUProvider(vtuDataPlans);
      const providerResult =
        tx.type === 'AIRTIME'
          ? await provider.purchaseAirtime({
              reference: tx.id,
              network: tx.network,
              phoneNumber: tx.phoneNumber,
              amount: tx.amount,
              simulateProviderFailure
            })
          : await provider.purchaseData({
              reference: tx.id,
              network: tx.network,
              phoneNumber: tx.phoneNumber,
              planId: tx.planId || '',
              planName: tx.planName || 'Data Bundle',
              amount: tx.amount,
              simulateProviderFailure
            });

      if (providerResult.success) {
        tx.status = 'SUCCESSFUL';
        tx.vtuProvider = providerResult.providerName;
        tx.vtuProviderRef = providerResult.providerReference;
        tx.vtuStatusMessage = providerResult.message;
        tx.completedAt = new Date().toISOString();
        tx.updatedAt = new Date().toISOString();
      } else {
        // Payment succeeded, but VTU provider failed -> Automatically mark REFUNDED / FAILED for customer protection
        tx.status = 'REFUNDED';
        tx.paymentStatus = 'REFUNDED';
        tx.vtuProvider = providerResult.providerName;
        tx.vtuProviderRef = providerResult.providerReference;
        tx.vtuStatusMessage = providerResult.message;
        tx.updatedAt = new Date().toISOString();
      }

      vtuTransactions[txIndex] = tx;

      return res.json({
        success: providerResult.success,
        transaction: tx
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: err?.message || 'Error verifying payment and fulfilling VTU order.'
      });
    }
  });

  // --------------------------------------------------------------------------
  // 6. POST /api/vtu/webhooks/paystack — Official Paystack Webhook Handler
  // --------------------------------------------------------------------------
  app.post('/api/vtu/webhooks/paystack', async (req, res) => {
    try {
      const secret = getServerPaystackSecret();
      if (secret) {
        const hash = crypto
          .createHmac('sha512', secret)
          .update(JSON.stringify(req.body))
          .digest('hex');
        if (hash !== req.headers['x-paystack-signature']) {
          return res.status(401).json({ error: 'Invalid Paystack webhook signature' });
        }
      }

      const event = req.body;
      if (event && event.event === 'charge.success' && event.data?.reference) {
        const reference = event.data.reference;
        const txIndex = vtuTransactions.findIndex((t) => t.reference === reference);
        if (txIndex !== -1) {
          const tx = { ...vtuTransactions[txIndex] };
          if (tx.status !== 'SUCCESSFUL' && tx.status !== 'PROCESSING') {
            tx.paymentStatus = 'SUCCESSFUL';
            tx.paymentGatewayRef = String(event.data.id || reference);
            tx.paymentVerifiedAt = new Date().toISOString();
            tx.status = 'PROCESSING';

            const provider = createVTUProvider(vtuDataPlans);
            const result =
              tx.type === 'AIRTIME'
                ? await provider.purchaseAirtime({
                    reference: tx.id,
                    network: tx.network,
                    phoneNumber: tx.phoneNumber,
                    amount: tx.amount
                  })
                : await provider.purchaseData({
                    reference: tx.id,
                    network: tx.network,
                    phoneNumber: tx.phoneNumber,
                    planId: tx.planId || '',
                    planName: tx.planName || 'Data',
                    amount: tx.amount
                  });

            tx.status = result.success ? 'SUCCESSFUL' : 'REFUNDED';
            tx.vtuProviderRef = result.providerReference;
            tx.vtuStatusMessage = result.message;
            tx.updatedAt = new Date().toISOString();
            if (result.success) tx.completedAt = new Date().toISOString();
            vtuTransactions[txIndex] = tx;
          }
        }
      }

      return res.status(200).json({ received: true });
    } catch (err) {
      return res.status(500).json({ error: 'Webhook processing error' });
    }
  });

  // --------------------------------------------------------------------------
  // 7. GET /api/vtu/transactions — Transaction History & Lookup
  // --------------------------------------------------------------------------
  app.get('/api/vtu/transactions', (req, res) => {
    const { phone, type, status, network } = req.query;
    let list = [...vtuTransactions];

    if (phone && typeof phone === 'string' && phone.trim() !== '') {
      const clean = phone.trim();
      list = list.filter((t) => t.phoneNumber.includes(clean));
    }
    if (type && type !== 'ALL') {
      list = list.filter((t) => t.type === type);
    }
    if (status && status !== 'ALL') {
      list = list.filter((t) => t.status === status);
    }
    if (network && network !== 'ALL') {
      list = list.filter((t) => t.network === network);
    }

    res.json({
      success: true,
      transactions: list
    });
  });

  app.get('/api/vtu/transactions/:id', (req, res) => {
    const tx = vtuTransactions.find(
      (t) => t.id === req.params.id || t.reference === req.params.id
    );
    if (!tx) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }
    return res.json({ success: true, transaction: tx });
  });

  // --------------------------------------------------------------------------
  // 8. ADMIN ENDPOINTS — Manage Data Plans, VTU Settings, Retries & Refunds
  // --------------------------------------------------------------------------
  app.post('/api/vtu/admin/plans', (req, res) => {
    const plan: VTUDataPlan = req.body;
    if (!plan.planId || !plan.network || !plan.name) {
      return res.status(400).json({ success: false, error: 'Missing required plan fields.' });
    }
    const existingIdx = vtuDataPlans.findIndex((p) => p.planId === plan.planId);
    if (existingIdx > -1) {
      vtuDataPlans[existingIdx] = plan;
    } else {
      vtuDataPlans = [plan, ...vtuDataPlans];
    }
    return res.json({ success: true, plan, plans: vtuDataPlans });
  });

  app.delete('/api/vtu/admin/plans/:planId', (req, res) => {
    vtuDataPlans = vtuDataPlans.filter((p) => p.planId !== req.params.planId);
    return res.json({ success: true, plans: vtuDataPlans });
  });

  app.post('/api/vtu/admin/settings', (req, res) => {
    vtuConfig = {
      ...vtuConfig,
      ...req.body
    };
    return res.json({ success: true, config: vtuConfig });
  });

  app.post('/api/vtu/admin/transactions/:id/action', async (req, res) => {
    const { action } = req.body; // 'RETRY' | 'REFUND' | 'REVERSE' | 'MARK_SUCCESS'
    const txIndex = vtuTransactions.findIndex((t) => t.id === req.params.id);
    if (txIndex === -1) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    const tx = { ...vtuTransactions[txIndex] };
    const provider = createVTUProvider(vtuDataPlans);

    if (action === 'RETRY') {
      const result =
        tx.type === 'AIRTIME'
          ? await provider.purchaseAirtime({
              reference: tx.id,
              network: tx.network,
              phoneNumber: tx.phoneNumber,
              amount: tx.amount
            })
          : await provider.purchaseData({
              reference: tx.id,
              network: tx.network,
              phoneNumber: tx.phoneNumber,
              planId: tx.planId || '',
              planName: tx.planName || 'Data',
              amount: tx.amount
            });

      if (result.success) {
        tx.status = 'SUCCESSFUL';
        tx.paymentStatus = 'SUCCESSFUL';
        tx.vtuProviderRef = result.providerReference;
        tx.vtuStatusMessage = `[Admin Re-Dispatch] ${result.message}`;
        tx.completedAt = new Date().toISOString();
      }
    } else if (action === 'REFUND') {
      tx.status = 'REFUNDED';
      tx.paymentStatus = 'REFUNDED';
      tx.vtuStatusMessage = 'Payment refunded to customer by HQ Admin.';
    } else if (action === 'REVERSE') {
      tx.status = 'REVERSED';
      tx.vtuStatusMessage = 'Transaction reversed by HQ Admin.';
    } else if (action === 'MARK_SUCCESS') {
      tx.status = 'SUCCESSFUL';
      tx.paymentStatus = 'SUCCESSFUL';
      tx.completedAt = new Date().toISOString();
      tx.vtuStatusMessage = 'Manually verified & fulfilled by HQ Admin.';
    }

    tx.updatedAt = new Date().toISOString();
    vtuTransactions[txIndex] = tx;

    return res.json({ success: true, transaction: tx });
  });

  // --------------------------------------------------------------------------
  // VITE MIDDLEWARE (DEVELOPMENT) OR STATIC DIST (PRODUCTION)
  // --------------------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(
      `[FLOURISH DESTINY COLLECTION] Server running on http://0.0.0.0:${PORT} (VTU Mode: ${
        isLivePaystackConfigured() ? 'LIVE' : 'TEST_MODE'
      })`
    );
  });
}

startServer();
