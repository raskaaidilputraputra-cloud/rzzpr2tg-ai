import { checkApiKey, readApiKey, writeApiKey } from "@/lib/apiKey";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("api key storage", () => {
  it("round-trips a key through localStorage", () => {
    writeApiKey("  AIzaSy-test  ");
    expect(readApiKey()).toBe("AIzaSy-test");
  });

  it("returns an empty string when no key is stored", () => {
    expect(readApiKey()).toBe("");
  });
});

describe("checkApiKey", () => {
  it("rejects an empty key with an Indonesian message", async () => {
    const result = await checkApiKey("   ");
    expect(result.valid).toBe(false);
    expect(result.message).toContain("Masukkan API key");
  });

  it("reports a valid key when the models endpoint accepts it", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 200 }),
    );
    const result = await checkApiKey("AIzaSy-valid");
    expect(result.valid).toBe(true);
    expect(result.message).toContain("VALID");
  });

  it("reports a rejected key with the server detail", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: { message: "API key not valid" } }),
      }),
    );
    const result = await checkApiKey("AIzaSy-bad");
    expect(result.valid).toBe(false);
    expect(result.message).toContain("DITOLAK");
    expect(result.message).toContain("API key not valid");
  });

  it("reports a connection failure when the request throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const result = await checkApiKey("AIzaSy-any");
    expect(result.valid).toBe(false);
    expect(result.message).toContain("Gagal memeriksa API key");
  });
});
