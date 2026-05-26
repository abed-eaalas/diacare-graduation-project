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

const clampString = (value, maxLen) => {
  const text = String(value ?? '').trim();
  if (!text) return '';
  return text.length > maxLen ? text.slice(0, maxLen) : text;
};

const clampNumber = (value, { min, max }) => {
  const num = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(num)) return null;
  if (num < min) return min;
  if (num > max) return max;
  return num;
};

const buildPatientContextLine = (context) => {
  if (!context || typeof context !== 'object') return '';

  const diabetesType = clampString(context.diabetesType, 30);

  const latestGlucoseValue = clampNumber(context.latestGlucose?.value, { min: 20, max: 600 });
  const latestGlucoseTime = clampString(context.latestGlucose?.time, 20);
  const latestGlucoseContext = clampString(context.latestGlucose?.context, 30);

  const targetMin = clampNumber(context.targetRange?.min, { min: 40, max: 300 });
  const targetMax = clampNumber(context.targetRange?.max, { min: 40, max: 300 });
  const targetUnit = clampString(context.targetRange?.unit, 10) || 'mg/dL';

  const medsRaw = Array.isArray(context.medications) ? context.medications.slice(0, 5) : [];
  const meds = medsRaw
    .map((m) => {
      const name = clampString(m?.name, 40);
      if (!name) return '';
      const dose = clampString(m?.dose, 20);
      const time = clampString(m?.time, 20);
      const taken = m?.taken === true ? ' (taken)' : '';
      const line = `${name}${dose ? ` ${dose}` : ''}${time ? ` @ ${time}` : ''}${taken}`;
      return clampString(line, 70);
    })
    .filter(Boolean);

  const parts = [];
  if (diabetesType) parts.push(`Diabetes: ${diabetesType}`);
  if (latestGlucoseValue !== null) {
    const extra = [latestGlucoseContext, latestGlucoseTime].filter(Boolean).join(', ');
    parts.push(`Latest glucose: ${latestGlucoseValue} ${targetUnit}${extra ? ` (${extra})` : ''}`);
  }
  if (targetMin !== null && targetMax !== null) parts.push(`Target: ${targetMin}-${targetMax} ${targetUnit}`);
  if (meds.length) parts.push(`Meds: ${meds.join('; ')}`);

  if (!parts.length) return '';
  return `Patient context (may be incomplete): ${parts.join(' | ')}`;
};

const buildOpenAIRequestBody = (message, model, context) => {
  const systemText =
    "You are DiaCare, a supportive diabetes assistant for a student graduation demo. " +
    "Be calm, clear, and practical. Keep answers short (2-4 sentences). " +
    "Do not claim to be a doctor. If the user mentions severe symptoms, advise emergency help. " +
    "When recommending meals or food, prefer Lebanese/Middle Eastern options when appropriate (e.g., labneh, hummus, foul, lentil soup, fattoush, tabbouleh, grilled meats, mujaddara, zaatar manoushe in moderation), explain diabetes-friendly portions, and avoid excessive sugar/refined carbs. Still answer normally for non-Lebanese foods if the user asks about them.";

  const patientContextLine = buildPatientContextLine(context);
  const systemContent = patientContextLine ? `${systemText}\n\n${patientContextLine}` : systemText;

  return {
    model,
    messages: [
      { role: 'system', content: systemContent },
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
    const context = body?.context && typeof body.context === 'object' ? body.context : undefined;
    const requestBody = buildOpenAIRequestBody(message, model, context);
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
