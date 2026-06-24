const DIRECT_USER_ID_KEYS = [
  "currentUserId",
  "userId",
  "aiSalesUserId"
];

const USER_OBJECT_KEYS = [
  "currentUser",
  "user",
  "authUser",
  "aiSalesUser"
];

const TOKEN_KEYS = [
  "token",
  "authToken",
  "accessToken",
  "aiSalesToken"
];

function readStorageValue(key) {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(key) || window.sessionStorage.getItem(key);
}

function normalizeUserId(value) {
  const normalizedValue = String(value || "").trim();

  return normalizedValue || null;
}

function extractUserIdFromObject(value) {
  if (!value || typeof value !== "object") {
    return null;
  }

  return normalizeUserId(value.userId)
    || normalizeUserId(value.user_id)
    || normalizeUserId(value.id)
    || null;
}

function parseStoredJson(value) {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function decodeJwtPayload(token) {
  const [, payload] = String(token || "").split(".");

  if (!payload) {
    return null;
  }

  try {
    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
      "="
    );

    return JSON.parse(window.atob(paddedPayload));
  } catch {
    return null;
  }
}

export function getCurrentUserId() {
  const envUserId = normalizeUserId(import.meta.env.VITE_CURRENT_USER_ID);

  if (envUserId) {
    return envUserId;
  }

  for (const key of DIRECT_USER_ID_KEYS) {
    const userId = normalizeUserId(readStorageValue(key));

    if (userId) {
      return userId;
    }
  }

  for (const key of USER_OBJECT_KEYS) {
    const userId = extractUserIdFromObject(parseStoredJson(readStorageValue(key)));

    if (userId) {
      return userId;
    }
  }

  for (const key of TOKEN_KEYS) {
    const payload = decodeJwtPayload(readStorageValue(key));
    const userId = extractUserIdFromObject(payload) || normalizeUserId(payload?.sub);

    if (userId) {
      return userId;
    }
  }

  // TODO: remover fallback quando autenticação real estiver implementada.
  return "1";
}
