import { Navigation } from "../components/layout/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Package, Heart, MessageSquare, Settings, Calendar, MapPin, Star, Clock, ChevronRight, Camera, Loader2, Check, User as UserIcon, DollarSign, Menu, X, BarChart3 } from "lucide-react";
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
import { ShoppingCart, RefreshCw } from "lucide-react";
import { DashboardSidebar } from "../components/dashboard/dashboard-sidebar";

// Wilayas d'Algérie
const WILAYAS = [
  { code: 1, name: "Adrar" }, { code: 2, name: "Chlef" }, { code: 3, name: "Laghouat" },
  { code: 4, name: "Oum El Bouaghi" }, { code: 5, name: "Batna" }, { code: 6, name: "Béjaïa" },
  { code: 7, name: "Biskra" }, { code: 8, name: "Béchar" }, { code: 9, name: "Blida" },
  { code: 10, name: "Bouira" }, { code: 11, name: "Tamanrasset" }, { code: 12, name: "Tébessa" },
  { code: 13, name: "Tlemcen" }, { code: 14, name: "Tiaret" }, { code: 15, name: "Tizi Ouzou" },
  { code: 16, name: "Alger" }, { code: 17, name: "Djelfa" }, { code: 18, name: "Jijel" },
  { code: 19, name: "Sétif" }, { code: 20, name: "Saïda" }, { code: 21, name: "Skikda" },
  { code: 22, name: "Sidi Bel Abbès" }, { code: 23, name: "Annaba" }, { code: 24, name: "Guelma" },
  { code: 25, name: "Constantine" }, { code: 26, name: "Médéa" }, { code: 27, name: "Mostaganem" },
  { code: 28, name: "M'Sila" }, { code: 29, name: "Mascara" }, { code: 30, name: "Ouargla" },
  { code: 31, name: "Oran" }, { code: 32, name: "El Bayadh" }, { code: 33, name: "Illizi" },
  { code: 34, name: "Bordj Bou Arréridj" }, { code: 35, name: "Boumerdès" },
  { code: 36, name: "El Tarf" }, { code: 37, name: "Tindouf" }, { code: 38, name: "Tissemsilt" },
  { code: 39, name: "El Oued" }, { code: 40, name: "Khenchela" }, { code: 41, name: "Souk Ahras" },
  { code: 42, name: "Tipaza" }, { code: 43, name: "Mila" }, { code: 44, name: "Aïn Defla" },
  { code: 45, name: "Naâma" }, { code: 46, name: "Aïn Témouchent" }, { code: 47, name: "Ghardaïa" },
  { code: 48, name: "Relizane" }, { code: 49, name: "El M'Ghair" }, { code: 50, name: "El Meniaa" },
  { code: 51, name: "Ouled Djellal" }, { code: 52, name: "Bordj Badji Mokhtar" },
  { code: 53, name: "Béni Abbès" }, { code: 54, name: "Timimoun" }, { code: 55, name: "Touggourt" },
  { code: 56, name: "Djanet" }, { code: 57, name: "In Salah" }, { code: 58, name: "In Guezzam" },
];

interface Profile {
  full_name: string;
  email: string;
  phone: string;
  bio: string;
  location: string;
  wilaya_code: number | null;
  avatar_url: string;
}

const sidebarItems = [
  { icon: BarChart3, label: "Vue d'ensemble" },
  { icon: Package, label: "Locations actives" },
  { icon: ShoppingCart, label: "Mes achats" },
  { icon: RefreshCw, label: "Mes échanges" },
  { icon: Calendar, label: "Historique" },
  { icon: Heart, label: "Favoris" },
  { icon: MessageSquare, label: "Messages" },
  { icon: Settings, label: "Mon profil" },
];

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

