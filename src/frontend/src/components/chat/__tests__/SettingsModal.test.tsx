import { SettingsModal } from "@/components/chat/SettingsModal";
import { renderWithProviders } from "@/test/render";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("@caffeineai/core-infrastructure", () => ({
  useInternetIdentity: () => ({
    identity: null,
    login: vi.fn(),
    clear: vi.fn(),
    isInitializing: false,
    isLoggingIn: false,
    isAuthenticated: false,
  }),
  useActor: () => ({ actor: null, isFetching: false }),
}));

vi.mock("@/backend", () => ({
  createActor: vi.fn(),
  MessageRole: { user: "user", assistant: "assistant" },
}));

function renderSettings(onClose = vi.fn()) {
  renderWithProviders(<SettingsModal open onClose={onClose} />);
  return onClose;
}

describe("SettingsModal", () => {
  it("keeps only the API key field and Save action", () => {
    renderSettings();

    const modal = screen.getByTestId("settings.modal");
    expect(within(modal).getByTestId("settings.input")).toBeInTheDocument();
    expect(within(modal).getByTestId("settings.save_button")).toHaveTextContent(
      "Save API Key",
    );
    // The Cek API Key action lives in the main menu, never in Settings.
    expect(within(modal).queryByText("Cek API Key")).not.toBeInTheDocument();
    expect(
      within(modal).queryByTestId("apikey.check_button"),
    ).not.toBeInTheDocument();
  });

  it("persists the entered key and confirms with a success toast", async () => {
    const user = userEvent.setup();
    const onClose = renderSettings();

    await user.type(screen.getByTestId("settings.input"), "AIzaSy-saved");
    await user.click(screen.getByTestId("settings.save_button"));

    expect(window.localStorage.getItem("rzzpr2tg_ai_key")).toBe("AIzaSy-saved");
    expect(
      await screen.findByText(/API key berhasil disimpan/i),
    ).toBeInTheDocument();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("prefills the stored key when reopened", () => {
    window.localStorage.setItem("rzzpr2tg_ai_key", "AIzaSy-existing");
    renderSettings();

    expect(screen.getByTestId("settings.input")).toHaveValue("AIzaSy-existing");
  });
});
