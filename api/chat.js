export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const messages = body.messages || [];
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.OPENAI_API_KEY
      },
      body: JSON.stringify({ model: process.env.OPENAI_MODEL || "gpt-5.6-luna", input: messages })
    });
    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json ({error: data.error?.message||"Erro na API da IA"});
    }
    return res.status(200).json({output: data.output_text || "Nao consegui gerar uma resposta."});
  } catch (error) {
    return res.status(500).json ({error: error.message||"Erro interno"});
  }
}
