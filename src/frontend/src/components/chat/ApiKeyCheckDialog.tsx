import { useToast } from "@/context/ToastContext";
import { checkApiKey, readApiKey } from "@/lib/apiKey";
import { KeyRound, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ApiKeyCheckDialogProps {
  open: boolean;
  onClose: () => void;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function ApiKeyCheckDialog({ open, onClose }: ApiKeyCheckDialogProps) {
  const { showToast } = useToast();
  const [key, setKey] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      setKey(readApiKey());
      setIsChecking(false);
    }
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

  const handleCheck = async () => {
    setIsChecking(true);
    const result = await checkApiKey(key);
    setIsChecking(false);
    showToast(result.message, result.valid ? "success" : "error");
  };

  return (
    <div
      data-ocid="apikey.modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
    >
      <dialog
        ref={dialogRef}
        open
        aria-modal="true"
        aria-labelledby="apikey-title"
        className="relative m-0 w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-elevated"
      >
        <button
          type="button"
          data-ocid="apikey.close_button"
          onClick={onClose}
          aria-label="Tutup cek API key"
          className="absolute right-6 top-6 text-muted-foreground transition-smooth hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <h3
          id="apikey-title"
          className="mb-1 text-xl font-bold text-foreground"
        >
          Cek API Key
        </h3>
        <p className="mb-4 text-xs text-muted-foreground">
          Periksa apakah API key Gemini yang Anda masukkan masih valid.
        </p>

        <div className="space-y-4 text-sm">
          <div>
            <label
              htmlFor="apikey-input"
              className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Gemini API Key
            </label>
            <input
              id="apikey-input"
              data-ocid="apikey.input"
              type="password"
              value={key}
              onChange={(event) => setKey(event.target.value)}
              placeholder="Enter Gemini API Key (AIzaSy...)"
              className="w-full rounded-xl border border-input bg-transparent px-4 py-3 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <button
            type="button"
            data-ocid="apikey.check_button"
            onClick={handleCheck}
            disabled={isChecking}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-skybrand-600 py-3 text-sm font-bold text-primary-foreground shadow-subtle transition-smooth hover:bg-skybrand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isChecking ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <KeyRound className="h-4 w-4" aria-hidden="true" />
            )}
            {isChecking ? "Memeriksa..." : "Cek API Key"}
          </button>
        </div>
      </dialog>
    </div>
  );
}
