const https = require('https');

const OPENAI_DEFAULT_MODEL = 'gpt-4.1-mini';

const FALLBACK_REPLY =
  "I’m having trouble reaching the AI service right now. I can still help with meals, glucose targets, medication reminders, and what to do in an emergency.";

const readJsonBody = (req) =>
  new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
  });

const httpsJsonPost = ({ hostname, path, headers, body }) =>
  new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname,
        path,
        method: 'POST',
        headers,
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => {
          raw += chunk;
        });
        res.on('end', () => {
          try {
            const json = raw ? JSON.parse(raw) : {};
            resolve({ status: res.statusCode || 0, json, raw });
          } catch (error) {
            resolve({ status: res.statusCode || 0, json: {}, raw });
          }
        });
      }
    );

    req.on('error', reject);
    req.write(body);
    req.end();
  });

const buildOpenAIRequestBody = (message, model) => {
  const systemText =
    "You are DiaCare, a supportive diabetes assistant for a student graduation demo. " +
    "Be calm, clear, and practical. Keep answers short (2-4 sentences). " +
    "Do not claim to be a doctor. If the user mentions severe symptoms, advise emergency help.";

  return {
    model,
    messages: [
      { role: 'system', content: systemText },
      { role: 'user', content: message },
    ],
    temperature: 0.4,
    max_tokens: 220,
  };
};

const extractReplyText = (payload) => {
  const text = payload?.choices?.[0]?.message?.content;
  return typeof text === 'string' ? text.trim() : '';
};

// POST /api/chat
// Body: { message: string }
const chat = async (req, res) => {
  console.log('[api/chat] started');

  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || OPENAI_DEFAULT_MODEL;

  // Express.json() is enabled, but keep this robust if middleware changes.
  const body = req.body && typeof req.body === 'object' ? req.body : await readJsonBody(req);

  const message = String(body?.message ?? '').trim();
  console.log('[api/chat] incoming message (first 100 chars):', message.slice(0, 100));
  if (!message) {
    return res.status(400).json({ reply: 'Please type a message first.' });
  }

  // Simple guardrails for demo stability.
  if (message.length > 800) {
    return res.status(400).json({ reply: 'Message is too long. Please keep it under 800 characters.' });
  }

  if (!apiKey) {
    return res.status(200).json({ reply: FALLBACK_REPLY });
  }

  try {
    const requestBody = buildOpenAIRequestBody(message, model);
    const bodyString = JSON.stringify(requestBody);

    const { status, json, raw } = await httpsJsonPost({
      hostname: 'api.openai.com',
      path: '/v1/chat/completions',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyString),
        Authorization: `Bearer ${apiKey}`,
      },
      body: bodyString,
    });

    console.log('[api/chat] OpenAI HTTP status:', status);

    if (status < 200 || status >= 300) {
      console.error('[api/chat] OpenAI error body:', raw);
      return res.status(200).json({ reply: FALLBACK_REPLY });
    }

    const reply = extractReplyText(json);
    if (!reply) {
      return res.status(200).json({ reply: FALLBACK_REPLY });
    }

    return res.json({ reply });
  } catch (error) {
    console.error('OPENAI CHAT ERROR', error?.message || error);
    return res.status(200).json({ reply: FALLBACK_REPLY });
  }
};

module.exports = { chat };
