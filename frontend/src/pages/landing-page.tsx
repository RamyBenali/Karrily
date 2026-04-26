import { Navigation } from "../components/layout/navigation";
import { motion } from "motion/react";
import { Search, MapPin, Calendar, Home, Car, Laptop, Wrench, Armchair, Camera, ArrowRight, Star, Shield, Clock, TrendingUp, Check, Zap, Sparkles, Tag } from "lucide-react";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { KarillyLogo } from "../components/brand/karilly-logo";
import { FloatingCTA } from "../components/ui/floating-cta";
import { useState } from "react";
import { cn } from "../components/ui/utils";

const LISTING_TYPES = [
  { value: "rent", label: "Louer", icon: "" },
  { value: "sell", label: "Acheter", icon: "" },
  { value: "troc", label: "Troquer", icon: "" },
];

import { useEffect } from "react";
import { itemsService, statsService } from "../services/api.service";
import { useAuthStore } from "../store/auth.store";

export function LandingPage() {
  const navigate = useNavigate();
  const { getDashboardPath, isAuthenticated } = useAuthStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [listingType, setListingType] = useState("rent");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    if (location.trim()) params.set("location", location.trim());
    if (date) params.set("date", date);
    if (listingType) params.set("type", listingType);
    navigate(`/explore?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleTagClick = (tag: string) => {
    navigate(`/explore?q=${encodeURIComponent(tag)}&type=${listingType}`);
  };

  const [categories, setCategories] = useState([
    { icon: Home, label: "Immobilier", count: "...", color: "#0F2A2E" },
    { icon: Car, label: "Véhicules", count: "...", color: "#FF4F5A" },
    { icon: Laptop, label: "Électronique", count: "...", color: "#0F2A2E" },
    { icon: Wrench, label: "Outillage", count: "...", color: "#FF4F5A" },
    { icon: Armchair, label: "Mobilier", count: "...", color: "#0F2A2E" },
    { icon: Camera, label: "Photo & Vidéo", count: "...", color: "#FF4F5A" },
  ]);

  const [globalStats, setGlobalStats] = useState({ totalCities: 47, activeUsers: 1200 });

  const [trendingItems, setTrendingItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await itemsService.getFeatured();
        if (res && Array.isArray(res.data)) {
          const formatted = res.data.map((item: any, i: number) => ({
            id: item.id,
            title: item.title,
            category: item.category?.name || "Non classé",
            price: item.price_per_day || item.sale_price || 0,
            period: item.listing_type === 'sell' ? 'achat' : 'jour',
            rating: item.rating ? Number(item.rating).toFixed(1) : "Nouveau",
            reviews: item.total_reviews || 0,
            image: item.thumbnail_url || item.images?.[0] || "",
            featured: i < 2
          }));
          setTrendingItems(formatted);
        }
      } catch (e) {
        console.error("Failed to load featured items", e);
      }
    };

    const fetchStats = async () => {
        try {
            const res = await statsService.getGlobalStats();
            if (res && res.data) {
                setGlobalStats({
                    totalCities: res.data.totalCities || 47,
                    activeUsers: res.data.activeUsers || 0
                });
                
                if (res.data.categories && Array.isArray(res.data.categories)) {
                    setCategories(prev => prev.map(cat => {
                        const dbCat = res.data.categories.find((c: any) => c.name === cat.label || c.slug === cat.label.toLowerCase());
                        return {
                            ...cat,
                            count: dbCat ? (dbCat.count >= 1000 ? (dbCat.count/1000).toFixed(1) + 'k' : dbCat.count.toString()) : "0"
                        };
                    }));
                }
            }
        } catch (e) {
            console.error("Failed to load global stats", e);
        }
    };

    fetchFeatured();
    fetchStats();
  }, []);

  const features = [
    {
      icon: Shield,
      title: "Propriétaires vérifiés",
      description: "Chaque annonce et propriétaire passe par notre processus de vérification"
    },
    {
      icon: Clock,
      title: "Durée flexible",
      description: "Louez à l'heure, à la journée, à la semaine ou au mois"
    },
    {
      icon: TrendingUp,
      title: "Gagnez de l'argent",
      description: "Transformez vos objets inutilisés en revenu régulier"
    },
    {
      icon: Zap,
      title: "Réservation instantanée",
      description: "Réservez instantanément ou demandez des arrangements personnalisés"
    }
  ];

  const steps = [
    { number: "01", title: "Chercher", description: "Trouvez ce dont vous avez besoin parmi des milliers d'annonces vérifiées" },
    { number: "02", title: "Réserver", description: "Choisissez vos dates et finalisez le paiement sécurisé" },
    { number: "03", title: "Recevoir", description: "Faites-vous livrer ou récupérez sur place" },
    { number: "04", title: "Retourner", description: "Renvoyez quand vous avez terminé. Simple." }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <div className="relative min-h-screen bg-gradient-to-br from-[#0F2A2E] via-[#1A4851] to-[#0F2A2E] overflow-hidden">


        {/* Floating Background Shapes */}
        <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
          <motion.div
            className="absolute top-20 right-[10%] w-32 h-32 rounded-3xl bg-white/20 backdrop-blur-sm shadow-[0_0_60px_rgba(255,255,255,0.3)]"
            animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-40 left-[15%] w-24 h-24 rounded-full bg-[#FF4F5A]/20 shadow-[0_0_80px_rgba(255,79,90,0.4)]"
            animate={{ y: [0, 25, 0], x: [0, 10, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-32 right-[20%] w-40 h-40 rounded-3xl bg-white/10 backdrop-blur-sm shadow-[0_0_100px_rgba(255,255,255,0.2)]"
            animate={{ y: [0, -30, 0], rotate: [0, -5, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-1/3 left-[40%] w-16 h-16 rounded-xl bg-[#FF4F5A]/15"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "50px 50px"
        }} />

        {/* Hero Content */}
        <div className="relative max-w-[1400px] mx-auto px-6 lg:px-12 pt-40 pb-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Text */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full mb-8 border border-white/20 shadow-lg shadow-[#FF4F5A]/10"
              >
                <span className="w-2 h-2 bg-[#FF4F5A] rounded-full animate-pulse shadow-[0_0_10px_rgba(255,79,90,0.8)]" />
                <span className="text-white text-sm font-medium">Déjà actif dans {globalStats.totalCities} villes</span>
                <Sparkles className="w-4 h-4 text-[#FF4F5A]" />
              </motion.div>

              <h1 className="text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-6 leading-[0.95]">
                Louez<br />
                Tout.<br />
                <span className="text-[#FF4F5A] relative inline-block">
                  Partout.
                  <motion.span
                    className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-[#FF4F5A] to-transparent rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 1, duration: 1 }}
                  />
                </span>
              </h1>

              <p className="text-xl text-white/80 mb-12 max-w-lg leading-relaxed">
                La façon la plus intelligente d&apos;accéder à ce dont vous avez besoin. De l&apos;immobilier aux véhicules, de l&apos;outillage à la tech — louez tout en un seul endroit.
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => navigate('/explore')}
                  className="inline-flex items-center gap-2 bg-[#FF4F5A] hover:bg-[#e8404a] text-white px-8 h-14 text-base rounded-full shadow-2xl shadow-[#FF4F5A]/40 hover:shadow-[#FF4F5A]/60 hover:scale-105 active:scale-95 transition-all font-bold group"
                >
                  Explorer maintenant
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => navigate('/lender')}
                  className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white px-8 h-14 text-base rounded-full border border-white/30 hover:border-white/50 transition-all hover:scale-105 active:scale-95 font-bold"
                >
                  Publier une annonce
                </button>
              </div>
            </motion.div>

            {/* Right Search Card */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF4F5A]/20 to-[#0F2A2E]/20 blur-3xl rounded-3xl" />

              <div className="relative rounded-3xl border border-border bg-card/95 p-8 shadow-2xl backdrop-blur-xl hover:shadow-[0_20px_60px_rgba(255,79,90,0.2)] transition-shadow duration-500 dark:border-white/10 dark:bg-[#121a1c]/95">
                <h3 className="mb-5 flex items-center gap-2 text-2xl font-bold text-foreground">
                  Trouvez ce que vous cherchez
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <Sparkles className="w-5 h-5 text-[#FF4F5A]" />
                  </motion.div>
                </h3>

                {/* Listing type toggle */}
                <div className="flex gap-1.5 mb-5 p-1.5 bg-muted/60 rounded-2xl">
                  {LISTING_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setListingType(type.value)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95",
                        listingType === type.value
                          ? "bg-card text-foreground shadow-md scale-[1.02]"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <span className="text-base leading-none">{type.icon}</span>
                      {type.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  {/* Query */}
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-[#FF4F5A] transition-colors" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="De quoi avez-vous besoin ?"
                      className="h-14 w-full rounded-2xl border-2 border-border bg-background pl-12 pr-4 text-[15px] text-foreground placeholder:text-muted-foreground transition-all focus:border-[#FF4F5A] focus:outline-none focus:ring-2 focus:ring-[#FF4F5A]/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Location */}
                    <div className="relative group">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-[#FF4F5A] transition-colors" />
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Localisation"
                        className="h-14 w-full rounded-2xl border-2 border-border bg-background pl-12 pr-4 text-[15px] text-foreground placeholder:text-muted-foreground transition-all focus:border-[#FF4F5A] focus:outline-none focus:ring-2 focus:ring-[#FF4F5A]/20"
                      />
                    </div>

                    {/* Date picker */}
                    <div className="relative group">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-[#FF4F5A] transition-colors pointer-events-none" />
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        className="h-14 w-full rounded-2xl border-2 border-border bg-background pl-12 pr-4 text-[15px] text-foreground placeholder:text-muted-foreground transition-all focus:border-[#FF4F5A] focus:outline-none focus:ring-2 focus:ring-[#FF4F5A]/20 cursor-pointer"
                        style={{ colorScheme: "auto" }}
                      />
                    </div>
                  </div>

                  {/* Search button */}
                  <button
                    onClick={handleSearch}
                    className="w-full h-14 inline-flex items-center justify-center gap-2 bg-[#0F2A2E] hover:bg-[#1A4851] text-white rounded-2xl text-base font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <Search className="w-5 h-5" />
                    Rechercher
                  </button>
                </div>

                {/* Popular tags */}
                <div className="mt-6 border-t border-border pt-5">
                  <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <Tag className="w-3 h-3" />
                    Recherches populaires
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["Appartements", "Voitures", "Caméras", "Outillage", "PC Portables"].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleTagClick(tag)}
                        className="rounded-full border border-border/60 bg-muted/50 px-4 py-1.5 text-sm font-medium text-foreground transition-all hover:border-[#FF4F5A]/40 hover:bg-[#FF4F5A]/10 hover:text-[#FF4F5A] active:scale-95"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Popular Categories */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-24">
        <div className="flex items-end justify-between mb-12">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="mb-3 text-5xl font-bold text-foreground">Parcourir par catégorie</h2>
              <p className="text-xl text-muted-foreground">Découvrez des milliers d&apos;articles dans toutes les catégories</p>
            </motion.div>
          </div>
          <button
            onClick={() => navigate('/explore')}
            className="group hidden items-center gap-2 text-foreground transition-colors hover:text-[#FF4F5A] lg:flex font-semibold"
          >
            Voir tout
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => (
            <motion.button
              key={category.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              onClick={() => navigate(`/explore?q=${encodeURIComponent(category.label)}`)}
              className="group relative rounded-3xl border border-border bg-card p-6 transition-all duration-300 hover:border-[#FF4F5A]/30 hover:shadow-xl hover:-translate-y-1 active:scale-95"
            >
              <div className="flex flex-col items-center text-center">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: `${category.color}15` }}
                >
                  <category.icon
                    className="w-8 h-8"
                    style={{ color: category.color }}
                  />
                </div>
                <h3 className="mb-1 font-semibold text-foreground">{category.label}</h3>
                <p className="text-sm text-muted-foreground">{category.count} annonces</p>
              </div>
              <div
                className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{
                  background: `linear-gradient(135deg, ${category.color}05, ${category.color}10)`
                }}
              />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Trending Rentals */}
      <div className="bg-card py-24">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="mb-3 text-5xl font-bold text-foreground">Tendances du moment</h2>
            <p className="text-xl text-muted-foreground">Les locations les plus populaires cette semaine</p>
          </motion.div>

          <div className="grid lg:grid-cols-12 gap-6">
            {trendingItems.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                onClick={() => navigate(`/item/${trendingItems[0].id}`)}
                className="lg:col-span-7 group cursor-pointer"
              >
                <div className="relative h-[500px] rounded-3xl overflow-hidden bg-muted">
                  <ImageWithFallback
                    src={trendingItems[0].image}
                    alt={trendingItems[0].title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute top-6 left-6">
                    <span className="px-4 py-2 bg-[#FF4F5A] text-white text-sm font-bold rounded-full shadow-lg">
                      En vedette
                    </span>
                  </div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-sm rounded-full">
                        {trendingItems[0].category}
                      </span>
                      <div className="flex items-center gap-1 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-white text-sm font-medium">{trendingItems[0].rating}</span>
                      </div>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-2">{trendingItems[0].title}</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-white">{trendingItems[0].price} DA</span>
                      <span className="text-white/70">/ {trendingItems[0].period}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="lg:col-span-5 flex flex-col gap-6">
              {trendingItems.slice(1, 3).map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => navigate(`/item/${item.id}`)}
                  className="group cursor-pointer"
                >
                  <div className="relative h-[237px] rounded-3xl overflow-hidden">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    {item.featured && (
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-[#FF4F5A] text-white text-xs font-bold rounded-full">
                          Populaire
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-white/20 backdrop-blur-md text-white text-xs rounded-full">
                          {item.category}
                        </span>
                        <div className="flex items-center gap-1 px-2 py-1 bg-white/20 backdrop-blur-md rounded-full">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-white text-xs font-medium">{item.rating}</span>
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-white">{item.price} DA</span>
                        <span className="text-white/70 text-sm">/ {item.period}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={() => navigate('/explore')}
              className="inline-flex items-center gap-2 bg-[#0F2A2E] hover:bg-[#1A4851] text-white px-8 h-12 rounded-full font-bold transition-all hover:scale-105 active:scale-95 group"
            >
              Explorer toutes les annonces
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* How Karrily Works */}
      <div className="bg-[#1A4851] py-24 relative overflow-hidden" id="how-it-works">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#1A4851] rounded-full blur-[120px] opacity-20 -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#FF4F5A] rounded-full blur-[120px] opacity-10 -ml-48 -mb-48" />

        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="mb-4 text-5xl font-bold text-white">Comment fonctionne Karrily</h2>
            <p className="mx-auto max-w-2xl text-xl text-white/70">
              La location n&apos;a jamais été aussi simple. Quatre étapes pour accéder à tout.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-8 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:shadow-2xl hover:-translate-y-1"
              >
                <div className="text-6xl font-bold text-[#FF4F5A]/20 mb-4">{step.number}</div>
                <h3 className="mb-3 text-2xl font-bold text-white">{step.title}</h3>
                <p className="leading-relaxed text-white/60">{step.description}</p>

                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2">
                    <ArrowRight className="h-6 w-6 text-white/20" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Why Trust Karrily */}
      <div className="bg-background py-24">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="mb-4 text-5xl font-bold text-foreground">Pourquoi faire confiance à Karrily</h2>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              Conçu pour la sécurité, la flexibilité et la tranquillité d&apos;esprit
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-[#0F2A2E] to-[#1A4851] rounded-3xl p-8 text-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-[#FF4F5A]" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-white/80 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Lender CTA */}
      <div className="py-24 bg-gradient-to-br from-[#FF4F5A] to-[#FF6B74]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl lg:text-6xl font-bold text-white mb-6">
                Transformez vos objets inutilisés en revenus
              </h2>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Rejoignez les milliers de loueurs qui génèrent un revenu passif en louant leurs objets inutilisés. C&apos;est gratuit de publier, et vous gardez toujours le contrôle.
              </p>
              <div className="flex flex-wrap gap-4 mb-8">
                {[
                  { title: "Gratuit à publier", sub: "Aucun frais initial" },
                  { title: "Protection complète", sub: "Assurance incluse" }
                ].map((item) => (
                  <div key={item.title} className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-semibold">{item.title}</div>
                      <div className="text-white/80 text-sm">{item.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate('/lender')}
                className="inline-flex items-center gap-2 bg-white hover:bg-white/90 text-[#FF4F5A] px-8 h-14 text-lg rounded-full font-bold shadow-xl transition-all hover:scale-105 active:scale-95 group"
              >
                Commencer à gagner
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20"
            >
              <div className="space-y-6">
                {[
                  { Icon: TrendingUp, title: "892 DA en moyenne/mois", desc: "Revenus typiques des loueurs actifs" },
                  { Icon: Shield, title: "Protection totale", desc: "Chaque location est entièrement assurée" },
                  { Icon: Clock, title: "5 minutes de configuration", desc: "Publiez votre première annonce en quelques minutes" }
                ].map(({ Icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-[#FF4F5A]" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-lg mb-1">{title}</h4>
                      <p className="text-white/80">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#0F2A2E] text-white py-16">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
            <div className="lg:col-span-2">
              <div className="mb-6">
                <KarillyLogo className="h-8" variant="white" />
              </div>
              <p className="text-white/70 mb-6 leading-relaxed">
                La marketplace universelle de location et de troc en Algérie. Louez tout, partout, tout le temps.
              </p>
              <div className="flex gap-3">
                {["Twitter", "Instagram", "LinkedIn"].map((social) => (
                  <button
                    key={social}
                    className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                  >
                    <span className="sr-only">{social}</span>
                  </button>
                ))}
              </div>
            </div>

            {[
              { title: "Explorer", links: ["Toutes les catégories", "Immobilier", "Véhicules", "Électronique", "Outillage"] },
              { title: "L'entreprise", links: ["À propos", "Comment ça marche", "Confiance & Sécurité", "Carrières"] },
              { title: "Support", links: ["Centre d'aide", "Nous contacter", "FAQ", "Assurance"] }
            ].map((column) => (
              <div key={column.title}>
                <h4 className="font-semibold text-lg mb-4">{column.title}</h4>
                <ul className="space-y-3">
                  {column.links.map((link) => (
                    <li key={link}>
                      <button className="text-white/70 hover:text-white transition-colors text-sm">
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/50 text-sm">© 2026 Karrily. Tous droits réservés.</p>
            <div className="flex gap-6">
              <button className="text-white/50 hover:text-white text-sm transition-colors">Politique de confidentialité</button>
              <button className="text-white/50 hover:text-white text-sm transition-colors">Conditions d&apos;utilisation</button>
            </div>
          </div>
        </div>
      </footer>

      <FloatingCTA />
    </div>
  );
}
