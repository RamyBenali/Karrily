import { Navigation } from "../components/layout/navigation";
import { useParams, useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  Star, MapPin, Shield, Clock, CheckCircle, Heart, Share2,
  Calendar, ChevronLeft, ChevronRight, Loader2, ArrowLeft,
  Tag, MessageCircle, ShoppingCart, RefreshCw, Eye, AlertCircle,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Footer } from "../components/layout/footer";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/auth.store";

const CONDITION_LABELS: Record<string, string> = {
  new: "Neuf",
  like_new: "Comme neuf",
  good: "Bon état",
  fair: "Correct",
  poor: "Usé",
};

const LISTING_TYPE_CONFIG: Record<string, { label: string; emoji: string; color: string }> = {
  rent: { label: "Location", emoji: "🏠", color: "bg-blue-100 text-blue-700" },
  sell: { label: "Vente", emoji: "🛒", color: "bg-emerald-100 text-emerald-700" },
  troc: { label: "Troc", emoji: "🔄", color: "bg-purple-100 text-purple-700" },
  rent_sell: { label: "Location & Vente", emoji: "🏷️", color: "bg-amber-100 text-amber-700" },
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
}

interface OwnerProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  is_verified: boolean;
  rating: number;
  total_reviews: number;
  created_at: string;
  wilaya_code: number;
}

interface CategoryInfo {
  name: string;
  slug: string;
}

