import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { 
  AlertCircle, 
  Loader2, 
  Flag, 
  ShieldAlert, 
  X, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  ShieldCheck,
  Ban,
  MessageSquareWarning
} from "lucide-react";
import { reportsService } from "../../services/api.service";
import { cn } from "../ui/utils";
import { motion, AnimatePresence } from "motion/react";

interface ReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  targetType: "item" | "review" | "user";
  targetTitle: string;
}

const REPORT_REASONS = [
  { id: "inappropriate", label: "Contenu inapproprié", icon: ShieldAlert, color: "text-red-500", bg: "bg-red-500/10" },
  { id: "fraud", label: "Arnaque ou fraude", icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10" },
  { id: "spam", label: "Spam ou doublon", icon: Ban, color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: "counterfeit", label: "Objet contrefait", icon: Info, color: "text-purple-500", bg: "bg-purple-500/10" },
  { id: "harassment", label: "Harcèlement", icon: MessageSquareWarning, color: "text-orange-500", bg: "bg-orange-500/10" },
  { id: "other", label: "Autre raison", icon: Flag, color: "text-slate-500", bg: "bg-slate-500/10" }
];

export function ReportDialog({ isOpen, onClose, targetId, targetType, targetTitle }: ReportDialogProps) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!reason) {
      setError("Veuillez sélectionner un motif.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await reportsService.create({
        reported_item_id: targetType === "item" ? targetId : undefined,
        reported_review_id: targetType === "review" ? targetId : undefined,
        reported_user_id: targetType === "user" ? targetId : undefined,
        reason,
        description
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        // Reset state
        setReason("");
        setDescription("");
      }, 2500);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de l'envoi du signalement.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden rounded-[2rem] border-none bg-card/95 backdrop-blur-2xl shadow-2xl">
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="py-16 px-8 flex flex-col items-center justify-center text-center space-y-6"
            >
              <div className="w-24 h-24 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center relative">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <CheckCircle2 className="w-12 h-12" />
                </motion.div>
                <div className="absolute inset-0 rounded-full border-4 border-emerald-500/30 animate-ping" />
              </div>
              <div>
                <h3 className="text-2xl font-black mb-2">Merci pour votre vigilance</h3>
                <p className="text-muted-foreground font-medium max-w-[280px] mx-auto">
                  Votre signalement concernant <strong>{targetTitle}</strong> a bien été envoyé à notre équipe de modération.
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col"
            >
              {/* Header with Background Accent */}
              <div className="relative pt-8 pb-4 px-6 bg-gradient-to-b from-[#FF4F5A]/5 to-transparent flex-shrink-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-[#FF4F5A] rounded-xl flex items-center justify-center shadow-lg shadow-[#FF4F5A]/20">
                    <ShieldAlert className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight">Signalement</h3>
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#FF4F5A] opacity-80">Sécurité plateforme</p>
                  </div>
                </div>
                <p className="text-muted-foreground text-xs font-medium leading-relaxed">
                  Pourquoi signalez-vous cet élément ? Votre aide nous est précieuse.
                </p>
              </div>

              {/* Main Content - Scrollable */}
              <div className="px-6 pb-4 space-y-6 max-h-[60vh] overflow-y-auto no-scrollbar">
                {/* Reasons Grid */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Motif du signalement</p>
                    {reason && (
                      <button onClick={() => setReason("")} className="text-[9px] font-black uppercase text-[#FF4F5A] hover:underline transition-all">Effacer</button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {REPORT_REASONS.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => setReason(r.id)}
                        className={cn(
                          "group relative flex flex-col items-start p-3 rounded-xl border transition-all duration-300 overflow-hidden",
                          reason === r.id 
                            ? "border-[#FF4F5A] bg-[#FF4F5A]/5 ring-1 ring-[#FF4F5A]" 
                            : "border-border/60 bg-muted/20 hover:border-border hover:bg-muted/40"
                        )}
                      >
                        <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center mb-2 transition-transform group-hover:scale-110", r.bg)}>
                          <r.icon className={cn("w-3.5 h-3.5", r.color)} />
                        </div>
                        <span className={cn("text-[10px] font-bold leading-tight", reason === r.id ? "text-foreground" : "text-muted-foreground group-hover:text-foreground")}>
                          {r.label}
                        </span>
                        {reason === r.id && (
                          <motion.div 
                            layoutId="active-check"
                            className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-[#FF4F5A] rounded-full flex items-center justify-center"
                          >
                            <CheckCircle2 className="w-2 h-2 text-white" />
                          </motion.div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Additional Details */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Détails de l'incident</label>
                  <div className="relative">
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Décrivez brièvement le problème..."
                      className="min-h-[80px] rounded-xl bg-muted/30 border-border/60 focus:ring-2 focus:ring-[#FF4F5A]/20 resize-none font-bold text-xs p-4 transition-all placeholder:opacity-30"
                    />
                  </div>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2"
                  >
                    <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] font-bold text-red-500 leading-tight">{error}</p>
                  </motion.div>
                )}
              </div>

              {/* Action Button - More compact */}
              <div className="px-6 pb-6 pt-3 bg-card/80 backdrop-blur-md border-t border-border/40 flex-shrink-0">
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !reason}
                  className={cn(
                    "w-full h-12 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-lg",
                    !reason 
                      ? "bg-muted text-muted-foreground/50 border border-border/50 cursor-not-allowed" 
                      : "bg-[#FF4F5A] hover:bg-[#FF4F5A]/90 text-white shadow-[#FF4F5A]/25 active:scale-[0.98]"
                  )}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Envoi en cours...</span>
                    </div>
                  ) : !reason ? (
                    <div className="flex items-center gap-3">
                      <Info className="w-4 h-4" />
                      <span>Choisir un motif</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Flag className="w-4 h-4" />
                      <span>Envoyer le signalement</span>
                    </div>
                  )}
                </Button>
                <button 
                  onClick={onClose}
                  className="w-full mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
                >
                  Annuler et fermer
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
