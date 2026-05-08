import { RouterProvider } from "react-router";
import { router } from "./router";
import { useEffect } from "react";
import { useAuthStore } from "./store/auth.store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./context/theme-context";
import { LanguageProvider } from "./context/language-context";
import { Toaster } from "sonner";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { SplashScreen } from "@capacitor/splash-screen";
import { Keyboard } from "@capacitor/keyboard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

async function initNativePlugins() {
  if (!Capacitor.isNativePlatform()) return;

  try {
    // Transparent status bar overlay for edge-to-edge
    await StatusBar.setOverlaysWebView({ overlay: true });
    await StatusBar.setStyle({ style: Style.Default });
    await StatusBar.setBackgroundColor({ color: '#00000000' });
  } catch {
    // plugin may not be ready yet
  }

  try {
    await SplashScreen.hide({ fadeOutDuration: 400 });
  } catch {
    // ignore
  }

  if (Capacitor.getPlatform() === 'android') {
    try {
      Keyboard.addListener('keyboardWillShow', () => {
        document.body.style.setProperty('--keyboard-height', '0px');
      });
      Keyboard.addListener('keyboardDidShow', (info) => {
        document.body.style.setProperty('--keyboard-height', `${info.keyboardHeight}px`);
      });
      Keyboard.addListener('keyboardDidHide', () => {
        document.body.style.setProperty('--keyboard-height', '0px');
      });
    } catch {
      // ignore
    }
  }
}

export default function App() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
    initNativePlugins();
  }, [initialize]);

  return (
    <LanguageProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <Toaster
            position="top-center"
            richColors
            toastOptions={{
              style: { marginTop: 'calc(env(safe-area-inset-top) + 8px)' },
            }}
          />
          <RouterProvider router={router} />
        </QueryClientProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