export function ItemDetailPage() {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [item, setItem] = useState<ItemDetail | null>(null);
  const [owner, setOwner] = useState<OwnerProfile | null>(null);
  const [category, setCategory] = useState<CategoryInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  // Booking form
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [creatingConversation, setCreatingConversation] = useState(false);

  // Fetch item data
  useEffect(() => {
    const fetchItem = async () => {
      if (!itemId) return;
      setIsLoading(true);

      const { data, error: fetchError } = await supabase
        .from("items")
        .select("*")
        .eq("id", itemId)
        .single();

      if (fetchError || !data) {
        setError("Annonce introuvable.");
        setIsLoading(false);
        return;
      }

      setItem(data as ItemDetail);

      // Fetch owner profile
      const { data: ownerData } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, is_verified, rating, total_reviews, created_at, wilaya_code")
        .eq("id", data.owner_id)
        .single();
      if (ownerData) setOwner(ownerData as OwnerProfile);

      // Fetch category
      const { data: catData } = await supabase
        .from("categories")
        .select("name, slug")
        .eq("id", data.category_id)
        .single();
      if (catData) setCategory(catData as CategoryInfo);

      // Increment view count (best effort)
      supabase
        .from("items")
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq("id", itemId)
        .then(() => { });

      setIsLoading(false);
    };

    fetchItem();
  }, [itemId]);

  // Navigation
  const nextImage = () => {
    if (!item) return;
    setCurrentImageIndex((prev) => (prev + 1) % item.images.length);
  };
  const prevImage = () => {
    if (!item) return;
    setCurrentImageIndex((prev) => (prev - 1 + item.images.length) % item.images.length);
  };

  // Calculate booking price
  const calculateBooking = () => {
    if (!item?.price_per_day || !startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 0) return null;

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

  const bookingCalc = calculateBooking();

  // Handle booking submission
  const handleBooking = async () => {
    if (!user || !item || !bookingCalc) return;
    if (user.id === item.owner_id) {
      setBookingError("Vous ne pouvez pas réserver votre propre annonce.");
      return;
    }

    setIsBooking(true);
    setBookingError("");

    const { error: insertError } = await supabase
      .from("bookings")
      .insert({
        item_id: item.id,
        renter_id: user.id,
        owner_id: item.owner_id,
        start_date: startDate,
        end_date: endDate,
        price_per_day: Number(item.price_per_day),
        total_price: bookingCalc.total,
        deposit_amount: bookingCalc.deposit,
        message: bookingMessage || null,
        status: "pending",
        payment_status: "pending",
      });

    setIsBooking(false);

    if (insertError) {
      setBookingError(insertError.message.includes("no_self_booking")
        ? "Vous ne pouvez pas réserver votre propre annonce."
        : "Erreur lors de la réservation : " + insertError.message);
    } else {
      setBookingSuccess(true);
    }
  };

  // Handle Contact Owner
  const handleContactOwner = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!item) return;

    // Prevent talking to oneself
    if (user.id === item.owner_id) {
      alert("Vous ne pouvez pas vous envoyer un message à vous-même.");
      return;
    }

    setCreatingConversation(true);

    // 1. Check if conversation already exists between these 2 users for this item
    const { data: existingConvs } = await supabase
      .from("conversations")
      .select("id")
      .eq("item_id", item.id)
      .eq("participant_1", Math.min(Number(user.id.replace(/-/g, '')), Number(item.owner_id.replace(/-/g, ''))) ? user.id : item.owner_id) // We'll just check both ways
      .or(`and(participant_1.eq.${user.id},participant_2.eq.${item.owner_id}),and(participant_1.eq.${item.owner_id},participant_2.eq.${user.id})`)
      .limit(1);

    if (existingConvs && existingConvs.length > 0) {
      navigate("/dashboard", { state: { tab: "Messages", convId: existingConvs[0].id } });
      setCreatingConversation(false);
      return;
    }

    // 2. Create new conversation
    const { data: newConv, error } = await supabase
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

    if (!error && newConv) {
      navigate("/dashboard", { state: { tab: "Messages", convId: newConv.id } });
    } else {
      alert("Erreur lors de la création de la conversation.");
    }
  };

  // Owner initials
  const ownerInitials = owner?.full_name
    ? owner.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  // Member since
  const memberSince = owner?.created_at
    ? new Date(owner.created_at).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
    : "";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <div className="flex items-center justify-center pt-40">
          <Loader2 className="w-10 h-10 animate-spin text-[#FF4F5A]" />
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <div className="flex flex-col items-center justify-center pt-40">
          <AlertCircle className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">Annonce introuvable</h2>
          <p className="text-gray-500 mb-6">Cette annonce n'existe plus ou a été supprimée.</p>
          <Button onClick={() => navigate("/explore")} className="bg-[#FF4F5A] text-white rounded-full px-6">
            Retour à l'exploration
          </Button>
        </div>
      </div>
    );
  }

  const listingConfig = LISTING_TYPE_CONFIG[item.listing_type] || LISTING_TYPE_CONFIG.rent;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <div className="pt-24 pb-16">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-sm text-gray-600 mb-8"
          >
            <button onClick={() => navigate("/explore")} className="hover:text-[#0F2A2E] flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Explorer
            </button>
            <span>/</span>
            {category && (
              <>
                <button onClick={() => navigate(`/explore?category=${category.slug}`)} className="hover:text-[#0F2A2E]">
                  {category.name}
                </button>
                <span>/</span>
              </>
            )}
            <span className="text-[#0F2A2E] font-medium truncate max-w-[200px]">{item.title}</span>
          </motion.div>

          <div className="grid lg:grid-cols-12 gap-8">
            {/* ═══ Left Column — Images & Details ═══ */}
            <div className="lg:col-span-7">
              {/* Image Gallery */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-3xl overflow-hidden mb-8 group"
              >
                <div className="relative h-[500px] bg-gray-200">
                  <ImageWithFallback
                    src={item.images[currentImageIndex] || item.thumbnail_url || ""}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />

                  {/* Arrows */}
                  {item.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white"
                      >
                        <ChevronLeft className="w-6 h-6 text-gray-900" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white"
                      >
                        <ChevronRight className="w-6 h-6 text-gray-900" />
                      </button>
                    </>
                  )}

                  {/* Dots */}
                  {item.images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {item.images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentImageIndex(i)}
                          className={`w-2 h-2 rounded-full transition-all ${i === currentImageIndex ? "bg-white w-8" : "bg-white/50"
                            }`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Badge */}
                  <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium ${listingConfig.color}`}>
                    {listingConfig.emoji} {listingConfig.label}
                  </span>

                  {/* Image count */}
                  <span className="absolute bottom-4 right-4 px-3 py-1 bg-black/50 text-white text-sm rounded-full">
                    {currentImageIndex + 1} / {item.images.length}
                  </span>
                </div>
              </motion.div>

              {/* Thumbnails */}
              {item.images.length > 1 && (
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                  {item.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImageIndex(i)}
                      className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${i === currentImageIndex ? "border-[#FF4F5A]" : "border-transparent opacity-70 hover:opacity-100"
                        }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-3xl p-8 mb-8"
              >
                <h2 className="text-2xl font-bold text-[#0F2A2E] mb-4">Description</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{item.description}</p>

                {/* Tags */}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-gray-100">
                    {item.tags.map((tag, i) => (
                      <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full flex items-center gap-1">
                        <Tag className="w-3 h-3" /> {tag}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Metadata / Caractéristiques */}
              {item.metadata && Object.keys(item.metadata).length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="bg-white rounded-3xl p-8 mb-8"
                >
                  <h2 className="text-2xl font-bold text-[#0F2A2E] mb-4">Caractéristiques</h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {Object.entries(item.metadata).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-[#0F2A2E]/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-4 h-4 text-[#0F2A2E]" />
                        </div>
                        <span className="text-gray-700 capitalize">
                          {key.replace(/_/g, " ")} : <strong>{typeof value === "boolean" ? (value ? "Oui" : "Non") : value}</strong>
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Troc details */}
              {item.listing_type === "troc" && item.troc_description && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-purple-50 border border-purple-200 rounded-3xl p-8 mb-8"
                >
                  <h2 className="text-2xl font-bold text-purple-800 mb-4 flex items-center gap-2">
                    <RefreshCw className="w-6 h-6" /> Détails du troc
                  </h2>
                  <p className="text-purple-700 mb-3">{item.troc_description}</p>
                  {item.troc_estimated_value && (
                    <p className="text-sm text-purple-600">
                      Valeur estimée : <strong>{Number(item.troc_estimated_value).toLocaleString()} DA</strong>
                    </p>
                  )}
                </motion.div>
              )}
            </div>

            {/* ═══ Right Column — Booking & Owner ═══ */}
            <div className="lg:col-span-5">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="sticky top-28"
              >
                {/* Booking Card */}
                <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${listingConfig.color}`}>
                          {category?.name || ""}
                        </span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${item.condition === "new" ? "bg-emerald-100 text-emerald-700" :
                          item.condition === "like_new" ? "bg-blue-100 text-blue-700" :
                            "bg-gray-100 text-gray-600"
                          }`}>
                          {CONDITION_LABELS[item.condition] || item.condition}
                        </span>
                      </div>
                      <h1 className="text-2xl font-bold text-[#0F2A2E] mb-2">{item.title}</h1>
                      <p className="text-gray-600 flex items-center gap-1 text-sm">
                        <MapPin className="w-4 h-4" />
                        {WILAYAS[item.wilaya_code] || item.location}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsLiked(!isLiked)}
                        className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all"
                      >
                        <Heart className={`w-5 h-5 ${isLiked ? "fill-[#FF4F5A] text-[#FF4F5A]" : "text-gray-700"}`} />
                      </button>
                      <button className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all">
                        <Share2 className="w-5 h-5 text-gray-700" />
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    {item.price_per_day && (
                      <div className="flex items-baseline gap-1 mb-1">
                        <span className="text-4xl font-bold text-[#0F2A2E]">{Number(item.price_per_day).toLocaleString()} DA</span>
                        <span className="text-lg text-gray-500">/ jour</span>
                      </div>
                    )}
                    {item.price_per_week && (
                      <p className="text-sm text-gray-500">{Number(item.price_per_week).toLocaleString()} DA / semaine</p>
                    )}
                    {item.price_per_month && (
                      <p className="text-sm text-gray-500">{Number(item.price_per_month).toLocaleString()} DA / mois</p>
                    )}
                    {item.sale_price && (
                      <div className="flex items-baseline gap-1 mt-2">
                        <ShoppingCart className="w-5 h-5 text-emerald-600" />
                        <span className="text-3xl font-bold text-emerald-700">{Number(item.sale_price).toLocaleString()} DA</span>
                        <span className="text-sm text-gray-500 ml-1">(vente)</span>
                      </div>
                    )}
                    {item.is_negotiable && (
                      <span className="inline-block mt-2 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                        💬 Prix négociable
                      </span>
                    )}
                  </div>

                  {/* Booking form (for rent) */}
                  {(item.listing_type === "rent" || item.listing_type === "rent_sell") && (
                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Date début</label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="date"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            min={new Date().toISOString().slice(0, 10)}
                            className="w-full pl-12 pr-4 h-12 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FF4F5A]/50 focus:border-[#FF4F5A]"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Date fin</label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="date"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            min={startDate || new Date().toISOString().slice(0, 10)}
                            className="w-full pl-12 pr-4 h-12 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FF4F5A]/50 focus:border-[#FF4F5A]"
                          />
                        </div>
                      </div>

                      {/* Price breakdown */}
                      {bookingCalc && (
                        <div className="bg-gray-50 rounded-2xl p-4 space-y-2 mt-4">
                          <div className="flex justify-between text-gray-700">
                            <span>{bookingCalc.days} jour{bookingCalc.days > 1 ? "s" : ""}</span>
                            <span>{bookingCalc.total.toLocaleString()} DA</span>
                          </div>
                          {bookingCalc.deposit > 0 && (
                            <div className="flex justify-between text-gray-700">
                              <span>Caution (remboursable)</span>
                              <span>{bookingCalc.deposit.toLocaleString()} DA</span>
                            </div>
                          )}
                          <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-[#0F2A2E]">
                            <span>Total</span>
                            <span>{(bookingCalc.total + bookingCalc.deposit).toLocaleString()} DA</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action buttons */}
                  {bookingSuccess && (
                    <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
                      <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                      <p className="font-bold text-emerald-800 mb-1">Réservation envoyée !</p>
                      <p className="text-sm text-emerald-600">Le propriétaire va examiner votre demande.</p>
                      <Button
                        onClick={() => navigate("/dashboard")}
                        className="mt-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6 h-10 text-sm"
                      >
                        Voir mes réservations
                      </Button>
                    </div>
                  )}

                  {bookingError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700">
                      {bookingError}
                    </div>
                  )}

                  {(item.listing_type === "rent" || item.listing_type === "rent_sell") && !bookingSuccess && (
                    <>
                      {/* Message to owner */}
                      <div className="mb-4">
                        <textarea
                          value={bookingMessage}
                          onChange={e => setBookingMessage(e.target.value)}
                          placeholder="Message au propriétaire (optionnel)..."
                          rows={2}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#FF4F5A]/50"
                        />
                      </div>
                      <Button
                        onClick={() => user ? handleBooking() : navigate("/login")}
                        className="w-full h-14 bg-[#FF4F5A] hover:bg-[#FF4F5A]/90 text-white text-lg font-semibold rounded-2xl shadow-xl shadow-[#FF4F5A]/30 mb-3"
                        disabled={!bookingCalc || isBooking}
                      >
                        {isBooking ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : !user ? (
                          <>Se connecter pour réserver</>
                        ) : (
                          <><Calendar className="w-5 h-5 mr-2" />Réserver maintenant</>
                        )}
                      </Button>
                    </>
                  )}

                  {(item.listing_type === "sell" || item.listing_type === "rent_sell") && (
                    <Button
                      className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-semibold rounded-2xl shadow-xl shadow-emerald-600/30 mb-3"
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Acheter
                    </Button>
                  )}

                  {item.listing_type === "troc" && (
                    <Button
                      className="w-full h-14 bg-purple-600 hover:bg-purple-700 text-white text-lg font-semibold rounded-2xl shadow-xl shadow-purple-600/30 mb-3"
                    >
                      <RefreshCw className="w-5 h-5 mr-2" />
                      Proposer un échange
                    </Button>
                  )}

                  <Button
                    onClick={handleContactOwner}
                    disabled={creatingConversation}
                    variant="outline"
                    className="w-full h-12 rounded-2xl border-[#0F2A2E] text-[#0F2A2E] hover:bg-[#0F2A2E] hover:text-white"
                  >
                    {creatingConversation ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <><MessageCircle className="w-5 h-5 mr-2" /> Contacter le propriétaire</>
                    )}
                  </Button>

                  <p className="text-center text-xs text-gray-400 mt-3">
                    <Eye className="w-3 h-3 inline mr-1" />{item.view_count} vues · ❤️ {item.favorite_count} favoris
                  </p>
                </div>

                {/* Owner Card */}
                {owner && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 mt-6"
                  >
                    <h3 className="text-lg font-bold text-[#0F2A2E] mb-4">Publié par</h3>
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-[#0F2A2E] rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 overflow-hidden">
                        {owner.avatar_url ? (
                          <img src={owner.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          ownerInitials
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-gray-900">{owner.full_name || "Utilisateur"}</h4>
                          {owner.is_verified && (
                            <div className="w-5 h-5 bg-[#FF4F5A] rounded-full flex items-center justify-center">
                              <CheckCircle className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600 mb-1">
                          {owner.rating > 0 && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                              <span>{Number(owner.rating).toFixed(1)}</span>
                            </div>
                          )}
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {WILAYAS[owner.wilaya_code] || ""}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mb-3">
                          <Clock className="w-3 h-3 inline mr-1" />
                          Membre depuis {memberSince}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Trust Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-[#0F2A2E] to-[#1A4851] rounded-3xl p-6 mt-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center">
                      <Shield className="w-6 h-6 text-[#FF4F5A]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Transaction sécurisée</h4>
                      <p className="text-sm text-white/70">Protection Karrily incluse</p>
                    </div>
                  </div>
                  <p className="text-sm text-white/80 leading-relaxed">
                    Chaque transaction est protégée par notre garantie. Louez, achetez ou échangez en toute confiance.
                  </p>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
