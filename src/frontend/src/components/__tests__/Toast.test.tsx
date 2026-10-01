import { ToastContainer } from "@/components/Toast";
import { ToastProvider, useToast } from "@/context/ToastContext";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

function Harness() {
  const { showToast } = useToast();
  return (
    <>
      <button
        type="button"
        data-ocid="test.show_success"
        onClick={() => showToast("Berhasil disimpan", "success")}
      >
        success
      </button>
      <button
        type="button"
        data-ocid="test.show_error"
        onClick={() => showToast("Terjadi kesalahan", "error")}
      >
        error
      </button>
      <ToastContainer />
    </>
  );
}

function renderHarness() {
  render(
    <ToastProvider>
      <Harness />
    </ToastProvider>,
  );
}

describe("ToastContainer", () => {
  it("renders nothing until a toast is shown", () => {
    renderHarness();
    expect(screen.queryByTestId("toast.container")).not.toBeInTheDocument();
  });

  it("shows a success toast in the bottom-right container", async () => {
    const user = userEvent.setup();
    renderHarness();

    await user.click(screen.getByTestId("test.show_success"));

    const container = screen.getByTestId("toast.container");
    expect(container).toHaveClass("bottom-5", "right-5");
    expect(screen.getByText("Berhasil disimpan")).toBeInTheDocument();
  });

  it("dismisses a toast when its close button is clicked", async () => {
    const user = userEvent.setup();
    renderHarness();

    await user.click(screen.getByTestId("test.show_error"));
    expect(screen.getByText("Terjadi kesalahan")).toBeInTheDocument();

    await user.click(screen.getByTestId("toast.close_button"));

    expect(screen.queryByText("Terjadi kesalahan")).not.toBeInTheDocument();
  });
});
