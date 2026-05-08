import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MessageSquare, X, Send, Bot, User,
  Sparkles, Search, ArrowRight, Loader2, ChevronDown
} from "lucide-react";
import { aiService, ChatMessage } from "../../services/ai.service";
import { cn } from "../ui/utils";
import { useNavigate } from "react-router";
import { usePlatform } from "../../hooks/usePlatform";
import { useHaptics } from "../../hooks/useHaptics";

interface SearchAction {
  type: string;
  search: string;
  wilaya: string;
}

export function ChatBot() {
  const navigate = useNavigate();
  const { isNative } = usePlatform();
  const { tap } = useHaptics();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showBadge, setShowBadge] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleOpen = () => {
    tap();
    setIsOpen(true);
    setShowBadge(false);
    setTimeout(() => inputRef.current?.focus(), 300);
  };

  const handleClose = () => {
    tap();
    setIsOpen(false);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);
    try {
      const response = await aiService.chat(userMessage, messages);
      if (response.error) throw new Error(response.error);
      setMessages((prev) => [...prev, { role: "model", content: response.message }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "model", content: "Désolé, j'ai rencontré un petit problème technique." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const parseSearchAction = (text: string): { cleanText: string; action?: SearchAction } => {
    const marker = "[SEARCH_ACTION]";
    if (!text.includes(marker)) return { cleanText: text };
    const parts = text.split(marker);
    try {
      return { cleanText: parts[0].trim(), action: JSON.parse(parts[1].trim()) as SearchAction };
    } catch {
      return { cleanText: parts[0].trim() };
    }
  };

  const executeSearch = (action: SearchAction) => {
    const params = new URLSearchParams();
    if (action.type) params.set("type", action.type);
    if (action.search) params.set("search", action.search);
    if (action.wilaya) params.set("wilaya", action.wilaya);
    navigate(`/explore?${params.toString()}`);
    handleClose();
  };
  const fabStyle = isNative
    ? { bottom: "calc(env(safe-area-inset-bottom) + 5.5rem)" }
    : undefined;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-[98]"
            onClick={handleClose}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34, mass: 0.9 }}
            className={cn(
              "fixed z-[99] flex flex-col bg-background/98 backdrop-blur-2xl",
              "inset-x-0 bottom-0 rounded-t-[32px] shadow-[0_-8px_48px_rgba(0,0,0,0.22)]",
              "lg:inset-x-auto lg:bottom-24 lg:right-5 lg:w-[360px] lg:h-[480px] lg:rounded-3xl lg:shadow-[0_16px_48px_rgba(0,0,0,0.18)]",
            )}
            style={
              window.innerWidth < 1024
                ? { height: "75dvh", paddingBottom: "env(safe-area-inset-bottom)" }
                : undefined
            }
          >
            <div className="lg:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>
            <div className="px-4 py-3 flex items-center justify-between bg-gradient-to-r from-[#FF4F5A]/5 to-purple-500/5 border-b border-border/10 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF4F5A] to-purple-600 flex items-center justify-center text-white shadow-md shadow-[#FF4F5A]/20">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-tight leading-none">Assistant Karrily</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">IA Active</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-9 h-9 flex items-center justify-center hover:bg-muted rounded-2xl transition-colors"
              >
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-3 no-scrollbar"
            >
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-3 px-4 pb-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF4F5A]/10 to-purple-600/10 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-[#FF4F5A]" />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-base font-black tracking-tight">Salam !</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Pose-moi une question sur Karrily ou cherche un objet.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center mt-2">
                    {["Cherche une voiture", "Comment louer ?", "Annonces populaires"].map((s) => (
                      <button
                        key={s}
                        onClick={() => { setInput(s); inputRef.current?.focus(); }}
                        className="text-xs font-bold px-3 py-1.5 rounded-full bg-muted hover:bg-[#FF4F5A]/10 hover:text-[#FF4F5A] transition-all border border-border active:scale-95"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, idx) => {
                const { cleanText, action } = parseSearchAction(msg.content);
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn("flex gap-2.5", msg.role === "user" ? "flex-row-reverse" : "flex-row")}
                  >
                    <div className={cn(
                      "w-7 h-7 rounded-full shrink-0 flex items-center justify-center shadow-sm mt-0.5",
                      msg.role === "user" ? "bg-muted" : "bg-gradient-to-br from-[#FF4F5A] to-purple-600 text-white"
                    )}>
                      {msg.role === "user"
                        ? <User className="w-3.5 h-3.5 text-muted-foreground" />
                        : <Bot className="w-3.5 h-3.5" />
                      }
                    </div>
                    <div className={cn("space-y-2 max-w-[80%]", msg.role === "user" && "items-end flex flex-col")}>
                      <div className={cn(
                        "px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed",
                        msg.role === "user"
                          ? "bg-foreground text-background rounded-tr-sm"
                          : "bg-muted/70 border border-border/20 rounded-tl-sm"
                      )}>
                        {cleanText}
                      </div>
                      {action && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => executeSearch(action)}
                          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-full text-xs font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                        >
                          <Search className="w-3.5 h-3.5" />
                          Voir les résultats
                          <ArrowRight className="w-3.5 h-3.5" />
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {isLoading && (
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#FF4F5A] to-purple-600 text-white flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="bg-muted/70 px-4 py-2.5 rounded-2xl rounded-tl-sm border border-border/20 flex items-center gap-2">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-[#FF4F5A]"
                          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="px-3 py-3 border-t border-border/10 flex-shrink-0">
              <div className="flex items-center gap-2 bg-muted/50 rounded-2xl px-3 border border-border/30 focus-within:border-[#FF4F5A]/40 focus-within:ring-2 focus-within:ring-[#FF4F5A]/10 transition-all">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Ta question..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="flex-1 bg-transparent py-3.5 text-sm font-medium focus:outline-none placeholder:text-muted-foreground/60"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center transition-all flex-shrink-0",
                    input.trim() && !isLoading
                      ? "bg-[#FF4F5A] text-white shadow-md shadow-[#FF4F5A]/30 active:scale-90"
                      : "bg-muted text-muted-foreground opacity-40"
                  )}
                >
                  {isLoading
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Send className="w-4 h-4" />
                  }
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="fab"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileTap={{ scale: 0.88 }}
            onClick={handleOpen}
            className="fixed right-4 z-[97] w-14 h-14 rounded-full bg-gradient-to-br from-[#FF4F5A] to-purple-600 text-white flex items-center justify-center shadow-[0_6px_28px_rgba(255,79,90,0.45)] lg:bottom-5"
            style={fabStyle ?? { bottom: "calc(5.5rem + env(safe-area-inset-bottom))" }}
          >
            <MessageSquare className="w-6 h-6" />
            {showBadge && (
              <span className="absolute top-1.5 right-1.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background animate-pulse" />
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
