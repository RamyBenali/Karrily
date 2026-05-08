import { Request, Response } from "express";
import { config } from "../config/index.js";

const SYSTEM_PROMPT = `
Tu es l'Assistant Karrily, un expert intelligent et chaleureux de la plateforme Karrily.
Karrily est une plateforme algérienne innovante qui permet la location, la vente et le troc (échange) d'objets entre particuliers et professionnels.

TES MISSIONS :
1. Guider les utilisateurs : Explique comment fonctionne la plateforme (comment louer, comment vendre, comment proposer un troc).
2. Aide à la recherche : Aide les utilisateurs à trouver ce qu'ils cherchent sur la plateforme.
3. Rassurer : Explique le système de confiance, les avis et la vérification des profils.
4. Informer sur les prix : Explique comment les prix fonctionnent (par jour, par semaine, prix de vente, valeur estimée pour le troc).

RÈGLES STRICTES :
- Ne parle QUE de Karrily et des sujets liés à la consommation collaborative, le commerce, et l'économie circulaire en Algérie.
- Si on te pose une question hors sujet (ex: politique, programmation, cuisine non liée à Karrily), décline poliment en rappelant ta mission.
- Utilise un ton professionnel mais amical, adapté au marché algérien.
- Réponds principalement en Français, mais si l'utilisateur parle en Arabe (Darja ou Classique), réponds en Arabe.
- Sois concis mais complet. Maximum 3-4 paragraphes par réponse.

FONCTIONNALITÉ SPÉCIALE - RECHERCHE :
Si l'utilisateur cherche un produit/service spécifique, inclus OBLIGATOIREMENT une commande de recherche à la fin de ta réponse sous ce format exact :
[SEARCH_ACTION] {"type": "rent"|"sell"|"troc"|"", "search": "terme", "wilaya": "code_wilaya_ou_vide"}

Exemples de codes wilaya : 16=Alger, 31=Oran, 25=Constantine, 15=Tizi Ouzou, 19=Sétif.

Exemple : si quelqu'un cherche "une voiture à louer à Alger" :
"Bien sûr ! Voici les voitures disponibles à la location à Alger sur Karrily. [SEARCH_ACTION] {"type": "rent", "search": "voiture", "wilaya": "16"}"

N'invente JAMAIS de produits ou de prix. Invite l'utilisateur à cliquer pour voir les disponibilités réelles.
`;

export const chat = async (req: Request, res: Response) => {
    const { message, history } = req.body;
    const messages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...(history || []).map((msg: any) => ({
            role: msg.role === "user" ? "user" : "assistant",
            content: msg.content,
        })),
        { role: "user", content: message },
    ];
    if (config.deepseek.apiKey) {
        try {
            const response = await fetch("https://api.deepseek.com/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${config.deepseek.apiKey}`,
                },
                body: JSON.stringify({
                    model: "deepseek-chat",
                    messages,
                    max_tokens: 1000,
                    temperature: 0.7,
                    stream: false,
                }),
            });

            const data = await response.json() as any;

            if (!response.ok) {
                console.error("DeepSeek API Error:", data);
                throw new Error(data.error?.message || `HTTP ${response.status}`);
            }

            const text = data.choices?.[0]?.message?.content || "Désolé, je n'ai pas pu générer de réponse.";
            return res.json({ message: text });

        } catch (error: any) {
            console.error("DeepSeek Error, falling back to demo mode:", error.message);
            // Fall through to demo mode
        }
    }
    const msg = message?.toLowerCase() || "";
    let demoResponse = "";

    if (msg.includes("bonjour") || msg.includes("salam") || msg.includes("salut") || msg.includes("hello")) {
        demoResponse = "Salam ! 👋 Je suis l'Assistant Karrily. Je suis là pour t'aider à naviguer sur la plateforme, comprendre comment ça marche, ou trouver ce que tu cherches. Comment puis-je t'aider ?";
    } else if (msg.includes("comment") && (msg.includes("marche") || msg.includes("fonctionne"))) {
        demoResponse = "Karrily est une plateforme qui permet trois types d'échanges :\n\n🔑 **Location** — Tu loues un objet pour une durée définie. Tu payes un prix par jour.\n\n🛒 **Vente** — Tu achètes ou vends un objet définitivement à un prix fixe.\n\n🔄 **Troc** — Tu proposes un échange d'objet contre un autre, sans argent !\n\nPour commencer, crée un compte, publie ton annonce avec des photos, et les intéressés te contactent directement.";
    } else if (msg.includes("louer") || msg.includes("location")) {
        demoResponse = `Super choix ! La location sur Karrily, c'est simple : tu trouves l'objet, tu choisis tes dates, et tu contactes le propriétaire. [SEARCH_ACTION] {"type": "rent", "search": "${msg.replace(/louer|location|je cherche|un|une/gi, "").trim() || "objet"}", "wilaya": ""}`;
    } else if (msg.includes("vendre") || msg.includes("acheter") || msg.includes("vente")) {
        demoResponse = `Très bien ! Voici les objets à vendre sur Karrily : [SEARCH_ACTION] {"type": "sell", "search": "${msg.replace(/vendre|acheter|achat|vente|je cherche|un|une/gi, "").trim() || "objet"}", "wilaya": ""}`;
    } else if (msg.includes("troc") || msg.includes("échange")) {
        demoResponse = `Le troc c'est génial ! Voici les annonces de troc disponibles : [SEARCH_ACTION] {"type": "troc", "search": "${msg.replace(/troc|échange|echanger|je cherche|un|une/gi, "").trim() || "objet"}", "wilaya": ""}`;
    } else if (msg.includes("cherche") || msg.includes("trouver") || msg.includes("besoin")) {
        const search = msg.replace(/je cherche|je veux|j'ai besoin|trouver|un|une/gi, "").trim();
        demoResponse = `Laisse-moi chercher ça pour toi sur Karrily ! [SEARCH_ACTION] {"type": "", "search": "${search}", "wilaya": ""}`;
    } else if (msg.includes("confiance") || msg.includes("sécurité") || msg.includes("fiable")) {
        demoResponse = "Karrily prend la sécurité très au sérieux 🛡️ :\n\n✅ **Profils vérifiés** — Les utilisateurs peuvent faire vérifier leur identité.\n⭐ **Système d'avis** — Après chaque transaction, les deux parties se notent.\n📊 **Score de confiance** — Chaque profil affiche un score basé sur son historique.";
    } else if (msg.includes("prix") || msg.includes("tarif") || msg.includes("combien")) {
        demoResponse = "Sur Karrily, les prix sont fixés librement 💰 :\n\n📌 **Location** : Prix par jour fixé par le propriétaire.\n📌 **Vente** : Prix de vente définitif.\n📌 **Troc** : Pas d'argent ! L'échange est basé sur la valeur perçue.";
    } else {
        demoResponse = "Je suis là pour t'aider avec Karrily ! 😊 Tu peux me demander :\n\n• Comment fonctionne la plateforme ?\n• Comment louer, acheter ou troquer ?\n• Chercher un objet spécifique\n• Comment la sécurité fonctionne ?\n\nQue souhaites-tu savoir ?";
    }

    res.json({ message: demoResponse, demo: true });
};
