/* global Buffer, process */

const systemPrompt =
  "أنت مساعد ودود لموقع MediLink. تصرف كمساعد شخصي ذكي يساعد المريض في أي سؤال. " +
  "اسأل أسئلة متابعة قصيرة عندما تكون الأعراض غير واضحة. " +
  "عندما يذكر المستخدم أعراضًا، اقترح التخصص الأقرب بشكل إرشادي وليس تشخيصًا نهائيًا. " +
  "لا تصف أدوية أو جرعات محددة أبدًا، ولا تقدم تشخيصًا قاطعًا. " +
  "لو سأل المريض عن تخفيف الألم أو الانزعاج قبل موعد الدكتور، قدم نصائح منزلية آمنة وعامة فقط مثل الراحة، شرب الماء، الكمادات الدافئة أو الباردة، ووضح دائمًا أنها مؤقتة وليست علاجًا. " +
  "لو ظهرت أعراض خطيرة مثل ألم صدر شديد، صعوبة تنفس، إغماء، نزيف شديد، ضعف مفاجئ، أو ألم لا يحتمل، انصح بالتوجه للطوارئ فورًا. " +
  "لو احتاج المستخدم حجزًا، اطلب منه اختيار موعد من المواعيد المتاحة داخل الواجهة. " +
  "اجعل الرد مختصرًا وواضحًا وبالعربية.";

const rateLimitWindowMs = 60_000;
const rateLimitMax = 15;
const rateLimitHits = new Map();
const outOfScopeResponse =
  "\u0623\u0642\u062f\u0631 \u0623\u0633\u0627\u0639\u062f\u0643 \u0641\u064a \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0637\u0628\u064a\u0629 \u0641\u0642\u0637: \u0627\u0644\u0623\u0639\u0631\u0627\u0636\u060c \u0627\u0644\u062a\u062e\u0635\u0635 \u0627\u0644\u0645\u0646\u0627\u0633\u0628\u060c \u0627\u0644\u0623\u0637\u0628\u0627\u0621\u060c \u0623\u0648 \u062d\u062c\u0632 \u0643\u0634\u0641 \u0641\u064a MediLink.";
const medicalScopeWords = [
  "\u0635\u062d\u0629",
  "\u0635\u062d\u064a",
  "\u0637\u0628",
  "\u0637\u0628\u064a",
  "\u0637\u0628\u064a\u0628",
  "\u062f\u0643\u062a\u0648\u0631",
  "\u0645\u0631\u0636",
  "\u0645\u0631\u064a\u0636",
  "\u0623\u0639\u0631\u0627\u0636",
  "\u0627\u0639\u0631\u0627\u0636",
  "\u0639\u0646\u062f\u064a",
  "\u062d\u0627\u0633\u0633",
  "\u062a\u0639\u0628",
  "\u062a\u0639\u0628\u0627\u0646",
  "\u0648\u062c\u0639",
  "\u0623\u0644\u0645",
  "\u0627\u0644\u0645",
  "\u0635\u062f\u0627\u0639",
  "\u0633\u062e\u0648\u0646\u064a\u0629",
  "\u062d\u0631\u0627\u0631\u0629",
  "\u0639\u0644\u0627\u062c",
  "\u062f\u0648\u0627",
  "\u062f\u0648\u0627\u0621",
  "\u0623\u062f\u0648\u064a\u0629",
  "\u0627\u062f\u0648\u064a\u0629",
  "\u062a\u062d\u0627\u0644\u064a\u0644",
  "\u0623\u0634\u0639\u0629",
  "\u0627\u0634\u0639\u0629",
  "\u062d\u062c\u0632",
  "\u0645\u0648\u0639\u062f",
  "\u0645\u064a\u0639\u0627\u062f",
  "\u0643\u0634\u0641",
  "\u0639\u064a\u0627\u062f\u0629",
  "\u062a\u062e\u0635\u0635",
  "\u0628\u0627\u0637\u0646\u0629",
  "\u062c\u0644\u062f\u064a\u0629",
  "\u0639\u0638\u0627\u0645",
  "\u0623\u0633\u0646\u0627\u0646",
  "\u0627\u0633\u0646\u0627\u0646",
  "\u0623\u0637\u0641\u0627\u0644",
  "\u0627\u0637\u0641\u0627\u0644",
  "\u0637\u0648\u0627\u0631\u0626",
  "\u0625\u0633\u0639\u0627\u0641",
  "\u0627\u0633\u0639\u0627\u0641",
  "\u062d\u0645\u0649",
  "\u0643\u062d\u0629",
  "\u062a\u0646\u0641\u0633",
  "\u0646\u0632\u064a\u0641",
];

