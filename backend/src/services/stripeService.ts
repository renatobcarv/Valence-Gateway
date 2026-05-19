import { stripe, prisma, env } from '../config';
import { NotFoundError } from '../utils/errors';

export const stripeService = {
  async createPaymentIntent(
    projectId: string,
    amount: number,
    customerEmail?: string,
    customerName?: string,
  ) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, name: true },
    });
    if (!project) throw new NotFoundError('Project');

    // Stripe trabalha em centavos
    const amountInCents = Math.round(amount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'brl',
      // projectId no metadata é o que o webhook vai usar para vincular o pagamento
      metadata: {
        projectId,
        projectName: project.name,
        ...(customerEmail && { customerEmail }),
        ...(customerName && { customerName }),
      },
      ...(customerEmail && {
        receipt_email: customerEmail,
      }),
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount,
      currency: 'BRL',
      status: paymentIntent.status,
      stripePublishableKey: env.STRIPE_PUBLISHABLE_KEY,
    };
  },

  validateWebhookSignature(rawBody: Buffer, signature: string, secret: string) {
    return stripe.webhooks.constructEvent(rawBody, signature, secret);
  },

  async createTransfer(params: {
    amount: number;
    currency: string;
    destination: string;
    transferGroup: string;
    splitId: string;
    projectId: string;
  }) {
    const amountInCents = Math.round(params.amount * 100);

    return stripe.transfers.create({
      amount: amountInCents,
      currency: params.currency.toLowerCase(),
      destination: params.destination,
      transfer_group: params.transferGroup,
      metadata: {
        splitId: params.splitId,
        projectId: params.projectId,
      },
    });
  },
};
