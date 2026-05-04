import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config/index.js";

const SYSTEM_PROMPT = `
Tu es l'Assistant Karrily, un expert intelligent et chaleureux de la plateforme Karrily. 
Karrily est une plateforme algérienne innovante qui permet la location, la vente et le troc (échange) d'objets entre particuliers et professionnels.

TES MISSIONS :
1. Guider les utilisateurs : Explique comment fonctionne la plateforme (comment louer, comment vendre, comment proposer un troc).
2. Aide à la recherche : Aide les utilisateurs à trouver ce qu'ils cherchent.
3. Rassurer : Explique le système de confiance, les avis et la vérification des profils.

RÈGLES STRICTES :
- Ne parle QUE de Karrily et des sujets liés à la consommation collaborative, le commerce et l'économie circulaire.
- Si on te pose une question hors sujet, décline poliment en rappelant ta mission.
- Utilise un ton professionnel mais amical, adapté au marché algérien.
- Réponds principalement en Français, mais si l'utilisateur parle en Arabe (Darja ou Classique), réponds en Arabe.

FONCTIONNALITÉ SPÉCIALE - RECHERCHE :
Si l'utilisateur cherche un produit spécifique, inclus une commande de recherche à la fin de ta réponse sous format JSON, précédé de la balise [SEARCH_ACTION].
Exemple : "Je cherche une voiture à Alger"
Ta réponse se termine par : [SEARCH_ACTION] {"type": "rent", "search": "voiture", "wilaya": "16"}

Format JSON pour SEARCH_ACTION :
{
  "type": "rent" | "sell" | "troc" | "", 
  "search": "terme de recherche",
  "wilaya": "code wilaya (ex: 16 pour Alger)" | ""
}

N'invente pas de produits. Invite l'utilisateur à cliquer sur le lien pour voir les disponibilités réelles.
`;

