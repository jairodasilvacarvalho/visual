import { getCurrentUser, getToken } from "./authService";

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

function decodeJwtPayload(token) {
  const [, payload] = String(token || "").split(".");

  if (!payload || typeof window === "undefined") {
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

function extractUserId(value) {
  if (!value || typeof value !== "object") {
    return null;
  }

  return normalizeUserId(value.id)
    || normalizeUserId(value.userId)
    || normalizeUserId(value.user_id)
    || normalizeUserId(value.sub);
}

export function getCurrentUserId() {
  const envUserId = normalizeUserId(import.meta.env.VITE_CURRENT_USER_ID);

  if (envUserId) {
    return envUserId;
  }

  const storedUserId = extractUserId(getCurrentUser());

  if (storedUserId) {
    return storedUserId;
  }

  const tokenUserId = extractUserId(decodeJwtPayload(getToken()));

  if (tokenUserId) {
    return tokenUserId;
  }

  const legacyUserId = normalizeUserId(readStorageValue("userId"))
    || normalizeUserId(readStorageValue("aiSalesUserId"));

  if (legacyUserId) {
    return legacyUserId;
  }

  // TODO: remover fallback quando autenticação real estiver implementada no Trainer.
  return "1";
}