function normalizeText(text) {
  return String(text || "")
    .trim()
    .toLowerCase()
    .replace(/[\u0623\u0625\u0622]/g, "\u0627")
    .replace(/\u0649/g, "\u064a")
    .replace(/\u0629/g, "\u0647");
}

export function isMedicalScopeMessage(message) {
  const normalized = normalizeText(message);
  return medicalScopeWords.some((word) => normalized.includes(normalizeText(word)));
}

function createOutOfScopeChatResponse() {
  return {
    choices: [
      {
        message: {
          role: "assistant",
          content: outOfScopeResponse,
        },
      },
    ],
  };
}

export function checkRateLimit(key, now = Date.now()) {
  if (!key) return { allowed: true };

  const windowStart = now - rateLimitWindowMs;
  const hits = (rateLimitHits.get(key) || []).filter((time) => time > windowStart);

  if (hits.length >= rateLimitMax) {
    const retryAfter = Math.max(1, Math.ceil((hits[0] + rateLimitWindowMs - now) / 1000));
    return { allowed: false, retryAfter };
  }

  hits.push(now);
  rateLimitHits.set(key, hits);
  return { allowed: true };
}

export function buildChatMessages(message, history = []) {
  const messages = [
    {
      role: "system",
      content: systemPrompt,
    },
  ];

  if (Array.isArray(history)) {
    for (const item of history) {
      if (!["system", "user", "assistant"].includes(item?.role) || !item?.content) {
        continue;
      }

      messages.push({
        role: item.role,
        content: String(item.content).slice(0, 1200),
      });
    }
  }

  messages.push({ role: "user", content: String(message || "").slice(0, 2000) });
  return messages;
}

export async function createChatProxyResponse({
  message,
  history,
  env = process.env,
  clientKey,
}) {
  const openAiKey = env.OPENAI_API_KEY;

  if (!message && !Array.isArray(history)) {
    return {
      status: 400,
      data: { error: "Missing message" },
    };
  }

  const rate = checkRateLimit(clientKey);
  if (!rate.allowed) {
    return {
      status: 429,
      data: {
        error: "Too many requests, slow down a bit",
        retryAfter: rate.retryAfter,
      },
    };
  }

  if (!openAiKey) {
    return {
      status: 500,
      data: {
        error: "OPENAI_API_KEY is not configured on the server",
      },
    };
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openAiKey}`,
    },
    body: JSON.stringify({
      model: env.OPENAI_MODEL || "gpt-4o-mini",
      messages: buildChatMessages(message, history),
      max_tokens: 700,
      temperature: 0.4,
    }),
  });

  const data = await response.json();
  return {
    status: response.status,
    data,
  };
}

export async function createTriageResponse({
  message,
  specialties = [],
  env = process.env,
  clientKey,
}) {
  const openAiKey = env.OPENAI_API_KEY;

  if (!openAiKey) {
    return {
      status: 500,
      data: { error: "OPENAI_API_KEY is not configured on the server" },
    };
  }

  if (!message) {
    return {
      status: 400,
      data: { error: "Missing message" },
    };
  }

  const rate = checkRateLimit(clientKey);
  if (!rate.allowed) {
    return {
      status: 429,
      data: {
        error: "Too many requests, slow down a bit",
        retryAfter: rate.retryAfter,
      },
    };
  }

  const list = specialties.filter(Boolean);
  const triagePrompt =
    `التخصصات المتاحة في عيادة MediLink هي: ${list.join("، ")}. ` +
    "حلّل شكوى المريض (باللهجة المصرية) وأعد JSON فقط بدون أي نص آخر بالشكل: " +
    '{"needed":"التخصص الطبي الأنسب للشكوى بكلمة أو كلمتين مثل عظام أو جلدية", ' +
    '"specialty":"اسم التخصص من القائمة المتاحة لو needed موجود فيها وإلا فارغ", ' +
    '"available": true لو needed متاح في القائمة وإلا false}. ' +
    'لو الرسالة مجرد تحية أو سؤال إداري بدون شكوى صحية، أعد: ' +
    '{"needed":"","specialty":"","available":false}.';

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openAiKey}`,
    },
    body: JSON.stringify({
      model: env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: triagePrompt },
        { role: "user", content: String(message).slice(0, 2000) },
      ],
      max_tokens: 80,
      temperature: 0,
      response_format: { type: "json_object" },
    }),
  });

  const data = await response.json();
  return {
    status: response.status,
    data,
  };
}

