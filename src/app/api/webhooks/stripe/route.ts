import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const signature = req.headers.get('stripe-signature');

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature!, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed.', err);
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
  }

  try {
    const session = event.data.object as Stripe.Checkout.Session;
    const uid = session.metadata?.uid;

    if (!uid) {
      console.error('Webhook Error: UID not found in metadata');
      return NextResponse.json({ error: 'UID not found' }, { status: 400 });
    }

    const userRef = db.collection('users').doc(uid);
    const subRef = db.collection('subscriptions').doc(uid);

    switch (event.type) {
      case 'checkout.session.completed': {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        
        await userRef.update({
            plan: 'pro',
            updated_at: Timestamp.now(),
        });
        
        await subRef.set({
            provider: 'stripe',
            status: 'active',
            price_id: subscription.items.data[0]?.price.id,
            current_period_end: Timestamp.fromMillis(subscription.current_period_end * 1000),
            last_event: {
                id: event.id,
                type: event.type,
                createdAt: Timestamp.fromMillis(event.created * 1000),
            },
            updated_at: Timestamp.now(),
        }, { merge: true });

        break;
      }
      
      case 'customer.subscription.deleted': {
        await userRef.update({
            plan: 'trial',
            used_count: 0, // Reset trial
            updated_at: Timestamp.now(),
        });

        await subRef.update({
            status: 'canceled',
            updated_at: Timestamp.now(),
        });

        break;
      }
      
      // Handle other events like 'invoice.payment_failed'
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
