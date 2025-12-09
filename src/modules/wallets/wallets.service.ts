import { Injectable, HttpStatus } from '@nestjs/common';
import { CoreWalletService } from './services/core-wallet.service';
import { CreateWalletDto } from './dtos/create-wallet.dto';
import { EntityManager, DataSource } from 'typeorm';
import { WalletsModelAction } from './model-actions/wallet.model-action';
import { TransactionsModelAction } from './model-actions/transaction.model-action';
import { PaystackTransactionsModelAction } from './model-actions/paystack-transaction.model-action';
import { PaystackService } from './services/paystack.service';
import { TransactionType, TransactionStatus } from '@shared/enums';
import { CustomHttpException } from '@shared/custom.exception';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../users/models/user.model';
import { Transaction } from './models/transaction.model';
import { Wallet } from './models/wallet.model';
import { PaystackTransaction } from './models/paystack-transaction.model';

@Injectable()
export class WalletsService {
  constructor(
    private readonly coreWalletService: CoreWalletService,
    private readonly walletsModelAction: WalletsModelAction,
    private readonly transactionsModelAction: TransactionsModelAction,
    private readonly paystackTransactionsModelAction: PaystackTransactionsModelAction,
    private readonly paystackService: PaystackService,
    private readonly dataSource: DataSource,
  ) {}

  async createWallet(
    createWalletDto: CreateWalletDto,
    transaction?: EntityManager,
  ) {
    return await this.coreWalletService.createWallet(
      createWalletDto,
      transaction,
    );
  }

