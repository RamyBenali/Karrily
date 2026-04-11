import { Navigation } from "../components/layout/navigation";
import { motion } from "motion/react";
import { Plus, Package, Calendar, TrendingUp, DollarSign, Edit2, Trash2, Eye, BarChart3, CheckCircle, XCircle, MapPin } from "lucide-react";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { useAuthStore } from "../store/auth.store";
import { usersService, bookingsService, itemsService, salesService, trocService } from "../services/api.service";
import { supabase } from "../lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";
import { ShoppingCart, RefreshCw } from "lucide-react";

const earningsData = [
  { month: "Jan", earnings: 1200 },
  { month: "Feb", earnings: 1800 },
  { month: "Mar", earnings: 2400 },
  { month: "Apr", earnings: 2100 },
  { month: "May", earnings: 2800 },
  { month: "Jun", earnings: 3200 },
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
  const [activeView, setActiveView] = useState<"overview" | "listings" | "bookings" | "sales" | "troc" | "earnings">("overview");

  const [myListings, setMyListings] = useState<any[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [mySales, setMySales] = useState<any[]>([]);
  const [trocProposals, setTrocProposals] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalEarnings: 0, activeListings: 0, totalBookings: 0 });

  useEffect(() => {
    if (!user) return;
    
    // Fetch Items
    usersService.getUserItems(user.id).then(res => {
      setMyListings(res.data);
      setStats(prev => ({ ...prev, activeListings: res.data.length }));
    });

    let channel: RealtimeChannel;

    // Fetch Bookings where user is owner
    const fetchBookings = async () => {
      try {
        const res = await bookingsService.getMyBookings({ role: 'owner' });
        setUpcomingBookings(res.data);
        setStats(prev => ({ ...prev, totalBookings: res.data.length }));

        // Subscribe to changes for this owner
        channel = supabase
          .channel(`lender_bookings:${user.id}`)
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "bookings", filter: `owner_id=eq.${user.id}` },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                fetchBookings(); // Easier to re-fetch to get item/renter details
              } else if (payload.eventType === 'UPDATE') {
                setUpcomingBookings(prev => prev.map(b => b.id === payload.new.id ? { ...b, ...payload.new } : b));
              } else if (payload.eventType === 'DELETE') {
                setUpcomingBookings(prev => prev.filter(b => b.id !== payload.old.id));
              }
            }
          )
          .subscribe();
      } catch (err) {
        console.error("Error fetching lender bookings:", err);
      }
    };

    // Fetch Sales
    const fetchSales = async () => {
      const res = await salesService.getMySales({ role: 'seller' });
      setMySales(res.data);
    };

    // Fetch Troc Proposals
    const fetchTroc = async () => {
      const res = await trocService.getMyProposals({ role: 'owner' });
      setTrocProposals(res.data);
    };

    fetchBookings();
    fetchSales();
    fetchTroc();

    // Sales Realtime
    const salesChannel = supabase
      .channel(`lender_sales:${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "sales", filter: `seller_id=eq.${user.id}` }, () => fetchSales())
      .subscribe();

    // Troc Realtime
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

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette annonce ?")) return;
    try {
      await itemsService.delete(id);
      setMyListings(prev => prev.filter(i => i.id !== id));
    } catch(err) {
      alert("Erreur lors de la suppression.");
    }
  };

  const handleUpdateTrocStatus = async (id: string, status: string) => {
    try {
      await trocService.updateStatus(id, status);
      setTrocProposals(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    } catch(err) {
      alert("Erreur de modification du statut.");
    }
  };

  const handleUpdateSaleStatus = async (id: string, status: string) => {
    try {
      let delivery_info = undefined;
      if (status === 'accepted') {
        const info = prompt("Veuillez entrer les détails pour la livraison (Lieu de RDV, mode d'envoi, etc.) :");
        if (info === null) return; // Cancel if prompt cancelled
        delivery_info = info;
      }
      await salesService.updateStatus(id, status, delivery_info);
      setMySales(prev => prev.map(s => s.id === id ? { ...s, status, delivery_info: delivery_info || s.delivery_info } : s));
    } catch(err) {
      alert("Erreur de modification du statut.");
    }
  };

  const handleUpdateBookingStatus = async (id: string, status: string) => {
    try {
      await bookingsService.updateStatus(id, status);
      setUpcomingBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    } catch(err) {
      alert("Erreur de modification du statut.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <div className="pt-24 pb-16">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 lg:mb-8 gap-4"
          >
            <div>
              <h1 className="text-3xl lg:text-5xl font-bold text-foreground mb-2 leading-tight">Propriétaire</h1>
              <p className="text-lg lg:text-xl text-muted-foreground hidden lg:block">Gérez vos annonces et suivez vos revenus</p>
            </div>
            <Button onClick={() => navigate("/create")} className="w-full md:w-auto bg-[#FF4F5A] hover:bg-[#FF4F5A]/90 text-white px-6 h-12 rounded-full shadow-xl shadow-[#FF4F5A]/30 group">
              <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
              Publier une annonce
            </Button>
          </motion.div>

          {/* Mobile Tab Navigation - Horizontal Scroll */}
          <div className="lg:hidden -mx-6 px-6 mb-6 overflow-x-auto no-scrollbar scroll-smooth flex items-center gap-2 pb-2">
            {[
              { id: "overview", label: "Aperçu", icon: BarChart3 },
              { id: "listings", label: "Annonces", icon: Package },
              { id: "bookings", label: "Locations", icon: Calendar },
              { id: "sales", label: "Ventes", icon: ShoppingCart },
              { id: "troc", label: "Troc", icon: RefreshCw },
              { id: "earnings", label: "Revenus", icon: DollarSign }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                  activeView === tab.id
                    ? "bg-[#0F2A2E] text-white shadow-lg shadow-[#0F2A2E]/20"
                    : "bg-card text-muted-foreground border border-border"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Desktop Tab Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="hidden lg:inline-flex bg-card rounded-3xl p-2 shadow-lg border border-border mb-8 gap-2 flex-wrap"
          >
            {[
              { id: "overview", label: "Vue d'ensemble", icon: BarChart3 },
              { id: "listings", label: "Mes annonces", icon: Package },
              { id: "bookings", label: "Locations", icon: Calendar },
              { id: "sales", label: "Ventes", icon: ShoppingCart },
              { id: "troc", label: "Troc", icon: RefreshCw },
              { id: "earnings", label: "Revenus", icon: DollarSign }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-medium transition-all ${
                  activeView === tab.id
                    ? "bg-[#0F2A2E] text-white shadow-lg"
                    : "text-foreground/80 hover:bg-muted"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </motion.div>

          {/* Overview */}
          {activeView === "overview" && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { 
                    label: "Revenus Totaux", 
                    value: "0 DZD", 
                    change: "-", 
                    icon: DollarSign, 
                    color: "#FF4F5A",
                    bgGradient: "from-[#FF4F5A] to-[#FF6B74]"
                  },
                  { 
                    label: "Annonces Actives", 
                    value: stats.activeListings, 
                    change: "Aujourd'hui", 
                    icon: Package, 
                    color: "#0F2A2E",
                    bgGradient: "from-[#0F2A2E] to-[#1A4851]"
                  },
                  { 
                    label: "Réservations", 
                    value: stats.totalBookings, 
                    change: "Toutes", 
                    icon: Calendar, 
                    color: "#0F2A2E",
                    bgGradient: "from-[#0F2A2E] to-[#1A4851]"
                  },
                  { 
                    label: "Note Moyenne", 
                    value: "N/A", 
                    change: "-", 
                    icon: TrendingUp, 
                    color: "#FF4F5A",
                    bgGradient: "from-[#FF4F5A] to-[#FF6B74]"
                  }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className={`bg-gradient-to-br ${stat.bgGradient} rounded-3xl p-6 text-white shadow-xl`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                        <stat.icon className="w-6 h-6" />
                      </div>
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-sm font-medium">
                        {stat.change}
                      </span>
                    </div>
                    <div className="text-4xl font-bold mb-1">{stat.value}</div>
                    <div className="text-white/80">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* Earnings Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card rounded-3xl p-8 shadow-xl border border-border"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-1">Aperçu des revenus</h2>
                    <p className="text-muted-foreground">Vos tendances de gains mensuels</p>
                  </div>
                </div>
                <div className="h-80 opacity-50">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={earningsData}>
                      <defs>
                        <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FF4F5A" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#FF4F5A" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '12px'
                        }} 
                      />
                      <Area type="monotone" dataKey="earnings" stroke="#FF4F5A" strokeWidth={3} fillOpacity={1} fill="url(#colorEarnings)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>
          )}

          {/* My Listings */}
          {activeView === "listings" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-3xl p-8 shadow-xl border border-border"
            >
              <h2 className="text-2xl font-bold text-foreground mb-6">Mes Annonces</h2>
              <div className="space-y-4">
                {myListings.map((listing) => (
                  <div
                    key={listing.id}
                    className="flex flex-col md:flex-row gap-6 p-6 bg-muted/50 rounded-3xl hover:shadow-lg transition-all group"
                  >
                    <div className="w-full md:w-56 h-40 rounded-2xl overflow-hidden flex-shrink-0">
                      <ImageWithFallback
                        src={listing.thumbnail_url || "https://placehold.co/400x300"}
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <span className="inline-block px-3 py-1 bg-card text-foreground/80 text-xs font-medium rounded-full mb-2">
                            {listing.category?.name || "Général"}
                          </span>
                          <h3 className="text-xl font-bold text-foreground">{listing.title}</h3>
                          <div className="flex items-baseline gap-2 mt-2">
                            {listing.price_per_day && (
                                <>
                                  <span className="text-2xl font-bold text-foreground">{listing.price_per_day} DZD</span>
                                  <span className="text-muted-foreground">/ jour</span>
                                </>
                            )}
                            {!listing.price_per_day && listing.sale_price && (
                                 <span className="text-2xl font-bold text-foreground">{listing.sale_price} DZD</span>
                            )}
                          </div>
                        </div>
                        <span className={`px-4 py-2 rounded-full text-sm font-medium ${listing.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-muted text-foreground/80'}`}>
                          {listing.status === 'active' ? "Actif" : "Brouillon"}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Vues</div>
                          <div className="text-lg font-bold text-foreground">{listing.view_count || 0}</div>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-4">
                        <Button 
                          size="sm" 
                          onClick={() => navigate(`/item/${listing.id}`)}
                          className="bg-[#0F2A2E] hover:bg-[#1A4851] text-white rounded-full"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Voir
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => navigate(`/edit-item/${listing.id}`)} className="rounded-full">
                          <Edit2 className="w-4 h-4 mr-2" />
                          Modifier
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteItem(listing.id)} className="rounded-full text-red-600 border-red-200 hover:bg-red-50">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {myListings.length === 0 && (
                   <p className="text-muted-foreground p-4 font-medium">Vous n'avez publié aucune annonce.</p>
                )}
              </div>
            </motion.div>
          )}

          {/* Bookings */}
          {activeView === "bookings" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-3xl p-8 shadow-xl border border-border"
            >
              <h2 className="text-2xl font-bold text-foreground mb-6">Demandes & Réservations</h2>
              <div className="space-y-4">
                {upcomingBookings.map((booking) => {
                  const isStarted = new Date() >= new Date(booking.start_date);
                  const isEnded = new Date() >= new Date(booking.end_date);
                  
                  return (
                    <div
                      key={booking.id}
                      className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 bg-muted/50 rounded-3xl"
                    >
                      <div className="flex-1 mb-4 md:mb-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-12 h-12 bg-[#0F2A2E] rounded-full flex items-center justify-center text-white font-bold">
                            {booking.renter?.full_name ? booking.renter.full_name[0] : "U"}
                          </div>
                          <div>
                            <h4 className="font-bold text-foreground">{booking.renter?.full_name || "Utilisateur"}</h4>
                            <p className="text-sm text-muted-foreground">{booking.item?.title || "Annonce"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground ml-15">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Gains Prévus</div>
                          <div className="text-xl font-bold text-foreground">{booking.total_price} DZD</div>
                          <div className={`text-xs font-semibold mt-1 uppercase tracking-wide px-3 py-1 rounded-full inline-block ${
                            booking.status === 'confirmed' ? 'bg-blue-100 text-blue-700' : 
                            booking.status === 'active' ? 'bg-green-100 text-green-700' :
                            booking.status === 'completed' ? 'bg-muted text-foreground/80' :
                            booking.status === 'cancelled' || booking.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                            'bg-amber-100 text-amber-700'
                          }`}>
                             {booking.status === 'pending' ? 'En attente' : 
                              booking.status === 'confirmed' ? 'Confirmée' : 
                              booking.status === 'active' ? 'En cours' :
                              booking.status === 'completed' ? 'Terminée' :
                              booking.status === 'rejected' ? 'Refusée' : 'Annulée'}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          {booking.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleUpdateBookingStatus(booking.id, 'confirmed')} className="bg-green-600 hover:bg-green-700 text-white rounded-full h-8 px-4">
                                <CheckCircle className="w-4 h-4 mr-1" /> Accepter
                              </Button>
                              <Button size="sm" onClick={() => handleUpdateBookingStatus(booking.id, 'rejected')} variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 rounded-full h-8 px-4">
                                <XCircle className="w-4 h-4 mr-1" /> Refuser
                              </Button>
                            </div>
                          )}
                          {booking.status === 'confirmed' && isStarted && (
                            <Button size="sm" onClick={() => handleUpdateBookingStatus(booking.id, 'active')} className="bg-[#0F2A2E] hover:bg-[#1A4851] text-white rounded-full h-8 px-4">
                               <Package className="w-4 h-4 mr-1" /> Confirmer la remise
                            </Button>
                          )}
                          {booking.status === 'active' && (
                            <Button size="sm" onClick={() => handleUpdateBookingStatus(booking.id, 'completed')} className="bg-green-600 hover:bg-green-700 text-white rounded-full h-8 px-4">
                               <CheckCircle className="w-4 h-4 mr-1" /> Confirmer le retour
                            </Button>
                          )}
                          {['completed', 'rejected', 'cancelled'].includes(booking.status) && (
                             <Button size="sm" variant="outline" onClick={() => navigate(`/item/${booking.item_id}`)} className="rounded-full h-8 px-4">
                                Voir l'annonce
                             </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {upcomingBookings.length === 0 && (
                   <p className="text-muted-foreground p-4">Aucune demande de réservation pour le moment.</p>
                )}
              </div>
            </motion.div>
          )}

          {/* Sales */}
          {activeView === "sales" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-3xl p-8 shadow-xl border border-border"
            >
              <h2 className="text-2xl font-bold text-foreground mb-6">Demandes d'Achat</h2>
              <div className="space-y-4">
                {mySales.map((sale) => (
                  <div
                    key={sale.id}
                    className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 bg-muted/50 rounded-3xl"
                  >
                    <div className="flex-1 mb-4 md:mb-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                          {sale.buyer?.full_name ? sale.buyer.full_name[0] : "B"}
                        </div>
                        <div>
                          <h4 className="font-bold text-foreground">{sale.buyer?.full_name || "Acheteur"}</h4>
                          <p className="text-sm text-muted-foreground">{sale.item?.title || "Objet"}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground italic ml-[60px]">"{sale.message || "Pas de message."}"</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Prix de vente</div>
                        <div className="text-xl font-bold text-emerald-700">{sale.price} DZD</div>
                        <div className={`text-xs font-semibold mt-1 uppercase tracking-wide px-3 py-1 rounded-full inline-block ${
                          sale.status === 'accepted' ? 'bg-blue-100 text-blue-700' : 
                          sale.status === 'completed' ? 'bg-green-100 text-green-700' :
                          sale.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                          'bg-amber-100 text-amber-700'
                        }`}>
                           {sale.status === 'pending' ? 'Demande reçue' : 
                            sale.status === 'accepted' ? 'Validée' : 
                            sale.status === 'completed' ? 'Vendu' :
                            sale.status === 'rejected' ? 'Refusée' : 'Annulée'}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 ml-4 min-w-[150px]">
                        {sale.status === 'pending' && (
                          <div className="flex flex-col gap-2">
                            <Button size="sm" onClick={() => handleUpdateSaleStatus(sale.id, 'accepted')} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full h-8 px-4">
                              Accepter et organiser
                            </Button>
                            <Button size="sm" onClick={() => handleUpdateSaleStatus(sale.id, 'rejected')} variant="outline" className="text-red-600 border-red-200 rounded-full h-8 px-4">
                              Refuser
                            </Button>
                          </div>
                        )}
                        {sale.status === 'accepted' && (
                          <div className="flex flex-col gap-2">
                             <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl text-[10px] text-blue-700 mb-1 max-w-[200px]">
                                <strong>Livraison :</strong> {sale.delivery_info || "Non spécifié"}
                             </div>
                             <Button size="sm" onClick={() => handleUpdateSaleStatus(sale.id, 'completed')} className="bg-[#0F2A2E] text-white rounded-full h-8 px-4">
                                Valider la remise finale
                             </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {mySales.length === 0 && (
                   <p className="text-muted-foreground p-4">Aucune demande d'achat en cours.</p>
                )}
              </div>
            </motion.div>
          )}

          {/* Troc */}
          {activeView === "troc" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-3xl p-8 shadow-xl border border-border"
            >
              <h2 className="text-2xl font-bold text-foreground mb-6">Propositions de Troc</h2>
              <div className="space-y-4">
                {trocProposals.map((proposal) => (
                  <div
                    key={proposal.id}
                    className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 bg-muted/50 rounded-3xl"
                  >
                    <div className="flex-1 mb-4 md:mb-0">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {proposal.proposer?.full_name ? proposal.proposer.full_name[0] : "T"}
                        </div>
                        <div>
                          <h4 className="font-bold text-foreground">{proposal.proposer?.full_name || "Utilisateur"}</h4>
                          <p className="text-sm text-muted-foreground">Contre votre objet : {proposal.requested_item?.title}</p>
                        </div>
                      </div>
                      
                      <div className="ml-[60px] p-4 bg-card rounded-2xl border border-purple-100">
                        <p className="text-xs font-bold text-purple-600 uppercase mb-2">Objet Proposé :</p>
                        {proposal.offered_item ? (
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden">
                                <img src={proposal.offered_item.thumbnail_url} className="w-full h-full object-cover" />
                             </div>
                             <p className="font-bold text-foreground">{proposal.offered_item.title}</p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                             <p className="font-bold text-foreground">{proposal.offered_item_data?.title || "Objet personnel"}</p>
                             <p className="text-xs text-muted-foreground line-clamp-2">{proposal.offered_item_data?.description}</p>
                             <div className="flex flex-wrap gap-2 mt-2">
                                {proposal.offered_item_data?.estimated_value && (
                                   <span className="px-2 py-0.5 bg-purple-50 text-purple-600 text-[10px] font-bold rounded-md flex items-center gap-1">
                                      <DollarSign className="w-3 h-3" /> {Number(proposal.offered_item_data.estimated_value).toLocaleString()} DA
                                   </span>
                                )}
                                {proposal.offered_item_data?.wilaya_code && (
                                   <span className="px-2 py-0.5 bg-muted/50 text-muted-foreground text-[10px] font-bold rounded-md flex items-center gap-1">
                                      <MapPin className="w-3 h-3" /> {WILAYAS[Number(proposal.offered_item_data.wilaya_code)] || proposal.offered_item_data.wilaya_code}
                                   </span>
                                )}
                             </div>
                          </div>
                        )}
                        {proposal.message && <p className="mt-3 text-sm text-muted-foreground">"{proposal.message}"</p>}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-3 ml-4">
                      <div className={`text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full ${
                        proposal.status === 'accepted' ? 'bg-green-100 text-green-700' : 
                        proposal.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                        'bg-purple-100 text-purple-700'
                      }`}>
                         {proposal.status === 'pending' ? 'Proposition reçue' : 
                          proposal.status === 'accepted' ? 'Accepté' : 
                          proposal.status === 'completed' ? 'Échange finalisé' :
                          proposal.status === 'rejected' ? 'Refusé' : 'Annulé'}
                      </div>
                      
                      {proposal.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleUpdateTrocStatus(proposal.id, 'accepted')} className="bg-purple-600 hover:bg-purple-700 text-white rounded-full">
                            Accepter
                          </Button>
                          <Button size="sm" onClick={() => handleUpdateTrocStatus(proposal.id, 'rejected')} variant="outline" className="text-red-500 border-red-100 rounded-full">
                            Refuser
                          </Button>
                        </div>
                      )}
                      {proposal.status === 'accepted' && (
                        <Button size="sm" onClick={() => handleUpdateTrocStatus(proposal.id, 'completed')} className="bg-[#0F2A2E] text-white rounded-full">
                          Confirmer l'échange final
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {trocProposals.length === 0 && (
                   <p className="text-muted-foreground p-4">Aucune proposition de troc reçue.</p>
                )}
              </div>
            </motion.div>
          )}

          {/* Earnings */}
          {activeView === "earnings" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-card rounded-3xl p-8 shadow-xl border border-border">
                <h2 className="text-2xl font-bold text-foreground mb-6">Détails des revenus (Bientôt disponible)</h2>
                <div className="grid md:grid-cols-3 gap-6 mb-8 opacity-50">
                  {[
                    { label: "Ce Mois", value: "0 DZD", change: "" },
                    { label: "Mois Dernier", value: "0 DZD", change: "" },
                    { label: "Total", value: "0 DZD", change: "" }
                  ].map((stat) => (
                    <div key={stat.label} className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
                      <div className="text-sm text-muted-foreground mb-1">{stat.label}</div>
                      <div className="flex items-baseline gap-2">
                        <div className="text-3xl font-bold text-foreground">{stat.value}</div>
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
  );
}
