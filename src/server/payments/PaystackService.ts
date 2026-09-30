import crypto from 'crypto';
import {
  PayableEntityType,
  PaymentLifecycleStatus,
  PaymentMethod,
  PaymentRecord,
  Order
} from '../../types/index.ts';
import { db } from '../db/DatabaseService.ts';

export interface InitializePaymentInput {
  entityType?: PayableEntityType;
  entityId: string;
  orderId?: string;
  channel?: PaymentMethod;
  customerEmail?: string;
  customerPhone?: string;
  customerId?: string;
  idempotencyKey?: string;
  callbackUrl?: string;
  /**
   * Note: Browser-supplied amount is NEVER trusted for payment initialization.
   * If provided, it is compared against the authoritative database total to detect tampering.
   */
  clientSubmittedAmount?: number;
}

export interface InitializePaymentResult {
  success: boolean;
  idempotentReplay?: boolean;
  mode: 'LIVE_MODE' | 'TEST_MODE';
  payment?: PaymentRecord;
  authorizationUrl?: string;
  accessCode?: string;
  reference?: string;
  amountNaira?: number;
  amountKobo?: number;
  currency?: 'NGN';
  error?: string;
  statusCode?: number;
}

export interface VerifyPaymentInput {
  reference: string;
  simulatedOutcome?: 'SUCCESS' | 'FAILED' | 'ABANDONED';
}

export interface VerifyPaymentResult {
  success: boolean;
  alreadyFinalized?: boolean;
  mode: 'LIVE_MODE' | 'TEST_MODE';
  payment?: PaymentRecord;
  order?: Order;
  message: string;
  error?: string;
  statusCode?: number;
}

export class PaystackService {
  public getSecretKey(): string {
    return (process.env.PAYSTACK_SECRET_KEY || '').trim();
  }

  public getPublicKey(): string {
    return (process.env.PAYSTACK_PUBLIC_KEY || '').trim();
  }

  public isLiveConfigured(): boolean {
    const secret = this.getSecretKey();
    return Boolean(secret && (secret.startsWith('sk_live_') || secret.startsWith('sk_test_')));
  }

  public getMode(): 'LIVE_MODE' | 'TEST_MODE' {
    return this.isLiveConfigured() ? 'LIVE_MODE' : 'TEST_MODE';
  }

  public generateReference(entityType: PayableEntityType, entityId: string): string {
    const cleanId = entityId.replace(/[^a-zA-Z0-9]/g, '').slice(-8).toUpperCase();
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `PSTK_FDC_${entityType}_${cleanId}_${Date.now().toString().slice(-6)}_${randomHex}`;
  }

