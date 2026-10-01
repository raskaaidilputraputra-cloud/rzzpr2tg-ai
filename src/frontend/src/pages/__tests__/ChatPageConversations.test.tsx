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
const loginMock = vi.fn();

const authState = {
  identity: null as null | { getPrincipal: () => { toText: () => string } },
  isAuthenticated: false,
  isInitializing: false,
  isLoggingIn: false,
};

vi.mock("@caffeineai/core-infrastructure", () => ({
  useInternetIdentity: () => ({
    identity: authState.identity,
    login: loginMock,
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
  loginMock.mockReset();
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

function signIn() {
  authState.identity = { getPrincipal: () => ({ toText: () => "aaaaa-aa" }) };
  authState.isAuthenticated = true;
  getCallerUserProfile.mockResolvedValue({
    displayName: "Ada Lovelace",
    email: "ada@example.com",
  });
}

describe("ChatPage conversation history", () => {
  it("loads a persisted conversation's messages when it is selected", async () => {
    const user = userEvent.setup();
    signIn();
    listConversations.mockResolvedValue([
      {
        id: 1n,
        title: "Percakapan Pertama",
        createdAt: 0n,
        updatedAt: 0n,
        messageCount: 2n,
      },
    ]);
    getConversation.mockResolvedValue({
      id: 1n,
      title: "Percakapan Pertama",
      createdAt: 0n,
      updatedAt: 0n,
      messages: [
        { id: 1n, role: "user", content: "Halo", createdAt: 0n },
        { id: 2n, role: "assistant", content: "Hai juga", createdAt: 0n },
      ],
    });

    await renderChat();

    await user.click(await screen.findByText("Percakapan Pertama"));

    expect(await screen.findByText("Halo")).toBeInTheDocument();
    expect(await screen.findByText("Hai juga")).toBeInTheDocument();
    expect(getConversation).toHaveBeenCalledWith(1n);
  });

  it("clears the message list when New Chat is clicked", async () => {
    const user = userEvent.setup();
    signIn();
    listConversations.mockResolvedValue([
      {
        id: 1n,
        title: "Percakapan Pertama",
        createdAt: 0n,
        updatedAt: 0n,
        messageCount: 2n,
      },
    ]);
    getConversation.mockResolvedValue({
      id: 1n,
      title: "Percakapan Pertama",
      createdAt: 0n,
      updatedAt: 0n,
      messages: [{ id: 1n, role: "user", content: "Halo", createdAt: 0n }],
    });

    await renderChat();
    await user.click(await screen.findByText("Percakapan Pertama"));
    expect(await screen.findByText("Halo")).toBeInTheDocument();

    await user.click(screen.getByTestId("chat.new_chat_button"));

    await waitFor(() => {
      expect(screen.queryByText("Halo")).not.toBeInTheDocument();
    });
    expect(screen.getByTestId("chat.empty_state")).toBeInTheDocument();
  });

  it("deletes a conversation through the backend and drops it from the list", async () => {
    const user = userEvent.setup();
    signIn();
    listConversations.mockResolvedValue([
      {
        id: 1n,
        title: "Percakapan Pertama",
        createdAt: 0n,
        updatedAt: 0n,
        messageCount: 2n,
      },
    ]);
    deleteConversation.mockResolvedValue(true);

    await renderChat();
    await screen.findByText("Percakapan Pertama");

    await user.click(screen.getByTestId("chat.delete_button.1"));

    await waitFor(() => {
      expect(deleteConversation).toHaveBeenCalledWith(1n);
    });
  });
});

describe("ChatPage guest banner", () => {
  it("starts the sign-in flow from the guest banner's Create Account action", async () => {
    const user = userEvent.setup();
    await renderChat();

    await user.click(screen.getByTestId("chat.create_account_button"));

    expect(loginMock).toHaveBeenCalledTimes(1);
  });
});
