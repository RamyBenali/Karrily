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
  Calendar,
  TrendingUp,
  Star,
  Trash2,
  Loader2,
  ClipboardList,
  Flag,
  ShieldCheck,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
import { useNavigate, useLocation } from "react-router";
import { useAuthStore } from "../store/auth.store";
import { supabase } from "../lib/supabase";
import { DashboardSidebar } from "../components/dashboard/dashboard-sidebar";
import { cn } from "../components/ui/utils";
import { statsService, reportsService, itemsService, reviewsService, usersService } from "../services/api.service";
import { toast } from "react-hot-toast";
import { useTranslation } from "../context/language-context";

const getSidebarItems = (t: any) => [
    { id: 'overview', icon: BarChart3, label: t("admin.overview") !== "admin.overview" ? t("admin.overview") : "Vue d'ensemble" },
    { id: 'users', icon: Users, label: t("admin.users") !== "admin.users" ? t("admin.users") : "Utilisateurs" },
    { id: 'items', icon: Package, label: t("admin.items") !== "admin.items" ? t("admin.items") : "Annonces" },
    { id: 'reviews', icon: Star, label: t("admin.reviews") !== "admin.reviews" ? t("admin.reviews") : "Avis" },
    { id: 'reports', icon: Flag, label: t("admin.reports") !== "admin.reports" ? t("admin.reports") : "Signalements" },
    { id: 'logs', icon: ClipboardList, label: t("admin.logs") !== "admin.logs" ? t("admin.logs") : "Journal d'activité" },
];

