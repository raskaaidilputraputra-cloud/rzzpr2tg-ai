import { cn } from "@/lib/utils";
import type { AuthMode } from "@/types/app";
import { Loader2 } from "lucide-react";
import { type FormEvent, useState } from "react";

interface EmailFormProps {
  mode: AuthMode;
  isPending: boolean;
  onSubmit: (values: {
    email: string;
    password: string;
    fullName: string;
  }) => void;
  onForgotPassword: () => void;
}

const LABEL_CLASS =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground";

const INPUT_CLASS =
  "w-full rounded-xl border border-input bg-transparent px-4 py-3 text-sm text-foreground outline-none transition-smooth placeholder:text-muted-foreground focus:ring-2 focus:ring-ring";

export function EmailForm({
  mode,
  isPending,
  onSubmit,
  onForgotPassword,
}: EmailFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const isRegister = mode === "register";
  const isForgot = mode === "forgot";

  const submitLabel = isRegister
    ? "Daftar dengan Internet Identity"
    : isForgot
      ? "Kembali ke Masuk"
      : "Masuk dengan Internet Identity";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({ email, password, fullName });
  }

  return (
    <form
      data-ocid="auth.form"
      onSubmit={handleSubmit}
      className="space-y-4"
      noValidate
    >
      {isRegister && (
        <div>
          <label htmlFor="auth-name" className={LABEL_CLASS}>
            Full Name
          </label>
          <input
            id="auth-name"
            data-ocid="auth.name_input"
            type="text"
            autoComplete="name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="John Doe"
            className={INPUT_CLASS}
          />
        </div>
      )}

      <div>
        <label htmlFor="auth-email" className={LABEL_CLASS}>
          Email Address
        </label>
        <input
          id="auth-email"
          data-ocid="auth.email_input"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="name@example.com"
          className={INPUT_CLASS}
        />
      </div>

      {!isForgot && (
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label
              htmlFor="auth-password"
              className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Password
            </label>
            <button
              type="button"
              data-ocid="auth.forgot_password_button"
              onClick={onForgotPassword}
              className="rounded text-xs text-skybrand-400 transition-smooth hover:text-skybrand-300 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Forgot password?
            </button>
          </div>
          <input
            id="auth-password"
            data-ocid="auth.password_input"
            type="password"
            required
            autoComplete={isRegister ? "new-password" : "current-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            className={INPUT_CLASS}
          />
        </div>
      )}

      <button
        type="submit"
        data-ocid="auth.submit_button"
        disabled={isPending}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-xl bg-skybrand-600 py-3.5 text-sm font-bold text-primary-foreground shadow-glow transition-smooth hover:bg-skybrand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60",
        )}
      >
        {isPending && (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        )}
        {submitLabel}
      </button>
    </form>
  );
}