export const chat = async (req: Request, res: Response) => {
    try {
        const { message, history } = req.body;

        if (!config.gemini.apiKey) {
            return res.status(500).json({ error: "Clé API Gemini manquante dans le .env backend" });
        }

        const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const chatSession = model.startChat({
            generationConfig: {
                maxOutputTokens: 1000,
                temperature: 0.7,
            },
            history: [
                { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
                { role: "model", parts: [{ text: "D'accord, je suis prêt à aider les utilisateurs de Karrily avec expertise et courtoisie." }] },
                ...(history || []).map((msg: any) => ({
                    role: msg.role === "user" ? "user" : "model",
                    parts: [{ text: msg.content }],
                })),
            ],
        });

        const result = await chatSession.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        res.json({ message: text });
    } catch (error: any) {
        console.error("AI Error, switching to demo mode:", error.message);
        
        // ── Demo Mode : réponses simulées intelligentes ──────────────────
        const msg = req.body.message?.toLowerCase() || "";

        let demoResponse = "";

        if (msg.includes("bonjour") || msg.includes("salam") || msg.includes("salut") || msg.includes("hello")) {
            demoResponse = "Salam ! 👋 Je suis l'Assistant Karrily. Je suis là pour t'aider à naviguer sur la plateforme, comprendre comment ça marche, ou trouver ce que tu cherches. Comment puis-je t'aider ?";
        } else if (msg.includes("comment") && (msg.includes("marche") || msg.includes("fonctionne"))) {
            demoResponse = "Karrily est une plateforme qui permet trois types d'échanges :\n\n🔑 **Location** — Tu loues un objet pour une durée définie (jours, semaines). Tu payes un prix par jour.\n\n🛒 **Vente** — Tu achètes ou vends un objet définitivement à un prix fixe.\n\n🔄 **Troc** — Tu proposes un échange d'objet contre un autre. Pas d'argent, juste du bon sens !\n\nPour commencer, crée un compte, publie ton annonce avec des photos, et les intéressés te contactent directement.";
        } else if (msg.includes("louer") || msg.includes("location") || msg.includes("rent")) {
            demoResponse = `Super choix ! La location sur Karrily, c'est simple : tu trouves l'objet, tu choisis tes dates, et tu contactes le propriétaire. [SEARCH_ACTION] {"type": "rent", "search": "${msg.replace(/louer|location|je cherche|un|une/gi, "").trim() || "objet"}", "wilaya": ""}`;
        } else if (msg.includes("vendre") || msg.includes("acheter") || msg.includes("achat") || msg.includes("vente") || msg.includes("sell")) {
            demoResponse = `Très bien ! Voici les objets à vendre sur Karrily qui pourraient t'intéresser : [SEARCH_ACTION] {"type": "sell", "search": "${msg.replace(/vendre|acheter|achat|vente|je cherche|un|une/gi, "").trim() || "objet"}", "wilaya": ""}`;
        } else if (msg.includes("troc") || msg.includes("échange") || msg.includes("echanger")) {
            demoResponse = `Le troc c'est génial ! Tu proposes ce que tu as et tu décris ce que tu veux en échange. Voici les annonces de troc disponibles : [SEARCH_ACTION] {"type": "troc", "search": "${msg.replace(/troc|échange|echanger|je cherche|un|une/gi, "").trim() || "objet"}", "wilaya": ""}`;
        } else if (msg.includes("alger") || msg.includes("oran") || msg.includes("constantine") || msg.includes("tizi") || msg.includes("sétif") || msg.includes("wilaya")) {
            const wilayaMap: Record<string, string> = { "alger": "16", "oran": "31", "constantine": "25", "tizi": "15", "sétif": "19", "setif": "19" };
            const wilaya = Object.entries(wilayaMap).find(([k]) => msg.includes(k))?.[1] || "";
            demoResponse = `Je recherche dans ta région ! [SEARCH_ACTION] {"type": "", "search": "${msg.replace(/alger|oran|constantine|tizi|sétif|wilaya|à|a/gi, "").trim()}", "wilaya": "${wilaya}"}`;
        } else if (msg.includes("cherche") || msg.includes("trouver") || msg.includes("besoin")) {
            const search = msg.replace(/je cherche|je veux|j'ai besoin|trouver|un|une/gi, "").trim();
            demoResponse = `Laisse-moi chercher ça pour toi ! [SEARCH_ACTION] {"type": "", "search": "${search}", "wilaya": ""}`;
        } else if (msg.includes("confiance") || msg.includes("sécurité") || msg.includes("arnaque") || msg.includes("fiable")) {
            demoResponse = "Karrily prend la sécurité très au sérieux 🛡️ :\n\n✅ **Profils vérifiés** — Les utilisateurs peuvent faire vérifier leur identité.\n⭐ **Système d'avis** — Après chaque transaction, les deux parties se notent mutuellement.\n📊 **Score de confiance** — Chaque profil affiche un score basé sur son historique.\n\nEn cas de problème, notre équipe de modération est disponible via le système de signalement.";
        } else if (msg.includes("prix") || msg.includes("coût") || msg.includes("tarif") || msg.includes("combien")) {
            demoResponse = "Sur Karrily, les prix sont fixés librement par les vendeurs/loueurs 💰.\n\n📌 **Location** : Prix par jour fixé par le propriétaire.\n📌 **Vente** : Prix de vente définitif.\n📌 **Troc** : Pas d'argent ! L'échange est basé sur la valeur perçue entre les deux parties.\n\nTu peux utiliser les filtres de prix sur la page Explore pour affiner ta recherche.";
        } else {
            demoResponse = "Désolé, je suis en mode démonstration pour l'instant ⚡. Je peux quand même t'aider à :\n\n• Comprendre comment fonctionne Karrily\n• Chercher un objet à louer, acheter ou troquer\n• T'informer sur la sécurité de la plateforme\n\nPose-moi une question sur l'un de ces sujets !";
        }

        res.json({ message: demoResponse, demo: true });
    }
};
