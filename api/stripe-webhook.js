// /api/stripe-webhook.js

import Stripe from 'stripe';
import { initializeApp, credential, firestore } from 'firebase-admin';

// Inicializar Stripe con tu clave secreta (producción o prueba según el entorno)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_SK_LIVE, {
  apiVersion: '2020-08-27',
});
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Inicializar Firebase Admin solo una vez
if (!initializeApp.apps?.length) {
  initializeApp({
    credential: credential.applicationDefault(),
  });
}
const db = firestore();

export async function POST(request) {
  try {
    const sig = request.headers.get('stripe-signature');
    const buf = await request.text(); // body crudo necesario por Stripe :contentReference[oaicite:1]{index=1}

    const event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.client_reference_id;
      if (!userId) {
        console.warn('⚠️ Ignorando evento: falta client_reference_id');
      } else {
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (userDoc.exists) {
          if (session.amount_total) {
            const added = session.amount_total / 100;
            await userRef.update({
              tuerquitas: firestore.FieldValue.increment(added),
              lastPaymentDate: firestore.FieldValue.serverTimestamp(),
            });
            console.log(`+${added} tuerquitas añadidas al usuario ${userId}`);
          }

          if (session.subscription) {
            const plan = session.metadata?.plan || null;
            await userRef.update({
              subscriptionStatus: 'active',
              subscriptionPlan: plan,
            });
            console.log(`Plan "${plan}" activado para usuario ${userId}`);
          }
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err) {
    console.error('Error en webhook:', err);
    return new Response(`Webhook error: ${err.message}`, { status: 500 });
  }
}
