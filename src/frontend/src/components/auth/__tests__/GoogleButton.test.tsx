import { GoogleButton } from "@/components/auth/GoogleButton";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

describe("GoogleButton", () => {
  it("shows the Google label and fires the click handler", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<GoogleButton onClick={onClick} />);

    const button = screen.getByTestId("auth.google_button");
    expect(button).toHaveTextContent("Continue with Google");
    expect(button).toBeEnabled();

    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("disables itself and shows a pending label while the popup is opening", () => {
    render(<GoogleButton onClick={vi.fn()} isPending />);

    const button = screen.getByTestId("auth.google_button");
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent("Menghubungkan…");
  });
});
