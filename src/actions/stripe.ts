'use server';

import { auth } from '@/lib/firebase-admin';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20',
});

interface CreateCheckoutSessionParams {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  uid: string;
  email: string | null | undefined;
}

export async function createCheckoutSession(params: CreateCheckoutSessionParams) {
  const { priceId, successUrl, cancelUrl, uid, email } = params;

  if (!uid) {
    throw new Error('Usuário não autenticado.');
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: email || undefined,
      metadata: {
        uid: uid,
      },
    });

    return { checkoutUrl: session.url };
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    throw new Error('Falha ao criar sessão de checkout.');
  }
}
