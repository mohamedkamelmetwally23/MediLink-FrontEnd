const API_BASE_URL =
  "https://medilink-backend-production-0364.up.railway.app/api/v1/users";

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

  if (normalized.includes("password")) {
    return "كلمة المرور غير صحيحة أو لا تطابق الشروط";
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

async function request(path, body) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("تعذر الاتصال بالخادم، حاول مرة أخرى");
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
  return request("/login", payload);
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
}
