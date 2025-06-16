// /api/create-checkout-session.js

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Usa tu clave secreta de Stripe

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Crear la sesión de pago de Stripe
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: req.body.items.map(item => ({
          price_data: {
            currency: 'mxn',
            product_data: {
              name: item.name,
            },
            unit_amount: item.price , // Convertimos a centavos
          },
          quantity: item.quantity,
        })),
        mode: 'payment',
        success_url: `${req.headers.origin}/success`, // URL de éxito
        cancel_url: `${req.headers.origin}/cancel`, // URL de cancelación
      });

      // Responder con el sessionId en formato JSON
      res.status(200).json({ sessionId: session.id });
    } catch (error) {
      console.error(error); // Log de errores para depuración
      res.status(500).json({ error: 'Hubo un error al crear la sesión de pago' });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}
