export class ChatProxyError extends Error {
  constructor(message, { status, code, kind } = {}) {
    super(message);
    this.name = "ChatProxyError";
    this.status = status;
    this.code = code;
    this.kind = kind;
  }
}

export async function sendToChatProxy(message, history = []) {
  let res;

  try {
    res = await fetch("/api/chat-proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history }),
    });
  } catch {
    throw new ChatProxyError("تعذر الاتصال بالخادم", { kind: "network" });
  }

  let data;

  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    // OpenAI errors come as { error: { message, type, code } }; our own as { error: "..." }
    const errorBody = data?.error;
    const message =
      (typeof errorBody === "string" ? errorBody : errorBody?.message) ||
      data?.message ||
      "Unknown error";
    const code = typeof errorBody === "object" ? errorBody?.code || errorBody?.type : undefined;

    throw new ChatProxyError(message, { status: res.status, code });
  }

  // extract assistant text in common OpenAI shapes
  const assistant = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || "";
  return { raw: data, text: String(assistant) };
}

export async function requestTriage(message, specialties = []) {
  let res;

  try {
    res = await fetch("/api/triage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, specialties }),
    });
  } catch {
    throw new ChatProxyError("تعذر الاتصال بالخادم", { kind: "network" });
  }

  let data;

  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const errorBody = data?.error;
    const message =
      (typeof errorBody === "string" ? errorBody : errorBody?.message) ||
      data?.message ||
      "Unknown error";
    const code = typeof errorBody === "object" ? errorBody?.code || errorBody?.type : undefined;

    throw new ChatProxyError(message, { status: res.status, code });
  }

  const content = data?.choices?.[0]?.message?.content || "{}";
  let parsed;

  try {
    parsed = JSON.parse(content);
  } catch {
    parsed = {};
  }

  return {
    needed: String(parsed.needed || "").trim(),
    specialty: String(parsed.specialty || "").trim(),
    available: Boolean(parsed.available),
  };
}

export async function polishMedicalText(transcript, mode = "notes") {
  let res;

  try {
    res = await fetch("/api/medical-note", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript, mode }),
    });
  } catch {
    throw new ChatProxyError("تعذر الاتصال بالخادم", { kind: "network" });
  }

  let data;

  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const errorBody = data?.error;
    const message =
      (typeof errorBody === "string" ? errorBody : errorBody?.message) ||
      data?.message ||
      "Unknown error";
    const code = typeof errorBody === "object" ? errorBody?.code || errorBody?.type : undefined;

    throw new ChatProxyError(message, { status: res.status, code });
  }

  const content = data?.choices?.[0]?.message?.content || "";
  return String(content).trim();
}

export async function transcribeAudio(audioBase64, mimeType) {
  let res;

  try {
    res = await fetch("/api/transcribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audio: audioBase64, mimeType }),
    });
  } catch {
    throw new ChatProxyError("تعذر الاتصال بالخادم", { kind: "network" });
  }

  let data;

  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const errorBody = data?.error;
    const message =
      (typeof errorBody === "string" ? errorBody : errorBody?.message) ||
      data?.message ||
      "Unknown error";
    const code = typeof errorBody === "object" ? errorBody?.code || errorBody?.type : undefined;

    throw new ChatProxyError(message, { status: res.status, code });
  }

  // Whisper returns { text: "..." }
  return String(data?.text || "");
}
