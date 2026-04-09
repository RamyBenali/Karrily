import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { motion } from "motion/react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { useAuthStore } from "../store/auth.store";
import { KarillyLogo } from "../components/brand/karilly-logo";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ThemeToggle } from "../components/layout/theme-toggle";
import { useTheme } from "../context/theme-context";

export function LoginPage() {
    const { isDark } = useTheme();
    const navigate = useNavigate();
    const signIn = useAuthStore((s) => s.signIn);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            await signIn(email, password);
            navigate("/explore");
        } catch (err: any) {
            setError(err?.message || "Erreur de connexion. Vérifiez vos identifiants.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen bg-background text-foreground">
            <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
                <ThemeToggle />
            </div>
            {/* Left — Decorative Panel */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#0F2A2E] via-[#1a3f44] to-[#0F2A2E] items-center justify-center p-12 overflow-hidden">
                {/* Background shapes */}
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-[#FF4F5A]/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#7C5CFC]/10 rounded-full blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-400/5 rounded-full blur-2xl" />
                </div>

                <div className="relative z-10 max-w-lg text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-4xl font-bold text-white mb-4">
                            Louez, vendez, échangez.
                        </h1>
                        <p className="text-xl text-white/70 mb-8">
                            La première plateforme algérienne de location et d'échange entre particuliers.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="grid grid-cols-3 gap-4 mt-12"
                    >
                        {[
                            { emoji: "🏠", label: "Immobilier" },
                            { emoji: "🚗", label: "Véhicules" },
                            { emoji: "📸", label: "Électronique" },
                            { emoji: "🔧", label: "Outillage" },
                            { emoji: "🎪", label: "Événementiel" },
                            { emoji: "⚽", label: "Sport" },
                        ].map((cat, i) => (
                            <motion.div
                                key={cat.label}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 + i * 0.1 }}
                                className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10"
                            >
                                <span className="text-2xl">{cat.emoji}</span>
                                <p className="text-white/60 text-sm mt-1">{cat.label}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Right — Login Form */}
            <div className="flex flex-1 items-center justify-center bg-background p-6 lg:p-12">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    {/* Logo */}
                    <Link to="/" className="mb-8 inline-block">
                        <KarillyLogo className="h-10" variant={isDark ? "white" : "default"} />
                    </Link>

                    <h2 className="mb-2 text-3xl font-bold text-foreground">
                        Bon retour ! 👋
                    </h2>
                    <p className="mb-8 text-muted-foreground">
                        Connectez-vous pour accéder à votre compte.
                    </p>

                    {/* Error message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
                        >
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div className="relative">
                            <label className="mb-1.5 block text-sm font-medium text-foreground">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
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
                                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-12 rounded-xl border-border bg-muted/40 pl-12 pr-12 text-foreground transition-all focus:border-[#0F2A2E] focus:bg-card focus:ring-[#0F2A2E]/20"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Forgot password */}
                        <div className="flex justify-end">
                            <button
                                type="button"
                                className="text-sm text-[#FF4F5A] hover:text-[#FF4F5A]/80 font-medium transition-colors"
                            >
                                Mot de passe oublié ?
                            </button>
                        </div>

                        {/* Submit */}
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 bg-[#FF4F5A] hover:bg-[#FF4F5A]/90 text-white rounded-xl font-semibold shadow-lg shadow-[#FF4F5A]/25 hover:shadow-xl hover:shadow-[#FF4F5A]/40 transition-all text-base flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Se connecter
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="my-8 flex items-center gap-4">
                        <div className="h-px flex-1 bg-border" />
                        <span className="text-sm text-muted-foreground">ou</span>
                        <div className="h-px flex-1 bg-border" />
                    </div>

                    {/* Social login */}
                    <button
                        type="button"
                        className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-border font-medium text-foreground transition-all hover:bg-muted/80"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continuer avec Google
                    </button>

                    {/* Sign up link */}
                    <p className="mt-8 text-center text-muted-foreground">
                        Pas encore de compte ?{" "}
                        <Link
                            to="/signup"
                            className="text-[#FF4F5A] font-semibold hover:text-[#FF4F5A]/80 transition-colors"
                        >
                            Créer un compte
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
