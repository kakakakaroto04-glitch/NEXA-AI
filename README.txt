NEXA V2 — IA GENERATIVA

A pasta contém:
- index.html: interface que pode virar APK.
- server.js: backend seguro que chama a API de IA.
- package.json: dependências do backend.
- .env.example: exemplo das variáveis secretas.

IMPORTANTE:
Nunca coloque OPENAI_API_KEY dentro do index.html ou do APK.
A URL do backend é configurada na própria NEXA e salva no aparelho.

Para testar o backend:
1. Instale Node.js.
2. Rode: npm install
3. Crie um arquivo .env baseado em .env.example.
4. Defina OPENAI_API_KEY no servidor.
5. Rode: npm start
6. Aponte a NEXA para https://SEU-ENDERECO/api/chat.

O APK continua sendo apenas o cliente. O cérebro generativo fica no servidor.
