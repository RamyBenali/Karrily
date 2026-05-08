import { useNavigate, useLocation } from "react-router";
import { motion } from "motion/react";
import { ChevronLeft, Bell, Search, SlidersHorizontal } from "lucide-react";
import { useAuthStore } from "../../store/auth.store";
import { useHaptics } from "../../hooks/useHaptics";
import { useNotifications } from "../../hooks/useNotifications";
import { KarillyLogo } from "../brand/karilly-logo";
import { useTheme } from "../../context/theme-context";
import { cn } from "../ui/utils";

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
  showSearch?: boolean;
  showNotifications?: boolean;
  transparent?: boolean;
  onSearchPress?: () => void;
  onFilterPress?: () => void;
  rightAction?: React.ReactNode;
}

const ROUTE_TITLES: Record<string, string> = {
  '/': '',
  '/explore': 'Explorer',
  '/dashboard': 'Mon espace',
  '/lender': 'Mes annonces',
  '/admin': 'Administration',
  '/create': 'Publier',
  '/login': 'Connexion',
  '/signup': 'Inscription',
  '/cgu': 'CGU',
  '/privacy': 'Confidentialité',
  '/legal': 'Mentions légales',
};

export function MobileHeader({
  title,
  showBack,
  showSearch,
  showNotifications = true,
  transparent = false,
  onSearchPress,
  onFilterPress,
  rightAction,
}: MobileHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  const { tap } = useHaptics();
  const { unreadCount } = useNotifications();
  const { isDark } = useTheme();

  const isHome = location.pathname === '/';
  const autoTitle = title ?? ROUTE_TITLES[location.pathname] ?? '';
  const autoShowBack = showBack ?? (location.pathname !== '/' && !isHome);

  const handleBack = () => {
    tap();
    navigate(-1);
  };

  if (transparent && isHome) {
    return (
      <div
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 12px)', height: 'calc(env(safe-area-inset-top) + 60px)' }}
      >
        <KarillyLogo className="h-7" variant={isDark ? "white" : "default"} />
        {isAuthenticated && showNotifications && (
          <button
            onClick={() => { tap(); navigate('/dashboard'); }}
            className="relative w-10 h-10 rounded-2xl bg-background/60 backdrop-blur-xl border border-white/10 flex items-center justify-center"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#FF4F5A] rounded-full border-2 border-background" />
            )}
          </button>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 border-b border-border/30",
        transparent ? "bg-transparent border-transparent" : "bg-background/90 backdrop-blur-2xl"
      )}
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="flex items-center justify-between px-4 h-14">
        {/* Left: back or logo */}
        <div className="flex items-center gap-3 min-w-[40px]">
          {autoShowBack ? (
            <button
              onClick={handleBack}
              className="w-10 h-10 rounded-2xl hover:bg-muted active:scale-95 transition-all flex items-center justify-center -ml-1"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          ) : (
            <button onClick={() => navigate('/')} className="active:scale-95 transition-transform">
              <KarillyLogo className="h-6" variant={isDark ? "white" : "default"} />
            </button>
          )}
        </div>

        {/* Center: title */}
        {autoTitle && (
          <h1 className="absolute left-1/2 -translate-x-1/2 text-base font-black tracking-tight truncate max-w-[55%]">
            {autoTitle}
          </h1>
        )}

        {/* Right: actions */}
        <div className="flex items-center gap-1 min-w-[40px] justify-end">
          {rightAction}
          {onSearchPress && (
            <button
              onClick={() => { tap(); onSearchPress(); }}
              className="w-10 h-10 rounded-2xl hover:bg-muted active:scale-95 transition-all flex items-center justify-center"
            >
              <Search className="w-5 h-5" />
            </button>
          )}
          {onFilterPress && (
            <button
              onClick={() => { tap(); onFilterPress(); }}
              className="w-10 h-10 rounded-2xl hover:bg-muted active:scale-95 transition-all flex items-center justify-center"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          )}
          {showSearch === undefined && !onSearchPress && !onFilterPress && isAuthenticated && showNotifications && (
            <button
              onClick={() => { tap(); navigate('/dashboard'); }}
              className="relative w-10 h-10 rounded-2xl hover:bg-muted active:scale-95 transition-all flex items-center justify-center"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-[#FF4F5A] rounded-full border-2 border-background" />
              )}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
