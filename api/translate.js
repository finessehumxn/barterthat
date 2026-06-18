// BarterThat — live translation (Vercel Node serverless, Claude-powered).
// Translates a chat message into the reader's chosen language and reports the
// source language. Key stays server-side in process.env.ANTHROPIC_API_KEY.
//
// POST /api/translate   { text: "hola", to: "English" }
// →                     { translated: "hello", detected: "Spanish" }   (200)
// On any failure returns the original text so chat never breaks.

const Anthropic = require("@anthropic-ai/sdk");
const MODEL = "claude-haiku-4-5";

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    translated: { type: "string", description: "The message translated into the target language" },
    detected: { type: "string", description: "The language the original message was written in" },
  },
  required: ["translated", "detected"],
};

module.exports = async function handler(req, res) {
  if (req.method !== "POST") { res.status(405).json({ error: "POST only" }); return; }
  let body;
  try { body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {}); } catch (e) { body = {}; }
  const text = (body.text || "").toString().slice(0, 2000);
  const to = (body.to || "English").toString().slice(0, 40);

  if (!text.trim()) { res.status(200).json({ translated: text, detected: "" }); return; }
  if (!process.env.ANTHROPIC_API_KEY) { res.status(200).json({ translated: text, detected: "", note: "ai_offline" }); return; }

  try {
    const client = new Anthropic();
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1000,
      system: "You are a precise translator for a barter marketplace chat. Translate the user's message into the requested language, preserving tone, names, numbers, prices, emoji, and links exactly. If it's already in the target language, return it unchanged. Output only the translation — never commentary.",
      messages: [{ role: "user", content: `Target language: ${to}\n\nMessage:\n${text}` }],
      output_config: { format: { type: "json_schema", schema: SCHEMA } },
    });
    if (response.stop_reason === "refusal") { res.status(200).json({ translated: text, detected: "" }); return; }
    const block = response.content.find(b => b.type === "text");
    let out = { translated: text, detected: "" };
    if (block && block.text) { try { out = JSON.parse(block.text); } catch (e) {} }
    res.status(200).json(out);
  } catch (err) {
    res.status(200).json({ translated: text, detected: "", error: String(err && err.message || err) });
  }
};
