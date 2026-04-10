import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { RefreshCw, Loader2, CheckCircle2, Box, PlusCircle, MapPin, DollarSign } from "lucide-react";
import { trocService, usersService } from "../../services/api.service";
import { useAuthStore } from "../../store/auth.store";

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

interface TrocProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  onSuccess: () => void;
}

export function TrocProposalModal({ isOpen, onClose, item, onSuccess }: TrocProposalModalProps) {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"existing" | "new">("existing");
  const [myItems, setMyItems] = useState<any[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  
  // Form State
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [newItemData, setNewItemData] = useState({ 
    title: "", 
    description: "", 
    condition: "good",
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
        .then(res => setMyItems(res.data.filter((i: any) => i.id !== item.id)))
        .finally(() => setIsLoadingItems(false));
    }
  }, [isOpen, user, item.id]);

  const handleSubmit = async () => {
    if (activeTab === "existing" && !selectedItemId) {
      setError("Veuillez sélectionner un objet");
      return;
    }
    if (activeTab === "new" && !newItemData.title) {
        setError("Veuillez donner un titre à votre objet");
        return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      await trocService.create({
        requested_item_id: item.id,
        offered_item_id: activeTab === "existing" ? selectedItemId! : undefined,
        offered_item_data: activeTab === "new" ? newItemData : undefined,
        message
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
            condition: "good",
            estimated_value: "",
            wilaya_code: ""
        });
        setMessage("");
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-3xl overflow-hidden p-0 border-none">
        <div className="bg-[#0F2A2E] p-6 text-white">
            <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                    <RefreshCw className="w-6 h-6 text-purple-400" />
                    Proposer un échange
                </DialogTitle>
                <p className="text-gray-400 text-sm">Contre : {item.title}</p>
            </DialogHeader>
        </div>

        {success ? (
          <div className="py-12 text-center space-y-4 px-6">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Proposition envoyée !</h3>
              <p className="text-gray-500">Le propriétaire étudiera votre offre de troc.</p>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Tabs */}
            <div className="flex bg-gray-100 p-1 rounded-2xl">
                <button 
                    onClick={() => setActiveTab("existing")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-all ${activeTab === "existing" ? "bg-white text-[#0F2A2E] shadow-sm" : "text-gray-500"}`}
                >
                    <Box className="w-4 h-4" /> Mes objets
                </button>
                <button 
                    onClick={() => setActiveTab("new")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-all ${activeTab === "new" ? "bg-white text-[#0F2A2E] shadow-sm" : "text-gray-500"}`}
                >
                    <PlusCircle className="w-4 h-4" /> Autre chose
                </button>
            </div>

            {activeTab === "existing" ? (
                <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                    {isLoadingItems ? (
                        <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-gray-300" /></div>
                    ) : myItems.length === 0 ? (
                        <p className="text-center py-8 text-gray-500 text-sm">Vous n'avez pas d'autres objets listés.</p>
                    ) : (
                        myItems.map(i => (
                            <div 
                                key={i.id}
                                onClick={() => setSelectedItemId(i.id)}
                                className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3 ${selectedItemId === i.id ? "border-purple-500 bg-purple-50" : "border-gray-100 hover:border-gray-200"}`}
                            >
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200">
                                    <img src={i.thumbnail_url} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-gray-900">{i.title}</p>
                                    <p className="text-xs text-gray-500 line-clamp-1">{i.listing_type === 'rent' ? 'Location' : 'Vente'}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    <input 
                        type="text"
                        placeholder="Qu'est-ce que vous proposez ?"
                        value={newItemData.title}
                        onChange={e => setNewItemData({...newItemData, title: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-purple-500/50"
                    />
                    <textarea 
                        placeholder="Description rapide de l'objet..."
                        rows={3}
                        value={newItemData.description}
                        onChange={e => setNewItemData({...newItemData, description: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm resize-none focus:ring-2 focus:ring-purple-500/50"
                    />
                    <select 
                        value={newItemData.condition}
                        onChange={e => setNewItemData({...newItemData, condition: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm"
                    >
                        <option value="new">Neuf</option>
                        <option value="like_new">Comme neuf</option>
                        <option value="good">Bon état</option>
                        <option value="fair">Correct</option>
                    </select>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input 
                                type="number"
                                placeholder="Valeur (DA)"
                                value={newItemData.estimated_value}
                                onChange={e => setNewItemData({...newItemData, estimated_value: e.target.value})}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm"
                            />
                        </div>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select 
                                value={newItemData.wilaya_code}
                                onChange={e => setNewItemData({...newItemData, wilaya_code: e.target.value})}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm appearance-none"
                            >
                                <option value="">Wilaya</option>
                                {WILAYAS.map(w => (
                                    <option key={w.code} value={w.code}>{w.code} - {w.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-2 pt-2 border-t">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
                Message additionnel
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Expliquez pourquoi cet échange est intéressant..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 min-h-[80px]"
              />
            </div>

            {error && <p className="text-sm text-red-600 ml-1 font-medium">{error}</p>}

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full h-14 bg-purple-600 hover:bg-purple-700 text-white text-lg font-semibold rounded-2xl shadow-lg shadow-purple-600/20"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Envoyer la proposition"
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
