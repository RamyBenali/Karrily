import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/theme-context";
import { cn } from "../ui/utils";
import { motion, AnimatePresence } from "motion/react";

type Props = {
  className?: string;
};

export function ThemeToggle({ className }: Props) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
      className={cn(
        "relative flex h-9 w-[72px] shrink-0 cursor-pointer items-center rounded-full p-1 transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4F5A]/50 focus-visible:ring-offset-2",
        isDark
          ? "bg-gradient-to-r from-indigo-950/80 to-slate-900/80 border border-indigo-500/20 shadow-lg shadow-indigo-500/10"
          : "bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 shadow-lg shadow-amber-200/30",
        className
      )}
    >
      <span className="sr-only">{isDark ? "Mode clair" : "Mode sombre"}</span>

      {/* Track icons — fixed positions */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-2">
        <Sun
          className={cn(
            "h-3.5 w-3.5 transition-all duration-300",
            isDark ? "text-indigo-400/30" : "text-amber-400/50"
          )}
        />
        <Moon
          className={cn(
            "h-3.5 w-3.5 transition-all duration-300",
            isDark ? "text-indigo-300/50" : "text-slate-300/40"
          )}
        />
      </div>

      {/* Sliding thumb */}
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 600, damping: 35 }}
        className={cn(
          "z-10 flex h-7 w-7 items-center justify-center rounded-full shadow-md ring-1 transition-colors duration-300",
          isDark
            ? "ml-auto bg-gradient-to-br from-indigo-900 to-slate-800 ring-indigo-500/30 shadow-indigo-500/20"
            : "mr-auto bg-gradient-to-br from-white to-amber-50 ring-amber-200/50 shadow-amber-300/30"
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="moon"
              initial={{ opacity: 0, rotate: -45, scale: 0.5 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 45, scale: 0.5 }}
              transition={{ duration: 0.2 }}
            >
              <Moon className="h-3.5 w-3.5 text-indigo-300 fill-indigo-300/20" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ opacity: 0, rotate: 45, scale: 0.5 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: -45, scale: 0.5 }}
              transition={{ duration: 0.2 }}
            >
              <Sun className="h-3.5 w-3.5 text-amber-500 fill-amber-400/20" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </button>
  );
}
