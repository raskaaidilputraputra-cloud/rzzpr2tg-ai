import type { Principal } from "@icp-sdk/core/principal";

export type { Principal };

/** The signed-in identity, or the guest session when no identity is present. */
export interface AuthUser {
  principal: Principal | null;
  displayName: string;
  email: string | null;
  photoUrl: string | null;
  isGuest: boolean;
}

export type AuthMode = "login" | "register" | "forgot";

export type ToastVariant = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
}

export interface FeatureCard {
  icon: "bot" | "bolt" | "history";
  title: string;
  description: string;
}
