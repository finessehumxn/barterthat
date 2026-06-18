// Shared communication helpers: languages, live translation, and read-aloud.
// Used by chat (and anywhere) for translate + text-to-speech.

// Comprehensive language list — label (sent to the translator) + BCP-47 code
// (used to pick a text-to-speech voice). Translation works for ANY language via
// Claude; this list just powers the picker. Read-aloud uses whatever voices the
// device has and falls back gracefully when a voice isn't installed.
export const LANGUAGES = [
  { label: "English", code: "en-US" }, { label: "Spanish", code: "es-ES" }, { label: "Mandarin Chinese", code: "zh-CN" },
  { label: "Hindi", code: "hi-IN" }, { label: "Arabic", code: "ar-SA" }, { label: "French", code: "fr-FR" },
  { label: "Portuguese", code: "pt-BR" }, { label: "Bengali", code: "bn-BD" }, { label: "Russian", code: "ru-RU" },
  { label: "Japanese", code: "ja-JP" }, { label: "German", code: "de-DE" }, { label: "Urdu", code: "ur-PK" },
  { label: "Indonesian", code: "id-ID" }, { label: "Italian", code: "it-IT" }, { label: "Turkish", code: "tr-TR" },
  { label: "Korean", code: "ko-KR" }, { label: "Vietnamese", code: "vi-VN" }, { label: "Tagalog (Filipino)", code: "fil-PH" },
  { label: "Polish", code: "pl-PL" }, { label: "Ukrainian", code: "uk-UA" }, { label: "Persian (Farsi)", code: "fa-IR" },
  { label: "Swahili", code: "sw-KE" }, { label: "Thai", code: "th-TH" }, { label: "Dutch", code: "nl-NL" },
  { label: "Romanian", code: "ro-RO" }, { label: "Greek", code: "el-GR" }, { label: "Czech", code: "cs-CZ" },
  { label: "Hungarian", code: "hu-HU" }, { label: "Swedish", code: "sv-SE" }, { label: "Hebrew", code: "he-IL" },
  { label: "Malay", code: "ms-MY" }, { label: "Punjabi", code: "pa-IN" }, { label: "Tamil", code: "ta-IN" },
  { label: "Telugu", code: "te-IN" }, { label: "Marathi", code: "mr-IN" }, { label: "Gujarati", code: "gu-IN" },
  { label: "Kannada", code: "kn-IN" }, { label: "Malayalam", code: "ml-IN" }, { label: "Burmese", code: "my-MM" },
  { label: "Khmer", code: "km-KH" }, { label: "Lao", code: "lo-LA" }, { label: "Sinhala", code: "si-LK" },
  { label: "Nepali", code: "ne-NP" }, { label: "Pashto", code: "ps-AF" }, { label: "Amharic", code: "am-ET" },
  { label: "Somali", code: "so-SO" }, { label: "Hausa", code: "ha-NG" }, { label: "Yoruba", code: "yo-NG" },
  { label: "Igbo", code: "ig-NG" }, { label: "Zulu", code: "zu-ZA" }, { label: "Xhosa", code: "xh-ZA" },
  { label: "Afrikaans", code: "af-ZA" }, { label: "Haitian Creole", code: "ht-HT" }, { label: "Norwegian", code: "nb-NO" },
  { label: "Danish", code: "da-DK" }, { label: "Finnish", code: "fi-FI" }, { label: "Slovak", code: "sk-SK" },
  { label: "Bulgarian", code: "bg-BG" }, { label: "Croatian", code: "hr-HR" }, { label: "Serbian", code: "sr-RS" },
  { label: "Bosnian", code: "bs-BA" }, { label: "Slovenian", code: "sl-SI" }, { label: "Lithuanian", code: "lt-LT" },
  { label: "Latvian", code: "lv-LV" }, { label: "Estonian", code: "et-EE" }, { label: "Albanian", code: "sq-AL" },
  { label: "Macedonian", code: "mk-MK" }, { label: "Georgian", code: "ka-GE" }, { label: "Armenian", code: "hy-AM" },
  { label: "Azerbaijani", code: "az-AZ" }, { label: "Kazakh", code: "kk-KZ" }, { label: "Uzbek", code: "uz-UZ" },
  { label: "Mongolian", code: "mn-MN" }, { label: "Catalan", code: "ca-ES" }, { label: "Basque", code: "eu-ES" },
  { label: "Galician", code: "gl-ES" }, { label: "Welsh", code: "cy-GB" }, { label: "Irish", code: "ga-IE" },
  { label: "Icelandic", code: "is-IS" }, { label: "Maltese", code: "mt-MT" }, { label: "Cantonese", code: "zh-HK" },
  { label: "Kurdish", code: "ku-TR" }, { label: "Sindhi", code: "sd-PK" }, { label: "Tigrinya", code: "ti-ER" },
  { label: "Wolof", code: "wo-SN" }, { label: "Twi", code: "tw-GH" }, { label: "Lingala", code: "ln-CD" },
  { label: "Fijian", code: "fj-FJ" }, { label: "Samoan", code: "sm-WS" }, { label: "Maori", code: "mi-NZ" },
  { label: "Hawaiian", code: "haw-US" }, { label: "Quechua", code: "qu-PE" }, { label: "Esperanto", code: "eo" },
];
export const langByLabel = l => LANGUAGES.find(x => x.label === l) || LANGUAGES[0];

// Live translation via the Claude-powered serverless function. Fails soft.
export async function translateText(text, toLabel) {
  try {
    const r = await fetch("/api/translate", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, to: toLabel }),
    });
    if (!r.ok) return { translated: text, detected: "" };
    return await r.json();
  } catch (e) { return { translated: text, detected: "" }; }
}

// Read text aloud in the chosen language using the browser's speech engine.
export const TTS_OK = typeof window !== "undefined" && "speechSynthesis" in window;
export function speak(text, lang = "en-US") {
  if (!TTS_OK || !text) return false;
  try {
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    const v = synth.getVoices().find(x => x.lang === lang) || synth.getVoices().find(x => x.lang && x.lang.startsWith(lang.split("-")[0]));
    if (v) u.voice = v;
    synth.speak(u);
    return true;
  } catch (e) { return false; }
}
export function stopSpeaking() { try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) {} }

// Turn URLs in a message into clickable links (returns text/link segments).
export function linkify(text) {
  const parts = [];
  const re = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
  let last = 0, m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push({ t: "text", v: text.slice(last, m.index) });
    const url = m[0];
    parts.push({ t: "link", v: url, href: url.startsWith("http") ? url : "https://" + url });
    last = m.index + url.length;
  }
  if (last < text.length) parts.push({ t: "text", v: text.slice(last) });
  return parts;
}
