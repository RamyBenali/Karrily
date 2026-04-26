import { Home, Compass, PlusSquare, LayoutDashboard, User } from "lucide-react";
import { Link, useLocation } from "react-router";
import { motion } from "motion/react";
import { useAuthStore } from "../../store/auth.store";

export function BottomNav() {
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();

  const navItems = [
    { icon: Home, label: "Accueil", path: "/" },
    { icon: Compass, label: "Explorer", path: "/explore" },
    { icon: PlusSquare, label: "Publier", path: "/create", primary: true },
    { icon: LayoutDashboard, label: "Activités", path: "/dashboard", auth: true },
    { icon: User, label: "Profil", path: "/dashboard", auth: true },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-6 pb-6">
      <div className="bg-background/80 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-[32px] overflow-hidden h-20 flex items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const show = item.auth ? isAuthenticated : true;

          if (!show) return null;

          if (item.primary) {
            return (
              <Link key={item.path} to={item.path} className="relative -top-4">
                <div className="w-14 h-14 bg-[#FF4F5A] rounded-2xl shadow-lg shadow-[#FF4F5A]/40 flex items-center justify-center text-white transition-transform active:scale-95">
                  <item.icon className="w-7 h-7" />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-1 transition-all px-4 h-full relative ${
                isActive ? "text-[#FF4F5A]" : "text-muted-foreground"
              }`}
            >
              <item.icon className={`w-6 h-6 transition-transform ${isActive ? "scale-110" : ""}`} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute -bottom-1 w-1.5 h-1.5 bg-[#FF4F5A] rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
      {/* Notched background for extra safe area feel */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </div>
  );
}
