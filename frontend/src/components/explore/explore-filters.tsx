import { motion, AnimatePresence } from "motion/react";
import {
  SlidersHorizontal,
  Search,
  Grid3x3,
  LayoutGrid,
  X,
  ChevronDown,
  Filter,
  RotateCcw,
  Check,
  Star,
  MapPin,
  Tag,
  Box,
  Coins,
} from "lucide-react";
import { Input } from "../ui/input";
import { Slider } from "../ui/slider";
import type { Dispatch, SetStateAction } from "react";
import {
  LISTING_TYPE_LABELS,
  RATING_FILTER_OPTIONS,
  SORT_OPTIONS,
  WILAYAS,
  type FilterField,
} from "./explore-constants";
import { cn } from "../ui/utils";

export const EXPLORE_BUDGET_MAX = 500_000;

export interface ExploreCategoryLite {
  id: string;
  name: string;
  slug: string;
  item_count: number;
}

function toggleSlug(list: string[], slug: string): string[] {
  return list.includes(slug) ? list.filter((s) => s !== slug) : [...list, slug];
}

type SidebarProps = {
  totalCount: number;
  categories: ExploreCategoryLite[];
  selectedCategorySlugs: string[];
  setSelectedCategorySlugs: Dispatch<SetStateAction<string[]>>;
  setCategoryFilters: Dispatch<SetStateAction<Record<string, string>>>;
  budgetRange: [number, number];
  setBudgetRange: Dispatch<SetStateAction<[number, number]>>;
  minRating: string;
  setMinRating: (v: string) => void;
  selectedWilaya: string;
  setSelectedWilaya: (v: string) => void;
  selectedListingType: string;
  setSelectedListingType: (v: string) => void;
  selectedCondition: string;
  setSelectedCondition: (v: string) => void;
  activeCategoryFilters: FilterField[];
  categoryFilters: Record<string, string>;
  resetFilters: () => void;
  onCloseMobile?: () => void;
  className?: string;
};

