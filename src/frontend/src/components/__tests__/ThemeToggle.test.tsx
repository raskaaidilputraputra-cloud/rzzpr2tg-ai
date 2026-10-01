import { ThemeToggle } from "@/components/ThemeToggle";
import { ThemeProvider } from "@/context/ThemeContext";
import { THEME_STORAGE_KEY } from "@/lib/theme";
import { render } from "@testing-library/react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

function renderToggle() {
  return render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>,
  );
}

describe("ThemeToggle", () => {
  it("defaults to dark and toggles to light, persisting the choice", async () => {
    const user = userEvent.setup();
    renderToggle();

    expect(document.documentElement.classList.contains("dark")).toBe(true);

    await user.click(screen.getByTestId("theme.toggle"));

    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
  });

  it("restores the persisted theme on a fresh mount", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "light");
    renderToggle();

    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(
      screen.getByRole("button", { name: "Aktifkan mode gelap" }),
    ).toBeInTheDocument();
  });
});
