import { Navigation } from "../components/layout/navigation";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  MapPin,
  Star,
  Heart,
  Loader2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { useNavigate, useSearchParams } from "react-router";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Footer } from "../components/layout/footer";
import { supabase } from "../lib/supabase";
import { itemsService, categoriesService } from "../services/api.service";
import { useTranslation } from "../context/language-context";
import { CATEGORY_FILTERS, LISTING_TYPE_LABELS } from "../components/explore/explore-constants";
import {
  ExploreHeader,
  ExploreFilterSidebar,
  ExploreFiltersMobileSheet,
  EXPLORE_BUDGET_MAX,
  type ExploreCategoryLite
} from "../components/explore/explore-filters";

interface Item {
  id: string;
  title: string;
  listing_type: string;
  price_per_day: number | null;
  sale_price: number | null;
  location: string;
  wilaya_code: number;
  thumbnail_url: string | null;
  images: string[];
  condition: string;
  rating: number;
  total_reviews: number;
  is_negotiable: boolean;
  created_at: string;
  favorite_count: number;
  metadata: Record<string, unknown>;
  category_id: string;
}

export function ExplorePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const initialCategory = searchParams.get("category");

  const [categories, setCategories] = useState<ExploreCategoryLite[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 24; 

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedCategorySlugs, setSelectedCategorySlugs] = useState<string[]>(
    initialCategory ? [initialCategory] : [],
  );
  const [selectedWilaya, setSelectedWilaya] = useState("");
  const [selectedListingType, setSelectedListingType] = useState(searchParams.get("type") || "");
  const [selectedCondition, setSelectedCondition] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [categoryFilters, setCategoryFilters] = useState<Record<string, string>>({});
  const [likedItems, setLikedItems] = useState<string[]>([]);
  
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const [budgetRange, setBudgetRange] = useState<[number, number]>([0, EXPLORE_BUDGET_MAX]);
  const [minRating, setMinRating] = useState("");

  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  const activeCategoryFilters = useMemo(() => {
    if (selectedCategorySlugs.length !== 1) return [];
    return CATEGORY_FILTERS[selectedCategorySlugs[0]] || [];
  }, [selectedCategorySlugs]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (budgetRange[0] > 0 || budgetRange[1] < EXPLORE_BUDGET_MAX) count++;
    if (selectedCondition) count++;
    if (minRating) count++;
    count += Object.keys(categoryFilters).filter((k) => categoryFilters[k]).length;
    return count;
  }, [
    budgetRange,
    selectedCondition,
    minRating,
    categoryFilters,
  ]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoriesService.getAll();
        if (res.data) setCategories(res.data);
      } catch (e) {
        console.error("Failed to load categories", e);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);

      try {
          const params: Record<string, any> = {
              page: page + 1,
              limit: PAGE_SIZE,
              q: searchQuery,
              minPrice: budgetRange[0],
              maxPrice: budgetRange[1],
              condition: selectedCondition,
              sortBy: sortBy === 'price_asc' || sortBy === 'price_desc' ? 'price_per_day' : 
                      sortBy === 'rating' ? 'rating' : 'created_at',
              sortOrder: sortBy === 'price_asc' ? 'asc' : 'desc'
          };

          if (selectedCategorySlugs.length > 0) {
              const id = categories.find((c) => c.slug === selectedCategorySlugs[0])?.id;
              if (id) params.category_id = id;
          }

          if (selectedWilaya) params.location = selectedWilaya;
          if (selectedListingType) params.type = selectedListingType;

          const res = await itemsService.getAll(params);

          if (res.data) {
              if (page === 0) {
                  setItems(res.data);
              } else {
                  setItems((prev) => [...prev, ...res.data]);
              }
              setTotalCount(res.count || 0);
          }
      } catch (e) {
          console.error("Failed to load items", e);
      } finally {
          setIsLoading(false);
      }
    };

    fetchItems();
  }, [
    searchQuery,
    selectedCategorySlugs,
    selectedWilaya,
    selectedListingType,
    selectedCondition,
    sortBy,
    categoryFilters,
    page,
    categories,
    budgetRange,
    minRating,
  ]);

  useEffect(() => {
    setPage(0);
  }, [
    searchQuery,
    selectedCategorySlugs,
    selectedWilaya,
    selectedListingType,
    selectedCondition,
    sortBy,
    categoryFilters,
    budgetRange,
    minRating,
  ]);

  useEffect(() => {
    setBudgetRange([0, EXPLORE_BUDGET_MAX]);
  }, [selectedListingType]);

  const resetFilters = () => {
    setDebouncedSearch("");
    setSearchQuery("");
    setSelectedCategorySlugs([]);
    setSelectedWilaya("");
    setSelectedListingType("");
    setSelectedCondition("");
    setCategoryFilters({});
    setSortBy("recent");
    setBudgetRange([0, EXPLORE_BUDGET_MAX]);
    setMinRating("");
  };

  const toggleLike = (id: string) => {
    setLikedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const getItemPrice = (item: Item) => {
    if (item.listing_type === 'sell' && item.sale_price) {
        return `${Number(item.sale_price).toLocaleString()} DA`;
    }
    if (item.price_per_day) {
        return `${Number(item.price_per_day).toLocaleString()} DA/jour`;
    }
    if (item.sale_price) {
        return `${Number(item.sale_price).toLocaleString()} DA`; 
    }
    return t("explore.priceOnRequest");
  };

  const filterProps = {
    budgetRange, setBudgetRange,
    minRating, setMinRating,
    selectedCondition, setSelectedCondition,
    activeCategoryFilters, categoryFilters, setCategoryFilters,
    resetFilters,
    selectedListingType
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      

      <ExploreHeader
        debouncedSearch={debouncedSearch}
        setDebouncedSearch={setDebouncedSearch}
        selectedWilaya={selectedWilaya}
        setSelectedWilaya={setSelectedWilaya}
        selectedListingType={selectedListingType}
        setSelectedListingType={setSelectedListingType}
        selectedCategorySlugs={selectedCategorySlugs}
        setSelectedCategorySlugs={setSelectedCategorySlugs}
        categories={categories}
        activeFilterCount={activeFilterCount}
        openMobileFilters={() => setIsMobileFiltersOpen(true)}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      <ExploreFiltersMobileSheet
        {...filterProps}
        isOpen={isMobileFiltersOpen}
        onOpenChange={setIsMobileFiltersOpen}
      />

      {/* Disposition avec Sidebar (30%) + Grille (70%) */}
      <div className="flex flex-col lg:flex-row gap-8 max-w-[1400px] mx-auto px-6 lg:px-12 w-full pb-20 items-start">
        
        {/* Sidebar Desktop */}
        <ExploreFilterSidebar {...filterProps} />

        <main className="flex-1 min-w-0">
          <div className="mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                  {totalCount === 1 ? t("explore.listingFound", { n: totalCount }) : t("explore.listingsFound", { n: totalCount })}
              </h2>
          </div>

          {isLoading && page === 0 ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="w-10 h-10 animate-spin text-[#FF4F5A]" />
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-[2.5rem] border border-border bg-card py-24 text-center shadow-sm">
              <Search className="mx-auto mb-6 h-20 w-20 text-muted-foreground/30" />
              <h3 className="mb-2 text-2xl font-bold text-foreground">{t("explore.noListings")}</h3>
              <p className="mb-8 text-muted-foreground max-w-md mx-auto">
                {t("explore.noListingsDesc")}
              </p>
              <Button
                onClick={resetFilters}
                className="rounded-full bg-foreground text-background hover:bg-foreground/90 h-12 px-8 font-bold text-base"
              >
                {t("explore.resetFilters")}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.02, 0.4) }}
                  className="group cursor-pointer overflow-hidden rounded-[24px] border border-border/40 bg-card transition-all duration-500 ease-out hover:border-[#FF4F5A]/40 hover:shadow-[0_15px_40px_-15px_rgba(255,79,90,0.2)] hover:-translate-y-2 flex flex-col relative"
                  onClick={() => navigate(`/item/${item.id}`)}
                >
                  <div className="relative h-60 overflow-hidden bg-muted">
                    <ImageWithFallback
                      src={item.thumbnail_url || item.images?.[0] || ""}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="absolute left-3 top-3 flex flex-col gap-1.5">
                      <span className="rounded-full bg-background/95 px-3 py-1 text-[11px] font-bold tracking-wide backdrop-blur-md shadow-sm border border-border/50">
                        {LISTING_TYPE_LABELS[item.listing_type] || item.listing_type}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(item.id);
                      }}
                      className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/95 backdrop-blur-md transition-all hover:scale-110 shadow-sm border border-border/50"
                    >
                      <Heart
                        className={`h-4 w-4 ${likedItems.includes(item.id) ? "fill-[#FF4F5A] text-[#FF4F5A]" : "text-foreground"}`}
                      />
                    </button>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <div className="mb-2.5 flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase tracking-widest text-[#FF4F5A] truncate mr-2">
                        {categories.find((c) => c.id === item.category_id)?.name || t("explore.uncategorized")}
                      </span>
                      {item.rating > 0 && (
                        <div className="flex items-center gap-1 shrink-0 bg-yellow-400/20 px-2 py-0.5 rounded-md backdrop-blur-sm">
                          <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                          <span className="text-[10px] font-black text-yellow-700 dark:text-yellow-400">{Number(item.rating).toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    <h3 className="mb-2 line-clamp-2 text-base font-bold text-foreground leading-snug group-hover:text-[#FF4F5A] transition-colors">
                      {item.title}
                    </h3>

                    <p className="mb-4 flex items-center gap-1.5 text-xs font-medium text-muted-foreground mt-auto">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{item.location || t("explore.unspecified")}</span>
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-border/50">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="text-lg font-black text-foreground tracking-tight">{getItemPrice(item)}</span>
                        {item.is_negotiable && (
                          <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">{t("explore.negotiable")}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {items.length < totalCount ? (
            <div className="mt-16 flex justify-center">
              <Button
                onClick={() => setPage((p) => p + 1)}
                disabled={isLoading}
                variant="outline"
                className="h-14 rounded-full border-border/60 px-10 text-foreground hover:bg-muted font-bold shadow-sm"
              >
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                {t("explore.showMore", { current: items.length, total: totalCount })}
              </Button>
            </div>
          ) : null}
        </main>
      </div>
      <Footer />
    </div>
  );
}
