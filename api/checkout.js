// BarterThat — real income via Stripe Checkout (Vercel Node serverless).
// Powers: BarterThat+ subscription ($12/mo) and Promoted Listings (one-time).
// Add STRIPE_SECRET_KEY in Vercel to turn it on. Returns a hosted Checkout URL.
//
// POST /api/checkout  { kind: "plus" | "promote", email, origin, days? }
// →                   { url: "https://checkout.stripe.com/..." }
//
// NOTE: this is for the WEB app. Apple/Google require their own in-app purchase
// for digital goods inside the native apps — wire those at store-submission time.

const Stripe = require("stripe");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") { res.status(405).json({ error: "POST only" }); return; }
  if (!process.env.STRIPE_SECRET_KEY) { res.status(200).json({ error: "stripe_offline" }); return; }

  let body;
  try { body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {}); } catch (e) { body = {}; }
  const kind = body.kind === "promote" ? "promote" : "plus";
  const origin = (body.origin || "https://barterthat.app").toString();
  const email = body.email ? String(body.email).slice(0, 120) : undefined;

  try {
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const cfg = kind === "plus"
      ? {
          mode: "subscription",
          line_items: [{
            price_data: {
              currency: "usd", unit_amount: 1200, recurring: { interval: "month" },
              product_data: { name: "BarterThat+", description: "Priority matchmaking, unlimited proposals, analytics, and 30 Barter Tokens every month." },
            },
            quantity: 1,
          }],
        }
      : {
          mode: "payment",
          line_items: [{
            price_data: {
              currency: "usd", unit_amount: 900,
              product_data: { name: "Promoted Listing — 7 days", description: "Featured placement + boosted match priority for one listing." },
            },
            quantity: 1,
          }],
        };

    const session = await stripe.checkout.sessions.create({
      ...cfg,
      customer_email: email,
      allow_promotion_codes: true,
      success_url: `${origin}/?paid=${kind}`,
      cancel_url: `${origin}/?canceled=1`,
    });
    res.status(200).json({ url: session.url });
  } catch (err) {
    res.status(200).json({ error: String(err && err.message || err) });
  }
};
