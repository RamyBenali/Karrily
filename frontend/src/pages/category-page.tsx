import { Navigation } from "../components/layout/navigation";
import { useParams, useNavigate } from "react-router";
import { motion } from "motion/react";
import { Car, ArrowRight, Star, MapPin, Heart } from "lucide-react";
import { Button } from "../components/ui/button";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Footer } from "../components/layout/footer";
import { useState, useEffect } from "react";

import { useTranslation } from "../context/language-context";
import { favoritesService } from "../services/api.service";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";

const categoryData: Record<string, {
  title: string;
  description: string;
  gradient: string;
  items: Array<{
    id: number;
    title: string;
    price: number;
    period: string;
    rating: number;
    reviews: number;
    location: string;
    image: string;
  }>;
}> = {
  "vehicules": {
    title: "Véhicules",
    description: "Voitures, motos et bien plus pour chaque trajet",
    gradient: "from-[#FF4F5A] to-[#FF6B74]",
    items: [
      {
        id: 2,
        title: "Voiture de Sport Premium",
        price: 299,
        period: "jour",
        rating: 5.0,
        reviews: 89,
        location: "Alger",
        image: "https://images.unsplash.com/photo-1762026846208-946fe48e96e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVtaXVtJTIwc3BvcnRzJTIwY2FyJTIwc2lkZSUyMHZpZXd8ZW58MXx8fHwxNzcxNTA1MjI2fDA&ixlib=rb-4.1.0&q=80&w=1080",
      },
      {
        id: 5,
        title: "Moto Vintage",
        price: 180,
        period: "jour",
        rating: 4.9,
        reviews: 142,
        location: "Oran",
        image: "https://images.unsplash.com/photo-1770316937353-6671d7f6323c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwbW90b3JjeWNsZSUyMHJldHJvJTIwYmlrZXxlbnwxfHx8fDE3NzE1MDUzMDh8MA&ixlib=rb-4.1.0&q=80&w=1080",
      },
      {
        id: 8,
        title: "Vélo Électrique",
        price: 45,
        period: "jour",
        rating: 4.6,
        reviews: 231,
        location: "Constantine",
        image: "https://images.unsplash.com/photo-1758764032776-08f6930a9146?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMGJpa2UlMjBiaWN5Y2xlJTIwbW9kZXJufGVufDF8fHx8MTc3MTUwNTMxMHww&ixlib=rb-4.1.0&q=80&w=1080",
      }
    ]
  },
  "electronique": {
    title: "Électronique",
    description: "Appareils photo, ordinateurs portables et équipement professionnel",
    gradient: "from-[#0F2A2E] to-[#1A4851]",
    items: [
      {
        id: 3,
        title: "Kit Caméra Professionnelle",
        price: 85,
        period: "jour",
        rating: 4.8,
        reviews: 203,
        location: "Sétif",
        image: "https://images.unsplash.com/photo-1769699167687-540cce99f744?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBjYW1lcmElMjBlcXVpcG1lbnR8ZW58MXx8fHwxNzcxNDg2NjExfDA&ixlib=rb-4.1.0&q=80&w=1080",
      },
      {
        id: 9,
        title: "MacBook Pro 16\"",
        price: 65,
        period: "jour",
        rating: 4.9,
        reviews: 312,
        location: "Annaba",
        image: "https://images.unsplash.com/photo-1658124975408-490b400810a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWNib29rJTIwcHJvJTIwbGFwdG9wJTIwd29ya3NwYWNlfGVufDF8fHx8MTc3MTUwNTMxMHww&ixlib=rb-4.1.0&q=80&w=1080",
      },
      {
        id: 12,
        title: "PC Portable Gaming",
        price: 75,
        period: "jour",
        rating: 4.9,
        reviews: 267,
        location: "Blida",
        image: "https://images.unsplash.com/photo-1632603093711-0d93a0bcc6cc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBsYXB0b3AlMjBzZXR1cCUyMHJnYnxlbnwxfHx8fDE3NzE1MDUyMjd8MA&ixlib=rb-4.1.0&q=80&w=1080",
      }
    ]
  },
  "immobilier": {
    title: "Immobilier",
    description: "Appartements, maisons et espaces uniques",
    gradient: "from-[#0F2A2E] to-[#1A4851]",
    items: [
      {
        id: 1,
        title: "Loft Moderne Centre-Ville",
        price: 450,
        period: "nuit",
        rating: 4.9,
        reviews: 127,
        location: "Alger Centre",
        image: "https://images.unsplash.com/photo-1638454668466-e8dbd5462f20?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBtb2Rlcm4lMjBhcGFydG1lbnQlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NzE0MzkzODh8MA&ixlib=rb-4.1.0&q=80&w=1080",
      },
      {
        id: 7,
        title: "Appartement Loft Moderne",
        price: 380,
        period: "nuit",
        rating: 4.9,
        reviews: 94,
        location: "Tizi Ouzou",
        image: "https://images.unsplash.com/photo-1767706508383-097054618007?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBsb2Z0JTIwYXBhcnRtZW50JTIwaW50ZXJpb3J8ZW58MXx8fHwxNzcxNTA1MzA5fDA&ixlib=rb-4.1.0&q=80&w=1080",
      }
    ]
  }
};

