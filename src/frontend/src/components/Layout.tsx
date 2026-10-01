import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { useRouterState } from "@tanstack/react-router";
import type { PropsWithChildren } from "react";

export function Layout({ children }: PropsWithChildren) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const isChatRoute = pathname === "/chat";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {!isChatRoute && <Header />}
      <main className="flex-1">{children}</main>
      {!isChatRoute && <Footer />}
    </div>
  );
}
