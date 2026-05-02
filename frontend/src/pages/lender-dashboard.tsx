import { Navigation } from "../components/layout/navigation";
import { motion } from "motion/react";
import { Plus, Package, Calendar, TrendingUp, DollarSign, Edit2, Trash2, Eye, BarChart3, CheckCircle, XCircle, MapPin, Star, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useState, useEffect, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { useAuthStore } from "../store/auth.store";
import { usersService, bookingsService, itemsService, salesService, trocService, statsService } from "../services/api.service";
import { supabase } from "../lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";
import { ShoppingCart, RefreshCw } from "lucide-react";
import { DashboardSidebar } from "../components/dashboard/dashboard-sidebar";
import { cn } from "../components/ui/utils";
import { useTranslation } from "../context/language-context";
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

const getSidebarItems = (t: any) => [
  { id: 'overview', icon: BarChart3, label: t("lender.overview") },
  { id: 'listings', icon: Package, label: t("lender.myListings") },
  { id: 'bookings', icon: Calendar, label: t("lender.rentals") },
  { id: 'sales', icon: ShoppingCart, label: t("dashboard.sales") },
  { id: 'troc', icon: RefreshCw, label: t("dashboard.trades") },
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
  const { user } = useAuthStore();
  const sidebarItems = getSidebarItems(t);
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
                    <div key={b.id} className="p-6 bg-muted/50 rounded-3xl flex justify-between items-center">
                      <div>
                        <p className="font-bold">{b.renter?.full_name}</p>
                        <p className="text-sm">{b.items?.title}</p>
                        <p className="text-xs text-muted-foreground">{new Date(b.start_date).toLocaleDateString()} - {new Date(b.end_date).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2">
                        {b.status === 'pending' && (
                          <>
                            <Button size="sm" onClick={() => handleUpdateBookingStatus(b.id, 'confirmed')} className="bg-emerald-600 hover:bg-emerald-700">{t("dashboard.accept")}</Button>
                            <Button size="sm" onClick={() => handleUpdateBookingStatus(b.id, 'cancelled')} variant="destructive">Refuser</Button>
                          </>
                        )}
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
                      <div className="flex gap-2 items-center">
                        {s.status === 'pending' && (
                          <>
                            <Button size="sm" onClick={() => handleUpdateSaleStatus(s.id, 'accepted')} className="bg-emerald-600 hover:bg-emerald-700">{t("dashboard.accept")}</Button>
                            <Button size="sm" onClick={() => handleUpdateSaleStatus(s.id, 'rejected')} variant="destructive">Refuser</Button>
                          </>
                        )}
                        <span className="text-xs font-bold uppercase p-2 bg-card rounded-lg">{s.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeView === "troc" && (
                <div className="space-y-4">
                  {trocProposals.map(p => (
                    <div key={p.id} className="p-6 bg-muted/50 rounded-3xl">
                      <p className="font-bold">{p.proposer?.full_name} {t("lender.proposesATroc")}</p>
                      <p className="text-sm">{t("lender.for")} {p.requested_item?.title}</p>
                      <div className="mt-4 flex gap-2">
                        {p.status === 'pending' && (
                          <>
                            <Button size="sm" onClick={() => handleUpdateTrocStatus(p.id, 'accepted')} className="bg-emerald-600 hover:bg-emerald-700">{t("dashboard.accept")}</Button>
                            <Button size="sm" onClick={() => handleUpdateTrocStatus(p.id, 'rejected')} variant="destructive">Refuser</Button>
                          </>
                        )}
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
