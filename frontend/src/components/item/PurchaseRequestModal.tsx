import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { ShoppingCart, Loader2, CheckCircle2, ShieldCheck, Info } from "lucide-react";
import { salesService } from "../../services/api.service";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "../../context/language-context";

interface PurchaseRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  onSuccess: () => void;
}

export function PurchaseRequestModal({ isOpen, onClose, item, onSuccess }: PurchaseRequestModalProps) {
  const { t } = useTranslation();
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
        message: message.trim() || undefined
      });
      setSuccess(true);
      onSuccess();
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setMessage("");
      }, 3000);
    } catch (err: any) {
      setError(err.message || t("item.purchaseRequestError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none rounded-[2.5rem] shadow-2xl bg-background">
        <div className="bg-[#0F2A2E] p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />
          <DialogHeader>
            <DialogTitle className="text-3xl font-black flex items-center gap-3">
              <ShoppingCart className="w-8 h-8 text-emerald-400" />
              {t("item.purchaseRequest")}
            </DialogTitle>
            <p className="text-emerald-100/60 font-medium">{t("item.purchaseRequestSubtitle")}</p>
          </DialogHeader>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-10 text-center space-y-6"
              >
                <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">{t("item.requestSent")}</h3>
                  <p className="text-muted-foreground mt-2 max-w-[280px] mx-auto text-sm">
                    {t("item.requestSentSubtitle")}
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Article Recap */}
                <div className="flex items-center gap-6 p-5 bg-muted/30 rounded-[2rem] border border-border/50">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg border border-white/10 flex-shrink-0">
                    <img 
                      src={item.thumbnail_url || item.images?.[0]} 
                      alt={item.title} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-lg text-foreground truncate">{item.title}</h4>
                    <p className="text-[#FF4F5A] text-xl font-black mt-1">
                      {Number(item.sale_price).toLocaleString()} {t("common.da")}
                    </p>
                  </div>
                </div>

                {/* Message Input */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-2">
                    {t("item.yourMessage")}
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t("item.messagePlaceholder")}
                    className="w-full px-6 py-5 bg-muted/30 border-none rounded-3xl text-sm resize-none focus:ring-2 ring-emerald-500/20 min-h-[120px] transition-all"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-2xl text-xs font-bold border border-red-100 dark:border-red-900/30">
                    <Info className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full h-16 bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-black rounded-2xl shadow-xl shadow-emerald-600/20 transition-all active:scale-95"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      t("item.confirmPurchase")
                    )}
                  </Button>
                  
                  <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    {t("item.securePaymentGuaranteed")}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
