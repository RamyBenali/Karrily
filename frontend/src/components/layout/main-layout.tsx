import { Outlet, useLocation } from "react-router";
import { Navigation } from "./navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { MobileHeader } from "@/components/layout/mobile-header";
import { motion, AnimatePresence } from "motion/react";
import { ChatBot } from "../ai/ChatBot";
import { useNativeBack } from "@/hooks/useNativeBack";
import { usePlatform } from "@/hooks/usePlatform";

const PAGE_SLIDE_VARIANTS = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

const PAGE_FADE_VARIANTS = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

// Routes where the hero image extends behind the status bar
const TRANSPARENT_HEADER_ROUTES = ['/'];

// Drill-down routes use a horizontal slide transition
const SLIDE_ROUTES = ['/item/', '/category/', '/create', '/edit-item/'];

function AppLayout() {
  const location = useLocation();
  const { isNative } = usePlatform();

  useNativeBack();

  const isTransparent = TRANSPARENT_HEADER_ROUTES.includes(location.pathname);
  const isSlide = SLIDE_ROUTES.some((r) => location.pathname.startsWith(r));
  const variants = isSlide ? PAGE_SLIDE_VARIANTS : PAGE_FADE_VARIANTS;

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      <div className="hidden lg:block">
        <Navigation />
      </div>

      <div className="lg:hidden">
        <MobileHeader transparent={isTransparent} />
      </div>

      <main
        className="flex-1 pb-[calc(env(safe-area-inset-bottom)+5rem)] lg:pb-0 lg:pt-20"
        style={{
          paddingTop: isNative ? 'calc(env(safe-area-inset-top) + 56px)' : undefined,
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav />
      <ChatBot />
    </div>
  );
}

export function MainLayout() {
  return <AppLayout />;
}
