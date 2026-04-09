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
  UserCheck
} from "lucide-react";
import { Button } from "../components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "../store/auth.store";
import { supabase } from "../lib/supabase";

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

  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalItems: 0,
    totalBookings: 0,
    totalRevenue: 0,
  });

  // Data lists
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [itemsList, setItemsList] = useState<Item[]>([]);
  const [bookingsList, setBookingsList] = useState<Booking[]>([]);

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  // Check admin rights
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        navigate("/login");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!data || data.role !== "admin") {
        navigate("/dashboard");
      } else {
        fetchDashboardData();
      }
    };

    checkAdmin();
  }, [user]);

  const fetchDashboardData = async () => {
    setIsLoading(true);

    try {
      // 1. Fetch Stats
      const [{ count: userCount }, { count: itemCount }, { count: bookingCount }, { data: revenueData }] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("items").select("*", { count: "exact", head: true }),
        supabase.from("bookings").select("*", { count: "exact", head: true }),
        supabase.from("bookings").select("total_price").eq("status", "completed"),
      ]);

      const revenue = revenueData ? revenueData.reduce((acc, curr) => acc + (Number(curr.total_price) || 0), 0) : 0;

      setStats({
        totalUsers: userCount || 0,
        totalItems: itemCount || 0,
        totalBookings: bookingCount || 0,
        totalRevenue: revenue,
      });

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
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F1415]/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FF4F5A] to-[#FF6B74] rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Karrily Admin</h1>
                <p className="text-xs text-gray-400">Control Panel</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" className="text-gray-400 hover:text-white" onClick={() => navigate("/")}>
                Quitter l'admin
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-white mb-2">Vue d'ensemble du système</h2>
            <p className="text-xl text-gray-400">Surveillez et gérez votre plateforme à 200%</p>
          </div>

          {/* Tab Navigation */}
          <div className="bg-[#0F1415] border border-white/10 rounded-3xl p-2 shadow-2xl mb-8 flex flex-wrap gap-2">
            {[
              { id: "overview", label: "Vue d'ensemble", icon: BarChart3 },
              { id: "users", label: "Utilisateurs", icon: Users },
              { id: "items", label: "Annonces", icon: Package },
              { id: "bookings", label: "Réservations", icon: Calendar }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-medium transition-all ${activeTab === tab.id
                    ? "bg-gradient-to-br from-[#FF4F5A] to-[#FF6B74] text-white shadow-xl shadow-[#FF4F5A]/30"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Utilisateurs Inscrits", value: stats.totalUsers, icon: Users, gradient: "from-[#1A4851] to-[#0F2A2E]" },
                  { label: "Annonces Totales", value: stats.totalItems, icon: Package, gradient: "from-[#FF4F5A] to-[#FF6B74]" },
                  { label: "Réservations", value: stats.totalBookings, icon: Calendar, gradient: "from-[#1A4851] to-[#0F2A2E]" },
                  { label: "Chiffre d'Affaire", value: `${stats.totalRevenue.toLocaleString()} DA`, icon: DollarSign, gradient: "from-[#FF4F5A] to-[#FF6B74]" },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className="bg-[#0F1415] border border-white/10 rounded-3xl p-6 relative overflow-hidden group"
                  >
                    <div className={`absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br ${stat.gradient} opacity-20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`} />
                    <div className="flex items-center justify-between mb-4 relative z-10">
                      <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-2xl flex items-center justify-center`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="text-4xl font-bold text-white mb-1 relative z-10">{stat.value}</div>
                    <div className="text-gray-400 relative z-10">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0F1415] border border-white/10 rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Gestion des Utilisateurs</h3>
                <div className="relative w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Chercher un email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 h-11 bg-white/5 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-[#FF4F5A]"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400 text-sm">
                      <th className="py-4 px-4 font-semibold">Utilisateur</th>
                      <th className="py-4 px-4 font-semibold hidden md:table-cell">Email</th>
                      <th className="py-4 px-4 font-semibold">Rôle</th>
                      <th className="py-4 px-4 font-semibold text-center">Statut (Vérifié)</th>
                      <th className="py-4 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.filter(u => u.email.includes(searchQuery.toLowerCase()) || u.full_name.toLowerCase().includes(searchQuery.toLowerCase())).map((u) => (
                      <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-4 px-4">
                          <div className="font-medium text-white">{u.full_name || "Sans nom"}</div>
                          <div className="text-xs text-gray-500 md:hidden">{u.email}</div>
                        </td>
                        <td className="py-4 px-4 text-gray-400 hidden md:table-cell">{u.email}</td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded text-xs ${u.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => handleToggleVerification(u.id, u.is_verified)}
                            title={u.is_verified ? "Révoquer la vérification" : "Vérifier l'utilisateur"}
                          >
                            {u.is_verified
                              ? <UserCheck className="w-5 h-5 text-green-500 mx-auto" />
                              : <UserX className="w-5 h-5 text-gray-600 mx-auto hover:text-white" />
                            }
                          </button>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Button
                            onClick={() => handleImpersonate(u.id, u.full_name, u.email)}
                            variant="destructive"
                            size="sm"
                            className="bg-[#FF4F5A] hover:bg-red-600 text-white rounded-full text-xs"
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
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0F1415] border border-white/10 rounded-3xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Gestion des Annonces</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400 text-sm">
                      <th className="py-4 px-4 font-semibold">Titre</th>
                      <th className="py-4 px-4 font-semibold">Catégorie</th>
                      <th className="py-4 px-4 font-semibold hidden lg:table-cell">Propriétaire</th>
                      <th className="py-4 px-4 font-semibold">Prix</th>
                      <th className="py-4 px-4 font-semibold">Statut</th>
                      <th className="py-4 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemsList.map((item) => (
                      <tr key={item.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-4 px-4">
                          <div className="font-medium text-white truncate max-w-[200px]" title={item.title}>{item.title}</div>
                        </td>
                        <td className="py-4 px-4 text-gray-400">{item.categories?.name}</td>
                        <td className="py-4 px-4 text-gray-400 hidden lg:table-cell truncate max-w-[200px]" title={item.profiles?.email}>
                          {item.profiles?.full_name} <br /> <span className="text-xs opacity-50">{item.profiles?.email}</span>
                        </td>
                        <td className="py-4 px-4 text-white">{item.price_per_day?.toLocaleString() || 0} DA/j</td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${item.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-500'
                            }`}>
                            {item.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right flex justify-end gap-2">
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-full bg-transparent border-white/20 text-white" onClick={() => navigate(`/item/${item.id}`)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            className={`h-8 px-3 rounded-full text-xs ${item.status === 'active' ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/40' : 'bg-green-500/20 text-green-400 hover:bg-green-500/40'}`}
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
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0F1415] border border-white/10 rounded-3xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Gestion des Réservations</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400 text-sm">
                      <th className="py-4 px-4 font-semibold">Annonce</th>
                      <th className="py-4 px-4 font-semibold">Acteurs (Locataire ↔ Proprio)</th>
                      <th className="py-4 px-4 font-semibold">Dates</th>
                      <th className="py-4 px-4 font-semibold">Total</th>
                      <th className="py-4 px-4 font-semibold">Statut</th>
                      <th className="py-4 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookingsList.map((booking) => (
                      <tr key={booking.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-4 px-4 text-white font-medium truncate max-w-[150px]" title={booking.items?.title}>{booking.items?.title}</td>
                        <td className="py-4 px-4 text-gray-400 text-sm">
                          <span className="text-blue-400">{booking.renter?.full_name}</span>
                          <span className="mx-2">→</span>
                          <span className="text-purple-400">{booking.owner?.full_name}</span>
                        </td>
                        <td className="py-4 px-4 text-gray-500 text-xs">
                          {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4 text-white font-bold">{booking.total_price.toLocaleString()} DA</td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs truncate
                            ${booking.status === 'completed' ? 'bg-green-500/20 text-green-400' : ''}
                            ${booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : ''}
                            ${booking.status === 'active' ? 'bg-blue-500/20 text-blue-400' : ''}
                            ${booking.status === 'cancelled' || booking.status === 'rejected' ? 'bg-red-500/20 text-red-500' : ''}
                          `}>
                            {booking.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          {booking.status !== "cancelled" && booking.status !== "rejected" && booking.status !== "completed" && (
                            <Button
                              onClick={() => handleCancelBooking(booking.id)}
                              size="sm"
                              variant="outline"
                              className="border-red-500/50 text-red-400 hover:bg-red-500/20 h-7 text-xs rounded-full p-0 px-3"
                            >
                              Forcer Annulation
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
  );
}
