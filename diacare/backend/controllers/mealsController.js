const https = require('https');

const OPENAI_DEFAULT_MODEL = 'gpt-4.1-mini';

const FALLBACK_PLAN = {
  breakfast: {
    title: 'Labneh + cucumber + olives + whole wheat bread',
    portion: '1 plate',
    calories: 320,
    protein: '20%',
    carbs: '30%',
  },
  lunch: {
    title: 'Grilled chicken + fattoush + brown rice',
    portion: '1 plate',
    calories: 520,
    protein: '32%',
    carbs: '28%',
  },
  dinner: {
    title: 'Lentil soup + salad + grilled fish',
    portion: '1 bowl + 1 side',
    calories: 480,
    protein: '30%',
    carbs: '25%',
  },
  snacks: {
    title: 'Apple + mixed nuts',
    portion: '1 snack',
    calories: 180,
    protein: '10%',
    carbs: '20%',
  },
};

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
          } catch {
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

const sanitizeMealItem = (item) => {
  if (!item || typeof item !== 'object') return null;

  const title = clampString(item.title, 70);
  const portion = clampString(item.portion, 30);
  const calories = clampNumber(item.calories, { min: 80, max: 900 });
  const protein = clampString(item.protein, 10);
  const carbs = clampString(item.carbs, 10);

  if (!title || !portion || calories === null || !protein || !carbs) return null;

  return { title, portion, calories, protein, carbs };
};

const sanitizePlan = (plan) => {
  if (!plan || typeof plan !== 'object') return null;

  const breakfast = sanitizeMealItem(plan.breakfast);
  const lunch = sanitizeMealItem(plan.lunch);
  const dinner = sanitizeMealItem(plan.dinner);
  const snacks = sanitizeMealItem(plan.snacks);

  if (!breakfast || !lunch || !dinner || !snacks) return null;
  return { breakfast, lunch, dinner, snacks };
};

const buildContextLine = (context) => {
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
      const line = `${name}${dose ? ` ${dose}` : ''}${time ? ` @ ${time}` : ''}`;
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

const buildOpenAIRequestBody = ({ model, context }) => {
  const systemText =
    "You are DiaCare, a supportive diabetes assistant for a student graduation demo. " +
    "Be calm, clear, and practical. Keep answers short and card-friendly. " +
    "Do not claim to be a doctor. If severe symptoms are mentioned, advise emergency help and contacting a clinician. " +
    "When recommending meals, prefer Lebanese/Middle Eastern options when appropriate (e.g., labneh, hummus, foul, lentil soup, fattoush, tabbouleh, grilled meats, mujaddara, zaatar manoushe in moderation). " +
    "Avoid excessive sugar and refined carbs. Suggest realistic diabetes-friendly portions. " +
    "Return ONLY valid JSON (no markdown) that matches the requested schema.";

  const contextLine = buildContextLine(context);
  const schemaInstruction =
    'Generate a one-day meal plan with exactly 4 items: breakfast, lunch, dinner, snacks. ' +
    'Each item must have: title (short, localized), portion (short), calories (integer), protein (percent string like "18%"), carbs (percent string like "32%"). ' +
    'Keep titles concise to fit a card. No extra keys.';

  const systemContent = [systemText, contextLine, schemaInstruction].filter(Boolean).join('\n\n');

  return {
    model,
    messages: [
      { role: 'system', content: systemContent },
      { role: 'user', content: 'Generate a personalized diabetes-friendly meal plan now.' },
    ],
    temperature: 0.5,
    max_tokens: 260,
    response_format: { type: 'json_object' },
  };
};

const extractJsonContent = (payload) => {
  const content = payload?.choices?.[0]?.message?.content;
  return typeof content === 'string' ? content.trim() : '';
};

// POST /api/meals
// Body: { context?: object }
const generateMeals = async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || OPENAI_DEFAULT_MODEL;

  const body = req.body && typeof req.body === 'object' ? req.body : await readJsonBody(req);
  const context = body?.context && typeof body.context === 'object' ? body.context : undefined;

  if (!apiKey) {
    return res.status(200).json(FALLBACK_PLAN);
  }

  try {
    const requestBody = buildOpenAIRequestBody({ model, context });
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

    if (status < 200 || status >= 300) {
      console.error('[api/meals] OpenAI error body:', raw);
      return res.status(200).json(FALLBACK_PLAN);
    }

    const content = extractJsonContent(json);
    if (!content) {
      return res.status(200).json(FALLBACK_PLAN);
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      return res.status(200).json(FALLBACK_PLAN);
    }

    const plan = sanitizePlan(parsed);
    if (!plan) {
      return res.status(200).json(FALLBACK_PLAN);
    }

    return res.status(200).json(plan);
  } catch (error) {
    console.error('[api/meals] OpenAI meals error', error?.message || error);
    return res.status(200).json(FALLBACK_PLAN);
  }
};

module.exports = { generateMeals };
