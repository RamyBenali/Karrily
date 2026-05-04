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
      if (response.error) {
          throw new Error(response.error);
      }
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
      const actionJson = parts[1].trim();
      const action = JSON.parse(actionJson) as SearchAction;
      return { cleanText, action };
    } catch (e) {
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
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-4">
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9, transformOrigin: "bottom right" }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? "80px" : "600px"
            }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={cn(
              "w-[90vw] sm:w-[400px] bg-background/95 backdrop-blur-3xl border border-border/50 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden transition-all duration-500",
              isMinimized && "rounded-[2rem]"
            )}
          >
            {/* Header */}
            <div className="p-6 flex items-center justify-between bg-gradient-to-r from-[#FF4F5A]/5 to-purple-500/5 border-b border-border/10 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF4F5A] to-purple-600 flex items-center justify-center text-white shadow-lg shadow-[#FF4F5A]/20">
                  <Bot className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight">Assistant Karrily</h3>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-70">IA Active</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-muted rounded-full transition-colors"
                >
                  {isMinimized ? <ChevronDown className="w-5 h-5" /> : <Minus className="w-5 h-5" />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages Container */}
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
                >
                  {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-6 px-4">
                      <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-[#FF4F5A]/10 to-purple-600/10 flex items-center justify-center">
                        <Sparkles className="w-10 h-10 text-[#FF4F5A]" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-lg font-black tracking-tight">Salam !</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Je suis ton assistant personnel. Pose-moi n'importe quelle question sur la plateforme ou cherche un objet.
                        </p>
                      </div>
                    </div>
                  )}

                  {messages.map((msg, idx) => {
                    const { cleanText, action } = parseSearchAction(msg.content);
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "flex gap-3",
                          msg.role === "user" ? "flex-row-reverse" : "flex-row"
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-xs font-bold shadow-sm",
                          msg.role === "user" ? "bg-muted text-muted-foreground" : "bg-[#FF4F5A] text-white"
                        )}>
                          {msg.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                        </div>
                        <div className="space-y-3 max-w-[80%]">
                          <div className={cn(
                            "p-5 rounded-[2rem] text-sm leading-relaxed shadow-sm",
                            msg.role === "user" 
                              ? "bg-foreground text-background rounded-tr-none shadow-sm" 
                              : "bg-muted/50 border border-border/20 rounded-tl-none"
                          )}>
                            {cleanText}
                          </div>
                          
                          {action && (
                            <motion.button
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => executeSearch(action)}
                              className="flex items-center gap-3 px-8 py-5 bg-emerald-500 text-white rounded-full text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all"
                            >
                              <Search className="w-4 h-4" />
                              Voir les résultats
                              <ArrowRight className="w-4 h-4" />
                            </motion.button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}

                  {isLoading && (
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#FF4F5A] text-white flex items-center justify-center shrink-0 shadow-lg shadow-[#FF4F5A]/20">
                        <Bot className="w-5 h-5" />
                      </div>
                      <div className="bg-muted/50 p-4 rounded-[1.5rem] rounded-tl-none border border-border/30 flex items-center gap-3">
                        <Loader2 className="w-4 h-4 animate-spin text-[#FF4F5A]" />
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Réflexion...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div className="p-6 bg-background border-t border-border/10">
                  <div className="relative">
                    <input 
                      type="text"
                      placeholder="Ta question..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      className="w-full bg-muted/30 border border-border/50 rounded-2xl py-5 pl-6 pr-16 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF4F5A]/20 focus:border-[#FF4F5A] transition-all"
                    />
                    <button 
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      className={cn(
                        "absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-xl flex items-center justify-center transition-all",
                        input.trim() && !isLoading 
                          ? "bg-[#FF4F5A] text-white shadow-lg shadow-[#FF4F5A]/30 scale-100" 
                          : "bg-muted text-muted-foreground scale-90 opacity-40"
                      )}
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bubble Button - Perfectly Round & Premium */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          setIsOpen(true);
          setIsMinimized(false);
          setShowBadge(false);
        }}
        className={cn(
          "relative w-16 h-16 rounded-full bg-gradient-to-br from-[#FF4F5A] to-purple-600 text-white flex items-center justify-center shadow-[0_10px_40px_rgba(255,79,90,0.4)] group overflow-hidden transition-all duration-500",
          isOpen && "scale-0 rotate-90"
        )}
      >
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        <MessageSquare className="w-8 h-8 relative z-10" />
        
        {showBadge && (
          <span className="absolute top-2 right-2 w-4 h-4 bg-emerald-500 rounded-full border-2 border-background animate-pulse" />
        )}
      </motion.button>
    </div>
  );
}
