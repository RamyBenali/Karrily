import { motion, AnimatePresence } from "motion/react";
import {
  SlidersHorizontal,
  Search,
  Grid3x3,
  LayoutGrid,
  X,
  ChevronDown,
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

export const EXPLORE_BUDGET_MAX = 200_000;

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
    <div
      className={cn(
        "explore-filter-sidebar rounded-2xl border p-5 shadow-lg",
        className,
      )}
    >
      {onCloseMobile ? (
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Filtres
          </span>
          <button
            type="button"
            className="rounded-full p-2 transition-colors hover:bg-white/10"
            onClick={onCloseMobile}
            aria-label="Fermer"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      ) : null}

      <div className="mb-8">
        <p className="mb-6 text-[11px] font-medium tracking-wide opacity-70" style={{ color: "var(--ex-muted)" }}>
          {totalCount} unité{totalCount !== 1 ? "s" : ""} identifiée{totalCount !== 1 ? "s" : ""} dans le secteur
        </p>

        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: "var(--ex-title)" }}>
            Filtres
          </h2>
          <button
            type="button"
            onClick={resetFilters}
            className="text-[10px] font-bold uppercase tracking-[0.2em] transition-opacity hover:opacity-80"
            style={{ color: "var(--ex-reset)" }}
          >
            RESET
          </button>
        </div>
      </div>

      <section className="mb-8">
        <h3
          className="mb-4 text-[10px] font-bold uppercase tracking-[0.1em]"
          style={{ color: "var(--ex-muted)" }}
        >
          Secteurs
        </h3>
        <ul className="grid grid-cols-1 gap-1">
          {categories.map((cat) => {
            const checked = selectedCategorySlugs.includes(cat.slug);
            return (
              <li key={cat.id}>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl py-2 transition-all hover:bg-white/5 group">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-border bg-transparent transition-all checked:border-[#FF4F5A] checked:bg-[#FF4F5A]"
                      checked={checked}
                      onChange={() => {
                        setSelectedCategorySlugs((prev) => toggleSlug(prev, cat.slug));
                        setCategoryFilters({});
                      }}
                    />
                    <svg
                      className="absolute h-3 w-3 text-white opacity-0 transition-opacity peer-checked:opacity-100"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span className={cn(
                    "min-w-0 flex-1 text-[13.5px] font-medium transition-colors group-hover:text-[#FF4F5A]",
                    checked ? "text-[#FF4F5A]" : "text-foreground/80"
                  )}>
                    {cat.name}
                  </span>
                  <span className="shrink-0 tabular-nums text-[11px] font-medium opacity-40">
                    {cat.item_count}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mb-8">
        <h3
          className="mb-6 text-[10px] font-bold uppercase tracking-[0.2em]"
          style={{ color: "var(--ex-muted)" }}
        >
          BUDGET (EUR)
        </h3>
        <div className="explore-budget-slider px-0.5 pt-1">
          <Slider
            min={0}
            max={EXPLORE_BUDGET_MAX}
            step={1000}
            value={budgetRange}
            onValueChange={(v) => {
              const next = v as [number, number];
              setBudgetRange([next[0], next[1]]);
            }}
            className="w-full"
          />
        </div>
        <div className="mt-2 flex justify-between text-xs" style={{ color: "var(--ex-muted)" }}>
          <span>{budgetRange[0].toLocaleString("fr-DZ")} DA</span>
          <span>
            {budgetRange[1] >= EXPLORE_BUDGET_MAX
              ? `${EXPLORE_BUDGET_MAX.toLocaleString("fr-DZ")}+ DA`
              : `${budgetRange[1].toLocaleString("fr-DZ")} DA`}
          </span>
        </div>
      </section>

      <section className="mb-8">
        <label
          className="mb-4 block text-[10px] font-bold uppercase tracking-[0.1em]"
          style={{ color: "var(--ex-muted)" }}
          htmlFor="sidebar-rating"
        >
          Note minimum
        </label>
        <div className="relative group">
          <select
            id="sidebar-rating"
            className="w-full appearance-none rounded-xl border border-border bg-card px-4 py-2.5 text-[13.5px] font-medium text-foreground outline-none transition-all focus:border-[#FF4F5A]/50 group-hover:border-border/80"
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
          >
            {RATING_FILTER_OPTIONS.map((o) => (
              <option key={o.value || "all"} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none group-hover:text-foreground transition-colors" />
        </div>
      </section>

      <section className="mb-8">
        <label
          className="mb-4 block text-[10px] font-bold uppercase tracking-[0.1em]"
          style={{ color: "var(--ex-muted)" }}
          htmlFor="sidebar-wilaya"
        >
          Wilaya
        </label>
        <div className="relative group">
          <select
            id="sidebar-wilaya"
            className="w-full appearance-none rounded-xl border border-border bg-card px-4 py-2.5 text-[13.5px] font-medium text-foreground outline-none transition-all focus:border-[#FF4F5A]/50 group-hover:border-border/80"
            value={selectedWilaya}
            onChange={(e) => setSelectedWilaya(e.target.value)}
          >
            <option value="">Toute l&apos;Algérie</option>
            {WILAYAS.map((w) => (
              <option key={w.code} value={w.code}>
                {w.code} — {w.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none group-hover:text-foreground transition-colors" />
        </div>
      </section>

      <section className="mb-4">
        <span
          className="mb-2 block text-[11px] font-semibold uppercase tracking-widest"
          style={{ color: "var(--ex-muted)" }}
        >
          Type d&apos;annonce
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedListingType("")}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-semibold transition-all shadow-sm",
              !selectedListingType 
                ? "bg-[#FF4F5A] text-white shadow-[#FF4F5A]/20" 
                : "bg-muted/50 text-foreground/70 hover:bg-muted hover:text-foreground",
            )}
          >
            Tous
          </button>
          {Object.entries(LISTING_TYPE_LABELS).map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => setSelectedListingType(val)}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-semibold transition-all shadow-sm",
                selectedListingType === val
                  ? "bg-[#FF4F5A] text-white shadow-[#FF4F5A]/20"
                  : "bg-muted/50 text-foreground/70 hover:bg-muted hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="mb-6">
        <span
          className="mb-2 block text-[11px] font-semibold uppercase tracking-widest"
          style={{ color: "var(--ex-muted)" }}
        >
          État
        </span>
        <div className="flex flex-wrap gap-2">
          {[
            { v: "", l: "Tous" },
            { v: "new", l: "Neuf" },
            { v: "like_new", l: "Comme neuf" },
            { v: "good", l: "Bon" },
            { v: "fair", l: "Correct" },
          ].map((c) => (
            <button
              key={c.v || "all"}
              type="button"
              onClick={() => setSelectedCondition(c.v)}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-semibold transition-all shadow-sm",
                selectedCondition === c.v
                  ? "bg-[#FF4F5A] text-white shadow-[#FF4F5A]/20"
                  : "bg-muted/50 text-foreground/70 hover:bg-muted hover:text-foreground",
              )}
            >
              {c.l}
            </button>
          ))}
        </div>
      </section>

      {activeCategoryFilters.length > 0 && singleSlug ? (
        <section className="mb-2 rounded-xl border p-4" style={{ borderColor: "var(--ex-border)", background: "var(--ex-nested-bg)" }}>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wide" style={{ color: "var(--ex-title)" }}>
            Filtres {categories.find((c) => c.slug === singleSlug)?.name}
          </h3>
          <div className="flex flex-col gap-3">
            {activeCategoryFilters.map((filter) => (
              <div key={filter.key}>
                {filter.type === "select" ? (
                  <>
                    <label className="mb-1 block text-xs" style={{ color: "var(--ex-muted)" }}>
                      {filter.label}
                    </label>
                    <select
                      className="explore-select w-full rounded-lg border px-2 py-2 text-sm"
                      style={{
                        background: "var(--ex-input-bg)",
                        borderColor: "var(--ex-border)",
                        color: "var(--ex-label)",
                      }}
                      value={categoryFilters[filter.key] || ""}
                      onChange={(e) =>
                        setCategoryFilters((prev) => ({ ...prev, [filter.key]: e.target.value }))
                      }
                    >
                      <option value="">Tous</option>
                      {filter.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </>
                ) : null}
                {filter.type === "number" ? (
                  <>
                    <label className="mb-1 block text-xs" style={{ color: "var(--ex-muted)" }}>
                      {filter.label}
                    </label>
                    <Input
                      type="number"
                      value={categoryFilters[filter.key] || ""}
                      onChange={(e) =>
                        setCategoryFilters((prev) => ({ ...prev, [filter.key]: e.target.value }))
                      }
                      placeholder={filter.unit ? `Ex: 80 ${filter.unit}` : ""}
                      className="rounded-lg text-sm"
                      min={filter.min}
                      max={filter.max}
                    />
                  </>
                ) : null}
                {filter.type === "checkbox" ? (
                  <label className="flex cursor-pointer items-center gap-2 py-1">
                    <input
                      type="checkbox"
                      className="explore-sector-checkbox h-4 w-4 rounded"
                      checked={categoryFilters[filter.key] === "true"}
                      onChange={(e) =>
                        setCategoryFilters((prev) => ({
                          ...prev,
                          [filter.key]: e.target.checked ? "true" : "",
                        }))
                      }
                    />
                    <span className="text-sm" style={{ color: "var(--ex-label)" }}>
                      {filter.label}
                    </span>
                  </label>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
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
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div className="relative min-w-0 flex-1 sm:max-w-xl">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={debouncedSearch}
          onChange={(e) => setDebouncedSearch(e.target.value)}
          placeholder="Rechercher une annonce…"
          className="h-12 w-full rounded-2xl border border-border bg-card pl-12 pr-10 text-[15px] text-foreground shadow-sm outline-none ring-[#FF4F5A]/0 transition-[box-shadow,border-color] focus:border-[#FF4F5A]/50 focus:ring-2 focus:ring-[#FF4F5A]/25"
        />
        {debouncedSearch ? (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:text-foreground"
            onClick={() => setDebouncedSearch("")}
            aria-label="Effacer"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <button
          type="button"
          className="relative flex h-12 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted/50 lg:hidden"
          onClick={onOpenMobileFilters}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtres
          {activeFilterCount > 0 ? (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FF4F5A] px-1.5 text-[11px] font-bold text-white">
              {activeFilterCount}
            </span>
          ) : null}
        </button>

        <div className="flex rounded-full border border-border bg-muted/40 p-1">
          <button
            type="button"
            className={cn(
              "rounded-full p-2 transition-colors",
              layout === "grid" ? "bg-card text-[#0F2A2E] shadow-sm dark:text-foreground" : "text-muted-foreground",
            )}
            onClick={() => setLayout("grid")}
            aria-label="Grille compacte"
          >
            <Grid3x3 className="h-5 w-5" />
          </button>
          <button
            type="button"
            className={cn(
              "rounded-full p-2 transition-colors",
              layout === "large" ? "bg-card text-[#0F2A2E] shadow-sm dark:text-foreground" : "text-muted-foreground",
            )}
            onClick={() => setLayout("large")}
            aria-label="Grille large"
          >
            <LayoutGrid className="h-5 w-5" />
          </button>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowSort(!showSort)}
            className="flex h-12 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground shadow-sm"
          >
            {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
            <ChevronDown className="h-4 w-4 opacity-70" />
          </button>
          <AnimatePresence>
            {showSort ? (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="absolute right-0 top-full z-20 mt-2 min-w-[200px] overflow-hidden rounded-xl border border-border bg-card py-1 shadow-xl"
              >
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={cn(
                      "w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-muted",
                      sortBy === opt.value ? "font-semibold text-[#FF4F5A]" : "text-foreground",
                    )}
                    onClick={() => {
                      setSortBy(opt.value);
                      setShowSort(false);
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <p className="hidden text-sm text-muted-foreground sm:block">
          <span className="font-semibold text-foreground">{totalCount}</span> résultat
          {totalCount !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}
