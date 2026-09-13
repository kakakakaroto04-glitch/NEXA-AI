const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '100kb' }));

const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.OPENAI_MODEL || 'gpt-5.6-luna';

if (!OPENAI_API_KEY) console.warn('AVISO: defina OPENAI_API_KEY no ambiente do servidor.');

app.get('/health', (req, res) => res.json({ ok: true, name: 'NEXA', model: MODEL }));

app.post('/api/chat', async (req, res) => {
  try {
    if (!OPENAI_API_KEY) return res.status(500).json({ error: 'OPENAI_API_KEY não configurada no servidor.' });
    const messages = Array.isArray(req.body.messages) ? req.body.messages : [];
    const safeMessages = messages.slice(-20).filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string').map(m => ({ role: m.role, content: m.content.slice(0, 4000) }));
    if (!safeMessages.length) return res.status(400).json({ error: 'Envie pelo menos uma mensagem.' });

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: MODEL,
        instructions: 'Você é a NEXA, uma assistente de IA útil, direta e amigável. Responda em português do Brasil quando o usuário falar português. Não invente fatos. Explique assuntos com clareza e segurança.',
        input: safeMessages
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.error?.message || 'Erro no provedor de IA.' });
    const output = data.output_text || extractOutputText(data);
    if (!output) return res.status(502).json({ error: 'A IA não retornou texto.' });
    res.json({ output });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

function extractOutputText(data) {
  const chunks = [];
  for (const item of data.output || []) for (const c of item.content || []) if (c.type === 'output_text' && c.text) chunks.push(c.text);
  return chunks.join('\n');
}

app.listen(PORT, () => console.log(`NEXA backend rodando na porta ${PORT}`));
