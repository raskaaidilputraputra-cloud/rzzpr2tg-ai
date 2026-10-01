import type { ToastVariant } from "@/types/app";

export const TOAST_DURATION_MS = 4500;

export function createToastId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const TOAST_VARIANT_STYLES: Record<ToastVariant, string> = {
  success: "border-success/40 bg-success/10 text-foreground",
  error: "border-destructive/40 bg-destructive/10 text-foreground",
  info: "border-skybrand-500/40 bg-skybrand-500/10 text-foreground",
};
