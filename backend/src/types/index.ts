import { Request } from 'express';

export interface AuthPayload {
  sub: string;
  email: string;
  iat: number;
  exp: number;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export interface PagarmeTransferRequest {
  amount: number;
  type: 'pix' | 'account';
  key: string;
  externalId: string;
}

export interface PagarmeTransferResponse {
  id: string;
  status: string;
  amount: number;
  created_at: string;
}

export interface StripeWebhookPayload {
  id: string;
  type: string;
  created: number;
  data: {
    object: {
      id: string;
      amount: number;
      currency: string;
      status: string;
      metadata: Record<string, string>;
    };
  };
}
