// /api/stripe-webhook.js

import Stripe from 'stripe';
import { initializeApp, credential, firestore } from 'firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_SK_LIVE, {
  apiVersion: '2020-08-27',
});
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!initializeApp.apps?.length) {
  initializeApp({
    credential: credential.applicationDefault(),
  });
}
const db = firestore();

export async function POST(request) {
  const sig = request.headers.get('stripe-signature');
  const buf = await request.text(); // Raw body lectura primer paso :contentReference[oaicite:1]{index=1}

  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);
  } catch (err) {
    console.error('⚠️ Webhook signature failed:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.client_reference_id;

    if (userId) {
      const userRef = db.collection('users').doc(userId);
      const userDoc = await userRef.get();

      if (userDoc.exists) {
        const data = userDoc.data();

        if (session.amount_total) {
          const added = session.amount_total / 100;
          await userRef.update({
            tuerquitas: firestore.FieldValue.increment(added),
            lastPaymentDate: firestore.FieldValue.serverTimestamp(),
          });
          console.log(`+${added} tuerquitas añadidas a ${userId}`);
        }

        if (session.subscription) {
          const plan = session.metadata?.plan || null;
          await userRef.update({
            subscriptionStatus: 'active',
            subscriptionPlan: plan,
          });
          console.log(`Plan "${plan}" activado para ${userId}`);
        }
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
}