export function ExploreFilterSidebar({
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
  onCloseMobile,
  className,
}: SidebarProps) {
  const singleSlug = selectedCategorySlugs.length === 1 ? selectedCategorySlugs[0] : "";

  return (
    <aside
      className={cn(
        "bg-card border border-border rounded-[2.5rem] p-10 shadow-2xl shadow-black/5 sticky top-28 h-fit",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#FF4F5A]/10 text-[#FF4F5A] rounded-2xl flex items-center justify-center">
            <Filter className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight">Filtres</h2>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#FF4F5A] mt-0.5">{totalCount} Annonces</p>
          </div>
        </div>
        <button
          onClick={resetFilters}
          className="w-12 h-12 rounded-2xl bg-muted/50 hover:bg-muted text-muted-foreground transition-all flex items-center justify-center group"
          title="Réinitialiser"
        >
          <RotateCcw className="w-5 h-4 group-hover:rotate-180 transition-transform duration-500" />
        </button>
      </div>

      <div className="space-y-14">
        {/* Catégories */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-muted-foreground flex items-center gap-2.5">
              <Tag className="w-4 h-4 text-[#FF4F5A]" /> Catégories
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {categories.map((cat) => {
              const checked = selectedCategorySlugs.includes(cat.slug);
              return (
                <label 
                  key={cat.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all group",
                    checked ? "bg-foreground/5 shadow-sm" : "hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={cn(
                      "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                      checked ? "bg-[#FF4F5A] border-[#FF4F5A]" : "border-border group-hover:border-foreground/20"
                    )}>
                      {checked && <Check className="w-4 h-4 text-white stroke-[3.5px]" />}
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={checked}
                        onChange={() => {
                          setSelectedCategorySlugs((prev) => toggleSlug(prev, cat.slug));
                          setCategoryFilters({});
                        }}
                      />
                    </div>
                    <span className={cn(
                      "text-[14px] font-bold transition-colors",
                      checked ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                    )}>
                      {cat.name}
                    </span>
                  </div>
                  <span className="text-[11px] font-black text-muted-foreground/30 tabular-nums">
                    {cat.item_count}
                  </span>
                </label>
              );
            })}
          </div>
        </section>

        {/* Budget */}
        <section>
          <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-muted-foreground mb-10 flex items-center gap-2.5">
            <Coins className="w-4 h-4 text-[#FF4F5A]" /> Budget Maximum
          </h3>
          <div className="px-1 gap-6 flex flex-col">
             <Slider
              min={0}
              max={EXPLORE_BUDGET_MAX}
              step={100}
              value={budgetRange}
              onValueChange={(v) => setBudgetRange(v as [number, number])}
            />
            <div className="flex justify-between items-center gap-3">
              <div className="flex-1 bg-muted/50 p-4 rounded-2xl border border-border/30">
                <p className="text-[9px] font-black uppercase text-muted-foreground mb-1">Min</p>
                <span className="text-sm font-black tabular-nums">{budgetRange[0].toLocaleString()} DA</span>
              </div>
              <div className="w-2 h-0.5 bg-border rounded-full" />
              <div className="flex-1 bg-muted/50 p-4 rounded-2xl border border-border/30">
                <p className="text-[9px] font-black uppercase text-muted-foreground mb-1">Max</p>
                <span className="text-sm font-black tabular-nums">
                  {budgetRange[1] >= EXPLORE_BUDGET_MAX ? `${EXPLORE_BUDGET_MAX.toLocaleString()}+` : budgetRange[1].toLocaleString()} DA
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Localisation */}
        <section>
          <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-muted-foreground mb-6 flex items-center gap-2.5">
            <MapPin className="w-4 h-4 text-[#FF4F5A]" /> Wilaya
          </h3>
          <div className="relative group">
            <select
              className="w-full h-16 pl-6 pr-12 rounded-2xl bg-muted/50 border border-transparent text-sm font-bold appearance-none hover:bg-muted focus:bg-card focus:border-[#FF4F5A]/30 transition-all cursor-pointer outline-none"
              value={selectedWilaya}
              onChange={(e) => setSelectedWilaya(e.target.value)}
            >
              <option value="">Toute l'Algérie</option>
              {WILAYAS.map((w) => (
                <option key={w.code} value={w.code}>{w.code} - {w.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none group-focus-within:rotate-180 transition-transform" />
          </div>
        </section>

         {/* Type & État */}
         <section className="space-y-10">
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-muted-foreground mb-5">Modalité</h3>
              <div className="flex flex-wrap gap-2.5">
                {["", ...Object.keys(LISTING_TYPE_LABELS)].map((val) => (
                  <button
                    key={val}
                    onClick={() => setSelectedListingType(val)}
                    className={cn(
                      "px-6 py-3 rounded-2xl text-[12px] font-black uppercase tracking-wider transition-all border-2",
                      selectedListingType === val 
                        ? "bg-[#FF4F5A] border-[#FF4F5A] text-white shadow-xl shadow-[#FF4F5A]/25" 
                        : "border-transparent bg-muted/50 text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {val === "" ? "Tous" : LISTING_TYPE_LABELS[val]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-muted-foreground mb-5">Condition</h3>
              <div className="flex flex-wrap gap-2.5">
                 {[
                  { v: "", l: "Tous" },
                  { v: "new", l: "Neuf" },
                  { v: "like_new", l: "Élite" },
                  { v: "good", l: "Bon" },
                ].map((c) => (
                  <button
                    key={c.v}
                    onClick={() => setSelectedCondition(c.v)}
                    className={cn(
                      "px-6 py-3 rounded-2xl text-[12px] font-black uppercase tracking-wider transition-all border-2",
                      selectedCondition === c.v 
                        ? "bg-foreground border-foreground text-background shadow-xl shadow-foreground/15" 
                        : "border-transparent bg-muted/50 text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {c.l}
                  </button>
                ))}
              </div>
            </div>
         </section>

        {/* Dynamic Filters */}
        {activeCategoryFilters.length > 0 && singleSlug && (
          <section className="pt-10 border-t-2 border-dashed border-border/50">
            <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-foreground mb-8">
              Filtres Spécifiques
            </h3>
            <div className="space-y-8">
              {activeCategoryFilters.map((filter) => (
                <div key={filter.key} className="space-y-3">
                  <label className="text-[11px] font-black text-muted-foreground px-3 uppercase tracking-wider">{filter.label}</label>
                  {filter.type === "select" ? (
                    <div className="relative group">
                      <select
                        className="w-full h-14 px-6 rounded-2xl bg-muted/30 border border-transparent text-sm font-bold appearance-none focus:bg-card focus:border-[#FF4F5A]/20 transition-all outline-none"
                        value={categoryFilters[filter.key] || ""}
                        onChange={(e) => setCategoryFilters((prev) => ({ ...prev, [filter.key]: e.target.value }))}
                      >
                        <option value="">Indifférent</option>
                        {filter.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none group-focus-within:rotate-180 transition-transform" />
                    </div>
                  ) : filter.type === "number" ? (
                    <Input
                      type="number"
                      value={categoryFilters[filter.key] || ""}
                      onChange={(e) => setCategoryFilters((prev) => ({ ...prev, [filter.key]: e.target.value }))}
                      placeholder={filter.unit || ""}
                      className="h-14 rounded-2xl bg-muted/30 border-transparent px-6 text-sm font-bold focus:border-[#FF4F5A]/20"
                    />
                  ) : filter.type === "checkbox" ? (
                    <label className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl cursor-pointer transition-all hover:bg-muted/50">
                       <div className={cn(
                        "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                        categoryFilters[filter.key] === "true" ? "bg-emerald-500 border-emerald-500" : "border-border"
                      )}>
                        {categoryFilters[filter.key] === "true" && <Check className="w-4 h-4 text-white stroke-[3.5px]" />}
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={categoryFilters[filter.key] === "true"}
                          onChange={(e) => setCategoryFilters((prev) => ({ ...prev, [filter.key]: e.target.checked ? "true" : "" }))}
                        />
                      </div>
                      <span className="text-[14px] font-bold">Oui, inclure</span>
                    </label>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </aside>
  );
}

type ToolbarProps = {
  debouncedSearch: string;
  setDebouncedSearch: (v: string) => void;
  sortBy: string;
  setSortBy: (v: string) => void;
  showSort: boolean;
  setShowSort: (v: boolean) => void;
  layout: "grid" | "large";
  setLayout: (v: "grid" | "large") => void;
  totalCount: number;
  activeFilterCount: number;
  onOpenMobileFilters: () => void;
};

export function ExploreToolbar({
  debouncedSearch,
  setDebouncedSearch,
  sortBy,
  setSortBy,
  showSort,
  setShowSort,
  layout,
  setLayout,
  totalCount,
  activeFilterCount,
  onOpenMobileFilters,
}: ToolbarProps) {
  return (
    <div className="flex flex-col md:flex-row items-center gap-6 mb-12">
      {/* Search Premium */}
      <div className="relative flex-1 w-full flex items-center group">
        <div className="absolute left-7 text-muted-foreground group-focus-within:text-[#FF4F5A] transition-colors">
          <Search className="w-6 h-6" />
        </div>
        <input
          type="search"
          value={debouncedSearch}
          onChange={(e) => setDebouncedSearch(e.target.value)}
          placeholder="Rechercher sur Karrily..."
          className="w-full h-20 pl-16 pr-16 rounded-[2rem] bg-card border border-border/50 text-lg font-medium shadow-2xl shadow-black/5 outline-none focus:ring-8 ring-[#FF4F5A]/5 focus:border-[#FF4F5A]/20 transition-all placeholder:text-muted-foreground/50"
        />
        {debouncedSearch && (
          <button
            onClick={() => setDebouncedSearch("")}
            className="absolute right-7 w-8 h-8 bg-muted rounded-2xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-5 w-full md:w-auto">
        {/* Sort Dropdown */}
        <div className="relative flex-1 md:flex-none">
          <button
            onClick={() => setShowSort(!showSort)}
            className="w-full md:w-[240px] h-20 px-8 rounded-[2rem] bg-card border border-border/50 flex items-center justify-between font-black text-sm shadow-xl shadow-black/5 hover:bg-muted/50 transition-all group"
          >
             <div className="flex flex-col items-start translate-y-[-1px]">
               <span className="text-[9px] font-black uppercase text-muted-foreground mb-0.5 tracking-wider">Trier par</span>
               <span className="truncate">{SORT_OPTIONS.find((o) => o.value === sortBy)?.label}</span>
             </div>
            <ChevronDown className={cn("w-5 h-5 text-muted-foreground transition-transform duration-300", showSort && "rotate-180")} />
          </button>
          
          <AnimatePresence>
            {showSort && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-full md:w-[240px] bg-card rounded-[2.5rem] border border-border/50 shadow-2xl p-3"
              >
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setSortBy(opt.value);
                      setShowSort(false);
                    }}
                    className={cn(
                      "w-full text-left px-6 py-4 rounded-2xl text-sm font-bold transition-all",
                      sortBy === opt.value 
                        ? "bg-[#FF4F5A] text-white" 
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Layout Switcher */}
        <div className="flex bg-card p-2 rounded-[2rem] border border-border/50 shadow-xl shadow-black/5 h-20">
          <button
            onClick={() => setLayout("grid")}
            className={cn(
              "w-14 h-full rounded-2xl transition-all flex items-center justify-center",
              layout === "grid" ? "bg-foreground text-background shadow-lg" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
            aria-label="Grille"
          >
            <Grid3x3 className="w-6 h-6" />
          </button>
          <button
            onClick={() => setLayout("large")}
            className={cn(
              "w-14 h-full rounded-2xl transition-all flex items-center justify-center",
              layout === "large" ? "bg-foreground text-background shadow-lg" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
            aria-label="Liste"
          >
            <LayoutGrid className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={onOpenMobileFilters}
          className="md:hidden h-20 w-20 flex items-center justify-center rounded-[2rem] bg-foreground text-background shadow-xl"
        >
          <SlidersHorizontal className="w-7 h-7" />
        </button>
      </div>
    </div>
  );
}
