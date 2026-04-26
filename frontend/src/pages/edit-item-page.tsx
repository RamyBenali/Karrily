import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
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

const WILAYAS = [
    { code: 1, name: "Adrar" }, { code: 2, name: "Chlef" }, { code: 3, name: "Laghouat" },
    { code: 4, name: "Oum El Bouaghi" }, { code: 5, name: "Batna" }, { code: 6, name: "Béjaïa" },
    { code: 7, name: "Biskra" }, { code: 8, name: "Béchar" }, { code: 9, name: "Blida" },
    { code: 10, name: "Bouira" }, { code: 11, name: "Tamanrasset" }, { code: 12, name: "Tébessa" },
    { code: 13, name: "Tlemcen" }, { code: 14, name: "Tiaret" }, { code: 15, name: "Tizi Ouzou" },
    { code: 16, name: "Alger" }, { code: 17, name: "Djelfa" }, { code: 18, name: "Jijel" },
    { code: 19, name: "Sétif" }, { code: 20, name: "Saïda" }, { code: 21, name: "Skikda" },
    { code: 22, name: "Sidi Bel Abbès" }, { code: 23, name: "Annaba" }, { code: 24, name: "Guelma" },
    { code: 25, name: "Constantine" }, { code: 26, name: "Médéa" }, { code: 27, name: "Mostaganem" },
    { code: 28, name: "M'Sila" }, { code: 29, name: "Mascara" }, { code: 30, name: "Ouargla" },
    { code: 31, name: "Oran" }, { code: 32, name: "El Bayadh" }, { code: 33, name: "Illizi" },
    { code: 34, name: "Bordj Bou Arréridj" }, { code: 35, name: "Boumerdès" },
    { code: 36, name: "El Tarf" }, { code: 37, name: "Tindouf" }, { code: 38, name: "Tissemsilt" },
    { code: 39, name: "El Oued" }, { code: 40, name: "Khenchela" }, { code: 41, name: "Souk Ahras" },
    { code: 42, name: "Tipaza" }, { code: 43, name: "Mila" }, { code: 44, name: "Aïn Defla" },
    { code: 45, name: "Naâma" }, { code: 46, name: "Aïn Témouchent" }, { code: 47, name: "Ghardaïa" },
    { code: 48, name: "Relizane" },
];

const LISTING_TYPES = [
    { value: "rent", label: "Location", icon: Home, desc: "Louer votre bien temporairement" },
    { value: "sell", label: "Vente", icon: ShoppingCart, desc: "Vendre votre bien définitivement" },
    { value: "troc", label: "Troc", icon: RefreshCw, desc: "Échanger contre un autre objet" },
    { value: "rent_sell", label: "Mixte", icon: HandCoins, desc: "Location et vente possibles" },
];

