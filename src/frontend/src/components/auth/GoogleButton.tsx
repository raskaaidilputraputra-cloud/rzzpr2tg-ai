import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { SiGoogle } from "react-icons/si";

interface GoogleButtonProps {
  onClick: () => void;
  isPending?: boolean;
  disabled?: boolean;
  className?: string;
}

export function GoogleButton({
  onClick,
  isPending = false,
  disabled = false,
  className,
}: GoogleButtonProps) {
  return (
    <button
      type="button"
      data-ocid="auth.google_button"
      onClick={onClick}
      disabled={disabled || isPending}
      className={cn(
        "flex w-full items-center justify-center gap-3 rounded-xl border border-border px-4 py-3 text-sm font-semibold text-foreground transition-smooth hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <SiGoogle className="h-4 w-4 text-foreground" aria-hidden="true" />
      )}
      <span>{isPending ? "Menghubungkan…" : "Continue with Google"}</span>
    </button>
  );
}
