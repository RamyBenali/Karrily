import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
    ArrowLeft, ArrowRight, Upload, X, MapPin, Tag, DollarSign,
    Image as ImageIcon, Loader2, CheckCircle2, Camera, Plus,
    Home, ShoppingCart, RefreshCw, HandCoins, Info, ChevronRight,
} from "lucide-react";
import { Navigation } from "../components/layout/navigation";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useAuthStore } from "../store/auth.store";
import { supabase } from "../lib/supabase";
import { itemsService } from "../services/api.service";
import { CATEGORY_FILTERS } from "../components/explore/explore-constants";
import { Footer } from "../components/layout/footer";

import { useTranslation } from "../context/language-context";
import { WILAYAS } from "../components/explore/explore-constants";

interface FormData {
    listing_type: string;
    title: string;
    description: string;
    category_id: string;
    condition: string;
    tags: string;
    images: File[];
    imagePreviewUrls: string[];
    price_per_day: string;
    price_per_week: string;
    price_per_month: string;
    sale_price: string;
    is_negotiable: boolean;
    deposit_amount: string;
    wilaya_code: string;
    location: string;
    troc_description: string;
    troc_estimated_value: string;
    metadata: Record<string, any>;
}

interface Category {
    id: string;
    name: string;
    slug: string;
    icon: string;
    parent_id: string | null;
}

