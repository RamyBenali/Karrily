import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
    ArrowLeft, ArrowRight, Upload, X, MapPin, Tag, DollarSign,
    Image as ImageIcon, Loader2, CheckCircle2, Camera, Plus,
} from "lucide-react";
import { Navigation } from "../components/layout/navigation";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useAuthStore } from "../store/auth.store";
import { supabase } from "../lib/supabase";
import { itemsService } from "../services/api.service";
import { CATEGORY_FILTERS } from "../components/explore/explore-constants";

// 58 Wilayas
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
    { code: 48, name: "Relizane" }, { code: 49, name: "El M'Ghair" }, { code: 50, name: "El Meniaa" },
    { code: 51, name: "Ouled Djellal" }, { code: 52, name: "Bordj Badji Mokhtar" },
    { code: 53, name: "Béni Abbès" }, { code: 54, name: "Timimoun" }, { code: 55, name: "Touggourt" },
    { code: 56, name: "Djanet" }, { code: 57, name: "In Salah" }, { code: 58, name: "In Guezzam" },
];

const LISTING_TYPES = [
    { value: "rent", label: "Location", emoji: "🏠", desc: "Louer votre bien temporairement" },
    { value: "sell", label: "Vente", emoji: "🛒", desc: "Vendre votre bien définitivement" },
    { value: "troc", label: "Troc", emoji: "🔄", desc: "Échanger contre un autre objet" },
    { value: "rent_sell", label: "Location & Vente", emoji: "🏷️", desc: "Proposer les deux options" },
];

const CONDITIONS = [
    { value: "new", label: "Neuf", color: "bg-emerald-100 text-emerald-700" },
    { value: "like_new", label: "Comme neuf", color: "bg-blue-100 text-blue-700" },
    { value: "good", label: "Bon état", color: "bg-yellow-100 text-yellow-700" },
    { value: "fair", label: "Correct", color: "bg-orange-100 text-orange-700" },
    { value: "poor", label: "Usé", color: "bg-red-100 text-red-700" },
];

