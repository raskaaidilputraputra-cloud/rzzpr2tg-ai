import { useToast } from "@/context/ToastContext";
import { readApiKey, writeApiKey } from "@/lib/apiKey";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { showToast } = useToast();
  const [apiKey, setApiKey] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) setApiKey(readApiKey());
  }, [open]);

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const node = dialogRef.current;
    const first = node?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    first?.focus();

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !node) return;
      const focusable = Array.from(
        node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );
      if (focusable.length === 0) return;
      const firstEl = focusable[0];
      const lastEl = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === firstEl) {
        event.preventDefault();
        lastEl.focus();
      } else if (!event.shiftKey && document.activeElement === lastEl) {
        event.preventDefault();
        firstEl.focus();
      }
    };

    document.addEventListener("keydown", handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
      previouslyFocused.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleSave = () => {
    writeApiKey(apiKey);
    showToast("API key berhasil disimpan di browser ini.", "success");
    onClose();
  };

  return (
    <div
      data-ocid="settings.modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
    >
      <dialog
        ref={dialogRef}
        open
        aria-modal="true"
        aria-labelledby="settings-title"
        className="relative m-0 w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-elevated"
      >
        <button
          type="button"
          data-ocid="settings.close_button"
          onClick={onClose}
          aria-label="Tutup pengaturan"
          className="absolute right-6 top-6 text-muted-foreground transition-smooth hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <h3
          id="settings-title"
          className="mb-4 text-xl font-bold text-foreground"
        >
          AI Settings — Auto AI
        </h3>

        <div className="space-y-4 text-sm">
          <div>
            <label
              htmlFor="settings-apikey"
              className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Gemini API Key
            </label>
            <input
              id="settings-apikey"
              data-ocid="settings.input"
              type="password"
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              placeholder="Enter Gemini API Key (AIzaSy...)"
              className="w-full rounded-xl border border-input bg-transparent px-4 py-3 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Dapatkan API key Gemini <b>gratis</b> di{" "}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-skybrand-600 hover:underline"
              >
                Google AI Studio &rarr;
              </a>
              . Key disimpan hanya di browser ini (localStorage). Model dipilih
              otomatis (Auto AI) — tidak perlu konfigurasi lain.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              data-ocid="settings.save_button"
              onClick={handleSave}
              className="w-full rounded-xl bg-skybrand-600 py-3 text-sm font-bold text-primary-foreground shadow-subtle transition-smooth hover:bg-skybrand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Save API Key
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
