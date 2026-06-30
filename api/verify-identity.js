// BarterThat — REAL identity verification via Stripe Identity.
//
// Creates a VerificationSession and returns the Stripe-hosted URL where the member
// submits a government ID + a matching selfie. This is what makes a "verified" badge
// mean something (vs. self-claimed) — the #1 trust gap for a stranger-to-stranger
// marketplace. Status is confirmed via /api/verify-status.
//
// Setup: uses the SAME STRIPE_SECRET_KEY as checkout, and requires Stripe Identity
// to be enabled in the Stripe Dashboard (Settings → Identity).
//
// POST /api/verify-identity  { userId, origin }
// →                          { url, id }   (open `url`; poll status with `id`)

const Stripe = require("stripe");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") { res.status(405).json({ error: "POST only" }); return; }
  if (!process.env.STRIPE_SECRET_KEY) { res.status(200).json({ error: "stripe_offline" }); return; }

  let body;
  try { body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {}); } catch (e) { body = {}; }
  const userId = body.userId ? String(body.userId).slice(0, 80) : "";
  const origin = (body.origin || "https://barterthat.app").toString();

  try {
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.identity.verificationSessions.create({
      type: "document",
      metadata: { user_id: userId },
      return_url: `${origin}/?idcheck=done`,
      options: { document: { require_matching_selfie: true, require_live_capture: true } },
    });
    res.status(200).json({ url: session.url, id: session.id });
  } catch (err) {
    res.status(200).json({ error: String(err && err.message || err) });
  }
};
