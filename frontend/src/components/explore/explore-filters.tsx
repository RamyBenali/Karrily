import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, MapPin, SlidersHorizontal, Check, X, ChevronDown,
  Home, ShoppingCart, RefreshCw, Star, Tag, Box, Coins, RotateCcw,
  Menu
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger, SheetClose } from "../ui/sheet";
import { Slider } from "../ui/slider";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { cn } from "../ui/utils";
import {
  WILAYAS, SORT_OPTIONS, RATING_FILTER_OPTIONS, type FilterField
} from "./explore-constants";
import type { Dispatch, SetStateAction } from "react";

export const EXPLORE_BUDGET_MAX = 1000000;

export interface ExploreCategoryLite {
  id: string;
  name: string;
  slug: string;
  item_count: number;
}

function toggleSlug(list: string[], slug: string): string[] {
  return list.includes(slug) ? list.filter((s) => s !== slug) : [...list, slug];
}

// ----------------------------------------------------------------------
// 1. EXPLORE HEADER (Barre de recherche haute, Modalités, Catégories)
// ----------------------------------------------------------------------
type ExploreHeaderProps = {
  debouncedSearch: string;
  setDebouncedSearch: (v: string) => void;
  selectedWilaya: string;
  setSelectedWilaya: (v: string) => void;
  selectedListingType: string;
  setSelectedListingType: (v: string) => void;
  selectedCategorySlugs: string[];
  setSelectedCategorySlugs: Dispatch<SetStateAction<string[]>>;
  categories: ExploreCategoryLite[];
  activeFilterCount: number;
  openMobileFilters: () => void;
  sortBy: string;
  setSortBy: (v: string) => void;
};

