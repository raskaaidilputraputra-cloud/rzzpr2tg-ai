import { ChatPage } from "@/pages/ChatPage";
import { renderWithProviders } from "@/test/render";
import { buildTestRouter } from "@/test/router";
import { RouterProvider } from "@tanstack/react-router";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sendChatMessageStream = vi.fn();
const listConversations = vi.fn();
const getConversation = vi.fn();
const deleteConversation = vi.fn();
const getCallerUserProfile = vi.fn();
const saveCallerUserProfile = vi.fn();

vi.mock("@caffeineai/core-infrastructure", () => ({
  useInternetIdentity: () => ({
    identity: { getPrincipal: () => ({ toText: () => "aaaaa-aa" }) },
    login: vi.fn(),
    clear: vi.fn(),
    isInitializing: false,
    isLoggingIn: false,
    isAuthenticated: true,
  }),
  useActor: () => ({
    actor: {
      sendChatMessageStream,
      listConversations,
      getConversation,
      deleteConversation,
      getCallerUserProfile,
      saveCallerUserProfile,
    },
    isFetching: false,
  }),
}));

vi.mock("@/backend", () => ({
  createActor: vi.fn(),
  MessageRole: { user: "user", assistant: "assistant" },
}));

beforeEach(() => {
  listConversations.mockResolvedValue([]);
  getCallerUserProfile.mockResolvedValue({
    displayName: "Ada",
    email: "ada@example.com",
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

async function renderChat() {
  const router = buildTestRouter(<ChatPage />, "/chat", "/chat");
  await router.load();
  renderWithProviders(<RouterProvider router={router} />);
}

describe("main menu actions", () => {
  it("shows Cek API Key and Hubungi Owner in the sidebar menu", async () => {
    await renderChat();

    expect(screen.getByTestId("chat.check_api_key_button")).toHaveTextContent(
      "Cek API Key",
    );
    const ownerLink = screen.getByTestId("chat.contact_owner_link");
    expect(ownerLink).toHaveTextContent("Hubungi Owner");
    expect(ownerLink).toHaveAttribute("href", "https://wa.me/62881022762735");
    expect(ownerLink).toHaveAttribute("target", "_blank");
  });

  it("keeps Cek API Key out of the Settings modal", async () => {
    const user = userEvent.setup();
    await renderChat();

    await user.click(screen.getByTestId("chat.settings_button"));

    const settings = screen.getByTestId("settings.modal");
    expect(settings).toBeInTheDocument();
    expect(within(settings).queryByText("Cek API Key")).not.toBeInTheDocument();
    expect(within(settings).getByTestId("settings.input")).toBeInTheDocument();
    expect(
      within(settings).getByTestId("settings.save_button"),
    ).toHaveTextContent("Save API Key");
  });

  it("opens the Cek API Key dialog from the menu and reports a valid key", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 200 }),
    );
    await renderChat();

    await user.click(screen.getByTestId("chat.check_api_key_button"));
    expect(screen.getByTestId("apikey.modal")).toBeInTheDocument();

    await user.type(screen.getByTestId("apikey.input"), "AIzaSy-valid");
    await user.click(screen.getByTestId("apikey.check_button"));

    expect(await screen.findByText(/API key VALID/)).toBeInTheDocument();
  });

  it("reports a rejected key through an error toast", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: { message: "API key not valid" } }),
      }),
    );
    await renderChat();

    await user.click(screen.getByTestId("chat.check_api_key_button"));
    await user.type(screen.getByTestId("apikey.input"), "AIzaSy-bad");
    await user.click(screen.getByTestId("apikey.check_button"));

    expect(await screen.findByText(/Key DITOLAK/)).toBeInTheDocument();
  });
});