const getReasonLabels = (t: any): Record<string, string> => ({
  inappropriate: t("report.reasons.inappropriate"),
  fraud: t("report.reasons.fraud"),
  spam: t("report.reasons.spam"),
  counterfeit: t("report.reasons.counterfeit"),
  harassment: t("report.reasons.harassment"),
  other: t("report.reasons.other")
});

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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<"overview" | "users" | "items" | "reviews" | "reports" | "logs">("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
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
  }, [highlightId, activeTab]);

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalItems: 0,
    totalBookings: 0,
    totalRevenue: 0,
    system: {
        totalMessages: 0,
        unreadNotifications: 0,
        dbConnections: 0,
        apiLatency: "0ms",
        transactions: 0
    },
    revenueData: [] as { month: string; earnings: number }[]
  });

  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [itemsList, setItemsList] = useState<Item[]>([]);
  const [bookingsList, setBookingsList] = useState<Booking[]>([]);
  const [salesList, setSalesList] = useState<Sale[]>([]);
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [isDeletingReview, setIsDeletingReview] = useState<string | null>(null);
  const [isIgnoringReview, setIsIgnoringReview] = useState<string | null>(null);
  const [reportsList, setReportsList] = useState<any[]>([]);
  const [isResolvingReport, setIsResolvingReport] = useState<string | null>(null);
  const [allLogs, setAllLogs] = useState<any[]>([]);

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
    actionLabel: t("dashboard.confirm"),
    variant: "default"
  });

  const [searchQuery, setSearchQuery] = useState("");
  
  const sidebarItems = getSidebarItems(t);
  const REASON_LABELS = getReasonLabels(t);

  // Derived logs for the overview
  const displayLogs = [
    ...allLogs,
    ...usersList.map(u => ({ id: u.id, type: 'Inscription', title: u.full_name || u.email, date: u.created_at, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' })),
  ].sort((a, b) => new Date(b.date || b.created_at).getTime() - new Date(a.date || a.created_at).getTime());

  useEffect(() => {
    if (user) {
      // Fetch stats once on load
      statsService.getAdminStats().then(res => {
        if (res.data) {
          setStats({
            ...res.data.kpis,
            system: res.data.system
          });
          // Also set some logs from the system activity if available
          if (res.data.lists?.bookings) {
            const logs = res.data.lists.bookings.map((b: any) => ({
              type: 'TRANSACTION',
              title: `Nouvelle transaction: ${b.total_price} DA`,
              date: b.created_at,
              icon: DollarSign,
              color: 'text-emerald-500',
              bg: 'bg-emerald-500/10'
            }));
            setAllLogs(logs);
          }
        }
      });
      
      // Fetch current tab data
      refreshCurrentTab();
    }
  }, [user, activeTab]);

  const refreshCurrentTab = async () => {
    if (!user) return;
    
    try {
      if (activeTab === "overview") {
        const res = await statsService.getAdminStats();
        if (res.data) {
          setStats({
            ...res.data.kpis,
            system: res.data.system,
            revenueData: res.data.revenueData || []
          });
          if (res.data.lists?.bookings) {
            const logs = res.data.lists.bookings.map((b: any) => ({
              type: 'TRANSACTION',
              title: `Nouvelle transaction: ${b.total_price} DA`,
              date: b.created_at,
              icon: DollarSign,
              color: 'text-emerald-500',
              bg: 'bg-emerald-500/10'
            }));
            setAllLogs(logs);
          }
        }
      } else if (activeTab === "users") {
        const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        if (data) setUsersList(data);
      } else if (activeTab === "items") {
        const { data } = await supabase.from('items').select('*, profiles:owner_id(full_name, email), categories:category_id(name)').order('created_at', { ascending: false });
        if (data) setItemsList(data as any);
      } else if (activeTab === "reviews") {
        const { data } = await supabase.from('reviews').select('*, item:items(title), reviewer:profiles!reviewer_id(full_name)').order('created_at', { ascending: false });
        if (data) setReviewsList(data);
      } else if (activeTab === "reports") {
        const res = await reportsService.getAll();
        if (res.success) setReportsList(res.data);
      }
    } catch (err) {
      console.error("Error refreshing tab:", activeTab, err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleRole = async (userId: string, currentRole: string) => {
    // Database roles are 'user', 'vendeur', 'admin'
    const isVendeur = currentRole.toLowerCase() === "vendeur";
    const newRole = isVendeur ? "user" : "vendeur";
    
    // Optimistic update
    setUsersList(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    
    try {
      const res = await usersService.updateRole(userId, newRole);
      if (!res.success) throw new Error("Failed to update role");
      toast.success(t("admin.roleUpdated") || "Rôle mis à jour");
    } catch (err) {
      console.error("Error toggling role:", err);
      toast.error(t("admin.updateError") || "Erreur lors de la mise à jour");
      // Wait a bit before refreshing to avoid race conditions
      setTimeout(() => refreshCurrentTab(), 500);
    }
  };
  const handleDeleteUser = async (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: t("admin.deleteUserTitle"),
      description: t("admin.deleteUserDesc"),
      actionLabel: t("lender.supprimer"),
      variant: "destructive",
      onConfirm: async () => {
        // Optimistic update
        setUsersList(prev => prev.filter(u => u.id !== id));
        
        try {
          const res = await usersService.delete(id);
          if (!res.success) throw new Error("Failed to delete user");
          toast.success(t("admin.userDeleted"));
        } catch (err) {
          console.error("Error deleting user:", err);
          toast.error(t("admin.deleteError"));
          refreshCurrentTab(); // Rollback
        } finally {
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleToggleStatusItem = async (itemId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "paused" : "active";
    setItemsList(prev => prev.map(i => i.id === itemId ? { ...i, status: newStatus } : i));
    
    try {
        const res = await itemsService.update(itemId, { status: newStatus });
        if (!res.success) throw new Error("Failed to update status");
        toast.success(newStatus === "active" ? t("admin.itemActivated") || "Annonce activée" : t("admin.itemDeactivated") || "Annonce désactivée");
    } catch (err) {
        toast.error(t("admin.updateError"));
        refreshCurrentTab();
    }
  };

  const handleDeleteItem = async (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: t("lender.deleteListingTitle"),
      description: t("lender.deleteListingDesc"),
      actionLabel: t("lender.supprimer"),
      variant: "destructive",
      onConfirm: async () => {
        setItemsList(prev => prev.filter(i => i.id !== id));
        
        try {
          const { error } = await supabase.from('items').delete().eq('id', id);
          if (error) throw error;
          toast.success(t("admin.itemDeleted"));
        } catch (err) {
          console.error("Error deleting item:", err);
          toast.error(t("admin.deleteError"));
          refreshCurrentTab();
        } finally {
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleDeleteReview = (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: t("admin.deleteReviewTitle"),
      description: t("admin.deleteReviewDesc"),
      actionLabel: t("lender.supprimer"),
      variant: "destructive",
      onConfirm: async () => {
        setIsDeletingReview(id);
        setReviewsList(prev => prev.filter(r => r.id !== id));
        
        try {
          await reviewsService.delete(id);
          toast.success(t("admin.reviewDeleted"));
        } catch (error) {
          toast.error(t("admin.deleteError"));
          refreshCurrentTab();
        } finally {
          setIsDeletingReview(null);
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleIgnoreReview = async (id: string) => {
    setIsIgnoringReview(id);
    
    // Immediate local update
    setReviewsList(prev => prev.map(r => r.id === id ? { ...r, is_reported: false } : r));
    
    try {
      await reviewsService.dismissReport(id);
      toast.success(t("admin.reportDismissed") || "Signalement ignoré");
      refreshCurrentTab(); // Refresh in background
    } catch (error) {
      console.error("Error dismissing report:", error);
      toast.error(t("admin.updateError"));
      refreshCurrentTab();
    } finally {
      setIsIgnoringReview(null);
    }
  };

  const handleResolveReport = async (id: string, action: 'dismiss' | 'delete_element', targetType?: string, targetId?: string) => {
    setConfirmConfig({
      isOpen: true,
      title: action === 'dismiss' ? t("admin.ignoreReportTitle") : t("admin.deleteElementTitle"),
      description: action === 'dismiss' 
        ? t("admin.ignoreReportDesc") 
        : t("admin.deleteElementDesc"),
      actionLabel: action === 'dismiss' ? t("admin.ignore") : t("lender.supprimer"),
      variant: action === 'dismiss' ? "default" : "destructive",
      onConfirm: async () => {
        setIsResolvingReport(id);
        
        const finalStatus = 'resolved';
        const finalNotes = action === 'dismiss' ? "Validé via modération" : "Traité par l'admin (supprimé)";
        
        setReportsList(prev => prev.map(r => r.id === id ? { ...r, status: finalStatus, admin_notes: finalNotes } : r));

        try {
          await reportsService.updateStatus(id, finalStatus, finalNotes);

          if (action === 'delete_element') {
            if (targetType === 'item') {
              await itemsService.delete(targetId!);
              setItemsList(prev => prev.filter(i => i.id !== targetId));
            }
            if (targetType === 'review') {
              await reviewsService.delete(targetId!);
              setReviewsList(prev => prev.filter(r => r.id !== targetId));
            }
          }

          toast.success(action === 'dismiss' ? t("admin.reportIgnored") : t("admin.elementDeleted"));
        } catch (error) {
          console.error("Error resolving report:", error);
          toast.error(t("admin.processingError"));
          refreshCurrentTab();
        } finally {
          setIsResolvingReport(null);
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleDeleteReport = async (id: string) => {
    setReportsList(prev => prev.filter(r => r.id !== id));
    
    try {
      const res = await reportsService.delete(id);
      if (res.success) {
        toast.success(t("admin.reportLogDeleted"));
      }
    } catch (error) {
      toast.error(t("admin.deleteError"));
      refreshCurrentTab();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center">
            <Shield className="w-8 h-8 text-[#FF4F5A] animate-pulse" />
          </div>
          <p className="text-muted-foreground text-sm font-medium">{t("admin.loadingAdmin")}</p>
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
              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[#FF4F5A]">{t("report.reportTitle")}</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black mb-2 leading-tight">
              {t("admin.adminCenter").split(" ")[0]} <span className="gradient-text">{t("admin.adminCenter").split(" ")[1]}</span>
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl">
              {t("admin.monitorHealthSubtitle")}
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
            <DashboardSidebar
              items={sidebarItems}
              activeTab={activeTab}
              setActiveTab={(id) => {
                setActiveTab(id as any);
                setHighlightId(null);
                setIsMobileMenuOpen(false);
              }}
              userInitials="AD"
              userFullName="Karrily Admin"
              userEmail={user?.email || ""}
              isMobileMenuOpen={isMobileMenuOpen}
              setIsMobileMenuOpen={setIsMobileMenuOpen}
              extraAction={{
                label: t("admin.leaveAdmin"),
                onClick: () => navigate('/'),
                variant: "destructive"
              }}
            />

            <div className="lg:col-span-9 min-h-[60vh]">
              {activeTab === "overview" && (
                <div className="space-y-8">
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {[
                      { label: t("admin.users"), value: stats.totalUsers, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/10" },
                      { label: t("lender.myListings"), value: stats.totalItems, icon: Package, color: "text-[#FF4F5A]", bg: "bg-[#FF4F5A]/10", border: "border-[#FF4F5A]/10" },
                      { label: t("admin.transactions"), value: stats.totalBookings, icon: Calendar, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/10" },
                      { label: t("admin.grossRevenue"), value: stats.totalRevenue.toLocaleString() + " " + t("common.da"), icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/10" },
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
                          <h2 className="text-lg font-black">
                            {t("admin.revenueEvolution") || "Évolution des"} <span className="text-emerald-500">{t("admin.revenues") || "Revenus"}</span>
                          </h2>
                          <p className="text-xs text-muted-foreground mt-0.5">{t("admin.sixMonths") || "Performances financières des 6 derniers mois"}</p>
                        </div>
                        <div className="px-3 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-bold flex items-center gap-2 border border-emerald-500/20">
                          <TrendingUp className="w-3 h-3" />
                          Croissance
                        </div>
                      </div>
                      
                      <div className="flex-1 w-full mt-2 h-full min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={stats.revenueData || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <XAxis 
                              dataKey="month" 
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 10, fontWeight: 700, fill: "currentColor", opacity: 0.5 }}
                              dy={10}
                            />
                            <YAxis 
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 10, fontWeight: 700, fill: "currentColor", opacity: 0.5 }}
                              tickFormatter={(value) => `${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`}
                              dx={-10}
                            />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" strokeOpacity={0.05} />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: "hsl(var(--card))", 
                                borderColor: "hsl(var(--border))",
                                borderRadius: "1rem",
                                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                                padding: "12px 16px",
                                fontWeight: "bold"
                              }}
                              itemStyle={{ color: "#10b981", fontWeight: 900 }}
                              labelStyle={{ color: "currentColor", opacity: 0.5, marginBottom: "4px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px" }}
                              formatter={(value: number) => [`${value} DA`, t("admin.revenue") || "Revenu"]}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="earnings" 
                              stroke="#10b981" 
                              strokeWidth={4}
                              fillOpacity={1} 
                              fill="url(#colorRevenue)" 
                              activeDot={{ r: 6, fill: "#10b981", strokeWidth: 0 }}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="bg-card rounded-2xl border border-border flex flex-col overflow-hidden h-[480px]">
                      <div className="px-6 py-5 border-b border-border">
                        <h2 className="text-base font-black">{(t("admin.systemLog") !== "admin.systemLog" ? t("admin.systemLog") : "Journal Système").split(" ").slice(0, 1).join(" ")} <span className="text-[#FF4F5A]">{(t("admin.systemLog") !== "admin.systemLog" ? t("admin.systemLog") : "Journal Système").split(" ").slice(1).join(" ")}</span></h2>
                      </div>
                      <div className="flex-1 divide-y divide-border overflow-y-auto no-scrollbar">
                        {displayLogs.slice(0, 10).map((log, idx) => (
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
                        <Button variant="ghost" onClick={() => setActiveTab("logs")} className="w-full rounded-xl h-9 text-[10px] font-bold text-[#FF4F5A] hover:bg-[#FF4F5A]/10">{t("admin.viewAllLogs")}</Button>
                      </div>
                    </motion.div>
                  </div>
                </div>
              )}

              {activeTab === "users" && (
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border rounded-[3rem] p-10 shadow-2xl">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
                    <h3 className="text-2xl font-black">{ (t("admin.userManagement") !== "admin.userManagement" ? t("admin.userManagement") : "Gestion Utilisateurs").split(" ")[0]} <span className="text-[#FF4F5A]">{(t("admin.userManagement") !== "admin.userManagement" ? t("admin.userManagement") : "Gestion Utilisateurs").split(" ")[1]}</span></h3>
                    <div className="relative w-full md:w-96">
                      <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 opacity-20" />
                      <input
                        type="text"
                        placeholder={t("admin.filterByNameEmail") !== "admin.filterByNameEmail" ? t("admin.filterByNameEmail") : "Filtrer par nom ou email..."}
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
                          <th className="py-4 px-6">{t("admin.identity") !== "admin.identity" ? t("admin.identity") : "Identité"}</th>
                          <th className="py-4 px-6">{t("admin.role") !== "admin.role" ? t("admin.role") : "Rôle"}</th>
                          <th className="py-4 px-6 text-right">{t("admin.actions") !== "admin.actions" ? t("admin.actions") : "Actions"}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usersList.filter(u => u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase())).map((u) => (
                          <tr
                            key={u.id}
                            id={`highlight-${u.id}`}
                            className={cn(
                              "group transition-all relative",
                              String(highlightId) === String(u.id) ? "z-10 bg-gradient-to-r from-[#FF4F5A]/10 to-transparent shadow-[0_10px_30px_-5px_rgba(255,79,90,0.15)] animate-[highlightPulse_2s_ease-in-out_3]" : ""
                            )}
                          >
                            {String(highlightId) === String(u.id) && <div className="absolute top-2 right-10 bg-[#FF4F5A] text-white px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg z-20 animate-bounce">{t("dashboard.new") || "NOUVEAU"}</div>}
                            <td className="py-5 px-6 bg-muted/30 rounded-l-2xl border-y border-l border-border">
                              <div className="font-bold text-base">{u.full_name || t("admin.noName")}</div>
                              <div className="text-[10px] font-black uppercase opacity-30 mt-1">{u.email}</div>
                            </td>
                            <td className="py-5 px-6 bg-muted/30 border-y border-border">
                              <span className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                (u.role?.toLowerCase() === 'vendeur') ? 'bg-[#FF4F5A]/10 text-[#FF4F5A]' : 'bg-blue-500/10 text-blue-500'
                              )}>
                                {(u.role?.toLowerCase() === 'vendeur') ? 'Marchand' : 'Client'}
                              </span>
                            </td>
                            <td className="py-5 px-6 bg-muted/30 rounded-r-2xl border-y border-r border-border text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button size="sm" variant="outline" onClick={() => handleToggleRole(u.id, u.role)} className="rounded-xl h-10 px-4 font-black text-[10px] uppercase tracking-widest">
                                  {t("admin.changeRole") !== "admin.changeRole" ? t("admin.changeRole") : "Changer Rôle"}
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => handleDeleteUser(u.id)} className="w-10 h-10 opacity-30 hover:opacity-100 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all flex items-center justify-center">
                                  <Trash2 className="w-4 h-4" />
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
                  <h3 className="text-2xl font-black mb-10">{(t("admin.itemManagement") !== "admin.itemManagement" ? t("admin.itemManagement") : "Gestion Annonces").split(" ")[0]} <span className="text-[#FF4F5A]">{(t("admin.itemManagement") !== "admin.itemManagement" ? t("admin.itemManagement") : "Gestion Annonces").split(" ")[1]}</span></h3>
                  <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-separate border-spacing-y-3">
                      <thead>
                        <tr className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">
                          <th className="py-4 px-6">{t("admin.item") !== "admin.item" ? t("admin.item") : "Annonce"}</th>
                          <th className="py-4 px-6">{t("admin.price") !== "admin.price" ? t("admin.price") : "Prix"}</th>
                          <th className="py-4 px-6">{t("admin.owner") !== "admin.owner" ? t("admin.owner") : "Propriétaire"}</th>
                          <th className="py-4 px-6 text-center">{t("admin.status") !== "admin.status" ? t("admin.status") : "Statut"}</th>
                          <th className="py-4 px-6 text-right">{t("admin.actions") !== "admin.actions" ? t("admin.actions") : "Actions"}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {itemsList.map((item) => (
                          <tr
                            key={item.id}
                            id={`highlight-${item.id}`}
                            className={cn(
                              "group transition-all relative",
                              String(highlightId) === String(item.id) ? "z-10 bg-gradient-to-r from-[#FF4F5A]/10 to-transparent shadow-[0_10px_30px_-5px_rgba(255,79,90,0.15)] animate-[highlightPulse_2s_ease-in-out_3]" : ""
                            )}
                          >
                            {String(highlightId) === String(item.id) && <div className="absolute top-2 right-10 bg-[#FF4F5A] text-white px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg z-20 animate-bounce">{t("dashboard.new") || "NOUVEAU"}</div>}
                            <td className="py-5 px-6 bg-muted/30 rounded-l-2xl border-y border-l border-border">
                              <div className="font-bold text-base truncate max-w-[200px]" title={item.title}>{item.title}</div>
                              <div className="text-[10px] font-black uppercase opacity-30 mt-1">{item.categories?.name || t("common.general")}</div>
                            </td>
                            <td className="py-5 px-6 bg-muted/30 border-y border-border font-black">
                              {item.price_per_day} {t("common.da")}/ {t("landing.day")}
                            </td>
                            <td className="py-5 px-6 bg-muted/30 border-y border-border">
                              <div className="font-bold text-sm">{item.profiles?.full_name}</div>
                              <div className="text-[10px] opacity-30">{item.profiles?.email}</div>
                            </td>
                            <td className="py-5 px-6 bg-muted/30 border-y border-border text-center">
                                <span className={cn(
                                  "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border",
                                  item.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                                  item.status === 'paused' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                                  'bg-white/10 opacity-40'
                                )}>
                                  {item.status === 'active' ? t("admin.activeStatus") || "Active" : 
                                   item.status === 'paused' ? t("admin.deactivatedStatus") || "Désactivée" : 
                                   item.status}
                                </span>
                            </td>
                            <td className="py-5 px-6 bg-muted/30 rounded-r-2xl border-y border-r border-border text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="rounded-xl h-10 px-4 font-black text-[10px] uppercase tracking-widest"
                                  onClick={() => handleToggleStatusItem(item.id, item.status)}
                                >
                                  {item.status === 'active' ? (t("admin.deactivate") !== "admin.deactivate" ? t("admin.deactivate") : "Désactiver") : (t("admin.activate") !== "admin.activate" ? t("admin.activate") : "Activer")}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="w-10 h-10 opacity-30 hover:opacity-100 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                >
                                  <Trash2 className="w-4 h-4" />
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

              {activeTab === "reviews" && (
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border rounded-[3rem] p-10 shadow-2xl">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
                    <div>
                      <h3 className="text-2xl font-black">{(t("admin.reviewModeration") !== "admin.reviewModeration" ? t("admin.reviewModeration") : "Modération des Avis").split(" ").slice(0, 2).join(" ")} <span className="text-[#FF4F5A]">{(t("admin.reviewModeration") !== "admin.reviewModeration" ? t("admin.reviewModeration") : "Modération des Avis").split(" ").slice(2).join(" ")}</span></h3>
                      <p className="text-sm text-muted-foreground mt-1">{t("admin.reviewModerationDesc") !== "admin.reviewModerationDesc" ? t("admin.reviewModerationDesc") : "Gérez et modérez les retours d'expérience des utilisateurs."}</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-separate border-spacing-y-3">
                      <thead>
                        <tr className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">
                          <th className="py-4 px-6">{t("admin.users") !== "admin.users" ? t("admin.users") : "Utilisateurs"}</th>
                          <th className="py-4 px-6">{t("admin.item") !== "admin.item" ? t("admin.item") : "Article"}</th>
                          <th className="py-4 px-6">{t("admin.rating") !== "admin.rating" ? t("admin.rating") : "Note"}</th>
                          <th className="py-4 px-6">{t("admin.comment") !== "admin.comment" ? t("admin.comment") : "Commentaire"}</th>
                          <th className="py-4 px-6">{t("admin.date") !== "admin.date" ? t("admin.date") : "Date"}</th>
                          <th className="py-4 px-6 text-right">{t("admin.actions") !== "admin.actions" ? t("admin.actions") : "Actions"}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reviewsList.map((review) => (
                          <tr
                            key={review.id}
                            id={`highlight-${review.id}`}
                            className={cn(
                              "group transition-all relative",
                              String(highlightId) === String(review.id) ? "z-10 bg-gradient-to-r from-[#FF4F5A]/10 to-transparent shadow-[0_10px_30px_-5px_rgba(255,79,90,0.15)] animate-[highlightPulse_2s_ease-in-out_3]" : ""
                            )}
                          >
                            {String(highlightId) === String(review.id) && <div className="absolute top-2 right-10 bg-[#FF4F5A] text-white px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg z-20 animate-bounce">{t("dashboard.new") || "NOUVEAU"}</div>}
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
                              <div className="flex items-center justify-end gap-2">
                                {review.is_reported && (
                                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-lg">
                                    <AlertCircle className="w-3 h-3" /> Signalé
                                  </span>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleIgnoreReview(review.id)}
                                  disabled={isIgnoringReview === review.id}
                                  className={cn(
                                    "w-9 h-9 rounded-xl transition-all",
                                    review.is_reported ? "text-emerald-500 hover:bg-emerald-500/10" : "text-emerald-500/50 hover:text-emerald-500 hover:bg-emerald-500/10"
                                  )}
                                  title="Marquer comme validé / Ignorer"
                                >
                                  {isIgnoringReview === review.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteReview(review.id)}
                                  disabled={isDeletingReview === review.id}
                                  className="w-9 h-9 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                  title="Supprimer l'avis"
                                >
                                  {isDeletingReview === review.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
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

              {activeTab === "reports" && (
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border rounded-[3rem] p-10 shadow-2xl">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
                    <div>
                      <h3 className="text-2xl font-black">{(t("admin.reportModeration") !== "admin.reportModeration" ? t("admin.reportModeration") : "Modération des Signalements").split(" ").slice(0, 2).join(" ")} <span className="text-[#FF4F5A]">{(t("admin.reportModeration") !== "admin.reportModeration" ? t("admin.reportModeration") : "Modération des Signalements").split(" ").slice(2).join(" ")}</span></h3>
                      <p className="text-sm text-muted-foreground mt-1">{t("admin.reportModerationDesc") !== "admin.reportModerationDesc" ? t("admin.reportModerationDesc") : "Gérez les alertes de contenu inapproprié envoyées par les utilisateurs."}</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-separate border-spacing-y-3">
                      <thead>
                        <tr className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">
                          <th className="py-4 px-6">{t("admin.source") !== "admin.source" ? t("admin.source") : "Source"}</th>
                          <th className="py-4 px-6">{t("admin.elementType") !== "admin.elementType" ? t("admin.elementType") : "Élément / Type"}</th>
                          <th className="py-4 px-6">{t("admin.reasonDetails") !== "admin.reasonDetails" ? t("admin.reasonDetails") : "Motif & Détails"}</th>
                          <th className="py-4 px-6">{t("admin.status") !== "admin.status" ? t("admin.status") : "Statut"}</th>
                          <th className="py-4 px-6 text-right">{t("admin.moderation") !== "admin.moderation" ? t("admin.moderation") : "Modération"}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportsList.map((report) => (
                          <tr
                            key={report.id}
                            id={`highlight-${report.id}`}
                            className={cn(
                              "group transition-all relative",
                              String(highlightId) === String(report.id) ? "z-10 bg-gradient-to-r from-[#FF4F5A]/10 to-transparent shadow-[0_10px_30px_-5px_rgba(255,79,90,0.15)] animate-[highlightPulse_2s_ease-in-out_3]" : ""
                            )}
                          >
                            {String(highlightId) === String(report.id) && <div className="absolute top-2 right-10 bg-[#FF4F5A] text-white px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg z-20 animate-bounce">{t("dashboard.new") || "NOUVEAU"}</div>}
                            <td className="py-5 px-6 bg-muted/30 rounded-l-3xl border-y border-l border-border">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#FF4F5A]/10 flex items-center justify-center text-[#FF4F5A] font-black text-[10px]">
                                  {report.reporter?.full_name?.charAt(0) || "U"}
                                </div>
                                <div>
                                  <div className="font-bold text-sm leading-none">{report.reporter?.full_name || "Anonyme"}</div>
                                  <div className="text-[9px] font-black opacity-30 uppercase tracking-tighter mt-1">{new Date(report.created_at).toLocaleDateString()}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-5 px-6 bg-muted/30 border-y border-border">
                              <div className="flex flex-col gap-1.5">
                                <span className={cn(
                                  "px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border w-fit",
                                  report.reported_item_id ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 
                                  report.reported_review_id ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                                  'bg-purple-500/10 text-purple-500 border-purple-500/20'
                                )}>
                                  {report.reported_item_id ? t("admin.product") : report.reported_review_id ? t("admin.review") : t("admin.user")}
                                </span>
                                <div className="font-bold text-xs truncate max-w-[180px] leading-tight">
                                  {report.reported_item_id && !report.item ? (
                                    <span className="text-muted-foreground italic">[Article supprimé]</span>
                                  ) : report.item ? (
                                    report.item.title
                                  ) : report.reported_user_id && !report.reported_user ? (
                                    <span className="text-muted-foreground italic">[Utilisateur supprimé]</span>
                                  ) : report.reported_user ? (
                                    report.reported_user.full_name
                                  ) : report.reported_review_id && !report.review ? (
                                    <span className="text-muted-foreground italic">[Avis supprimé]</span>
                                  ) : report.review ? (
                                    report.review.comment
                                  ) : 'N/A'}
                                </div>
                              </div>
                            </td>
                             <td className="py-5 px-6 bg-muted/30 border-y border-border">
                               <div className="font-black text-[11px] text-[#FF4F5A] mb-1">{REASON_LABELS[report.reason] || report.reason}</div>
                              <div className="text-[10px] font-medium opacity-60 line-clamp-1 italic">"{report.description || t("report.noDescription")}"</div>
                            </td>
                            <td className="py-5 px-6 bg-muted/30 border-y border-border">
                              <span className={cn(
                                "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border flex items-center justify-center gap-1.5 w-fit",
                                report.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                                report.status === 'resolved' && report.admin_notes?.includes('Validé') ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                                'bg-white/10 text-muted-foreground border-border/50'
                              )}>
                                {report.status === 'pending' && <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
                                {report.status === 'pending' ? t("report.pendingStatus") : report.status === 'resolved' && report.admin_notes?.includes('Validé') ? t("report.ignored") : t("report.resolved")}
                              </span>
                            </td>
                            <td className="py-5 px-6 bg-muted/30 rounded-r-3xl border-y border-r border-border text-right">
                              {report.status === 'pending' ? (
                                <div className="flex items-center justify-end gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-9 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-muted/80"
                                    onClick={() => handleResolveReport(report.id, 'dismiss')}
                                  >
                                    {t("report.ignore")}
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="destructive" 
                                    className="h-9 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-500/10"
                                    onClick={() => handleResolveReport(
                                      report.id, 
                                      'delete_element', 
                                      report.reported_item_id ? 'item' : report.reported_review_id ? 'review' : 'user',
                                      report.reported_item_id || report.reported_review_id || report.reported_user_id
                                    )}
                                  >
                                    {t("lender.supprimer")}
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-end">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteReport(report.id)}
                                    className="w-10 h-10 opacity-30 hover:opacity-100 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              )}
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
                        <h3 className="text-2xl font-black">{(t("admin.systemLog") !== "admin.systemLog" ? t("admin.systemLog") : "Journal Système").split(" ")[0]} <span className="text-[#FF4F5A]">{(t("admin.systemLog") !== "admin.systemLog" ? t("admin.systemLog") : "Journal Système").split(" ")[1]}</span></h3>
                        <p className="text-muted-foreground text-sm mt-1">{t("dashboard.activity") !== "dashboard.activity" ? t("dashboard.activity") : "Activité récente"}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {displayLogs.map((log, idx) => (
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
            <AlertDialogCancel className="rounded-xl font-bold">{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmConfig.onConfirm} className={cn("rounded-xl px-8 font-black text-xs uppercase tracking-widest shadow-lg transition-all", confirmConfig.variant === "destructive" ? "bg-red-500 hover:bg-red-600 shadow-red-500/20" : "bg-[#FF4F5A] hover:bg-[#FF4F5A]/90 shadow-[#FF4F5A]/20")}>{confirmConfig.actionLabel}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
