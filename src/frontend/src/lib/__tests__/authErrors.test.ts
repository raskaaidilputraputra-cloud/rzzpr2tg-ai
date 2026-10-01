import { googleSignInError, toFriendlyAuthError } from "@/lib/authErrors";
import { describe, expect, it } from "vitest";

describe("toFriendlyAuthError", () => {
  it("maps a wrong-password failure to a human-readable Indonesian message", () => {
    expect(toFriendlyAuthError(new Error("Wrong password"))).toBe(
      "Kata sandi salah. Silakan periksa kembali.",
    );
  });

  it("maps an unknown-user failure", () => {
    expect(toFriendlyAuthError("user not found")).toBe(
      "Akun dengan email tersebut tidak ditemukan.",
    );
  });

  it("never surfaces a raw technical message", () => {
    const message = toFriendlyAuthError(
      new Error("TypeError: x is not a function"),
    );
    expect(message).toBe(
      "Terjadi kesalahan saat memproses permintaan Anda. Silakan coba lagi.",
    );
    expect(message).not.toContain("TypeError");
  });

  it("handles a non-error thrown value", () => {
    expect(toFriendlyAuthError(undefined)).toBe(
      "Terjadi kesalahan saat memproses permintaan Anda. Silakan coba lagi.",
    );
  });
});

describe("googleSignInError", () => {
  it("reports a closed popup in Indonesian", () => {
    expect(googleSignInError(new Error("Popup closed by user"))).toBe(
      "Jendela masuk Google ditutup sebelum selesai. Silakan coba lagi.",
    );
  });

  it("falls back to the friendly mapper for other failures", () => {
    expect(googleSignInError(new Error("network error"))).toBe(
      "Koneksi bermasalah. Periksa jaringan Anda lalu coba lagi.",
    );
  });
});
