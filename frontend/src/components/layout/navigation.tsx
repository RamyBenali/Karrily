import { Link, useNavigate } from "react-router";
import { KarillyLogo } from "../brand/karilly-logo";
import { ChevronDown, User, Heart, Menu, LogOut, X } from "lucide-react";
import { Button } from "../ui/button";
import { motion, AnimatePresence } from "motion/react";
import { useAuthStore } from "../../store/auth.store";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "../../context/theme-context";
import { ThemeToggle } from "./theme-toggle";

export function Navigation({ variant = "default" }: { variant?: "default" | "transparent" }) {
  const navigate = useNavigate();
  const { isAuthenticated, user, signOut } = useAuthStore();
  const { isDark } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isTransparent = variant === "transparent";

  // Close user menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
    navigate("/");
  };

  const userInitials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
    : "U";

  const logoVariant = isTransparent ? "white" : isDark ? "white" : "default";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-200 ${isTransparent
        ? "bg-transparent"
        : "bg-background/90 backdrop-blur-xl border-b border-border shadow-sm"
        }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <KarillyLogo className="h-8 transition-all" variant={logoVariant} />
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <button
              onClick={() => navigate('/explore')}
              className={`text-[15px] font-medium transition-all hover:scale-105 ${isTransparent
                ? "text-white/90 hover:text-white"
                : "text-foreground/85 hover:text-foreground"
                }`}
            >
              Explorer
            </button>
            <div className="relative group">
              <button className={`flex items-center gap-1 text-[15px] font-medium transition-all hover:scale-105 ${isTransparent
                ? "text-white/90 hover:text-white"
                : "text-foreground/85 hover:text-foreground"
                }`}>
                Catégories
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            <button className={`text-[15px] font-medium transition-all hover:scale-105 ${isTransparent
              ? "text-white/90 hover:text-white"
              : "text-foreground/85 hover:text-foreground"
              }`}>
              Comment ça marche
            </button>
            {isAuthenticated && (
              <button
                onClick={() => navigate('/create')}
                className={`text-[15px] font-medium transition-all hover:scale-105 ${isTransparent
                  ? "text-white/90 hover:text-white"
                  : "text-foreground/85 hover:text-foreground"
                  }`}
              >
                Publier une annonce
              </button>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:block">
              <ThemeToggle transparent={isTransparent} />
            </div>

            {isAuthenticated ? (
              <>
                {/* Favorites */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => navigate('/dashboard')}
                  className={`hidden lg:flex items-center justify-center w-10 h-10 rounded-full transition-colors ${isTransparent
                    ? "hover:bg-white/10"
                    : "hover:bg-muted"
                    }`}
                >
                  <Heart className={`w-5 h-5 ${isTransparent ? "text-white" : "text-foreground"}`} />
                </motion.button>

                {/* User Avatar / Menu */}
                <div className="relative" ref={userMenuRef}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-border hover:shadow-md transition-all bg-card"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-[#0F2A2E] to-[#1A4851] rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {userInitials}
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </motion.button>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-14 w-64 bg-card rounded-2xl shadow-xl border border-border overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-border">
                          <p className="font-semibold text-foreground text-sm">
                            {user?.user_metadata?.full_name || "Utilisateur"}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                        </div>
                        <div className="py-2">
                          <button
                            onClick={() => { navigate('/dashboard'); setShowUserMenu(false); }}
                            className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-muted flex items-center gap-3 transition-colors"
                          >
                            <User className="w-4 h-4" /> Mon profil
                          </button>
                          <button
                            onClick={() => { navigate('/dashboard'); setShowUserMenu(false); }}
                            className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-muted flex items-center gap-3 transition-colors"
                          >
                            <Heart className="w-4 h-4" /> Mes favoris
                          </button>
                        </div>
                        <div className="border-t border-border py-2">
                          <button
                            onClick={handleSignOut}
                            className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                          >
                            <LogOut className="w-4 h-4" /> Déconnexion
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Button
                  onClick={() => navigate('/login')}
                  variant="ghost"
                  className={`hidden lg:flex h-10 px-5 rounded-full font-medium ${isTransparent ? "text-white hover:bg-white/10" : "text-foreground hover:bg-muted"
                    }`}
                >
                  Connexion
                </Button>
                <Button
                  onClick={() => navigate('/signup')}
                  className="hidden lg:flex bg-[#FF4F5A] hover:bg-[#FF4F5A]/90 text-white px-6 h-10 rounded-full shadow-lg shadow-[#FF4F5A]/25 hover:shadow-xl hover:shadow-[#FF4F5A]/40 transition-all hover:scale-105"
                >
                  S'inscrire
                </Button>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className={`lg:hidden flex items-center justify-center w-10 h-10 ${isTransparent ? "text-white" : "text-foreground"
                }`}
            >
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-card border-t border-border shadow-lg"
          >
            <div className="px-6 py-4 space-y-3">
              <div className="flex items-center justify-between border-b border-border py-2 mb-2">
                <span className="text-sm font-semibold text-muted-foreground">Thème</span>
                <ThemeToggle transparent={false} />
              </div>
              <button onClick={() => { navigate('/explore'); setShowMobileMenu(false); }} className="block w-full text-left py-2 text-foreground font-medium">Explorer</button>
              <button onClick={() => { navigate('/category/all'); setShowMobileMenu(false); }} className="block w-full text-left py-2 text-foreground font-medium">Catégories</button>
              {isAuthenticated ? (
                <>
                  <button onClick={() => { navigate('/dashboard'); setShowMobileMenu(false); }} className="block w-full text-left py-2 text-foreground font-medium">Mon profil</button>
                  <button onClick={() => { navigate('/lender'); setShowMobileMenu(false); }} className="block w-full text-left py-2 text-foreground font-medium">Publier une annonce</button>
                  <button onClick={() => { handleSignOut(); setShowMobileMenu(false); }} className="block w-full text-left py-2 text-red-600 font-medium">Déconnexion</button>
                </>
              ) : (
                <div className="flex gap-3 pt-2">
                  <Button onClick={() => { navigate('/login'); setShowMobileMenu(false); }} variant="outline" className="flex-1 rounded-full">Connexion</Button>
                  <Button onClick={() => { navigate('/signup'); setShowMobileMenu(false); }} className="flex-1 bg-[#FF4F5A] hover:bg-[#FF4F5A]/90 text-white rounded-full">S'inscrire</Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}