import { motion } from "motion/react";
import { Navigation } from "../components/layout/navigation";
import { useTranslation } from "../context/language-context";

function LegalLayout({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#F7F7F9]">
            
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
    const { t, locale } = useTranslation();
    return (
        <LegalLayout title={t("legal.termsTitle")}>
            <p><strong>{t("dashboard.date")} : {new Date().toLocaleDateString(locale === 'ar' ? 'ar-DZ' : locale === 'fr' ? 'fr-FR' : 'en-US')}</strong></p>

            <h3>{t("legal.introTitle")}</h3>
            <p>{t("legal.introText")}</p>

            <h3>{t("legal.roleTitle")}</h3>
            <p>{t("legal.roleText")}</p>

            <h3>{t("legal.obligationsTitle")}</h3>
            <ul>
                <li>{t("legal.obligationsText1")}</li>
                <li>{t("legal.obligationsText2")}</li>
                <li>{t("legal.obligationsText3")}</li>
                <li>{t("legal.obligationsText4")}</li>
            </ul>

            <h3>{t("legal.bookingTitle")}</h3>
            <p>{t("legal.bookingText")}</p>

            <h3>{t("legal.responsibilityTitle")}</h3>
            <p>{t("legal.responsibilityText")}</p>
        </LegalLayout>
    );
}

export function PrivacyPolicyPage() {
    const { t, locale } = useTranslation();
    return (
        <LegalLayout title={t("legal.privacyTitle")}>
            <p><strong>{t("dashboard.date")} : {new Date().toLocaleDateString(locale === 'ar' ? 'ar-DZ' : locale === 'fr' ? 'fr-FR' : 'en-US')}</strong></p>

            <h3>{t("legal.dataTitle")}</h3>
            <p>{t("legal.dataText")}</p>

            <h3>{t("legal.usageTitle")}</h3>
            <p>{t("legal.usageText")}</p>

            <h3>{t("legal.securityTitle")}</h3>
            <p>{t("legal.securityText")}</p>

            <h3>{t("legal.rightsTitle")}</h3>
            <p>{t("legal.rightsText")}</p>
        </LegalLayout>
    );
}

export function LegalNoticePage() {
    const { t } = useTranslation();
    return (
        <LegalLayout title={t("legal.legalTitle")}>
            <h3>{t("legal.editorTitle")}</h3>
            <p>
                <strong>Karrily</strong><br />
                {t("legal.editorText").split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}
            </p>

            <h3>{t("legal.hostTitle")}</h3>
            <p>
                {t("legal.hostText")}
            </p>

            <h3>{t("legal.ipTitle")}</h3>
            <p>
                {t("legal.ipText")}
            </p>
        </LegalLayout>
    );
}
