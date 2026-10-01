import { ChatPage } from "@/pages/ChatPage";
import { renderWithProviders } from "@/test/render";
import { buildTestRouter } from "@/test/router";
import { RouterProvider } from "@tanstack/react-router";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const sendChatMessageStream = vi.fn();
const listConversations = vi.fn();
const getConversation = vi.fn();
const deleteConversation = vi.fn();
const getCallerUserProfile = vi.fn();
const saveCallerUserProfile = vi.fn();

const authState = {
  identity: null as null | { getPrincipal: () => { toText: () => string } },
  isAuthenticated: false,
  isInitializing: false,
  isLoggingIn: false,
};

vi.mock("@caffeineai/core-infrastructure", () => ({
  useInternetIdentity: () => ({
    identity: authState.identity,
    login: vi.fn(),
    clear: vi.fn(),
    isInitializing: authState.isInitializing,
    isLoggingIn: authState.isLoggingIn,
    isAuthenticated: authState.isAuthenticated,
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
  sendChatMessageStream.mockReset();
  listConversations.mockReset();
  getConversation.mockReset();
  deleteConversation.mockReset();
  getCallerUserProfile.mockReset();
  saveCallerUserProfile.mockReset();
  authState.identity = null;
  authState.isAuthenticated = false;
  authState.isInitializing = false;
  authState.isLoggingIn = false;
});

async function renderChat() {
  const router = buildTestRouter(<ChatPage />, "/chat", "/chat");
  await router.load();
  renderWithProviders(<RouterProvider router={router} />);
}

describe("ChatPage as guest", () => {
  it("shows the guest banner and the empty-state composer", async () => {
    await renderChat();

    expect(screen.getByTestId("chat.guest_banner")).toBeInTheDocument();
    expect(screen.getByTestId("chat.textarea")).toBeInTheDocument();
    expect(screen.getByTestId("chat.empty_state")).toBeInTheDocument();
  });

  it("streams a reply chunk by chunk and renders it", async () => {
    const user = userEvent.setup();
    sendChatMessageStream.mockResolvedValue({
      conversationId: 0n,
      chunks: ["Halo", " dari", " AI"],
      message: {
        id: 0n,
        role: "assistant",
        content: "Halo dari AI",
        createdAt: 0n,
      },
    });

    await renderChat();

    await user.type(screen.getByTestId("chat.textarea"), "Hai");
    await user.click(screen.getByTestId("chat.send_button"));

    await waitFor(() => {
      expect(screen.getByText("Hai")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText("Halo dari AI")).toBeInTheDocument();
    });
    expect(sendChatMessageStream).toHaveBeenCalledTimes(1);
  });

  it("shows a Stop control while generating and halts on click", async () => {
    const user = userEvent.setup();
    let resolveStream: (value: unknown) => void = () => {};
    sendChatMessageStream.mockReturnValue(
      new Promise((resolve) => {
        resolveStream = resolve;
      }),
    );

    await renderChat();

    await user.type(screen.getByTestId("chat.textarea"), "Hai");
    await user.click(screen.getByTestId("chat.send_button"));

    const stopButton = await screen.findByTestId("chat.stop_button");
    await user.click(stopButton);

    // Resolving after Stop must not append the reply.
    resolveStream({
      conversationId: 0n,
      chunks: ["late"],
      message: { id: 0n, role: "assistant", content: "late", createdAt: 0n },
    });

    await waitFor(() => {
      expect(screen.queryByText("late")).not.toBeInTheDocument();
    });
    expect(screen.getByTestId("chat.send_button")).toBeInTheDocument();
  });

  it("shows a retry action when the backend call fails", async () => {
    const user = userEvent.setup();
    sendChatMessageStream.mockRejectedValue(new Error("boom"));

    await renderChat();

    await user.type(screen.getByTestId("chat.textarea"), "Hai");
    await user.click(screen.getByTestId("chat.send_button"));

    expect(await screen.findByTestId("chat.retry_button")).toBeInTheDocument();
    expect(
      screen.getByText(/terjadi kesalahan saat menghubungi server/i),
    ).toBeInTheDocument();
  });

  it("re-sends the last prompt and clears the error when retry is clicked", async () => {
    const user = userEvent.setup();
    sendChatMessageStream.mockRejectedValueOnce(new Error("boom"));

    await renderChat();

    await user.type(screen.getByTestId("chat.textarea"), "Hai");
    await user.click(screen.getByTestId("chat.send_button"));

    const retryButton = await screen.findByTestId("chat.retry_button");

    sendChatMessageStream.mockResolvedValueOnce({
      conversationId: 0n,
      chunks: ["Halo", " lagi"],
      message: {
        id: 0n,
        role: "assistant",
        content: "Halo lagi",
        createdAt: 0n,
      },
    });
    await user.click(retryButton);

    expect(await screen.findByText("Halo lagi")).toBeInTheDocument();
    expect(screen.queryByTestId("chat.retry_button")).not.toBeInTheDocument();
    expect(sendChatMessageStream).toHaveBeenCalledTimes(2);
  });
});

describe("ChatPage as signed-in user", () => {
  beforeEach(() => {
    authState.identity = {
      getPrincipal: () => ({ toText: () => "aaaaa-aa" }),
    };
    authState.isAuthenticated = true;
    getCallerUserProfile.mockResolvedValue({
      displayName: "Ada Lovelace",
      email: "ada@example.com",
    });
    listConversations.mockResolvedValue([
      {
        id: 1n,
        title: "Percakapan Pertama",
        createdAt: 0n,
        updatedAt: 0n,
        messageCount: 2n,
      },
    ]);
  });

  it("lists persisted conversations and shows the user's name", async () => {
    await renderChat();

    expect(await screen.findByText("Percakapan Pertama")).toBeInTheDocument();
    expect(await screen.findByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.queryByTestId("chat.guest_banner")).not.toBeInTheDocument();
  });

  it("filters the conversation list with the search box", async () => {
    const user = userEvent.setup();
    await renderChat();

    await screen.findByText("Percakapan Pertama");
    await user.type(screen.getByTestId("chat.search_input"), "tidak-ada");

    expect(screen.getByText("Tidak ada hasil")).toBeInTheDocument();
  });
});
