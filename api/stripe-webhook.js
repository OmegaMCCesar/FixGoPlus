import Stripe from 'stripe';
import { initializeApp, credential, firestore } from 'firebase-admin';
import { getMessaging } from 'firebase-admin/messaging';
import { NextApiRequest, NextApiResponse } from 'next';

export const config = { api: { bodyParser: false } };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_TEST, { apiVersion: '2020-08-27' });
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!initializeApp.apps?.length) {
  initializeApp({ credential: credential.applicationDefault() });
}
const db = firestore();
const fcm = getMessaging();

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const buf = await req.text();
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);
  } catch (err) {
    console.error('⚠️ Invalid signature:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const session = event.data.object;
  const userId = session.client_reference_id;
  if (!userId) {
    console.warn('⚠️ No user reference_id');
    return res.status(200).send('Ignored');
  }

  const idempotencyDoc = db.collection('webhookEvents').doc(event.id);
  const exists = (await idempotencyDoc.get()).exists;
  if (exists) {
    return res.status(200).send('Duplicate');
  }
  await idempotencyDoc.set({ received: true });

  res.status(200).send('Event received'); // Respondemos rápido :contentReference[oaicite:4]{index=4}

  try {
    const userRef = db.collection('users').doc(userId);
    const u = await userRef.get();
    if (!u.exists) throw new Error('User not found');

    if (event.type === 'checkout.session.completed') {
      const added = session.amount_total ? session.amount_total / 100 : 0;
      await userRef.update({
        tuerquitas: firestore.FieldValue.increment(added),
        lastPaymentDate: firestore.FieldValue.serverTimestamp(),
      });
      if (session.subscription) {
        await userRef.update({
          subscriptionStatus: 'active',
          subscriptionPlan: session.metadata?.plan || null,
        });
      }
      console.log(`🔔 Updated user ${userId}: +${added} tuerquitas`);

      // 1) Notificación push via FCM
      await fcm.send({
        token: u.data().fcmToken,
        notification: {
          title: '¡Pago recibido!',
          body: `Se agregaron ${added} tuerquitas a tu cuenta.`,
        },
        data: { type: 'payment', amount: added.toString() }
      });

      // 2) Notificación en tiempo real con Pusher/Ably (opcional)
      // pusher.trigger(`user-${userId}`, 'tuerquitas-updated', { added, current: u.data().tuerquitas + added });
    }

  } catch (e) {
    console.error('💥 Processing error:', e);
    // Aquí podrías reintentar con una cola o registrar el fallo
  }
}
