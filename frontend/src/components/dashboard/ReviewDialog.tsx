import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Star, Loader2 } from "lucide-react";
import { reviewsService } from "../../services/api.service";
import { cn } from "../ui/utils";
import { useTranslation } from "../../context/language-context";

interface ReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  bookingId?: string;
  itemTitle: string;
  onSuccess: () => void;
}

export function ReviewDialog({ isOpen, onClose, itemId, bookingId, itemTitle, onSuccess }: ReviewDialogProps) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (rating === 0) {
      setError(t("item.selectRating"));
      return;
    }
    if (comment.length < 5) {
      setError(t("item.commentTooShort"));
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await reviewsService.create({
        item_id: itemId,
        booking_id: bookingId,
        rating,
        comment
      });
      onSuccess();
      onClose();
      // Reset state
      setRating(0);
      setComment("");
    } catch (err: any) {
      setError(err.message || t("item.reviewError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-border bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">{t("item.leaveAReview")}</DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium">
            <span dangerouslySetInnerHTML={{ __html: t("item.reviewDescription", { title: itemTitle }) }} />
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-6">
          <div className="flex flex-col items-center gap-3">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t("item.yourRating")}</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform active:scale-90"
                >
                  <Star
                    className={cn(
                      "w-8 h-8 transition-colors",
                      (hoveredRating || rating) >= star
                        ? "fill-[#FF4F5A] text-[#FF4F5A]"
                        : "text-muted-foreground/30"
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">{t("item.yourComment")}</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t("item.reviewPlaceholder")}
              className="min-h-[120px] rounded-2xl bg-muted/30 border-border focus:ring-2 focus:ring-[#FF4F5A]/20 resize-none font-bold"
            />
          </div>

          {error && (
            <p className="text-xs font-bold text-red-500 bg-red-500/10 p-3 rounded-xl border border-red-500/20">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={onClose}
            className="rounded-xl font-bold"
          >
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-[#FF4F5A] hover:bg-[#FF4F5A]/90 text-white rounded-xl px-8 font-black text-xs uppercase tracking-widest shadow-lg shadow-[#FF4F5A]/20"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : t("item.publishReview")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
