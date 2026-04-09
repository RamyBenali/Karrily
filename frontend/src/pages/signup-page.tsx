import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { motion } from "motion/react";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "../store/auth.store";
import { KarillyLogo } from "../components/brand/karilly-logo";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ThemeToggle } from "../components/layout/theme-toggle";
import { useTheme } from "../context/theme-context";

export function SignupPage() {
    const { isDark } = useTheme();
    const navigate = useNavigate();
    const signUp = useAuthStore((s) => s.signUp);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const passwordChecks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        number: /[0-9]/.test(password),
        match: password === confirmPassword && confirmPassword.length > 0,
    };

    const isFormValid =
        fullName.trim().length > 0 &&
        email.trim().length > 0 &&
        Object.values(passwordChecks).every(Boolean);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }

        setIsLoading(true);
        try {
            await signUp(email, password, fullName);
            setSuccess(true);
        } catch (err: any) {
            setError(err?.message || "Erreur lors de l'inscription.");
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="relative flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
                <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
                    <ThemeToggle />
                </div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md rounded-3xl border border-border bg-card p-10 text-center shadow-xl"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.2 }}
                        className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    </motion.div>
                    <h2 className="mb-3 text-2xl font-bold text-foreground">
                        Compte créé avec succès ! 🎉
                    </h2>
                    <p className="mb-6 text-muted-foreground">
                        Un email de confirmation a été envoyé à <strong>{email}</strong>.
                        Vérifiez votre boîte de réception pour activer votre compte.
                    </p>
                    <Button
                        onClick={() => navigate("/login")}
                        className="bg-[#FF4F5A] hover:bg-[#FF4F5A]/90 text-white px-8 h-12 rounded-xl font-semibold"
                    >
                        Se connecter
                    </Button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="relative flex min-h-screen bg-background text-foreground">
            <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
                <ThemeToggle />
            </div>
            {/* Left — Form */}
            <div className="flex flex-1 items-center justify-center bg-background p-6 lg:p-12">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    {/* Logo */}
                    <Link to="/" className="mb-8 inline-block">
                        <KarillyLogo className="h-10" variant={isDark ? "white" : "default"} />
                    </Link>

                    <h2 className="mb-2 text-3xl font-bold text-foreground">
                        Créer un compte 🚀
                    </h2>
                    <p className="mb-8 text-muted-foreground">
                        Rejoignez la communauté Karrily et commencez à louer, vendre ou échanger.
                    </p>

                    {/* Error */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
                        >
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Full Name */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-foreground">
                                Nom complet
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Votre nom complet"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="h-12 rounded-xl border-border bg-muted/40 pl-12 text-foreground transition-all focus:border-[#0F2A2E] focus:bg-card focus:ring-[#0F2A2E]/20"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-foreground">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    type="email"
                                    placeholder="votre@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-12 rounded-xl border-border bg-muted/40 pl-12 text-foreground transition-all focus:border-[#0F2A2E] focus:bg-card focus:ring-[#0F2A2E]/20"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-foreground">
                                Mot de passe
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Minimum 8 caractères"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-12 rounded-xl border-border bg-muted/40 pl-12 pr-12 text-foreground transition-all focus:border-[#0F2A2E] focus:bg-card focus:ring-[#0F2A2E]/20"
                                    required
                                    minLength={8}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>

                            {/* Password strength */}
                            {password.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="mt-3 space-y-1.5"
                                >
                                    {[
                                        { check: passwordChecks.length, label: "8 caractères minimum" },
                                        { check: passwordChecks.uppercase, label: "Une majuscule" },
                                        { check: passwordChecks.number, label: "Un chiffre" },
                                    ].map((item) => (
                                        <div key={item.label} className="flex items-center gap-2">
                                            <div
                                                className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${item.check
                                                        ? "bg-emerald-500"
                                                        : "bg-muted"
                                                    }`}
                                            >
                                                {item.check && (
                                                    <CheckCircle2 className="w-3 h-3 text-white" />
                                                )}
                                            </div>
                                            <span
                                                className={`text-xs ${item.check ? "text-emerald-600" : "text-muted-foreground"
                                                    }`}
                                            >
                                                {item.label}
                                            </span>
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-foreground">
                                Confirmer le mot de passe
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Retapez votre mot de passe"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={`h-12 rounded-xl border-border bg-muted/40 pl-12 text-foreground transition-all focus:bg-card ${confirmPassword.length > 0
                                            ? passwordChecks.match
                                                ? "border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/20"
                                                : "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                                            : "focus:border-[#0F2A2E] focus:ring-[#0F2A2E]/20"
                                        }`}
                                    required
                                    minLength={8}
                                />
                            </div>
                        </div>

                        {/* Terms */}
                        <p className="mt-2 text-xs text-muted-foreground">
                            En créant un compte, vous acceptez nos{" "}
                            <a href="#" className="text-[#FF4F5A] hover:underline">
                                Conditions d'utilisation
                            </a>{" "}
                            et notre{" "}
                            <a href="#" className="text-[#FF4F5A] hover:underline">
                                Politique de confidentialité
                            </a>.
                        </p>

                        {/* Submit */}
                        <Button
                            type="submit"
                            disabled={isLoading || !isFormValid}
                            className="w-full h-12 bg-[#FF4F5A] hover:bg-[#FF4F5A]/90 text-white rounded-xl font-semibold shadow-lg shadow-[#FF4F5A]/25 hover:shadow-xl hover:shadow-[#FF4F5A]/40 transition-all text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Créer mon compte
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Login link */}
                    <p className="mt-6 text-center text-muted-foreground">
                        Déjà un compte ?{" "}
                        <Link
                            to="/login"
                            className="text-[#FF4F5A] font-semibold hover:text-[#FF4F5A]/80 transition-colors"
                        >
                            Se connecter
                        </Link>
                    </p>
                </motion.div>
            </div>

            {/* Right — Decorative Panel */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-bl from-[#0F2A2E] via-[#1a3f44] to-[#0F2A2E] items-center justify-center p-12 overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-20 right-10 w-72 h-72 bg-[#FF4F5A]/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#7C5CFC]/10 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 max-w-lg">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center"
                    >
                        <h2 className="text-3xl font-bold text-white mb-6">
                            Pourquoi Karrily ?
                        </h2>

                        <div className="space-y-6">
                            {[
                                {
                                    icon: "💰",
                                    title: "Économisez",
                                    desc: "Louez au lieu d'acheter. Économisez jusqu'à 80% sur vos besoins ponctuels.",
                                },
                                {
                                    icon: "🌍",
                                    title: "Éco-responsable",
                                    desc: "Partagez les ressources et réduisez votre empreinte carbone.",
                                },
                                {
                                    icon: "🤝",
                                    title: "Communauté de confiance",
                                    desc: "Profils vérifiés, avis authentiques, garantie Karrily.",
                                },
                                {
                                    icon: "🔄",
                                    title: "Troc innovant",
                                    desc: "Échangez vos objets sans dépenser un dinar.",
                                },
                            ].map((item, i) => (
                                <motion.div
                                    key={item.title}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + i * 0.15 }}
                                    className="flex items-start gap-4 text-left bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10"
                                >
                                    <span className="text-3xl">{item.icon}</span>
                                    <div>
                                        <h3 className="text-white font-semibold">{item.title}</h3>
                                        <p className="text-white/60 text-sm mt-1">{item.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
