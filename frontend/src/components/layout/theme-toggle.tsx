import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/theme-context";
import { cn } from "../ui/utils";
import { motion } from "motion/react";

type Props = {
  className?: string;
};

export function ThemeToggle({ className }: Props) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "relative flex h-10 w-20 shrink-0 cursor-pointer items-center rounded-full bg-muted/40 p-1 border border-border/50 shadow-inner transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4F5A]/40",
        className
      )}
    >
      <span className="sr-only">Toggle theme</span>
      
      {/* Background Icons */}
      <div className="absolute inset-0 flex items-center justify-between px-2 text-muted-foreground/40 pointer-events-none">
        <Sun className="h-4 w-4" />
        <Moon className="h-4 w-4" />
      </div>

      {/* Sliding Thumb */}
      <motion.div
        layout
        className={cn(
          "z-10 flex h-8 w-8 items-center justify-center rounded-full bg-card shadow-lg ring-1 ring-border/50",
          isDark ? "ml-auto" : "mr-auto"
        )}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30
        }}
      >
        {isDark ? (
          <Moon className="h-4 w-4 text-indigo-400 fill-indigo-400/10" />
        ) : (
          <Sun className="h-4 w-4 text-[#FF4F5A] fill-[#FF4F5A]/10" />
        )}
      </motion.div>
    </button>
  );
}