export function CreateItemPage() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { user } = useAuthStore();
    const [step, setStep] = useState(0);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const LISTING_TYPES = [
        { value: "rent", label: t("listingTypes.rent.label"), icon: Home, desc: t("listingTypes.rent.desc") },
        { value: "sell", label: t("listingTypes.sell.label"), icon: ShoppingCart, desc: t("listingTypes.sell.desc") },
        { value: "troc", label: t("listingTypes.troc.label"), icon: RefreshCw, desc: t("listingTypes.troc.desc") },
        { value: "rent_sell", label: t("listingTypes.rent_sell.label"), icon: HandCoins, desc: t("listingTypes.rent_sell.desc") },
    ];

    const CONDITIONS = [
        { value: "new", label: t("conditions.new"), color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" },
        { value: "like_new", label: t("conditions.like_new"), color: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
        { value: "good", label: t("conditions.good"), color: "bg-slate-50 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400" },
        { value: "fair", label: t("conditions.fair"), color: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" },
        { value: "poor", label: t("conditions.poor"), color: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400" },
    ];

    const STEPS = [
        t("createItem.steps.type"),
        t("createItem.steps.details"),
        t("createItem.steps.photos"),
        t("createItem.steps.offer"),
        t("createItem.steps.recap")
    ];

    const [form, setForm] = useState<FormData>({
        listing_type: "",
        title: "",
        description: "",
        category_id: "",
        condition: "new",
        tags: "",
        images: [],
        imagePreviewUrls: [],
        price_per_day: "",
        price_per_week: "",
        price_per_month: "",
        sale_price: "",
        is_negotiable: false,
        deposit_amount: "",
        wilaya_code: "",
        location: "",
        troc_description: "",
        troc_estimated_value: "",
        metadata: {},
    });

    useEffect(() => {
        const fetchCategories = async () => {
            const { data } = await supabase
                .from("categories")
                .select("id, name, slug, icon, parent_id")
                .is("parent_id", null)
                .eq("is_active", true)
                .order("sort_order");
            if (data) setCategories(data);
        };
        fetchCategories();
    }, []);

    const updateForm = (updates: Partial<FormData>) => {
        setForm(prev => ({ ...prev, ...updates }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (form.images.length + files.length > 8) {
            setError(t("createItem.errors.maxImages"));
            return;
        }
        const newPreviews = files.map(f => URL.createObjectURL(f));
        updateForm({
            images: [...form.images, ...files],
            imagePreviewUrls: [...form.imagePreviewUrls, ...newPreviews],
        });
    };

    const removeImage = (index: number) => {
        const newImages = [...form.images];
        const newPreviews = [...form.imagePreviewUrls];
        URL.revokeObjectURL(newPreviews[index]);
        newImages.splice(index, 1);
        newPreviews.splice(index, 1);
        updateForm({ images: newImages, imagePreviewUrls: newPreviews });
    };

    const canProceed = () => {
        switch (step) {
            case 0: return form.listing_type !== "";
            case 1: return form.title.trim().length >= 5 && form.description.trim().length >= 10 && form.category_id !== "";
            case 2: return form.images.length >= 1;
            case 3: {
                if ((form.listing_type === "rent" || form.listing_type === "rent_sell") && !form.price_per_day) return false;
                if ((form.listing_type === "sell" || form.listing_type === "rent_sell") && !form.sale_price) return false;
                if (form.listing_type === "troc" && !form.troc_description) return false;
                return form.wilaya_code !== "";
            }
            default: return true;
        }
    };

    const handleSubmit = async () => {
        if (!user) return;
        setIsSubmitting(true);
        setError("");

        try {
            const imageUrls: string[] = [];
            for (const file of form.images) {
                const fileExt = file.name.split(".").pop();
                const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from("item-images")
                    .upload(fileName, file);

                if (uploadError) throw new Error(t("createItem.errors.uploadError") + ": " + uploadError.message);

                const { data: urlData } = supabase.storage.from("item-images").getPublicUrl(fileName);
                imageUrls.push(urlData.publicUrl);
            }

            const wilaya = WILAYAS.find(w => w.code === Number(form.wilaya_code));

            const response = await itemsService.create({
                owner_id: user.id,
                title: form.title.trim(),
                description: form.description.trim(),
                listing_type: form.listing_type,
                category_id: form.category_id,
                condition: form.condition,
                tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
                images: imageUrls,
                thumbnail_url: imageUrls[0] || null,
                price_per_day: form.price_per_day ? Number(form.price_per_day) : null,
                price_per_week: form.price_per_week ? Number(form.price_per_week) : null,
                price_per_month: form.price_per_month ? Number(form.price_per_month) : null,
                sale_price: form.sale_price ? Number(form.sale_price) : null,
                is_negotiable: form.is_negotiable,
                deposit_amount: form.deposit_amount ? Number(form.deposit_amount) : null,
                wilaya_code: Number(form.wilaya_code),
                location: wilaya ? `${wilaya.name}, ${wilaya.code}` : "",
                troc_description: form.troc_description || null,
                troc_estimated_value: form.troc_estimated_value ? Number(form.troc_estimated_value) : null,
                metadata: form.metadata,
                is_available: true,
            });

            navigate(`/item/${response.data.id}`);
        } catch (err: any) {
            setError(err.message || t("createItem.errors.publishError"));
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            

            <main className="pt-24 pb-20">
                <div className="max-w-4xl mx-auto px-6">
                    {/* Header Épuré */}
                    <div className="mb-12">
                        <motion.button
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={() => step > 0 ? setStep(step - 1) : navigate(-1)}
                            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform rtl-mirror" />
                            <span>{step > 0 ? t("common.prevStep") : t("common.back")}</span>
                        </motion.button>
                        
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div>
                                <h1 className="text-4xl font-extrabold tracking-tight mb-2">{t("createItem.title")}</h1>
                                <p className="text-muted-foreground text-lg">{t("createItem.subtitle")}</p>
                            </div>
                            <div className="flex gap-1.5">
                                {STEPS.map((s, i) => (
                                    <div 
                                        key={i} 
                                        className={`h-1.5 w-12 rounded-full transition-all duration-500 ${i <= step ? "bg-[#FF4F5A]" : "bg-muted"}`} 
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Zone de contenu */}
                    <div className="relative min-h-[500px]">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-2xl mb-8 flex items-center gap-3"
                            >
                                <Info className="w-5 h-5 flex-shrink-0" />
                                <p className="text-sm font-medium">{error}</p>
                            </motion.div>
                        )}

                        <AnimatePresence mode="wait">
                            {/* ÉTAPE 0: TYPE */}
                            {step === 0 && (
                                <motion.div
                                    key="step0"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="grid sm:grid-cols-2 gap-4"
                                >
                                    {LISTING_TYPES.map(type => (
                                        <button
                                            key={type.value}
                                            onClick={() => updateForm({ listing_type: type.value })}
                                            className={`p-8 rounded-[2rem] border-2 text-left transition-all group ${
                                                form.listing_type === type.value
                                                    ? "border-[#FF4F5A] bg-[#FF4F5A]/5 shadow-xl shadow-[#FF4F5A]/5 scale-[1.02]"
                                                    : "border-border hover:border-foreground/20 hover:bg-muted/30"
                                            }`}
                                        >
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${
                                                form.listing_type === type.value ? "bg-[#FF4F5A] text-white" : "bg-muted text-foreground"
                                            }`}>
                                                <type.icon className="w-7 h-7" />
                                            </div>
                                            <h3 className="text-xl font-bold mb-2">{type.label}</h3>
                                            <p className="text-muted-foreground text-sm leading-relaxed">{type.desc}</p>
                                        </button>
                                    ))}
                                </motion.div>
                            )}

                            {/* ÉTAPE 1: DÉTAILS */}
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="bg-card rounded-[2.5rem] p-10 shadow-2xl shadow-black/5 border border-border space-y-10"
                                >
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-4">{t("createItem.form.titleLabel")}</label>
                                            <Input
                                                value={form.title}
                                                onChange={e => updateForm({ title: e.target.value })}
                                                placeholder={t("createItem.form.titlePlaceholder")}
                                                className="h-16 text-lg rounded-3xl bg-muted/30 border-none px-6 focus:ring-2 ring-[#FF4F5A]/20"
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-4">{t("createItem.form.categoryLabel")}</label>
                                            <div className="flex flex-wrap gap-2">
                                                {categories.map(cat => (
                                                    <button
                                                        key={cat.id}
                                                        onClick={() => updateForm({ category_id: cat.id })}
                                                        className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                                                            form.category_id === cat.id
                                                                ? "bg-[#FF4F5A] text-white shadow-lg shadow-[#FF4F5A]/20"
                                                                : "bg-muted hover:bg-muted/80 text-muted-foreground"
                                                        }`}
                                                    >
                                                        {t(`categories.${cat.slug}`)}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-4">{t("createItem.form.descriptionLabel")}</label>
                                            <textarea
                                                value={form.description}
                                                onChange={e => updateForm({ description: e.target.value })}
                                                rows={6}
                                                placeholder={t("createItem.form.descriptionPlaceholder")}
                                                className="w-full px-6 py-5 bg-muted/30 border-none rounded-3xl text-lg resize-none focus:ring-2 ring-[#FF4F5A]/20 transition-all"
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-4">{t("createItem.form.conditionLabel")}</label>
                                            <div className="flex flex-wrap gap-3">
                                                {CONDITIONS.map(c => (
                                                    <button
                                                        key={c.value}
                                                        onClick={() => updateForm({ condition: c.value })}
                                                        className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all border-2 ${
                                                            form.condition === c.value
                                                                ? "border-[#FF4F5A] text-[#FF4F5A] bg-[#FF4F5A]/5"
                                                                : "border-transparent bg-muted text-muted-foreground"
                                                        }`}
                                                    >
                                                        {c.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* ÉTAPE 2: PHOTOS */}
                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="bg-card rounded-[2.5rem] p-10 border border-border"
                                >
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {form.imagePreviewUrls.map((url, i) => (
                                            <div key={i} className="relative aspect-square rounded-[1.5rem] overflow-hidden group shadow-lg">
                                                <img src={url} alt="" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button 
                                                        onClick={() => removeImage(i)}
                                                        className="w-10 h-10 bg-white text-red-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </div>
                                                {i === 0 && <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] font-bold text-black uppercase tracking-wider">{t("createItem.form.coverImage")}</span>}
                                            </div>
                                        ))}
                                        
                                        {form.images.length < 8 && (
                                            <label className="aspect-square rounded-[1.5rem] border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors group">
                                                <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                                    <Plus className="w-6 h-6 text-muted-foreground" />
                                                </div>
                                                <span className="text-xs font-bold text-muted-foreground">{t("common.add")}</span>
                                                <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                                            </label>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {/* ÉTAPE 3: OFFRE */}
                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="bg-card rounded-[2.5rem] p-10 border border-border space-y-12"
                                >
                                    <div className="grid md:grid-cols-2 gap-10">
                                        {(form.listing_type === "rent" || form.listing_type === "rent_sell") && (
                                            <div className="space-y-6">
                                                <h3 className="text-xl font-bold flex items-center gap-2">
                                                    <Home className="w-5 h-5 text-[#FF4F5A]" /> {t("createItem.form.rentalPrice")}
                                                </h3>
                                                <div className="space-y-4">
                                                    <div className="relative">
                                                        <span className="absolute right-6 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">{t("common.da")} / {t("common.day")}</span>
                                                        <Input 
                                                            type="number" 
                                                            value={form.price_per_day}
                                                            onChange={e => updateForm({ price_per_day: e.target.value })}
                                                            className="h-14 rounded-2xl bg-muted/30 border-none pl-6 pr-24 font-bold text-lg" 
                                                        />
                                                    </div>
                                                    <div className="relative">
                                                        <span className="absolute right-6 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">{t("createItem.form.deposit")} {t("common.da")}</span>
                                                        <Input 
                                                            type="number" 
                                                            value={form.deposit_amount}
                                                            onChange={e => updateForm({ deposit_amount: e.target.value })}
                                                            className="h-14 rounded-2xl bg-muted/30 border-none pl-6 pr-24" 
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {(form.listing_type === "sell" || form.listing_type === "rent_sell") && (
                                            <div className="space-y-6">
                                                <h3 className="text-xl font-bold flex items-center gap-2">
                                                    <ShoppingCart className="w-5 h-5 text-emerald-600" /> {t("createItem.form.salePrice")}
                                                </h3>
                                                <div className="space-y-4">
                                                    <div className="relative">
                                                        <span className="absolute right-6 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">{t("common.da")} Total</span>
                                                        <Input 
                                                            type="number" 
                                                            value={form.sale_price}
                                                            onChange={e => updateForm({ sale_price: e.target.value })}
                                                            className="h-14 rounded-2xl bg-muted/30 border-none pl-6 pr-24 font-bold text-lg" 
                                                        />
                                                    </div>
                                                     <label className="flex items-center gap-3 cursor-pointer p-4 bg-muted/30 rounded-2xl">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={form.is_negotiable}
                                                            onChange={e => updateForm({ is_negotiable: e.target.checked })}
                                                            className="w-5 h-5 accent-[#FF4F5A]" 
                                                        />
                                                        <span className="text-sm font-bold">{t("createItem.form.negotiable")}</span>
                                                    </label>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-8 border-t border-border">
                                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                            <MapPin className="w-5 h-5 text-blue-600" /> {t("common.location")}
                                        </h3>
                                        <select
                                            value={form.wilaya_code}
                                            onChange={e => updateForm({ wilaya_code: e.target.value })}
                                            className="w-full h-16 px-6 bg-muted/30 border-none rounded-2xl font-bold text-lg focus:ring-2 ring-[#FF4F5A]/20"
                                        >
                                            <option value="">{t("createItem.form.selectWilaya")}</option>
                                            {WILAYAS.map(w => (
                                                <option key={w.code} value={w.code}>{w.code} - {w.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </motion.div>
                            )}

                            {/* ÉTAPE 4: RÉCAP */}
                            {step === 4 && (
                                <motion.div
                                    key="step4"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="bg-card rounded-[2.5rem] p-10 border border-border"
                                >
                                    <div className="flex flex-col md:flex-row gap-10">
                                        <div className="w-full md:w-1/2 rounded-[2rem] overflow-hidden aspect-square h-80">
                                            <img src={form.imagePreviewUrls[0]} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 space-y-6">
                                            <div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-[#FF4F5A]">{LISTING_TYPES.find(t => t.value === form.listing_type)?.label}</span>
                                                <h2 className="text-3xl font-bold mt-1">{form.title}</h2>
                                                <div className="flex items-center gap-2 text-muted-foreground mt-2">
                                                    <MapPin className="w-4 h-4" />
                                                    <span>{WILAYAS.find(w => w.code === Number(form.wilaya_code))?.name}</span>
                                                </div>
                                            </div>

                                            <div className="p-6 bg-muted/30 rounded-3xl space-y-3">
                                                {form.price_per_day && (
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-muted-foreground font-medium">{t("createItem.form.rentalPrice")}</span>
                                                        <span className="text-xl font-black">{Number(form.price_per_day).toLocaleString()} {t("common.da")}</span>
                                                    </div>
                                                )}
                                                {form.sale_price && (
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-muted-foreground font-medium">{t("createItem.form.salePrice")}</span>
                                                        <span className="text-xl font-black text-emerald-600">{Number(form.sale_price).toLocaleString()} {t("common.da")}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <p className="text-muted-foreground italic line-clamp-3">"{form.description}"</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Navigation Bar Basse */}
                    <div className="mt-12 flex items-center justify-between">
                        <Button
                            variant="ghost"
                            onClick={() => step > 0 ? setStep(step - 1) : navigate(-1)}
                            className="rounded-2xl h-14 px-8 font-bold"
                        >
                            {step === 0 ? t("common.cancel") : t("common.back")}
                        </Button>

                        <Button
                            onClick={() => step < 4 ? setStep(step + 1) : handleSubmit()}
                            disabled={!canProceed() || isSubmitting}
                            className={`rounded-2xl h-14 px-10 font-black text-lg shadow-xl transition-all active:scale-95 ${
                                step === 4 ? "bg-[#FF4F5A] text-white shadow-[#FF4F5A]/20" : "bg-foreground text-background"
                            }`}
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                    {step === 4 ? t("createItem.form.publish") : t("common.continue")}
                                    <ChevronRight className="w-5 h-5 ml-2 rtl-mirror" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
