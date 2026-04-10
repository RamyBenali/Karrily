import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { ShoppingCart, Loader2, CheckCircle2 } from "lucide-react";
import { salesService } from "../../services/api.service";

interface PurchaseRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  onSuccess: () => void;
}

export function PurchaseRequestModal({ isOpen, onClose, item, onSuccess }: PurchaseRequestModalProps) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");
    try {
      await salesService.create({
        item_id: item.id,
        message
      });
      setSuccess(true);
      onSuccess();
      setTimeout(() => {
        onClose();
        setSuccess(false);
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
      <DialogContent className="sm:max-w-[425px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#0F2A2E] flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-emerald-600" />
            Demande d'achat
          </DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Demande envoyée !</h3>
              <p className="text-gray-500 text-sm">Le vendeur a été notifié de votre intérêt.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 pt-4">
            <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="font-bold text-[#0F2A2E] line-clamp-1">{item.title}</h4>
                <p className="text-emerald-700 font-bold">{Number(item.sale_price).toLocaleString()} DA</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">
                Message au vendeur (optionnel)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ex: Bonjour, je suis intéressé par votre objet..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 min-h-[100px]"
              />
            </div>

            {error && <p className="text-sm text-red-600 ml-1">{error}</p>}

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-semibold rounded-2xl"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Confirmer la demande"
              )}
            </Button>
            <p className="text-center text-xs text-gray-400">
              Le vendeur doit valider votre demande avant de finaliser la vente.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
