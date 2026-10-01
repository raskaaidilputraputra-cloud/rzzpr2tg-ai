import { Layout } from "@/components/Layout";
import { renderWithProviders } from "@/test/render";
import { buildTestRouter } from "@/test/router";
import { RouterProvider } from "@tanstack/react-router";
import { screen } from "@testing-library/react";
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

async function renderLayout(initialPath: string) {
  const router = buildTestRouter(
    <Layout>
      <div data-ocid="layout.child">child</div>
    </Layout>,
    initialPath,
    initialPath,
  );
  await router.load();
  renderWithProviders(<RouterProvider router={router} />);
}

describe("Layout route gating", () => {
  it("shows the sticky header and footer on the landing route", async () => {
    await renderLayout("/");

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
    expect(screen.getByTestId("layout.child")).toBeInTheDocument();
  });

  it("hides the header and footer on the chat route so the chat shell owns the viewport", async () => {
    await renderLayout("/chat");

    expect(screen.queryByTestId("header")).not.toBeInTheDocument();
    expect(screen.queryByTestId("footer")).not.toBeInTheDocument();
    expect(screen.getByTestId("layout.child")).toBeInTheDocument();
  });
});
