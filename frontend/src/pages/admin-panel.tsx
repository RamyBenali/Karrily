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
  TrendingUp,
  Star,
  Trash2,
  Loader2
} from "lucide-react";
import { Button } from "../components/ui/button";
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
  { icon: DollarSign, label: "Ventes" },
  { icon: Star, label: "Avis" },
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

interface Sale {
  id: string;
  price: number;
  status: string;
  created_at: string;
  buyer: { full_name: string };
  seller: { full_name: string };
  items: { title: string };
}

export function AdminPanel() {
  const navigate = useNavigate();
  const { user, setImpersonation } = useAuthStore();

  const [activeTab, setActiveTab] = useState<"overview" | "users" | "items" | "bookings" | "sales" | "reviews">("overview");
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
  const [salesList, setSalesList] = useState<Sale[]>([]);
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [isDeletingReview, setIsDeletingReview] = useState<string | null>(null);

  // Confirmation Dialog State
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
      // 1. Fetch Comprehensive Data from Backend Stats Service
      const res = await statsService.getAdminStats();
      
      if (res.data) {
          // Update KPIs and System stats
          setStats({
              ...res.data.kpis,
              system: res.data.system
          });

          // Update Lists from backend (bypass RLS)
          if (res.data.lists) {
              setUsersList(res.data.lists.users || []);
              setItemsList(res.data.lists.items || []);
              setBookingsList(res.data.lists.bookings || []);
              setSalesList(res.data.lists.sales || []);
          }
      }

      // Fetch Reviews separately if not in stats
      const { data: reviews } = await supabase
        .from('reviews')
        .select('*, items(title), reviewer:profiles!reviewer_id(full_name)')
        .order('created_at', { ascending: false });
      if (reviews) setReviewsList(reviews);

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

  const handleDeleteReview = (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: "Supprimer cet avis ?",
      description: "Cette action est irréversible. L'avis sera définitivement supprimé de la base de données.",
      actionLabel: "Supprimer",
      variant: "destructive",
      onConfirm: async () => {
        setIsDeletingReview(id);
        try {
          const { error } = await supabase.from('reviews').delete().eq('id', id);
          if (error) throw error;
          setReviewsList(prev => prev.filter(r => r.id !== id));
        } catch (err) {
          console.error("Error deleting review:", err);
        } finally {
          setIsDeletingReview(null);
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleCancelBooking = (bookingId: string) => {
    setConfirmConfig({
      isOpen: true,
      title: "Annuler cette réservation ?",
      description: "En tant qu'administrateur, vous allez forcer l'annulation de cette transaction.",
      actionLabel: "Annuler la réservation",
      variant: "destructive",
      onConfirm: async () => {
        const { error } = await supabase.from("bookings").update({ status: "cancelled", cancellation_reason: "Admin cancelled" }).eq("id", bookingId);
        if (!error) {
          setBookingsList(prev => prev.map(b => b.id === bookingId ? { ...b, status: "cancelled" } : b));
        }
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0F10] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Shield className="w-8 h-8 text-[#FF4F5A] animate-pulse" />
          </div>
          <p className="text-white/50 text-sm font-medium">Chargement de l'administration...</p>
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
            className="mb-10"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="h-px flex-1 max-w-[40px] bg-gradient-to-r from-[#FF4F5A] to-transparent" />
              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[#FF4F5A]">Administration</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-white mb-2 leading-tight">
              Admin <span style={{ background: 'linear-gradient(135deg,#FF4F5A,#FF8C94)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Center</span>
            </h1>
            <p className="text-sm text-white/40 max-w-xl">
              Surveillez la santé de votre plateforme et gérez les utilisateurs en toute sécurité.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Sidebar */}
            <DashboardSidebar
              items={sidebarItems}
              activeTab={activeTab === "overview" ? "Vue d'ensemble" : 
                         activeTab === "users" ? "Utilisateurs" :
                         activeTab === "items" ? "Annonces" : 
                         activeTab === "bookings" ? "Réservations" :
                         activeTab === "sales" ? "Ventes" : "Avis"}
              setActiveTab={(label) => {
                const map: Record<string, any> = {
                  "Vue d'ensemble": "overview",
                  "Utilisateurs": "users",
                  "Annonces": "items",
                  "Réservations": "bookings",
                  "Ventes": "sales",
                  "Avis": "reviews"
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
            <div className="space-y-8">
              {/* Main KPI Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { label: "Utilisateurs", value: stats.totalUsers, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/10" },
                  { label: "Annonces", value: stats.totalItems, icon: Package, color: "text-[#FF4F5A]", bg: "bg-[#FF4F5A]/10", border: "border-[#FF4F5A]/10" },
                  { label: "Transactions", value: stats.totalBookings, icon: Calendar, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/10" },
                  { label: "Revenu Brut", value: stats.totalRevenue.toLocaleString() + " DA", icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/10" },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className={`bg-white/[0.03] border ${stat.border} rounded-2xl p-5 hover:-translate-y-0.5 transition-all duration-200 group`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                      <TrendingUp className="w-4 h-4 text-white/10" />
                    </div>
                    <p className="text-[11px] text-white/30 mb-1">{stat.label}</p>
                    <div className="text-2xl font-black text-white">{stat.value}</div>
                  </motion.div>
                ))}
              </div>
              <div className="grid lg:grid-cols-3 gap-8">
                {/* System Health */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="lg:col-span-2 bg-white/[0.03] rounded-2xl p-7 border border-white/5"
                >
                  <div className="flex items-center justify-between mb-7">
                    <div>
                      <h2 className="text-lg font-black text-white">Santé du <span className="text-[#FF4F5A]">Système</span></h2>
                      <p className="text-xs text-white/30 mt-0.5">Monitoring des activités en temps réel</p>
                    </div>
                    <div className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-bold flex items-center gap-2 border border-emerald-500/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      En ligne
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-5 mb-7">
                    <div className="bg-white/[0.03] rounded-xl p-5 border border-white/5">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3">Messages</h4>
                      <div className="h-1.5 w-full bg-white/5 rounded-full mb-2 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(stats.system.totalMessages / 10, 100)}%` }} className="h-full bg-blue-500 rounded-full" />
                      </div>
                      <p className="text-xs text-white/40">{stats.system.totalMessages} messages</p>
                    </div>
                    <div className="bg-white/[0.03] rounded-xl p-5 border border-white/5">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3">Alertes</h4>
                      <div className="h-1.5 w-full bg-white/5 rounded-full mb-2 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(stats.system.unreadNotifications * 10, 100)}%` }} className="h-full bg-[#FF4F5A] rounded-full" />
                      </div>
                      <p className="text-xs text-white/40">{stats.system.unreadNotifications} non lues</p>
                    </div>
                  </div>
                  <div className="flex gap-5">
                    {[
                      { label: "Latence API", value: stats.system.apiLatency },
                      { label: "Connexions DB", value: stats.system.dbConnections },
                      { label: "Transactions", value: stats.totalBookings }
                    ].map((m) => (
                      <div key={m.label} className="flex-1 text-center p-4 bg-white/[0.03] rounded-xl border border-white/5">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-white/25 mb-1">{m.label}</p>
                        <p className="text-xl font-black text-white font-mono">{m.value}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Activity Feed */}
                <motion.div
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white/[0.03] rounded-2xl border border-white/5 flex flex-col overflow-hidden"
                >
                  <div className="px-6 py-5 border-b border-white/5">
                    <h2 className="text-base font-black text-white">Journal <span className="text-[#FF4F5A]">Système</span></h2>
                  </div>
                  <div className="flex-1 divide-y divide-white/5 overflow-y-auto no-scrollbar">
                    {usersList.slice(0, 5).map((u, idx) => (
                      <div key={idx} className="flex gap-3 items-start px-5 py-4 hover:bg-white/[0.03] transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                          <UserCheck className="w-4 h-4 text-blue-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold text-white/25 uppercase">Inscription</p>
                          <p className="text-sm font-semibold text-white truncate">{u.full_name || u.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-5 py-4 border-t border-white/5">
                    <Button variant="ghost" className="w-full rounded-xl h-9 text-[10px] font-bold text-[#FF4F5A] hover:bg-[#FF4F5A]/10">Voir tout le log</Button>
                  </div>
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

          {/* Sales Tab */}
          {activeTab === "sales" && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#0F1415] border border-white/5 rounded-[3rem] p-10 shadow-2xl">
              <h3 className="text-2xl font-black text-white mb-10">Gestion <span className="text-[#FF4F5A]">Ventes</span></h3>
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em]">
                      <th className="py-4 px-6">Vente</th>
                      <th className="py-4 px-6">Prix</th>
                      <th className="py-4 px-6">Vendeur / Acheteur</th>
                      <th className="py-4 px-6 text-center">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesList.map((sale) => (
                      <tr key={sale.id} className="group transition-all">
                        <td className="py-5 px-6 bg-white/10 rounded-l-2xl border-y border-l border-white/5">
                          <div className="font-bold text-white text-base truncate max-w-[200px]" title={sale.items?.title}>{sale.items?.title}</div>
                          <div className="text-[10px] font-black uppercase text-white/30 mt-1">{new Date(sale.created_at).toLocaleDateString()}</div>
                        </td>
                        <td className="py-5 px-6 bg-white/10 border-y border-white/5 font-black text-white">
                          {sale.price.toLocaleString()} DA
                        </td>
                        <td className="py-5 px-6 bg-white/10 border-y border-white/5">
                           <div className="flex flex-col gap-1">
                              <span className="text-xs font-bold text-emerald-400">V: {sale.seller?.full_name}</span>
                              <span className="text-xs font-bold text-blue-400">A: {sale.buyer?.full_name}</span>
                           </div>
                        </td>
                        <td className="py-5 px-6 bg-white/10 rounded-r-2xl border-y border-r border-white/5 text-center">
                           <span className={cn(
                             "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border",
                             sale.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                             sale.status === 'accepted' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                             'bg-amber-500/10 text-amber-500 border-amber-500/20'
                           )}>
                             {sale.status}
                           </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Reviews Tab */}
          {activeTab === "reviews" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card rounded-3xl shadow-xl border border-border overflow-hidden"
            >
              <div className="p-8 border-b border-border flex justify-between items-center bg-muted/30">
                <div>
                  <h2 className="text-xl font-black">Gestion des <span className="text-[#FF4F5A]">Avis</span></h2>
                  <p className="text-sm text-muted-foreground font-medium">Modérez les commentaires des utilisateurs.</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-muted-foreground">Utilisateur</th>
                      <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-muted-foreground">Article</th>
                      <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-muted-foreground">Note</th>
                      <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-muted-foreground">Commentaire</th>
                      <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-muted-foreground">Date</th>
                      <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-muted-foreground text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {reviewsList.map((review) => (
                      <tr key={review.id} className="hover:bg-muted/30 transition-colors group">
                        <td className="px-8 py-5">
                          <div className="font-bold text-sm">{review.reviewer?.full_name}</div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="font-bold text-sm text-[#FF4F5A]">{review.items?.title}</div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-1 text-amber-500">
                             <Star className="w-3.5 h-3.5 fill-current" />
                             <span className="font-black text-sm">{review.rating}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="text-sm font-medium line-clamp-1 max-w-xs">{review.comment}</div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="text-xs font-bold text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteReview(review.id)}
                            disabled={isDeletingReview === review.id}
                            className="text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          >
                            {isDeletingReview === review.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {reviewsList.length === 0 && (
                  <div className="py-20 text-center text-muted-foreground font-bold">Aucun avis trouvé.</div>
                )}
              </div>
            </motion.div>
          )}

            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={confirmConfig.isOpen} onOpenChange={(open) => setConfirmConfig(prev => ({ ...prev, isOpen: open }))}>
        <AlertDialogContent className="rounded-[2rem] border-border bg-card/95 backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black">{confirmConfig.title}</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground font-medium">
              {confirmConfig.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl font-bold">Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmConfig.onConfirm}
              className={cn(
                "rounded-xl px-8 font-black text-xs uppercase tracking-widest shadow-lg transition-all",
                confirmConfig.variant === "destructive" ? "bg-red-500 hover:bg-red-600 shadow-red-500/20" : "bg-[#FF4F5A] hover:bg-[#FF4F5A]/90 shadow-[#FF4F5A]/20"
              )}
            >
              {confirmConfig.actionLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
