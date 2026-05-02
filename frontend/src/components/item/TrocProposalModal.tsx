import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { RefreshCw, Loader2, CheckCircle2, Box, PlusCircle, MapPin, HandCoins, Info, ChevronRight, Tags } from "lucide-react";
import { trocService, usersService } from "../../services/api.service";
import { useAuthStore } from "../../store/auth.store";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { Input } from "../../components/ui/input";
import { useTranslation } from "../../context/language-context";

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

interface TrocProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestedItem: any;
  onSuccess: () => void;
}

export function TrocProposalModal({ isOpen, onClose, requestedItem, onSuccess }: TrocProposalModalProps) {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"existing" | "new">("existing");
  const [myItems, setMyItems] = useState<any[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [newItemData, setNewItemData] = useState({ 
    title: "", 
    description: "", 
    condition: "new",
    estimated_value: "",
    wilaya_code: ""
  });
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && user) {
      setIsLoadingItems(true);
      usersService.getUserItems(user.id)
        .then(res => setMyItems(res.data.filter((i: any) => i.id !== requestedItem.id)))
        .catch(() => setError(t("item.loadingItemsError")))
        .finally(() => setIsLoadingItems(false));
    }
  }, [isOpen, user, requestedItem.id]);

  const handleSubmit = async () => {
    if (activeTab === "existing" && !selectedItemId) {
      setError(t("item.selectItemError"));
      return;
    }
    if (activeTab === "new" && (!newItemData.title || !newItemData.wilaya_code)) {
        setError(t("item.fillRequiredError"));
        return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      await trocService.create({
        requested_item_id: requestedItem.id,
        offered_item_id: activeTab === "existing" ? selectedItemId! : undefined,
        offered_item_data: activeTab === "new" ? {
            ...newItemData,
            estimated_value: newItemData.estimated_value ? Number(newItemData.estimated_value) : null,
            wilaya_code: Number(newItemData.wilaya_code)
        } : undefined,
        message: message.trim() || undefined
      });
      
      setSuccess(true);
      onSuccess();
      
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setSelectedItemId(null);
        setNewItemData({ 
            title: "", 
            description: "", 
            condition: "new",
            estimated_value: "",
            wilaya_code: ""
        });
        setMessage("");
      }, 3500);
    } catch (err: any) {
      setError(err.message || t("item.proposalError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none rounded-[2.5rem] shadow-2xl bg-background">
        <div className="bg-[#0F2A2E] p-8 text-white relative">
            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full -mr-24 -mt-24 blur-3xl" />
            <DialogHeader>
                <DialogTitle className="text-3xl font-black flex items-center gap-3">
                    <RefreshCw className="w-8 h-8 text-purple-400" />
                    {t("item.proposeExchange")}
                </DialogTitle>
                <p className="text-purple-100/60 font-medium">{t("item.against")} {requestedItem.title}</p>
            </DialogHeader>
        </div>

        <div className="p-8">
            <AnimatePresence mode="wait">
                {success ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="py-12 text-center space-y-6"
                    >
                        <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                            <CheckCircle2 className="w-12 h-12" />
                        </div>
                        <div>
                            <h3 className="text-3xl font-bold text-foreground">{t("item.proposalSent")}</h3>
                            <p className="text-muted-foreground mt-3 max-w-[320px] mx-auto leading-relaxed">
                                {t("item.proposalSentSubtitle")}
                            </p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        {/* Tab Switcher Épuré */}
                        <div className="flex bg-muted/50 p-2 rounded-3xl">
                            <button 
                                onClick={() => setActiveTab("existing")}
                                className={`flex-1 flex items-center justify-center gap-2 py-4 text-xs font-black uppercase tracking-widest rounded-2xl transition-all ${
                                    activeTab === "existing" 
                                    ? "bg-background text-foreground shadow-xl ring-1 ring-black/5" 
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                <Box className="w-4 h-4" /> {t("item.myItems")}
                            </button>
                            <button 
                                onClick={() => setActiveTab("new")}
                                className={`flex-1 flex items-center justify-center gap-2 py-4 text-xs font-black uppercase tracking-widest rounded-2xl transition-all ${
                                    activeTab === "new" 
                                    ? "bg-background text-foreground shadow-xl ring-1 ring-black/5" 
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                <PlusCircle className="w-4 h-4" /> {t("item.newItem")}
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="min-h-[280px]">
                            {activeTab === "existing" ? (
                                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                    {isLoadingItems ? (
                                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                                            <Loader2 className="w-10 h-10 animate-spin text-purple-200" />
                                            <p className="text-sm font-medium text-muted-foreground">{t("item.searchingItems")}</p>
                                        </div>
                                    ) : myItems.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                                            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center">
                                                <Info className="w-8 h-8 text-muted-foreground/30" />
                                            </div>
                                            <p className="text-muted-foreground font-medium">{t("item.noItemsListed")}</p>
                                            <Button variant="outline" onClick={() => navigate("/create")} className="rounded-xl">{t("landing.publishListing")}</Button>
                                        </div>
                                    ) : (
                                        myItems.map(item => (
                                            <motion.div 
                                                key={item.id}
                                                whileHover={{ x: 5 }}
                                                onClick={() => setSelectedItemId(item.id)}
                                                className={`p-4 rounded-[1.5rem] border-2 transition-all cursor-pointer flex items-center gap-5 ${
                                                    selectedItemId === item.id 
                                                    ? "border-purple-500 bg-purple-500/5 shadow-lg shadow-purple-500/5 transition-none" 
                                                    : "border-muted/50 hover:border-muted hover:bg-muted/20"
                                                }`}
                                            >
                                                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-muted border border-border flex-shrink-0">
                                                    <img src={item.thumbnail_url} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-foreground truncate">{item.title}</p>
                                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mt-1">
                                                        {item.listing_type === 'rent' ? t("listingTypes.rent.label") : t("listingTypes.sell.label")}
                                                    </p>
                                                </div>
                                                {selectedItemId === item.id && (
                                                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                                                        <CheckCircle2 className="w-4 h-4 text-white" />
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="space-y-4"
                                >
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-4">{t("item.offeredItem")}</label>
                                        <Input 
                                            placeholder={t("item.offeredItemPlaceholder")}
                                            value={newItemData.title}
                                            onChange={e => setNewItemData({...newItemData, title: e.target.value})}
                                            className="h-14 rounded-2xl bg-muted/30 border-none px-6 font-bold" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-4">{t("item.shortDescription")}</label>
                                        <textarea 
                                            placeholder={t("item.shortDescriptionPlaceholder")}
                                            rows={2}
                                            value={newItemData.description}
                                            onChange={e => setNewItemData({...newItemData, description: e.target.value})}
                                            className="w-full px-6 py-4 bg-muted/30 border-none rounded-2xl text-sm resize-none focus:ring-2 ring-purple-500/20"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-4">{t("item.estimatedValueWithDA")}</label>
                                            <Input 
                                                type="number"
                                                placeholder="50000"
                                                value={newItemData.estimated_value}
                                                onChange={e => setNewItemData({...newItemData, estimated_value: e.target.value})}
                                                className="h-14 rounded-2xl bg-muted/30 border-none px-6 font-bold" 
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-4">{t("landing.location")}</label>
                                            <select 
                                                value={newItemData.wilaya_code}
                                                onChange={e => setNewItemData({...newItemData, wilaya_code: e.target.value})}
                                                className="w-full h-14 px-6 bg-muted/30 border-none rounded-2xl text-sm font-bold focus:ring-2 ring-purple-500/20"
                                            >
                                                <option value="">{t("dashboard.selectWilaya")}</option>
                                                {WILAYAS.map(w => (
                                                    <option key={w.code} value={w.code}>{w.code} - {w.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Additional Message */}
                        <div className="space-y-3 pt-6 border-t border-border">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-4">{t("item.messageToOwner")}</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder={t("item.trocMessagePlaceholder")}
                                className="w-full px-6 py-4 bg-muted/30 border-none rounded-3xl text-sm resize-none focus:ring-2 ring-purple-500/20 min-h-[100px]"
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-2xl text-[11px] font-bold border border-red-100 dark:border-red-900/30 mt-6">
                                <Info className="w-4 h-4 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="mt-8 flex gap-4">
                            <Button
                                onClick={onClose}
                                variant="ghost"
                                className="h-14 px-8 rounded-2xl font-bold"
                            >
                                {t("common.cancel")}
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex-1 h-14 bg-purple-600 hover:bg-purple-700 text-white text-lg font-black rounded-2xl shadow-xl shadow-purple-600/20 transition-all active:scale-95 group"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    <>
                                        {t("item.sendOffer")}
                                        <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform rtl-mirror" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
