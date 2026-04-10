import { Outlet } from "react-router";
import { Navigation } from "./navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { motion, AnimatePresence } from "motion/react";
import { useLocation } from "react-router";

export function MainLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Desktop Header */}
      <Navigation />

      {/* Main Content Area */}
      <main className="flex-1 pb-20 lg:pb-0 pt-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
