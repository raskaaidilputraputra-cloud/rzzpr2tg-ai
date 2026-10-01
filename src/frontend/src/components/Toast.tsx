import { useToast } from "@/context/ToastContext";
import { TOAST_VARIANT_STYLES } from "@/lib/toast";
import { cn } from "@/lib/utils";
import type { ToastVariant } from "@/types/app";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

const ICONS: Record<ToastVariant, typeof Info> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const ICON_COLORS: Record<ToastVariant, string> = {
  success: "text-success",
  error: "text-destructive",
  info: "text-skybrand-400",
};

export function ToastContainer() {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      data-ocid="toast.container"
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed bottom-5 right-5 z-[60] flex w-[min(22rem,calc(100vw-2.5rem))] flex-col gap-2"
    >
      {toasts.map((toast) => {
        const Icon = ICONS[toast.variant];
        return (
          <div
            key={toast.id}
            data-ocid="toast"
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-elevated backdrop-blur-xl animate-toast-in",
              TOAST_VARIANT_STYLES[toast.variant],
            )}
          >
            <Icon
              className={cn(
                "mt-0.5 h-4 w-4 shrink-0",
                ICON_COLORS[toast.variant],
              )}
              aria-hidden="true"
            />
            <p className="min-w-0 flex-1 text-sm font-medium leading-snug">
              {toast.message}
            </p>
            <button
              type="button"
              data-ocid="toast.close_button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Tutup notifikasi"
              className="rounded-md p-0.5 text-muted-foreground transition-smooth hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
