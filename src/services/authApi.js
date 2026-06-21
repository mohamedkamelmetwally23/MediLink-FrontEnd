import { API_BASE_URL as API_ROOT } from "./apiClient";

const API_BASE_URL = `${API_ROOT}/users`;
export const inactiveAccountMessage =
  "هذا الحساب غير مفعل. برجاء التواصل مع الإدارة لتفعيل الحساب.";

function createAuthError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function getErrorMessage(data, fallback) {
  if (!data) return fallback;

  const rawMessage =
    typeof data === "string"
      ? data
      : data.message ||
        data.error ||
        data.errors?.[0]?.message ||
        data.errors?.[0] ||
        fallback;

  return toArabicErrorMessage(rawMessage, fallback);
}

function toArabicErrorMessage(message, fallback) {
  if (!message) return fallback;

  const text = String(message);
  if (/[\u0600-\u06FF]/.test(text)) return text;

  const normalized = text.toLowerCase();

  if (
    normalized.includes("inactive") ||
    normalized.includes("not active") ||
    normalized.includes("disabled") ||
    normalized.includes("blocked") ||
    normalized.includes("deactivated")
  ) {
    return inactiveAccountMessage;
  }

  if (
    (normalized.includes("phone") ||
      normalized.includes("mobile") ||
      normalized.includes("number")) &&
    (normalized.includes("exist") ||
      normalized.includes("already") ||
      normalized.includes("registered") ||
      normalized.includes("used"))
  ) {
    return "PHONE_ALREADY_EXISTS";
  }

  if (normalized.includes("confirm") && normalized.includes("password")) {
    return "تأكيد كلمة المرور غير صحيح";
  }

  if (normalized.includes("password")) {
    return "رقم الهاتف أو كلمة المرور غير صحيحة";
  }

  if (
    normalized.includes("otp") ||
    normalized.includes("verification") ||
    normalized.includes("code")
  ) {
    return "كود التحقق غير صحيح";
  }

  if (
    normalized.includes("credential") ||
    normalized.includes("unauthorized") ||
    normalized.includes("invalid")
  ) {
    return "البيانات غير صحيحة";
  }

  return fallback;
}

async function request(path, body, options = {}) {
  const { timeoutMs } = options;
  let response;
  let timedOut = false;
  let timeoutId;
  let signal;

  if (timeoutMs) {
    const controller = new AbortController();
    signal = controller.signal;
    timeoutId = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);
  }

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal,
    });
  } catch {
    if (timedOut) {
      throw createAuthError(
        "الخادم استغرق وقتا أطول من المتوقع، حاول مرة أخرى",
        408,
      );
    }

    throw createAuthError("تعذر الاتصال بالخادم، حاول مرة أخرى");
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }

  const text = await response.text();
  let data;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    throw new Error(getErrorMessage(data, "حدث خطأ، حاول مرة أخرى"));
  }

  return data;
}

export function signupUser(payload) {
  return request("/signup", payload);
}

export function extractOtp(data) {
  const otpKeys = new Set([
    "otp",
    "code",
    "verificationcode",
    "verification_code",
  ]);

  const findByKey = (value) => {
    if (!value || typeof value !== "object") return "";

    for (const [key, childValue] of Object.entries(value)) {
      const normalizedKey = key.toLowerCase();

      if (
        otpKeys.has(normalizedKey) ||
        normalizedKey.includes("otp") ||
        normalizedKey.includes("verification")
      ) {
        if (typeof childValue === "string" || typeof childValue === "number") {
          return String(childValue);
        }
      }

      const nestedOtp = findByKey(childValue);
      if (nestedOtp) return nestedOtp;
    }

    return "";
  };

  const keyedOtp = findByKey(data);
  if (keyedOtp) return keyedOtp;

  const serialized = typeof data === "string" ? data : JSON.stringify(data);
  return serialized?.match(/\b\d{6}\b/)?.[0] || "";
}

export function verifyOtp(payload) {
  return request("/verifyOTP", payload);
}

export function loginUser(payload) {
  return request("/login", payload, { timeoutMs: 10000 });
}

function normalizeRoleValue(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function isRoleLikeValue(value) {
  return [
    "admin",
    "administrator",
    "super_admin",
    "superadmin",
    "doctor",
    "dr",
    "receptionist",
    "reception",
    "patient",
    "user",
    "ادمن",
    "مدير",
    "طبيب",
    "موظف_استقبال",
    "مريض",
  ].includes(normalizeRoleValue(value));
}

function normalizeActiveState(value, { statusField = false } = {}) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;

  const normalized = normalizeRoleValue(value);

  if (["active", "enabled", "approved", "verified", "true", "1", "مفعل", "نشط"].includes(normalized)) {
    return true;
  }

  if (
    [
      "inactive",
      "disabled",
      "blocked",
      "deactivated",
      "suspended",
      "pending",
      "unverified",
      "not_verified",
      "not_active",
      "notactive",
      "false",
      "0",
      "غير_مفعل",
      "غير_نشط",
    ].includes(normalized)
  ) {
    return false;
  }

  if (
    statusField &&
    normalized &&
    !["success", "ok", "done"].includes(normalized) &&
    !isRoleLikeValue(normalized)
  ) {
    return false;
  }

  return null;
}

