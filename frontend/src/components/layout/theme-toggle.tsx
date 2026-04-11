import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/theme-context";
import { cn } from "../ui/utils";

type Props = {
  /** Hero / landing : meilleur contraste sur fond dégradé sombre */
  transparent?: boolean;
  className?: string;
};

export function ThemeToggle({ transparent, className }: Props) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? "Mode clair" : "Mode sombre"}
      aria-label={isDark ? "Activer le mode clair" : "Activer le mode sombre"}
      aria-pressed={isDark}
      className={cn(
        "relative inline-flex h-8 w-14 shrink-0 items-center rounded-full p-0.5 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4F5A]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        transparent
          ? "bg-white/15 border border-white/20 backdrop-blur-md"
          : isDark
            ? "bg-[#1e293b] border border-white/10"
            : "bg-[#e2e8f0] border border-black/5",
        className,
      )}
    >
      {/* Background icons */}
      <Sun
        className={cn(
          "absolute left-1.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 transition-opacity duration-300",
          transparent ? "text-white/40" : "text-amber-400/60",
          isDark ? "opacity-40" : "opacity-0",
        )}
        aria-hidden
      />
      <Moon
        className={cn(
          "absolute right-1.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 transition-opacity duration-300",
          transparent ? "text-white/40" : "text-slate-400/60",
          isDark ? "opacity-0" : "opacity-40",
        )}
        aria-hidden
      />

      {/* Sliding thumb */}
      <span
        className={cn(
          "z-10 flex h-7 w-7 items-center justify-center rounded-full shadow-md transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          isDark
            ? "translate-x-6 bg-[#1a1a2e] text-amber-300 ring-1 ring-white/10"
            : "translate-x-0 bg-white text-slate-700 ring-1 ring-black/5",
        )}
      >
        {isDark ? (
          <Moon className="h-3.5 w-3.5" strokeWidth={2.5} />
        ) : (
          <Sun className="h-3.5 w-3.5" strokeWidth={2.5} />
        )}
      </span>

      <span className="sr-only">{isDark ? "Passer en mode clair" : "Passer en mode sombre"}</span>
    </button>
  );
}
