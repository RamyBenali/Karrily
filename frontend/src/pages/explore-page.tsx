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
import { CATEGORY_FILTERS, LISTING_TYPE_LABELS } from "../components/explore/explore-constants";
import {
  ExploreFilterSidebar,
  ExploreToolbar,
  EXPLORE_BUDGET_MAX,
} from "../components/explore/explore-filters";

interface Category {
  id: string;
  name: string;
  slug: string;
  item_count: number;
}

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
  const initialCategory = searchParams.get("category");

  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedCategorySlugs, setSelectedCategorySlugs] = useState<string[]>(
    initialCategory ? [initialCategory] : [],
  );
  const [selectedWilaya, setSelectedWilaya] = useState("");
  const [selectedListingType, setSelectedListingType] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [showSort, setShowSort] = useState(false);
  const [categoryFilters, setCategoryFilters] = useState<Record<string, string>>({});
  const [layout, setLayout] = useState<"grid" | "large">("grid");
  const [likedItems, setLikedItems] = useState<string[]>([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [budgetRange, setBudgetRange] = useState<[number, number]>([0, EXPLORE_BUDGET_MAX]);
  const [minRating, setMinRating] = useState("");

  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  const activeCategoryFilters = useMemo(() => {
    if (selectedCategorySlugs.length !== 1) return [];
    return CATEGORY_FILTERS[selectedCategorySlugs[0]] || [];
  }, [selectedCategorySlugs]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategorySlugs.length > 0) count++;
    if (budgetRange[0] > 0 || budgetRange[1] < EXPLORE_BUDGET_MAX) count++;
    if (selectedWilaya) count++;
    if (selectedListingType) count++;
    if (selectedCondition) count++;
    if (minRating) count++;
    count += Object.keys(categoryFilters).filter((k) => categoryFilters[k]).length;
    return count;
  }, [
    selectedCategorySlugs,
    budgetRange,
    selectedWilaya,
    selectedListingType,
    selectedCondition,
    minRating,
    categoryFilters,
  ]);

  useEffect(() => {
    if (mobileFiltersOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [mobileFiltersOpen]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from("categories")
        .select("id, name, slug, item_count")
        .is("parent_id", null)
        .eq("is_active", true)
        .order("sort_order");
      if (data) setCategories(data);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(debouncedSearch), 400);
    return () => clearTimeout(timer);
  }, [debouncedSearch]);

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);

      let query = supabase
        .from("items")
        .select(
          "id, title, listing_type, price_per_day, sale_price, location, wilaya_code, thumbnail_url, images, condition, rating, total_reviews, is_negotiable, created_at, favorite_count, metadata, category_id",
          { count: "exact" },
        )
        .eq("status", "active")
        .eq("is_available", true);

      if (searchQuery.trim()) {
        query = query.or(
          `title.ilike.%${searchQuery.trim()}%,description.ilike.%${searchQuery.trim()}%`,
        );
      }

      if (selectedCategorySlugs.length > 0) {
        const ids = selectedCategorySlugs
          .map((slug) => categories.find((c) => c.slug === slug)?.id)
          .filter((id): id is string => Boolean(id));
        if (ids.length > 0) {
          query = query.in("category_id", ids);
        }
      }

      if (selectedWilaya) {
        query = query.eq("wilaya_code", Number(selectedWilaya));
      }

      if (selectedListingType) {
        query = query.eq("listing_type", selectedListingType);
      }

      if (selectedCondition) {
        query = query.eq("condition", selectedCondition);
      }

      const [bMin, bMax] = budgetRange;
      if (bMin > 0) {
        query = query.gte("price_per_day", bMin);
      }
      if (bMax < EXPLORE_BUDGET_MAX) {
        query = query.lte("price_per_day", bMax);
      }

      const ratingMin = minRating.trim() !== "" ? Number(minRating) : null;
      if (ratingMin !== null && !Number.isNaN(ratingMin)) {
        query = query.gte("rating", ratingMin);
      }

      for (const [key, value] of Object.entries(categoryFilters)) {
        if (value) {
          query = query.contains("metadata", { [key]: value === "true" ? true : value });
        }
      }

      switch (sortBy) {
        case "price_asc":
          query = query.order("price_per_day", { ascending: true, nullsFirst: false });
          break;
        case "price_desc":
          query = query.order("price_per_day", { ascending: false });
          break;
        case "rating":
          query = query.order("rating", { ascending: false });
          break;
        default:
          query = query.order("created_at", { ascending: false });
      }

      const from = page * PAGE_SIZE;
      query = query.range(from, from + PAGE_SIZE - 1);

      const { data, count } = await query;

      if (data) {
        if (page === 0) {
          setItems(data as unknown as Item[]);
        } else {
          setItems((prev) => [...prev, ...(data as unknown as Item[])]);
        }
      }
      if (count !== null) setTotalCount(count);
      setIsLoading(false);
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
    if (item.price_per_day) return `${Number(item.price_per_day).toLocaleString()} DA/jour`;
    if (item.sale_price) return `${Number(item.sale_price).toLocaleString()} DA`;
    return "Prix sur demande";
  };

  const sidebarProps = {
    totalCount,
    categories,
    selectedCategorySlugs,
    setSelectedCategorySlugs,
    setCategoryFilters,
    budgetRange,
    setBudgetRange,
    minRating,
    setMinRating,
    selectedWilaya,
    setSelectedWilaya,
    selectedListingType,
    setSelectedListingType,
    selectedCondition,
    setSelectedCondition,
    activeCategoryFilters,
    categoryFilters,
    resetFilters,
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <div className="pt-24 pb-16">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-5xl font-bold text-foreground mb-3">Explorer</h1>
            <p className="text-xl text-muted-foreground">
              Découvrez des milliers d&apos;annonces près de chez vous
            </p>
          </motion.div>

          <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            <aside className="hidden w-full shrink-0 lg:block lg:w-[300px] lg:sticky lg:top-24 lg:self-start">
              <ExploreFilterSidebar {...sidebarProps} />
            </aside>

            <div className="min-w-0 flex-1">
              <ExploreToolbar
                debouncedSearch={debouncedSearch}
                setDebouncedSearch={setDebouncedSearch}
                sortBy={sortBy}
                setSortBy={setSortBy}
                showSort={showSort}
                setShowSort={setShowSort}
                layout={layout}
                setLayout={setLayout}
                totalCount={totalCount}
                activeFilterCount={activeFilterCount}
                onOpenMobileFilters={() => setMobileFiltersOpen(true)}
              />

              <AnimatePresence>
                {mobileFiltersOpen ? (
                  <motion.div
                    className="fixed inset-0 z-[60] flex lg:hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <button
                      type="button"
                      className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
                      aria-label="Fermer les filtres"
                      onClick={() => setMobileFiltersOpen(false)}
                    />
                    <motion.aside
                      initial={{ x: "-105%" }}
                      animate={{ x: 0 }}
                      exit={{ x: "-105%" }}
                      transition={{ type: "spring", damping: 28, stiffness: 320 }}
                      className="relative z-10 h-full w-[min(100vw,320px)] max-w-[90vw] overflow-y-auto shadow-2xl"
                    >
                      <ExploreFilterSidebar
                        {...sidebarProps}
                        onCloseMobile={() => setMobileFiltersOpen(false)}
                        className="min-h-full rounded-none border-0"
                      />
                    </motion.aside>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              {isLoading && page === 0 ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-[#FF4F5A]" />
                </div>
              ) : items.length === 0 ? (
                <div className="rounded-3xl border border-border bg-card py-20 text-center shadow-sm">
                  <Search className="mx-auto mb-4 h-16 w-16 text-muted-foreground opacity-50" />
                  <h3 className="mb-2 text-xl font-bold text-foreground">Aucune annonce trouvée</h3>
                  <p className="mb-6 text-muted-foreground">Essayez de modifier vos filtres ou votre recherche</p>
                  <Button
                    onClick={resetFilters}
                    className="rounded-full bg-[#FF4F5A] text-white hover:bg-[#FF4F5A]/90"
                  >
                    Réinitialiser les filtres
                  </Button>
                </div>
              ) : (
                <div
                  className={`grid ${layout === "grid"
                    ? "md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3"
                    : "md:grid-cols-2 lg:grid-cols-2"
                    } gap-6`}
                >
                  {items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index * 0.03, 0.5) }}
                      className="group cursor-pointer overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 hover:border-[#FF4F5A]/30 hover:shadow-xl"
                      onClick={() => navigate(`/item/${item.id}`)}
                    >
                      <div className={`relative ${layout === "large" ? "h-80" : "h-56"} overflow-hidden`}>
                        <ImageWithFallback
                          src={item.thumbnail_url || item.images?.[0] || ""}
                          alt={item.title}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
                          <span className="rounded-lg bg-card/90 px-2.5 py-1 text-xs font-medium text-card-foreground backdrop-blur-sm">
                            {LISTING_TYPE_LABELS[item.listing_type] || item.listing_type}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLike(item.id);
                          }}
                          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-card/90 backdrop-blur-sm transition-all hover:bg-card"
                        >
                          <Heart
                            className={`h-4 w-4 ${likedItems.includes(item.id) ? "fill-[#FF4F5A] text-[#FF4F5A]" : "text-foreground"}`}
                          />
                        </button>
                      </div>

                      <div className="p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                            {categories.find((c) => c.id === item.category_id)?.name || "Non classé"}
                          </span>
                          {item.rating > 0 ? (
                            <div className="flex items-center gap-1">
                              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs font-semibold">{Number(item.rating).toFixed(1)}</span>
                            </div>
                          ) : null}
                        </div>

                        <h3 className="mb-1.5 line-clamp-2 text-base font-bold text-foreground transition-colors group-hover:text-[#FF4F5A]">
                          {item.title}
                        </h3>

                        <p className="mb-3 flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{item.location || "Non spécifié"}</span>
                        </p>

                        <div className="flex items-center justify-between border-t border-border pt-3">
                          <div>
                            <span className="text-lg font-bold text-foreground">{getItemPrice(item)}</span>
                            {item.is_negotiable ? (
                              <span className="ml-2 text-xs font-medium text-emerald-600">Négociable</span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {items.length < totalCount ? (
                <div className="mt-12 flex justify-center">
                  <Button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={isLoading}
                    variant="outline"
                    className="h-12 rounded-full border-border px-8 text-foreground hover:bg-muted"
                  >
                    {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                    Charger plus d&apos;annonces ({items.length}/{totalCount})
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
