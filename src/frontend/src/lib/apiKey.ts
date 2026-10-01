const API_KEY_STORAGE_KEY = "rzzpr2tg_ai_key";

/** Read the Gemini API key the user entered in Settings. */
export function readApiKey(): string {
  try {
    return window.localStorage.getItem(API_KEY_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

/** Persist the Gemini API key in this browser only. */
export function writeApiKey(key: string): void {
  try {
    window.localStorage.setItem(API_KEY_STORAGE_KEY, key.trim());
  } catch {
    // Storage can be unavailable in private browsing; the key simply is not kept.
  }
}

export interface ApiKeyCheckResult {
  valid: boolean;
  message: string;
}

/**
 * Validate a Gemini API key against the public models endpoint.
 * Returns a friendly Indonesian message for the toast.
 */
export async function checkApiKey(key: string): Promise<ApiKeyCheckResult> {
  const trimmed = key.trim();
  if (!trimmed) {
    return {
      valid: false,
      message: "Masukkan API key terlebih dahulu di Pengaturan.",
    };
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(
        trimmed,
      )}&pageSize=1`,
    );

    if (response.ok) {
      return {
        valid: true,
        message: "API key VALID! Key siap digunakan.",
      };
    }

    let detail = `HTTP ${response.status}`;
    try {
      const body = (await response.json()) as {
        error?: { message?: string };
      };
      if (body.error?.message) detail = body.error.message;
    } catch {
      // Non-JSON error body; keep the status text.
    }
    return { valid: false, message: `Key DITOLAK: ${detail}` };
  } catch {
    return {
      valid: false,
      message: "Gagal memeriksa API key. Periksa koneksi internet Anda.",
    };
  }
}
