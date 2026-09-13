export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  try {
    const body = typeof req.body === "string"
      ? JSON.parse(req.body)
      : (req.body || {});

    const messages = Array.isArray(body.messages)
      ? body.messages
      : [];

    const safeMessages = messages
      .slice(-20)
      .filter(m =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string"
      )
      .map(m => ({
        role: m.role,
        content: m.content.slice(0, 4000)
      }));

    if (!safeMessages.length) {
      return res.status(400).json({
        error: "Send at least one message."
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "OPENAI_API_KEY not configured in Vercel."
      });
    }

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + process.env.OPENAI_API_KEY
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-5.6-luna",
          instructions:
            "You are NEXA, a direct and friendly AI assistant. " +
            "Answer in Brazilian Portuguese when the user speaks Portuguese. " +
            "Do not invent facts. Explain clearly and safely.",
          input: safeMessages
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "AI provider error."
      });
    }

    const output = data.output_text || "";

    return res.status(200).json({
      output: output || "I could not generate a response."
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message || "Internal server error."
    });
  }
}
