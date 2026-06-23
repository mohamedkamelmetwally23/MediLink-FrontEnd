export const API_ORIGIN =
  import.meta.env.VITE_API_ORIGIN ||
  "https://medilink-backend-production-4a7f.up.railway.app";

export const API_BASE_URL = `${API_ORIGIN.replace(/\/$/, "")}/api/v1`;

const TOKEN_KEYS = ["medilinkToken", "token", "accessToken"];

function getStatusErrorFallback(status) {
  if (status === 400) {
    return "برجاء مراجعة البيانات المدخلة ثم المحاولة مرة أخرى";
  }

  if (status === 401) {
    return "انتهت جلسة الدخول، من فضلك سجّل الدخول مرة أخرى";
  }

  if (status === 403) {
    return "عذرًا، هذا الإجراء متاح لحسابات محددة فقط";
  }

  if (status === 404) {
    return "لم يتم العثور على البيانات المطلوبة";
  }

  if (status === 409) {
    return "يوجد حجز مشابه أو تعارض في الموعد، من فضلك راجع بيانات الحجز";
  }

  if (status === 422) {
    return "برجاء استكمال البيانات المطلوبة ومراجعتها";
  }

  if (status === 429) {
    return "تم إرسال طلبات كثيرة، انتظر قليلًا ثم حاول مرة أخرى";
  }

  if (status >= 500) {
    return `لم نتمكن من تنفيذ الطلب حاليًا بسبب مشكلة في الخادم (كود ${status})`;
  }

  return "لم نتمكن من تنفيذ الطلب، من فضلك حاول مرة أخرى";
}

export class ApiError extends Error {
  constructor(message, { status, data } = {}) {
    super(translateApiErrorMessage(message, getStatusErrorFallback(status)));
    this.name = "ApiError";
    this.originalMessage = message;
    this.status = status;
    this.data = data;
  }
}