  async deposit(userId: string, amount: number) {
    // Get user's wallet
    const wallet = await this.walletsModelAction.get({ userId });
    if (!wallet) {
      throw new CustomHttpException('Wallet not found', HttpStatus.NOT_FOUND);
    }

    // Generate unique reference
    const reference = `deposit_${uuidv4()}`;

    // Get user email
    const user = await this.dataSource
      .getRepository(User)
      .findOne({ where: { id: userId } });
    
    if (!user) {
      throw new CustomHttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Initialize Paystack transaction
    console.log('[Deposit] Initializing Paystack transaction with reference:', reference);
    const paystackResponse = await this.paystackService.initializeTransaction(
      amount,
      user.email,
      reference,
      {
        userId,
        walletId: wallet.id,
      },
    );

    console.log('[Deposit] Paystack response reference:', paystackResponse.data.reference);
    console.log('[Deposit] Reference match:', reference === paystackResponse.data.reference);

    // Create transaction record
    const transaction = await this.transactionsModelAction.create({
      createPayload: {
        type: TransactionType.DEPOSIT,
        amount,
        status: TransactionStatus.PENDING,
        reference,
        senderWalletId: null,
        recipientWalletId: wallet.id,
        description: `Deposit of ${amount}`,
      },
    });

    if (!transaction) {
      throw new CustomHttpException(
        'Failed to create transaction',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // Create Paystack transaction record
    // IMPORTANT: Store the reference that Paystack returns (should match what we sent)
    const paystackRef = paystackResponse.data.reference;
    console.log('[Deposit] Storing Paystack transaction with reference:', paystackRef);
    await this.paystackTransactionsModelAction.create({
      createPayload: {
        transactionId: transaction.id,
        paystackReference: paystackRef,
        authorizationUrl: paystackResponse.data.authorization_url,
        amount,
        currency: wallet.currency,
        customerEmail: user.email,
        paystackStatus: 'pending',
        webhookReceived: false,
      },
    });

    console.log('[Deposit] ✅ Deposit initialized. Webhook will use reference:', paystackRef);

    return {
      reference: paystackRef,
      authorization_url: paystackResponse.data.authorization_url,
    };
  }

  async getBalance(userId: string) {
    const wallet = await this.walletsModelAction.get({ userId });
    if (!wallet) {
      throw new CustomHttpException('Wallet not found', HttpStatus.NOT_FOUND);
    }

    return {
      balance: wallet.balance,
    };
  }

  async transfer(userId: string, walletNumber: string, amount: number) {
    return await this.dataSource.transaction(async (manager) => {
      // Get sender wallet
      const senderWallet = await this.walletsModelAction.get({ userId });
      if (!senderWallet) {
        throw new CustomHttpException(
          'Sender wallet not found',
          HttpStatus.NOT_FOUND,
        );
      }

      // Check balance
      if (senderWallet.balance < amount) {
        throw new CustomHttpException(
          'Insufficient balance',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Get recipient wallet
      const recipientWallet = await this.walletsModelAction.get({
        number: walletNumber,
      });
      if (!recipientWallet) {
        throw new CustomHttpException(
          'Recipient wallet not found',
          HttpStatus.NOT_FOUND,
        );
      }

      // Prevent self-transfer
      if (senderWallet.id === recipientWallet.id) {
        throw new CustomHttpException(
          'Cannot transfer to own wallet',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Generate reference
      const reference = `transfer_${uuidv4()}`;

      // Create transaction record
      const transaction = await this.transactionsModelAction.create({
        createPayload: {
          type: TransactionType.TRANSFER,
          amount,
          status: TransactionStatus.SUCCESS,
          reference,
          senderWalletId: senderWallet.id,
          recipientWalletId: recipientWallet.id,
          description: `Transfer from ${senderWallet.number} to ${recipientWallet.number}`,
        },
        transactionOptions: {
          useTransaction: true,
          transaction: manager,
        },
      });

      if (!transaction) {
        throw new CustomHttpException(
          'Failed to create transaction',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // Update balances atomically
      await manager.update(
        Wallet,
        { id: senderWallet.id },
        { balance: senderWallet.balance - amount },
      );

      await manager.update(
        Wallet,
        { id: recipientWallet.id },
        { balance: recipientWallet.balance + amount },
      );

      return {
        status: 'success',
        message: 'Transfer completed',
      };
    });
  }

  async getTransactions(userId: string) {
    const wallet = await this.walletsModelAction.get({ userId });
    if (!wallet) {
      throw new CustomHttpException('Wallet not found', HttpStatus.NOT_FOUND);
    }

    // Get transactions where wallet is sender or recipient
    const senderTransactions = await this.dataSource
      .getRepository(Transaction)
      .find({
        where: { senderWalletId: wallet.id },
        order: { createdAt: 'DESC' },
        take: 100,
      });

    const recipientTransactions = await this.dataSource
      .getRepository(Transaction)
      .find({
        where: { recipientWalletId: wallet.id },
        order: { createdAt: 'DESC' },
        take: 100,
      });

    // Combine and deduplicate
    const allTransactions = [...senderTransactions, ...recipientTransactions];
    const uniqueTransactions = Array.from(
      new Map(allTransactions.map((t) => [t.id, t])).values(),
    );

    // Sort by created date
    uniqueTransactions.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return uniqueTransactions.map((t) => ({
      type: t.type,
      amount: t.amount,
      status: t.status,
      reference: t.reference,
      description: t.description,
      created_at: t.createdAt,
    }));
  }

  async getDepositStatus(userId: string, reference: string) {
    const wallet = await this.walletsModelAction.get({ userId });
    if (!wallet) {
      throw new CustomHttpException('Wallet not found', HttpStatus.NOT_FOUND);
    }

    // Find Paystack transaction by reference
    const paystackTransaction = await this.paystackTransactionsModelAction.get({
      paystackReference: reference,
    });

    if (!paystackTransaction) {
      throw new CustomHttpException(
        'Transaction not found',
        HttpStatus.NOT_FOUND,
      );
    }

    // Get the transaction
    const transaction = await this.transactionsModelAction.get({
      id: paystackTransaction.transactionId,
    });

    if (!transaction) {
      throw new CustomHttpException(
        'Transaction not found',
        HttpStatus.NOT_FOUND,
      );
    }

    // Verify ownership (transaction recipient should be user's wallet)
    if (transaction.recipientWalletId !== wallet.id) {
      throw new CustomHttpException(
        'Unauthorized access to transaction',
        HttpStatus.FORBIDDEN,
      );
    }

    return {
      reference: paystackTransaction.paystackReference,
      status: transaction.status,
      amount: transaction.amount,
    };
  }

  async handlePaystackWebhook(webhookData: any, signature?: string, rawBody?: string) {
    console.log('[Webhook] ========== WEBHOOK RECEIVED ==========');
    console.log('[Webhook] Full webhook data:', JSON.stringify(webhookData, null, 2));
    console.log('[Webhook] Event:', webhookData?.event);
    console.log('[Webhook] Reference:', webhookData?.data?.reference);
    console.log('[Webhook] Status:', webhookData?.data?.status);
    console.log('[Webhook] Has signature:', !!signature);
    console.log('[Webhook] Has raw body:', !!rawBody);

    // Verify webhook signature if provided
    // Paystack signs the raw request body, so we must use rawBody for verification
    if (signature) {
      if (!rawBody) {
        console.error('[Webhook] No raw body available for signature verification');
        // Fallback to stringified JSON (may fail due to formatting differences)
        const payload = JSON.stringify(webhookData);
        const isValid = this.paystackService.verifyWebhookSignature(
          payload,
          signature,
        );
        if (!isValid) {
          console.error('[Webhook] Signature verification failed (using fallback method)');
          throw new CustomHttpException(
            'Invalid webhook signature',
            HttpStatus.UNAUTHORIZED,
          );
        }
      } else {
        // Use raw body for accurate signature verification
        const isValid = this.paystackService.verifyWebhookSignature(
          rawBody,
          signature,
        );

        if (!isValid) {
          console.error('[Webhook] Invalid signature');
          throw new CustomHttpException(
            'Invalid webhook signature',
            HttpStatus.UNAUTHORIZED,
          );
        }
        console.log('[Webhook] Signature verified successfully');
      }
    } else {
      console.warn('[Webhook] No signature provided - skipping verification');
    }

    const event = webhookData.event;
    const data = webhookData.data;

    // Only process charge.success event
    console.log('[Webhook] Checking event type. Expected: charge.success, Got:', event);
    if (event !== 'charge.success') {
      console.log('[Webhook] ❌ Event not processed:', event);
      console.log('[Webhook] Returning success but not processing');
      return { status: true, message: `Event not processed: ${event}` };
    }

    const paystackReference = data.reference;
    console.log('[Webhook] ✅ Event is charge.success');
    console.log('[Webhook] Looking for transaction with reference:', paystackReference);
    console.log('[Webhook] Searching in paystack_transactions table...');

    // Find Paystack transaction
    const paystackTransaction = await this.paystackTransactionsModelAction.get(
      {
        paystackReference,
      },
    );

    if (!paystackTransaction) {
      console.error('[Webhook] ❌ Transaction not found for reference:', paystackReference);
      console.error('[Webhook] This means the reference in the webhook does not match any paystack_transaction record');
      console.error('[Webhook] Available references in DB might be different');
      throw new CustomHttpException(
        `Paystack transaction not found for reference: ${paystackReference}`,
        HttpStatus.NOT_FOUND,
      );
    }

    console.log('[Webhook] ✅ Transaction found:', paystackTransaction.id);
    console.log('[Webhook] Transaction details:', {
      id: paystackTransaction.id,
      paystackReference: paystackTransaction.paystackReference,
      webhookReceived: paystackTransaction.webhookReceived,
      transactionId: paystackTransaction.transactionId,
    });

    // Check if webhook already processed (idempotency)
    if (paystackTransaction.webhookReceived) {
      console.log('[Webhook] Already processed, skipping');
      return { status: true, message: 'Webhook already processed' };
    }

    console.log('[Webhook] Processing webhook...');

    // Process webhook in transaction
    return await this.dataSource.transaction(async (manager) => {
      // Get the transaction
      const transaction = await manager.findOne(Transaction, {
        where: { id: paystackTransaction.transactionId },
      });

      if (!transaction) {
        throw new CustomHttpException(
          'Transaction not found',
          HttpStatus.NOT_FOUND,
        );
      }

      // Only process if status is pending
      if (transaction.status !== TransactionStatus.PENDING) {
        return { status: true, message: 'Transaction already processed' };
      }

      // Update transaction status
      await manager.update(
        Transaction,
        { id: transaction.id },
        { status: TransactionStatus.SUCCESS },
      );

      // Get recipient wallet
      const wallet = await manager.findOne(Wallet, {
        where: { id: transaction.recipientWalletId },
      });

      if (!wallet) {
        throw new CustomHttpException(
          'Wallet not found',
          HttpStatus.NOT_FOUND,
        );
      }

      // Update wallet balance
      await manager.update(
        Wallet,
        { id: wallet.id },
        { balance: wallet.balance + transaction.amount },
      );

      // Update Paystack transaction record
      await manager.update(
        PaystackTransaction,
        { id: paystackTransaction.id },
        {
          webhookReceived: true,
          webhookProcessedAt: new Date(),
          webhookSignature: signature || null,
          paystackStatus: data.status,
          paystackTransactionId: data.id?.toString() || null,
        },
      );

      console.log('[Webhook] Successfully processed and credited wallet');
      return { status: true };
    });
  }

  // Fallback: Manually verify and process a transaction if webhook wasn't received
  async verifyAndProcessDeposit(userId: string, reference: string) {
    const wallet = await this.walletsModelAction.get({ userId });
    if (!wallet) {
      throw new CustomHttpException('Wallet not found', HttpStatus.NOT_FOUND);
    }

    // Find Paystack transaction by reference
    const paystackTransaction = await this.paystackTransactionsModelAction.get({
      paystackReference: reference,
    });

    if (!paystackTransaction) {
      throw new CustomHttpException(
        'Transaction not found',
        HttpStatus.NOT_FOUND,
      );
    }

    // Check if already processed
    if (paystackTransaction.webhookReceived) {
      return { status: true, message: 'Transaction already processed' };
    }

    // Verify with Paystack
    const verifyResponse = await this.paystackService.verifyTransaction(
      reference,
    );

    if (verifyResponse.status && verifyResponse.data.status === 'success') {
      // Process the transaction
      return await this.dataSource.transaction(async (manager) => {
        const transaction = await manager.findOne(Transaction, {
          where: { id: paystackTransaction.transactionId },
        });

        if (!transaction || transaction.status === TransactionStatus.SUCCESS) {
          return { status: true, message: 'Already processed' };
        }

        // Update transaction status
        await manager.update(
          Transaction,
          { id: transaction.id },
          { status: TransactionStatus.SUCCESS },
        );

        // Update wallet balance
        const wallet = await manager.findOne(Wallet, {
          where: { id: transaction.recipientWalletId },
        });

        if (wallet) {
          await manager.update(
            Wallet,
            { id: wallet.id },
            { balance: wallet.balance + transaction.amount },
          );
        }

        // Update Paystack transaction record
        await manager.update(
          PaystackTransaction,
          { id: paystackTransaction.id },
          {
            webhookReceived: true,
            webhookProcessedAt: new Date(),
            paystackStatus: verifyResponse.data.status,
            paystackTransactionId: verifyResponse.data.id?.toString() || null,
          },
        );

        return { status: true, message: 'Transaction verified and processed' };
      });
    }

    return { status: false, message: 'Transaction not successful on Paystack' };
  }
}
