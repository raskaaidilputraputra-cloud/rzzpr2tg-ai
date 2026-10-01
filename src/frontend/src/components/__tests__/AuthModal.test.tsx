import { AuthModal } from "@/components/AuthModal";
import { renderWithProviders } from "@/test/render";
import { buildTestRouter } from "@/test/router";
import { RouterProvider } from "@tanstack/react-router";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const loginMock = vi.fn();
const clearMock = vi.fn();

vi.mock("@caffeineai/core-infrastructure", () => ({
  useInternetIdentity: () => ({
    identity: null,
    login: loginMock,
    clear: clearMock,
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

beforeEach(() => {
  loginMock.mockReset();
  clearMock.mockReset();
});

async function renderModal() {
  const router = buildTestRouter(<AuthModal isOpen onClose={() => {}} />);
  await router.load();
  renderWithProviders(<RouterProvider router={router} />);
}

describe("AuthModal", () => {
  it("shows the login mode with Google and Internet Identity actions", async () => {
    await renderModal();

    expect(screen.getByTestId("auth.title")).toHaveTextContent("Welcome Back");
    expect(screen.getByTestId("auth.google_button")).toHaveTextContent(
      "Continue with Google",
    );
    expect(screen.getByTestId("auth.submit_button")).toHaveTextContent(
      "Masuk dengan Internet Identity",
    );
  });

  it("switches to register mode and reveals the optional full name field", async () => {
    const user = userEvent.setup();
    await renderModal();

    await user.click(screen.getByTestId("auth.switch_register_button"));

    expect(screen.getByTestId("auth.title")).toHaveTextContent(
      "Create Account",
    );
    expect(screen.getByTestId("auth.name_input")).toBeInTheDocument();
    expect(screen.getByTestId("auth.submit_button")).toHaveTextContent(
      "Daftar dengan Internet Identity",
    );
  });

  it("switches to forgot mode and hides the password field", async () => {
    const user = userEvent.setup();
    await renderModal();

    await user.click(screen.getByTestId("auth.forgot_password_button"));

    expect(screen.getByTestId("auth.title")).toHaveTextContent(
      "Reset Password",
    );
    expect(screen.queryByTestId("auth.password_input")).not.toBeInTheDocument();
    expect(screen.getByTestId("auth.submit_button")).toHaveTextContent(
      "Kembali ke Masuk",
    );
  });

  it("routes the Google action through the per-user Google login", async () => {
    const user = userEvent.setup();
    await renderModal();

    await user.click(screen.getByTestId("auth.google_button"));

    // The per-user Google flow is Internet Identity's `login({ provider: "google" })`.
    expect(loginMock).toHaveBeenCalledWith({ provider: "google" });
  });

  it("starts a guest session and closes the modal", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const router = buildTestRouter(<AuthModal isOpen onClose={onClose} />);
    await router.load();
    renderWithProviders(<RouterProvider router={router} />);

    await user.click(screen.getByTestId("auth.guest_button"));

    expect(clearMock).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("routes the email submit through Internet Identity instead of faking credentials", async () => {
    const user = userEvent.setup();
    await renderModal();

    await user.type(screen.getByTestId("auth.email_input"), "user@example.com");
    await user.type(screen.getByTestId("auth.password_input"), "secret123");
    await user.click(screen.getByTestId("auth.submit_button"));

    expect(loginMock).toHaveBeenCalledTimes(1);
  });

  it("returns to the login view after a forgot-password submit", async () => {
    const user = userEvent.setup();
    await renderModal();

    await user.click(screen.getByTestId("auth.forgot_password_button"));
    expect(screen.getByTestId("auth.title")).toHaveTextContent(
      "Reset Password",
    );

    await user.type(screen.getByTestId("auth.email_input"), "user@example.com");
    await user.click(screen.getByTestId("auth.submit_button"));

    expect(screen.getByTestId("auth.title")).toHaveTextContent("Welcome Back");
    expect(screen.getByTestId("auth.password_input")).toBeInTheDocument();
  });

  it("shows a friendly error toast instead of a raw technical message when login fails", async () => {
    const user = userEvent.setup();
    loginMock.mockImplementation(() => {
      throw new Error("TypeError: x is not a function");
    });
    await renderModal();

    await user.type(screen.getByTestId("auth.email_input"), "user@example.com");
    await user.type(screen.getByTestId("auth.password_input"), "secret123");
    await user.click(screen.getByTestId("auth.submit_button"));

    expect(
      await screen.findByText(
        "Terjadi kesalahan saat memproses permintaan Anda. Silakan coba lagi.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/TypeError/)).not.toBeInTheDocument();
  });
});