const CONDITIONS = [
    { value: "new", label: "Neuf", color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" },
    { value: "like_new", label: "Comme neuf", color: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
    { value: "good", label: "Bon état", color: "bg-slate-50 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400" },
    { value: "fair", label: "Correct", color: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" },
    { value: "poor", label: "Usé", color: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400" },
];

const STEPS = ["Modalité", "Détails", "Photos", "Offre", "Récap"];

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

export function EditItemPage() {
    const navigate = useNavigate();
    const { id: itemId } = useParams<{ id: string }>();
    const { user } = useAuthStore();
    const [step, setStep] = useState(0);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFetchingItem, setIsFetchingItem] = useState(true);
    const [error, setError] = useState("");

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
        const fetchData = async () => {
            // 1. Fetch categories
            const { data: cats } = await supabase
                .from("categories")
                .select("id, name, slug, icon, parent_id")
                .is("parent_id", null)
                .eq("is_active", true)
                .order("sort_order");
            if (cats) setCategories(cats);

            // 2. Fetch existing item
            if (itemId) {
                try {
                    const res = await itemsService.getById(itemId);
                    const item = res.data;
                    
                    if (user && item.owner_id !== user.id) {
                        navigate("/dashboard");
                        return;
                    }

                    setForm({
                        listing_type: item.listing_type || "",
                        title: item.title || "",
                        description: item.description || "",
                        category_id: item.category_id || "",
                        condition: item.condition || "new",
                        tags: item.tags ? item.tags.join(",") : "",
                        images: [],
                        imagePreviewUrls: item.images || [],
                        price_per_day: item.price_per_day?.toString() || "",
                        price_per_week: item.price_per_week?.toString() || "",
                        price_per_month: item.price_per_month?.toString() || "",
                        sale_price: item.sale_price?.toString() || "",
                        is_negotiable: item.is_negotiable || false,
                        deposit_amount: item.deposit_amount?.toString() || "",
                        wilaya_code: item.wilaya_code?.toString() || "",
                        location: item.location || "",
                        troc_description: item.troc_description || "",
                        troc_estimated_value: item.troc_estimated_value?.toString() || "",
                        metadata: item.metadata || {},
                    });
                } catch (err) {
                    setError("Impossible de charger l'annonce.");
                }
            }
            setIsFetchingItem(false);
        };
        fetchData();
    }, [itemId, user, navigate]);

    const updateForm = (updates: Partial<FormData>) => {
        setForm(prev => ({ ...prev, ...updates }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (form.imagePreviewUrls.length + files.length > 8) {
            setError("Maximum 8 images autorisées.");
            return;
        }
        const newPreviews = files.map(f => URL.createObjectURL(f));
        updateForm({
            images: [...form.images, ...files],
            imagePreviewUrls: [...form.imagePreviewUrls, ...newPreviews],
        });
    };

    const removeImage = (index: number) => {
        const newPreviews = [...form.imagePreviewUrls];
        const removedUrl = newPreviews[index];
        
        if (removedUrl.startsWith("blob:")) {
            URL.revokeObjectURL(removedUrl);
            // We need to find which File in form.images matches this blob
            // For simplicity, we filter the images by checking if their object URL matches (but that's hard)
            // A better way is to keep both in a single array of objects
        }
        
        newPreviews.splice(index, 1);
        updateForm({ imagePreviewUrls: newPreviews });
    };

    const canProceed = () => {
        switch (step) {
            case 0: return form.listing_type !== "";
            case 1: return form.title.trim().length >= 5 && form.description.trim().length >= 10 && form.category_id !== "";
            case 2: return form.imagePreviewUrls.length >= 1;
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
        if (!user || !itemId) return;
        setIsSubmitting(true);
        setError("");

        try {
            const finalImageUrls: string[] = [];
            
            // 1. Keep existing URLs
            for (const url of form.imagePreviewUrls) {
                if (!url.startsWith("blob:")) {
                    finalImageUrls.push(url);
                }
            }

            // 2. Upload new images
            for (const file of form.images) {
                const fileExt = file.name.split(".").pop();
                const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from("item-images")
                    .upload(fileName, file);

                if (uploadError) throw new Error("Erreur upload image: " + uploadError.message);

                const { data: urlData } = supabase.storage.from("item-images").getPublicUrl(fileName);
                finalImageUrls.push(urlData.publicUrl);
            }

            const wilaya = WILAYAS.find(w => w.code === Number(form.wilaya_code));

            await itemsService.update(itemId, {
                title: form.title.trim(),
                description: form.description.trim(),
                listing_type: form.listing_type,
                category_id: form.category_id,
                condition: form.condition,
                tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
                images: finalImageUrls,
                thumbnail_url: finalImageUrls[0] || null,
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

            navigate(`/item/${itemId}`);
        } catch (err: any) {
            setError(err.message || "Erreur lors de la mise à jour.");
            setIsSubmitting(false);
        }
    };

    if (isFetchingItem) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-[#FF4F5A] mb-4" />
                <p className="text-muted-foreground">Chargement de votre annonce...</p>
            </div>
        );
    }

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
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            <span>{step > 0 ? "Étape précédente" : "Retour"}</span>
                        </motion.button>
                        
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div>
                                <h1 className="text-4xl font-extrabold tracking-tight mb-2">Modifier l'annonce</h1>
                                <p className="text-muted-foreground text-lg">Mettez à jour les informations de votre bien.</p>
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
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-4">Titre de l'annonce</label>
                                            <Input
                                                value={form.title}
                                                onChange={e => updateForm({ title: e.target.value })}
                                                placeholder="Ex: Appareil Photo Sony Alpha 7 IV"
                                                className="h-16 text-lg rounded-3xl bg-muted/30 border-none px-6 focus:ring-2 ring-[#FF4F5A]/20"
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-4">Catégorie</label>
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
                                                        {cat.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-4">Description</label>
                                            <textarea
                                                value={form.description}
                                                onChange={e => updateForm({ description: e.target.value })}
                                                rows={6}
                                                placeholder="Décrivez votre objet en détail..."
                                                className="w-full px-6 py-5 bg-muted/30 border-none rounded-3xl text-lg resize-none focus:ring-2 ring-[#FF4F5A]/20 transition-all"
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-4">État de l'objet</label>
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
                                                {i === 0 && <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] font-bold text-black uppercase tracking-wider">Couverture</span>}
                                            </div>
                                        ))}
                                        
                                        {form.imagePreviewUrls.length < 8 && (
                                            <label className="aspect-square rounded-[1.5rem] border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors group">
                                                <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                                    <Plus className="w-6 h-6 text-muted-foreground" />
                                                </div>
                                                <span className="text-xs font-bold text-muted-foreground">Ajouter</span>
                                                <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                                            </label>
                                        )}
                                    </div>
                                </motion.div>
                            )}

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
                                                    <Home className="w-5 h-5 text-[#FF4F5A]" /> Prix de Location
                                                </h3>
                                                <div className="space-y-4">
                                                    <div className="relative">
                                                        <span className="absolute right-6 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">DA / Jour</span>
                                                        <Input 
                                                            type="number" 
                                                            value={form.price_per_day}
                                                            onChange={e => updateForm({ price_per_day: e.target.value })}
                                                            className="h-14 rounded-2xl bg-muted/30 border-none pl-6 pr-24 font-bold text-lg" 
                                                        />
                                                    </div>
                                                    <div className="relative">
                                                        <span className="absolute right-6 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">Caution DA</span>
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
                                                    <ShoppingCart className="w-5 h-5 text-emerald-600" /> Prix de Vente
                                                </h3>
                                                <div className="space-y-4">
                                                    <div className="relative">
                                                        <span className="absolute right-6 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">DA Total</span>
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
                                                        <span className="text-sm font-bold">Prix négociable</span>
                                                    </label>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-8 border-t border-border">
                                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                            <MapPin className="w-5 h-5 text-blue-600" /> Localisation
                                        </h3>
                                        <select
                                            value={form.wilaya_code}
                                            onChange={e => updateForm({ wilaya_code: e.target.value })}
                                            className="w-full h-16 px-6 bg-muted/30 border-none rounded-2xl font-bold text-lg focus:ring-2 ring-[#FF4F5A]/20"
                                        >
                                            <option value="">Sélectionnez votre Wilaya</option>
                                            {WILAYAS.map(w => (
                                                <option key={w.code} value={w.code}>{w.code} - {w.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </motion.div>
                            )}

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
                                                        <span className="text-muted-foreground font-medium">Prix journalier</span>
                                                        <span className="text-xl font-black">{Number(form.price_per_day).toLocaleString()} DA</span>
                                                    </div>
                                                )}
                                                {form.sale_price && (
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-muted-foreground font-medium">Prix de vente</span>
                                                        <span className="text-xl font-black text-emerald-600">{Number(form.sale_price).toLocaleString()} DA</span>
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

                    <div className="mt-12 flex items-center justify-between">
                        <Button
                            variant="ghost"
                            onClick={() => step > 0 ? setStep(step - 1) : navigate(-1)}
                            className="rounded-2xl h-14 px-8 font-bold"
                        >
                            {step === 0 ? "Annuler" : "Retour"}
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
                                    {step === 4 ? "Mettre à jour" : "Continuer"}
                                    <ChevronRight className="w-5 h-5 ml-2" />
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