function normalizeTokenRole(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function decodeJwtPayload(token) {
  const [, payload] = String(token || "").split(".");
  if (!payload) return null;

  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`)
        .join(""),
    );

    return JSON.parse(json);
  } catch {
    return null;
  }
}

function isTokenExpired(payload) {
  if (!payload?.exp) return false;
  return Number(payload.exp) * 1000 <= Date.now();
}

function getTokenRoles(payload) {
  if (!payload || typeof payload !== "object") return [];

  return [
    payload.role,
    payload.userRole,
    payload.accountRole,
    payload.type,
    payload.user?.role,
    payload.data?.role,
    payload.data?.user?.role,
  ]
    .filter(Boolean)
    .map(normalizeTokenRole);
}

export function getStoredToken() {
  if (typeof localStorage === "undefined") return "";

  const storedTokens = TOKEN_KEYS.map((key) => ({
    key,
    token: localStorage.getItem(key),
  })).filter((item) => item.token);
  const requestedRole = normalizeTokenRole(localStorage.getItem("medilinkRole"));

  if (requestedRole) {
    const roleMatchedToken = storedTokens.find(({ token }) => {
      const payload = decodeJwtPayload(token);
      return (
        payload &&
        !isTokenExpired(payload) &&
        getTokenRoles(payload).includes(requestedRole)
      );
    });

    if (roleMatchedToken) return roleMatchedToken.token;
  }

  const activeToken = storedTokens.find(({ token }) => {
    const payload = decodeJwtPayload(token);
    return !payload || !isTokenExpired(payload);
  });

  if (activeToken) return activeToken.token;

  if (storedTokens[0]) {
    return storedTokens[0].token;
  }

  return "";
}

function getErrorMessage(data, fallback) {
  if (!data) return fallback;

  const message =
    typeof data === "string"
      ? data
      : data.message ||
        data.error ||
        data.errors?.[0]?.message ||
        data.errors?.[0] ||
        fallback;

  return translateApiErrorMessage(message, fallback);
}

export function translateApiErrorMessage(message, fallback = "حدث خطأ، حاول مرة أخرى") {
  if (!message) return fallback;

  const text = String(message).trim();
  if (/[\u0600-\u06FF]/.test(text)) return text;

  const normalized = text.toLowerCase();

  if (
    normalized.includes("patient") &&
    normalized.includes("already") &&
    normalized.includes("appointment") &&
    normalized.includes("doctor") &&
    normalized.includes("today")
  ) {
    return "هذا المريض لديه موعد بالفعل مع هذا الطبيب اليوم";
  }

  if (
    normalized.includes("already") &&
    normalized.includes("appointment") &&
    normalized.includes("doctor") &&
    normalized.includes("today")
  ) {
    return "لديك موعد بالفعل مع هذا الطبيب اليوم";
  }

  if (
    normalized.includes("already") &&
    normalized.includes("appointment") &&
    normalized.includes("this time")
  ) {
    return "لديك موعد بالفعل في هذا الوقت";
  }

  if (
    normalized.includes("slot") &&
    (normalized.includes("booked") ||
      normalized.includes("unavailable") ||
      normalized.includes("not available"))
  ) {
    return "هذا الموعد غير متاح الآن، اختر موعدًا آخر";
  }

  if (
    normalized.includes("doctor") &&
    normalized.includes("available") &&
    normalized.includes("time")
  ) {
    return "الطبيب غير متاح في هذا الموعد، من فضلك اختر موعدًا آخر";
  }

  if (
    normalized.includes("appointment") &&
    (normalized.includes("not found") || normalized.includes("does not exist"))
  ) {
    return "تعذر العثور على الموعد";
  }

  if (
    (normalized.includes("patient") || normalized.includes("user")) &&
    (normalized.includes("not found") || normalized.includes("does not exist"))
  ) {
    return normalized.includes("patient")
      ? "تعذر العثور على المريض"
      : "تعذر العثور على المستخدم";
  }

  if (
    normalized.includes("doctor") &&
    (normalized.includes("not found") || normalized.includes("does not exist"))
  ) {
    return "تعذر العثور على الطبيب";
  }

  if (
    normalized.includes("phone") &&
    (normalized.includes("exist") ||
      normalized.includes("already") ||
      normalized.includes("registered") ||
      normalized.includes("used"))
  ) {
    return "رقم الهاتف مستخدم بالفعل";
  }

  if (
    normalized.includes("email") &&
    (normalized.includes("exist") ||
      normalized.includes("already") ||
      normalized.includes("registered") ||
      normalized.includes("used"))
  ) {
    return "البريد الإلكتروني مستخدم بالفعل";
  }

  if (
    normalized.includes("password") &&
    (normalized.includes("incorrect") ||
      normalized.includes("wrong") ||
      normalized.includes("invalid"))
  ) {
    return "كلمة المرور غير صحيحة";
  }

  if (
    normalized.includes("confirm") &&
    normalized.includes("password")
  ) {
    return "تأكيد كلمة المرور غير صحيح";
  }

  if (
    normalized.includes("otp") ||
    normalized.includes("verification code") ||
    normalized.includes("invalid code")
  ) {
    return "كود التحقق غير صحيح";
  }

  if (
    normalized.includes("unauthorized") ||
    normalized.includes("not authorized") ||
    normalized.includes("invalid token") ||
    normalized.includes("jwt") ||
    normalized.includes("token expired")
  ) {
    return "انتهت جلسة الدخول، من فضلك سجّل الدخول مرة أخرى";
  }

  if (
    normalized.includes("receptionist") &&
    (normalized.includes("only") ||
      normalized.includes("must") ||
      normalized.includes("required") ||
      normalized.includes("allowed") ||
      normalized.includes("authorized") ||
      normalized.includes("permission"))
  ) {
    return "هذا الإجراء متاح لموظف الاستقبال فقط، من فضلك سجّل الدخول بالحساب المناسب";
  }

  if (
    normalized.includes("forbidden") ||
    normalized.includes("permission") ||
    normalized.includes("access denied")
  ) {
    return "عذرًا، لا يمكن تنفيذ هذا الإجراء من الحساب الحالي";
  }

  if (
    normalized.includes("required") ||
    normalized.includes("missing") ||
    normalized.includes("must provide")
  ) {
    return "برجاء استكمال البيانات المطلوبة";
  }

  if (
    normalized.includes("invalid") ||
    normalized.includes("not valid")
  ) {
    return "برجاء مراجعة البيانات المدخلة والمحاولة مرة أخرى";
  }

  if (
    normalized.includes("duplicate") ||
    normalized.includes("already exists") ||
    normalized.includes("already exist")
  ) {
    return "هذه البيانات موجودة بالفعل";
  }

  if (
    normalized.includes("file too large") ||
    normalized.includes("max file") ||
    normalized.includes("maximum file") ||
    normalized.includes("payload too large")
  ) {
    return "حجم الملف أكبر من المسموح";
  }

  if (
    normalized.includes("network") ||
    normalized.includes("failed to fetch") ||
    normalized.includes("connection")
  ) {
    return "تعذر الاتصال بالخادم، حاول مرة أخرى";
  }

  if (
    normalized.includes("timeout") ||
    normalized.includes("timed out")
  ) {
    return "انتهت مهلة الاتصال بالخادم، حاول مرة أخرى";
  }

  if (
    normalized.includes("internal server error") ||
    normalized.includes("server error") ||
    normalized.includes("something went wrong") ||
    normalized === "unknown error"
  ) {
    return "لم نتمكن من تنفيذ الطلب حاليًا، من فضلك راجع البيانات وحاول مرة أخرى";
  }

  return fallback || "حدث خطأ، حاول مرة أخرى";
}

async function parseResponse(response) {
  const text = await response.text();

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function apiRequest(path, options = {}) {
  const {
    method = "GET",
    body,
    headers = {},
    signal,
    timeoutMs,
  } = options;
  const token = getStoredToken();
  const requestHeaders = {
    ...headers,
  };
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  if (body !== undefined && !isFormData) {
    requestHeaders["Content-Type"] = "application/json";
  }

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  let response;
  let timedOut = false;
  let timeoutId;
  let requestSignal = signal;

  if (timeoutMs) {
    const controller = new AbortController();
    requestSignal = controller.signal;
    timeoutId = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);

    if (signal) {
      signal.addEventListener("abort", () => controller.abort(), {
        once: true,
      });
    }
  }

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: requestHeaders,
      body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
      cache: "no-store",
      signal: requestSignal,
    });
  } catch {
    if (timedOut) {
      throw new ApiError(
        "\u0627\u0646\u062A\u0647\u062A \u0645\u0647\u0644\u0629 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u0627\u0644\u062E\u0627\u062F\u0645",
        { status: 408 },
      );
    }

    throw new ApiError(
      "\u062A\u0639\u0630\u0631 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u0627\u0644\u062E\u0627\u062F\u0645",
    );
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new ApiError(
      getErrorMessage(
        data,
        "\u062D\u062F\u062B \u062E\u0637\u0623\u060C \u062D\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062E\u0631\u0649",
      ),
      {
        status: response.status,
        data,
      },
    );
  }

  return data;
}