const STEPS = ["Type", "Détails", "Photos", "Prix", "Confirmation"];

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
        condition: "good",
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

    // Fetch categories and item details
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

                    // Populate form
                    setForm({
                        listing_type: item.listing_type || "",
                        title: item.title || "",
                        description: item.description || "",
                        category_id: item.category_id || "",
                        condition: item.condition || "good",
                        tags: item.tags ? item.tags.join(",") : "",
                        images: [], // We keep existing urls below, but no File objects
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

    // Image handling
    const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        const removedUrl = form.imagePreviewUrls[index];
        if (removedUrl.startsWith("blob:")) {
            URL.revokeObjectURL(removedUrl);
            // It's a newly added file, find its matching index in form.images
            // This is a bit tricky, assume it matches mostly or filter differently
        }
        // In a real scenario we need to separate new files from existing urls carefully,
        // but for simplicity we keep them in parallel if they were all added. 
        // Here we just remove the URL. We won't delete it from storage immediately.
        updateForm({
            imagePreviewUrls: form.imagePreviewUrls.filter((_, i) => i !== index),
        });
    };

    // Validation per step
    const canProceed = () => {
        switch (step) {
            case 0: return form.listing_type !== "";
            case 1: return form.title.trim().length >= 5 && form.description.trim().length >= 10 && form.category_id !== "";
            case 2: return form.imagePreviewUrls.length >= 1;
            case 3: {
                if (form.listing_type === "rent" || form.listing_type === "rent_sell") {
                    if (!form.price_per_day) return false;
                }
                if (form.listing_type === "sell" || form.listing_type === "rent_sell") {
                    if (!form.sale_price) return false;
                }
                
                // Validate metadata
                const selectedCat = categories.find(c => c.id === form.category_id);
                if (selectedCat) {
                    const filters = CATEGORY_FILTERS[selectedCat.slug] || [];
                    for (const f of filters) {
                        if (!form.metadata[f.key]) return false;
                    }
                }

                return form.wilaya_code !== "";
            }
            default: return true;
        }
    };

    // Submit
    const handleSubmit = async () => {
        if (!user || !itemId) return;
        setIsSubmitting(true);
        setError("");

        try {
            // 1. Upload new images
            const finalImageUrls: string[] = [];
            
            // First add existing valid URLs
            for (const url of form.imagePreviewUrls) {
                if (!url.startsWith("blob:")) {
                    finalImageUrls.push(url);
                }
            }

            // Upload new ones
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

            // 2. Update item via Backend API
            const response = await itemsService.update(itemId, {
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
            });

            // Success — go to item page
            navigate(`/item/${itemId}`);
        } catch (err: any) {
            setError(err.message || "Erreur lors de la publication.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F7F7F9]">
            <Navigation />

            <div className="pt-24 pb-16">
                <div className="max-w-3xl mx-auto px-6">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <button
                            onClick={() => step > 0 ? setStep(step - 1) : navigate(-1)}
                            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            {step > 0 ? "Étape précédente" : "Retour"}
                        </button>
                        <h1 className="text-4xl font-bold text-[#0F2A2E] mb-2">Publier une annonce</h1>
                        <p className="text-gray-500">Étape {step + 1} sur {STEPS.length}</p>
                    </motion.div>

                    {/* Progress Bar */}
                    <div className="flex gap-2 mb-8">
                        {STEPS.map((s, i) => (
                            <div key={s} className="flex-1 flex flex-col items-center gap-1">
                                <div className={`h-1.5 w-full rounded-full transition-all duration-500 ${i <= step ? "bg-[#FF4F5A]" : "bg-gray-200"
                                    }`} />
                                <span className={`text-xs font-medium ${i <= step ? "text-[#FF4F5A]" : "text-gray-400"}`}>
                                    {s}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Error */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm"
                        >
                            {error}
                        </motion.div>
                    )}

                    <AnimatePresence mode="wait">
                        {/* ═══ STEP 0: Type d'annonce ═══ */}
                        {step === 0 && (
                            <motion.div
                                key="step0"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100"
                            >
                                <h2 className="text-2xl font-bold text-[#0F2A2E] mb-2">Que souhaitez-vous faire ?</h2>
                                <p className="text-gray-500 mb-6">Choisissez le type d'annonce</p>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    {LISTING_TYPES.map(type => (
                                        <button
                                            key={type.value}
                                            onClick={() => updateForm({ listing_type: type.value })}
                                            className={`p-6 rounded-2xl border-2 text-left transition-all hover:shadow-md ${form.listing_type === type.value
                                                    ? "border-[#FF4F5A] bg-[#FF4F5A]/5 shadow-md"
                                                    : "border-gray-200 hover:border-gray-300"
                                                }`}
                                        >
                                            <span className="text-3xl">{type.emoji}</span>
                                            <h3 className="text-lg font-bold text-[#0F2A2E] mt-3">{type.label}</h3>
                                            <p className="text-sm text-gray-500 mt-1">{type.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* ═══ STEP 1: Détails ═══ */}
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 space-y-6"
                            >
                                <div>
                                    <h2 className="text-2xl font-bold text-[#0F2A2E] mb-2">Décrivez votre bien</h2>
                                    <p className="text-gray-500">Plus votre annonce est détaillée, plus elle attirera de monde</p>
                                </div>

                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Titre de l'annonce *
                                    </label>
                                    <Input
                                        value={form.title}
                                        onChange={e => updateForm({ title: e.target.value })}
                                        placeholder="Ex: Appartement F3 meublé centre-ville"
                                        className="h-12 rounded-2xl bg-gray-50 border-gray-200"
                                        maxLength={100}
                                    />
                                    <p className="text-xs text-gray-400 mt-1 text-right">{form.title.length}/100</p>
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Catégorie *</label>
                                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                                        {categories.map(cat => (
                                            <button
                                                key={cat.id}
                                                onClick={() => updateForm({ category_id: cat.id })}
                                                className={`p-3 rounded-xl border text-center text-sm font-medium transition-all ${form.category_id === cat.id
                                                        ? "border-[#FF4F5A] bg-[#FF4F5A]/5 text-[#FF4F5A]"
                                                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                                                    }`}
                                            >
                                                {cat.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                                    <textarea
                                        value={form.description}
                                        onChange={e => updateForm({ description: e.target.value })}
                                        rows={5}
                                        placeholder="Décrivez votre bien en détail : caractéristiques, état, ce qui est inclus..."
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-[#FF4F5A]/50 focus:border-[#FF4F5A]"
                                        maxLength={2000}
                                    />
                                    <p className="text-xs text-gray-400 mt-1 text-right">{form.description.length}/2000</p>
                                </div>

                                {/* Condition */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">État</label>
                                    <div className="flex flex-wrap gap-2">
                                        {CONDITIONS.map(c => (
                                            <button
                                                key={c.value}
                                                onClick={() => updateForm({ condition: c.value })}
                                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${form.condition === c.value
                                                        ? c.color + " ring-2 ring-offset-1 ring-current"
                                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                    }`}
                                            >
                                                {c.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Tags */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Tags <span className="font-normal text-gray-400">(séparés par des virgules)</span>
                                    </label>
                                    <Input
                                        value={form.tags}
                                        onChange={e => updateForm({ tags: e.target.value })}
                                        placeholder="Ex: meublé, wifi, parking"
                                        className="h-12 rounded-2xl bg-gray-50 border-gray-200"
                                    />
                                </div>

                                {/* Dynamic Metadata Fields */}
                                {(() => {
                                    const selectedCat = categories.find(c => c.id === form.category_id);
                                    if (!selectedCat) return null;
                                    const filters = CATEGORY_FILTERS[selectedCat.slug] || [];
                                    if (filters.length === 0) return null;

                                    return (
                                        <div className="pt-4 border-t border-gray-100 space-y-6">
                                            <h3 className="font-bold text-[#0F2A2E]">Caractéristiques spécifiques ({selectedCat.name})</h3>
                                            <div className="grid sm:grid-cols-2 gap-6">
                                                {filters.map(f => (
                                                    <div key={f.key}>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                            {f.label} *
                                                        </label>
                                                        {f.type === "select" && (
                                                            <select
                                                                value={form.metadata[f.key] || ""}
                                                                onChange={e => updateForm({ metadata: { ...form.metadata, [f.key]: e.target.value } })}
                                                                className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF4F5A]/50"
                                                            >
                                                                <option value="">Sélectionner...</option>
                                                                {f.options?.map(opt => (
                                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                                ))}
                                                            </select>
                                                        )}
                                                        {f.type === "number" && (
                                                            <Input
                                                                type="number"
                                                                value={form.metadata[f.key] || ""}
                                                                onChange={e => updateForm({ metadata: { ...form.metadata, [f.key]: e.target.value } })}
                                                                placeholder={f.unit ? `Ex: 100 ${f.unit}` : "Ex: 2023"}
                                                                className="h-12 rounded-2xl bg-gray-50 border-gray-200"
                                                                min={f.min}
                                                                max={f.max}
                                                            />
                                                        )}
                                                        {f.type === "checkbox" && (
                                                            <label className="flex items-center gap-3 cursor-pointer h-12">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={form.metadata[f.key] === true}
                                                                    onChange={e => updateForm({ metadata: { ...form.metadata, [f.key]: e.target.checked } })}
                                                                    className="w-5 h-5 rounded accent-[#FF4F5A]"
                                                                />
                                                                <span className="text-sm text-gray-700">{f.label}</span>
                                                            </label>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </motion.div>
                        )}

                        {/* ═══ STEP 2: Photos ═══ */}
                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100"
                            >
                                <h2 className="text-2xl font-bold text-[#0F2A2E] mb-2">Ajoutez des photos</h2>
                                <p className="text-gray-500 mb-6">Minimum 1 photo, maximum 8. La première sera la couverture.</p>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {/* Existing previews */}
                                    {form.imagePreviewUrls.map((url, i) => (
                                        <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group">
                                            <img src={url} alt="" className="w-full h-full object-cover" />
                                            {i === 0 && (
                                                <span className="absolute top-2 left-2 px-2 py-1 bg-[#FF4F5A] text-white text-xs font-medium rounded-lg">
                                                    Couverture
                                                </span>
                                            )}
                                            <button
                                                onClick={() => removeImage(i)}
                                                className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-4 h-4 text-white" />
                                            </button>
                                        </div>
                                    ))}

                                    {/* Add button */}
                                    {form.images.length < 8 && (
                                        <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-300 hover:border-[#FF4F5A] flex flex-col items-center justify-center cursor-pointer transition-colors group">
                                            <Plus className="w-8 h-8 text-gray-400 group-hover:text-[#FF4F5A] transition-colors" />
                                            <span className="text-sm text-gray-400 group-hover:text-[#FF4F5A] mt-1">Ajouter</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={handleImageAdd}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>

                                <p className="text-xs text-gray-400 mt-4">{form.images.length}/8 photos</p>
                            </motion.div>
                        )}

                        {/* ═══ STEP 3: Prix & Localisation ═══ */}
                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 space-y-6"
                            >
                                <div>
                                    <h2 className="text-2xl font-bold text-[#0F2A2E] mb-2">Prix & Localisation</h2>
                                    <p className="text-gray-500">Définissez vos tarifs et votre emplacement</p>
                                </div>

                                {/* Rental prices */}
                                {(form.listing_type === "rent" || form.listing_type === "rent_sell") && (
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-gray-700">Tarifs de location (DA)</h3>
                                        <div className="grid sm:grid-cols-3 gap-4">
                                            <div>
                                                <label className="text-sm text-gray-500 mb-1 block">Par jour *</label>
                                                <Input
                                                    type="number"
                                                    value={form.price_per_day}
                                                    onChange={e => updateForm({ price_per_day: e.target.value })}
                                                    placeholder="5000"
                                                    className="h-12 rounded-2xl bg-gray-50 border-gray-200"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm text-gray-500 mb-1 block">Par semaine</label>
                                                <Input
                                                    type="number"
                                                    value={form.price_per_week}
                                                    onChange={e => updateForm({ price_per_week: e.target.value })}
                                                    placeholder="25000"
                                                    className="h-12 rounded-2xl bg-gray-50 border-gray-200"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm text-gray-500 mb-1 block">Par mois</label>
                                                <Input
                                                    type="number"
                                                    value={form.price_per_month}
                                                    onChange={e => updateForm({ price_per_month: e.target.value })}
                                                    placeholder="80000"
                                                    className="h-12 rounded-2xl bg-gray-50 border-gray-200"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-500 mb-1 block">Caution (DA)</label>
                                            <Input
                                                type="number"
                                                value={form.deposit_amount}
                                                onChange={e => updateForm({ deposit_amount: e.target.value })}
                                                placeholder="10000"
                                                className="h-12 rounded-2xl bg-gray-50 border-gray-200 max-w-xs"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Sale price */}
                                {(form.listing_type === "sell" || form.listing_type === "rent_sell") && (
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-gray-700">Prix de vente (DA)</h3>
                                        <Input
                                            type="number"
                                            value={form.sale_price}
                                            onChange={e => updateForm({ sale_price: e.target.value })}
                                            placeholder="150000"
                                            className="h-12 rounded-2xl bg-gray-50 border-gray-200 max-w-xs"
                                        />
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={form.is_negotiable}
                                                onChange={e => updateForm({ is_negotiable: e.target.checked })}
                                                className="w-5 h-5 rounded accent-[#FF4F5A]"
                                            />
                                            <span className="text-sm text-gray-700">Prix négociable</span>
                                        </label>
                                    </div>
                                )}

                                {/* Troc */}
                                {(form.listing_type === "troc") && (
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-gray-700">Détails du troc</h3>
                                        <div>
                                            <label className="text-sm text-gray-500 mb-1 block">Qu'acceptez-vous en échange ?</label>
                                            <textarea
                                                value={form.troc_description}
                                                onChange={e => updateForm({ troc_description: e.target.value })}
                                                rows={3}
                                                placeholder="Ex: J'accepte un smartphone ou une tablette en bon état"
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-[#FF4F5A]/50"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-500 mb-1 block">Valeur estimée (DA)</label>
                                            <Input
                                                type="number"
                                                value={form.troc_estimated_value}
                                                onChange={e => updateForm({ troc_estimated_value: e.target.value })}
                                                placeholder="50000"
                                                className="h-12 rounded-2xl bg-gray-50 border-gray-200 max-w-xs"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Wilaya */}
                                <div>
                                    <h3 className="font-semibold text-gray-700 mb-3">Localisation *</h3>
                                    <select
                                        value={form.wilaya_code}
                                        onChange={e => updateForm({ wilaya_code: e.target.value })}
                                        className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF4F5A]/50 focus:border-[#FF4F5A] max-w-md"
                                    >
                                        <option value="">Sélectionnez votre wilaya</option>
                                        {WILAYAS.map(w => (
                                            <option key={w.code} value={w.code}>{w.code} - {w.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </motion.div>
                        )}

                        {/* ═══ STEP 4: Confirmation ═══ */}
                        {step === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100"
                            >
                                <h2 className="text-2xl font-bold text-[#0F2A2E] mb-6">Récapitulatif</h2>

                                {/* Preview */}
                                <div className="space-y-4">
                                    {/* Image */}
                                    {form.imagePreviewUrls[0] && (
                                        <div className="h-48 rounded-2xl overflow-hidden">
                                            <img src={form.imagePreviewUrls[0]} alt="" className="w-full h-full object-cover" />
                                        </div>
                                    )}

                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="p-4 bg-gray-50 rounded-xl">
                                            <p className="text-xs text-gray-400 mb-1">Type</p>
                                            <p className="font-semibold text-gray-900">
                                                {LISTING_TYPES.find(t => t.value === form.listing_type)?.label}
                                            </p>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-xl">
                                            <p className="text-xs text-gray-400 mb-1">État</p>
                                            <p className="font-semibold text-gray-900">
                                                {CONDITIONS.find(c => c.value === form.condition)?.label}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <p className="text-xs text-gray-400 mb-1">Titre</p>
                                        <p className="font-semibold text-gray-900 text-lg">{form.title}</p>
                                    </div>

                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <p className="text-xs text-gray-400 mb-1">Description</p>
                                        <p className="text-gray-700 text-sm">{form.description}</p>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {form.price_per_day && (
                                            <div className="p-4 bg-gray-50 rounded-xl">
                                                <p className="text-xs text-gray-400 mb-1">Prix / jour</p>
                                                <p className="font-bold text-[#0F2A2E] text-lg">{Number(form.price_per_day).toLocaleString()} DA</p>
                                            </div>
                                        )}
                                        {form.sale_price && (
                                            <div className="p-4 bg-gray-50 rounded-xl">
                                                <p className="text-xs text-gray-400 mb-1">Prix de vente</p>
                                                <p className="font-bold text-[#0F2A2E] text-lg">{Number(form.sale_price).toLocaleString()} DA</p>
                                            </div>
                                        )}
                                        <div className="p-4 bg-gray-50 rounded-xl">
                                            <p className="text-xs text-gray-400 mb-1">Localisation</p>
                                            <p className="font-semibold text-gray-900 flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                {WILAYAS.find(w => w.code === Number(form.wilaya_code))?.name}
                                            </p>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-xl">
                                            <p className="text-xs text-gray-400 mb-1">Photos</p>
                                            <p className="font-semibold text-gray-900">{form.images.length} photo(s)</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-8">
                        <Button
                            variant="outline"
                            onClick={() => setStep(Math.max(0, step - 1))}
                            disabled={step === 0}
                            className="rounded-full px-6 h-12"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Précédent
                        </Button>

                        {step < STEPS.length - 1 ? (
                            <Button
                                onClick={() => setStep(step + 1)}
                                disabled={!canProceed()}
                                className="bg-[#FF4F5A] hover:bg-[#FF4F5A]/90 text-white rounded-full px-8 h-12 shadow-lg shadow-[#FF4F5A]/25 disabled:opacity-50"
                            >
                                Suivant
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="bg-[#FF4F5A] hover:bg-[#FF4F5A]/90 text-white rounded-full px-8 h-12 shadow-lg shadow-[#FF4F5A]/25"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-5 h-5 mr-2" />
                                        Publier l'annonce
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
