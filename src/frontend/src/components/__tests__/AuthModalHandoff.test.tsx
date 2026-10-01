import { AuthModal } from "@/components/AuthModal";
import { renderWithProviders } from "@/test/render";
import { buildTestRouter } from "@/test/router";
import { RouterProvider } from "@tanstack/react-router";
import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const loginMock = vi.fn();
const clearMock = vi.fn();

const authState = {
  isAuthenticated: false,
  displayName: "Ada Lovelace",
};

vi.mock("@caffeineai/core-infrastructure", () => ({
  useInternetIdentity: () => ({
    identity: authState.isAuthenticated
      ? { getPrincipal: () => ({ toText: () => "aaaaa-aa" }) }
      : null,
    login: loginMock,
    clear: clearMock,
    isInitializing: false,
    isLoggingIn: false,
    isAuthenticated: authState.isAuthenticated,
  }),
  useActor: () => ({
    actor: {
      getCallerUserProfile: vi.fn().mockResolvedValue({
        displayName: authState.displayName,
        email: "ada@example.com",
      }),
      saveCallerUserProfile: vi.fn().mockResolvedValue(undefined),
    },
    isFetching: false,
  }),
}));

vi.mock("@/backend", () => ({
  createActor: vi.fn(),
  MessageRole: { user: "user", assistant: "assistant" },
}));

beforeEach(() => {
  loginMock.mockReset();
  clearMock.mockReset();
  authState.isAuthenticated = false;
  authState.displayName = "Ada Lovelace";
});

describe("AuthModal post-login handoff", () => {
  it("closes the modal, greets the user, and returns to the chat view once signed in", async () => {
    authState.isAuthenticated = true;
    const onClose = vi.fn();
    const router = buildTestRouter(
      <AuthModal isOpen onClose={onClose} />,
      "/",
      "/",
    );
    await router.load();
    renderWithProviders(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
    expect(await screen.findByText(/^Selamat datang,/)).toBeInTheDocument();
    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/chat");
    });
  });
});
