import { Link, useNavigate } from "react-router";
import { KarillyLogo } from "../brand/karilly-logo";
import { ChevronDown, User, Heart, Menu, LogOut, X, Bell, Trash2, Home, Car, Laptop, Wrench, Armchair, Camera, Dumbbell, PartyPopper, LayoutGrid, Shield, Package, CalendarCheck, ShoppingBag, RefreshCw, MessageCircle, Settings2, AlertCircle, Globe } from "lucide-react";
import { Button } from "../ui/button";
import { motion, AnimatePresence } from "motion/react";
import { useAuthStore } from "../../store/auth.store";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "../../context/theme-context";
import { useTranslation } from "../../context/language-context";
import { LOCALE_META, type Locale } from "../../context/language-context";
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
  const { t, locale, setLocale } = useTranslation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  
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
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setShowLangMenu(false);
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

  const getRelativeTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return t("nav.justNow");
    if (mins < 60) return t("nav.minutesAgo", { n: mins });
    if (hours < 24) return t("nav.hoursAgo", { n: hours });
    return t("nav.daysAgo", { n: days });
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
                {t("nav.explore")}
              </button>

              <div className="relative" ref={categoriesRef}>
                <button
                  onClick={() => setShowCategories(!showCategories)}
                  className="flex items-center gap-1 text-sm font-bold text-foreground/70 hover:text-[#FF4F5A] transition-colors group"
                >
                  {t("nav.categories")}
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
                              {t(`categories.${cat.slug}`)}
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
                {t("nav.howItWorks")}
              </button>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="relative" ref={langMenuRef}>
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="w-10 h-10 rounded-2xl hover:bg-muted flex items-center justify-center text-foreground transition-all"
                title="Language"
              >
                <Globe className="w-5 h-5" />
              </button>

              <AnimatePresence>
                {showLangMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-14 w-44 bg-card rounded-2xl shadow-2xl border border-border/50 overflow-hidden p-1.5 z-50"
                  >
                    {(Object.keys(LOCALE_META) as Locale[]).map((loc) => {
                      const meta = LOCALE_META[loc];
                      return (
                        <button
                          key={loc}
                          onClick={() => {
                            setLocale(loc);
                            setShowLangMenu(false);
                          }}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all",
                            locale === loc
                              ? "bg-[#FF4F5A]/10 text-[#FF4F5A]"
                              : "hover:bg-muted text-foreground"
                          )}
                        >
                          <span className="text-lg">{meta.flag}</span>
                          <span>{meta.label}</span>
                          {locale === loc && (
                            <span className="ms-auto w-2 h-2 rounded-full bg-[#FF4F5A]" />
                          )}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {role !== 'admin' && hasItems && (
                  <button onClick={() => navigate('/lender')} className="hidden lg:flex items-center gap-2 text-sm font-bold text-foreground hover:text-[#FF4F5A] transition-colors bg-card border border-border px-4 h-10 rounded-2xl shadow-sm">
                    <Package className="w-4 h-4" />
                    {t("nav.owner")}
                  </button>
                )}
                {role === 'admin' && (
                  <button onClick={() => navigate('/admin')} className="hidden lg:flex items-center gap-2 text-sm font-bold text-white bg-gradient-to-r from-[#FF4F5A] to-[#FF6B74] hover:shadow-[0_0_20px_rgba(255,79,90,0.4)] transition-all px-4 h-10 rounded-2xl shadow-sm">
                    <Shield className="w-4 h-4" />
                    {t("nav.admin")}
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
                        className="absolute right-0 mt-4 w-[380px] bg-card rounded-[2rem] shadow-2xl border border-border/50 overflow-hidden z-50"
                      >
                        <div className="p-6 border-b border-border/50 flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <h3 className="font-black text-xs uppercase tracking-widest">{t("nav.notifications")}</h3>
                            {unreadCount > 0 && (
                              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#FF4F5A] text-white text-[9px] font-black">{unreadCount}</span>
                            )}
                          </div>
                          {unreadCount > 0 && (
                            <button onClick={markAllAsRead} className="text-[10px] font-black uppercase text-[#FF4F5A] hover:opacity-70 transition-opacity">{t("nav.readAll")}</button>
                          )}
                        </div>
                        <div className="max-h-[440px] overflow-y-auto no-scrollbar divide-y divide-border/30">
                          {notifications.length === 0 ? (
                            <div className="py-16 text-center px-10 flex flex-col items-center gap-3">
                              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
                                <Bell className="w-5 h-5 text-muted-foreground" />
                              </div>
                              <p className="text-sm font-bold text-muted-foreground">{t("nav.noNotifications")}</p>
                              <p className="text-xs text-muted-foreground/60">{t("nav.notificationsAppearHere")}</p>
                            </div>
                          ) : (
                            notifications.map(notif => {
                              const getNotifIcon = () => {
                                switch (notif.type) {
                                  case 'booking':
                                  case 'booking_request':
                                  case 'booking_confirmed':
                                  case 'booking_cancelled':
                                    return { Icon: CalendarCheck, bg: 'bg-blue-500/10', color: 'text-blue-500' };
                                  case 'sale':
                                    return { Icon: ShoppingBag, bg: 'bg-emerald-500/10', color: 'text-emerald-500' };
                                  case 'troc':
                                  case 'troc_proposal':
                                  case 'troc_accepted':
                                  case 'troc_rejected':
                                    return { Icon: RefreshCw, bg: 'bg-purple-500/10', color: 'text-purple-500' };
                                  case 'message':
                                    return { Icon: MessageCircle, bg: 'bg-sky-500/10', color: 'text-sky-500' };
                                  case 'system':
                                    return { Icon: Settings2, bg: 'bg-orange-500/10', color: 'text-orange-500' };
                                  default:
                                    return { Icon: AlertCircle, bg: 'bg-[#FF4F5A]/10', color: 'text-[#FF4F5A]' };
                                }
                              };
                              const { Icon, bg, color } = getNotifIcon();

                              return (
                                <div
                                  key={notif.id}
                                  className={cn(
                                    "flex gap-3 p-4 hover:bg-muted/40 transition-all group cursor-pointer relative",
                                    !notif.is_read && "bg-[#FF4F5A]/5"
                                  )}
                                  onClick={() => {
                                    markAsRead(notif.id);
                                    setShowNotifications(false);
                                    
                                    if (notif.link) {
                                      // Parse the link to extract path and query params
                                      const url = new URL(notif.link, window.location.origin);
                                      const tab = url.searchParams.get('tab');
                                      const highlightId = url.searchParams.get('id') || notif.metadata?.id || notif.related_id;
                                      if (tab) {
                                        navigate(url.pathname, { state: { tab, highlightId } });
                                      } else {
                                        navigate(notif.link, { state: { highlightId } });
                                      }
                                    } else if (notif.type === 'message') {
                                      // Messages go to the current dashboard's messages tab
                                      const dashPath = getDashboardPath();
                                      navigate(dashPath, { state: { tab: 'messages', convId: notif.related_id } });
                                    } else {
                                      // Fallback for older notifications without link field
                                      const highlightId = notif.related_id || notif.metadata?.id;
                                      // Use role-aware routing
                                      if (notif.type?.startsWith('booking')) {
                                        if (role === 'admin') {
                                          navigate('/admin', { state: { tab: 'overview', highlightId } });
                                        } else if (role === 'lender' || role === 'vendeur' || hasItems) {
                                          navigate('/lender', { state: { tab: 'bookings', highlightId } });
                                        } else {
                                          navigate('/dashboard', { state: { tab: 'bookings', highlightId } });
                                        }
                                      } else if (notif.type === 'sale') {
                                        if (role === 'admin') {
                                          navigate('/admin', { state: { tab: 'overview', highlightId } });
                                        } else if (role === 'lender' || role === 'vendeur' || hasItems) {
                                          navigate('/lender', { state: { tab: 'sales', highlightId } });
                                        } else {
                                          navigate('/dashboard', { state: { tab: 'purchases', highlightId } });
                                        }
                                      } else if (notif.type?.startsWith('troc')) {
                                        if (role === 'admin') {
                                          navigate('/admin', { state: { tab: 'overview', highlightId } });
                                        } else if (role === 'lender' || role === 'vendeur' || hasItems) {
                                          navigate('/lender', { state: { tab: 'troc', highlightId } });
                                        } else {
                                          navigate('/dashboard', { state: { tab: 'trades', highlightId } });
                                        }
                                      } else {
                                        navigate(getDashboardPath(), { state: { highlightId } });
                                      }
                                    }
                                  }}
                                >
                                  {!notif.is_read && (
                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#FF4F5A]" />
                                  )}
                                  <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                    <Icon className={`w-5 h-5 ${color}`} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm mb-0.5 leading-snug">{notif.title}</p>
                                    <p className="text-xs text-muted-foreground line-clamp-2">{notif.body}</p>
                                    <p className="text-[10px] text-muted-foreground/50 mt-1.5 font-medium">{getRelativeTime(notif.created_at)}</p>
                                  </div>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-xl hover:bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-0.5"
                                  >
                                    <X className="w-3.5 h-3.5 text-muted-foreground hover:text-red-500" />
                                  </button>
                                </div>
                              );
                            })
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
                          <p className="font-black text-xs truncate">{user?.user_metadata?.full_name || t("common.user")}</p>
                          <p className="text-[10px] text-muted-foreground truncate font-medium mt-0.5">{user?.email}</p>
                        </div>
                        <button onClick={() => { navigate(getDashboardPath()); setShowUserMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted text-sm font-bold transition-all"><User className="w-4 h-4" /> {t("nav.profile")}</button>
                        {(role === 'lender' || role === 'vendeur' || hasItems) && (
                          <button onClick={() => { navigate('/create'); setShowUserMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted text-sm font-bold transition-all text-[#FF4F5A]"><PlusCircle className="w-4 h-4" /> {t("nav.publish")}</button>
                        )}
                        
                        {/* Mobile view roles */}
                        <div className="lg:hidden mt-1 mb-1 space-y-1">
                          {role !== 'admin' && hasItems && (
                            <button onClick={() => { navigate('/lender'); setShowUserMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted text-sm font-bold transition-all"><Package className="w-4 h-4" /> {t("nav.owner")}</button>
                          )}
                          {role === 'admin' && (
                            <button onClick={() => { navigate('/admin'); setShowUserMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-sm font-bold text-[#FF4F5A] transition-all"><Shield className="w-4 h-4" /> {t("nav.admin")}</button>
                          )}
                        </div>

                        <div className="border-t border-border/50 mt-1 pt-1">
                           <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-sm font-bold text-red-500 transition-all"><LogOut className="w-4 h-4" /> {t("nav.logout")}</button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button onClick={() => navigate('/login')} variant="ghost" className="rounded-2xl font-bold h-11 px-6">{t("nav.login")}</Button>
                <Button onClick={() => navigate('/signup')} className="bg-[#FF4F5A] hover:bg-[#FF4F5A]/90 text-white rounded-2xl font-bold h-11 px-6 shadow-lg shadow-[#FF4F5A]/20">{t("nav.signup")}</Button>
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
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">{t("nav.navigation")}</p>
                 <button onClick={() => { navigate('/explore'); setShowMobileMenu(false); }} className="block w-full text-left p-3 rounded-2xl font-bold hover:bg-muted">{t("nav.explore")}</button>
               </div>
               <div className="space-y-4">
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">{t("nav.categories")}</p>
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
                   <Button onClick={() => { navigate('/login'); setShowMobileMenu(false); }} variant="outline" className="flex-1 rounded-2xl h-14 font-bold">{t("nav.login")}</Button>
                   <Button onClick={() => { navigate('/signup'); setShowMobileMenu(false); }} className="flex-1 bg-[#FF4F5A] text-white rounded-2xl h-14 font-bold">{t("nav.signup")}</Button>
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