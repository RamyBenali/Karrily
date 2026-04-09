import { Navigation } from "../components/layout/navigation";
import { motion } from "motion/react";
import { Search, MapPin, Calendar, Home, Car, Laptop, Wrench, Armchair, Camera, ArrowRight, Star, Shield, Clock, TrendingUp, Check, Zap, Sparkles } from "lucide-react";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { KarillyLogo, KarillyIcon } from "../components/brand/karilly-logo";
import { FloatingCTA } from "../components/ui/floating-cta";

export function LandingPage() {
  const navigate = useNavigate();

  const categories = [
    { icon: Home, label: "Real Estate", count: "2.4k", color: "#0F2A2E" },
    { icon: Car, label: "Vehicles", count: "1.8k", color: "#FF4F5A" },
    { icon: Laptop, label: "Electronics", count: "3.2k", color: "#0F2A2E" },
    { icon: Wrench, label: "Tools", count: "890", color: "#FF4F5A" },
    { icon: Armchair, label: "Furniture", count: "1.1k", color: "#0F2A2E" },
    { icon: Camera, label: "Photo & Video", count: "654", color: "#FF4F5A" },
  ];

  const trendingItems = [
    {
      id: 1,
      title: "Modern Downtown Loft",
      category: "Real Estate",
      price: 450,
      period: "night",
      rating: 4.9,
      reviews: 127,
      image: "https://images.unsplash.com/photo-1638454668466-e8dbd5462f20?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBtb2Rlcm4lMjBhcGFydG1lbnQlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NzE0MzkzODh8MA&ixlib=rb-4.1.0&q=80&w=1080",
      featured: true
    },
    {
      id: 2,
      title: "Premium Sports Car",
      category: "Vehicles",
      price: 299,
      period: "day",
      rating: 5.0,
      reviews: 89,
      image: "https://images.unsplash.com/photo-1762026846208-946fe48e96e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVtaXVtJTIwc3BvcnRzJTIwY2FyJTIwc2lkZSUyMHZpZXd8ZW58MXx8fHwxNzcxNTA1MjI2fDA&ixlib=rb-4.1.0&q=80&w=1080",
      featured: true
    },
    {
      id: 3,
      title: "Professional Camera Kit",
      category: "Photo & Video",
      price: 85,
      period: "day",
      rating: 4.8,
      reviews: 203,
      image: "https://images.unsplash.com/photo-1769699167687-540cce99f744?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBjYW1lcmElMjBlcXVpcG1lbnR8ZW58MXx8fHwxNzcxNDg2NjExfDA&ixlib=rb-4.1.0&q=80&w=1080",
      featured: false
    },
    {
      id: 4,
      title: "Designer Furniture Set",
      category: "Furniture",
      price: 120,
      period: "week",
      rating: 4.7,
      reviews: 56,
      image: "https://images.unsplash.com/photo-1760716478137-d861d5b354e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ25lciUyMGZ1cm5pdHVyZSUyMGNoYWlyJTIwbW9kZXJufGVufDF8fHx8MTc3MTUwNTIyN3ww&ixlib=rb-4.1.0&q=80&w=1080",
      featured: false
    }
  ];

  const features = [
    {
      icon: Shield,
      title: "Verified Owners",
      description: "Every item and owner goes through our verification process"
    },
    {
      icon: Clock,
      title: "Flexible Duration",
      description: "Rent by the hour, day, week, or month"
    },
    {
      icon: TrendingUp,
      title: "Earn While Idle",
      description: "Turn your unused items into steady income"
    },
    {
      icon: Zap,
      title: "Instant Booking",
      description: "Book instantly or request custom arrangements"
    }
  ];

  const steps = [
    { number: "01", title: "Search", description: "Find what you need from thousands of verified items" },
    { number: "02", title: "Book", description: "Choose your dates and complete secure payment" },
    { number: "03", title: "Receive", description: "Get it delivered or pick it up locally" },
    { number: "04", title: "Return", description: "Send it back when you're done. Simple." }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section - Bold & Impactful */}
      <div className="relative min-h-screen bg-gradient-to-br from-[#0F2A2E] via-[#1A4851] to-[#0F2A2E] overflow-hidden">
        {/* Navigation */}
        <Navigation variant="transparent" />

        {/* Enhanced Floating Objects Background with glow effects */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <motion.div
            className="absolute top-20 right-[10%] w-32 h-32 rounded-2xl bg-white/20 backdrop-blur-sm shadow-[0_0_60px_rgba(255,255,255,0.3)]"
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

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />

        {/* Hero Content */}
        <div className="relative max-w-[1400px] mx-auto px-6 lg:px-12 pt-40 pb-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Text Content */}
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
                <span className="text-white text-sm font-medium">Now live in 47 cities</span>
                <Sparkles className="w-4 h-4 text-[#FF4F5A]" />
              </motion.div>

              <h1 className="text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-6 leading-[0.95]">
                Rent<br />
                Anything.<br />
                <span className="text-[#FF4F5A] relative inline-block">
                  Anywhere.
                  <motion.span
                    className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-[#FF4F5A] to-transparent rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 1, duration: 1 }}
                  />
                </span>
              </h1>

              <p className="text-xl text-white/80 mb-12 max-w-lg leading-relaxed">
                The smarter way to access what you need. From homes to cars, tools to tech — rent it all in one place.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={() => navigate('/explore')}
                  className="bg-[#FF4F5A] hover:bg-[#FF4F5A]/90 text-white px-8 h-14 text-lg rounded-full shadow-2xl shadow-[#FF4F5A]/50 hover:shadow-[#FF4F5A]/70 hover:scale-105 transition-all group"
                >
                  Start Exploring
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  onClick={() => navigate('/lender')}
                  className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white px-8 h-14 text-lg rounded-full border border-white/30 hover:border-white/50 transition-all hover:scale-105"
                >
                  List Your Items
                </Button>
              </div>
            </motion.div>

            {/* Right - Enhanced Search Card with glassmorphism */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              {/* Glow effect behind card */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF4F5A]/20 to-[#0F2A2E]/20 blur-3xl rounded-3xl" />
              
              <div className="relative rounded-3xl border border-border bg-card/95 p-8 shadow-2xl backdrop-blur-xl hover:shadow-[0_20px_60px_rgba(255,79,90,0.2)] transition-shadow duration-500 dark:border-white/10 dark:bg-[#121a1c]/95">
                <h3 className="mb-6 flex items-center gap-2 text-2xl font-bold text-foreground">
                  Find what you need
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <Sparkles className="w-5 h-5 text-[#FF4F5A]" />
                  </motion.div>
                </h3>
                
                <div className="space-y-4">
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-[#FF4F5A] transition-colors" />
                    <input
                      type="text"
                      placeholder="What do you need?"
                      className="h-14 w-full rounded-2xl border-2 border-border bg-background pl-12 pr-4 text-[15px] text-foreground placeholder:text-muted-foreground transition-all hover:border-border focus:border-[#FF4F5A] focus:outline-none focus:ring-2 focus:ring-[#FF4F5A]/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative group">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-[#FF4F5A] transition-colors" />
                      <input
                        type="text"
                        placeholder="Location"
                        className="h-14 w-full rounded-2xl border-2 border-border bg-background pl-12 pr-4 text-[15px] text-foreground placeholder:text-muted-foreground transition-all hover:border-border focus:border-[#FF4F5A] focus:outline-none focus:ring-2 focus:ring-[#FF4F5A]/50"
                      />
                    </div>
                    <div className="relative group">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-[#FF4F5A] transition-colors" />
                      <input
                        type="text"
                        placeholder="When"
                        className="h-14 w-full rounded-2xl border-2 border-border bg-background pl-12 pr-4 text-[15px] text-foreground placeholder:text-muted-foreground transition-all hover:border-border focus:border-[#FF4F5A] focus:outline-none focus:ring-2 focus:ring-[#FF4F5A]/50"
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={() => navigate('/explore')}
                    className="w-full h-14 bg-[#0F2A2E] hover:bg-[#1A4851] text-white rounded-2xl text-lg font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                  >
                    Search
                  </Button>
                </div>

                <div className="mt-6 border-t border-border pt-6">
                  <p className="mb-3 text-sm text-muted-foreground">Popular searches:</p>
                  <div className="flex flex-wrap gap-2">
                    {["Apartments", "Cars", "Cameras", "Power Tools", "Laptops"].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        className="rounded-full border border-transparent bg-muted px-4 py-2 text-sm text-foreground transition-all hover:border-[#FF4F5A]/20 hover:bg-[#FF4F5A]/10 hover:text-[#FF4F5A]"
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

      {/* Popular Categories Section */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-24">
        <div className="flex items-end justify-between mb-12">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="mb-3 text-5xl font-bold text-foreground">Browse by Category</h2>
              <p className="text-xl text-muted-foreground">Discover thousands of items across all categories</p>
            </motion.div>
          </div>
          <Button 
            onClick={() => navigate('/explore')}
            variant="ghost" 
            className="group hidden items-center gap-2 text-foreground transition-colors hover:text-[#FF4F5A] lg:flex"
          >
            View All
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => (
            <motion.button
              key={category.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              onClick={() => navigate(`/category/${category.label.toLowerCase().replace(' ', '-')}`)}
              className="group relative rounded-3xl border border-border bg-card p-6 transition-all duration-300 hover:border-[#FF4F5A]/30 hover:shadow-xl"
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
                <p className="text-sm text-muted-foreground">{category.count} items</p>
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

      {/* Trending Rentals - Asymmetric Grid */}
      <div className="bg-card py-24">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="mb-3 text-5xl font-bold text-foreground">Trending Right Now</h2>
            <p className="text-xl text-muted-foreground">Most popular rentals this week</p>
          </motion.div>

          <div className="grid lg:grid-cols-12 gap-6">
            {/* Large Featured Item */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              onClick={() => navigate(`/item/${trendingItems[0].id}`)}
              className="lg:col-span-7 group cursor-pointer"
            >
              <div className="relative h-[500px] rounded-3xl overflow-hidden">
                <ImageWithFallback
                  src={trendingItems[0].image}
                  alt={trendingItems[0].title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-6 left-6">
                  <span className="px-4 py-2 bg-[#FF4F5A] text-white text-sm font-medium rounded-full">
                    Featured
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
                    <span className="text-3xl font-bold text-white">${trendingItems[0].price}</span>
                    <span className="text-white/70">/ {trendingItems[0].period}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Smaller Items */}
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
                        <span className="px-3 py-1 bg-[#FF4F5A] text-white text-xs font-medium rounded-full">
                          Featured
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
                        <span className="text-xl font-bold text-white">${item.price}</span>
                        <span className="text-white/70 text-sm">/ {item.period}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <Button 
              onClick={() => navigate('/explore')}
              className="bg-[#0F2A2E] hover:bg-[#1A4851] text-white px-8 h-12 rounded-full group"
            >
              Explore All Rentals
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>

      {/* How Karilly Works */}
      <div className="bg-muted/40 py-24">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="mb-4 text-5xl font-bold text-foreground">How Karilly Works</h2>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              Renting has never been easier. Four simple steps to access anything.
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
                className="relative rounded-3xl border border-border bg-card p-8 transition-all duration-300 hover:shadow-xl"
              >
                <div className="text-6xl font-bold text-[#FF4F5A]/10 mb-4">{step.number}</div>
                <h3 className="mb-3 text-2xl font-bold text-foreground">{step.title}</h3>
                <p className="leading-relaxed text-muted-foreground">{step.description}</p>
                
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2">
                    <ArrowRight className="h-6 w-6 text-muted-foreground/50" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Why Trust Karilly */}
      <div className="bg-background py-24">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="mb-4 text-5xl font-bold text-foreground">Why Trust Karilly</h2>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              Built for safety, flexibility, and peace of mind
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
                className="bg-gradient-to-br from-[#0F2A2E] to-[#1A4851] rounded-3xl p-8 text-white hover:shadow-2xl transition-all duration-300"
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

      {/* Become a Lender CTA */}
      <div className="py-24 bg-gradient-to-br from-[#FF4F5A] to-[#FF6B74]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl lg:text-6xl font-bold text-white mb-6">
                Turn Your Idle Items Into Income
              </h2>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Join thousands of lenders earning passive income by renting out their unused items. It's free to list, and you're always in control.
              </p>
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">Free to list</div>
                    <div className="text-white/80 text-sm">No upfront costs</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">Full protection</div>
                    <div className="text-white/80 text-sm">Insurance included</div>
                  </div>
                </div>
              </div>
              <Button 
                onClick={() => navigate('/lender')}
                className="bg-white hover:bg-white/90 text-[#FF4F5A] px-8 h-14 text-lg rounded-full font-semibold shadow-xl group"
              >
                Start Earning Today
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20"
            >
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-[#FF4F5A]" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-lg mb-1">Average $892/month</h4>
                    <p className="text-white/80">Typical earnings for active lenders</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-[#FF4F5A]" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-lg mb-1">$1M Protection</h4>
                    <p className="text-white/80">Every rental is fully insured</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-[#FF4F5A]" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-lg mb-1">5 Minutes Setup</h4>
                    <p className="text-white/80">List your first item in minutes</p>
                  </div>
                </div>
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
                The universal rental marketplace. Rent anything, anywhere, anytime.
              </p>
              <div className="flex gap-3">
                {["Twitter", "Instagram", "LinkedIn"].map((social) => (
                  <button
                    key={social}
                    className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                  >
                    <span className="sr-only">{social}</span>
                  </button>
                ))}
              </div>
            </div>

            {[
              {
                title: "Explore",
                links: ["All Categories", "Real Estate", "Vehicles", "Electronics", "Tools"]
              },
              {
                title: "Company",
                links: ["About Us", "How It Works", "Trust & Safety", "Careers"]
              },
              {
                title: "Support",
                links: ["Help Center", "Contact Us", "FAQs", "Insurance"]
              }
            ].map((column) => (
              <div key={column.title}>
                <h4 className="font-semibold text-lg mb-4">{column.title}</h4>
                <ul className="space-y-3">
                  {column.links.map((link) => (
                    <li key={link}>
                      <button className="text-white/70 hover:text-white transition-colors">
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/50 text-sm">
              © 2026 Karilly. All rights reserved.
            </p>
            <div className="flex gap-6">
              <button className="text-white/50 hover:text-white text-sm transition-colors">
                Privacy Policy
              </button>
              <button className="text-white/50 hover:text-white text-sm transition-colors">
                Terms of Service
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating CTA */}
      <FloatingCTA />
    </div>
  );
}
