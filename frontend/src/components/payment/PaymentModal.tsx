import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X, CreditCard, Lock, CheckCircle, XCircle,
  Loader2, ArrowLeft, Shield, RefreshCw
} from "lucide-react";
import { cn } from "../ui/utils";
import { api } from "../../lib/api";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (transactionId: string) => void;
  amount: number;
  itemTitle: string;
  paymentType: "booking" | "purchase";
}

type PaymentStatus = "idle" | "processing" | "success" | "declined" | "error";

export function PaymentModal({ isOpen, onClose, onSuccess, amount, itemTitle, paymentType }: PaymentModalProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [transactionId, setTransactionId] = useState("");

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits;
  };

  const getCardBrand = () => {
    const num = cardNumber.replace(/\s/g, "");
    if (num.startsWith("4")) return "VISA";
    if (num.startsWith("5")) return "MASTERCARD";
    if (num.startsWith("6")) return "CCP";
    return "CARTE";
  };

  const isFormValid = () => {
    return (
      cardNumber.replace(/\s/g, "").length === 16 &&
      cardHolder.trim().length >= 3 &&
      expiryDate.length === 5 &&
      cvv.length === 3
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) return;

    setStatus("processing");
    setErrorMessage("");

    try {
      const response = await api.post("/payments/process", {
        cardNumber: cardNumber.replace(/\s/g, ""),
        cardHolder,
        expiryDate,
        cvv,
        amount,
        paymentType,
      });

      setTransactionId(response.data.transactionId);
      setStatus("success");
    } catch (err: any) {
      const reason = err.response?.data?.reason;
      if (reason === "card_declined" || reason === "card_expired") {
        setStatus("declined");
        setErrorMessage(err.response?.data?.message || "Paiement refusé.");
      } else {
        setStatus("error");
        setErrorMessage(err.response?.data?.message || "Erreur lors du paiement.");
      }
    }
  };

  const handleSuccess = () => {
    onSuccess(transactionId);
    handleClose();
  };

  const handleClose = () => {
    setStatus("idle");
    setCardNumber("");
    setCardHolder("");
    setExpiryDate("");
    setCvv("");
    setErrorMessage("");
    onClose();
  };

  const handleRetry = () => {
    setStatus("idle");
    setCvv("");
    setErrorMessage("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && status === "idle" && handleClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-md bg-background rounded-[2.5rem] shadow-2xl border border-border/50 overflow-hidden"
          >
            {/* ── Processing ── */}
            {status === "processing" && (
              <div className="flex flex-col items-center justify-center p-16 gap-6">
                <div className="w-20 h-20 rounded-full bg-[#FF4F5A]/10 flex items-center justify-center">
                  <Loader2 className="w-10 h-10 text-[#FF4F5A] animate-spin" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-black">Traitement en cours...</h3>
                  <p className="text-sm text-muted-foreground">Veuillez patienter, ne fermez pas cette fenêtre.</p>
                </div>
              </div>
            )}

            {/* ── Success ── */}
            {status === "success" && (
              <div className="flex flex-col items-center justify-center p-12 gap-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center shadow-2xl shadow-emerald-500/30"
                >
                  <CheckCircle className="w-12 h-12 text-white" />
                </motion.div>
                <div className="text-center space-y-3">
                  <h3 className="text-2xl font-black text-emerald-600">Paiement accepté !</h3>
                  <p className="text-muted-foreground text-sm">
                    {paymentType === "booking" ? "Votre réservation" : "Votre achat"} a bien été enregistré.
                  </p>
                  <div className="px-4 py-2 bg-muted/50 rounded-xl text-xs font-mono text-muted-foreground">
                    Réf : {transactionId}
                  </div>
                </div>
                <button
                  onClick={handleSuccess}
                  className="w-full h-14 bg-emerald-500 text-white rounded-2xl font-black text-lg shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-colors"
                >
                  Continuer
                </button>
              </div>
            )}

            {/* ── Declined ── */}
            {(status === "declined" || status === "error") && (
              <div className="flex flex-col items-center justify-center p-12 gap-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="w-24 h-24 rounded-full bg-red-500 flex items-center justify-center shadow-2xl shadow-red-500/30"
                >
                  <XCircle className="w-12 h-12 text-white" />
                </motion.div>
                <div className="text-center space-y-3">
                  <h3 className="text-2xl font-black text-red-600">Paiement refusé</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">{errorMessage}</p>
                </div>
                <div className="w-full space-y-3">
                  <button
                    onClick={handleRetry}
                    className="w-full h-14 bg-[#FF4F5A] text-white rounded-2xl font-black text-base shadow-lg shadow-[#FF4F5A]/20 hover:bg-[#FF4F5A]/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Réessayer
                  </button>
                  <button
                    onClick={handleClose}
                    className="w-full h-12 border border-border rounded-2xl font-semibold text-muted-foreground hover:bg-muted transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {/* ── Payment Form ── */}
            {status === "idle" && (
              <>
                {/* Header */}
                <div className="p-8 pb-6 border-b border-border/30 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF4F5A] to-purple-600 flex items-center justify-center shadow-lg shadow-[#FF4F5A]/20">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black">Paiement sécurisé</h2>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Connexion chiffrée SSL
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Amount Summary */}
                <div className="px-8 py-5 bg-gradient-to-r from-[#FF4F5A]/5 to-purple-500/5 border-b border-border/20">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">
                        {paymentType === "booking" ? "Réservation" : "Achat"}
                      </p>
                      <p className="text-sm font-semibold truncate max-w-[200px]">{itemTitle}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-[#FF4F5A]">{amount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">DA</p>
                    </div>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                  {/* Card Number */}
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                      Numéro de carte CCP / Bancaire
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        placeholder="0000 0000 0000 0000"
                        maxLength={19}
                        className="w-full h-14 bg-muted/30 border border-border/50 rounded-2xl px-5 pr-20 text-lg font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#FF4F5A]/30 focus:border-[#FF4F5A] transition-all"
                      />
                      <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-black uppercase tracking-widest text-muted-foreground opacity-60">
                        {getCardBrand()}
                      </span>
                    </div>
                  </div>

                  {/* Card Holder */}
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                      Nom du titulaire
                    </label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                      placeholder="PRÉNOM NOM"
                      className="w-full h-14 bg-muted/30 border border-border/50 rounded-2xl px-5 text-sm font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#FF4F5A]/30 focus:border-[#FF4F5A] transition-all"
                    />
                  </div>

                  {/* Expiry + CVV */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                        Expiration
                      </label>
                      <input
                        type="text"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(formatExpiry(e.target.value))}
                        placeholder="MM/AA"
                        maxLength={5}
                        className="w-full h-14 bg-muted/30 border border-border/50 rounded-2xl px-5 text-lg font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#FF4F5A]/30 focus:border-[#FF4F5A] transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                        CVV
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                          placeholder="•••"
                          maxLength={3}
                          className={cn(
                            "w-full h-14 bg-muted/30 border rounded-2xl px-5 text-lg font-mono font-bold focus:outline-none focus:ring-2 transition-all text-center tracking-[0.5rem]",
                            cvv === "000" 
                              ? "border-red-400 focus:ring-red-200 focus:border-red-500 bg-red-50/30"
                              : "border-border/50 focus:ring-[#FF4F5A]/30 focus:border-[#FF4F5A]"
                          )}
                        />
                      </div>
                      {cvv === "000" && (
                        <p className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> CVV invalide
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Security notice */}
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                    <Shield className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                      Vos données bancaires sont chiffrées et sécurisées. Karrily ne conserve jamais vos informations de carte.
                    </p>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={!isFormValid()}
                    className={cn(
                      "w-full h-16 rounded-2xl text-lg font-black transition-all shadow-lg flex items-center justify-center gap-3",
                      isFormValid()
                        ? "bg-gradient-to-r from-[#FF4F5A] to-purple-600 text-white shadow-[#FF4F5A]/20 hover:shadow-xl hover:shadow-[#FF4F5A]/30 hover:scale-[1.01]"
                        : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                    )}
                  >
                    <Lock className="w-5 h-5" />
                    Payer {amount.toLocaleString()} DA
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
