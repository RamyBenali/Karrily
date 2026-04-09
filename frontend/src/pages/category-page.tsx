import { Navigation } from "../components/layout/navigation";
import { useParams, useNavigate } from "react-router";
import { motion } from "motion/react";
import { Car, ArrowRight, Star, MapPin, Heart } from "lucide-react";
import { Button } from "../components/ui/button";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Footer } from "../components/layout/footer";
import { useState } from "react";

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
  "vehicles": {
    title: "Vehicles",
    description: "Premium cars, motorcycles, and more for every journey",
    gradient: "from-[#FF4F5A] to-[#FF6B74]",
    items: [
      {
        id: 2,
        title: "Premium Sports Car",
        price: 299,
        period: "day",
        rating: 5.0,
        reviews: 89,
        location: "Los Angeles, CA",
        image: "https://images.unsplash.com/photo-1762026846208-946fe48e96e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVtaXVtJTIwc3BvcnRzJTIwY2FyJTIwc2lkZSUyMHZpZXd8ZW58MXx8fHwxNzcxNTA1MjI2fDA&ixlib=rb-4.1.0&q=80&w=1080",
      },
      {
        id: 5,
        title: "Vintage Motorcycle",
        price: 180,
        period: "day",
        rating: 4.9,
        reviews: 142,
        location: "Portland, OR",
        image: "https://images.unsplash.com/photo-1770316937353-6671d7f6323c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwbW90b3JjeWNsZSUyMHJldHJvJTIwYmlrZXxlbnwxfHx8fDE3NzE1MDUzMDh8MA&ixlib=rb-4.1.0&q=80&w=1080",
      },
      {
        id: 8,
        title: "Electric Bike",
        price: 45,
        period: "day",
        rating: 4.6,
        reviews: 231,
        location: "Miami, FL",
        image: "https://images.unsplash.com/photo-1758764032776-08f6930a9146?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMGJpa2UlMjBiaWN5Y2xlJTIwbW9kZXJufGVufDF8fHx8MTc3MTUwNTMxMHww&ixlib=rb-4.1.0&q=80&w=1080",
      }
    ]
  },
  "electronics": {
    title: "Electronics",
    description: "Latest tech, cameras, laptops, and professional equipment",
    gradient: "from-[#0F2A2E] to-[#1A4851]",
    items: [
      {
        id: 3,
        title: "Professional Camera Kit",
        price: 85,
        period: "day",
        rating: 4.8,
        reviews: 203,
        location: "New York, NY",
        image: "https://images.unsplash.com/photo-1769699167687-540cce99f744?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBjYW1lcmElMjBlcXVpcG1lbnR8ZW58MXx8fHwxNzcxNDg2NjExfDA&ixlib=rb-4.1.0&q=80&w=1080",
      },
      {
        id: 9,
        title: "MacBook Pro 16\"",
        price: 65,
        period: "day",
        rating: 4.9,
        reviews: 312,
        location: "Boston, MA",
        image: "https://images.unsplash.com/photo-1658124975408-490b400810a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWNib29rJTIwcHJvJTIwbGFwdG9wJTIwd29ya3NwYWNlfGVufDF8fHx8MTc3MTUwNTMxMHww&ixlib=rb-4.1.0&q=80&w=1080",
      },
      {
        id: 12,
        title: "Gaming Laptop",
        price: 75,
        period: "day",
        rating: 4.9,
        reviews: 267,
        location: "Las Vegas, NV",
        image: "https://images.unsplash.com/photo-1632603093711-0d93a0bcc6cc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBsYXB0b3AlMjBzZXR1cCUyMHJnYnxlbnwxfHx8fDE3NzE1MDUyMjd8MA&ixlib=rb-4.1.0&q=80&w=1080",
      }
    ]
  },
  "real-estate": {
    title: "Real Estate",
    description: "Beautiful apartments, homes, and unique spaces",
    gradient: "from-[#0F2A2E] to-[#1A4851]",
    items: [
      {
        id: 1,
        title: "Modern Downtown Loft",
        price: 450,
        period: "night",
        rating: 4.9,
        reviews: 127,
        location: "San Francisco, CA",
        image: "https://images.unsplash.com/photo-1638454668466-e8dbd5462f20?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBtb2Rlcm4lMjBhcGFydG1lbnQlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NzE0MzkzODh8MA&ixlib=rb-4.1.0&q=80&w=1080",
      },
      {
        id: 7,
        title: "Modern Loft Apartment",
        price: 380,
        period: "night",
        rating: 4.9,
        reviews: 94,
        location: "Chicago, IL",
        image: "https://images.unsplash.com/photo-1767706508383-097054618007?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBsb2Z0JTIwYXBhcnRtZW50JTIwaW50ZXJpb3J8ZW58MXx8fHwxNzcxNTA1MzA5fDA&ixlib=rb-4.1.0&q=80&w=1080",
      }
    ]
  }
};

export function CategoryPage() {
  const { categoryName } = useParams<{ categoryName: string }>();
  const navigate = useNavigate();
  const [likedItems, setLikedItems] = useState<number[]>([]);
  
  const category = categoryData[categoryName || "vehicles"] || categoryData.vehicles;

  const toggleLike = (id: number) => {
    setLikedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

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
                All Categories
              </button>
              <span className="text-white/50">/</span>
              <span className="text-white font-medium">{category.title}</span>
            </div>

            <h1 className="text-6xl lg:text-7xl font-bold text-white mb-6">{category.title}</h1>
            <p className="text-2xl text-white/90 max-w-2xl mb-8">{category.description}</p>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                  <Car className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{category.items.length}+</div>
                  <div className="text-sm text-white/70">Available</div>
                </div>
              </div>
              <div className="w-px h-12 bg-white/20" />
              <div>
                <div className="text-2xl font-bold text-white">4.8★</div>
                <div className="text-sm text-white/70">Avg Rating</div>
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
              className="group bg-white rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer"
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
                  className="absolute top-4 right-4 w-11 h-11 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all"
                >
                  <Heart 
                    className={`w-5 h-5 transition-all ${
                      likedItems.includes(item.id)
                        ? "fill-[#FF4F5A] text-[#FF4F5A]"
                        : "text-gray-700"
                    }`}
                  />
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-semibold text-gray-900">{item.rating}</span>
                  <span className="text-sm text-gray-500">({item.reviews} reviews)</span>
                </div>

                <h3 className="text-xl font-bold text-[#0F2A2E] mb-2 group-hover:text-[#FF4F5A] transition-colors">
                  {item.title}
                </h3>

                <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {item.location}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <span className="text-3xl font-bold text-[#0F2A2E]">${item.price}</span>
                    <span className="text-gray-500 ml-1">/ {item.period}</span>
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/item/${item.id}`);
                    }}
                    className="bg-[#0F2A2E] hover:bg-[#1A4851] text-white rounded-full px-5 h-10 group/btn"
                  >
                    Book Now
                    <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
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
            Can't find what you're looking for?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            We're constantly adding new items. Check back soon or browse all categories.
          </p>
          <Button
            onClick={() => navigate('/explore')}
            className="bg-white hover:bg-white/90 text-[#0F2A2E] px-8 h-12 rounded-full text-lg font-medium"
          >
            Browse All Categories
          </Button>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