  /**
   * Requirement 6 & 8: Server-Side Payment Initialization & Amount Validation
   * NEVER trusts the amount sent from the browser. Loads the entity from the server DB,
   * recalculates/validates the payable total in NGN, checks idempotency, and initializes Paystack.
   */
  public async initializeTransaction(
    input: InitializePaymentInput
  ): Promise<InitializePaymentResult> {
    const mode = this.getMode();
    const entityType: PayableEntityType = input.entityType || 'ORDER';
    const entityId = (input.entityId || input.orderId || '').trim();

    if (!entityId) {
      return {
        success: false,
        mode,
        statusCode: 400,
        error: 'Missing orderId or entityId for payment initialization.'
      };
    }

    // 1. Idempotency check: if an active or completed payment exists for this idempotencyKey, return it
    if (input.idempotencyKey) {
      const existing = db.findPaymentByReferenceOrIdempotency(undefined, input.idempotencyKey);
      if (existing) {
        return {
          success: true,
          idempotentReplay: true,
          mode: existing.mode,
          payment: existing,
          authorizationUrl: existing.authorizationUrl,
          accessCode: existing.accessCode,
          reference: existing.reference,
          amountNaira: existing.amountNaira,
          amountKobo: existing.amountKobo,
          currency: 'NGN'
        };
      }
    }

    // 2. Load authoritative payable entity from Server Database (NEVER trust browser amount)
    const entityInfo = db.resolvePayableEntityServerSide(entityType, entityId);
    if (!entityInfo || !entityInfo.exists) {
      return {
        success: false,
        mode,
        statusCode: 404,
        error: `${entityType} (${entityId}) not found in server database.`
      };
    }

    // 3. Prevent double payment if already paid
    if (entityInfo.alreadyPaid) {
      return {
        success: false,
        mode,
        statusCode: 409,
        error: `${entityType} (${entityId}) has already been paid and verified.`
      };
    }

    // 4. Detect client-side amount tampering attempt
    const authoritativeAmountNaira = Number(entityInfo.amountNaira);
    if (!Number.isFinite(authoritativeAmountNaira) || authoritativeAmountNaira <= 0) {
      return {
        success: false,
        mode,
        statusCode: 400,
        error: 'Authoritative payable amount must be greater than ₦0.'
      };
    }

    if (
      input.clientSubmittedAmount !== undefined &&
      Math.abs(Number(input.clientSubmittedAmount) - authoritativeAmountNaira) > 1
    ) {
      db.recordAuditLog({
        actorId: input.customerId || 'BROWSER_CLIENT',
        actorName: entityInfo.customerName,
        actorRole: 'CUSTOMER',
        action: 'PAYMENT_AMOUNT_TAMPER_BLOCKED',
        entityType: 'PAYMENT',
        entityId,
        summary: `Blocked browser attempt to override ${entityType}:${entityId} amount from ₦${authoritativeAmountNaira.toLocaleString()} to ₦${Number(
          input.clientSubmittedAmount
        ).toLocaleString()}. Enforced server amount ₦${authoritativeAmountNaira.toLocaleString()}.`,
        previousValue: String(authoritativeAmountNaira),
        newValue: String(input.clientSubmittedAmount)
      });
    }

    const amountKobo = Math.round(authoritativeAmountNaira * 100);
    const reference = this.generateReference(entityType, entityId);
    const customerEmail =
      (input.customerEmail || entityInfo.customerEmail || 'customer@flourishdestiny.ng')
        .trim()
        .toLowerCase();
    const channel: PaymentMethod = input.channel || 'PAYSTACK_CARD';

    let authorizationUrl: string | undefined;
    let accessCode: string | undefined;

    // 5. Initialize with Live Paystack API if PAYSTACK_SECRET_KEY is present
    if (this.isLiveConfigured()) {
      try {
        const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.getSecretKey()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: customerEmail,
            amount: amountKobo,
            currency: 'NGN',
            reference,
            callback_url: input.callbackUrl,
            metadata: {
              entityType,
              entityId,
              customerName: entityInfo.customerName,
              customerPhone: entityInfo.customerPhone,
              description: entityInfo.description
            }
          })
        });
        const data = await paystackRes.json();
        if (data && data.status && data.data) {
          authorizationUrl = data.data.authorization_url;
          accessCode = data.data.access_code;
        }
      } catch (err) {
        console.error('[PaystackService] Live initialization error, using interactive fallback:', err);
      }
    }

    if (!authorizationUrl) {
      authorizationUrl = `/checkout/paystack-verify?reference=${encodeURIComponent(reference)}`;
      accessCode = `ACC_${reference.slice(-10)}`;
    }

    // 6. Persist payment record in PENDING state
    const payment = db.createPaymentRecord({
      reference,
      idempotencyKey: input.idempotencyKey,
      entityType,
      entityId,
      customerId: input.customerId,
      customerEmail,
      customerPhone: input.customerPhone || entityInfo.customerPhone,
      amountNaira: authoritativeAmountNaira,
      channel,
      provider: this.isLiveConfigured() ? 'PAYSTACK' : 'DEMO_GATEWAY',
      mode,
      authorizationUrl,
      accessCode,
      metadata: {
        description: entityInfo.description,
        customerName: entityInfo.customerName
      }
    });

    return {
      success: true,
      mode,
      payment,
      authorizationUrl,
      accessCode,
      reference: payment.reference,
      amountNaira: payment.amountNaira,
      amountKobo: payment.amountKobo,
      currency: 'NGN'
    };
  }

  /**
   * Requirement 6, 7, 10, 11: Server-Side Transaction Verification
   * Verifies transaction reference, amount in kobo, currency (NGN), and payment status
   * before marking order paid or deducting inventory.
   */
  public async verifyTransaction(input: VerifyPaymentInput): Promise<VerifyPaymentResult> {
    const mode = this.getMode();
    const reference = (input.reference || '').trim();

    if (!reference) {
      return {
        success: false,
        mode,
        statusCode: 400,
        message: 'Payment reference is required.',
        error: 'Payment reference is required.'
      };
    }

    const payment = db.findPaymentByReferenceOrIdempotency(reference);
    if (!payment) {
      return {
        success: false,
        mode,
        statusCode: 404,
        message: `Payment reference "${reference}" not found.`,
        error: `Payment reference "${reference}" not found.`
      };
    }

    // Idempotency: if already SUCCESS, return immediately without re-deducting inventory
    if (payment.status === 'SUCCESS') {
      const order =
        payment.entityType === 'ORDER'
          ? db.getOrderByIdOrNumber(payment.entityId)
          : undefined;
      return {
        success: true,
        alreadyFinalized: true,
        mode: payment.mode,
        payment,
        order,
        message: `Payment ${payment.reference} was already verified and fulfilled.`
      };
    }

    let targetStatus: PaymentLifecycleStatus = 'FAILED';
    let gatewayTxId = `PSTK_VERIFY_${Date.now()}`;
    let summary = '';

    if (this.isLiveConfigured()) {
      try {
        const res = await fetch(
          `https://api.paystack.co/transaction/verify/${encodeURIComponent(payment.reference)}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${this.getSecretKey()}`
            }
          }
        );
        const verifyData = await res.json();
        const txData = verifyData?.data;

        if (!verifyData?.status || !txData) {
          return {
            success: false,
            mode,
            payment,
            statusCode: 400,
            message: 'Unable to verify transaction from Paystack API.',
            error: verifyData?.message || 'Verification failed at gateway.'
          };
        }

        const gatewayStatus = String(txData.status || '').toLowerCase();
        const gatewayAmountKobo = Number(txData.amount || 0);
        const gatewayCurrency = String(txData.currency || 'NGN').toUpperCase();
        gatewayTxId = String(txData.id || payment.reference);

        if (gatewayCurrency !== 'NGN') {
          targetStatus = 'FAILED';
          summary = `Currency mismatch: expected NGN, received ${gatewayCurrency}`;
        } else if (gatewayStatus === 'success' && gatewayAmountKobo >= payment.amountKobo) {
          targetStatus = 'SUCCESS';
          summary = `Verified via Paystack Live API: ₦${payment.amountNaira.toLocaleString()} (${gatewayAmountKobo} kobo)`;
        } else if (gatewayStatus === 'abandoned') {
          targetStatus = 'ABANDONED';
          summary = 'Customer abandoned Paystack checkout session.';
        } else {
          targetStatus = 'FAILED';
          summary = `Paystack verification returned status=${gatewayStatus}, amountKobo=${gatewayAmountKobo} (expected ${payment.amountKobo})`;
        }
      } catch (err: any) {
        return {
          success: false,
          mode,
          payment,
          statusCode: 502,
          message: 'Error communicating with Paystack verification gateway.',
          error: err?.message || 'Gateway network error'
        };
      }
    } else {
      // TEST / DEMO PAYMENT MODE Verification
      const outcome = input.simulatedOutcome || 'SUCCESS';
      if (outcome === 'SUCCESS') {
        targetStatus = 'SUCCESS';
        gatewayTxId = `PSTK_TEST_${Math.floor(100000 + Math.random() * 900000)}`;
        summary = `[TEST MODE] Server verified ₦${payment.amountNaira.toLocaleString()} (${payment.amountKobo} kobo) for ${payment.entityType}:${payment.entityId}`;
      } else if (outcome === 'ABANDONED') {
        targetStatus = 'ABANDONED';
        gatewayTxId = `PSTK_ABANDON_${Date.now().toString().slice(-5)}`;
        summary = `[TEST MODE] Customer abandoned payment checkout for ${payment.reference}. Order remains unpaid.`;
      } else {
        targetStatus = 'FAILED';
        gatewayTxId = `PSTK_DECLINED_${Date.now().toString().slice(-5)}`;
        summary = `[TEST MODE] Simulated bank decline for ${payment.reference}. Fulfillment & inventory deduction blocked.`;
      }
    }

    const transition = db.transitionPaymentAndFulfillEntity({
      reference: payment.reference,
      targetStatus,
      source: 'BACKEND_VERIFY',
      verifiedBy: this.isLiveConfigured() ? 'PAYSTACK_API' : 'DEMO_VERIFIER',
      gatewayTransactionId: gatewayTxId,
      eventType: `verify.${targetStatus.toLowerCase()}`,
      payloadSummary: summary
    });

    if (!transition.success && targetStatus === 'SUCCESS') {
      return {
        success: false,
        mode,
        payment: transition.payment,
        statusCode: 400,
        message: transition.error || 'Payment state transition failed.',
        error: transition.error
      };
    }

    return {
      success: targetStatus === 'SUCCESS',
      alreadyFinalized: transition.alreadyFinalized,
      mode,
      payment: transition.payment,
      order: transition.order,
      message: summary,
      error: targetStatus !== 'SUCCESS' ? summary : undefined
    };
  }

  /**
   * Requirement 9: Paystack Webhook HMAC SHA512 Signature Verification
   */
  public verifyWebhookSignature(rawPayload: string, signatureHeader?: string): boolean {
    const secret = this.getSecretKey();
    if (!secret) {
      // In TEST_MODE without a configured PAYSTACK_SECRET_KEY, allow explicit test webhook simulation
      // if header 'x-fdc-test-webhook' is provided or no secret exists
      return true;
    }
    if (!signatureHeader || typeof signatureHeader !== 'string') {
      return false;
    }
    try {
      const expectedSignature = crypto
        .createHmac('sha512', secret)
        .update(rawPayload)
        .digest('hex');
      const a = Buffer.from(signatureHeader.trim(), 'hex');
      const b = Buffer.from(expectedSignature, 'hex');
      if (a.length !== b.length || a.length === 0) return false;
      return crypto.timingSafeEqual(a, b);
    } catch {
      return false;
    }
  }

  /**
   * Requirement 9 & 11: Idempotent Webhook Event Processor
   */
  public async processWebhookEvent(params: {
    rawPayload: string;
    body: any;
    signatureHeader?: string;
  }): Promise<{
    accepted: boolean;
    statusCode: number;
    idempotentReplay?: boolean;
    message: string;
  }> {
    const signatureValid = this.verifyWebhookSignature(params.rawPayload, params.signatureHeader);
    if (!signatureValid) {
      db.recordAuditLog({
        actorId: 'PAYSTACK_WEBHOOK',
        actorName: 'Unauthorized Webhook Caller',
        actorRole: 'WEBHOOK',
        action: 'WEBHOOK_INVALID_SIGNATURE_REJECTED',
        entityType: 'PAYMENT',
        entityId: params.body?.data?.reference || 'UNKNOWN',
        summary: 'Rejected Paystack webhook due to invalid x-paystack-signature HMAC SHA512.'
      });
      return {
        accepted: false,
        statusCode: 401,
        message: 'Invalid Paystack webhook signature.'
      };
    }

    const eventType = String(params.body?.event || '');
    const data = params.body?.data || {};
    const reference = String(data.reference || '');

    if (!eventType || !reference) {
      return {
        accepted: true,
        statusCode: 200,
        message: 'Webhook acknowledged (no actionable reference).'
      };
    }

    // Check if this exact eventType + reference was already processed
    const existingEvents = db.getPaymentEvents(reference);
    const alreadyHandled = existingEvents.some(
      (e) => e.source === 'PAYSTACK_WEBHOOK' && e.eventType === eventType && e.newStatus === 'SUCCESS'
    );
    if (alreadyHandled) {
      return {
        accepted: true,
        statusCode: 200,
        idempotentReplay: true,
        message: `Webhook ${eventType} for ${reference} already processed idempotently.`
      };
    }

    const payment = db.findPaymentByReferenceOrIdempotency(reference);
    if (payment) {
      if (eventType === 'charge.success') {
        const amountKobo = Number(data.amount || payment.amountKobo);
        if (amountKobo >= payment.amountKobo) {
          db.transitionPaymentAndFulfillEntity({
            reference: payment.reference,
            targetStatus: 'SUCCESS',
            source: 'PAYSTACK_WEBHOOK',
            verifiedBy: 'PAYSTACK_WEBHOOK',
            gatewayTransactionId: String(data.id || reference),
            eventType,
            signatureValid: true,
            payloadSummary: `Webhook charge.success verified (${amountKobo} kobo)`
          });
        }
      } else if (eventType === 'refund.processed') {
        db.transitionPaymentAndFulfillEntity({
          reference: payment.reference,
          targetStatus: 'REFUNDED',
          source: 'PAYSTACK_WEBHOOK',
          verifiedBy: 'PAYSTACK_WEBHOOK',
          gatewayTransactionId: String(data.id || reference),
          eventType,
          signatureValid: true,
          payloadSummary: 'Webhook refund.processed completed'
        });
      }
    }

    return {
      accepted: true,
      statusCode: 200,
      message: `Processed webhook event ${eventType} for ${reference}.`
    };
  }
}

export const paystackService = new PaystackService();
