import { Navigation } from "../components/layout/navigation";
import { motion } from "motion/react";
import { Plus, Package, Calendar, TrendingUp, DollarSign, Edit2, Trash2, Eye, BarChart3, CheckCircle, XCircle, MapPin, Star, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { useAuthStore } from "../store/auth.store";
import { usersService, bookingsService, itemsService, salesService, trocService, statsService } from "../services/api.service";
import { supabase } from "../lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";
import { ShoppingCart, RefreshCw } from "lucide-react";
import { DashboardSidebar } from "../components/dashboard/dashboard-sidebar";
import { cn } from "../components/ui/utils";
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

const sidebarItems = [
  { id: 'overview', icon: BarChart3, label: "Vue d'ensemble" },
  { id: 'listings', icon: Package, label: "Mes annonces" },
  { id: 'bookings', icon: Calendar, label: "Locations" },
  { id: 'sales', icon: ShoppingCart, label: "Ventes" },
  { id: 'troc', icon: RefreshCw, label: "Troc" },
  { id: 'earnings', icon: DollarSign, label: "Revenus" },
  { id: 'reviews', icon: Star, label: "Avis" },
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
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeView, setActiveView] = useState<"overview" | "listings" | "bookings" | "sales" | "troc" | "earnings" | "reviews">("overview");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      .eq("items.owner_id", user.id)
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

  const handleDeleteItem = (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: "Supprimer cette annonce ?",
      description: "Cette action est irréversible.",
      actionLabel: "Supprimer",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await itemsService.delete(id);
          setMyListings(prev => prev.filter(i => i.id !== id));
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
    } catch(err) { console.error(err); }
  };

  const handleUpdateSaleStatus = async (id: string, status: string) => {
    if (status === 'accepted') {
      setPromptConfig({
        isOpen: true,
        title: "Détails de livraison",
        description: "Lieu de RDV, mode d'envoi, etc. :",
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
    await salesService.updateStatus(id, status);
    setMySales(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  const handleUpdateBookingStatus = async (id: string, status: string) => {
    await bookingsService.updateStatus(id, status);
    setUpcomingBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="py-8 lg:py-12">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-5">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-px flex-1 max-w-[40px] bg-gradient-to-r from-[#FF4F5A] to-transparent" />
                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[#FF4F5A]">Espace Propriétaire</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-foreground mb-2 leading-tight">Mon <span className="gradient-text">Centre</span></h1>
              <p className="text-base text-muted-foreground max-w-xl">Gérez votre inventaire et vos transactions.</p>
            </div>
            <Button onClick={() => navigate("/create")} className="bg-[#FF4F5A] text-white px-7 h-11 rounded-xl font-bold text-sm shadow-lg shadow-[#FF4F5A]/20">
              <Plus className="w-4 h-4 mr-2" /> Publier une annonce
            </Button>
          </motion.div>

          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
            <DashboardSidebar
              items={sidebarItems}
              activeTab={activeView}
              setActiveTab={(id) => {
                setActiveView(id);
                setIsMobileMenuOpen(false);
              }}
              userInitials={user?.user_metadata?.full_name?.charAt(0) || "U"}
              userFullName={user?.user_metadata?.full_name || "Utilisateur"}
              userEmail={user?.email || ""}
              isMobileMenuOpen={isMobileMenuOpen}
              setIsMobileMenuOpen={setIsMobileMenuOpen}
              extraAction={{ label: "Mode client", onClick: () => navigate('/dashboard'), variant: "default" }}
            />

            <div className="lg:col-span-9">
              {activeView === "overview" && (
                <div className="space-y-8">
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {[
                      { label: "Chiffre d'Affaire", value: `${stats.totalEarnings.toLocaleString()} DA`, icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                      { label: "Annonces", value: stats.activeListings, icon: Package, color: "text-[#FF4F5A]", bg: "bg-[#FF4F5A]/10" },
                      { label: "Réservations", value: stats.totalBookings, icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10" },
                      { label: "Satisfaction", value: stats.averageRating ? stats.averageRating.toFixed(1) : "N/A", icon: Star, color: "text-amber-500", bg: "bg-amber-500/10" }
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
                </div>
              )}

              {activeView === "listings" && (
                <div className="space-y-4">
                  {myListings.map(item => (
                    <div key={item.id} className="flex gap-6 p-6 bg-card border border-border rounded-3xl">
                      <div className="w-32 h-32 rounded-2xl overflow-hidden"><img src={item.thumbnail_url} className="w-full h-full object-cover" /></div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold">{item.title}</h3>
                        <p className="text-[#FF4F5A] font-bold">{item.price_per_day} DA/j</p>
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" variant="outline" onClick={() => navigate(`/edit-item/${item.id}`)}>Modifier</Button>
                          <Button size="sm" variant="outline" className="text-red-500" onClick={() => handleDeleteItem(item.id)}>Supprimer</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeView === "bookings" && (
                <div className="space-y-4">
                  {upcomingBookings.map(b => (
                    <div key={b.id} className="p-6 bg-muted/50 rounded-3xl flex justify-between items-center">
                      <div>
                        <p className="font-bold">{b.renter?.full_name}</p>
                        <p className="text-sm">{b.items?.title}</p>
                        <p className="text-xs text-muted-foreground">{new Date(b.start_date).toLocaleDateString()} - {new Date(b.end_date).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2">
                        {b.status === 'pending' && <Button size="sm" onClick={() => handleUpdateBookingStatus(b.id, 'confirmed')}>Accepter</Button>}
                        <span className="text-xs font-bold uppercase p-2 bg-card rounded-lg">{b.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeView === "sales" && (
                <div className="space-y-4">
                  {mySales.map(s => (
                    <div key={s.id} className="p-6 bg-muted/50 rounded-3xl flex justify-between items-center">
                      <div><p className="font-bold">{s.buyer?.full_name}</p><p className="text-sm">{s.items?.title}</p></div>
                      <div>
                        {s.status === 'pending' && <Button size="sm" onClick={() => handleUpdateSaleStatus(s.id, 'accepted')}>Accepter</Button>}
                        <span className="ml-2 text-xs font-bold uppercase">{s.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeView === "troc" && (
                <div className="space-y-4">
                  {trocProposals.map(p => (
                    <div key={p.id} className="p-6 bg-muted/50 rounded-3xl">
                      <p className="font-bold">{p.proposer?.full_name} propose un troc</p>
                      <p className="text-sm">Pour : {p.requested_item?.title}</p>
                      <div className="mt-4 flex gap-2">
                        {p.status === 'pending' && <Button size="sm" onClick={() => handleUpdateTrocStatus(p.id, 'accepted')}>Accepter</Button>}
                        <span className="text-xs font-bold uppercase p-2 bg-card rounded-lg">{p.status}</span>
                      </div>
                    </div>
                  ))}
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
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={confirmConfig.isOpen} onOpenChange={(o) => setConfirmConfig(p => ({ ...p, isOpen: o }))}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader><AlertDialogTitle>{confirmConfig.title}</AlertDialogTitle><AlertDialogDescription>{confirmConfig.description}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={confirmConfig.onConfirm} className={confirmConfig.variant === "destructive" ? "bg-red-500" : ""}>Confirmer</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={promptConfig.isOpen} onOpenChange={(o) => setPromptConfig(p => ({ ...p, isOpen: o }))}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader><AlertDialogTitle>{promptConfig.title}</AlertDialogTitle><AlertDialogDescription>{promptConfig.description}</AlertDialogDescription></AlertDialogHeader>
          <div className="py-4"><Input value={promptConfig.value} onChange={(e) => setPromptConfig(p => ({ ...p, value: e.target.value }))} className="rounded-xl" /></div>
          <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={() => promptConfig.onConfirm(promptConfig.value)}>Confirmer</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
