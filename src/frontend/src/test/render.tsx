import { ToastContainer } from "@/components/Toast";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ToastProvider } from "@/context/ToastContext";
import type { AuthUser } from "@/types/app";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

interface ProvidersProps {
  children: ReactNode;
  queryClient?: QueryClient;
}

export function AppProviders({ children, queryClient }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient ?? createTestQueryClient()}>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            {children}
            <ToastContainer />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export function renderWithProviders(
  ui: ReactElement,
  queryClient?: QueryClient,
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <AppProviders queryClient={queryClient}>{children}</AppProviders>
    ),
  });
}

export const GUEST_AUTH_USER: AuthUser = {
  principal: null,
  displayName: "Guest User",
  email: null,
  photoUrl: null,
  isGuest: true,
};
