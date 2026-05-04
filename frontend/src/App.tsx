import { RouterProvider } from "react-router";
import { router } from "./router";
import { useEffect } from "react";
import { useAuthStore } from "./store/auth.store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./context/theme-context";
import { LanguageProvider } from "./context/language-context";
import { Toaster } from "sonner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

export default function App() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <LanguageProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <Toaster position="top-center" richColors />
          <RouterProvider router={router} />
        </QueryClientProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
