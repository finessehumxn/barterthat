// BarterThat — AI Swap Matchmaker (Vercel Node serverless function).
//
// Calls the Claude Messages API to rank real swap suggestions with reasoning.
// The API key lives ONLY here, server-side, in process.env.ANTHROPIC_API_KEY
// (set it in Vercel → Project → Settings → Environment Variables). It is never
// shipped to the browser.
//
// Endpoint:  POST /api/match
// Body:      { me: { offer, wants }, listings: [ { id, uid, name, cat, wants, rate, score, dist } ] }
// Returns:   { suggestions: [ { id, kind, title, reason, fit } ], model }  (200)
//            On any failure returns { suggestions: [] } so the client falls
//            back to its local graph matcher (findSwaps).

const Anthropic = require("@anthropic-ai/sdk");

// Cost-effective, fast model — ideal for ranking + short reasoning.
const MODEL = "claude-haiku-4-5";

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    suggestions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "string", description: "The trader id this suggestion centers on" },
          kind: { type: "string", enum: ["direct", "loop"], description: "direct 1:1 swap or a multi-party loop" },
          title: { type: "string", description: "Short headline, e.g. 'Braids ⇄ Logo design'" },
          reason: { type: "string", description: "One plain sentence on why this swap works for the user" },
          fit: { type: "integer", description: "Match quality 0-100" }
        },
        required: ["id", "kind", "title", "reason", "fit"]
      }
    }
  },
  required: ["suggestions"]
};

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ suggestions: [], error: "POST only" });
    return;
  }
  // No key configured → tell the client to use its local matcher.
  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(200).json({ suggestions: [], note: "ai_offline" });
    return;
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const me = body.me || {};
    const listings = Array.isArray(body.listings) ? body.listings : [];

    // Trim the candidate pool to a small, cheap payload (exclude the user's own).
    const candidates = listings
      .filter(l => l && l.uid !== me.uid && (l.rate == null || l.rate >= 0))
      .slice(0, 40)
      .map(l => ({
        id: String(l.id),
        name: l.name,
        offers: l.cat,
        wants: Array.isArray(l.wants) ? l.wants : [],
        rate: l.rate,
        score: l.score,
        dist: l.dist
      }));

    if (!candidates.length) {
      res.status(200).json({ suggestions: [], note: "no_candidates" });
      return;
    }

    const client = new Anthropic(); // reads ANTHROPIC_API_KEY

    const prompt =
      "You are BarterThat's swap matchmaker. A member wants to trade skills/goods " +
      "without cash. Find them the best swaps from the candidate pool — both direct " +
      "1:1 swaps (they want what the member offers AND the member wants what they offer) " +
      "and circular loops (member → A → B → back to member, where no single pair matches " +
      "but a chain does).\n\n" +
      "MEMBER:\n" +
      "  offers: " + JSON.stringify(me.offer) + "\n" +
      "  wants:  " + JSON.stringify(me.wants || []) + "\n\n" +
      "CANDIDATES (id, name, offers, wants, rate, BT score, distance):\n" +
      JSON.stringify(candidates, null, 0) + "\n\n" +
      "Return up to 6 ranked suggestions, best first. For a loop, set kind='loop' and " +
      "id to the first hop the member should contact. Keep each reason to one plain " +
      "sentence a normal person understands. Only suggest swaps the data actually supports.";

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1500,
      system: "You rank barter swaps. Be concrete and grounded in the candidate data. Never invent traders or categories that aren't in the pool.",
      messages: [{ role: "user", content: prompt }],
      output_config: { format: { type: "json_schema", schema: SCHEMA } }
    });

    if (response.stop_reason === "refusal") {
      res.status(200).json({ suggestions: [], note: "refused" });
      return;
    }

    const textBlock = response.content.find(b => b.type === "text");
    let parsed = { suggestions: [] };
    if (textBlock && textBlock.text) {
      try { parsed = JSON.parse(textBlock.text); } catch (_) { /* fall through */ }
    }

    res.status(200).json({
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.slice(0, 6) : [],
      model: response.model
    });
  } catch (err) {
    // Any error → empty result; client falls back to local matching.
    res.status(200).json({ suggestions: [], error: String(err && err.message || err) });
  }
};
