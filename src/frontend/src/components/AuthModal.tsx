import { EmailForm } from "@/components/auth/EmailForm";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { googleSignInError, toFriendlyAuthError } from "@/lib/authErrors";
import { cn } from "@/lib/utils";
import type { AuthMode } from "@/types/app";
import { useNavigate } from "@tanstack/react-router";
import { Brain, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
}

interface ModeCopy {
  title: string;
  subtitle: string;
}

const MODE_COPY: Record<AuthMode, ModeCopy> = {
  login: {
    title: "Welcome Back",
    subtitle: "Masuk dengan Internet Identity untuk menyinkronkan obrolan Anda",
  },
  register: {
    title: "Create Account",
    subtitle: "Buat akun Internet Identity untuk fitur asisten pintar",
  },
  forgot: {
    title: "Reset Password",
    subtitle: "Pemulihan kata sandi ditangani oleh Internet Identity",
  },
};

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function AuthModal({
  isOpen,
  onClose,
  initialMode = "login",
}: AuthModalProps) {
  const {
    login,
    loginWithGoogle,
    startAsGuest,
    isAuthenticated,
    isLoggingIn,
    user,
  } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [isPending, setIsPending] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) setMode(initialMode);
  }, [isOpen, initialMode]);

  // A cancelled or failed identity flow must not leave the auth buttons
  // disabled for the rest of the session. Reset the pending flag whenever the
  // modal closes or the identity flow settles.
  useEffect(() => {
    if (!isOpen) setIsPending(false);
  }, [isOpen]);

  useEffect(() => {
    if (!isLoggingIn) setIsPending(false);
  }, [isLoggingIn]);

  // Once the identity resolves, close the modal and return the user to the
  // chat view with their name/avatar visible.
  useEffect(() => {
    if (!isOpen || !isAuthenticated) return;
    showToast(`Selamat datang, ${user.displayName}!`, "success");
    onClose();
    void navigate({ to: "/chat" });
  }, [isOpen, isAuthenticated, user.displayName, showToast, onClose, navigate]);

  useEffect(() => {
    if (!isOpen) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const node = dialogRef.current;
    const first = node?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    first?.focus();

    function handleKeyDown(event: KeyboardEvent) {
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
    }

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused.current?.focus();
    };
  }, [isOpen, onClose]);

  const handleGoogle = useCallback(() => {
    setIsPending(true);
    try {
      loginWithGoogle();
      showToast("Mengalihkan ke Google…", "info");
    } catch (error) {
      showToast(googleSignInError(error), "error");
      setIsPending(false);
    }
  }, [loginWithGoogle, showToast]);

  const handleGuest = useCallback(() => {
    startAsGuest();
    showToast("Anda masuk sebagai tamu. Riwayat bersifat sementara.", "info");
    onClose();
    void navigate({ to: "/chat" });
  }, [startAsGuest, showToast, onClose, navigate]);

  const handleEmailSubmit = useCallback(
    (_values: { email: string; password: string; fullName: string }) => {
      setIsPending(true);
      try {
        // This platform has no email/password backend. Sign-in is handled by
        // Internet Identity, so route every email path through it instead of
        // pretending the credentials were accepted.
        if (mode === "forgot") {
          showToast(
            "Pemulihan kata sandi tidak tersedia. Masuk menggunakan Internet Identity.",
            "info",
          );
          setMode("login");
          return;
        }
        showToast(
          "Masuk menggunakan Internet Identity. Ikuti langkah di jendela yang terbuka.",
          "info",
        );
        login();
      } catch (error) {
        showToast(toFriendlyAuthError(error), "error");
        setIsPending(false);
      }
    },
    [mode, login, showToast],
  );

  if (!isOpen) return null;

  const copy = MODE_COPY[mode];

  return (
    <div
      data-ocid="auth.modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <dialog
        ref={dialogRef}
        open
        aria-modal="true"
        aria-labelledby="auth-title"
        aria-describedby="auth-subtitle"
        className="glass-panel relative m-0 w-full max-w-md rounded-3xl p-8 shadow-elevated animate-fade-in-up"
      >
        <button
          type="button"
          data-ocid="auth.close_button"
          onClick={onClose}
          aria-label="Tutup jendela masuk"
          className="absolute right-6 top-6 rounded-lg p-1 text-muted-foreground transition-smooth hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-skybrand-600 text-primary-foreground shadow-glow">
            <Brain className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2
            id="auth-title"
            data-ocid="auth.title"
            className="text-2xl font-bold text-foreground"
          >
            {copy.title}
          </h2>
          <p
            id="auth-subtitle"
            data-ocid="auth.subtitle"
            className="mt-1 text-sm text-muted-foreground"
          >
            {copy.subtitle}
          </p>
        </div>

        <GoogleButton onClick={handleGoogle} isPending={isPending} />

        <div className="my-4 flex items-center">
          <div className="flex-1 border-t border-border" />
          <span className="px-3 text-xs font-medium uppercase text-muted-foreground">
            Atau Internet Identity
          </span>
          <div className="flex-1 border-t border-border" />
        </div>

        <EmailForm
          mode={mode}
          isPending={isPending}
          onSubmit={handleEmailSubmit}
          onForgotPassword={() => setMode("forgot")}
        />

        <div className="mt-6 text-center text-sm">
          <p data-ocid="auth.switch_text" className="text-muted-foreground">
            {mode === "register" ? (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  data-ocid="auth.switch_login_button"
                  onClick={() => setMode("login")}
                  className="rounded font-semibold text-skybrand-400 transition-smooth hover:text-skybrand-300 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Login
                </button>
              </>
            ) : mode === "forgot" ? (
              <>
                Remembered your password?{" "}
                <button
                  type="button"
                  data-ocid="auth.switch_login_button"
                  onClick={() => setMode("login")}
                  className="rounded font-semibold text-skybrand-400 transition-smooth hover:text-skybrand-300 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Login
                </button>
              </>
            ) : (
              <>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  data-ocid="auth.switch_register_button"
                  onClick={() => setMode("register")}
                  className="rounded font-semibold text-skybrand-400 transition-smooth hover:text-skybrand-300 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Register
                </button>
              </>
            )}
          </p>
        </div>

        <div className="mt-5 border-t border-border pt-5">
          <button
            type="button"
            data-ocid="auth.guest_button"
            onClick={handleGuest}
            className={cn(
              "w-full rounded-xl border border-border px-4 py-3 text-sm font-semibold text-foreground transition-smooth hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
          >
            Continue as Guest
          </button>
        </div>
      </dialog>
    </div>
  );
}
