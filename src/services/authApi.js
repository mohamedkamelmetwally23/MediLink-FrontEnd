const API_BASE_URL =
  "https://medilink-backend-production-0364.up.railway.app/api/v1/users";

function getErrorMessage(data, fallback) {
  if (!data) return fallback;
  if (typeof data === "string") return data;

  return (
    data.message ||
    data.error ||
    data.errors?.[0]?.message ||
    data.errors?.[0] ||
    fallback
  );
}

async function request(path, body) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

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

export function saveAuthSession(data) {
  const token =
    data?.token ||
    data?.accessToken ||
    data?.data?.token ||
    data?.data?.accessToken;
  const user = data?.user || data?.data?.user;

  if (token) {
    localStorage.setItem("medilinkToken", token);
  }

  if (user) {
    localStorage.setItem("medilinkUser", JSON.stringify(user));
  }
}