export function CategoryPage() {
  const { t, locale } = useTranslation();
  const { categoryName } = useParams<{ categoryName: string }>();
  const navigate = useNavigate();
  const [likedItems, setLikedItems] = useState<string[]>([]);
  
  const category = categoryData[categoryName || "vehicules"] || categoryData.vehicules;

  useEffect(() => {
    const fetchLikedItems = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      try {
        const res = await favoritesService.getMyFavorites();
        if (res.data) {
          setLikedItems(res.data.map((f: any) => String(f.item_id)));
        }
      } catch (e) {
        console.error("Failed to load favorites", e);
      }
    };
    fetchLikedItems();
  }, []);

  const toggleLike = async (id: string | number) => {
    try {
      const res = await favoritesService.toggleFavorite(String(id));
      setLikedItems((prev) =>
        res.isFavorite ? [...prev, String(id)] : prev.filter((i) => i !== String(id))
      );
      if (res.isFavorite) {
        toast.success(t("common.success"));
      }
    } catch (err: any) {
      toast.error(err.message || t("common.error"));
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      

      {/* Hero Section - Category Specific */}
      <div className={`relative bg-gradient-to-br ${category.gradient} pt-32 pb-24 overflow-hidden`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-[10%] w-40 h-40 bg-white/20 rounded-3xl rotate-12" />
          <div className="absolute bottom-20 left-[15%] w-32 h-32 bg-white/20 rounded-full" />
        </div>

        <div className="relative max-w-[1400px] mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => navigate('/explore')}
                className="text-white/70 hover:text-white transition-colors"
              >
                {t("nav.categories")}
              </button>
              <span className="text-white/50">/</span>
              <span className="text-white font-medium">{t(`categories.${categoryName}`)}</span>
            </div>

            <h1 className="text-6xl lg:text-7xl font-bold text-white mb-6">{t(`categories.${categoryName}`)}</h1>
            <p className="text-2xl text-white/90 max-w-2xl mb-8">{t(`category_desc.${categoryName}`)}</p>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                  <Car className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{category.items.length}+</div>
                  <div className="text-sm text-white/70">{t("item.available")}</div>
                </div>
              </div>
              <div className="w-px h-12 bg-white/20" />
              <div>
                <div className="text-2xl font-bold text-white">4.8</div>
                <div className="text-sm text-white/70">{t("item.avgRating")}</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Items Grid */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {category.items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group bg-card rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-border cursor-pointer"
              onClick={() => navigate(`/item/${item.id}`)}
            >
              <div className="relative h-72 overflow-hidden">
                <ImageWithFallback
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLike(item.id);
                  }}
                  className="absolute top-4 right-4 w-11 h-11 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-card transition-all"
                >
                  <Heart 
                    className={`w-5 h-5 transition-all ${
                      likedItems.includes(String(item.id))
                        ? "fill-[#FF4F5A] text-[#FF4F5A]"
                        : "text-foreground/80"
                    }`}
                  />
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-semibold text-foreground">{item.rating}</span>
                  <span className="text-sm text-muted-foreground">({item.reviews} {t("common.reviews")})</span>
                </div>

                <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-[#FF4F5A] transition-colors">
                  {item.title}
                </h3>

                <p className="text-sm text-muted-foreground mb-4 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {item.location}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    <span className="text-3xl font-bold text-foreground">{item.price} {t("common.da")}</span>
                    <span className="text-muted-foreground ml-1">/ {t(`landing.${item.period}`)}</span>
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/item/${item.id}`);
                    }}
                    className="bg-[#0F2A2E] hover:bg-[#1A4851] text-white rounded-full px-5 h-10 group/btn"
                  >
                    {t("item.bookNow")}
                    <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform rtl-mirror" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 bg-gradient-to-br from-[#0F2A2E] to-[#1A4851] rounded-3xl p-12 text-center"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            {t("category_cta.title")}
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            {t("category_cta.subtitle")}
          </p>
          <Button
            onClick={() => navigate('/explore')}
            className="bg-card hover:bg-white/90 text-foreground px-8 h-12 rounded-full text-lg font-medium"
          >
            {t("category_cta.button")}
          </Button>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
