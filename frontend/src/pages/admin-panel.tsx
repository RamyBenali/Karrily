import { motion } from "motion/react";
import {
  Users,
  Package,
  AlertCircle,
  DollarSign,
  Shield,
  BarChart3,
  Settings,
  Search,
  MoreVertical,
  CheckCircle,
  XCircle,
  Eye,
  LogOut,
  Calendar,
  Layers,
  UserX,
  UserCheck,
  TrendingUp
} from "lucide-react";
import { Button } from "../components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "../store/auth.store";
import { supabase } from "../lib/supabase";
import { DashboardSidebar } from "../components/dashboard/dashboard-sidebar";
import { cn } from "../components/ui/utils";
import { statsService } from "../services/api.service";


const sidebarItems = [
  { icon: BarChart3, label: "Vue d'ensemble" },
  { icon: Users, label: "Utilisateurs" },
  { icon: Package, label: "Annonces" },
  { icon: Calendar, label: "Réservations" },
];

// Interfaces
interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
  is_verified: boolean;
}

interface Item {
  id: string;
  title: string;
  owner_id: string;
  price_per_day: number;
  status: string;
  profiles: { full_name: string; email: string };
  categories: { name: string };
  created_at: string;
}

interface Booking {
  id: string;
  total_price: number;
  status: string;
  start_date: string;
  end_date: string;
  created_at: string;
  renter: { full_name: string };
  owner: { full_name: string };
  items: { title: string };
}

