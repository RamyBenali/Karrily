import { motion } from "motion/react";
import { Navigation } from "../components/layout/navigation";

function LegalLayout({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#F7F7F9]">
            <Navigation />
            <div className="pt-32 pb-16">
                <main className="max-w-4xl mx-auto px-6 lg:px-12 bg-white rounded-3xl p-8 lg:p-12 shadow-xl border border-gray-100">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-4xl font-bold text-[#0F2A2E] mb-8">{title}</h1>
                        <div className="prose prose-lg prose-[#0F2A2E] max-w-none">
                            {children}
                        </div>
                    </motion.div>
                </main>
            </div>
        </div>
    );
}

export function CGUPage() {
    return (
        <LegalLayout title="Conditions Générales d'Utilisation (CGU)">
            <p><strong>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</strong></p>

            <h3>1. Introduction</h3>
            <p>Bienvenue sur Karrily, la marketplace de location et de troc de proximité en Algérie. Les présentes Conditions Générales d'Utilisation (ci-après « CGU ») régissent votre accès et votre utilisation de notre plateforme.</p>

            <h3>2. Rôle de la Plateforme</h3>
            <p>Karrily agit exclusivement en tant qu'intermédiaire technique mettant en relation des propriétaires (Loueurs) et des locataires (Emprunteurs). Nous ne sommes propriétaires d'aucun bien loué ou échangé via la plateforme.</p>

            <h3>3. Obligations des Utilisateurs</h3>
            <ul>
                <li>Vous devez avoir au moins 18 ans pour créer un compte.</li>
                <li>Le loueur s'engage à fournir des informations exactes sur l'état du bien.</li>
                <li>L'emprunteur s'engage à restituer le bien dans l'état exact où il lui a été confié.</li>
                <li>Toute caution demandée ou transaction financière s'effectue sous la responsabilité des deux parties, Karrily n'intervenant pas dans la gestion des litiges financiers directs sauf mention contraire.</li>
            </ul>

            <h3>4. Réservation et Annulation</h3>
            <p>Une fois une réservation acceptée par le loueur, l'emprunteur s'engage à finaliser la transaction aux modalités convenues (paiement sur place ou via la plateforme). Une annulation répétée et non justifiée de réservations peut entraîner la suspension du compte.</p>

            <h3>5. Responsabilité</h3>
            <p>Karrily ne peut être tenue responsable des dommages causés à un bien lors d'une location, ni des défauts de paiement. Nous recommandons la rédaction d'un contrat de location direct pour les biens de grande valeur.</p>
        </LegalLayout>
    );
}

export function PrivacyPolicyPage() {
    return (
        <LegalLayout title="Politique de Confidentialité">
            <p><strong>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</strong></p>

            <h3>1. Collecte des Données</h3>
            <p>Karrily collecte les informations que vous nous fournissez lors de la création de votre compte (nom, adresse email, numéro de téléphone, localisation) afin de permettre la mise en relation sécurisée entre les utilisateurs.</p>

            <h3>2. Utilisation de vos Données</h3>
            <p>Vos données de contact (numéro de téléphone, adresse) ne sont communiquées à l'autre partie qu'une fois la demande de réservation validée. Nous ne vendons pas vos données personnelles à des tiers.</p>

            <h3>3. Sécurité</h3>
            <p>Nous utilisons des protocoles de sécurité avancés liés à nos fournisseurs d'infrastructure (Supabase) pour garantir l'intégrité de vos données sensibles. Les mots de passe sont cryptés et ne nous sont jamais accessibles en clair.</p>

            <h3>4. Vos Droits</h3>
            <p>Conformément à la réglementation applicable en Algérie, vous disposez d'un droit d'accès, de modification et de suppression de vos données personnelles via votre tableau de bord.</p>
        </LegalLayout>
    );
}

export function LegalNoticePage() {
    return (
        <LegalLayout title="Mentions Légales">
            <h3>Éditeur du site</h3>
            <p>
                <strong>Karrily</strong><br />
                Plateforme numérique de location et troc de proximité.<br />
                Siège social : Alger, Algérie.<br />
                Email de contact : contact@karrily.dz
            </p>

            <h3>Hébergement</h3>
            <p>
                Ce site est hébergé sur une infrastructure cloud respectant les normes de sécurité en vigueur. 
                (Remplacer par les détails de l'hébergeur public de production, ex: Vercel Inc. et Supabase).
            </p>

            <h3>Propriété Intellectuelle</h3>
            <p>
                La plateforme Karrily (code source, design, logo) est protégée par le droit de la propriété intellectuelle. Toute reproduction est interdite sans autorisation préalable.
            </p>
        </LegalLayout>
    );
}
