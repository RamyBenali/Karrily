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
  Loader2,
  Activity,
  ClipboardList
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
  { icon: Star, label: "Avis" },
  { icon: ClipboardList, label: "Journal" },
];

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

  const [activeTab, setActiveTab] = useState<"overview" | "users" | "items" | "reviews" | "logs">("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [itemsList, setItemsList] = useState<Item[]>([]);
  const [bookingsList, setBookingsList] = useState<Booking[]>([]);
  const [salesList, setSalesList] = useState<Sale[]>([]);
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [isDeletingReview, setIsDeletingReview] = useState<string | null>(null);

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

  const [searchQuery, setSearchQuery] = useState("");

  const allLogs = [
    ...usersList.map(u => ({ id: u.id, type: 'Inscription', title: u.full_name || u.email, date: u.created_at, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const res = await statsService.getAdminStats();
      if (res.data) {
          setStats({
              ...res.data.kpis,
              system: res.data.system
          });
          if (res.data.lists) {
              setUsersList(res.data.lists.users || []);
              setItemsList(res.data.lists.items || []);
              setBookingsList(res.data.lists.bookings || []);
              setSalesList(res.data.lists.sales || []);
          }
      }
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center">
            <Shield className="w-8 h-8 text-[#FF4F5A] animate-pulse" />
          </div>
          <p className="text-muted-foreground text-sm font-medium">Chargement de l'administration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="py-8 lg:py-12">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-px flex-1 max-w-[40px] bg-gradient-to-r from-[#FF4F5A] to-transparent" />
              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[#FF4F5A]">Administration</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black mb-2 leading-tight">
              Admin <span className="gradient-text">Center</span>
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl">
              Surveillez la santé de votre plateforme et gérez les utilisateurs en toute sécurité.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
            <DashboardSidebar
              items={sidebarItems}
              activeTab={activeTab === "overview" ? "Vue d'ensemble" : 
                         activeTab === "users" ? "Utilisateurs" :
                         activeTab === "items" ? "Annonces" : 
                         activeTab === "reviews" ? "Avis" : "Journal"}
              setActiveTab={(label) => {
                const map: Record<string, any> = {
                  "Vue d'ensemble": "overview",
                  "Utilisateurs": "users",
                  "Annonces": "items",
                  "Avis": "reviews",
                  "Journal": "logs"
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
            />

            <div className="lg:col-span-9 min-h-[60vh]">
              {activeTab === "overview" && (
                <div className="space-y-8">
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {[
                      { label: "Utilisateurs", value: stats.totalUsers, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/10" },
                      { label: "Annonces", value: stats.totalItems, icon: Package, color: "text-[#FF4F5A]", bg: "bg-[#FF4F5A]/10", border: "border-[#FF4F5A]/10" },
                      { label: "Transactions", value: stats.totalBookings, icon: Calendar, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/10" },
                      { label: "Revenu Brut", value: stats.totalRevenue.toLocaleString() + " DA", icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/10" },
                    ].map((stat, index) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08 }}
                        className={`bg-card border ${stat.border} rounded-2xl p-5 hover:-translate-y-0.5 transition-all duration-200 group`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                          </div>
                          <TrendingUp className="w-4 h-4 opacity-20" />
                        </div>
                        <p className="text-[11px] text-muted-foreground mb-1">{stat.label}</p>
                        <div className="text-2xl font-black">{stat.value}</div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="grid lg:grid-cols-3 gap-8">
                    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="lg:col-span-2 bg-card rounded-2xl p-7 border border-border flex flex-col h-[480px]">
                      <div className="flex items-center justify-between mb-7">
                        <div>
                          <h2 className="text-lg font-black">Santé du <span className="text-[#FF4F5A]">Système</span></h2>
                          <p className="text-xs text-muted-foreground mt-0.5">Monitoring des activités en temps réel</p>
                        </div>
                        <div className="px-3 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-bold flex items-center gap-2 border border-emerald-500/20">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          En ligne
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-5 mb-7">
                        <div className="bg-muted/30 rounded-xl p-5 border border-border">
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Messages</h4>
                          <div className="h-1.5 w-full bg-muted rounded-full mb-2 overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(stats.system.totalMessages / 10, 100)}%` }} className="h-full bg-blue-500 rounded-full" />
                          </div>
                          <p className="text-xs text-muted-foreground">{stats.system.totalMessages} messages</p>
                        </div>
                        <div className="bg-muted/30 rounded-xl p-5 border border-border">
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Alertes</h4>
                          <div className="h-1.5 w-full bg-muted rounded-full mb-2 overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(stats.system.unreadNotifications * 10, 100)}%` }} className="h-full bg-[#FF4F5A] rounded-full" />
                          </div>
                          <p className="text-xs text-muted-foreground">{stats.system.unreadNotifications} non lues</p>
                        </div>
                      </div>
                      <div className="flex gap-5 mt-auto">
                        {[
                          { label: "Latence API", value: stats.system.apiLatency },
                          { label: "Connexions DB", value: stats.system.dbConnections },
                          { label: "Transactions", value: stats.totalBookings }
                        ].map((m) => (
                          <div key={m.label} className="flex-1 text-center p-4 bg-muted/30 rounded-xl border border-border">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{m.label}</p>
                            <p className="text-xl font-black font-mono">{m.value}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="bg-card rounded-2xl border border-border flex flex-col overflow-hidden h-[480px]">
                      <div className="px-6 py-5 border-b border-border">
                        <h2 className="text-base font-black">Journal <span className="text-[#FF4F5A]">Système</span></h2>
                      </div>
                      <div className="flex-1 divide-y divide-border overflow-y-auto no-scrollbar">
                        {allLogs.slice(0, 10).map((log, idx) => (
                          <div key={idx} className="flex gap-3 items-start px-5 py-4 hover:bg-muted/50 transition-colors">
                            <div className={`w-8 h-8 rounded-lg ${log.bg} flex items-center justify-center flex-shrink-0`}>
                              <log.icon className={`w-4 h-4 ${log.color}`} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] font-semibold opacity-50 uppercase">{log.type}</p>
                              <p className="text-sm font-semibold truncate">{log.title}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="px-5 py-4 border-t border-border">
                        <Button variant="ghost" onClick={() => setActiveTab("logs")} className="w-full rounded-xl h-9 text-[10px] font-bold text-[#FF4F5A] hover:bg-[#FF4F5A]/10">Voir tout le log</Button>
                      </div>
                    </motion.div>
                  </div>
                </div>
              )}

              {activeTab === "users" && (
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border rounded-[3rem] p-10 shadow-2xl">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
                    <h3 className="text-2xl font-black">Gestion <span className="text-[#FF4F5A]">Utilisateurs</span></h3>
                    <div className="relative w-full md:w-96">
                      <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 opacity-20" />
                      <input
                        type="text"
                        placeholder="Filtrer par nom ou email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-14 pr-6 h-14 bg-muted/30 border border-border rounded-2xl focus:ring-2 focus:ring-[#FF4F5A]/20 transition-all font-bold placeholder:opacity-20"
                      />
                    </div>
                  </div>
                  <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-separate border-spacing-y-3">
                      <thead>
                        <tr className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">
                          <th className="py-4 px-6">Identité</th>
                          <th className="py-4 px-6">Rôle</th>
                          <th className="py-4 px-6">Statut</th>
                          <th className="py-4 px-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usersList.filter(u => u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase())).map((u) => (
                          <tr key={u.id} className="group transition-all">
                            <td className="py-5 px-6 bg-muted/30 rounded-l-2xl border-y border-l border-border">
                              <div className="font-bold text-base">{u.full_name || "Sans nom"}</div>
                              <div className="text-[10px] font-black uppercase opacity-30 mt-1">{u.email}</div>
                            </td>
                            <td className="py-5 px-6 bg-muted/30 border-y border-border">
                              <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest">{u.role}</span>
                            </td>
                            <td className="py-5 px-6 bg-muted/30 border-y border-border">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${u.is_verified ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                <span className="text-[10px] font-black uppercase tracking-widest">{u.is_verified ? 'Vérifié' : 'En attente'}</span>
                              </div>
                            </td>
                            <td className="py-5 px-6 bg-muted/30 rounded-r-2xl border-y border-r border-border text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button size="sm" variant="ghost" onClick={() => handleToggleVerification(u.id, u.is_verified)} className="rounded-xl h-10 px-4 font-black text-[10px] uppercase tracking-widest">
                                  {u.is_verified ? 'Révoquer' : 'Vérifier'}
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleImpersonate(u.id, u.full_name, u.email)} className="rounded-xl h-10 px-4 font-black text-[10px] uppercase tracking-widest">
                                  Incarner
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {activeTab === "items" && (
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border rounded-[3rem] p-10 shadow-2xl">
                  <h3 className="text-2xl font-black mb-10">Gestion <span className="text-[#FF4F5A]">Annonces</span></h3>
                  <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-separate border-spacing-y-3">
                      <thead>
                        <tr className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">
                          <th className="py-4 px-6">Article</th>
                          <th className="py-4 px-6">Prix</th>
                          <th className="py-4 px-6">Propriétaire</th>
                          <th className="py-4 px-6 text-center">Statut</th>
                          <th className="py-4 px-6 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {itemsList.map((item) => (
                          <tr key={item.id} className="group transition-all">
                            <td className="py-5 px-6 bg-muted/30 rounded-l-2xl border-y border-l border-border">
                              <div className="font-bold text-base truncate max-w-[200px]" title={item.title}>{item.title}</div>
                              <div className="text-[10px] font-black uppercase opacity-30 mt-1">{item.categories?.name || 'Général'}</div>
                            </td>
                            <td className="py-5 px-6 bg-muted/30 border-y border-border font-black">
                              {item.price_per_day} DA/j
                            </td>
                            <td className="py-5 px-6 bg-muted/30 border-y border-border">
                              <div className="font-bold text-sm">{item.profiles?.full_name}</div>
                              <div className="text-[10px] opacity-30">{item.profiles?.email}</div>
                            </td>
                            <td className="py-5 px-6 bg-muted/30 border-y border-border text-center">
                              <span className={cn(
                                "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border",
                                item.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-white/10 opacity-40'
                              )}>
                                {item.status}
                              </span>
                            </td>
                            <td className="py-5 px-6 bg-muted/30 rounded-r-2xl border-y border-r border-border text-right">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="rounded-xl h-10 px-4 font-black text-[10px] uppercase tracking-widest"
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

              {activeTab === "reviews" && (
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border rounded-[3rem] p-10 shadow-2xl">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
                    <div>
                      <h3 className="text-2xl font-black">Modération des <span className="text-[#FF4F5A]">Avis</span></h3>
                      <p className="text-sm text-muted-foreground mt-1">Gérez et modérez les retours d'expérience des utilisateurs.</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-separate border-spacing-y-3">
                      <thead>
                        <tr className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">
                          <th className="py-4 px-6">Utilisateur</th>
                          <th className="py-4 px-6">Article</th>
                          <th className="py-4 px-6">Note</th>
                          <th className="py-4 px-6">Commentaire</th>
                          <th className="py-4 px-6">Date</th>
                          <th className="py-4 px-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reviewsList.map((review) => (
                          <tr key={review.id} className="group transition-all">
                            <td className="py-5 px-6 bg-muted/30 rounded-l-2xl border-y border-l border-border">
                              <div className="font-bold text-sm">{review.reviewer?.full_name}</div>
                            </td>
                            <td className="py-5 px-6 bg-muted/30 border-y border-border">
                              <div className="font-bold text-sm text-[#FF4F5A]">{review.items?.title}</div>
                            </td>
                            <td className="py-5 px-6 bg-muted/30 border-y border-border">
                              <div className="flex items-center gap-1 text-amber-500">
                                 <Star className="w-3.5 h-3.5 fill-current" />
                                 <span className="font-black text-sm">{review.rating}</span>
                              </div>
                            </td>
                            <td className="py-5 px-6 bg-muted/30 border-y border-border">
                              <div className="text-sm font-medium opacity-70 line-clamp-1 max-w-xs">{review.comment}</div>
                            </td>
                            <td className="py-5 px-6 bg-muted/30 border-y border-border">
                              <div className="text-[10px] font-black uppercase opacity-30">{new Date(review.created_at).toLocaleDateString()}</div>
                            </td>
                            <td className="py-5 px-6 bg-muted/30 rounded-r-2xl border-y border-r border-border text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteReview(review.id)}
                                disabled={isDeletingReview === review.id}
                                className="opacity-20 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                              >
                                {isDeletingReview === review.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {activeTab === "logs" && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                  <div className="bg-card border border-border rounded-[3rem] p-10 shadow-2xl">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
                      <div>
                        <h3 className="text-2xl font-black">Journal <span className="text-[#FF4F5A]">Système</span></h3>
                        <p className="text-muted-foreground text-sm mt-1">Historique complet des activités de la plateforme.</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {allLogs.map((log, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-5 bg-muted/30 border border-border rounded-2xl hover:bg-muted/50 transition-all group">
                          <div className={`w-12 h-12 rounded-xl ${log.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                            <log.icon className={`w-6 h-6 ${log.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[10px] font-black uppercase tracking-widest ${log.color}`}>{log.type}</span>
                              <span className="w-1 h-1 rounded-full bg-border" />
                              <span className="text-[10px] font-bold opacity-30">{new Date(log.date).toLocaleString()}</span>
                            </div>
                            <h4 className="text-base font-bold truncate">{log.title}</h4>
                          </div>
                        </div>
                      ))}
                    </div>
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
            <AlertDialogDescription className="text-muted-foreground font-medium">{confirmConfig.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl font-bold">Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmConfig.onConfirm} className={cn("rounded-xl px-8 font-black text-xs uppercase tracking-widest shadow-lg transition-all", confirmConfig.variant === "destructive" ? "bg-red-500 hover:bg-red-600 shadow-red-500/20" : "bg-[#FF4F5A] hover:bg-[#FF4F5A]/90 shadow-[#FF4F5A]/20")}>{confirmConfig.actionLabel}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
