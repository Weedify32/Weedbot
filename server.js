import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const CHAT_RATE_LIMIT_WINDOW_MS = 60 * 1000; // 60 seconds
const CHAT_RATE_LIMIT_MAX = 5; // max messages per IP per window
const rateLimitStore = new Map();

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/claude", async (req, res) => {
  if (!OPENAI_API_KEY) {
    return res.status(500).json({
      error: "Missing OPENAI_API_KEY. Add it to a .env file or your shell.",
    });
  }

  const userMessage = (req.body?.message || "").toString().trim();
  const username = (req.body?.username || "").toString().trim() || "Grower";
  const sensors = req.body?.sensors || {};

  if (!userMessage) {
    return res.status(400).json({ error: "Message is required." });
  }

  // Simple per-IP rate limiting
  const ip =
    (req.headers["x-forwarded-for"] || "").toString().split(",")[0].trim() ||
    req.ip ||
    "unknown";
  const now = Date.now();
  const bucket = rateLimitStore.get(ip) || [];
  const recent = bucket.filter((t) => now - t < CHAT_RATE_LIMIT_WINDOW_MS);
  if (recent.length >= CHAT_RATE_LIMIT_MAX) {
    return res
      .status(429)
      .json({ error: "Rate limit: please wait before sending another message." });
  }
  recent.push(now);
  rateLimitStore.set(ip, recent);

  const systemPrompt = [
    "You are the Weed Farm Live concierge and RDWC tutor for a crypto-funded autonomous grow.",
    "Provide ONLY legal, safe, compliant indoor cannabis guidance. If legality is uncertain, remind to follow local laws.",
    "Be concise and actionable: nutrients, pH, EC, VPD, airflow, reservoir hygiene, water temps, dissolved oxygen, and monitoring.",
    "If sensor context is provided, use it; if missing key data, briefly note what’s needed.",
    "Do NOT hallucinate hardware—refer only to gear mentioned. Suggest safe checks instead.",
    "Tone: professional, direct, supportive. Keep updates short.",
  ].join(" ");

  const sensorSummary = Object.keys(sensors).length
    ? `Current readings: ${JSON.stringify(sensors)}.`
    : "No live sensor readings provided.";

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 300,
        temperature: 0.6,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Username: ${username}\n${sensorSummary}\nUser: ${userMessage}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(500).json({ error: `Claude API error: ${text}` });
    }

    const data = await response.json();
    const text =
      data?.choices?.[0]?.message?.content || "No response text received.";
    return res.json({ reply: text });
  } catch (error) {
    console.error("Claude proxy error", error);
    return res.status(500).json({ error: "Failed to reach Claude." });
  }
});

app.listen(PORT, () => {
  console.log(`Show Me Hydro running on http://localhost:${PORT}`);
});


