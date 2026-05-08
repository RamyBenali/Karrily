import { Navigation } from "../components/layout/navigation";
import { motion } from "motion/react";
import { Plus, Package, Calendar, TrendingUp, DollarSign, Edit2, Trash2, Eye, BarChart3, CheckCircle, XCircle, MapPin, Star, Loader2, MessageCircle, MessageSquare, ChevronRight, User as UserIcon } from "lucide-react";
import { Button } from "../components/ui/button";
import { useNavigate, useLocation } from "react-router";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { useAuthStore } from "../store/auth.store";
import { usersService, bookingsService, itemsService, salesService, trocService, statsService } from "../services/api.service";
import { supabase } from "../lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";
import { ShoppingCart, RefreshCw } from "lucide-react";
import { DashboardSidebar } from "../components/dashboard/dashboard-sidebar";
import { cn } from "../components/ui/utils";
import { useTranslation } from "../context/language-context";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { Input } from "../components/ui/input";

// --- Messaging Interfaces ---
interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  message_type: 'text' | 'image' | 'system';
  is_read: boolean;
}

interface Conversation {
  id: string;
  item_id: string | null;
  participant_1: string;
  participant_2: string;
  last_message_preview: string;
  last_message_at: string;
  created_at: string;
  items?: {
    title: string;
    thumbnail_url: string;
  };
  other_user?: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
}

const getSidebarItems = (t: any, unreadCount: number = 0) => [
  { id: 'overview', icon: BarChart3, label: t("lender.overview") },
  { id: 'listings', icon: Package, label: t("lender.myListings") },
  { id: 'bookings', icon: Calendar, label: t("lender.rentals") },
  { id: 'sales', icon: ShoppingCart, label: t("dashboard.sales") },
  { id: 'troc', icon: RefreshCw, label: t("dashboard.trades") },
  { id: 'messages', icon: MessageCircle, label: t("dashboard.messages") !== "dashboard.messages" ? t("dashboard.messages") : "Messages", badge: unreadCount },
  { id: 'earnings', icon: DollarSign, label: t("lender.earnings") },
  { id: 'reviews', icon: Star, label: t("dashboard.reviews") },
];

const WILAYAS: Record<number, string> = {
  1: "Adrar", 2: "Chlef", 3: "Laghouat", 4: "Oum El Bouaghi", 5: "Batna", 6: "Béjaïa",
  7: "Biskra", 8: "Béchar", 9: "Blida", 10: "Bouira", 11: "Tamanrasset", 12: "Tébessa",
  13: "Tlemcen", 14: "Tiaret", 15: "Tizi Ouzou", 16: "Alger", 17: "Djelfa", 18: "Jijel",
  19: "Sétif", 20: "Saïda", 21: "Skikda", 22: "Sidi Bel Abbès", 23: "Annaba", 24: "Guelma",
  25: "Constantine", 26: "Médéa", 27: "Mostaganem", 28: "M'Sila", 29: "Mascara", 30: "Ouargla",
  31: "Oran", 32: "El Bayadh", 33: "Illizi", 34: "Bordj Bou Arréridj", 35: "Boumerdès",
  36: "El Tarf", 37: "Tindouf", 38: "Tissemsilt", 39: "El Oued", 40: "Khenchela",
  41: "Souk Ahras", 42: "Tipaza", 43: "Mila", 44: "Aïn Defla", 45: "Naâma",
  46: "Aïn Témouchent", 47: "Ghardaïa", 48: "Relizane",
};

