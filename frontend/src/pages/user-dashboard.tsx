import { Navigation } from "../components/layout/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Package, Heart, MessageSquare, Settings, Calendar, MapPin, Star, Clock, ChevronRight, Camera, Loader2, Check, User as UserIcon, DollarSign, Menu, X, BarChart3, XCircle, CheckCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useNavigate, useLocation } from "react-router";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useState, useEffect } from "react";
import { useAuthStore } from "../store/auth.store";
import { supabase } from "../lib/supabase";
import { bookingsService, salesService, trocService, itemsService, usersService } from "../services/api.service";
import { api } from "../lib/api";
import { RealtimeChannel } from "@supabase/supabase-js";
import { ShoppingCart, RefreshCw, ShoppingBag, MessageCircle, Settings2, AlertCircle, CalendarCheck } from "lucide-react";
import { DashboardSidebar } from "../components/dashboard/dashboard-sidebar";
import { useTranslation } from "../context/language-context";
import { WILAYAS } from "../components/explore/explore-constants";

// Profile interface
interface Profile {
  full_name: string;
  email: string;
  phone: string;
  bio: string;
  location: string;
  wilaya_code: number | null;
  avatar_url: string;
}

interface Booking {
  id: string;
  item_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  price_per_day: number;
  deposit_amount: number;
  status: string;
  payment_status: string;
  message: string | null;
  owner_response: string | null;
  created_at: string;
  renter_id: string;
  owner_id: string;
  items?: { title: string; thumbnail_url: string | null; location: string; } | null;
}

interface Conversation {
  id: string;
  item_id: string | null;
  participant_1: string;
  participant_2: string;
  last_message_at: string;
  last_message_preview: string | null;
  items?: { title: string; thumbnail_url: string | null } | null;
  other_user?: { id: string; full_name: string; avatar_url: string | null };
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: 'booking' | 'booking_request' | 'booking_confirmed' | 'booking_cancelled' | 'sale' | 'troc' | 'troc_proposal' | 'troc_accepted' | 'troc_rejected' | 'message' | 'system';
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export function UserDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { user, role, hasItems } = useAuthStore();

  const BOOKING_STATUS: Record<string, { label: string; color: string }> = {
    pending: { label: t("bookingStatus.pending"), color: "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400" },
    confirmed: { label: t("bookingStatus.confirmed"), color: "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400" },
    active: { label: t("bookingStatus.active"), color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400" },
    completed: { label: t("bookingStatus.completed"), color: "bg-slate-50 text-slate-600 dark:bg-slate-950/30 dark:text-slate-400" },
    cancelled: { label: t("bookingStatus.cancelled"), color: "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400" },
    rejected: { label: t("bookingStatus.rejected"), color: "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400" },
  };



  const [activeTab, setActiveTab] = useState(() => {
    const tab = location.state?.tab?.toLowerCase();
    if (tab === 'messages') return 'messages';
    if (tab === 'bookings') return 'bookings';
    if (tab === 'favorites') return 'favorites';
    return tab || 'overview';
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (location.state?.tab) {
      const tab = location.state.tab.toLowerCase();
      if (tab === t("dashboard.overview").toLowerCase() || tab === 'overview') setActiveTab('overview');
      else if (tab === t("dashboard.messages").toLowerCase() || tab === 'messages') setActiveTab('messages');
      else if (tab === t("dashboard.activeBookings").toLowerCase() || tab === 'bookings') setActiveTab('bookings');
      else setActiveTab(tab);
    }
    if (location.state?.convId && (location.state?.tab?.toLowerCase() === "messages")) {
      setActiveConversationId(location.state.convId);
    }
  }, [location.state]);

  const [profile, setProfile] = useState<Profile>({
    full_name: "",
    email: "",
    phone: "",
    bio: "",
    location: "",
    wilaya_code: null,
    avatar_url: "",
  });
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [profileError, setProfileError] = useState("");

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [historyBookings, setHistoryBookings] = useState<Booking[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [mySales, setMySales] = useState<any[]>([]);
  const [myTroc, setMyTroc] = useState<any[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [bookingTab, setBookingTab] = useState<"renter" | "owner">("renter");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const sidebarItems = [
    { id: 'overview', icon: BarChart3, label: t("dashboard.overview") !== "dashboard.overview" ? t("dashboard.overview") : "Aperçu" },
    { id: 'bookings', icon: CalendarCheck, label: t("dashboard.activeBookings") !== "dashboard.activeBookings" ? t("dashboard.activeBookings") : "Mes Locations" },
    { id: 'purchases', icon: ShoppingBag, label: t("dashboard.myPurchases") !== "dashboard.myPurchases" ? t("dashboard.myPurchases") : "Mes Achats" },
    { id: 'trades', icon: RefreshCw, label: t("dashboard.myTrades") !== "dashboard.myTrades" ? t("dashboard.myTrades") : "Mes Trocs" },
    { id: 'favorites', icon: Heart, label: t("dashboard.favorites") !== "dashboard.favorites" ? t("dashboard.favorites") : "Favoris", badge: favorites.length },
    { id: 'messages', icon: MessageCircle, label: t("dashboard.messages") !== "dashboard.messages" ? t("dashboard.messages") : "Messages", badge: unreadCount },
    { id: 'history', icon: Clock, label: t("dashboard.history") !== "dashboard.history" ? t("dashboard.history") : "Historique" },
    { id: 'profile', icon: UserIcon, label: t("dashboard.myProfile") !== "dashboard.myProfile" ? t("dashboard.myProfile") : "Mon Profil" },
    { id: 'settings', icon: Settings2, label: t("dashboard.settings") !== "dashboard.settings" ? t("dashboard.settings") : "Paramètres" },
  ];

  useEffect(() => {
    let channel: RealtimeChannel;

    const fetchBookings = async () => {
      if (!user) return;
      setIsLoadingBookings(true);

      try {
        const { data } = await bookingsService.getMyBookings({ role: bookingTab });
        setBookings(data || []);

        channel = supabase
          .channel(`bookings:${user.id}`)
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "bookings", filter: `${bookingTab === 'renter' ? 'renter_id' : 'owner_id'}=eq.${user.id}` },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                fetchBookings();
              } else if (payload.eventType === 'UPDATE') {
                setBookings(prev => prev.map(b => b.id === payload.new.id ? { ...b, ...payload.new } : b));
              } else if (payload.eventType === 'DELETE') {
                setBookings(prev => prev.filter(b => b.id !== payload.old.id));
              }
            }
          )
          .subscribe();
      } catch (err) {
        console.error("Error fetching bookings:", err);
      } finally {
        setIsLoadingBookings(false);
      }
    };
    fetchBookings();

    const fetchSales = async () => {
      const res = await salesService.getMySales({ role: 'buyer' });
      setMySales(res.data || []);
    };

    const fetchTroc = async () => {
      const res = await trocService.getMyProposals({ role: 'proposer' });
      setMyTroc(res.data || []);
    };

    const fetchFavorites = async () => {
      if (!user) return;
      try {
        const res = await supabase.from("favorites").select("*, item:items(*)").eq("user_id", user.id).order("created_at", { ascending: false });
        setFavorites(res.data || []);
      } catch (err) { console.error(err); }
    };

    const fetchHistory = async () => {
      try {
        const res = await api.get('/bookings');
        setHistoryBookings((res.data.data || []).filter((b: any) => ["completed", "cancelled", "rejected"].includes(b.status)));
      } catch (err) { console.error(err); }
    }

    const fetchNotifications = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      setNotifications(data || []);

      const { count } = await supabase
        .from("notifications")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", user.id)
        .eq("is_read", false);
      setUnreadCount(count || 0);
    };

