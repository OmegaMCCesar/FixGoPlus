// /api/create-checkout-session.js
const secretKey = 'sk_test_51RZfEzRVsZII839OrQ97I2PP3J9yh3WDBYIE9WyYOhEVaWqRlhJZKDi4Z5x35cehvs9MflmLIil7ITo37i0VN2G400vpONt1Tu'
const stripe = require('stripe')(secretKey); // Usa tu clave secreta de Stripe
console.log(secretKey, 'Stripe Secret Key'); // Verifica que la clave se esté cargando correctamente
console.log(process.env.STRIPE_SECRET_KEY, 'Stripe Secret Key from env'); // Verifica que la clave de entorno se esté cargando correctamente

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Aquí, puedes configurar los detalles de tu sesión de pago
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: req.body.items.map(item => ({
          price_data: {
            currency: 'mxn',
            product_data: {
              name: item.name,
            },
            unit_amount: item.price * 100, // Convertimos a centavos
          },
          quantity: item.quantity,
        })),
        mode: 'payment',
        success_url: `${req.headers.origin}/success`, // URL de éxito
        cancel_url: `${req.headers.origin}/cancel`, // URL de cancelación
      });

      res.status(200).json({ sessionId: session.id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).send({ message: 'Método no permitido' });
  }
}
