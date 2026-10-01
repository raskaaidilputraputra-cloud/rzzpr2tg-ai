import type { UserProfile } from "@/backend";
import type { AuthUser } from "@/types/app";
import type { Principal } from "@icp-sdk/core/principal";

export const GUEST_USER: AuthUser = {
  principal: null,
  displayName: "Guest User",
  email: null,
  photoUrl: null,
  isGuest: true,
};

export function principalToText(principal: Principal | null): string {
  return principal ? principal.toText() : "";
}

export function initialsFromName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "U";
  const parts = trimmed.split(/\s+/).slice(0, 2);
  return parts.map((part) => part.charAt(0).toUpperCase()).join("");
}

export function buildAuthUser(
  principal: Principal | null,
  profile: UserProfile | null,
): AuthUser {
  if (!principal) return GUEST_USER;
  const displayName = profile?.displayName?.trim() || "Pengguna RzzPr2tg Ai";
  return {
    principal,
    displayName,
    email: profile?.email ?? null,
    photoUrl: profile?.photoUrl ?? null,
    isGuest: false,
  };
}