export function AdminPanel() {
  const navigate = useNavigate();
  const { user, setImpersonation } = useAuthStore();

  const [activeTab, setActiveTab] = useState<"overview" | "users" | "items" | "bookings">("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalItems: 0,
    totalBookings: 0,
    totalRevenue: 0,
    system: {
        totalMessages: 0,
        unreadNotifications: 0,
        dbConnections: 0,
        apiLatency: "0ms"
    }
  });

  // Data lists
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [itemsList, setItemsList] = useState<Item[]>([]);
  const [bookingsList, setBookingsList] = useState<Booking[]>([]);

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  // Check admin rights
  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setIsLoading(true);

    try {
      // 1. Fetch Stats from Service
      const res = await statsService.getAdminStats();
      if (res.data) {
          setStats({
              ...res.data.kpis,
              system: res.data.system
          });
      }

      // 2. Fetch Users
      const { data: usersData } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      setUsersList(usersData || []);

      // 3. Fetch Items
      const { data: itemsData } = await supabase
        .from("items")
        .select(`
          id, title, owner_id, price_per_day, status, created_at,
          profiles:owner_id(full_name, email),
          categories:category_id(name)
        `)
        .order("created_at", { ascending: false })
        .limit(50);
      setItemsList((itemsData as any) || []);

      // 4. Fetch Bookings
      const { data: bookingsData } = await supabase
        .from("bookings")
        .select(`
          id, total_price, status, start_date, end_date, created_at,
          renter:renter_id(full_name),
          owner:owner_id(full_name),
          items:item_id(title)
        `)
        .order("created_at", { ascending: false })
        .limit(50);
      setBookingsList((bookingsData as any) || []);

    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImpersonate = (userId: string, fullName: string, email: string) => {
    setImpersonation(userId, { id: userId, full_name: fullName, email });
    navigate("/dashboard");
  };

  const handleToggleVerification = async (userId: string, currentState: boolean) => {
    const { error } = await supabase.from("profiles").update({ is_verified: !currentState }).eq("id", userId);
    if (!error) {
      setUsersList(prev => prev.map(u => u.id === userId ? { ...u, is_verified: !currentState } : u));
    }
  };

  const handleToggleStatusItem = async (itemId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "paused" : "active";
    const { error } = await supabase.from("items").update({ status: newStatus }).eq("id", itemId);
    if (!error) {
      setItemsList(prev => prev.map(i => i.id === itemId ? { ...i, status: newStatus } : i));
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir annuler cette réservation en tant qu'administrateur ?")) return;
    const { error } = await supabase.from("bookings").update({ status: "cancelled", cancellation_reason: "Admin cancelled" }).eq("id", bookingId);
    if (!error) {
      setBookingsList(prev => prev.map(b => b.id === bookingId ? { ...b, status: "cancelled" } : b));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0F10] flex items-center justify-center">
        <div className="text-white text-xl flex items-center gap-3">
          <Shield className="w-8 h-8 animate-pulse text-[#FF4F5A]" />
          Chargement de l'administration...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0F10]">
      <div className="py-8 lg:py-12">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 lg:mb-10"
          >
            <h1 className="text-4xl lg:text-6xl font-black text-white mb-3 leading-tight tracking-tight">
              Admin <span className="text-[#FF4F5A]">Command</span>
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground/70 font-medium max-w-2xl">
              Surveillez la santé de votre plateforme et gérez les utilisateurs en toute sécurité.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Sidebar */}
            <DashboardSidebar
              items={sidebarItems}
              activeTab={activeTab === "overview" ? "Vue d'ensemble" : 
                         activeTab === "users" ? "Utilisateurs" :
                         activeTab === "items" ? "Annonces" : "Réservations"}
              setActiveTab={(label) => {
                const map: Record<string, any> = {
                  "Vue d'ensemble": "overview",
                  "Utilisateurs": "users",
                  "Annonces": "items",
                  "Réservations": "bookings"
                };
                setActiveTab(map[label]);
                setIsMobileMenuOpen(false);
              }}
              userInitials="AD"
              userFullName="Karrily Admin"
              userEmail={user?.email || ""}
              isMobileMenuOpen={isMobileMenuOpen}
              setIsMobileMenuOpen={setIsMobileMenuOpen}
              extraAction={{
                label: "Quitter l'admin",
                onClick: () => navigate('/'),
                variant: "destructive"
              }}
              className="dark"
            />

            {/* Main Content */}
            <div className="lg:col-span-9 min-h-[60vh]">

          {/* Overview / Command Center */}
          {activeTab === "overview" && (
            <div className="space-y-10">
              {/* Main KPI Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  { label: "Volume Utilisateurs", value: stats.totalUsers, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10", shadow: "shadow-blue-500/10" },
                  { label: "Catalogue Actif", value: stats.totalItems, icon: Package, color: "text-[#FF4F5A]", bg: "bg-[#FF4F5A]/10", shadow: "shadow-[#FF4F5A]/10" },
                  { label: "Flux Transactions", value: stats.totalBookings, icon: Calendar, color: "text-purple-500", bg: "bg-purple-500/10", shadow: "shadow-purple-500/10" },
                  { label: "Revenu Brut", value: stats.totalRevenue.toLocaleString() + " DA", icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10", shadow: "shadow-emerald-500/10" },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-[#0F1415] border border-white/5 rounded-3xl p-5 shadow-2xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 ${stat.shadow}`}
                  >
                    <div className="flex items-center justify-between mb-4 relative z-10">
                      <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center transition-transform group-hover:rotate-6`}>
                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                         <TrendingUp className="w-4 h-4 text-white/20" />
                      </div>
                    </div>
                    <div className="relative z-10">
                       <p className="text-[11px] font-medium text-white/50 mb-1 leading-none">{stat.label}</p>
                       <div className="text-xl font-bold text-white tracking-tight leading-none">{stat.value}</div>
                    </div>
                    {/* Background Detail */}
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                ))}
              </div>

              <div className="grid lg:grid-cols-3 gap-10">
                {/* System Health / Stats Visualization Placeholder */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="lg:col-span-2 bg-[#0F1415] rounded-[3rem] p-10 shadow-2xl border border-white/5 relative overflow-hidden h-[450px]"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                     <Shield className="w-40 h-40 text-white" />
                  </div>
                  <div className="relative z-10 flex items-center justify-between mb-10">
                     <div>
                        <h2 className="text-2xl font-black text-white mb-2">Santé du <span className="text-[#FF4F5A]">Système</span></h2>
                        <p className="text-sm text-white/40 font-medium">Monitoring des activités en temps réel</p>
                     </div>
                     <div className="px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Live Status
                     </div>
                  </div>
                         <div className="grid md:grid-cols-2 gap-8 relative z-10">
                      <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                         <h4 className="text-xs font-black uppercase tracking-widest text-white/40 mb-4">Volume Messages</h4>
                         <div className="h-2 w-full bg-white/5 rounded-full mb-2 overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(stats.system.totalMessages / 10, 100)}%` }} className="h-full bg-blue-500 shadow-[0_0_10px_#3B82F6]" />
                         </div>
                         <p className="text-[10px] font-bold text-white/60">Total: {stats.system.totalMessages}</p>
                      </div>
                      <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                         <h4 className="text-xs font-black uppercase tracking-widest text-white/40 mb-4">Alertes Non Lues</h4>
                         <div className="h-2 w-full bg-white/5 rounded-full mb-2 overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(stats.system.unreadNotifications * 10, 100)}%` }} className="h-full bg-[#FF4F5A] shadow-[0_0_10px_#FF4F5A]" />
                         </div>
                         <p className="text-[10px] font-bold text-white/60">Unread: {stats.system.unreadNotifications}</p>
                      </div>
                   </div>
                  <div className="mt-12 flex justify-center">
                     <div className="inline-flex items-center gap-6 px-8 py-4 bg-white/5 rounded-2xl border border-white/5">
                        <div className="text-center">
                           <p className="text-[10px] font-black uppercase text-white/30 tracking-widest mb-1">API Latency</p>
                           <p className="text-xl font-black text-white font-mono">{stats.system.apiLatency}</p>
                        </div>
                        <div className="w-px h-8 bg-white/10" />
                        <div className="text-center">
                           <p className="text-[10px] font-black uppercase text-white/30 tracking-widest mb-1">DB Connections</p>
                           <p className="text-xl font-black text-white font-mono">{stats.system.dbConnections}</p>
                        </div>
                        <div className="w-px h-8 bg-white/10" />
                        <div className="text-center">
                           <p className="text-[10px] font-black uppercase text-white/30 tracking-widest mb-1">Transactions</p>
                           <p className="text-xl font-black text-emerald-500 font-mono">{stats.totalBookings}</p>
                        </div>
                     </div>
                  </div>
                </motion.div>

                {/* Command Center Activity Feed */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-[#0F1415] rounded-[3rem] p-10 shadow-2xl border border-white/5 flex flex-col h-[450px]"
                >
                  <h2 className="text-xl font-black text-white mb-8">Journal <span className="text-[#FF4F5A]">Système</span></h2>
                  <div className="flex-1 space-y-6 overflow-y-auto pr-2 no-scrollbar">
                     {usersList.slice(0, 4).map((u, idx) => (
                        <div key={idx} className="flex gap-4 items-start p-4 hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/5 group">
                           <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                              <UserCheck className="w-5 h-5 text-blue-400" />
                           </div>
                           <div className="min-w-0">
                              <p className="text-xs font-black uppercase text-white/30 mb-1">Inscription</p>
                              <p className="text-sm font-bold text-white line-clamp-1">{u.full_name}</p>
                              <p className="text-[10px] text-white/40 mt-1">Nouveau compte créé</p>
                           </div>
                        </div>
                     ))}
                  </div>
                  <Button variant="ghost" className="mt-8 rounded-2xl h-12 font-black text-[10px] uppercase tracking-widest text-[#FF4F5A] hover:bg-[#FF4F5A]/10 transition-all">Voir tout le log</Button>
                </motion.div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#0F1415] border border-white/5 rounded-[3rem] p-10 shadow-2xl">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
                <h3 className="text-2xl font-black text-white">Gestion <span className="text-[#FF4F5A]">Utilisateurs</span></h3>
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                  <input
                    type="text"
                    placeholder="Filtrer par nom ou email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-14 pr-6 h-14 bg-white/5 border border-white/5 rounded-2xl text-white focus:ring-2 focus:ring-[#FF4F5A]/20 transition-all font-bold placeholder:text-white/20"
                  />
                </div>
              </div>
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em]">
                      <th className="py-4 px-6">Identité</th>
                      <th className="py-4 px-6">Rôle</th>
                      <th className="py-4 px-6 text-center">Vérif.</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.filter(u => u.email.includes(searchQuery.toLowerCase()) || u.full_name.toLowerCase().includes(searchQuery.toLowerCase())).map((u) => (
                      <tr key={u.id} className="group transition-all">
                        <td className="py-5 px-6 bg-white/10 rounded-l-2xl border-y border-l border-white/5">
                          <div className="font-bold text-white text-base">{u.full_name || "Sans nom"}</div>
                          <div className="text-[10px] font-black uppercase text-white/30 mt-1">{u.email}</div>
                        </td>
                        <td className="py-5 px-6 bg-white/10 border-y border-white/5">
                           <span className={cn(
                             "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                             u.role === 'admin' ? "bg-purple-500/10 text-purple-400 border-purple-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                           )}>
                             {u.role}
                           </span>
                        </td>
                        <td className="py-5 px-6 bg-white/10 border-y border-white/5 text-center">
                          <button
                            onClick={() => handleToggleVerification(u.id, u.is_verified)}
                            className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center mx-auto transition-all",
                              u.is_verified ? "bg-emerald-500/10 text-emerald-500" : "bg-white/5 text-white/20 hover:text-white hover:bg-white/10"
                            )}
                          >
                            {u.is_verified ? <UserCheck className="w-5 h-5" /> : <UserX className="w-5 h-5" />}
                          </button>
                        </td>
                        <td className="py-5 px-6 bg-white/10 rounded-r-2xl border-y border-r border-white/5 text-right">
                          <Button
                            onClick={() => handleImpersonate(u.id, u.full_name, u.email)}
                            className="bg-[#FF4F5A] hover:bg-red-600 text-white rounded-xl h-10 px-6 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#FF4F5A]/20 transition-all active:scale-95 disabled:opacity-30"
                            disabled={u.id === user?.id}
                          >
                            Impersonifier
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Items Tab */}
          {activeTab === "items" && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#0F1415] border border-white/5 rounded-[3rem] p-10 shadow-2xl">
              <h3 className="text-2xl font-black text-white mb-10">Gestion <span className="text-[#FF4F5A]">Annonces</span></h3>
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em]">
                      <th className="py-4 px-6">Article</th>
                      <th className="py-4 px-6">Prix / Jour</th>
                      <th className="py-4 px-6">Statut</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemsList.map((item) => (
                      <tr key={item.id} className="group transition-all">
                        <td className="py-5 px-6 bg-white/10 rounded-l-2xl border-y border-l border-white/5">
                          <div className="font-bold text-white text-base truncate max-w-[200px]" title={item.title}>{item.title}</div>
                          <div className="text-[10px] font-black uppercase text-white/30 mt-1">{item.categories?.name} • par {item.profiles?.full_name}</div>
                        </td>
                        <td className="py-5 px-6 bg-white/10 border-y border-white/5 font-black text-white">
                          {item.price_per_day?.toLocaleString() || 0} DA
                        </td>
                        <td className="py-5 px-6 bg-white/10 border-y border-white/5">
                          <span className={cn(
                            "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                            item.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                          )}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-5 px-6 bg-white/10 rounded-r-2xl border-y border-r border-white/5 text-right flex justify-end gap-2">
                          <Button size="sm" variant="ghost" className="h-10 w-10 p-0 rounded-xl bg-white/5 text-white/70 hover:text-white" onClick={() => navigate(`/item/${item.id}`)}>
                            <Eye className="w-5 h-5" />
                          </Button>
                          <Button
                            size="sm"
                            className={cn(
                               "h-10 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
                               item.status === 'active' ? "bg-orange-500/20 text-orange-400 hover:bg-orange-500/30" : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                            )}
                            onClick={() => handleToggleStatusItem(item.id, item.status)}
                          >
                            {item.status === 'active' ? 'Pauser' : 'Activer'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Bookings Tab */}
          {activeTab === "bookings" && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#0F1415] border border-white/5 rounded-[3rem] p-10 shadow-2xl">
              <h3 className="text-2xl font-black text-white mb-10">Gestion <span className="text-[#FF4F5A]">Réservations</span></h3>
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em]">
                      <th className="py-4 px-6">Transaction</th>
                      <th className="py-4 px-6">Flux</th>
                      <th className="py-4 px-6 text-center">Statut</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookingsList.map((booking) => (
                      <tr key={booking.id} className="group transition-all">
                        <td className="py-5 px-6 bg-white/10 rounded-l-2xl border-y border-l border-white/5">
                          <div className="font-bold text-white text-base truncate max-w-[200px]" title={booking.items?.title}>{booking.items?.title}</div>
                          <div className="text-[10px] font-black uppercase text-white/30 mt-1">
                             {new Date(booking.start_date).toLocaleDateString()} — {new Date(booking.end_date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-5 px-6 bg-white/10 border-y border-white/5">
                           <div className="flex flex-col gap-1">
                              <span className="text-xs font-bold text-blue-400">{booking.renter?.full_name}</span>
                              <div className="flex items-center gap-2">
                                 <div className="flex-1 h-[2px] bg-white/5 relative">
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white/20 rounded-full" />
                                 </div>
                              </div>
                              <span className="text-xs font-bold text-purple-400">{booking.owner?.full_name}</span>
                           </div>
                        </td>
                        <td className="py-5 px-6 bg-white/10 border-y border-white/5 text-center font-black text-white">
                           <div className="flex flex-col items-center gap-2">
                              <div className="text-sm">{booking.total_price.toLocaleString()} DA</div>
                              <span className={cn(
                                "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border",
                                booking.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                                booking.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                booking.status === 'active' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                'bg-red-500/10 text-red-500 border-red-500/20'
                              )}>
                                {booking.status}
                              </span>
                           </div>
                        </td>
                        <td className="py-5 px-6 bg-white/10 rounded-r-2xl border-y border-r border-white/5 text-right">
                          {booking.status !== "cancelled" && booking.status !== "rejected" && booking.status !== "completed" && (
                            <Button
                              onClick={() => handleCancelBooking(booking.id)}
                              className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl h-10 px-4 font-black text-[10px] uppercase tracking-widest transition-all"
                            >
                              Interrompre
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
