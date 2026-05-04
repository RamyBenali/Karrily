import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  MessageSquare, X, Send, Bot, User, 
  Sparkles, Search, ArrowRight, Loader2,
  ChevronDown, Minus
} from "lucide-react";
import { aiService, ChatMessage } from "../../services/ai.service";
import { cn } from "../ui/utils";
import { useNavigate } from "react-router";
import { useTranslation } from "../../context/language-context";

interface SearchAction {
  type: string;
  search: string;
  wilaya: string;
}

export function ChatBot() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showBadge, setShowBadge] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await aiService.chat(userMessage, messages);
      if (response.error) throw new Error(response.error);
      setMessages(prev => [...prev, { role: "model", content: response.message }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: "model", content: "Désolé, j'ai rencontré un petit problème technique. Vérifie que la clé API est bien configurée." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const parseSearchAction = (text: string): { cleanText: string, action?: SearchAction } => {
    const marker = "[SEARCH_ACTION]";
    if (!text.includes(marker)) return { cleanText: text };
    const parts = text.split(marker);
    const cleanText = parts[0].trim();
    try {
      const action = JSON.parse(parts[1].trim()) as SearchAction;
      return { cleanText, action };
    } catch {
      return { cleanText };
    }
  };

  const executeSearch = (action: SearchAction) => {
    const params = new URLSearchParams();
    if (action.type) params.set("type", action.type);
    if (action.search) params.set("search", action.search);
    if (action.wilaya) params.set("wilaya", action.wilaya);
    navigate(`/explore?${params.toString()}`);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col items-end gap-3">
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.92 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? "64px" : "480px"
            }}
            exit={{ opacity: 0, y: 16, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="w-[88vw] sm:w-[360px] bg-background/96 backdrop-blur-2xl border border-border/40 rounded-3xl shadow-[0_16px_48px_rgba(0,0,0,0.18)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 flex items-center justify-between bg-gradient-to-r from-[#FF4F5A]/5 to-purple-500/5 border-b border-border/10 shrink-0">
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
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded-full transition-colors"
                >
                  {isMinimized ? <ChevronDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto px-4 py-4 space-y-3 custom-scrollbar"
                >
                  {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-3 px-2">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF4F5A]/10 to-purple-600/10 flex items-center justify-center">
                        <Sparkles className="w-7 h-7 text-[#FF4F5A]" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-black tracking-tight">Salam !</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Pose-moi une question sur Karrily ou cherche un objet.
                        </p>
                      </div>
                    </div>
                  )}

                  {messages.map((msg, idx) => {
                    const { cleanText, action } = parseSearchAction(msg.content);
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "flex gap-2",
                          msg.role === "user" ? "flex-row-reverse" : "flex-row"
                        )}
                      >
                        {/* Avatar */}
                        <div className={cn(
                          "w-7 h-7 rounded-full shrink-0 flex items-center justify-center shadow-sm mt-0.5",
                          msg.role === "user" ? "bg-muted text-muted-foreground" : "bg-[#FF4F5A] text-white"
                        )}>
                          {msg.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                        </div>

                        {/* Bubble + Action */}
                        <div className={cn("space-y-2 max-w-[78%]", msg.role === "user" && "items-end flex flex-col")}>
                          <div className={cn(
                            "px-3 py-2 rounded-2xl text-xs leading-relaxed",
                            msg.role === "user" 
                              ? "bg-foreground text-background rounded-tr-sm" 
                              : "bg-muted/60 border border-border/20 rounded-tl-sm"
                          )}>
                            {cleanText}
                          </div>
                          
                          {action && (
                            <motion.button
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => executeSearch(action)}
                              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-full text-[11px] font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all"
                            >
                              <Search className="w-3 h-3" />
                              Voir les résultats
                              <ArrowRight className="w-3 h-3" />
                            </motion.button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}

                  {isLoading && (
                    <div className="flex gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#FF4F5A] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#FF4F5A]/20">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                      <div className="bg-muted/60 px-3 py-2 rounded-2xl rounded-tl-sm border border-border/20 flex items-center gap-2">
                        <Loader2 className="w-3 h-3 animate-spin text-[#FF4F5A]" />
                        <span className="text-[10px] font-bold text-muted-foreground">Réflexion...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="px-3 py-3 bg-background border-t border-border/10">
                  <div className="relative">
                    <input 
                      type="text"
                      placeholder="Ta question..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      className="w-full bg-muted/30 border border-border/40 rounded-2xl py-3 pl-4 pr-12 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF4F5A]/20 focus:border-[#FF4F5A] transition-all"
                    />
                    <button 
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      className={cn(
                        "absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl flex items-center justify-center transition-all",
                        input.trim() && !isLoading 
                          ? "bg-[#FF4F5A] text-white shadow-md shadow-[#FF4F5A]/30" 
                          : "bg-muted text-muted-foreground opacity-40"
                      )}
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Bubble */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          setIsOpen(true);
          setIsMinimized(false);
          setShowBadge(false);
        }}
        className={cn(
          "relative w-14 h-14 rounded-full bg-gradient-to-br from-[#FF4F5A] to-purple-600 text-white flex items-center justify-center shadow-[0_8px_32px_rgba(255,79,90,0.4)] group overflow-hidden transition-all duration-300",
          isOpen && "scale-0 rotate-90 pointer-events-none"
        )}
      >
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
        <MessageSquare className="w-6 h-6 relative z-10" />
        {showBadge && (
          <span className="absolute top-1.5 right-1.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background animate-pulse" />
        )}
      </motion.button>
    </div>
  );
}
