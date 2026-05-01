import { RouterProvider } from "react-router";
import { router } from "./router";
import { useEffect } from "react";
import { useAuthStore } from "./store/auth.store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserX } from "lucide-react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

import { ThemeProvider } from "./context/theme-context";
import { LanguageProvider } from "./context/language-context";

export default function App() {
  const initialize = useAuthStore((state) => state.initialize);
  const impersonatedUser = useAuthStore((state) => state.impersonatedUser);
  const clearImpersonation = useAuthStore((state) => state.clearImpersonation);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <LanguageProvider>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>

      {impersonatedUser && (
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-red-600 text-white px-4 py-2 flex items-center justify-center gap-4 text-sm font-medium shadow-lg">
          <span className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
            Vous naviguez actuellement en tant que <strong>{impersonatedUser.full_name}</strong>
          </span>
          <button
            onClick={clearImpersonation}
            className="flex items-center gap-1.5 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-sm ml-4"
          >
            <UserX className="w-4 h-4" />
            Arrêter l'impersonification
          </button>
        </div>
      )}
      <div className={impersonatedUser ? "pt-10" : ""}>
        <RouterProvider router={router} />
      </div>
    </QueryClientProvider>
    </ThemeProvider>
    </LanguageProvider>
  );
}

