import { KarillyLogo } from "../brand/karilly-logo";
import { Link } from "react-router";
import { useTranslation } from "../../context/language-context";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-[#0F2A2E] text-white py-16">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          <div className="lg:col-span-2">
            <div className="mb-6">
              <KarillyLogo className="h-8" variant="white" />
            </div>
            <p className="text-white/70 mb-6 leading-relaxed">
              {t("footer.description")}
            </p>
            <div className="flex gap-3">
              {["Twitter", "Instagram", "LinkedIn"].map((social) => (
                <button
                  key={social}
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                  aria-label={social}
                >
                  <span className="sr-only">{social}</span>
                </button>
              ))}
            </div>
          </div>

          {[
            {
              title: t("footer.explore"),
              links: [
                { label: t("footer.allCategories"), to: "/explore" }
              ]
            },
            {
              title: t("footer.company"),
              links: [
                { label: t("footer.about"), to: "/explore" }
              ]
            },
            {
              title: t("footer.support"),
              links: [
                { label: t("footer.helpCenter"), to: "/explore" }
              ]
            }
          ].map((column) => (
            <div key={column.title}>
              <h4 className="font-semibold text-lg mb-4">{column.title}</h4>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-white/70 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/50 text-sm">
            © {new Date().getFullYear()} Karrily. {t("footer.allRightsReserved")}
          </p>
          <div className="flex gap-6">
            <Link to="/cgu" className="text-white/50 hover:text-white text-sm transition-colors">
              {t("footer.cgu")}
            </Link>
            <Link to="/privacy" className="text-white/50 hover:text-white text-sm transition-colors">
              {t("footer.confidentiality")}
            </Link>
            <Link to="/legal" className="text-white/50 hover:text-white text-sm transition-colors">
              {t("footer.legalNotices")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
