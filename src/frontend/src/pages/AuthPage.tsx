import { AuthModal } from "@/components/AuthModal";
import type { AuthMode } from "@/types/app";
import { useCallback, useState } from "react";

interface AuthPageProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
}

/**
 * Thin page-level wrapper around AuthModal so any route can render the auth
 * experience without duplicating modal wiring.
 */
export function AuthPage({ isOpen, onClose, initialMode }: AuthPageProps) {
  return (
    <AuthModal isOpen={isOpen} onClose={onClose} initialMode={initialMode} />
  );
}

/** Hook that owns the open/close state and current mode for the auth modal. */
export function useAuthModal(initialMode: AuthMode = "login") {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>(initialMode);

  const open = useCallback(
    (nextMode: AuthMode = initialMode) => {
      setMode(nextMode);
      setIsOpen(true);
    },
    [initialMode],
  );

  const close = useCallback(() => setIsOpen(false), []);

  return { isOpen, mode, open, close };
}
