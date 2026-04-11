import { Link, useNavigate } from "react-router";
import { KarillyLogo } from "../brand/karilly-logo";
import { ChevronDown, User, Heart, Menu, LogOut, X, Bell, Trash2, Home, Car, Laptop, Wrench, Armchair, Camera, Dumbbell, PartyPopper } from "lucide-react";
import { Button } from "../ui/button";
import { motion, AnimatePresence } from "motion/react";
import { useAuthStore } from "../../store/auth.store";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "../../context/theme-context";
import { ThemeToggle } from "./theme-toggle";
import { useNotifications } from "../../hooks/useNotifications";

const CATEGORIES = [
  { icon: Home, label: "Immobilier", slug: "immobilier" },
  { icon: Car, label: "Véhicules", slug: "vehicules" },
  { icon: Laptop, label: "Électronique", slug: "electronique" },
  { icon: Wrench, label: "Outillage", slug: "outillage" },
  { icon: Armchair, label: "Mobilier", slug: "mobilier" },
  { icon: Camera, label: "Photo & Vidéo", slug: "photo-video" },
  { icon: Dumbbell, label: "Sport", slug: "sport" },
  { icon: PartyPopper, label: "Événementiel", slug: "evenementiel" },
];

export function Navigation({ variant = "default" }: { variant?: "default" | "transparent" }) {
  const navigate = useNavigate();
  const { isAuthenticated, user, signOut } = useAuthStore();
  const { isDark } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  
  const isTransparent = false;

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (categoriesRef.current && !categoriesRef.current.contains(e.target as Node)) {
        setShowCategories(false);
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

  const logoVariant = isDark ? "white" : "default";

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-md transition-all duration-300 dark:shadow-none"
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

          {/* Desktop Navigation - Hidden on Mobile */}
          <div className="hidden lg:flex items-center gap-8">
            <button
              onClick={() => navigate('/explore')}
              className={`text-[15px] font-medium transition-all hover:scale-105 ${isTransparent
                ? "text-white/90 hover:text-white"
                : "text-[#0F2A2E] hover:text-[#FF4F5A]"
                }`}
            >
              Explorer
            </button>
            <div className="relative" ref={categoriesRef}>
              <button
                onClick={() => setShowCategories(!showCategories)}
                className={`flex items-center gap-1 text-[15px] font-medium transition-all hover:scale-105 ${isTransparent
                  ? "text-white/90 hover:text-white"
                  : "text-[#0F2A2E] hover:text-[#FF4F5A]"
                  }`}
              >
                Catégories
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showCategories ? "rotate-180" : ""}`} />
              </button>
              
              {/* Categories Dropdown */}
              <AnimatePresence>
                {showCategories && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-1/2 -translate-x-1/2 top-12 w-[320px] bg-card rounded-2xl shadow-xl border border-border overflow-hidden"
                  >
                    <div className="p-2">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat.slug}
                          onClick={() => {
                            navigate(`/explore?category=${cat.slug}`);
                            setShowCategories(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors"
                        >
                          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                            <cat.icon className="w-4.5 h-4.5 text-[#FF4F5A]" />
                          </div>
                          {cat.label}
                        </button>
                      ))}
                    </div>
                    <div className="border-t border-border p-2">
                      <button
                        onClick={() => {
                          navigate('/explore');
                          setShowCategories(false);
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-[#FF4F5A] hover:bg-[#FF4F5A]/5 transition-colors"
                      >
                        Voir toutes les catégories
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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

                {/* Notifications Bell */}
                <div className="relative" ref={notifMenuRef}>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors relative ${isTransparent
                      ? "hover:bg-white/10"
                      : "hover:bg-muted"
                      }`}
                  >
                    <Bell className={`w-5 h-5 ${isTransparent ? "text-white" : "text-foreground"}`} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-[#FF4F5A] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-background">
                        {unreadCount}
                      </span>
                    )}
                  </motion.button>

                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-80 bg-card rounded-2xl shadow-xl border border-border overflow-hidden z-50 shadow-2xl"
                      >
                        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20">
                          <h3 className="font-bold text-sm text-foreground">Notifications</h3>
                          {unreadCount > 0 && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); markAllAsRead(); }}
                              className="text-xs text-[#FF4F5A] font-semibold hover:underline"
                            >
                              Tout lire
                            </button>
                          )}
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="p-10 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
                              <Bell className="w-8 h-8 opacity-20" />
                              Aucune notification
                            </div>
                          ) : (
                            notifications.map(notif => (
                              <div 
                                key={notif.id} 
                                onClick={() => { if(!notif.is_read) markAsRead(notif.id); navigate(notif.link || '/dashboard'); setShowNotifications(false); }}
                                className={`p-4 border-b border-border hover:bg-muted/50 transition-colors relative group cursor-pointer ${!notif.is_read ? 'bg-[#FF4F5A]/5' : ''}`}
                              >
                                <div className="pr-6">
                                  <p className="font-bold text-xs mb-1 text-foreground">{notif.title}</p>
                                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{notif.content}</p>
                                  <p className="text-[10px] text-muted-foreground mt-2">{new Date(notif.created_at).toLocaleDateString()}</p>
                                </div>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                                  className="absolute top-3 right-3 p-1 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                                {!notif.is_read && (
                                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF4F5A]" />
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

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
                            className="w-full px-4 py-2.5 text-left text-sm text-red-500 hover:bg-red-500/10 flex items-center gap-3 transition-colors"
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
                  className={`hidden lg:flex h-10 px-5 rounded-full font-medium transition-colors ${
                    isTransparent ? "text-white hover:bg-white/10" : "text-[#0F2A2E] hover:bg-[#0F2A2E]/5"
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
              
              {/* Mobile Categories */}
              <div className="border-b border-border pb-3">
                <p className="text-sm font-semibold text-muted-foreground mb-2">Catégories</p>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.slug}
                      onClick={() => { navigate(`/explore?category=${cat.slug}`); setShowMobileMenu(false); }}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      <cat.icon className="w-4 h-4 text-[#FF4F5A]" />
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {isAuthenticated ? (
                <>
                  <button onClick={() => { navigate('/dashboard'); setShowMobileMenu(false); }} className="block w-full text-left py-2 text-foreground font-medium">Mon profil</button>
                  <button onClick={() => { navigate('/lender'); setShowMobileMenu(false); }} className="block w-full text-left py-2 text-foreground font-medium">Publier une annonce</button>
                  <button onClick={() => { handleSignOut(); setShowMobileMenu(false); }} className="block w-full text-left py-2 text-red-500 font-medium">Déconnexion</button>
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