export async function createMedicalNoteResponse({
  transcript,
  mode = "notes",
  env = process.env,
  clientKey,
}) {
  const openAiKey = env.OPENAI_API_KEY;

  if (!openAiKey) {
    return {
      status: 500,
      data: { error: "OPENAI_API_KEY is not configured on the server" },
    };
  }

  if (!transcript) {
    return {
      status: 400,
      data: { error: "Missing transcript" },
    };
  }

  const rate = checkRateLimit(clientKey);
  if (!rate.allowed) {
    return {
      status: 429,
      data: {
        error: "Too many requests, slow down a bit",
        retryAfter: rate.retryAfter,
      },
    };
  }

  const notePrompt =
    mode === "diagnosis"
      ? "النص التالي مُفرّغ من كلام طبيب باللهجة المصرية أثناء الكشف. " +
        "أعد صياغته كتشخيص طبي مختصر بعربية فصحى واضحة ومهنية. صحّح أخطاء التفريغ. " +
        "أعد نص التشخيص فقط بدون أي مقدمات أو عناوين أو علامات اقتباس."
      : "النص التالي مُفرّغ من كلام طبيب باللهجة المصرية أثناء الكشف. " +
        "أعد صياغته كملاحظة أو توصية طبية بعربية فصحى واضحة ومهنية. صحّح أخطاء التفريغ. " +
        "أعد نص الملاحظة فقط بدون أي مقدمات أو عناوين أو علامات اقتباس.";

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openAiKey}`,
    },
    body: JSON.stringify({
      model: env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: notePrompt },
        { role: "user", content: String(transcript).slice(0, 4000) },
      ],
      max_tokens: 400,
      temperature: 0.2,
    }),
  });

  const data = await response.json();
  return {
    status: response.status,
    data,
  };
}

export async function createTranscriptionResponse({
  audioBase64,
  mimeType,
  env = process.env,
  clientKey,
}) {
  const openAiKey = env.OPENAI_API_KEY;

  if (!openAiKey) {
    return {
      status: 500,
      data: {
        error: "OPENAI_API_KEY is not configured on the server",
      },
    };
  }

  if (!audioBase64) {
    return {
      status: 400,
      data: { error: "Missing audio" },
    };
  }

  const rate = checkRateLimit(clientKey);
  if (!rate.allowed) {
    return {
      status: 429,
      data: {
        error: "Too many requests, slow down a bit",
        retryAfter: rate.retryAfter,
      },
    };
  }

  const buffer = Buffer.from(audioBase64, "base64");
  const blob = new Blob([buffer], { type: mimeType || "audio/webm" });
  const form = new FormData();
  form.append("file", blob, "audio.webm");
  form.append("model", env.OPENAI_TRANSCRIBE_MODEL || "whisper-1");
  form.append("language", "ar");
  form.append(
    "prompt",
    [
      "الكلام تسجيل لطبيب مصري أثناء كشف طبي.",
      "اكتب الكلام كما قيل فقط، بدون إضافة أو شرح أو إعادة صياغة.",
      "توقع لهجة مصرية عامية ومصطلحات طبية بالإنجليزية مثل diagnosis, follow up, prescription, MRI, CT, ECG, CBC, antibiotics, dose.",
      "حافظ على المصطلحات الإنجليزية كما هي عندما تُقال.",
    ].join(" "),
  );

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openAiKey}`,
    },
    body: form,
  });

  const data = await response.json();
  return {
    status: response.status,
    data,
  };
}

export function getClientKey(req) {
  const forwarded = req?.headers?.["x-forwarded-for"];
  const forwardedIp = typeof forwarded === "string" ? forwarded.split(",")[0]?.trim() : "";
  return forwardedIp || req?.socket?.remoteAddress || req?.connection?.remoteAddress || "anon";
}

export function readJsonBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }

  return req.body;
}

export async function readNodeRequestJson(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const text = Buffer.concat(chunks).toString("utf8");
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}
