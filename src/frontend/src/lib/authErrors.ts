/**
 * Translates raw authentication failures into clear, human-readable Indonesian
 * messages. Never surface a raw technical error to the user.
 */

const FRIENDLY_MESSAGES: Array<{ match: RegExp; message: string }> = [
  {
    match: /user.?not.?found|no.?user|tidak ditemukan/i,
    message: "Akun dengan email tersebut tidak ditemukan.",
  },
  {
    match: /wrong.?password|invalid.?password|password.?salah/i,
    message: "Kata sandi salah. Silakan periksa kembali.",
  },
  {
    match: /invalid.?credential|invalid.?login|kredensial/i,
    message: "Email atau kata sandi tidak cocok. Silakan coba lagi.",
  },
  {
    match: /email.?already.?in.?use|already.?registered|sudah terdaftar/i,
    message: "Email ini sudah terdaftar. Silakan masuk sebagai gantinya.",
  },
  {
    match: /invalid.?email|email.?invalid|format.?email/i,
    message: "Format email tidak valid. Periksa kembali penulisannya.",
  },
  {
    match: /weak.?password|password.?too.?short|minimal/i,
    message: "Kata sandi terlalu lemah. Gunakan minimal 6 karakter.",
  },
  {
    match: /too.?many.?requests|rate.?limit|terlalu banyak/i,
    message: "Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.",
  },
  {
    match: /network|fetch|offline|koneksi|timeout/i,
    message: "Koneksi bermasalah. Periksa jaringan Anda lalu coba lagi.",
  },
  {
    match: /popup|blocked|dibatalkan|cancel|closed.?by.?user/i,
    message: "Proses masuk dibatalkan. Silakan coba lagi.",
  },
  {
    match: /not.?configured|unavailable|tidak tersedia/i,
    message: "Layanan masuk sedang tidak tersedia. Coba beberapa saat lagi.",
  },
];

const FALLBACK_MESSAGE =
  "Terjadi kesalahan saat memproses permintaan Anda. Silakan coba lagi.";

/** Extract a readable string from an unknown thrown value. */
function rawMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    const value = (error as { message?: unknown }).message;
    if (typeof value === "string") return value;
  }
  return "";
}

/** Map any thrown auth error to a friendly Indonesian message. */
export function toFriendlyAuthError(error: unknown): string {
  const raw = rawMessage(error);
  if (!raw) return FALLBACK_MESSAGE;
  const match = FRIENDLY_MESSAGES.find((entry) => entry.match.test(raw));
  return match ? match.message : FALLBACK_MESSAGE;
}

/** Friendly message for a failed Google sign-in attempt. */
export function googleSignInError(error: unknown): string {
  const raw = rawMessage(error);
  if (/popup|blocked|cancel|closed/i.test(raw)) {
    return "Jendela masuk Google ditutup sebelum selesai. Silakan coba lagi.";
  }
  return toFriendlyAuthError(error);
}
