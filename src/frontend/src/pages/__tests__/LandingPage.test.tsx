import { LandingPage } from "@/pages/LandingPage";
import { renderWithProviders } from "@/test/render";
import { buildTestRouter } from "@/test/router";
import { RouterProvider } from "@tanstack/react-router";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const loginMock = vi.fn();
const loginWithGoogleMock = vi.fn();
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
  loginWithGoogleMock.mockReset();
  clearMock.mockReset();
});

async function renderLanding() {
  const router = buildTestRouter(<LandingPage />);
  await router.load();
  renderWithProviders(<RouterProvider router={router} />);
}

describe("LandingPage", () => {
  it("renders the hero, three feature cards, and the guest/login actions", async () => {
    await renderLanding();

    expect(
      screen.getByRole("heading", { level: 1, name: /RzzPr2tg Ai/ }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Your Smart AI Assistant/)).toBeInTheDocument();

    const cards = screen.getAllByTestId("landing.feature_card");
    expect(cards).toHaveLength(3);
    expect(within(cards[0]).getByText("AI Chat & Coding")).toBeInTheDocument();

    expect(screen.getByTestId("landing.guest_button")).toBeInTheDocument();
    expect(screen.getByTestId("landing.login_button")).toBeInTheDocument();
  });

  it("opens the auth modal when Login / Register is clicked", async () => {
    const user = userEvent.setup();
    await renderLanding();

    expect(screen.queryByTestId("auth.modal")).not.toBeInTheDocument();

    await user.click(screen.getByTestId("landing.login_button"));

    expect(screen.getByTestId("auth.modal")).toBeInTheDocument();
    expect(screen.getByTestId("auth.title")).toHaveTextContent("Welcome Back");
  });
});
