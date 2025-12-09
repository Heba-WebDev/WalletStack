import { Injectable, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { CustomHttpException } from '@shared/custom.exception';
import * as crypto from 'crypto';

export interface PaystackInitializeTransactionResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyTransactionResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: string;
    gateway_response: string;
    paid_at: string | null;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: any;
    log: any;
    fees: number | null;
    fees_split: any;
    authorization: any;
    customer: {
      id: number;
      first_name: string | null;
      last_name: string | null;
      email: string;
      customer_code: string;
      phone: string | null;
      metadata: any;
      risk_action: string;
    };
    plan: any;
    split: any;
    order_id: any;
    paidAt: string | null;
    createdAt: string;
    requested_amount: number;
    pos_transaction_data: any;
    source: any;
    fees_breakdown: any;
  };
}

export interface PaystackWebhookEvent {
  event: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: string;
    gateway_response: string;
    paid_at: string | null;
    created_at: string;
    channel: string;
    currency: string;
    metadata: any;
    log: any;
    fees: number | null;
    authorization: any;
    customer: {
      id: number;
      first_name: string | null;
      last_name: string | null;
      email: string;
      customer_code: string;
      phone: string | null;
    };
    plan: any;
    split: any;
    order_id: any;
    paidAt: string | null;
    createdAt: string;
    requested_amount: number;
  };
}

@Injectable()
export class PaystackService {
  private readonly paystackClient: AxiosInstance;
  private readonly secretKey: string;
  private readonly publicKey: string;

  constructor(private configService: ConfigService) {
    this.secretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY') || '';
    this.publicKey = this.configService.get<string>('PAYSTACK_PUBLIC_KEY') || '';

    if (!this.secretKey) {
      throw new Error('PAYSTACK_SECRET_KEY is required');
    }

    this.paystackClient = axios.create({
      baseURL: 'https://api.paystack.co',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async initializeTransaction(
    amount: number,
    email: string,
    reference: string,
    metadata?: Record<string, any>,
  ): Promise<PaystackInitializeTransactionResponse> {
    try {
      const response = await this.paystackClient.post(
        '/transaction/initialize',
        {
          amount: amount * 100, // (smallest currency unit)
          email,
          reference,
          metadata,
        },
      );

      return response.data;
    } catch (error: any) {
      throw new CustomHttpException(
        error.response?.data?.message || 'Failed to initialize Paystack transaction',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async verifyTransaction(
    reference: string,
  ): Promise<PaystackVerifyTransactionResponse> {
    try {
      const response = await this.paystackClient.get(
        `/transaction/verify/${reference}`,
      );

      return response.data;
    } catch (error: any) {
      throw new CustomHttpException(
        error.response?.data?.message || 'Failed to verify Paystack transaction',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  verifyWebhookSignature(
    payload: string | Buffer,
    signature: string,
  ): boolean {
    const hash = crypto
      .createHmac('sha512', this.secretKey)
      .update(payload)
      .digest('hex');

    return hash === signature;
  }
}

