// BarterThat — check a Stripe Identity verification session's result.
// GET /api/verify-status?id=vs_...  →  { verified: bool, status }
// The client polls this after the member returns from the hosted flow; on
// "verified" it marks the profile as ID-verified (a real, earned trust badge).

const Stripe = require("stripe");

module.exports = async function handler(req, res) {
  if (!process.env.STRIPE_SECRET_KEY) { res.status(200).json({ verified: false, error: "stripe_offline" }); return; }
  const id = (req.query && req.query.id) ? String(req.query.id) : ((String(req.url || "").split("id=")[1] || "").split("&")[0]);
  if (!id) { res.status(200).json({ verified: false, error: "no_id" }); return; }

  try {
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const s = await stripe.identity.verificationSessions.retrieve(id);
    res.status(200).json({ verified: s.status === "verified", status: s.status });
  } catch (err) {
    res.status(200).json({ verified: false, error: String(err && err.message || err) });
  }
};
