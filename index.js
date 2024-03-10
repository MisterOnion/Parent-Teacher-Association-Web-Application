// Functions API from Firebase needs to be initialized before this code can be executed. (this js file must be placed inside the functions folder)

const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.createStripeCheckout = functions.https.onCall(async (data, context) => {
  const stripe = require("stripe")(functions.config().stripe.secret_key);
  let unit_amount;
  let product_name;

  if (data.paymentType === "School fee") {
    unit_amount = data.amount * 100;
    product_name = "School Fees";
  } else if (data.paymentType === "Fundraising") {
    if (!data.amount) {
      throw new functions.https.HttpsError("invalid-argument", "The function must be called with an amount for the fundraiser.");
    }
    unit_amount = data.amount * 100; // Use the provided amount for fundraising
    product_name = "Fundraising";
  } else {
    throw new functions.https.HttpsError("invalid-argument", "The function must be called with a valid paymentType.");
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    success_url: "https://pta-webapp.web.app/billing/success.html",
    cancel_url: "https://pta-webapp.web.app/billing/failed.html",
    shipping_address_collection: {
      allowed_countries: ["MY"],
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "myr",
          unit_amount: unit_amount, // or static 100
          product_data: {
            name: product_name, // or static title
          },
        },
      },
    ],
  });
  return {
    id: session.id,
  };
});

exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const stripe = require("stripe")(functions.config().stripe.token);
  let event;

  try {
    const whSec = functions.config().stripe.payments_webhook_secret;

    event = stripe.webhooks.constructEvent(
        req.rawBody,
        req.headers["stripe-signature"],
        whSec,
    );
  } catch (err) {
    console.error("⚠️ Webhook signature verification failed.");
    return res.sendStatus(400);
  }

  const dataObject = event.data.object;

  await admin.firestore().collection("Invoice").doc().set({
    checkoutSessionId: dataObject.id,
    paymentStatus: dataObject.payment_status,
    shippingInfo: dataObject.shipping_details,
    amountTotalCents: dataObject.amount_total,
    paymentTime: event.created,
  });

  const invoiceData = {
    checkoutSessionId: dataObject.id,
    paymentStatus: dataObject.payment_status,
    shippingInfo: dataObject.shipping_details,
    amountTotalCents: dataObject.amount_total,
    paymentTime: event.created,
  };
  await admin.database().ref("Invoice").push(invoiceData);
  return res.sendStatus(200);
});