    fetchSales();
    fetchTroc();
    fetchFavorites();
    fetchHistory();
    fetchNotifications();

    if (user) {
      const notifChannel = supabase
        .channel(`user_notifs:${user.id}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, () => fetchNotifications())
        .subscribe();

      const salesChannel = supabase
        .channel(`user_sales:${user.id}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "sales", filter: `buyer_id=eq.${user.id}` }, () => fetchSales())
        .subscribe();

      const trocChannel = supabase
        .channel(`user_troc:${user.id}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "troc_proposals", filter: `proposer_id=eq.${user.id}` }, () => fetchTroc())
        .subscribe();

      return () => {
        if (channel) supabase.removeChannel(channel);
        supabase.removeChannel(salesChannel);
        supabase.removeChannel(trocChannel);
        supabase.removeChannel(notifChannel);
      };
    }
  }, [user?.id, bookingTab]);

  const handleBookingAction = async (bookingId: string, newStatus: string) => {
    try {
      await bookingsService.updateStatus(bookingId, newStatus);
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
    } catch (err) {
      alert(t("dashboard.updateError"));
    }
  };

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(location.state?.convId || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoadingMsgs, setIsLoadingMsgs] = useState(false);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user || activeTab !== 'messages') return;

      const { data } = await supabase
        .from("conversations")
        .select("*, items(title, thumbnail_url), p1:profiles!participant_1(id, full_name, avatar_url), p2:profiles!participant_2(id, full_name, avatar_url)")
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .order("last_message_at", { ascending: false });

      if (data) {
        const formatted = data.map(conv => {
          const isUserP1 = conv.participant_1 === user.id;
          return {
            ...conv,
            other_user: isUserP1 ? (conv as any).p2 : (conv as any).p1,
          };
        });
        setConversations(formatted as Conversation[]);
      }
    };
    fetchConversations();
  }, [user?.id, activeTab]);

  useEffect(() => {
    if (!user || !activeConversationId) return;

    let channel: RealtimeChannel;

    const fetchMessages = async () => {
      setIsLoadingMsgs(true);
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", activeConversationId)
        .order("created_at", { ascending: true });

      setMessages((data as Message[]) || []);
      setIsLoadingMsgs(false);

      channel = supabase
        .channel(`messages:${activeConversationId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${activeConversationId}` },
          (payload) => {
            const newMsg = payload.new as Message;
            setMessages((prev) => [...prev, newMsg]);

            setConversations(prev => {
              const convs = [...prev];
              const idx = convs.findIndex(c => c.id === activeConversationId);
              if (idx > -1) {
                convs[idx].last_message_preview = newMsg.content;
                convs[idx].last_message_at = newMsg.created_at;
                const [moved] = convs.splice(idx, 1);
                convs.unshift(moved);
              }
              return convs;
            });
          }
        )
        .subscribe();
    };

    fetchMessages();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [user?.id, activeConversationId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeConversationId || !newMessage.trim()) return;

    const content = newMessage.trim();
    setNewMessage("");

    await supabase
      .from("messages")
      .insert({
        conversation_id: activeConversationId,
        sender_id: user.id,
        content: content,
      });

    await supabase
      .from("conversations")
      .update({ last_message_preview: content, last_message_at: new Date().toISOString() })
      .eq("id", activeConversationId);
  };

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      setIsLoadingProfile(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile({
          full_name: data.full_name || "",
          email: data.email || user.email || "",
          phone: data.phone || "",
          bio: data.bio || "",
          location: data.location || "",
          wilaya_code: data.wilaya_code,
          avatar_url: data.avatar_url || "",
        });
      }
      setIsLoadingProfile(false);
    };
    fetchProfile();
  }, [user?.id]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    setProfileError("");
    setSaveSuccess(false);

    const wilaya = WILAYAS.find(w => w.code === profile.wilaya_code);

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        phone: profile.phone,
        bio: profile.bio,
        location: wilaya ? `${wilaya.name}, ${profile.wilaya_code}` : profile.location,
        wilaya_code: profile.wilaya_code,
      })
      .eq("id", user.id);

    if (!profileError) {
      await supabase.auth.updateUser({
        data: { full_name: profile.full_name }
      });
    }

    if (profileError) {
      setProfileError(t("dashboard.saveError"));
    } else {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
    setIsSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setProfileError(t("dashboard.avatarUploadError"));
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

    await supabase
      .from("profiles")
      .update({ avatar_url: data.publicUrl })
      .eq("id", user.id);

    setProfile(prev => ({ ...prev, avatar_url: data.publicUrl }));
  };

  const userInitials = profile.full_name
    ? profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="py-8 lg:py-12">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 lg:mb-12"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="h-px flex-1 max-w-[40px] bg-gradient-to-r from-[#FF4F5A] to-transparent" />
              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[#FF4F5A]">{t("dashboard.dashboard")}</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-foreground mb-3 leading-tight tracking-tight">
              {t("dashboard.mySpaceTitle1")} <span className="gradient-text">{t("dashboard.mySpaceTitle2")}</span>
            </h1>
            <p className="text-base text-muted-foreground max-w-xl">
              {t("dashboard.mySpaceSubtitle")}
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
            <DashboardSidebar
              items={sidebarItems}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              userInitials={userInitials}
              userFullName={profile.full_name}
              userEmail={profile.email}
              userAvatar={profile.avatar_url}
              isMobileMenuOpen={isMobileMenuOpen}
              setIsMobileMenuOpen={setIsMobileMenuOpen}
              extraAction={(role === 'lender' || role === 'vendeur' || hasItems) ? {
                label: t("landing.publishListing"),
                onClick: () => navigate('/create'),
                variant: "premium"
              } : undefined}
            />

            <div className="lg:col-span-9 min-h-[60vh]">
              {activeTab === 'overview' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="grid md:grid-cols-3 gap-5">
                    {[
                      { icon: Package, label: t("dashboard.activeBookingsCount") !== "dashboard.activeBookingsCount" ? t("dashboard.activeBookingsCount") : "Locations Actives", value: bookings.filter(b => ['active', 'confirmed'].includes(b.status)).length, sub: t("dashboard.inProgress") !== "dashboard.inProgress" ? t("dashboard.inProgress") : "En cours", color: "text-[#FF4F5A]", bg: "bg-[#FF4F5A]/10", tab: 'bookings' },
                      { icon: MessageSquare, label: t("dashboard.messages") !== "dashboard.messages" ? t("dashboard.messages") : "Messages", value: unreadCount, sub: t("dashboard.unread") !== "dashboard.unread" ? t("dashboard.unread") : "non lus", color: "text-blue-500", bg: "bg-blue-500/10", tab: 'messages' },
                      { icon: Heart, label: t("dashboard.favorites") !== "dashboard.favorites" ? t("dashboard.favorites") : "Favoris", value: favorites.length, sub: t("dashboard.pinned") !== "dashboard.pinned" ? t("dashboard.pinned") : "épinglés", color: "text-rose-400", bg: "bg-rose-400/10", tab: 'favorites' },
                    ].map((s, i) => (
                      <motion.div
                        key={s.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        onClick={() => setActiveTab(s.tab)}
                        className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group stat-card-hover"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <s.icon className={`w-5 h-5 ${s.color}`} />
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground/60 group-hover:translate-x-0.5 transition-all" />
                        </div>
                        <div className="text-3xl font-black text-foreground mb-1">{s.value}</div>
                        <div className="text-xs text-muted-foreground">{s.sub} · <span className="font-semibold">{s.label}</span></div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-7 py-5 border-b border-border/60">
                      <h2 className="text-lg font-bold">{(t("dashboard.recentActivity1") !== "dashboard.recentActivity1" ? t("dashboard.recentActivity1") : "Activités")} <span className="text-[#FF4F5A]">{(t("dashboard.recentActivity2") !== "dashboard.recentActivity2" ? t("dashboard.recentActivity2") : "Récentes")}</span></h2>
                      <Button variant="ghost" size="sm" className="text-xs font-semibold text-muted-foreground hover:text-foreground" onClick={() => setActiveTab('messages')}>{t("dashboard.seeAll") !== "dashboard.seeAll" ? t("dashboard.seeAll") : "Voir tout"} →</Button>
                    </div>
                    <div className="divide-y divide-border/50">
                      {notifications.length === 0 ? (
                        <div className="py-16 text-center">
                          <div className="w-14 h-14 bg-muted rounded-2xl mx-auto mb-4 flex items-center justify-center">
                            <Clock className="w-7 h-7 text-muted-foreground/30" />
                          </div>
                          <p className="text-sm text-muted-foreground font-medium">{t("dashboard.noRecentActivity")}</p>
                          <p className="text-xs text-muted-foreground/60 mt-1">{t("dashboard.notifsAppearHere")}</p>
                        </div>
                      ) : (
                        notifications.slice(0, 5).map((notif) => {
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
                            <div key={notif.id} className="flex gap-4 items-center px-7 py-4 hover:bg-muted/30 transition-colors group">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
                                <Icon className={`w-5 h-5 ${color}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-foreground line-clamp-1">{notif.title}</p>
                                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{notif.body || ''}</p>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="opacity-0 group-hover:opacity-100 transition-opacity rounded-xl h-8 px-3 text-xs font-semibold text-[#FF4F5A]"
                                onClick={() => {
                                  const dest = notif.link
                                    ? notif.link
                                    : (notif.type?.startsWith('booking') || notif.type?.startsWith('troc') || notif.type === 'sale' ? '/lender' : '/dashboard');
                                  navigate(dest);
                                }}
                              >
                                {t("dashboard.view")} →
                              </Button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'bookings' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex gap-1.5 p-1.5 bg-muted/60 rounded-xl w-fit">
                    {(["renter", "owner"] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => setBookingTab(tab)}
                        className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${bookingTab === tab
                          ? "bg-card text-foreground shadow-sm border border-border/60"
                          : "text-muted-foreground hover:text-foreground"
                          }`}
                      >
                        {tab === "renter" ? (t("dashboard.myBookings") !== "dashboard.myBookings" ? t("dashboard.myBookings") : "Mes Locations") : (t("dashboard.requestsReceived") !== "dashboard.requestsReceived" ? t("dashboard.requestsReceived") : "Demandes Reçues")}
                      </button>
                    ))}
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    {[
                      { label: t("dashboard.pending") !== "dashboard.pending" ? t("dashboard.pending") : "En attente", value: bookings.filter(b => b.status === "pending").length, icon: Clock, color: "#f59e0b", bg: "bg-amber-500/10" },
                      { label: t("dashboard.active") !== "dashboard.active" ? t("dashboard.active") : "En cours", value: bookings.filter(b => ["confirmed", "active"].includes(b.status)).length, icon: Package, color: "#FF4F5A", bg: "bg-[#FF4F5A]/10" },
                      { label: t("dashboard.completed") !== "dashboard.completed" ? t("dashboard.completed") : "Terminé", value: bookings.filter(b => ["completed", "cancelled", "rejected"].includes(b.status)).length, icon: Calendar, color: "#64748b", bg: "bg-slate-500/10" }
                    ].map((stat, index) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08 }}
                        className="bg-card rounded-2xl p-5 border border-border shadow-sm"
                      >
                        <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-4`}>
                          <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                        </div>
                        <div className="text-3xl font-black text-foreground mb-1">{stat.value}</div>
                        <div className="text-sm text-muted-foreground">{stat.label}</div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                    <div className="px-7 py-5 border-b border-border/60">
                      <h2 className="text-lg font-bold text-foreground">
                        {bookingTab === "renter" ? (t("dashboard.myBookings") !== "dashboard.myBookings" ? t("dashboard.myBookings") : "Mes Locations") : (t("dashboard.requestsReceived") !== "dashboard.requestsReceived" ? t("dashboard.requestsReceived") : "Demandes Reçues")}
                      </h2>
                    </div>
                    <div className="p-7">
                      {isLoadingBookings ? (
                        <div className="flex justify-center py-12">
                          <Loader2 className="w-7 h-7 animate-spin text-[#FF4F5A]" />
                        </div>
                      ) : bookings.length === 0 ? (
                        <div className="text-center py-16">
                          <div className="w-16 h-16 bg-muted rounded-2xl mx-auto mb-4 flex items-center justify-center">
                            <Calendar className="w-8 h-8 text-muted-foreground/30" />
                          </div>
                          <p className="text-sm font-semibold text-muted-foreground mb-1">{t("dashboard.noBookingsYet")}</p>
                          <p className="text-xs text-muted-foreground/60">{t("dashboard.requestsAppearHere")}</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {bookings.map((booking) => (
                            <div
                              key={booking.id}
                              className="flex flex-col md:flex-row gap-6 p-6 bg-muted/50 rounded-3xl hover:shadow-lg transition-all group"
                            >
                              <div
                                className="w-full md:w-48 h-32 rounded-2xl overflow-hidden flex-shrink-0 cursor-pointer"
                                onClick={() => navigate(`/item/${booking.item_id}`)}
                              >
                                <ImageWithFallback
                                  src={(booking.items as any)?.thumbnail_url || ""}
                                  alt={(booking.items as any)?.title || ""}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <h3
                                      className="text-xl font-bold text-foreground hover:text-[#FF4F5A] transition-colors cursor-pointer"
                                      onClick={() => navigate(`/item/${booking.item_id}`)}
                                    >
                                      {(booking.items as any)?.title || t("admin.article")}
                                    </h3>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                      <MapPin className="w-4 h-4" />
                                      {(booking.items as any)?.location || ""}
                                    </p>
                                  </div>
                                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${BOOKING_STATUS[booking.status]?.color || "bg-muted text-foreground/80"}`}>
                                    {BOOKING_STATUS[booking.status]?.label || booking.status}
                                  </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>
                                      {new Date(booking.start_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                                      {" → "}
                                      {new Date(booking.end_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                                    </span>
                                  </div>
                                  <div className="font-semibold text-foreground">
                                    {Number(booking.total_price).toLocaleString()} {t("common.da")}
                                  </div>
                                  {booking.deposit_amount > 0 && (
                                    <span className="text-xs text-muted-foreground">+ {Number(booking.deposit_amount).toLocaleString()} {t("common.da")} {t("createItem.form.deposit")}</span>
                                  )}
                                </div>
                                {booking.message && (
                                  <p className="text-sm text-muted-foreground italic mb-3">« {booking.message} »</p>
                                )}
                                <div className="flex gap-3">
                                  {/* Owner actions */}
                                  {bookingTab === "owner" && (
                                    <>
                                      {booking.status === "pending" && (
                                        <>
                                          <Button
                                            size="sm"
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full"
                                            onClick={() => handleBookingAction(booking.id, "confirmed")}
                                          >
                                            <Check className="w-4 h-4 mr-1" /> {t("dashboard.accept")}
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="rounded-full border-red-300 text-red-600 hover:bg-red-50"
                                            onClick={() => handleBookingAction(booking.id, "rejected")}
                                          >
                                            {t("dashboard.reject")}
                                          </Button>
                                        </>
                                      )}
                                      {booking.status === "confirmed" && new Date() >= new Date(booking.start_date) && (
                                        <Button
                                          size="sm"
                                          className="bg-[#0F2A2E] hover:bg-[#1A4851] text-white rounded-full"
                                          onClick={() => handleBookingAction(booking.id, "active")}
                                        >
                                          <Package className="w-4 h-4 mr-1" /> {t("dashboard.confirmHandover")}
                                        </Button>
                                      )}
                                      {booking.status === "active" && (
                                        <Button
                                          size="sm"
                                          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full"
                                          onClick={() => handleBookingAction(booking.id, "completed")}
                                        >
                                          <Check className="w-4 h-4 mr-1" /> {t("dashboard.confirmReturn")}
                                        </Button>
                                      )}
                                    </>
                                  )}
                                  {/* Renter actions */}
                                  {bookingTab === "renter" && booking.status === "pending" && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="rounded-full border-red-300 text-red-600 hover:bg-red-50"
                                      onClick={() => handleBookingAction(booking.id, "cancelled")}
                                    >
                                      {t("dashboard.cancelRequest")}
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="rounded-full"
                                    onClick={() => navigate(`/item/${booking.item_id}`)}
                                  >
                                    {t("dashboard.viewListing")}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ─── Mes Achats ─── */}
              {activeTab === 'purchases' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="bg-card rounded-3xl p-8 shadow-lg border border-border">
                    <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                      <ShoppingCart className="w-6 h-6" /> {t("dashboard.myPurchaseRequests") !== "dashboard.myPurchaseRequests" ? t("dashboard.myPurchaseRequests") : "Mes Demandes d'Achat"}
                    </h2>

                    <div className="space-y-4">
                      {mySales.map((sale) => (
                        <div key={sale.id} className="flex flex-col md:flex-row gap-6 p-6 bg-muted/50 rounded-3xl group">
                          <div className="w-full md:w-32 h-24 rounded-2xl overflow-hidden flex-shrink-0">
                            <ImageWithFallback
                              src={sale.item?.thumbnail_url}
                              alt={sale.item?.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="text-lg font-bold text-foreground cursor-pointer hover:text-[#FF4F5A]" onClick={() => navigate(`/item/${sale.item_id}`)}>{sale.item?.title}</h3>
                              <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase ${sale.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                sale.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                                  sale.status === 'completed' ? 'bg-green-100 text-green-700' :
                                    'bg-red-100 text-red-700'
                                }`}>
                                {sale.status === 'pending' ? t("bookingStatus.pending") :
                                  sale.status === 'accepted' ? t("bookingStatus.confirmed") :
                                    sale.status === 'completed' ? t("bookingStatus.completed") :
                                      sale.status === 'rejected' ? t("bookingStatus.rejected") : t("bookingStatus.cancelled")}
                              </span>
                            </div>
                            <p className="text-2xl font-bold text-foreground mb-2">{sale.price} DZD</p>
                            <p className="text-sm text-muted-foreground">Vendeur : {sale.seller?.full_name}</p>
                            {sale.status === 'accepted' && (
                              <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex flex-col gap-3">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                    <MessageSquare className="w-5 h-5" />
                                  </div>
                                  <p className="text-sm text-blue-700 font-semibold">
                                    {t("dashboard.deliveryInstructions")}
                                  </p>
                                </div>
                                <div className="bg-white/50 p-3 rounded-xl border border-blue-100 text-sm text-blue-800">
                                  {sale.delivery_info || t("dashboard.contactSellerForDelivery")}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {mySales.length === 0 && (
                        <div className="text-center py-12">
                          <ShoppingCart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                          <p className="text-muted-foreground">{t("dashboard.noPurchasesYet")}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ─── Mes Échanges ─── */}
              {activeTab === 'trades' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="bg-card rounded-3xl p-8 shadow-lg border border-border">
                    <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                      <RefreshCw className="w-6 h-6" /> {t("dashboard.myTradeProposals") !== "dashboard.myTradeProposals" ? t("dashboard.myTradeProposals") : "Mes Propositions de Troc"}
                    </h2>

                    <div className="space-y-4">
                      {myTroc.map((proposal) => (
                        <div key={proposal.id} className="p-6 bg-muted/50 rounded-3xl border border-border">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <p className="text-xs font-bold text-muted-foreground/70 uppercase mb-1">{t("dashboard.requestedItem")}</p>
                              <h3 className="text-lg font-bold text-foreground cursor-pointer hover:text-[#FF4F5A]" onClick={() => navigate(`/item/${proposal.requested_item_id}`)}>{proposal.requested_item?.title}</h3>
                            </div>
                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase ${proposal.status === 'pending' ? 'bg-purple-100 text-purple-700' :
                              proposal.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                                proposal.status === 'completed' ? 'bg-green-100 text-green-700' :
                                  'bg-red-100 text-red-700'
                              }`}>
                              {proposal.status === 'pending' ? t("bookingStatus.pending") :
                                proposal.status === 'accepted' ? t("bookingStatus.confirmed") :
                                  proposal.status === 'completed' ? t("bookingStatus.completed") :
                                    proposal.status === 'rejected' ? t("bookingStatus.rejected") : t("bookingStatus.cancelled")}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border">
                            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                              <RefreshCw className="w-5 h-5 rotate-45" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-purple-600 uppercase">{t("dashboard.yourProposal")}</p>
                              <p className="font-bold text-foreground">
                                {proposal.offered_item ? proposal.offered_item.title : (proposal.offered_item_data?.title || t("dashboard.personalItem"))}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {myTroc.length === 0 && (
                        <div className="text-center py-12">
                          <RefreshCw className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                          <p className="text-muted-foreground">{t("dashboard.noTradesYet")}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ─── Favoris ─── */}
              {activeTab === 'favorites' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-3xl p-8 shadow-lg border border-border"
                >
                  <h2 className="text-2xl font-bold text-foreground mb-6">{t("dashboard.myFavorites") !== "dashboard.myFavorites" ? t("dashboard.myFavorites") : "Mes Favoris"}</h2>

                  {favorites.length === 0 ? (
                    <div className="text-center py-16 rounded-[2rem] bg-gradient-to-b from-muted to-transparent border border-dashed border-border/60">
                      <Heart className="w-16 h-16 text-[#FF4F5A]/40 mx-auto mb-4 animate-pulse" />
                      <p className="text-muted-foreground mb-2 text-lg font-semibold">{t("dashboard.noFavoritesYet")}</p>
                      <p className="text-sm text-muted-foreground/70 max-w-sm mx-auto">{t("dashboard.favoritesDesc")}</p>
                      <Button
                        onClick={() => navigate('/explore')}
                        className="mt-6 bg-[#FF4F5A] hover:bg-[#FF4F5A]/90 text-white rounded-full font-bold px-8 shadow-lg shadow-[#FF4F5A]/20 transition-all hover:scale-105"
                      >
                        {t("dashboard.exploreListings") !== "dashboard.exploreListings" ? t("dashboard.exploreListings") : "Explorer les annonces"}
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {favorites.map((fav) => (
                        <div key={fav.id} className="flex gap-5 p-4 rounded-[1.5rem] border border-border/50 bg-card hover:bg-muted/30 shadow-sm hover:shadow-[0_10px_30px_-10px_rgba(255,79,90,0.15)] group hover:border-[#FF4F5A]/30 transition-all duration-300">
                          <div className="w-28 h-28 rounded-2xl flex-shrink-0 overflow-hidden cursor-pointer relative shadow-inner" onClick={() => navigate(`/item/${fav.item_id}`)}>
                            <ImageWithFallback src={fav.item?.thumbnail_url} alt={fav.item?.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
                          </div>
                          <div className="flex flex-col justify-between py-1.5 flex-1 min-w-0">
                            <div>
                              <div className="flex justify-between items-start mb-1">
                                <h3 className="font-bold text-foreground hover:text-[#FF4F5A] cursor-pointer line-clamp-2 transition-colors text-base pr-2" onClick={() => navigate(`/item/${fav.item_id}`)}>
                                  {fav.item?.title}
                                </h3>
                              </div>
                              <p className="text-xs font-semibold text-muted-foreground mt-1 flex items-center gap-1.5 bg-muted/60 w-fit px-2 py-0.5 rounded-md">
                                <MapPin className="w-3.5 h-3.5 text-[#FF4F5A]/70" />
                                <span className="truncate max-w-[120px]">{fav.item?.location || t("common.notSpecified")}</span>
                              </p>
                            </div>
                            <div className="flex items-end justify-between mt-3">
                              <p className="font-black text-lg text-foreground tracking-tight">
                                {fav.item?.price_per_day} {t("common.da")} <span className="text-xs font-bold text-muted-foreground tracking-normal">/ {t("landing.day")}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ─── Messages ─── */}
              {activeTab === 'messages' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex"
                  style={{ height: '620px' }}
                >
                  {/* Left Column: Conversations List */}
                  <div className="w-[280px] flex-shrink-0 border-r border-border flex flex-col bg-muted/20">
                    <div className="px-5 py-4 border-b border-border">
                      <h2 className="text-base font-bold text-foreground">{t("dashboard.messages") !== "dashboard.messages" ? t("dashboard.messages") : "Messages"}</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">{conversations.length} {conversations.length === 1 ? (t("dashboard.conversation") !== "dashboard.conversation" ? t("dashboard.conversation") : "conversation") : (t("dashboard.conversations") !== "dashboard.conversations" ? t("dashboard.conversations") : "conversations")}</p>
                    </div>
                    <div className="flex-1 overflow-y-auto no-scrollbar">
                      {conversations.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                          <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-20" />
                          <p className="text-sm font-medium">{t("dashboard.noConversations")}</p>
                          <p className="text-xs mt-1 opacity-60">{t("dashboard.contactSellers")}</p>
                        </div>
                      ) : (
                        conversations.map((conv) => (
                          <div
                            key={conv.id}
                            onClick={() => setActiveConversationId(conv.id)}
                            className={`p-4 cursor-pointer transition-all border-b border-border/40 ${activeConversationId === conv.id
                              ? "bg-[#FF4F5A]/5 border-l-2 border-l-[#FF4F5A]"
                              : "hover:bg-muted/40"
                              }`}
                          >
                            <div className="flex gap-3 items-start">
                              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-border">
                                {conv.other_user?.avatar_url ? (
                                  <img src={conv.other_user.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-[#0F2A2E] to-[#1A4851] text-white flex items-center justify-center font-bold text-sm">
                                    {conv.other_user?.full_name?.charAt(0) || "U"}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                  <p className="font-semibold text-foreground text-sm truncate">{conv.other_user?.full_name}</p>
                                  <span className="text-[10px] text-muted-foreground/60 ml-1 flex-shrink-0">
                                    {new Date(conv.last_message_at).toLocaleDateString("fr-FR", { day: '2-digit', month: '2-digit' })}
                                  </span>
                                </div>
                                <p className="text-[11px] font-medium text-[#FF4F5A] truncate mt-0.5">{conv.items?.title || "Annonce"}</p>
                                <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.last_message_preview || "Nouvelle conversation"}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Right Column: Active Chat */}
                  <div className="flex-1 flex flex-col bg-background/50">
                    {!activeConversationId ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground/50 gap-3">
                        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                          <MessageSquare className="w-8 h-8 opacity-30" />
                        </div>
                        <p className="text-sm font-medium">{t("dashboard.selectConversation") !== "dashboard.selectConversation" ? t("dashboard.selectConversation") : "Sélectionnez une conversation"}</p>
                      </div>
                    ) : (
                      <>
                        {/* Chat Header */}
                        {(() => {
                          const conv = conversations.find(c => c.id === activeConversationId);
                          return conv ? (
                            <div className="px-5 py-3.5 border-b border-border flex items-center gap-3 bg-card shadow-sm">
                              <div className="w-9 h-9 rounded-full overflow-hidden ring-1 ring-border flex-shrink-0">
                                {conv.other_user?.avatar_url ? (
                                  <img src={conv.other_user.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-[#0F2A2E] to-[#1A4851] text-white flex items-center justify-center font-bold text-xs">
                                    {conv.other_user?.full_name?.charAt(0) || "U"}
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-foreground text-sm">{conv.other_user?.full_name}</p>
                                <p className="text-[11px] text-muted-foreground cursor-pointer hover:text-[#FF4F5A] transition-colors" onClick={() => conv.item_id && navigate(`/item/${conv.item_id}`)}>
                                  {conv.items?.title || "Annonce"}
                                </p>
                              </div>
                            </div>
                          ) : null;
                        })()}

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-3 no-scrollbar">
                          {isLoadingMsgs ? (
                            <div className="flex justify-center my-auto"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground/40" /></div>
                          ) : (
                            messages.map(msg => {
                              const isMe = msg.sender_id === user?.id;
                              return (
                                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                  <div className={`relative max-w-[72%] px-4 py-2.5 ${isMe
                                    ? "bg-[#FF4F5A] text-white rounded-2xl rounded-br-md shadow-sm"
                                    : "bg-card border border-border text-foreground rounded-2xl rounded-bl-md shadow-sm"
                                    }`}>
                                    <p className="text-sm leading-relaxed" style={{ wordBreak: 'break-word' }}>{msg.content}</p>
                                    <p className={`text-[10px] mt-1.5 ${isMe ? "text-white/60 text-right" : "text-muted-foreground/60"
                                      }`}>
                                      {new Date(msg.created_at).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* Chat Input */}
                        <div className="p-4 border-t border-border bg-card">
                          <form onSubmit={handleSendMessage} className="flex gap-2">
                            <Input
                              value={newMessage}
                              onChange={e => setNewMessage(e.target.value)}
                              placeholder={t("dashboard.writeMessage")}
                              className="flex-1 rounded-xl h-10 bg-muted/50 border-border/60 focus-visible:ring-[#FF4F5A]/30 text-sm"
                            />
                            <Button
                              type="submit"
                              disabled={!newMessage.trim()}
                              className="w-10 h-10 rounded-xl bg-[#FF4F5A] hover:bg-[#FF4F5A]/90 text-white p-0 flex items-center justify-center shadow-sm"
                            >
                              <ChevronRight className="w-5 h-5" />
                            </Button>
                          </form>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ─── Historique ─── */}
              {activeTab === 'history' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-3xl p-8 shadow-lg border border-border"
                >
                  <h2 className="text-2xl font-bold text-foreground mb-6">{t("dashboard.rentalHistory") !== "dashboard.rentalHistory" ? t("dashboard.rentalHistory") : "Historique de location"}</h2>
                  {historyBookings.length === 0 ? (
                    <div className="text-center py-12">
                      <Clock className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
                      <p className="text-muted-foreground mb-2">{t("dashboard.noPastRentals")}</p>
                      <Button variant="outline" className="mt-4 rounded-full" onClick={() => navigate('/explore')}>{t("dashboard.exploreCatalog")}</Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {historyBookings.map((booking) => (
                        <div key={booking.id} className="flex flex-col md:flex-row gap-4 p-4 border border-border bg-muted/20 rounded-2xl items-center">
                          <div className="w-full md:w-24 h-16 rounded-xl flex-shrink-0 overflow-hidden" onClick={() => navigate(`/item/${booking.item_id}`)}>
                            <ImageWithFallback src={(booking.items as any)?.thumbnail_url} alt="" className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-foreground">{(booking.items as any)?.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <span>Du {new Date(booking.start_date).toLocaleDateString()}</span>
                              <span>au {new Date(booking.end_date).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${BOOKING_STATUS[booking.status]?.color}`}>
                              {BOOKING_STATUS[booking.status]?.label || booking.status}
                            </span>
                            <div className="font-bold text-lg">{booking.total_price} {t("common.da")}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ─── Mon Profil (Settings) ─── */}
              {activeTab === 'profile' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left: Avatar & Identity */}
                    <div className="lg:col-span-1 space-y-8">
                      <div className="bg-card rounded-[2.5rem] p-8 shadow-xl border border-border text-center relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-[#0F2A2E] to-[#1A4851]" />
                        <div className="relative mt-4 mb-6">
                          <div className="relative inline-block group/avatar">
                            {profile.avatar_url ? (
                              <img
                                src={profile.avatar_url}
                                alt={profile.full_name}
                                className="w-32 h-32 rounded-full object-cover border-4 border-card shadow-2xl transition-transform duration-500 group-hover/avatar:scale-105"
                              />
                            ) : (
                              <div className="w-32 h-32 bg-gradient-to-br from-[#FF4F5A] to-[#FF6B74] rounded-full flex items-center justify-center text-white text-5xl font-black border-4 border-card shadow-2xl">
                                {userInitials}
                              </div>
                            )}
                            <label className="absolute bottom-0 right-0 w-10 h-10 bg-[#0F2A2E] text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-[#1A4851] transition-colors border-2 border-card">
                              <Camera className="w-5 h-5" />
                              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                            </label>
                          </div>
                        </div>
                        <h3 className="text-xl font-black text-foreground truncate px-2">{profile.full_name}</h3>
                        <p className="text-sm text-muted-foreground truncate px-2 mb-4 opacity-70">{profile.email}</p>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-muted rounded-full text-[10px] font-black uppercase tracking-widest text-[#FF4F5A] border border-border">
                          <Check className="w-3 h-3" /> {t("dashboard.verifiedMember")}
                        </div>
                      </div>

                      <div className="bg-card rounded-[2rem] p-8 shadow-lg border border-border">
                        <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4">{t("dashboard.statistics")}</h4>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-foreground/70">{t("dashboard.seniority")}</span>
                            <span className="text-sm font-black">2 {t("dashboard.years")}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-foreground/70">{t("dashboard.rentals")}</span>
                            <span className="text-sm font-black">14</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-foreground/70">{t("dashboard.averageRating")}</span>
                            <div className="flex items-center gap-1 text-[#FF4F5A]">
                              <Star className="w-4 h-4 fill-current" />
                              <span className="text-sm font-black">4.9</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Personal Info Form */}
                    <div className="lg:col-span-2">
                      <div className="bg-card rounded-[2.5rem] p-10 shadow-xl border border-border">
                        <div className="flex items-center justify-between mb-10">
                          <h2 className="text-2xl font-black">{(t("dashboard.personalInfo1") !== "dashboard.personalInfo1" ? t("dashboard.personalInfo1") : "Informations").split(" ")[0]} <span className="text-[#FF4F5A]">{(t("dashboard.personalInfo2") !== "dashboard.personalInfo2" ? t("dashboard.personalInfo2") : "Personnelles")}</span></h2>
                          <div className="h-px flex-1 bg-border mx-8 hidden sm:block" />
                        </div>

                        {profileError && (
                          <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-4 rounded-2xl mb-8 text-sm font-bold flex items-center gap-3">
                            <XCircle className="w-5 h-5 flex-shrink-0" /> {profileError}
                          </div>
                        )}

                        {saveSuccess && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 px-6 py-4 rounded-2xl mb-8 text-sm font-bold flex items-center gap-3"
                          >
                            <CheckCircle className="w-5 h-5 flex-shrink-0" /> {t("dashboard.profileUpdated")}
                          </motion.div>
                        )}

                        {isLoadingProfile ? (
                          <div className="py-20 text-center">
                            <Loader2 className="w-10 h-10 animate-spin text-[#FF4F5A] mx-auto" />
                          </div>
                        ) : (
                          <div className="space-y-8">
                            <div className="grid sm:grid-cols-2 gap-8">
                              <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">{t("auth.fullName")}</label>
                                <Input
                                  value={profile.full_name}
                                  onChange={(e) => setProfile(p => ({ ...p, full_name: e.target.value }))}
                                  className="h-14 bg-muted/30 border-border rounded-2xl focus:ring-2 focus:ring-[#FF4F5A]/20 transition-all font-bold"
                                  placeholder={t("auth.fullNamePlaceholder")}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">{t("dashboard.phone")}</label>
                                <Input
                                  value={profile.phone}
                                  onChange={(e) => setProfile(p => ({ ...p, phone: e.target.value }))}
                                  className="h-14 bg-muted/30 border-border rounded-2xl focus:ring-2 focus:ring-[#FF4F5A]/20 transition-all font-bold"
                                  placeholder="+213 5XX XX XX XX"
                                />
                              </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-8">
                              <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">{t("auth.email")} <span className="opacity-50">({t("dashboard.readOnly")})</span></label>
                                <Input value={profile.email} disabled className="h-14 bg-muted border-border rounded-2xl font-bold opacity-60" />
                              </div>
                              <div className="space-y-2 font-bold">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">{t("explore.location")}</label>
                                <select
                                  value={profile.wilaya_code || ""}
                                  onChange={(e) => setProfile(p => ({ ...p, wilaya_code: e.target.value ? Number(e.target.value) : null }))}
                                  className="w-full h-14 px-4 bg-muted/30 border border-border rounded-2xl text-foreground focus:outline-none focus:ring-2 focus:ring-[#FF4F5A]/20 appearance-none font-bold transition-all"
                                >
                                  <option value="">{t("dashboard.selectWilaya")}</option>
                                  {WILAYAS.map(w => <option key={w.code} value={w.code}>{w.code} - {w.name}</option>)}
                                </select>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">{t("dashboard.bio")}</label>
                              <textarea
                                value={profile.bio}
                                onChange={(e) => setProfile(p => ({ ...p, bio: e.target.value }))}
                                rows={5}
                                className="w-full px-5 py-4 bg-muted/30 border border-border rounded-[2rem] focus:outline-none focus:ring-2 focus:ring-[#FF4F5A]/20 resize-none font-bold transition-all"
                                placeholder={t("dashboard.bioPlaceholder")}
                                maxLength={500}
                              />
                              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mt-2 text-right">
                                {profile.bio.length} / 500 {t("dashboard.characters")}
                              </p>
                            </div>

                            <div className="pt-4 border-t border-border flex justify-end">
                              <Button
                                onClick={handleSaveProfile}
                                disabled={isSaving}
                                className="bg-gradient-to-r from-[#0F2A2E] to-[#1A4851] text-white h-14 px-10 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[#0F2A2E]/20 transition-all hover:-translate-y-1 active:translate-y-0"
                              >
                                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : t("dashboard.saveChanges")}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ─── Paramètres ─── */}
              {activeTab === 'settings' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-3xl p-8 shadow-lg border border-border"
                >
                  <h2 className="text-2xl font-bold text-foreground mb-6">{t("dashboard.settings") !== "dashboard.settings" ? t("dashboard.settings") : "Paramètres"}</h2>
                  <div className="space-y-6">
                    <div className="p-6 bg-muted/20 rounded-2xl border border-border">
                      <h3 className="font-bold text-lg mb-2">{t("dashboard.language") !== "dashboard.language" ? t("dashboard.language") : "Langue"}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{t("dashboard.languageDesc") !== "dashboard.languageDesc" ? t("dashboard.languageDesc") : "Choisissez votre langue d'affichage préférée."}</p>
                      <div className="flex gap-3">
                        {['fr', 'en', 'ar'].map(lang => (
                          <Button 
                            key={lang}
                            variant="outline" 
                            className="rounded-xl px-6"
                            onClick={() => {
                              window.location.reload(); 
                            }}
                          >
                            {lang.toUpperCase()}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="p-6 bg-muted/20 rounded-2xl border border-border">
                      <h3 className="font-bold text-lg mb-2">{t("dashboard.notifications") !== "dashboard.notifications" ? t("dashboard.notifications") : "Notifications"}</h3>
                      <p className="text-sm text-muted-foreground">{t("dashboard.notifDesc") !== "dashboard.notifDesc" ? t("dashboard.notifDesc") : "Gérez vos préférences de notifications par email et SMS."}</p>
                      <Button variant="outline" className="mt-4 rounded-xl opacity-50 cursor-not-allowed">
                        {t("common.comingSoon") !== "common.comingSoon" ? t("common.comingSoon") : "Bientôt disponible"}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
