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
        "group relative inline-flex h-11 w-[4.5rem] shrink-0 items-center rounded-full p-1 transition-[box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4F5A]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]",
        transparent
          ? "border border-white/25 bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-md"
          : "border border-[#0F2A2E]/12 bg-gradient-to-br from-[#0F2A2E]/[0.07] to-[#FF4F5A]/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] dark:border-white/12 dark:from-white/[0.06] dark:to-[#FF4F5A]/[0.12]",
        className,
      )}
    >
      {/* Rail lumineux */}
      <span
        className="pointer-events-none absolute inset-0 rounded-full opacity-40 blur-[2px]"
        style={{
          background: transparent
            ? "linear-gradient(90deg, rgba(255,255,255,0.15), rgba(255,79,90,0.25))"
            : "linear-gradient(90deg, rgba(15,42,46,0.35), rgba(255,79,90,0.35))",
        }}
        aria-hidden
      />

      {/* Icônes de fond (subtiles) */}
      <Sun
        className={cn(
          "pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-opacity duration-200",
          transparent ? "text-white/35" : "text-[#0F2A2E]/35 dark:text-white/25",
          isDark ? "opacity-25" : "opacity-90",
        )}
        aria-hidden
      />
      <Moon
        className={cn(
          "pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-opacity duration-200",
          transparent ? "text-white/35" : "text-[#0F2A2E]/30 dark:text-white/25",
          isDark ? "opacity-90" : "opacity-25",
        )}
        aria-hidden
      />

      {/* Pastille principale */}
      <span
        className={cn(
          "absolute top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full shadow-[0_4px_14px_rgba(0,0,0,0.2)] ring-1 transition-[left,background,box-shadow] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          isDark
            ? "left-[calc(100%-2.35rem)] bg-gradient-to-br from-[#FF4F5A] to-[#ff7a82] text-white ring-white/25"
            : "left-0.5 bg-gradient-to-br from-white to-[#f0f4f4] text-[#0F2A2E] ring-[#0F2A2E]/10 dark:from-[#1a2528] dark:to-[#0f1618] dark:text-[#d4e157] dark:ring-white/15",
        )}
      >
        {isDark ? (
          <Moon className="h-[1.05rem] w-[1.05rem]" strokeWidth={2.25} />
        ) : (
          <Sun className="h-[1.05rem] w-[1.05rem]" strokeWidth={2.25} />
        )}
      </span>

      <span className="sr-only">{isDark ? "Passer en mode clair" : "Passer en mode sombre"}</span>
    </button>
  );
}
