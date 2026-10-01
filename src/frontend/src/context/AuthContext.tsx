import { createActor } from "@/backend";
import { GUEST_USER, buildAuthUser } from "@/lib/auth";
import type { AuthUser } from "@/types/app";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";

interface AuthContextValue {
  user: AuthUser;
  isAuthenticated: boolean;
  isGuest: boolean;
  isInitializing: boolean;
  isLoggingIn: boolean;
  login: () => void;
  loginWithGoogle: () => void;
  logout: () => void;
  startAsGuest: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const {
    identity,
    login: iiLogin,
    clear,
    isInitializing,
    isLoggingIn,
    isAuthenticated,
  } = useInternetIdentity();
  const { actor, isFetching } = useActor(createActor);
  const queryClient = useQueryClient();

  const principal = identity?.getPrincipal() ?? null;
  const principalText = principal?.toText() ?? null;

  const profileQuery = useQuery({
    queryKey: ["caller-profile", principalText ?? "anonymous"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching && !!principal,
  });

  // Persist the caller profile once per identity so the backend can return a
  // real display name/avatar instead of the generic fallback. Internet
  // Identity exposes no name/email claims to the frontend, so we seed a
  // readable default derived from the principal and let the user's own
  // profile (if already saved) win.
  const savedProfileFor = useRef<string | null>(null);
  useEffect(() => {
    if (!actor || isFetching || !principalText) return;
    if (savedProfileFor.current === principalText) return;
    if (profileQuery.isLoading) return;
    if (profileQuery.data) {
      savedProfileFor.current = principalText;
      return;
    }
    savedProfileFor.current = principalText;
    const shortId = principalText.slice(0, 5).toUpperCase();
    void actor
      .saveCallerUserProfile({
        displayName: `Pengguna ${shortId}`,
      })
      .then(() =>
        queryClient.invalidateQueries({
          queryKey: ["caller-profile", principalText],
        }),
      )
      .catch(() => {
        savedProfileFor.current = null;
      });
  }, [
    actor,
    isFetching,
    principalText,
    profileQuery.isLoading,
    profileQuery.data,
    queryClient,
  ]);

  const user = useMemo<AuthUser>(() => {
    if (!principal) return GUEST_USER;
    return buildAuthUser(principal, profileQuery.data ?? null);
  }, [principal, profileQuery.data]);

  const login = useCallback(() => iiLogin(), [iiLogin]);
  const loginWithGoogle = useCallback(
    () => iiLogin({ provider: "google" }),
    [iiLogin],
  );
  const logout = useCallback(() => clear(), [clear]);
  const startAsGuest = useCallback(() => clear(), [clear]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated,
      isGuest: !isAuthenticated && !isInitializing,
      isInitializing,
      isLoggingIn,
      login,
      loginWithGoogle,
      logout,
      startAsGuest,
    }),
    [
      user,
      isAuthenticated,
      isInitializing,
      isLoggingIn,
      // isGuest is derived inside the memo above.
      login,
      loginWithGoogle,
      logout,
      startAsGuest,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
