import { Home, Compass, PlusSquare, LayoutDashboard, User, Package, Shield } from "lucide-react";
import { Link, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useAuthStore } from "../../store/auth.store";
import { useHaptics } from "../../hooks/useHaptics";
import { usePlatform } from "../../hooks/usePlatform";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  primary?: boolean;
  authRequired?: boolean;
  roles?: string[];
}

export function BottomNav() {
  const location = useLocation();
  const { isAuthenticated, role, hasItems } = useAuthStore();
  const { tap } = useHaptics();
  const { isNative } = usePlatform();

  const isSeller = role === 'lender' || role === 'vendeur' || hasItems;
  const isAdmin = role === 'admin';

  const allItems: NavItem[] = [
    { icon: Home, label: "Accueil", path: "/" },
    { icon: Compass, label: "Explorer", path: "/explore" },
    ...(isSeller && !isAdmin ? [{ icon: PlusSquare, label: "Publier", path: "/create", primary: true }] : []),
    ...(isAuthenticated && !isAdmin ? [{ icon: LayoutDashboard, label: "Activités", path: "/dashboard" }] : []),
    ...(isSeller && !isAdmin ? [{ icon: Package, label: "Annonces", path: "/lender" }] : []),
    ...(isAdmin ? [{ icon: Shield, label: "Admin", path: "/admin" }] : []),
    ...(isAuthenticated && !isSeller && !isAdmin ? [{ icon: User, label: "Profil", path: "/dashboard" }] : []),
  ];

  return (
    <div
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-4"
      style={{ paddingBottom: isNative ? 'max(env(safe-area-inset-bottom), 8px)' : '8px' }}
    >
      <div className="bg-background/85 backdrop-blur-3xl border border-white/8 shadow-[0_-1px_0_0_rgba(0,0,0,0.05),0_8px_32px_rgba(0,0,0,0.18)] rounded-[28px] overflow-hidden">
        <div className="flex items-center justify-around px-1 h-[62px]">
          {allItems.map((item) => {
            const isActive = location.pathname === item.path;

            if (item.primary) {
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => tap()}
                  className="flex flex-col items-center justify-center relative -top-3"
                >
                  <motion.div
                    whileTap={{ scale: 0.88 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="w-[54px] h-[54px] bg-gradient-to-br from-[#FF4F5A] to-[#e8333f] rounded-[18px] shadow-lg shadow-[#FF4F5A]/40 flex items-center justify-center"
                  >
                    <item.icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </motion.div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-[#FF4F5A] mt-0.5">
                    {item.label}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => tap()}
                className="flex flex-col items-center justify-center gap-[3px] flex-1 h-full relative transition-colors"
              >
                <div className="relative flex items-center justify-center">
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 w-10 h-8 -mx-1 bg-[#FF4F5A]/10 rounded-2xl"
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.6 }}
                        transition={{ type: "spring", stiffness: 350, damping: 28 }}
                      />
                    )}
                  </AnimatePresence>
                  <motion.div
                    whileTap={{ scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    <item.icon
                      className={`w-[22px] h-[22px] transition-all duration-200 relative z-10 ${
                        isActive
                          ? "text-[#FF4F5A]"
                          : "text-foreground/45"
                      }`}
                      strokeWidth={isActive ? 2.5 : 1.8}
                    />
                  </motion.div>
                </div>
                <span
                  className={`text-[10px] font-bold tracking-tight transition-colors duration-200 ${
                    isActive ? "text-[#FF4F5A]" : "text-foreground/40"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