function readActiveStateFrom(value) {
  if (!value || typeof value !== "object") return null;

  const flagValues = [
    value.active,
    value.isActive,
    value.is_active,
    value.enabled,
    value.isEnabled,
    value.accountActive,
    value.isAccountActive,
  ];

  for (const item of flagValues) {
    const state = normalizeActiveState(item);
    if (state !== null) return state;
  }

  const statusValues = [
    value.accountStatus,
    value.userStatus,
    value.status,
    value.state,
  ];

  for (const item of statusValues) {
    const state = normalizeActiveState(item, { statusField: true });
    if (state !== null) return state;
  }

  return null;
}

function readRoleFrom(value) {
  if (!value || typeof value !== "object") return "";

  const directRole =
    value.role ||
    value.userRole ||
    value.accountRole ||
    value.type ||
    value.userType;

  if (directRole) return directRole;

  if (isRoleLikeValue(value.status)) return value.status;

  return (
    readRoleFrom(value.user) ||
    readRoleFrom(value.admin) ||
    readRoleFrom(value.data) ||
    readRoleFrom(value.profile)
  );
}

function readAdminFlag(value) {
  if (!value || typeof value !== "object") return false;

  if (
    value.isAdmin === true ||
    value.admin === true ||
    value.is_admin === true
  ) {
    return true;
  }

  return (
    readAdminFlag(value.user) ||
    readAdminFlag(value.data) ||
    readAdminFlag(value.profile)
  );
}

export function isAdminAccount(data) {
  if (readAdminFlag(data)) return true;

  const role = normalizeRoleValue(readRoleFrom(data));
  return [
    "admin",
    "administrator",
    "super_admin",
    "superadmin",
    "ادمن",
    "مدير",
  ].includes(role);
}

export function getAccountRole(data) {
  if (isAdminAccount(data)) return "admin";

  const role = normalizeRoleValue(readRoleFrom(data));

  if (["doctor", "dr", "طبيب"].includes(role)) return "doctor";
  if (["receptionist", "reception", "موظف_استقبال"].includes(role)) {
    return "receptionist";
  }
  if (["patient", "user", "مريض"].includes(role)) return "patient";

  return "user";
}

export function getPatientAccountId(data) {
  const candidates = [
    data?.patient?._id,
    data?.patient?.id,
    data?.data?.patient?._id,
    data?.data?.patient?.id,
    data?.data?.data?.patient?._id,
    data?.data?.data?.patient?.id,
    data?.patientProfile?._id,
    data?.patientProfile?.id,
    data?.data?.patientProfile?._id,
    data?.data?.patientProfile?.id,
    data?.profile?._id,
    data?.profile?.id,
    data?.data?.profile?._id,
    data?.data?.profile?.id,
    data?.user?.patientId,
    data?.data?.user?.patientId,
    data?.user?._id,
    data?.user?.id,
    data?.data?.user?._id,
    data?.data?.user?.id,
    data?.data?.data?.user?._id,
    data?.data?.data?.user?.id,
    data?._id,
    data?.id,
  ];

  return candidates.find(Boolean) || "";
}

export function isDoctorAccount(data) {
  return getAccountRole(data) === "doctor";
}

function getAuthUser(data) {
  return (
    data?.user ||
    data?.data?.user ||
    data?.profile ||
    data?.data?.profile ||
    (readRoleFrom(data) || readAdminFlag(data) ? data : null)
  );
}

export function isActiveAccount(data) {
  const accountCandidates = [
    getAuthUser(data),
    data?.user,
    data?.data?.user,
    data?.data?.data?.user,
    data?.account,
    data?.data?.account,
    data?.profile,
    data?.data?.profile,
    data?.patient,
    data?.data?.patient,
    data?.doctor,
    data?.data?.doctor,
    data?.receptionist,
    data?.data?.receptionist,
    data,
    data?.data,
    data?.data?.data,
  ].filter(Boolean);

  for (const candidate of accountCandidates) {
    const state = readActiveStateFrom(candidate);
    if (state !== null) return state;
  }

  return true;
}

export function assertActiveAccount(data) {
  if (!isActiveAccount(data)) {
    throw new Error(inactiveAccountMessage);
  }
}

export function saveAuthSession(data) {
  const token =
    data?.token ||
    data?.accessToken ||
    data?.data?.token ||
    data?.data?.accessToken;
  const user = getAuthUser(data);

  if (token) {
    localStorage.setItem("medilinkToken", token);
  }

  if (user) {
    localStorage.setItem("medilinkUser", JSON.stringify(user));
  }

  localStorage.setItem("medilinkRole", getAccountRole(data));
  window.dispatchEvent(new Event("medilink-auth-change"));
}

export function clearAuthSession() {
  [
    "medilinkToken",
    "token",
    "accessToken",
    "medilinkUser",
    "medilinkRole",
    "medilink-admin-users",
    "medilink-admin-specialties",
    "medilink-admin-specialty-prices",
  ].forEach((key) => localStorage.removeItem(key));
  window.dispatchEvent(new Event("medilink-auth-change"));
}
