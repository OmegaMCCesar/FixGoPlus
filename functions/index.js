/**
 * Funciones de pago de FixGo con Stripe y Firebase Functions v2
 */

const {onInit} = require("firebase-functions/v2/core");
const {https} = require("firebase-functions/v2");
const admin = require("firebase-admin");
const Stripe = require("stripe");
const express = require("express");
const cors = require("cors");

let stripe;
let app;
let db;

// Inicialización controlada
onInit(() => {
  if (!admin.apps.length) {
    admin.initializeApp();
    console.log("✅ Firebase inicializado");
  }

  db = admin.firestore();

  const stripeSecret = process.env.STRIPE_SECRET || process.env.stripe_secret;
  if (!stripeSecret) {
    throw new Error("❌ Falta la clave secreta de Stripe");
  }

  stripe = new Stripe(stripeSecret);
  console.log("✅ Stripe inicializado");

  app = express();

  app.use(cors({origin: true}));
  app.use(
      express.json({
        verify: (req, res, buf) => {
          req.rawBody = buf;
        },
      },)
  );

  app.post("/stripeWebhook", async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
          req.rawBody,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET || process.env.stripe_webhook_secret,
      );
    } catch (err) {
      console.error("⚠️ Webhook error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata.userId;
      const tuerquitas = parseInt(session.metadata.tuerquitas || "0", 10);

      try {
        await db.collection("users").doc(userId).update({
          tuerquitas: admin.firestore.FieldValue.increment(tuerquitas),
        });
        console.log(
          `✅ Acreditadas ${tuerquitas} tuerquitas al usuario ${userId}`,
        );
      } catch (error) {
        console.error("❌ Error actualizando Firestore:", error);
      }
    }

    res.json({received: true});
  });

    app.post("/create-checkout-session", async (req, res) => {
  const { tuerquitas, userId } = req.body;

  if (!tuerquitas || !userId) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "mxn",
            product_data: {
              name: `${tuerquitas} tuerquitas`,
            },
            unit_amount: tuerquitas * 100, // $1 MXN por tuerquita
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        tuerquitas,
      },
      success_url: "https://fix-go-plus.vercel.app/success",
      cancel_url: "https://fix-go-plus.vercel.app/cancel",
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("❌ Error creando sesión:", error.message);
    return res.status(500).json({ error: "Error creando sesión de pago" });
  }
});



  console.log("✅ Express listo para recibir peticiones");
});

// Exportar función HTTP con Express ya inicializado
exports.api = https.onRequest((req, res) => {
  if (!app) {
    return res.status(500).send("Express app no inicializada");
  }

  return app(req, res);
});
