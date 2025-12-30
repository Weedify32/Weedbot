// Netlify Function: Claude concierge proxy for Show Me Hydro
// Deploys with `netlify deploy` or `netlify dev` for local testing.

export const handler = async (event) => {
  const apiKey = process.env.OPENAI_API_KEY || "";
  if (!apiKey) {
    return json(500, {
      error: "Missing OPENAI_API_KEY. Add it in Netlify site env settings.",
    });
  }

  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch (e) {
    return json(400, { error: "Invalid JSON body." });
  }

  const userMessage = (body.message || "").toString().trim();
  const sensors = body.sensors || {};

  if (!userMessage) {
    return json(400, { error: "Message is required." });
  }

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
        Authorization: `Bearer ${apiKey}`,
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
            content: `${sensorSummary}\nUser: ${userMessage}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return json(500, { error: `Claude API error: ${text}` });
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content || "No response text received.";
    return json(200, { reply: text });
  } catch (error) {
    console.error("Claude proxy error", error);
    return json(500, { error: "Failed to reach Claude." });
  }
};

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    "content-type": "application/json",
  },
  body: JSON.stringify(body),
});