export function LenderDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const [activeView, setActiveView] = useState<"overview" | "listings" | "bookings" | "sales" | "troc" | "earnings" | "reviews" | "messages">("overview");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- Messaging State ---
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(location.state?.convId || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoadingMsgs, setIsLoadingMsgs] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  const [myListings, setMyListings] = useState<any[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [mySales, setMySales] = useState<any[]>([]);
  const [trocProposals, setTrocProposals] = useState<any[]>([]);
  const [stats, setStats] = useState({ 
    totalEarnings: 0, 
    activeListings: 0, 
    totalBookings: 0,
    averageRating: 0,
    earningsData: [] as { month: string, earnings: number }[]
  });
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  // ID of a specific entity to highlight (from notification click)
  const [highlightId, setHighlightId] = useState<string | null>(location.state?.highlightId || null);

  // Auto-scroll to highlighted element and clear after delay
  useEffect(() => {
    if (!highlightId) return;
    
    const timer = setTimeout(() => {
      const el = document.getElementById(`highlight-${highlightId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 600); 

    const clearTimer = setTimeout(() => {
      setHighlightId(null);
      window.history.replaceState({}, document.title);
    }, 10000); 
    
    return () => { clearTimeout(timer); clearTimeout(clearTimer); };
  }, [highlightId, activeView, upcomingBookings, mySales, trocProposals]);

  useEffect(() => {
    if (location.state?.tab) {
      const tab = location.state.tab.toLowerCase();
      const validTabs = ["overview", "listings", "bookings", "sales", "troc", "earnings", "reviews", "messages"];
      if (validTabs.includes(tab)) {
        setActiveView(tab as any);
      }
    }
    if (location.state?.highlightId) {
      setHighlightId(location.state.highlightId);
    }
    if (location.state?.convId) {
      setActiveConversationId(location.state.convId);
    }
  }, [location.state]);

  const sidebarItems = getSidebarItems(t, unreadMessagesCount);

  const topClients = useMemo(() => {
    const clients: Record<string, { name: string, count: number, total: number }> = {};
    
    [...upcomingBookings, ...mySales].forEach((t: any) => {
      const isCompleted = ["completed", "delivered", "accepted", "active"].includes(t.status);
      if (isCompleted) {
        const name = t.renter?.full_name || t.buyer?.full_name;
        if (!name) return;
        if (!clients[name]) clients[name] = { name, count: 0, total: 0 };
        clients[name].count += 1;
        clients[name].total += Number(t.total_price || t.price || 0);
      }
    });

    return Object.values(clients).sort((a, b) => b.total - a.total).slice(0, 5);
  }, [upcomingBookings, mySales]);

  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    actionLabel: string;
    variant: "destructive" | "default";
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
    actionLabel: "Confirmer",
    variant: "default"
  });

  const [promptConfig, setPromptConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    value: string;
    onConfirm: (val: string) => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    value: "",
    onConfirm: () => {}
  });

  useEffect(() => {
    if (!user) return;
    
    usersService.getUserItems(user.id).then(res => setMyListings(res.data));
    statsService.getLenderStats().then(res => { if (res.data) setStats(res.data); });

    setIsLoadingReviews(true);
    supabase
      .from("reviews")
      .select("*, item:items!inner(title, owner_id), reviewer:profiles!reviewer_id(full_name, avatar_url)")
      .eq("item.owner_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setReviews(data);
        setIsLoadingReviews(false);
      });

    let channel: RealtimeChannel;
    const fetchBookings = async () => {
      try {
        const res = await bookingsService.getMyBookings({ role: 'owner' });
        setUpcomingBookings(res.data);
        setStats(prev => ({ ...prev, totalBookings: res.data.length }));
        channel = supabase
          .channel(`lender_bookings:${user.id}`)
          .on("postgres_changes", { event: "*", schema: "public", table: "bookings", filter: `owner_id=eq.${user.id}` }, () => fetchBookings())
          .subscribe();
      } catch (err) { console.error(err); }
    };

    const fetchSales = async () => {
      const res = await salesService.getMySales({ role: 'seller' });
      setMySales(res.data);
    };

    const fetchTroc = async () => {
      const res = await trocService.getMyProposals({ role: 'owner' });
      setTrocProposals(res.data);
    };

    fetchBookings();
    fetchSales();
    fetchTroc();

    const salesChannel = supabase
      .channel(`lender_sales:${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "sales", filter: `seller_id=eq.${user.id}` }, () => fetchSales())
      .subscribe();

    const trocChannel = supabase
      .channel(`lender_troc:${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "troc_proposals", filter: `requested_owner_id=eq.${user.id}` }, () => fetchTroc())
      .subscribe();

    return () => {
      if (channel) supabase.removeChannel(channel);
      supabase.removeChannel(salesChannel);
      supabase.removeChannel(trocChannel);
    };
  }, [user]);

  // --- Messaging Logic ---
  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return;
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

    const convChannel = supabase
      .channel(`seller_convs:${user?.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, () => fetchConversations())
      .subscribe();

    const fetchUnreadCount = async () => {
      if (!user) return;
      const { count } = await supabase
        .from("messages")
        .select("*", { count: 'exact', head: true })
        .eq("is_read", false)
        .neq("sender_id", user.id);
      setUnreadMessagesCount(count || 0);
    };
    fetchUnreadCount();

    return () => {
      supabase.removeChannel(convChannel);
    };
  }, [user?.id]);

  useEffect(() => {
    let channel: RealtimeChannel;
    const fetchMessages = async () => {
      if (!activeConversationId || !user) return;
      setIsLoadingMsgs(true);
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", activeConversationId)
        .order("created_at", { ascending: true });

      if (data) setMessages(data as Message[]);
      setIsLoadingMsgs(false);

      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("conversation_id", activeConversationId)
        .neq("sender_id", user.id);

      channel = supabase
        .channel(`chat:${activeConversationId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${activeConversationId}` },
          (payload) => {
            const newMsg = payload.new as Message;
            setMessages((prev) => {
              if (prev.some(m => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
          }
        )
        .subscribe();
    };

    fetchMessages();
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [activeConversationId, user?.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeConversationId || !newMessage.trim()) return;

    const content = newMessage.trim();
    const tempId = crypto.randomUUID();
    const optimisticMsg: Message = {
      id: tempId,
      conversation_id: activeConversationId,
      sender_id: user.id,
      content: content,
      created_at: new Date().toISOString(),
      message_type: 'text',
      is_read: false
    };

    setMessages(prev => [...prev, optimisticMsg]);
    setNewMessage("");

    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: activeConversationId,
        sender_id: user.id,
        content: content,
      })
      .select()
      .single();

    if (error) {
      toast.error("Erreur lors de l'envoi du message");
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } else if (data) {
      setMessages(prev => prev.map(m => m.id === tempId ? data as Message : m));
    }

    await supabase
      .from("conversations")
      .update({ last_message_preview: content, last_message_at: new Date().toISOString() })
      .eq("id", activeConversationId);
  };

  const handleDeleteItem = (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: t("lender.deleteListingTitle"),
      description: t("lender.deleteListingDesc"),
      actionLabel: t("lender.supprimer"),
      variant: "destructive",
      onConfirm: async () => {
        try {
          await itemsService.delete(id);
          setMyListings(prev => prev.filter(i => i.id !== id));
        } catch (err: any) {
          console.error("Error deleting item:", err);
          if (err.response?.status === 404) {
            setMyListings(prev => prev.filter(i => i.id !== id));
          }
        } finally {
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleUpdateTrocStatus = async (id: string, status: string) => {
    try {
      await trocService.updateStatus(id, status);
      setTrocProposals(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    } catch(err: any) { 
      console.error("Error updating troc status:", err);
      if (err.response?.status === 404) {
        setTrocProposals(prev => prev.filter(p => p.id !== id));
      }
    }
  };

  const handleUpdateSaleStatus = async (id: string, status: string) => {
    if (status === 'accepted') {
      setPromptConfig({
        isOpen: true,
        title: t("lender.deliveryDetails"),
        description: t("lender.deliveryDetailsDesc"),
        value: "",
        onConfirm: async (info) => {
          if (!info) return;
          await salesService.updateStatus(id, status, info);
          setMySales(prev => prev.map(s => s.id === id ? { ...s, status, delivery_info: info } : s));
          setPromptConfig(prev => ({ ...prev, isOpen: false }));
        }
      });
      return;
    }
    try {
      await salesService.updateStatus(id, status);
      setMySales(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    } catch (err: any) {
      console.error("Error updating sale status:", err);
      if (err.response?.status === 404) {
        setMySales(prev => prev.filter(s => s.id !== id));
      }
    }
  };

  const handleUpdateBookingStatus = async (id: string, status: string) => {
    try {
      await bookingsService.updateStatus(id, status);
      setUpcomingBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    } catch (err: any) {
      console.error("Error updating booking status:", err);
      if (err.response?.status === 404) {
        setUpcomingBookings(prev => prev.filter(b => b.id !== id));
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="py-8 lg:py-12">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-5">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-px flex-1 max-w-[40px] bg-gradient-to-r from-[#FF4F5A] to-transparent" />
                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[#FF4F5A]">{t("lender.ownerSpace")}</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-foreground mb-2 leading-tight">{t("lender.myCenter").split(" ")[0]} <span className="gradient-text">{t("lender.myCenter").split(" ")[1]}</span></h1>
              <p className="text-base text-muted-foreground max-w-xl">{t("lender.manageInventorySubtitle")}</p>
            </div>
            <Button onClick={() => navigate("/create")} className="bg-[#FF4F5A] text-white px-7 h-11 rounded-xl font-bold text-sm shadow-lg shadow-[#FF4F5A]/20">
              <Plus className="w-4 h-4 mr-2" /> {t("lender.publishListing")}
            </Button>
          </motion.div>

          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
            <DashboardSidebar
              items={sidebarItems}
              activeTab={activeView}
              setActiveTab={(id) => {
                setActiveView(id);
                setHighlightId(null);
                setIsMobileMenuOpen(false);
              }}
              userInitials={user?.user_metadata?.full_name?.charAt(0) || "U"}
              userFullName={user?.user_metadata?.full_name || "Utilisateur"}
              userEmail={user?.email || ""}
              isMobileMenuOpen={isMobileMenuOpen}
              setIsMobileMenuOpen={setIsMobileMenuOpen}
              extraAction={{ label: t("lender.clientMode"), onClick: () => navigate('/dashboard'), variant: "default" }}
            />

            <div className="lg:col-span-9">
              {activeView === "overview" && (
                <div className="space-y-8">
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {[
                      { label: t("lender.revenue"), value: `${stats.totalEarnings.toLocaleString()} ${t("common.da")}`, icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                      { label: t("lender.myListings"), value: stats.activeListings, icon: Package, color: "text-[#FF4F5A]", bg: "bg-[#FF4F5A]/10" },
                      { label: t("lender.rentals"), value: stats.totalBookings, icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10" },
                      { label: t("lender.satisfaction"), value: stats.averageRating ? stats.averageRating.toFixed(1) : t("lender.notAvailable"), icon: Star, color: "text-amber-500", bg: "bg-amber-500/10" }
                    ].map((s) => (
                      <div key={s.label} className="bg-card rounded-2xl p-5 border border-border">
                        <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-4`}>
                          <s.icon className={`w-5 h-5 ${s.color}`} />
                        </div>
                        <p className="text-[11px] text-muted-foreground mb-1">{s.label}</p>
                        <p className="text-2xl font-black">{s.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-card rounded-2xl p-7 border border-border h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.earningsData}>
                        <defs><linearGradient id="colorE" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#FF4F5A" stopOpacity={0.1}/><stop offset="95%" stopColor="#FF4F5A" stopOpacity={0}/></linearGradient></defs>
                        <XAxis dataKey="month" hide />
                        <YAxis hide />
                        <Tooltip />
                        <Area type="monotone" dataKey="earnings" stroke="#FF4F5A" fill="url(#colorE)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {topClients.length > 0 && (
                    <div className="bg-card rounded-2xl p-7 border border-border">
                      <h3 className="text-xl font-bold mb-4">{t("lender.loyalClients") !== "lender.loyalClients" ? t("lender.loyalClients") : "Clients Fidèles"}</h3>
                      <div className="space-y-4">
                        {topClients.map((client, idx) => (
                          <div key={idx} className="flex justify-between items-center p-4 bg-muted/30 rounded-xl">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                                {client.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold">{client.name}</p>
                                <p className="text-xs text-muted-foreground">{client.count} transactions</p>
                              </div>
                            </div>
                            <p className="font-bold text-emerald-500">{client.total.toLocaleString()} {t("common.da")}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeView === "listings" && (
                <div className="space-y-4">
                  {myListings.map(item => (
                    <div key={item.id} className="flex gap-6 p-6 bg-card border border-border rounded-3xl">
                      <div className="w-32 h-32 rounded-2xl overflow-hidden"><img src={item.thumbnail_url} className="w-full h-full object-cover" /></div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold">{item.title}</h3>
                        <p className="text-[#FF4F5A] font-bold">{item.price_per_day} {t("common.da")}/j</p>
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" variant="outline" onClick={() => navigate(`/edit-item/${item.id}`)}>{t("lender.modifier")}</Button>
                          <Button size="sm" variant="outline" className="text-red-500" onClick={() => handleDeleteItem(item.id)}>{t("lender.supprimer")}</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeView === "bookings" && (
                <div className="space-y-4">
                  {upcomingBookings.map(b => (
                    <div
                      key={b.id}
                      id={`highlight-${b.id}`}
                      className={cn(
                        "p-5 bg-card border rounded-3xl flex flex-col md:flex-row gap-6 items-center hover:shadow-lg transition-all group relative",
                        String(highlightId) === String(b.id) 
                          ? "z-10 border-l-4 border-l-[#FF4F5A] bg-gradient-to-r from-[#FF4F5A]/10 to-transparent shadow-[0_10px_30px_-5px_rgba(255,79,90,0.15)] animate-[highlightPulse_2s_ease-in-out_3]" 
                          : "border-border"
                      )}
                    >
                      {String(highlightId) === String(b.id) && <div className="absolute -top-3 right-5 bg-[#FF4F5A] text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg z-20 animate-bounce">{t("dashboard.new") || "NOUVEAU"}</div>}
                      <div className="w-full md:w-40 h-28 rounded-2xl overflow-hidden flex-shrink-0 cursor-pointer" onClick={() => navigate(`/item/${b.item_id}`)}>
                        <ImageWithFallback src={b.items?.thumbnail_url} alt={b.items?.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-lg font-bold text-foreground truncate cursor-pointer hover:text-[#FF4F5A]" onClick={() => navigate(`/item/${b.item_id}`)}>{b.items?.title}</h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                              <UserIcon className="w-3.5 h-3.5 text-[#FF4F5A]" />
                              <span className="font-medium">{b.renter?.full_name || "Client"}</span>
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            b.status === 'pending' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                            b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                            b.status === 'completed' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                            'bg-red-100 text-red-700 border border-red-200'
                          }`}>
                            {b.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{new Date(b.start_date).toLocaleDateString()} - {new Date(b.end_date).toLocaleDateString()}</span>
                          </div>
                          <div className="font-black text-[#FF4F5A] text-sm">
                            {Number(b.total_price).toLocaleString()} {t("common.da")}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full md:w-auto">
                        {b.status === 'pending' && (
                          <>
                            <Button size="sm" onClick={() => handleUpdateBookingStatus(b.id, 'confirmed')} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex-1 md:flex-none">{t("dashboard.accept")}</Button>
                            <Button size="sm" onClick={() => handleUpdateBookingStatus(b.id, 'cancelled')} variant="outline" className="text-red-500 border-red-200 hover:bg-red-50 rounded-xl flex-1 md:flex-none">Refuser</Button>
                          </>
                        )}
                        <Button size="sm" variant="ghost" className="rounded-xl" onClick={() => navigate(`/item/${b.item_id}`)}><Eye className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  ))}
                  {upcomingBookings.length === 0 && (
                    <div className="text-center py-12 bg-muted/20 rounded-3xl border border-dashed border-border">
                      <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground">{t("dashboard.noBookingsYet")}</p>
                    </div>
                  )}
                </div>
              )}

              {activeView === "sales" && (
                <div className="space-y-4">
                  {mySales.map(s => (
                    <div
                      key={s.id}
                      id={`highlight-${s.id}`}
                      className={cn(
                        "p-5 bg-card border rounded-3xl flex flex-col md:flex-row gap-6 items-center hover:shadow-lg transition-all group relative",
                        String(highlightId) === String(s.id) 
                          ? "z-10 border-l-4 border-l-[#FF4F5A] bg-gradient-to-r from-[#FF4F5A]/10 to-transparent shadow-[0_10px_30px_-5px_rgba(255,79,90,0.15)] animate-[highlightPulse_2s_ease-in-out_3]" 
                          : "border-border"
                      )}
                    >
                      {String(highlightId) === String(s.id) && <div className="absolute -top-3 right-5 bg-[#FF4F5A] text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg z-20 animate-bounce">{t("dashboard.new") || "NOUVEAU"}</div>}
                      <div className="w-full md:w-40 h-28 rounded-2xl overflow-hidden flex-shrink-0 cursor-pointer" onClick={() => navigate(`/item/${s.item_id}`)}>
                        <ImageWithFallback src={s.item?.thumbnail_url} alt={s.item?.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-lg font-bold text-foreground truncate cursor-pointer hover:text-[#FF4F5A]" onClick={() => navigate(`/item/${s.item_id}`)}>{s.item?.title}</h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                              <UserIcon className="w-3.5 h-3.5 text-[#FF4F5A]" />
                              <span className="font-medium">{s.buyer?.full_name || "Acheteur"}</span>
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            s.status === 'pending' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                            s.status === 'accepted' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                            s.status === 'completed' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                            'bg-red-100 text-red-700 border border-red-200'
                          }`}>
                            {s.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>Vente directe</span>
                          </div>
                          <div className="font-black text-[#FF4F5A] text-sm">
                            {Number(s.price).toLocaleString()} {t("common.da")}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full md:w-auto">
                        {s.status === 'pending' && (
                          <>
                            <Button size="sm" onClick={() => handleUpdateSaleStatus(s.id, 'accepted')} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex-1 md:flex-none">{t("dashboard.accept")}</Button>
                            <Button size="sm" onClick={() => handleUpdateSaleStatus(s.id, 'rejected')} variant="outline" className="text-red-500 border-red-200 hover:bg-red-50 rounded-xl flex-1 md:flex-none">Refuser</Button>
                          </>
                        )}
                        <Button size="sm" variant="ghost" className="rounded-xl" onClick={() => navigate(`/item/${s.item_id}`)}><Eye className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  ))}
                  {mySales.length === 0 && (
                    <div className="text-center py-12 bg-muted/20 rounded-3xl border border-dashed border-border">
                      <ShoppingCart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground">Aucune vente pour le moment</p>
                    </div>
                  )}
                </div>
              )}

              {activeView === "troc" && (
                <div className="space-y-4">
                  {trocProposals.map(p => (
                    <div
                      key={p.id}
                      id={`highlight-${p.id}`}
                      className={cn(
                        "p-5 bg-card border rounded-3xl flex flex-col md:flex-row gap-6 items-center hover:shadow-lg transition-all group relative",
                        String(highlightId) === String(p.id) 
                          ? "z-10 border-l-4 border-l-[#FF4F5A] bg-gradient-to-r from-[#FF4F5A]/10 to-transparent shadow-[0_10px_30px_-5px_rgba(255,79,90,0.15)] animate-[highlightPulse_2s_ease-in-out_3]" 
                          : "border-border"
                      )}
                    >
                      {String(highlightId) === String(p.id) && <div className="absolute -top-3 right-5 bg-[#FF4F5A] text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg z-20 animate-bounce">{t("dashboard.new") || "NOUVEAU"}</div>}
                      <div className="w-full md:w-40 h-28 rounded-2xl overflow-hidden flex-shrink-0 cursor-pointer" onClick={() => navigate(`/item/${p.requested_item_id}`)}>
                        <ImageWithFallback src={p.requested_item?.thumbnail_url} alt={p.requested_item?.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-lg font-bold text-foreground truncate cursor-pointer hover:text-[#FF4F5A]" onClick={() => navigate(`/item/${p.requested_item_id}`)}>{p.requested_item?.title}</h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                              <UserIcon className="w-3.5 h-3.5 text-[#FF4F5A]" />
                              <span className="font-medium">{p.proposer?.full_name || "Client"}</span>
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            p.status === 'pending' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                            p.status === 'accepted' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                            p.status === 'completed' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                            'bg-red-100 text-red-700 border border-red-200'
                          }`}>
                            {p.status}
                          </span>
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2 p-2.5 bg-muted/40 rounded-xl border border-border/50 max-w-fit">
                            <RefreshCw className="w-3.5 h-3.5 text-[#FF4F5A] rotate-45" />
                            <p className="text-[11px] font-bold text-foreground">
                              {t("dashboard.offeredItem")}: <span className="text-muted-foreground font-medium">{p.offered_item?.title || p.offered_item_data?.title || "Objet personnel"}</span>
                            </p>
                          </div>
                          {p.cash_complement > 0 && (
                            <p className="text-[11px] font-bold text-emerald-600">
                              + {Number(p.cash_complement).toLocaleString()} {t("common.da")} ({p.complement_payer === 'proposer' ? 'Complément client' : 'Complément vendeur'})
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 w-full md:w-auto">
                        {p.status === 'pending' && (
                          <>
                            <Button size="sm" onClick={() => handleUpdateTrocStatus(p.id, 'accepted')} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex-1 md:flex-none">{t("dashboard.accept")}</Button>
                            <Button size="sm" onClick={() => handleUpdateTrocStatus(p.id, 'rejected')} variant="outline" className="text-red-500 border-red-200 hover:bg-red-50 rounded-xl flex-1 md:flex-none">Refuser</Button>
                          </>
                        )}
                        <Button size="sm" variant="ghost" className="rounded-xl" onClick={() => navigate(`/item/${p.requested_item_id}`)}><Eye className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  ))}
                  {trocProposals.length === 0 && (
                    <div className="text-center py-12 bg-muted/20 rounded-3xl border border-dashed border-border">
                      <RefreshCw className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground">Aucune proposition de troc pour le moment</p>
                    </div>
                  )}
                </div>
              )}

              {activeView === "reviews" && (
                <div className="grid md:grid-cols-2 gap-6">
                  {reviews.map(r => (
                    <div key={r.id} className="bg-card p-6 rounded-3xl border border-border">
                      <div className="flex justify-between mb-4">
                        <p className="font-bold text-sm">{r.reviewer?.full_name}</p>
                        <div className="flex gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /> <span>{r.rating}</span></div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{r.item?.title}</p>
                      <p className="text-sm italic">"{r.comment}"</p>
                    </div>
                  ))}
                </div>
              )}

              {activeView === "earnings" && (
                <div className="space-y-6">
                  <div className="bg-card rounded-2xl p-7 border border-border">
                    <h3 className="text-xl font-bold mb-4">{t("lender.earnings") !== "lender.earnings" ? t("lender.earnings") : "Gains Détaillés"}</h3>
                    <p className="text-4xl font-black text-emerald-500 mb-6">{stats.totalEarnings.toLocaleString()} {t("common.da")}</p>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.earningsData}>
                          <defs>
                            <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                          <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}`} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px' }}
                            itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                          />
                          <Area type="monotone" dataKey="earnings" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorEarnings)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {activeView === "messages" && (
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
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={confirmConfig.isOpen} onOpenChange={(o) => setConfirmConfig(p => ({ ...p, isOpen: o }))}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader><AlertDialogTitle>{confirmConfig.title}</AlertDialogTitle><AlertDialogDescription>{confirmConfig.description}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel><AlertDialogAction onClick={confirmConfig.onConfirm} className={confirmConfig.variant === "destructive" ? "bg-red-500" : ""}>{t("dashboard.confirm")}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={promptConfig.isOpen} onOpenChange={(o) => setPromptConfig(p => ({ ...p, isOpen: o }))}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader><AlertDialogTitle>{promptConfig.title}</AlertDialogTitle><AlertDialogDescription>{promptConfig.description}</AlertDialogDescription></AlertDialogHeader>
          <div className="py-4"><Input value={promptConfig.value} onChange={(e) => setPromptConfig(p => ({ ...p, value: e.target.value }))} className="rounded-xl" /></div>
          <AlertDialogFooter><AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel><AlertDialogAction onClick={() => promptConfig.onConfirm(promptConfig.value)}>{t("dashboard.confirm")}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
