// /api/stripe-webhook.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY_SK_LIVE);
const admin = require('firebase-admin');
const express = require('express');
const app = express();
app.use(express.json());

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});
const db = admin.firestore();

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET; // La clave secreta del webhook de Stripe

app.post('/api/stripe-webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verifica la firma del webhook
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);

    // Manejar el evento de pago exitoso
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      // Verifica si es una compra de tuerquitas
      if (session.client_reference_id) {
        // Obtén el ID del usuario desde la referencia
        const userRef = db.collection('users').doc(session.client_reference_id);
        const userDoc = await userRef.get();

        if (userDoc.exists) {
          const userData = userDoc.data();

          // Actualiza las tuerquitas del usuario
          const newTuerquitas = userData.tuerquitas + session.amount_total / 100; // El total del pago en MXN
          await userRef.update({
            tuerquitas: newTuerquitas,
            lastPaymentDate: admin.firestore.FieldValue.serverTimestamp(),
          });

          console.log(`Tuerquitas actualizadas para el usuario ${session.client_reference_id}`);
        }
      }

      // Verifica si es una suscripción
      if (session.subscription) {
        // Activar el plan de suscripción del usuario (esto puede incluir otras acciones como la activación de funciones premium)
        const userRef = db.collection('users').doc(session.client_reference_id);
        await userRef.update({
          subscriptionStatus: 'active',
          subscriptionPlan: session.metadata.plan, // Guarda el plan elegido
        });

        console.log(`Plan de suscripción activado para el usuario ${session.client_reference_id}`);
      }

      // Responde con un 200 OK para confirmar que recibiste el evento
      res.status(200).send('Evento recibido');
    } else {
      res.status(400).send('Evento no manejado');
    }
  } catch (err) {
    console.error('Error en el webhook:', err);
    res.status(400).send('Webhook error');
  }
});

module.exports = app;
