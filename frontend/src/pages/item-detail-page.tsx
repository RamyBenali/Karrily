import { Navigation } from "../components/layout/navigation";
import { useParams, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Star, MapPin, Shield, Clock, CheckCircle, Heart, Share2,
  Calendar, ChevronLeft, ChevronRight, Loader2, ArrowLeft,
  Tag, MessageCircle, ShoppingCart, RefreshCw, Eye, AlertCircle,
  Home, HandCoins, Info, Flag
} from "lucide-react";
import { Button } from "../components/ui/button";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Footer } from "../components/layout/footer";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/auth.store";
import { bookingsService, trocService, favoritesService } from "../services/api.service";
import { PurchaseRequestModal } from "../components/item/PurchaseRequestModal";
import { TrocProposalModal } from "../components/item/TrocProposalModal";
import { ReviewDialog } from "../components/dashboard/ReviewDialog";
import { ReportDialog } from "../components/dashboard/ReportDialog";
import { reviewsService, reportsService } from "../services/api.service";
import { cn } from "../components/ui/utils";

const CONDITION_LABELS: Record<string, string> = {
  new: "Neuf",
  like_new: "Comme neuf",
  good: "Bon état",
  fair: "Correct",
  poor: "Usé",
};

const LISTING_TYPE_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  rent: { label: "Location", icon: Home, color: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
  sell: { label: "Vente", icon: ShoppingCart, color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" },
  troc: { label: "Troc", icon: RefreshCw, color: "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" },
  rent_sell: { label: "Location & Vente", icon: HandCoins, color: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" },
};

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

interface ItemDetail {
  id: string;
  title: string;
  description: string;
  listing_type: string;
  price_per_day: number | null;
  price_per_week: number | null;
  price_per_month: number | null;
  sale_price: number | null;
  is_negotiable: boolean;
  deposit_amount: number | null;
  category_id: string;
  condition: string;
  tags: string[];
  images: string[];
  thumbnail_url: string | null;
  location: string;
  wilaya_code: number;
  rating: number;
  total_reviews: number;
  view_count: number;
  favorite_count: number;
  is_available: boolean;
  metadata: Record<string, any>;
  troc_description: string | null;
  troc_estimated_value: number | null;
  created_at: string;
  owner_id: string;
  category?: { name: string; slug: string };
  owner?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    is_verified: boolean;
    rating: number;
    total_reviews: number;
    created_at: string;
    wilaya_code: number;
  };
}

export function ItemDetailPage() {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isTrocModalOpen, setIsTrocModalOpen] = useState(false);

  const [item, setItem] = useState<ItemDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [creatingConversation, setCreatingConversation] = useState(false);
  const [existingBookings, setExistingBookings] = useState<any[]>([]);
  
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [datesOverlapping, setDatesOverlapping] = useState(false);
  
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  
  // Direct Review State
  const [reviewRating, setReviewRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");
  
  // Report State
  const [reportConfig, setReportConfig] = useState<{
    isOpen: boolean;
    targetId: string;
    targetType: "item" | "review";
    targetTitle: string;
  }>({
    isOpen: false,
    targetId: "",
    targetType: "item",
    targetTitle: ""
  });

  useEffect(() => {
    if (!startDate || !endDate) {
        setDatesOverlapping(false);
        return;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    const overlap = existingBookings.some(b => {
        const bStart = new Date(b.start_date);
        const bEnd = new Date(b.end_date);
        return (start <= bEnd && end >= bStart);
    });
    setDatesOverlapping(overlap);
  }, [startDate, endDate, existingBookings]);

  useEffect(() => {
    const fetchItem = async () => {
      if (!itemId) return;
      setIsLoading(true);

      try {
        const { data, error: fetchError } = await supabase
          .from("items")
          .select("*, category:categories(name, slug), owner:profiles(*)")
          .eq("id", itemId)
          .single();

        if (fetchError || !data) {
          setError("Annonce introuvable.");
          setIsLoading(false);
          return;
        }

        const itemData = data as any;
        setItem(itemData);

        // Increment view count via RPC to avoid race conditions
        supabase
          .rpc("increment_view_count", { item_id_param: itemId })
          .then(() => { });

        setIsLoading(false);
      } catch (err) {
        setError("Une erreur est survenue lors du chargement.");
        setIsLoading(false);
      }
    };

    fetchItem();

    const fetchBookings = async () => {
      if (!itemId) return;
      const { data } = await supabase
        .from("bookings")
        .select("start_date, end_date")
        .eq("item_id", itemId)
        .in("status", ["confirmed", "active"]);
      if (data) setExistingBookings(data);
    };
    
    const checkFavoriteStatus = async () => {
        if (!user || !itemId) return;
        const { isFavorite } = await favoritesService.checkFavorite(itemId);
        setIsLiked(isFavorite);
    };

    const fetchReviews = async () => {
        if (!itemId) return;
        setIsLoadingReviews(true);
        try {
            const { data } = await reviewsService.getByItem(itemId);
            if (data) setReviews(data);
        } catch (err) {
            console.error("Error fetching reviews:", err);
        } finally {
            setIsLoadingReviews(false);
        }
    };

    fetchBookings();
    checkFavoriteStatus();
    fetchReviews();
  }, [itemId, user]);

  const nextImage = () => {
    if (!item) return;
    setCurrentImageIndex((prev) => (prev + 1) % item.images.length);
  };
  const prevImage = () => {
    if (!item) return;
    setCurrentImageIndex((prev) => (prev - 1 + item.images.length) % item.images.length);
  };

  const calculateBooking = () => {
    if (!item?.price_per_day || !startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    if (days <= 0 || datesOverlapping) return null;

    let total = 0;
    if (days >= 30 && item.price_per_month) {
      const months = Math.floor(days / 30);
      const remainingDays = days % 30;
      total = months * Number(item.price_per_month) + remainingDays * Number(item.price_per_day);
    } else if (days >= 7 && item.price_per_week) {
      const weeks = Math.floor(days / 7);
      const remainingDays = days % 7;
      total = weeks * Number(item.price_per_week) + remainingDays * Number(item.price_per_day);
    } else {
      total = days * Number(item.price_per_day);
    }

    return { days, total, deposit: Number(item.deposit_amount || 0) };
  };

  const handleToggleFavorite = async () => {
    if (!user) {
        navigate("/login");
        return;
    }
    if (!item) return;
    setIsTogglingFavorite(true);
    try {
        const { isFavorite } = await favoritesService.toggleFavorite(item.id);
        setIsLiked(isFavorite);
    } catch (err: any) {
        alert(err.message);
    } finally {
        setIsTogglingFavorite(false);
    }
  };

  const bookingCalc = calculateBooking();

  const handleBooking = async () => {
    if (!user || !item || !bookingCalc) return;
    if (user.id === item.owner_id) {
      setBookingError("Vous ne pouvez pas réserver votre propre annonce.");
      return;
    }

    setIsBooking(true);
    setBookingError("");

    try {
      await bookingsService.create({
        item_id: item.id,
        start_date: startDate,
        end_date: endDate,
        message: bookingMessage || undefined,
      });
      setIsBooking(false);
      setBookingSuccess(true);
    } catch (err: any) {
      setIsBooking(false);
      setBookingError("Erreur lors de la réservation : " + err.message);
    }
  };

  const handleContactOwner = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!item) return;
    if (user.id === item.owner_id) {
      alert("C'est votre propre annonce.");
      return;
    }

    setCreatingConversation(true);

    const { data: existingConvs } = await supabase
      .from("conversations")
      .select("id")
      .eq("item_id", item.id)
      .or(`and(participant_1.eq.${user.id},participant_2.eq.${item.owner_id}),and(participant_1.eq.${item.owner_id},participant_2.eq.${user.id})`)
      .limit(1);

    if (existingConvs && existingConvs.length > 0) {
      navigate("/dashboard", { state: { tab: "Messages", convId: existingConvs[0].id } });
      setCreatingConversation(false);
      return;
    }

    const { data: newConv, error: convError } = await supabase
      .from("conversations")
      .insert({
        item_id: item.id,
        participant_1: user.id,
        participant_2: item.owner_id,
        last_message_preview: "Nouvelle conversation",
      })
      .select("id")
      .single();

    setCreatingConversation(false);

    if (!convError && newConv) {
      navigate("/dashboard", { state: { tab: "Messages", convId: newConv.id } });
    } else {
      alert("Erreur lors de la création de la conversation.");
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (item && user.id === item.owner_id) {
      setReviewError("Vous ne pouvez pas laisser d'avis sur votre propre annonce.");
      return;
    }
    if (reviewRating === 0) {
      setReviewError("Veuillez sélectionner une note.");
      return;
    }
    if (reviewComment.length < 5) {
      setReviewError("Veuillez laisser un commentaire d'au moins 5 caractères.");
      return;
    }

    setIsSubmittingReview(true);
    setReviewError("");

    try {
      await reviewsService.create({
        item_id: item?.id || "",
        reviewed_user_id: item?.owner_id || "",
        rating: reviewRating,
        comment: reviewComment
      });
      // Reset
      setReviewRating(0);
      setReviewComment("");
      // Refresh
      const { data } = await reviewsService.getByItem(itemId || "");
      if (data) setReviews(data);
    } catch (err: any) {
      setReviewError(err.message || "Erreur lors de l'envoi.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const ownerInitials = item?.owner?.full_name
    ? item.owner.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const memberSince = item?.owner?.created_at
    ? new Date(item.owner.created_at).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
    : "";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        
        <div className="flex flex-col items-center justify-center pt-40">
          <Loader2 className="w-10 h-10 animate-spin text-[#FF4F5A] mb-4" />
          <p className="text-muted-foreground animate-pulse">Chargement de l'annonce...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        
        <div className="flex flex-col items-center justify-center pt-40 px-6 text-center">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-12 h-12 text-muted-foreground/40" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-3">Annonce introuvable</h2>
          <p className="text-muted-foreground mb-8 max-w-md">
            Désolé, cette annonce n'existe plus ou a été supprimée par son propriétaire.
          </p>
          <Button 
            onClick={() => navigate("/explore")} 
            className="bg-[#FF4F5A] hover:bg-[#FF4F5A]/90 text-white rounded-full px-8 h-12 shadow-lg shadow-[#FF4F5A]/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Retour à l'exploration
          </Button>
        </div>
      </div>
    );
  }

  const listingConfig = LISTING_TYPE_CONFIG[item.listing_type] || LISTING_TYPE_CONFIG.rent;

  return (
    <div className="min-h-screen bg-background text-foreground">
      

      <main className="pt-24 pb-20">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          {/* Breadcrumb Épuré */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8 overflow-x-auto whitespace-nowrap pb-2">
            <button onClick={() => navigate("/explore")} className="hover:text-foreground flex items-center gap-1 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Explorer
            </button>
            <span className="opacity-30">/</span>
            {item.category && (
              <>
                <button onClick={() => navigate(`/explore?category=${item.category?.slug}`)} className="hover:text-foreground transition-colors">
                  {item.category.name}
                </button>
                <span className="opacity-30">/</span>
              </>
            )}
            <span className="text-foreground font-medium truncate max-w-[200px]">{item.title}</span>
          </nav>

          <div className="grid lg:grid-cols-12 gap-10">
            {/* ═══ Left Column — Image Gallery & Story ═══ */}
            <div className="lg:col-span-12 xl:col-span-8">
              {/* Galerie Premium */}
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative aspect-[16/10] sm:aspect-video rounded-[2.5rem] overflow-hidden bg-muted group shadow-2xl shadow-black/5"
                >
                  <ImageWithFallback
                    src={item.images[currentImageIndex] || item.thumbnail_url || ""}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />

                  {/* Boutons de navigation discrets */}
                  {item.images.length > 1 && (
                    <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <button
                        onClick={(e) => { e.stopPropagation(); prevImage(); }}
                        className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/20"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); nextImage(); }}
                        className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/20"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </div>
                  )}

                  {/* Badge flottant */}
                  <div className="absolute top-6 left-6 flex flex-col gap-2">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 backdrop-blur-xl shadow-lg ${listingConfig.color} border border-current/10`}>
                      <listingConfig.icon className="w-3.5 h-3.5" /> {listingConfig.label}
                    </span>
                    <span className="px-4 py-1.5 bg-black/40 backdrop-blur-xl text-white rounded-full text-xs font-bold uppercase tracking-wider border border-white/10">
                      {CONDITION_LABELS[item.condition] || item.condition}
                    </span>
                  </div>

                  {/* Compteur discret */}
                  <span className="absolute bottom-6 right-6 px-3 py-1 bg-black/40 backdrop-blur-md text-white/90 text-xs font-medium rounded-full border border-white/10">
                    {currentImageIndex + 1} / {item.images.length}
                  </span>
                </motion.div>

                {/* Miniatures Sèches */}
                {item.images.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                    {item.images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentImageIndex(i)}
                        className={`relative flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden transition-all duration-300 ${
                          i === currentImageIndex 
                            ? "ring-2 ring-[#FF4F5A] scale-105" 
                            : "opacity-40 hover:opacity-100 hover:scale-102"
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Contenu Informatif */}
              <div className="mt-12 space-y-12">
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-muted rounded-2xl flex items-center justify-center">
                      <Info className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">Description</h2>
                  </div>
                  <div className="p-8 rounded-[2rem] bg-card border border-border/50 text-muted-foreground leading-relaxed whitespace-pre-line text-lg">
                    {item.description}
                  </div>
                </section>

                {/* Caractéristiques Grille */}
                {item.metadata && Object.keys(item.metadata).length > 0 && (
                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-muted rounded-2xl flex items-center justify-center">
                        <Tag className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <h2 className="text-2xl font-bold tracking-tight">Caractéristiques</h2>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {Object.entries(item.metadata).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-4 p-5 rounded-2xl bg-muted/30 border border-border/40">
                          <CheckCircle className="w-5 h-5 text-[#FF4F5A]" />
                          <div className="flex flex-col">
                            <span className="text-xs uppercase tracking-widest text-muted-foreground/60 font-bold">{key.replace(/_/g, " ")}</span>
                            <span className="font-semibold text-foreground">
                              {typeof value === "boolean" ? (value ? "Oui" : "Non") : value}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Troc Section Spéciale */}
                {item.listing_type === "troc" && item.troc_description && (
                  <section className="p-10 rounded-[2.5rem] bg-gradient-to-br from-purple-500/5 to-purple-600/10 border border-purple-500/20">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center">
                        <RefreshCw className="w-6 h-6 text-purple-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-purple-900 dark:text-purple-300">Offre de troc</h2>
                    </div>
                    <p className="text-purple-800 dark:text-purple-400/80 text-lg mb-6 leading-relaxed">
                      {item.troc_description}
                    </p>
                    {item.troc_estimated_value && (
                      <div className="flex items-center gap-2 text-purple-600/70 font-medium">
                        <HandCoins className="w-4 h-4" />
                        Valeur estimée : <strong>{Number(item.troc_estimated_value).toLocaleString()} DA</strong>
                      </div>
                    )}
                  </section>
                )}
              </div>
            </div>

            {/* ═══ Right Column — Checkout Card ═══ */}
            <div className="lg:col-span-12 xl:col-span-4 lg:sticky lg:top-28 self-start">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-[2.5rem] p-10 shadow-2xl shadow-[#0F2A2E]/5 border border-border"
              >
                {/* Header Produit */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#FF4F5A] px-3 py-1 bg-[#FF4F5A]/5 rounded-full">
                      {item.category?.name || "Général"}
                    </span>
                    <div className="flex gap-2">
                       <button
                        onClick={handleToggleFavorite}
                        disabled={isTogglingFavorite}
                        className={`w-10 h-10 border border-border rounded-full flex items-center justify-center transition-all ${isTogglingFavorite ? "animate-pulse" : "hover:bg-muted"}`}
                      >
                        <Heart className={`w-5 h-5 ${isLiked ? "fill-[#FF4F5A] text-[#FF4F5A] border-[#FF4F5A]" : "text-foreground"}`} />
                      </button>
                      <button className="w-10 h-10 border border-border rounded-full flex items-center justify-center transition-all hover:bg-muted">
                        <Share2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => setReportConfig({ 
                          isOpen: true, 
                          targetId: item.id, 
                          targetType: "item", 
                          targetTitle: item.title 
                        })}
                        className="w-10 h-10 border border-border rounded-full flex items-center justify-center transition-all hover:bg-red-50 hover:text-red-500 hover:border-red-200"
                        title="Signaler cette annonce"
                      >
                        <Flag className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <h1 className="text-3xl font-extrabold text-foreground leading-tight mb-4">{item.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-[#FF4F5A]" />
                      <span>{WILAYAS[item.wilaya_code] || item.location}</span>
                    </div>
                    <div className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
                    <div className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{item.view_count} vues</span>
                    </div>
                  </div>
                </div>

                {/* Prix & Réservation */}
                <div className="space-y-8 pb-8 mb-8 border-b border-border">
                  {/* Grille de Prix */}
                  <div className="grid gap-2">
                    {item.price_per_day && (
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-foreground">{Number(item.price_per_day).toLocaleString()} DA</span>
                        <span className="text-muted-foreground font-medium">/ jour</span>
                      </div>
                    )}
                    {item.sale_price && (
                      <div className="pt-2">
                        <span className="text-2xl font-bold text-emerald-600">{Number(item.sale_price).toLocaleString()} DA</span>
                        <span className="text-sm text-muted-foreground ml-2">(Prix de vente)</span>
                      </div>
                    )}
                  </div>

                  {/* Formulaire de réservation épuré */}
                  {(item.listing_type === "rent" || item.listing_type === "rent_sell") && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2">Début</label>
                          <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 pointer-events-none" />
                            <input
                              type="date"
                              value={startDate}
                              onChange={e => setStartDate(e.target.value)}
                              min={new Date().toISOString().slice(0, 10)}
                              className="w-full pl-11 pr-4 h-12 bg-muted/40 border-none rounded-2xl text-sm focus:ring-2 ring-[#FF4F5A]/20 transition-all font-medium appearance-none"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2">Fin</label>
                          <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 pointer-events-none" />
                            <input
                              type="date"
                              value={endDate}
                              onChange={e => setEndDate(e.target.value)}
                              min={startDate || new Date().toISOString().slice(0, 10)}
                              className="w-full pl-11 pr-4 h-12 bg-muted/40 border-none rounded-2xl text-sm focus:ring-2 ring-[#FF4F5A]/20 transition-all font-medium appearance-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Recap Prix */}
                      <AnimatePresence>
                        {datesOverlapping ? (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 flex items-start gap-3"
                          >
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <div className="text-sm font-medium">
                              Ces dates sont indisponibles. Elles chevauchent une réservation existante. Veuillez sélectionner d'autres dates.
                            </div>
                          </motion.div>
                        ) : bookingCalc && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-6 rounded-3xl bg-muted/30 space-y-3"
                          >
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{bookingCalc.days} jour{bookingCalc.days > 1 ? "s" : ""}</span>
                              <span className="font-bold">{bookingCalc.total.toLocaleString()} DA</span>
                            </div>
                            {bookingCalc.deposit > 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Caution reversible</span>
                                <span className="font-bold">{bookingCalc.deposit.toLocaleString()} DA</span>
                              </div>
                            )}
                            <div className="pt-3 border-t border-border/50 flex justify-between items-center">
                              <span className="font-bold text-lg">Total</span>
                              <span className="font-black text-xl text-[#FF4F5A]">{(bookingCalc.total + bookingCalc.deposit).toLocaleString()} DA</span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      {bookingError && (
                          <div className="text-sm text-red-500 font-medium px-2 flex items-center gap-2">
                             <AlertCircle className="w-4 h-4" /> {bookingError}
                          </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions Finales */}
                <div className="space-y-4">
                  {bookingSuccess ? (
                    <div className="p-6 bg-emerald-50 dark:bg-emerald-950/20 rounded-3xl text-center border border-emerald-100 dark:border-emerald-800/50">
                      <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-500/30">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <p className="font-bold text-emerald-900 dark:text-emerald-400 mb-4">Réservation envoyée !</p>
                      <Button onClick={() => navigate("/dashboard")} className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700">Gérer mes réservations</Button>
                    </div>
                  ) : (
                    <>
                      {(item.listing_type === "rent" || item.listing_type === "rent_sell") && (
                        <Button
                          onClick={() => user ? handleBooking() : navigate("/login")}
                          disabled={!bookingCalc || isBooking}
                          className="w-full h-16 bg-[#FF4F5A] hover:bg-[#FF4F5A]/90 text-white rounded-[1.25rem] text-lg font-bold shadow-2xl shadow-[#FF4F5A]/25 transition-transform active:scale-[0.98]"
                        >
                          {isBooking ? <Loader2 className="w-6 h-6 animate-spin" /> : "Réserver maintenant"}
                        </Button>
                      )}
                      
                      <div className="grid grid-cols-2 gap-3">
                        {(item.listing_type === "sell" || item.listing_type === "rent_sell") && (
                          <Button 
                            onClick={() => user ? setIsPurchaseModalOpen(true) : navigate("/login")}
                            className="h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold"
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" /> Acheter
                          </Button>
                        )}
                        {(item.listing_type === "troc" || item.listing_type === "rent_sell") && (
                          <Button 
                            onClick={() => user ? setIsTrocModalOpen(true) : navigate("/login")}
                            className="h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold"
                          >
                            <RefreshCw className="w-4 h-4 mr-2" /> Troc
                          </Button>
                        )}
                      </div>
                    </>
                  )}

                  <Button
                    onClick={handleContactOwner}
                    disabled={creatingConversation}
                    variant="outline"
                    className="w-full h-14 rounded-2xl border-2 border-border font-bold hover:bg-muted"
                  >
                    {creatingConversation ? <Loader2 className="w-5 h-5 animate-spin" /> : "Contacter le propriétaire"}
                  </Button>
                </div>

                {/* Propriétaire Sidebar Card */}
                {item.owner && (
                  <div className="mt-10 pt-10 border-t border-border flex items-center gap-4 group cursor-pointer">
                    <div className="relative w-14 h-14">
                      <div className="w-full h-full bg-[#0F2A2E] rounded-2xl flex items-center justify-center text-white font-black text-xl overflow-hidden shadow-lg group-hover:scale-105 transition-transform">
                        {item.owner.avatar_url ? (
                          <img src={item.owner.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : ownerInitials}
                      </div>
                      {item.owner.is_verified && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#FF4F5A] border-4 border-card rounded-full flex items-center justify-center">
                          <CheckCircle className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground group-hover:text-[#FF4F5A] transition-colors">{item.owner.full_name}</h4>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          <span className="font-bold text-foreground/80">{Number(item.owner.rating || 0).toFixed(1)}</span>
                        </div>
                        <span className="opacity-30">|</span>
                        <span>{item.owner.total_reviews} avis</span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Security Shield */}
              <div className="mt-6 p-6 rounded-[2rem] bg-[#0F2A2E] text-white flex items-center gap-6 shadow-xl">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-7 h-7 text-[#FF4F5A]" />
                </div>
                <div>
                  <h4 className="font-bold leading-tight">Garantie Karrily</h4>
                  <p className="text-xs text-white/60 mt-1 leading-relaxed">Paiement sécurisé et protection de vos biens à chaque étape.</p>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ Reviews Section (Full Width) ═══ */}
          <section className="mt-20 pt-20 border-t border-border">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 bg-[#FF4F5A]/10 rounded-2xl flex items-center justify-center">
                <Star className="w-6 h-6 text-[#FF4F5A]" />
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tight text-foreground">Avis <span className="text-[#FF4F5A]">clients</span></h2>
                <p className="text-muted-foreground font-medium">Ce que les autres utilisateurs pensent de cet article.</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-12">
              {/* Review Form Column */}
              <div className="lg:col-span-4">
                {user ? (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-card rounded-[2.5rem] p-8 border border-border shadow-xl shadow-black/5 sticky top-28"
                  >
                    <h3 className="text-xl font-bold mb-6">Laissez votre <span className="text-[#FF4F5A]">avis</span></h3>
                    
                    <div className="space-y-6">
                      <div className="flex flex-col gap-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Note globale</p>
                        <div className="flex gap-1.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onMouseEnter={() => setHoveredRating(star)}
                              onMouseLeave={() => setHoveredRating(0)}
                              onClick={() => setReviewRating(star)}
                              className="transition-transform active:scale-90"
                            >
                              <Star
                                className={cn(
                                  "w-8 h-8 transition-colors",
                                  (hoveredRating || reviewRating) >= star
                                    ? "fill-[#FF4F5A] text-[#FF4F5A]"
                                    : "text-muted-foreground/20"
                                )}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Commentaire détaillé</label>
                        <textarea
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Partagez votre expérience avec cet article..."
                          className="w-full min-h-[120px] p-4 rounded-2xl bg-muted/30 border border-border focus:ring-2 focus:ring-[#FF4F5A]/20 resize-none font-bold text-sm outline-none transition-all"
                        />
                      </div>

                      {reviewError && (
                        <p className="text-xs font-bold text-red-500 bg-red-500/10 p-4 rounded-2xl border border-red-500/20 flex items-center gap-2">
                           <AlertCircle className="w-4 h-4" /> {reviewError}
                        </p>
                      )}

                      <Button
                        onClick={handleSubmitReview}
                        disabled={isSubmittingReview}
                        className="w-full bg-[#FF4F5A] hover:bg-[#FF4F5A]/90 text-white rounded-[1.25rem] h-14 font-black text-xs uppercase tracking-widest shadow-xl shadow-[#FF4F5A]/20 transition-all active:scale-[0.98]"
                      >
                        {isSubmittingReview ? <Loader2 className="w-5 h-5 animate-spin" /> : "Publier mon avis"}
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="bg-muted/30 rounded-[2.5rem] p-10 border border-dashed border-border text-center sticky top-28">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                      <Star className="w-8 h-8 text-muted-foreground/20" />
                    </div>
                    <h3 className="text-xl font-bold mb-4">Connectez-vous pour laisser un avis</h3>
                    <p className="text-muted-foreground text-sm mb-8">Partagez votre expérience avec la communauté Karrily.</p>
                    <Button 
                      onClick={() => navigate("/login")}
                      className="w-full rounded-2xl bg-foreground text-background font-bold h-12"
                    >
                      Se connecter
                    </Button>
                  </div>
                )}
              </div>

              {/* Reviews List Column */}
              <div className="lg:col-span-8">
                {isLoadingReviews ? (
                  <div className="py-20 text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-[#FF4F5A] mx-auto" />
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="bg-card rounded-[2.5rem] p-20 text-center border border-border">
                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                      <MessageCircle className="w-10 h-10 text-muted-foreground/30" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Pas encore d'avis</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">Soyez la première personne à donner son avis sur cet article !</p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {reviews.map((review) => (
                      <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card rounded-[2rem] p-8 border border-border shadow-sm hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-muted shadow-inner">
                              {review.reviewer?.avatar_url ? (
                                <img src={review.reviewer.avatar_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#FF4F5A] to-[#0F2A2E] text-white font-black text-sm">
                                  {review.reviewer?.full_name?.charAt(0) || "U"}
                                </div>
                              )}
                            </div>
                            <div>
                              <h4 className="font-bold text-lg text-foreground">{review.reviewer?.full_name}</h4>
                              <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{new Date(review.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1 bg-muted/50 px-3 py-1.5 rounded-full border border-border/50">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} className={cn("w-3.5 h-3.5", s <= review.rating ? "fill-[#FF4F5A] text-[#FF4F5A]" : "text-muted-foreground/20")} />
                              ))}
                            </div>
                            <button 
                              onClick={() => setReportConfig({ 
                                isOpen: true, 
                                targetId: review.id, 
                                targetType: "review", 
                                targetTitle: `l'avis de ${review.reviewer?.full_name}` 
                              })}
                              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 text-muted-foreground/40 hover:text-red-500 transition-colors"
                              title="Signaler cet avis"
                            >
                              <Flag className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="bg-muted/20 p-6 rounded-2xl border border-border/50">
                          <p className="text-foreground/90 leading-relaxed font-medium italic">
                            "{review.comment}"
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />

      {item && (
        <>
          <PurchaseRequestModal 
            isOpen={isPurchaseModalOpen}
            onClose={() => setIsPurchaseModalOpen(false)}
            item={item}
            onSuccess={() => {}}
          />

          <TrocProposalModal 
            isOpen={isTrocModalOpen}
            onClose={() => setIsTrocModalOpen(false)}
            requestedItem={item}
            onSuccess={() => {}}
          />
        </>
      )}

      <ReportDialog 
        isOpen={reportConfig.isOpen}
        onClose={() => setReportConfig(prev => ({ ...prev, isOpen: false }))}
        targetId={reportConfig.targetId}
        targetType={reportConfig.targetType}
        targetTitle={reportConfig.targetTitle}
      />
    </div>
  );
}

