import { Request, Response } from "express";

export const processPayment = async (req: Request, res: Response) => {
    try {
        const { 
            cardNumber, 
            cardHolder, 
            expiryDate, 
            cvv, 
            amount, 
            paymentType // "booking" | "purchase"
        } = req.body;

        // ── Validations ──────────────────────────────────────────────────
        if (!cardNumber || !cardHolder || !expiryDate || !cvv) {
            return res.status(400).json({ 
                success: false, 
                reason: "missing_fields",
                message: "Tous les champs sont requis." 
            });
        }

        const cleanCardNumber = cardNumber.replace(/\s/g, "");
        if (!/^\d{16}$/.test(cleanCardNumber)) {
            return res.status(400).json({ 
                success: false, 
                reason: "invalid_card_number",
                message: "Numéro de carte invalide. 16 chiffres requis." 
            });
        }

        if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
            return res.status(400).json({ 
                success: false, 
                reason: "invalid_expiry",
                message: "Date d'expiration invalide. Format MM/AA." 
            });
        }

        // Check if card is expired
        const [month, year] = expiryDate.split("/").map(Number);
        const now = new Date();
        const expiry = new Date(2000 + year, month - 1);
        if (expiry < now) {
            return res.status(400).json({ 
                success: false, 
                reason: "card_expired",
                message: "Votre carte bancaire est expirée." 
            });
        }

        if (!/^\d{3}$/.test(cvv)) {
            return res.status(400).json({ 
                success: false, 
                reason: "invalid_cvv",
                message: "CVV invalide. 3 chiffres requis." 
            });
        }

        if (!cardHolder.trim() || cardHolder.trim().length < 3) {
            return res.status(400).json({ 
                success: false, 
                reason: "invalid_holder",
                message: "Nom du titulaire invalide." 
            });
        }

        // ── Simulation de refus (CVV = 000) ─────────────────────────────
        if (cvv === "000") {
            // Simulate processing delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            return res.status(402).json({ 
                success: false, 
                reason: "card_declined",
                message: "Paiement refusé par votre banque. Veuillez vérifier vos informations ou utiliser une autre carte." 
            });
        }

        // ── Paiement accepté ────────────────────────────────────────────
        await new Promise(resolve => setTimeout(resolve, 1800)); // Simulate processing

        const transactionId = `KRL-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        res.json({ 
            success: true, 
            transactionId,
            amount,
            paymentType,
            message: "Paiement accepté avec succès.",
            maskedCard: `**** **** **** ${cleanCardNumber.slice(-4)}`
        });

    } catch (error: any) {
        console.error("Payment Error:", error);
        res.status(500).json({ 
            success: false, 
            reason: "server_error",
            message: "Erreur interne du serveur de paiement." 
        });
    }
};
