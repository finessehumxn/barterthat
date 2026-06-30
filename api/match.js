// BarterThat — AI swap ranker + narrator (Vercel Node serverless function).
//
// The app's deterministic engine (findSwaps) already finds REAL, valid swaps —
// direct 1:1 trades and circular loops where each person hands over their own
// offering. This endpoint asks Claude only to RANK those real swaps and write one
// warm, concrete sentence each. It never invents or alters a swap, so results are
// always grounded and reliable (no hallucinated traders or fake chains).
//
// The API key lives ONLY here, server-side, in process.env.ANTHROPIC_API_KEY.
//
// Endpoint:  POST /api/match
// Body:      { swaps: [ { i, kind: "direct"|"loop", chain: "You give X → Ana gives Y → you get Z" } ] }
// Returns:   { ranked: [ { i, fit, story } ], model }   (200)
//            On any failure returns { ranked: [] } and the client keeps showing
//            the real chains without narration (graceful degradation).

const Anthropic = require("@anthropic-ai/sdk");

const MODEL = "claude-haiku-4-5";

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    ranked: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          i: { type: "integer", description: "the swap's index from the input list" },
          fit: { type: "integer", description: "0-100, how good this swap is for the member" },
          story: { type: "string", description: "one warm, concrete sentence that makes the member want to do this swap" }
        },
        required: ["i", "fit", "story"]
      }
    }
  },
  required: ["ranked"]
};

module.exports = async function handler(req, res) {
  if (req.method !== "POST") { res.status(405).json({ ranked: [], error: "POST only" }); return; }
  if (!process.env.ANTHROPIC_API_KEY) { res.status(200).json({ ranked: [], note: "ai_offline" }); return; }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const swaps = (Array.isArray(body.swaps) ? body.swaps : []).slice(0, 12);
    if (!swaps.length) { res.status(200).json({ ranked: [] }); return; }

    const client = new Anthropic(); // reads ANTHROPIC_API_KEY

    const prompt =
      "You are BarterThat's swap matchmaker. The app has ALREADY found these real, valid " +
      "cashless swaps for a member — direct 1:1 trades and circular loops where each person " +
      "hands over their own offering and everyone ends up with what they wanted.\n\n" +
      "Your job: rank them best-first for the member, and write ONE warm, concrete sentence " +
      "per swap that makes them want to do it (mention what they give and get). Do NOT invent, " +
      "merge, or change any swap — only score and narrate the ones below.\n\n" +
      "SWAPS:\n" + JSON.stringify(swaps, null, 0);

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1200,
      system: "You rank and narrate barter swaps. Be grounded, warm, and concrete. Never invent traders, items, or chains beyond what is given.",
      messages: [{ role: "user", content: prompt }],
      output_config: { format: { type: "json_schema", schema: SCHEMA } }
    });

    if (response.stop_reason === "refusal") { res.status(200).json({ ranked: [] }); return; }

    const textBlock = response.content.find(b => b.type === "text");
    let parsed = { ranked: [] };
    if (textBlock && textBlock.text) { try { parsed = JSON.parse(textBlock.text); } catch (_) { /* graceful */ } }

    res.status(200).json({
      ranked: Array.isArray(parsed.ranked) ? parsed.ranked : [],
      model: response.model
    });
  } catch (err) {
    res.status(200).json({ ranked: [], error: String(err && err.message || err) });
  }
};
