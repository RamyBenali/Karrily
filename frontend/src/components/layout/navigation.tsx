import { Link, useNavigate } from "react-router";
import { KarillyLogo } from "../brand/karilly-logo";
import { ChevronDown, User, Heart, Menu, LogOut, X, Bell, Trash2, Home, Car, Laptop, Wrench, Armchair, Camera, Dumbbell, PartyPopper, LayoutGrid, Shield, Package } from "lucide-react";
import { Button } from "../ui/button";
import { motion, AnimatePresence } from "motion/react";
import { useAuthStore } from "../../store/auth.store";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "../../context/theme-context";
import { ThemeToggle } from "./theme-toggle";
import { useNotifications } from "../../hooks/useNotifications";
import { supabase } from "../../lib/supabase";
import { cn } from "../ui/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

export function Navigation() {
  const navigate = useNavigate();
  const { isAuthenticated, user, signOut, role, hasItems, getDashboardPath } = useAuthStore();
  const { isDark } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from("categories")
        .select("id, name, slug")
        .is("parent_id", null)
        .eq("is_active", true)
        .order("sort_order");
      if (data) setCategories(data);
    };
    fetchCategories();
  }, []);

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

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'immobilier': return Home;
      case 'vehicules': return Car;
      case 'electronique': return Laptop;
      case 'outillage': return Wrench;
      case 'mobilier': return Armchair;
      case 'photo-video': return Camera;
      case 'sport': return Dumbbell;
      case 'evenementiel': return PartyPopper;
      default: return LayoutGrid;
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40 transition-all duration-300">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Main Nav */}
          <div className="flex items-center gap-12">
            <Link to="/" className="flex items-center gap-3 active:scale-95 transition-transform">
              <KarillyLogo className="h-8" variant={isDark ? "white" : "default"} />
            </Link>

            <div className="hidden lg:flex items-center gap-8">
              <button
                onClick={() => navigate('/explore')}
                className="text-sm font-bold text-foreground/70 hover:text-[#FF4F5A] transition-colors"
              >
                Explorer
              </button>

              <div className="relative" ref={categoriesRef}>
                <button
                  onClick={() => setShowCategories(!showCategories)}
                  className="flex items-center gap-1 text-sm font-bold text-foreground/70 hover:text-[#FF4F5A] transition-colors group"
                >
                  Catégories
                  <ChevronDown className={cn("w-4 h-4 transition-transform", showCategories && "rotate-180")} />
                </button>
                
                <AnimatePresence>
                  {showCategories && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute left-0 top-12 w-[300px] bg-card rounded-[2rem] shadow-2xl border border-border/50 overflow-hidden max-h-[70vh] flex flex-col"
                    >
                      <div className="p-3 overflow-y-auto custom-scrollbar grid grid-cols-1 gap-1">
                        {categories.map((cat) => {
                          const Icon = getCategoryIcon(cat.slug);
                          return (
                            <button
                              key={cat.id}
                              onClick={() => {
                                navigate(`/explore?category=${cat.slug}`);
                                setShowCategories(false);
                              }}
                              className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-muted transition-all text-sm font-bold group"
                            >
                              <div className="w-10 h-10 rounded-xl bg-muted group-hover:bg-background flex items-center justify-center transition-colors">
                                <Icon className="w-5 h-5 text-[#FF4F5A]" />
                              </div>
                              {cat.name}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button 
                onClick={() => {
                  const el = document.getElementById('how-it-works');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                  else navigate('/#how-it-works');
                }}
                className="text-sm font-bold text-foreground/70 hover:text-[#FF4F5A] transition-colors"
              >
                Comment ça marche
              </button>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {role !== 'admin' && hasItems && (
                  <button onClick={() => navigate('/lender')} className="hidden lg:flex items-center gap-2 text-sm font-bold text-foreground hover:text-[#FF4F5A] transition-colors bg-card border border-border px-4 h-10 rounded-2xl shadow-sm">
                    <Package className="w-4 h-4" />
                    Propriétaire
                  </button>
                )}
                {role === 'admin' && (
                  <button onClick={() => navigate('/admin')} className="hidden lg:flex items-center gap-2 text-sm font-bold text-white bg-gradient-to-r from-[#FF4F5A] to-[#FF6B74] hover:shadow-[0_0_20px_rgba(255,79,90,0.4)] transition-all px-4 h-10 rounded-2xl shadow-sm">
                    <Shield className="w-4 h-4" />
                    Admin
                  </button>
                )}

                <button
                  onClick={() => navigate(getDashboardPath())}
                  className="w-10 h-10 rounded-2xl hover:bg-muted flex items-center justify-center text-foreground transition-all"
                >
                  <Heart className="w-5 h-5" />
                </button>

                <div className="relative" ref={notifMenuRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="w-10 h-10 rounded-2xl hover:bg-muted flex items-center justify-center text-foreground relative transition-all"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-2 right-2 w-2 h-2 bg-[#FF4F5A] rounded-full border border-background" />
                    )}
                  </button>

                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-4 w-[360px] bg-card rounded-[2rem] shadow-2xl border border-border/50 overflow-hidden z-50"
                      >
                        <div className="p-6 border-b border-border/50 flex justify-between items-center">
                          <h3 className="font-black text-xs uppercase tracking-widest">Notifications</h3>
                          {unreadCount > 0 && (
                            <button onClick={markAllAsRead} className="text-[10px] font-black uppercase text-[#FF4F5A]">Tout lire</button>
                          )}
                        </div>
                        <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                          {notifications.length === 0 ? (
                            <div className="py-20 text-center text-muted-foreground text-sm px-10">
                              Aucune notification pour le moment.
                            </div>
                          ) : (
                            notifications.map(notif => (
                              <div 
                                key={notif.id}
                                onClick={() => { markAsRead(notif.id); navigate(notif.link || getDashboardPath()); setShowNotifications(false); }}
                                className={cn(
                                  "p-5 border-b border-border/30 hover:bg-muted/50 cursor-pointer transition-all relative",
                                  !notif.is_read && "bg-[#FF4F5A]/5"
                                )}
                              >
                                <p className="font-bold text-sm mb-1">{notif.title}</p>
                                <p className="text-xs text-muted-foreground line-clamp-2">{notif.content}</p>
                                <p className="text-[10px] text-muted-foreground/50 mt-2 font-medium">Il y a 2 heures</p>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-3 p-1.5 rounded-2xl border border-border/50 hover:bg-muted transition-all"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#0F2A2E] text-white flex items-center justify-center text-[10px] font-black">
                      {userInitials}
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground sm:block hidden" />
                  </button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-14 w-60 bg-card rounded-[2rem] shadow-2xl border border-border/50 overflow-hidden p-2"
                      >
                        <div className="px-5 py-4 border-b border-border/50 mb-1">
                          <p className="font-black text-xs truncate">{user?.user_metadata?.full_name || "Utilisateur"}</p>
                          <p className="text-[10px] text-muted-foreground truncate font-medium mt-0.5">{user?.email}</p>
                        </div>
                        <button onClick={() => { navigate(getDashboardPath()); setShowUserMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted text-sm font-bold transition-all"><User className="w-4 h-4" /> Profil</button>
                        {(role === 'lender' || role === 'vendeur' || hasItems) && (
                          <button onClick={() => { navigate('/create'); setShowUserMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted text-sm font-bold transition-all text-[#FF4F5A]"><PlusCircle className="w-4 h-4" /> Publier</button>
                        )}
                        
                        {/* Mobile view roles */}
                        <div className="lg:hidden mt-1 mb-1 space-y-1">
                          {role !== 'admin' && hasItems && (
                            <button onClick={() => { navigate('/lender'); setShowUserMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted text-sm font-bold transition-all"><Package className="w-4 h-4" /> Propriétaire</button>
                          )}
                          {role === 'admin' && (
                            <button onClick={() => { navigate('/admin'); setShowUserMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-sm font-bold text-[#FF4F5A] transition-all"><Shield className="w-4 h-4" /> Admin</button>
                          )}
                        </div>

                        <div className="border-t border-border/50 mt-1 pt-1">
                           <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-sm font-bold text-red-500 transition-all"><LogOut className="w-4 h-4" /> Déconnexion</button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button onClick={() => navigate('/login')} variant="ghost" className="rounded-2xl font-bold h-11 px-6">Connexion</Button>
                <Button onClick={() => navigate('/signup')} className="bg-[#FF4F5A] hover:bg-[#FF4F5A]/90 text-white rounded-2xl font-bold h-11 px-6 shadow-lg shadow-[#FF4F5A]/20">S'inscrire</Button>
              </div>
            )}

            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden w-11 h-11 flex items-center justify-center rounded-2xl hover:bg-muted transition-all"
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
            className="lg:hidden bg-card border-t border-border/50 overflow-hidden"
          >
            <div className="p-6 space-y-8">
               <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">Navigation</p>
                  <button onClick={() => { navigate('/explore'); setShowMobileMenu(false); }} className="block w-full text-left p-3 rounded-2xl font-bold hover:bg-muted">Explorer</button>
               </div>
               <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">Catégories</p>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map(cat => (
                      <button 
                        key={cat.id} 
                        onClick={() => { navigate(`/explore?category=${cat.slug}`); setShowMobileMenu(false); }}
                        className="flex items-center gap-2 p-3 rounded-2xl bg-muted/50 font-bold text-xs"
                      >
                         <LayoutGrid className="w-3.5 h-3.5 text-[#FF4F5A]" />
                         {cat.name}
                      </button>
                    ))}
                  </div>
               </div>
               {!isAuthenticated && (
                  <div className="flex gap-4 pt-4 border-t border-border/50">
                    <Button onClick={() => { navigate('/login'); setShowMobileMenu(false); }} variant="outline" className="flex-1 rounded-2xl h-14 font-bold">Connexion</Button>
                    <Button onClick={() => { navigate('/signup'); setShowMobileMenu(false); }} className="flex-1 bg-[#FF4F5A] text-white rounded-2xl h-14 font-bold">S'inscrire</Button>
                  </div>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function PlusCircle({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
  );
}