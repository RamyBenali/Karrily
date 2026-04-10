import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { RefreshCw, Loader2, CheckCircle2, Box, PlusCircle } from "lucide-react";
import { trocService, usersService } from "../../services/api.service";
import { useAuthStore } from "../../store/auth.store";

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
  const [newItemData, setNewItemData] = useState({ title: "", description: "", condition: "good" });
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
        setNewItemData({ title: "", description: "", condition: "good" });
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