export function ExploreHeader({
  debouncedSearch, setDebouncedSearch,
  selectedWilaya, setSelectedWilaya,
  selectedListingType, setSelectedListingType,
  selectedCategorySlugs, setSelectedCategorySlugs,
  categories,
  activeFilterCount,
  openMobileFilters,
  sortBy, setSortBy
}: ExploreHeaderProps) {
  const [searchValue, setSearchValue] = useState(debouncedSearch);

  const handleSearchCommit = () => {
    setDebouncedSearch(searchValue);
  };

  const modalities = [
    { id: "", label: "Tous", icon: null },
    { id: "rent", label: "Location", icon: Home },
    { id: "sell", label: "Vente", icon: ShoppingCart },
    { id: "troc", label: "Troc", icon: RefreshCw },
  ];

  return (
    <div className="w-full bg-background/80 backdrop-blur-3xl sticky top-20 z-40 border-b border-border/40 pb-4 pt-6 mb-8 mt-[-1.5rem]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex flex-col gap-6">
        
        <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
          {/* Logo espace vide desktop */}
          <div className="hidden lg:block w-[100px] shrink-0" />

          {/* Search Pill */}
          <div className="flex-1 max-w-3xl flex items-center bg-card rounded-full border border-border/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 h-16 px-2 w-full group focus-within:ring-2 focus-within:ring-[#FF4F5A]/20">
            <div className="flex-[1.5] flex items-center px-4">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mr-3 shrink-0 group-focus-within:bg-[#FF4F5A]/5 transition-colors">
                <Search className="w-4 h-4 text-muted-foreground group-focus-within:text-[#FF4F5A]" />
              </div>
              <input
                type="text"
                placeholder="Que recherchez-vous ?"
                className="w-full bg-transparent border-none outline-none text-sm font-bold placeholder:text-muted-foreground/50"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchCommit()}
                onBlur={handleSearchCommit}
              />
            </div>
            
            <div className="w-[1px] h-8 bg-border/40 mx-2 shrink-0" />
            
            <div className="flex-1 flex items-center px-4 relative max-w-[220px] shrink-0">
              <MapPin className="w-4 h-4 text-muted-foreground mr-3 shrink-0" />
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#FF4F5A]/60 -mb-0.5">Wilaya</span>
                <select
                  className="w-full bg-transparent border-none outline-none text-xs font-black appearance-none cursor-pointer truncate"
                  value={selectedWilaya}
                  onChange={(e) => setSelectedWilaya(e.target.value)}
                >
                  <option value="">Toute l'Algérie</option>
                  {WILAYAS.map((w) => (
                    <option key={w.code} value={w.code}>{w.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <button 
              onClick={handleSearchCommit}
              className="w-12 h-12 bg-[#FF4F5A] rounded-full flex items-center justify-center text-white hover:bg-[#FF4F5A]/90 transition-all hover:scale-105 active:scale-95 shrink-0 shadow-lg shadow-[#FF4F5A]/20"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Action Mobile & Tri */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <div className="relative group/sort hidden sm:block">
              <select
                className="appearance-none bg-card border border-border/60 h-12 px-5 pr-10 rounded-full text-sm font-semibold hover:bg-muted/50 cursor-pointer outline-none transition-colors"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>

            <button
              onClick={openMobileFilters}
              className="flex lg:hidden items-center gap-2 bg-card border border-border/60 h-12 px-5 rounded-full text-sm font-semibold hover:bg-muted/50 transition-colors relative"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filtres
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#FF4F5A] text-white text-[10px] flex items-center justify-center font-black ml-1">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-6">
          <div className="flex p-1 bg-muted/40 rounded-full border border-border/20 shrink-0 overflow-x-auto max-w-full custom-scrollbar pb-1">
            {modalities.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedListingType(m.id)}
                className={cn(
                  "flex items-center gap-2 px-6 h-10 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
                  selectedListingType === m.id
                    ? "bg-foreground text-background shadow-lg shadow-foreground/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {m.icon && <m.icon className="w-3.5 h-3.5 shrink-0" />}
                {m.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-3 pt-1 flex-1 mask-linear-fade">
             <button
                onClick={() => setSelectedCategorySlugs([])}
                className={cn(
                  "flex items-center px-4 h-10 rounded-full border text-sm font-semibold transition-colors shrink-0",
                  selectedCategorySlugs.length === 0
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-card/50 text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                )}
              >
                Toutes
              </button>
            {categories.map((cat) => {
              const checked = selectedCategorySlugs.includes(cat.slug);
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategorySlugs((prev) => toggleSlug(prev, cat.slug))}
                  className={cn(
                    "flex items-center px-4 h-10 rounded-full border text-sm font-semibold transition-colors shrink-0",
                    checked
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-card/50 text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                  )}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 2. EXPLORE FILTERS CONTENU (Le contenu du filtre, réutilisable Desktop & Mobile)
// ----------------------------------------------------------------------
type ExploreFiltersContentProps = {
  budgetRange: [number, number];
  setBudgetRange: Dispatch<SetStateAction<[number, number]>>;
  minRating: string;
  setMinRating: (v: string) => void;
  selectedCondition: string;
  setSelectedCondition: (v: string) => void;
  activeCategoryFilters: FilterField[];
  categoryFilters: Record<string, string>;
  setCategoryFilters: Dispatch<SetStateAction<Record<string, string>>>;
  resetFilters: () => void;
  selectedListingType: string;
  className?: string;
};

export function ExploreFiltersContent({
  budgetRange, setBudgetRange,
  minRating, setMinRating,
  selectedCondition, setSelectedCondition,
  activeCategoryFilters, categoryFilters, setCategoryFilters,
  resetFilters,
  selectedListingType,
  className
}: ExploreFiltersContentProps) {

  const budgetLabel = selectedListingType === "rent" ? "Budget Location / jour" 
                    : selectedListingType === "sell" ? "Budget d'Achat"
                    : "Budget Max";

  return (
    <div className={cn("space-y-8 pb-10", className)}>
      
      {/* En-tête des filtres + Reset */}
      <div className="flex items-center justify-between pb-6 border-b border-border/20">
         <div className="space-y-1">
           <h2 className="text-xl font-black tracking-tight flex items-center gap-2 text-foreground">
             <SlidersHorizontal className="w-5 h-5 text-[#FF4F5A]" /> Filtres
           </h2>
           <p className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground/60 px-1">Personnalisez</p>
         </div>
         <button 
           onClick={resetFilters}
           className="h-8 px-4 rounded-full bg-muted/60 hover:bg-muted text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all flex items-center gap-2 border border-border/20"
         >
            <RotateCcw className="w-3 h-3" /> Reset
         </button>
      </div>

      {selectedListingType !== "troc" && (
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#FF4F5A] flex items-center gap-2">
              <Coins className="w-3.5 h-3.5" /> {budgetLabel}
            </h3>
          </div>
          <div className="px-1">
            <Slider
              min={0}
              max={EXPLORE_BUDGET_MAX}
              step={selectedListingType === "sell" ? 1000 : 100}
              value={budgetRange}
              onValueChange={(v) => setBudgetRange(v as [number, number])}
              className="mb-8"
            />
            <div className="flex justify-between items-center gap-4">
              <div className="flex-1 bg-muted p-3 lg:p-4 rounded-xl lg:rounded-2xl border border-border/40 text-center lg:text-left">
                <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Min</p>
                <span className="text-sm font-black tabular-nums">{budgetRange[0].toLocaleString()} DA</span>
              </div>
              <div className="w-3 h-[1px] bg-border shrink-0" />
              <div className="flex-1 bg-muted p-3 lg:p-4 rounded-xl lg:rounded-2xl border border-border/40 text-center lg:text-left">
                <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Max</p>
                <span className="text-xs lg:text-sm font-black tabular-nums">
                  {budgetRange[1] >= EXPLORE_BUDGET_MAX ? `${EXPLORE_BUDGET_MAX.toLocaleString()}+` : budgetRange[1].toLocaleString()} DA
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-[#FF4F5A] flex items-center gap-2">
          <Box className="w-3.5 h-3.5" /> État de l'objet
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { v: "", l: "Tous" },
            { v: "new", l: "Neuf" },
            { v: "like_new", l: "Comme neuf" },
            { v: "good", l: "Occasion" },
          ].map((c) => (
            <button
              key={c.v}
              onClick={() => setSelectedCondition(c.v)}
              className={cn(
                "px-2 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all duration-300 border",
                selectedCondition === c.v
                  ? "bg-foreground text-background border-foreground shadow-[0_8px_20px_rgb(0,0,0,0.1)] active:scale-95"
                  : "bg-muted/30 border-transparent hover:border-border/60 text-muted-foreground hover:text-foreground"
              )}
            >
              {c.l}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-[#FF4F5A] flex items-center gap-2">
          <Star className="w-3.5 h-3.5" /> Note Propriétaire
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {RATING_FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setMinRating(opt.value)}
              className={cn(
                "flex items-center justify-center gap-2 px-2 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all duration-300 border",
                minRating === opt.value
                  ? "bg-yellow-400 text-yellow-900 border-yellow-400 shadow-[0_8px_20px_rgba(250,204,21,0.3)] active:scale-95"
                  : "bg-muted/30 border-transparent hover:border-border/60 text-muted-foreground hover:text-foreground"
              )}
            >
              {opt.value !== "" && <Star className={cn("w-3 h-3 shrink-0", minRating === opt.value ? "fill-yellow-900" : "fill-yellow-400")} />}
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {activeCategoryFilters.length > 0 && (
        <section className="pt-6 border-t border-border/40">
          <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-6">
            Spécifications Spéciales
          </h3>
          <div className="space-y-5">
            {activeCategoryFilters.map((filter) => (
              <div key={filter.key} className="space-y-2">
                <label className="text-sm font-semibold text-foreground px-1">{filter.label}</label>
                
                {filter.type === "select" ? (
                  <div className="relative group">
                    <select
                      className="w-full h-11 px-4 rounded-xl bg-card border border-border text-sm font-medium appearance-none focus:border-[#FF4F5A] focus:ring-1 focus:ring-[#FF4F5A] transition-all outline-none"
                      value={categoryFilters[filter.key] || ""}
                      onChange={(e) => setCategoryFilters((prev) => ({ ...prev, [filter.key]: e.target.value }))}
                    >
                      <option value="">Indifférent</option>
                      {filter.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                ) : filter.type === "number" ? (
                  <div className="relative group">
                    <Input
                      type="number"
                      value={categoryFilters[filter.key] || ""}
                      onChange={(e) => setCategoryFilters((prev) => ({ ...prev, [filter.key]: e.target.value }))}
                      placeholder={filter.unit || ""}
                      className="h-11 rounded-xl bg-card border-border px-4 text-sm font-medium focus:border-[#FF4F5A] focus:ring-1 focus:ring-[#FF4F5A]"
                    />
                    {filter.unit && (
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">{filter.unit}</span>
                    )}
                  </div>
                ) : filter.type === "checkbox" ? (
                  <label className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl cursor-pointer hover:border-foreground/30 transition-colors">
                    <div className={cn(
                      "w-5 h-5 rounded border flex items-center justify-center transition-all",
                      categoryFilters[filter.key] === "true" ? "bg-[#FF4F5A] border-[#FF4F5A]" : "border-muted-foreground/50"
                    )}>
                      {categoryFilters[filter.key] === "true" && <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />}
                    </div>
                    <span className="text-sm font-semibold">Oui, inclure</span>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={categoryFilters[filter.key] === "true"}
                      onChange={(e) => setCategoryFilters((prev) => ({ ...prev, [filter.key]: e.target.checked ? "true" : "" }))}
                    />
                  </label>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}

// ----------------------------------------------------------------------
// 3. EXPLORE FILTERS MOBILE (Le Sheet) ET DESKTOP SIDEBAR
// ----------------------------------------------------------------------

export function ExploreFiltersMobileSheet(props: ExploreFiltersContentProps & { isOpen: boolean, onOpenChange: (open: boolean) => void }) {
  return (
    <Sheet open={props.isOpen} onOpenChange={props.onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 bg-background border-l-border/30 overflow-y-auto no-scrollbar shadow-2xl lg:hidden">
        <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-xl border-b border-border/40 px-6 py-4 flex items-center justify-between">
           <SheetTitle className="sr-only">Filtres</SheetTitle> {/* Accessible */}
           <span className="text-lg font-bold">Filtres Flexibles</span>
        </div>
        <div className="p-6">
            <ExploreFiltersContent {...props} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function ExploreFilterSidebar(props: ExploreFiltersContentProps) {
    return (
        <aside className="hidden lg:block w-[340px] shrink-0 sticky top-52 self-start glass border border-white/20 dark:border-white/5 rounded-[2.5rem] p-8 shadow-2xl shadow-black/5 h-[calc(100vh-16rem)] overflow-y-auto custom-scrollbar">
            <ExploreFiltersContent {...props} />
        </aside>
    )
}
