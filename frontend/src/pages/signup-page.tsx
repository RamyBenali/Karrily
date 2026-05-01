import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { motion } from "motion/react";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2, Wallet, Globe, Users, RefreshCw } from "lucide-react";
import { useAuthStore } from "../store/auth.store";
import { KarillyLogo } from "../components/brand/karilly-logo";
import { Button } from "../components/ui/button";
import { useTheme } from "../context/theme-context";
import { useTranslation } from "../context/language-context";

export function SignupPage() {
    const { isDark } = useTheme();
    const { t } = useTranslation();
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
            setError(t("auth.passwordMismatch"));
            return;
        }

        setIsLoading(true);
        try {
            await signUp(email, password, fullName);
            setSuccess(true);
        } catch (err: any) {
            setError(err?.message || t("auth.signupError"));
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="relative flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md rounded-3xl border border-border bg-card p-10 text-center shadow-xl"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.2 }}
                        className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    </motion.div>
                    <h2 className="mb-3 text-2xl font-bold text-foreground">
                        {t("auth.signupTitle")}
                    </h2>
                    <p className="mb-6 text-muted-foreground">
                        {t("auth.signupSubtitle")} <strong>{email}</strong>
                    </p>
                    <Button
                        onClick={() => navigate("/login")}
                        className="bg-[#FF4F5A] hover:bg-[#FF4F5A]/90 text-white px-8 h-12 rounded-xl font-semibold"
                    >
                        {t("auth.loginLink")}
                    </Button>
                </motion.div>
            </div>
        );
    }

    const inputClasses = "h-12 w-full rounded-xl border border-border bg-muted/40 pl-12 pr-4 text-foreground placeholder:text-muted-foreground transition-all focus:border-[#0F2A2E] focus:bg-card focus:ring-2 focus:ring-[#0F2A2E]/20 focus:outline-none dark:focus:border-[#FF4F5A] dark:focus:ring-[#FF4F5A]/20";

    return (
        <div className="relative flex min-h-screen bg-background text-foreground">
            {/* Left — Form */}
            <div className="flex flex-1 items-center justify-center bg-background p-6 lg:p-12">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    <h2 className="mt-8 mb-2 text-3xl font-bold text-foreground">
                        {t("auth.signupTitle")}
                    </h2>
                    <p className="mb-8 text-muted-foreground">
                        {t("auth.signupSubtitle")}
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
                                {t("auth.fullName")}
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder={t("auth.fullNamePlaceholder")}
                                    value={fullName}
                                    onChange={(e) => {
                                        setFullName(e.target.value);
                                        if (error) setError("");
                                    }}
                                    className={inputClasses}
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-foreground">
                                {t("auth.email")}
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                                <input
                                    type="email"
                                    placeholder={t("auth.emailPlaceholder")}
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (error) setError("");
                                    }}
                                    className={inputClasses}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-foreground">
                                {t("auth.password")}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder={t("auth.passwordPlaceholder")}
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (error) setError("");
                                    }}
                                    className={`${inputClasses} !pr-12`}
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
                                        { check: passwordChecks.length, label: t("auth.passwordLength") },
                                        { check: passwordChecks.uppercase, label: t("auth.passwordUppercase") },
                                        { check: passwordChecks.number, label: t("auth.passwordNumber") },
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
                                                className={`text-xs ${item.check ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
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
                                {t("auth.confirmPassword")}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder={t("auth.confirmPasswordPlaceholder")}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={`h-12 w-full rounded-xl border bg-muted/40 pl-12 pr-4 text-foreground placeholder:text-muted-foreground transition-all focus:bg-card focus:outline-none ${confirmPassword.length > 0
                                            ? passwordChecks.match
                                                ? "border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                                : "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                                            : "border-border focus:border-[#0F2A2E] focus:ring-2 focus:ring-[#0F2A2E]/20 dark:focus:border-[#FF4F5A] dark:focus:ring-[#FF4F5A]/20"
                                        }`}
                                    required
                                    minLength={8}
                                />
                            </div>
                        </div>

                        {/* Terms */}
                        <p className="mt-2 text-xs text-muted-foreground">
                            {t("auth.termsPrefix")}{" "}
                            <a href="#" className="text-[#FF4F5A] hover:underline">
                                {t("auth.termsLink")}
                            </a>{" "}
                            {t("auth.termsAnd")}{" "}
                            <a href="#" className="text-[#FF4F5A] hover:underline">
                                {t("auth.privacyLink")}
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
                                    {t("auth.signupButton")}
                                    <ArrowRight className="w-5 h-5 rtl-mirror" />
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Login link */}
                    <p className="mt-6 text-center text-muted-foreground">
                        {t("auth.alreadyHaveAccount")}{" "}
                        <Link
                            to="/login"
                            className="text-[#FF4F5A] font-semibold hover:text-[#FF4F5A]/80 transition-colors"
                        >
                            {t("auth.loginLink")}
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
                            {t("auth.whyTitle")}
                        </h2>

                        <div className="space-y-6">
                            {[
                                {
                                    icon: Wallet,
                                    title: t("auth.whySaveTitle"),
                                    desc: t("auth.whySaveDesc"),
                                },
                                {
                                    icon: Globe,
                                    title: t("auth.whyEcoTitle"),
                                    desc: t("auth.whyEcoDesc"),
                                },
                                {
                                    icon: Users,
                                    title: t("auth.whyTrustTitle"),
                                    desc: t("auth.whyTrustDesc"),
                                },
                                {
                                    icon: RefreshCw,
                                    title: t("auth.whyTrocTitle"),
                                    desc: t("auth.whyTrocDesc"),
                                },
                            ].map((item, i) => (
                                <motion.div
                                    key={item.title}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + i * 0.15 }}
                                    className="flex items-start gap-4 text-left bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                                        <item.icon className="w-5 h-5 text-[#FF4F5A]" />
                                    </div>
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