const BOOKING_STATUS: Record<string, { label: string; color: string }> = {
  pending: { label: "En attente", color: "bg-amber-100 text-amber-700" },
  confirmed: { label: "Confirmée", color: "bg-blue-100 text-blue-700" },
  active: { label: "Active", color: "bg-green-100 text-green-700" },
  completed: { label: "Terminée", color: "bg-muted text-foreground/80" },
  cancelled: { label: "Annulée", color: "bg-red-100 text-red-700" },
  rejected: { label: "Refusée", color: "bg-red-100 text-red-700" },
};

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
  content: string;
  type: 'booking' | 'sale' | 'troc' | 'message' | 'system';
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export function UserDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState(location.state?.tab || "Vue d'ensemble");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle incoming routing state
  useEffect(() => {
    if (location.state?.tab) setActiveTab(location.state.tab);
    if (location.state?.convId && location.state?.tab === "Messages") {
      // Need a slight timeout in case conversations haven't loaded yet? No, just set the ID, the fetch will subscribe.
      setActiveConversationId(location.state.convId);
    }
  }, [location.state]);

  // Profile state
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

  // Bookings state
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [historyBookings, setHistoryBookings] = useState<Booking[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [mySales, setMySales] = useState<any[]>([]);
  const [myTroc, setMyTroc] = useState<any[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [bookingTab, setBookingTab] = useState<"renter" | "owner">("renter");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch bookings and subscribe to Realtime
  useEffect(() => {
    let channel: RealtimeChannel;

    const fetchBookings = async () => {
      if (!user) return;
      setIsLoadingBookings(true);

      try {
        const { data } = await bookingsService.getMyBookings({ role: bookingTab });
        setBookings(data || []);

        // Subscribe to changes
        channel = supabase
          .channel(`bookings:${user.id}`)
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "bookings", filter: `${bookingTab === 'renter' ? 'renter_id' : 'owner_id'}=eq.${user.id}` },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                // For new bookings, we might need to fetch the item details, easiest is to just re-fetch the list
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

    // Fetch My Sales
    const fetchSales = async () => {
      const res = await salesService.getMySales({ role: 'buyer' });
      setMySales(res.data || []);
    };

    // Fetch My Troc
    const fetchTroc = async () => {
      const res = await trocService.getMyProposals({ role: 'proposer' });
      setMyTroc(res.data || []);
    };

    // Fetch Favorites
    const fetchFavorites = async () => {
      if (!user) return;
      try {
        const res = await supabase.from("favorites").select("*, item:items(*)").eq("user_id", user.id).order("created_at", { ascending: false });
        setFavorites(res.data || []);
      } catch (err) { console.error(err); }
    };
    
    // Fetch History
    const fetchHistory = async () => {
       try {
         const res = await api.get('/bookings');
         // Filter history on client side for all roles
         setHistoryBookings((res.data.data || []).filter((b: any) => ["completed", "cancelled", "rejected"].includes(b.status)));
       } catch (err) { console.error(err); }
    }

    // Fetch Notifications
    const fetchNotifications = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      setNotifications(data || []);
      
      // Count unread messages (placeholder logic, should check messages table)
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
       // Realtime for Notifications
       const notifChannel = supabase
         .channel(`user_notifs:${user.id}`)
         .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, () => fetchNotifications())
         .subscribe();

       // Realtime for Sales
       const salesChannel = supabase
         .channel(`user_sales:${user.id}`)
         .on("postgres_changes", { event: "*", schema: "public", table: "sales", filter: `buyer_id=eq.${user.id}` }, () => fetchSales())
         .subscribe();
  
       // Realtime for Troc
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
  }, [user, bookingTab]);

  // Handle booking action (confirm/reject/cancel)
  const handleBookingAction = async (bookingId: string, newStatus: string) => {
    try {
      await bookingsService.updateStatus(bookingId, newStatus);
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
    } catch (err) {
      alert("Erreur lors de la mise à jour de la demande.");
    }
  };

  // Messaging state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(location.state?.convId || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoadingMsgs, setIsLoadingMsgs] = useState(false);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      if (!user || activeTab !== "Messages") return;

      const { data } = await supabase
        .from("conversations")
        .select("*, items(title, thumbnail_url), p1:profiles!participant_1(id, full_name, avatar_url), p2:profiles!participant_2(id, full_name, avatar_url)")
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .order("last_message_at", { ascending: false });

      if (data) {
        // Format to easily extract "other_user" details
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
  }, [user, activeTab]);

  // Fetch messages and subscribe to Realtime
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

      // Setup realtime subscription
      channel = supabase
        .channel(`messages:${activeConversationId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${activeConversationId}` },
          (payload) => {
            const newMsg = payload.new as Message;
            setMessages((prev) => [...prev, newMsg]);

            // Mark conversation as recently updated
            setConversations(prev => {
              const convs = [...prev];
              const idx = convs.findIndex(c => c.id === activeConversationId);
              if (idx > -1) {
                convs[idx].last_message_preview = newMsg.content;
                convs[idx].last_message_at = newMsg.created_at;
                // Move to top
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
  }, [user, activeConversationId]);

  // Send message
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

    // Update conversation last message (best effort)
    await supabase
      .from("conversations")
      .update({ last_message_preview: content, last_message_at: new Date().toISOString() })
      .eq("id", activeConversationId);
  };

  // Profile data fetch
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
  }, [user]);

  // Save profile
  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    setProfileError("");
    setSaveSuccess(false);

    const wilaya = WILAYAS.find(w => w.code === profile.wilaya_code);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        phone: profile.phone,
        bio: profile.bio,
        location: wilaya ? `${wilaya.name}, ${wilaya.code}` : profile.location,
        wilaya_code: profile.wilaya_code,
      })
      .eq("id", user.id);

    if (error) {
      setProfileError("Erreur lors de la sauvegarde. Réessayez.");
    } else {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
    setIsSaving(false);
  };

  // Avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setProfileError("Erreur lors de l'upload de l'avatar.");
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
            className="mb-6 lg:mb-10"
          >
            <h1 className="text-4xl lg:text-6xl font-black text-foreground mb-3 leading-tight tracking-tight">
              Mon <span className="text-[#FF4F5A]">Compte</span>
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground font-medium max-w-2xl">
              Gérez vos locations, suivez vos échanges et personnalisez votre expérience Karrily.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Sidebar */}
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
              extraAction={{
                label: "Devenir loueur",
                onClick: () => navigate('/lender'),
                variant: "premium"
              }}
            />

            {/* Main Content */}
            <div className="lg:col-span-9 min-h-[60vh]">
              {/* ─── Vue d'ensemble ─── */}
              {activeTab === "Vue d'ensemble" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-card rounded-3xl p-5 shadow-lg border border-border relative overflow-hidden group">
                       <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                          <Package className="w-12 h-12 text-[#FF4F5A]" />
                       </div>
                       <p className="text-[11px] font-medium text-muted-foreground mb-1 leading-none">Locations</p>
                       <h3 className="text-xl font-bold leading-none">{bookings.filter(b => b.status === 'active').length}</h3>
                       <p className="text-[10px] text-muted-foreground mt-2">En cours actuellement</p>
                    </div>
                    <div className="bg-card rounded-3xl p-5 shadow-lg border border-border relative overflow-hidden group">
                       <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                          <MessageSquare className="w-12 h-12 text-[#FF4F5A]" />
                       </div>
                       <p className="text-[11px] font-medium text-muted-foreground mb-1 leading-none">Messages</p>
                       <h3 className="text-xl font-bold leading-none">{unreadCount}</h3>
                       <p className="text-[10px] text-muted-foreground mt-2">Non lus</p>
                    </div>
                    <div className="bg-card rounded-3xl p-5 shadow-lg border border-border relative overflow-hidden group">
                       <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                          <Heart className="w-12 h-12 text-[#FF4F5A]" />
                       </div>
                       <p className="text-[11px] font-medium text-muted-foreground mb-1 leading-none">Favoris</p>
                       <h3 className="text-xl font-bold leading-none">{favorites.length}</h3>
                       <p className="text-[10px] text-muted-foreground mt-2">Objets épinglés</p>
                    </div>
                  </div>

                  <div className="bg-card rounded-[2.5rem] p-10 shadow-xl border border-border">
                    <div className="flex items-center justify-between mb-8">
                       <h2 className="text-2xl font-black">Activité <span className="text-[#FF4F5A]">récente</span></h2>
                       <Button variant="ghost" className="text-xs uppercase font-black tracking-widest" onClick={() => setActiveTab("Messages")}>Voir tout</Button>
                    </div>
                    
                    <div className="space-y-6">
                      {notifications.length === 0 ? (
                        <div className="py-12 text-center">
                           <Clock className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                           <p className="text-muted-foreground">Aucune activité récente pour le moment.</p>
                        </div>
                      ) : (
                        notifications.slice(0, 5).map((notif) => (
                           <div key={notif.id} className="flex gap-6 items-start p-4 hover:bg-muted/50 rounded-2xl transition-colors border border-transparent hover:border-border">
                              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center flex-shrink-0">
                                 {notif.type === 'booking' ? <Calendar className="w-6 h-6 text-[#FF4F5A]" /> : 
                                  notif.type === 'message' ? <MessageSquare className="w-6 h-6 text-[#FF4F5A]" /> :
                                  <Package className="w-6 h-6 text-[#FF4F5A]" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                 <h4 className="font-bold text-foreground text-base mb-1">{notif.title}</h4>
                                 <p className="text-sm text-muted-foreground line-clamp-1">{notif.content}</p>
                                 <p className="text-[10px] uppercase font-black tracking-tighter text-muted-foreground/50 mt-2">Il y a quelques instants</p>
                              </div>
                              <Button size="sm" variant="outline" className="rounded-full h-8 px-4 text-[10px] font-black uppercase" onClick={() => navigate(notif.link || '/dashboard')}>Gérer</Button>
                           </div>
                        ))
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ─── Locations Actives ─── */}
              {activeTab === "Locations actives" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {/* Renter / Owner toggle */}
                  <div className="flex gap-2 mb-6">
                    <button
                      onClick={() => setBookingTab("renter")}
                      className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${bookingTab === "renter" ? "bg-[#0F2A2E] text-white" : "bg-card text-muted-foreground hover:bg-muted"
                        }`}
                    >
                      Mes réservations
                    </button>
                    <button
                      onClick={() => setBookingTab("owner")}
                      className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${bookingTab === "owner" ? "bg-[#0F2A2E] text-white" : "bg-card text-muted-foreground hover:bg-muted"
                        }`}
                    >
                      Demandes reçues
                    </button>
                  </div>

                  {/* Stats */}
                  <div className="grid md:grid-cols-3 gap-6 mb-8">
                    {[
                      { label: "En attente", value: bookings.filter(b => b.status === "pending").length, icon: Clock, color: "#f59e0b" },
                      { label: "Actives", value: bookings.filter(b => ["confirmed", "active"].includes(b.status)).length, icon: Package, color: "#FF4F5A" },
                      { label: "Terminées", value: bookings.filter(b => ["completed", "cancelled", "rejected"].includes(b.status)).length, icon: Calendar, color: "#0F2A2E" }
                    ].map((stat, index) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-card rounded-3xl p-6 shadow-lg border border-border"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${stat.color}15` }}>
                            <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                          </div>
                        </div>
                        <div className="text-4xl font-bold text-foreground mb-1">{stat.value}</div>
                        <div className="text-muted-foreground">{stat.label}</div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Bookings List */}
                  <div className="bg-card rounded-3xl p-8 shadow-lg border border-border">
                    <h2 className="text-2xl font-bold text-foreground mb-6">
                      {bookingTab === "renter" ? "Mes réservations" : "Demandes reçues"}
                    </h2>

                    {isLoadingBookings ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-[#FF4F5A]" />
                      </div>
                    ) : bookings.length === 0 ? (
                      <div className="text-center py-12">
                        <Calendar className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                        <p className="text-muted-foreground">Aucune réservation pour le moment</p>
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
                                    {(booking.items as any)?.title || "Annonce"}
                                  </h3>
                                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                    <MapPin className="w-4 h-4" />
                                    {(booking.items as any)?.location || ""}
                                  </p>
                                </div>
                                <span className={`px-4 py-2 rounded-full text-sm font-medium ${BOOKING_STATUS[booking.status]?.color || "bg-muted text-foreground/80"
                                  }`}>
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
                                  {Number(booking.total_price).toLocaleString()} DA
                                </div>
                                {booking.deposit_amount > 0 && (
                                  <span className="text-xs text-muted-foreground">+ {Number(booking.deposit_amount).toLocaleString()} DA caution</span>
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
                                          <Check className="w-4 h-4 mr-1" /> Accepter
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="rounded-full border-red-300 text-red-600 hover:bg-red-50"
                                          onClick={() => handleBookingAction(booking.id, "rejected")}
                                        >
                                          Refuser
                                        </Button>
                                      </>
                                    )}
                                    {booking.status === "confirmed" && new Date() >= new Date(booking.start_date) && (
                                      <Button
                                        size="sm"
                                        className="bg-[#0F2A2E] hover:bg-[#1A4851] text-white rounded-full"
                                        onClick={() => handleBookingAction(booking.id, "active")}
                                      >
                                        <Package className="w-4 h-4 mr-1" /> Confirmer la remise
                                      </Button>
                                    )}
                                    {booking.status === "active" && (
                                      <Button
                                        size="sm"
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full"
                                        onClick={() => handleBookingAction(booking.id, "completed")}
                                      >
                                        <Check className="w-4 h-4 mr-1" /> Confirmer le retour
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
                                    Annuler la demande
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="rounded-full"
                                  onClick={() => navigate(`/item/${booking.item_id}`)}
                                >
                                  Voir l'annonce
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ─── Mes Achats ─── */}
              {activeTab === "Mes achats" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="bg-card rounded-3xl p-8 shadow-lg border border-border">
                    <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                       <ShoppingCart className="w-6 h-6" /> Mes demandes d'achat
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
                              <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase ${
                                sale.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                sale.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                                sale.status === 'completed' ? 'bg-green-100 text-green-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {sale.status === 'pending' ? 'En attente' : 
                                 sale.status === 'accepted' ? 'Acceptée' : 
                                 sale.status === 'completed' ? 'Terminée' :
                                 sale.status === 'rejected' ? 'Refusée' : 'Annulée'}
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
                                    Instructions de livraison du vendeur :
                                  </p>
                                </div>
                                <div className="bg-white/50 p-3 rounded-xl border border-blue-100 text-sm text-blue-800">
                                  {sale.delivery_info || "Contactez le vendeur pour organiser la livraison."}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {mySales.length === 0 && (
                        <div className="text-center py-12">
                          <ShoppingCart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                          <p className="text-muted-foreground">Aucune demande d'achat en cours.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ─── Mes Échanges ─── */}
              {activeTab === "Mes échanges" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="bg-card rounded-3xl p-8 shadow-lg border border-border">
                    <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                       <RefreshCw className="w-6 h-6" /> Mes propositions de troc
                    </h2>
                    
                    <div className="space-y-4">
                      {myTroc.map((proposal) => (
                        <div key={proposal.id} className="p-6 bg-muted/50 rounded-3xl border border-border">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                               <p className="text-xs font-bold text-muted-foreground/70 uppercase mb-1">Objet souhaité</p>
                               <h3 className="text-lg font-bold text-foreground cursor-pointer hover:text-[#FF4F5A]" onClick={() => navigate(`/item/${proposal.requested_item_id}`)}>{proposal.requested_item?.title}</h3>
                            </div>
                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase ${
                                proposal.status === 'pending' ? 'bg-purple-100 text-purple-700' :
                                proposal.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                                proposal.status === 'completed' ? 'bg-green-100 text-green-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {proposal.status === 'pending' ? 'Envoyée' : 
                                 proposal.status === 'accepted' ? 'Acceptée' : 
                                 proposal.status === 'completed' ? 'Finalisé' :
                                 proposal.status === 'rejected' ? 'Refusée' : 'Annulée'}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border">
                             <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                                <RefreshCw className="w-5 h-5 rotate-45" />
                             </div>
                             <div>
                                <p className="text-xs font-bold text-purple-600 uppercase">Votre proposition :</p>
                                <p className="font-bold text-foreground">
                                  {proposal.offered_item ? proposal.offered_item.title : (proposal.offered_item_data?.title || "Objet personnel")}
                                </p>
                             </div>
                          </div>
                        </div>
                      ))}
                      {myTroc.length === 0 && (
                        <div className="text-center py-12">
                          <RefreshCw className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                          <p className="text-muted-foreground">Aucune proposition d'échange envoyée.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ─── Favoris ─── */}
              {activeTab === "Favoris" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-3xl p-8 shadow-lg border border-border"
                >
                  <h2 className="text-2xl font-bold text-foreground mb-6">Mes favoris</h2>
                  
                  {favorites.length === 0 ? (
                    <div className="text-center py-16 rounded-[2rem] bg-gradient-to-b from-muted to-transparent border border-dashed border-border/60">
                      <Heart className="w-16 h-16 text-[#FF4F5A]/40 mx-auto mb-4 animate-pulse" />
                      <p className="text-muted-foreground mb-2 text-lg font-semibold">Aucun favori pour le moment</p>
                      <p className="text-sm text-muted-foreground/70 max-w-sm mx-auto">Explorez les annonces et cliquez sur le cœur pour les garder à portée de clic !</p>
                      <Button
                        onClick={() => navigate('/explore')}
                        className="mt-6 bg-[#FF4F5A] hover:bg-[#FF4F5A]/90 text-white rounded-full font-bold px-8 shadow-lg shadow-[#FF4F5A]/20 transition-all hover:scale-105"
                      >
                        Explorer les annonces
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
                                      <span className="truncate max-w-[120px]">{fav.item?.location || "Non spécifié"}</span>
                                   </p>
                                </div>
                                <div className="flex items-end justify-between mt-3">
                                   <p className="font-black text-lg text-foreground tracking-tight">
                                      {fav.item?.price_per_day} DA <span className="text-xs font-bold text-muted-foreground tracking-normal">/j</span>
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
              {activeTab === "Messages" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-3xl shadow-lg border border-border overflow-hidden h-[600px] flex"
                >
                  {/* Left Column: Conversations List */}
                  <div className="w-1/3 border-r border-border flex flex-col h-full bg-gray-50/50">
                    <div className="p-6 border-b border-border bg-white">
                      <h2 className="text-xl font-bold text-foreground">Messages</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      {conversations.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground text-sm">
                          Aucune conversation pour le moment.
                        </div>
                      ) : (
                        conversations.map((conv) => (
                          <div
                            key={conv.id}
                            onClick={() => setActiveConversationId(conv.id)}
                            className={`p-4 border-b border-border cursor-pointer transition-colors ${activeConversationId === conv.id ? "bg-[#FF4F5A]/5 border-l-4 border-l-[#FF4F5A]" : "hover:bg-white"
                              }`}
                          >
                            <div className="flex gap-3 items-center">
                              <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
                                {conv.other_user?.avatar_url ? (
                                  <img src={conv.other_user.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full bg-[#0F2A2E] text-white flex items-center justify-center font-bold">
                                    {conv.other_user?.full_name?.charAt(0) || "U"}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                  <h4 className="font-bold text-foreground truncate">{conv.other_user?.full_name}</h4>
                                  <span className="text-xs text-muted-foreground/70">
                                    {new Date(conv.last_message_at).toLocaleDateString("fr-FR", { day: '2-digit', month: '2-digit' })}
                                  </span>
                                </div>
                                <p className="text-xs font-semibold text-[#FF4F5A] truncate mb-0.5">
                                  {conv.items?.title || "Annonce supprimée"}
                                </p>
                                <p className="text-sm text-muted-foreground truncate">
                                  {conv.last_message_preview || "Nouvelle conversation"}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Right Column: Active Chat */}
                  <div className="flex-1 flex flex-col h-full bg-card relative">
                    {!activeConversationId ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground/70">
                        <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
                        <p>Sélectionnez une conversation</p>
                      </div>
                    ) : (
                      <>
                        {/* Chat Header */}
                        {(() => {
                          const conv = conversations.find(c => c.id === activeConversationId);
                          return conv ? (
                            <div className="p-4 border-b border-border flex items-center gap-4 bg-card shadow-sm z-10">
                              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                                {conv.other_user?.avatar_url ? (
                                  <img src={conv.other_user.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full bg-[#0F2A2E] text-white flex items-center justify-center font-bold">
                                    {conv.other_user?.full_name?.charAt(0) || "U"}
                                  </div>
                                )}
                              </div>
                              <div>
                                <h3 className="font-bold text-foreground">{conv.other_user?.full_name}</h3>
                                <p className="text-xs text-muted-foreground cursor-pointer hover:text-[#FF4F5A]" onClick={() => conv.item_id && navigate(`/item/${conv.item_id}`)}>
                                  Lié à : <span className="underline">{conv.items?.title}</span>
                                </p>
                              </div>
                            </div>
                          ) : null;
                        })()}

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30 flex flex-col">
                          {isLoadingMsgs ? (
                            <div className="flex justify-center my-auto"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground/70" /></div>
                          ) : (
                            // Render messages exactly in order of array (since oldest is first via ascending order)
                            messages.map(msg => {
                              const isMe = msg.sender_id === user?.id;
                              return (
                                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                  <div className={`max-w-[70%] rounded-2xl px-5 py-3 ${isMe ? "bg-[#FF4F5A] text-white rounded-br-sm shadow-sm" : "bg-card border border-border text-foreground rounded-bl-sm shadow-sm"
                                    }`}>
                                    <p className="text-sm" style={{ wordBreak: 'break-word' }}>{msg.content}</p>
                                    <p className={`text-[10px] mt-1 text-right ${isMe ? "text-white/70" : "text-muted-foreground/70"}`}>
                                      {new Date(msg.created_at).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* Chat Input */}
                        <div className="p-4 border-t border-border bg-white">
                          <form onSubmit={handleSendMessage} className="flex gap-2">
                            <Input
                              value={newMessage}
                              onChange={e => setNewMessage(e.target.value)}
                              placeholder="Écrivez votre message..."
                              className="flex-1 rounded-full bg-muted/50 border-border focus-visible:ring-[#FF4F5A]"
                            />
                            <Button
                              type="submit"
                              disabled={!newMessage.trim()}
                              className="w-10 h-10 rounded-full bg-[#0F2A2E] hover:bg-[#1A4851] text-white p-0 flex items-center justify-center"
                            >
                              <ChevronRight className="w-5 h-5 mx-auto" />
                            </Button>
                          </form>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ─── Historique ─── */}
              {activeTab === "Historique" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-3xl p-8 shadow-lg border border-border"
                >
                  <h2 className="text-2xl font-bold text-foreground mb-6">Historique des locations</h2>
                  {historyBookings.length === 0 ? (
                    <div className="text-center py-12">
                      <Clock className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
                      <p className="text-muted-foreground mb-2">Aucune location passée</p>
                      <Button variant="outline" className="mt-4 rounded-full" onClick={() => navigate('/explore')}>Explorer le catalogue</Button>
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
                             <div className="font-bold text-lg">{booking.total_price} DA</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ─── Mon Profil (Settings) ─── */}
              {activeTab === "Mon profil" && (
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
                        <h3 className="text-xl font-black text-foreground truncate px-2">{profile.full_name || "Utilisateur"}</h3>
                        <p className="text-sm text-muted-foreground truncate px-2 mb-4 opacity-70">{profile.email}</p>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-muted rounded-full text-[10px] font-black uppercase tracking-widest text-[#FF4F5A] border border-border">
                           <Check className="w-3 h-3" /> Membre vérifié
                        </div>
                      </div>

                      <div className="bg-card rounded-[2rem] p-8 shadow-lg border border-border">
                         <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4">Statistiques</h4>
                         <div className="space-y-4">
                            <div className="flex justify-between items-center">
                               <span className="text-sm font-bold text-foreground/70">Ancienneté</span>
                               <span className="text-sm font-black">2 ans</span>
                            </div>
                            <div className="flex justify-between items-center">
                               <span className="text-sm font-bold text-foreground/70">Locations</span>
                               <span className="text-sm font-black">14</span>
                            </div>
                            <div className="flex justify-between items-center">
                               <span className="text-sm font-bold text-foreground/70">Note moyenne</span>
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
                             <h2 className="text-2xl font-black">Informations <span className="text-[#FF4F5A]">personnelles</span></h2>
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
                              <CheckCircle className="w-5 h-5 flex-shrink-0" /> Profil mis à jour avec succès !
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
                                     <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Nom complet</label>
                                     <Input
                                       value={profile.full_name}
                                       onChange={(e) => setProfile(p => ({ ...p, full_name: e.target.value }))}
                                       className="h-14 bg-muted/30 border-border rounded-2xl focus:ring-2 focus:ring-[#FF4F5A]/20 transition-all font-bold"
                                       placeholder="Votre nom complet"
                                     />
                                  </div>
                                  <div className="space-y-2">
                                     <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Télephone</label>
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
                                     <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Email <span className="opacity-50">(Lectue seule)</span></label>
                                     <Input value={profile.email} disabled className="h-14 bg-muted border-border rounded-2xl font-bold opacity-60" />
                                  </div>
                                  <div className="space-y-2 font-bold">
                                     <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Wilaya</label>
                                     <select
                                       value={profile.wilaya_code || ""}
                                       onChange={(e) => setProfile(p => ({ ...p, wilaya_code: e.target.value ? Number(e.target.value) : null }))}
                                       className="w-full h-14 px-4 bg-muted/30 border border-border rounded-2xl text-foreground focus:outline-none focus:ring-2 focus:ring-[#FF4F5A]/20 appearance-none font-bold transition-all"
                                     >
                                       <option value="">Sélectionnez votre wilaya</option>
                                       {WILAYAS.map(w => <option key={w.code} value={w.code}>{w.code} - {w.name}</option>)}
                                     </select>
                                  </div>
                               </div>

                               <div className="space-y-2">
                                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Bio</label>
                                  <textarea
                                    value={profile.bio}
                                    onChange={(e) => setProfile(p => ({ ...p, bio: e.target.value }))}
                                    rows={5}
                                    className="w-full px-5 py-4 bg-muted/30 border border-border rounded-[2rem] focus:outline-none focus:ring-2 focus:ring-[#FF4F5A]/20 resize-none font-bold transition-all"
                                    placeholder="Décrivez-vous en quelques mots..."
                                    maxLength={500}
                                  />
                                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mt-2 text-right">
                                    {profile.bio.length} / 500 caractères
                                  </p>
                               </div>

                               <div className="pt-4 border-t border-border flex justify-end">
                                  <Button
                                    onClick={handleSaveProfile}
                                    disabled={isSaving}
                                    className="bg-gradient-to-r from-[#0F2A2E] to-[#1A4851] text-white h-14 px-10 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[#0F2A2E]/20 transition-all hover:-translate-y-1 active:translate-y-0"
                                  >
                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sauvegarder les modifications"}
                                  </Button>
                               </div>
                            </div>
                          )}
                       </div>
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
