import { motion, AnimatePresence } from "motion/react";
import { LucideIcon, Menu, X, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../ui/utils";

interface SidebarItem {
  id: string;
  icon: LucideIcon;
  label: string;
  badge?: number;
}

interface DashboardSidebarProps {
  items: SidebarItem[];
  activeTab: string;
  setActiveTab: (tab: any) => void;
  userInitials: string;
  userFullName: string;
  userEmail: string;
  userAvatar?: string | null;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  extraAction?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "destructive" | "premium";
  };
  className?: string;
}

export function DashboardSidebar({
  items,
  activeTab,
  setActiveTab,
  userInitials,
  userFullName,
  userEmail,
  userAvatar,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  extraAction,
  className
}: DashboardSidebarProps) {
  return (
    <>
      {/* Mobile Menu Trigger */}
      <div className="lg:hidden mb-6">
        <div className="bg-card/80 backdrop-blur-xl rounded-2xl p-4 shadow-md border border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-[#FF4F5A]/40 ring-offset-2 ring-offset-background">
                {userAvatar ? (
                  <img src={userAvatar} alt={userFullName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#FF4F5A] to-[#0F2A2E] flex items-center justify-center text-white font-bold text-sm">
                    {userInitials}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-sm truncate max-w-[120px]">{userFullName}</h3>
              <p className="text-xs text-muted-foreground">{activeTab}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-foreground hover:bg-muted rounded-full"
          >
            <motion.div animate={{ rotate: isMobileMenuOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.div>
          </Button>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden mt-2 z-50 relative"
            >
              <div className="bg-card/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-border p-3 flex flex-col gap-1">
                {items.map((item, idx) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all relative overflow-hidden",
                      activeTab === item.id
                        ? "bg-gradient-to-r from-[#0F2A2E] to-[#1A4851] text-white shadow-lg"
                        : "text-foreground/70 hover:text-foreground hover:bg-muted/60"
                    )}
                  >
                    <div className={cn(
                      "p-1.5 rounded-lg transition-colors",
                      activeTab === item.id ? "bg-white/15" : "bg-muted/80"
                    )}>
                      <item.icon className={cn("w-4 h-4", activeTab === item.id ? "text-white" : "text-[#FF4F5A]")} />
                    </div>
                    <span>{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <span className="ml-auto bg-[#FF4F5A] text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                        {item.badge > 9 ? "9+" : item.badge}
                      </span>
                    )}
                  </motion.button>
                ))}
                {extraAction && (
                  <div className="mt-2 pt-3 border-t border-border">
                    <Button
                      onClick={extraAction.onClick}
                      className={cn(
                        "w-full rounded-xl font-bold text-sm",
                        extraAction.variant === "destructive" ? "bg-red-500 hover:bg-red-600 text-white" :
                        extraAction.variant === "premium" ? "bg-gradient-to-r from-[#FF4F5A] to-[#FF6B74] text-white hover:shadow-lg shadow-[#FF4F5A]/20" :
                        "bg-[#0F2A2E] hover:bg-[#1A4851] text-white"
                      )}
                    >
                      {extraAction.label}
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop Sidebar */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={cn("hidden lg:block lg:col-span-3", className)}
      >
        <div className="bg-card/60 backdrop-blur-2xl rounded-3xl shadow-2xl border border-border/50 sticky top-28 overflow-hidden">
          {/* Top accent gradient line */}
          <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#FF4F5A]/60 to-transparent" />
          
          <div className="p-8">
            {/* User Info */}
            <div className="flex flex-col items-center text-center pb-7 mb-7 border-b border-border/40">
              {/* Avatar */}
              <div className="relative mb-5">
                {/* Animated glow ring */}
                <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-[#FF4F5A]/30 via-transparent to-[#0F2A2E]/30 animate-glow-pulse" />
                <div className="relative">
                  {userAvatar ? (
                    <img
                      src={userAvatar}
                      alt={userFullName}
                      className="w-20 h-20 rounded-full object-cover ring-2 ring-background shadow-xl"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gradient-to-br from-[#FF4F5A] to-[#0F2A2E] rounded-full flex items-center justify-center text-white text-2xl font-black shadow-xl ring-2 ring-background">
                      {userInitials}
                    </div>
                  )}
                  {/* Online indicator */}
                  <div className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-background shadow-sm">
                    <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-60" />
                  </div>
                </div>
              </div>
              
              <div className="max-w-full">
                <h3 className="font-bold text-base text-foreground truncate px-2">
                  {userFullName}
                </h3>
                <p className="text-xs text-muted-foreground truncate px-2 mt-0.5 opacity-60">{userEmail}</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
              {items.map((item, idx) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.3 }}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-200 relative group/item overflow-hidden",
                    activeTab === item.id
                      ? "bg-gradient-to-r from-[#0F2A2E] to-[#1A4851] text-white shadow-lg shadow-[#0F2A2E]/20"
                      : "text-foreground/60 hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  {/* Active left indicator */}
                  {activeTab === item.id && (
                    <motion.div
                      layoutId="sidebar-active-bar"
                      className="sidebar-active-indicator"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}

                  <div className={cn(
                    "p-2 rounded-xl transition-all duration-200 flex-shrink-0",
                    activeTab === item.id
                      ? "bg-white/15"
                      : "bg-muted/60 group-hover/item:bg-background group-hover/item:shadow-sm"
                  )}>
                    <item.icon className={cn(
                      "w-4 h-4 transition-colors",
                      activeTab === item.id ? "text-white" : "text-[#FF4F5A]"
                    )} />
                  </div>
                  
                  <span className="font-semibold text-sm tracking-tight flex-1 text-left">{item.label}</span>
                  
                  {item.badge && item.badge > 0 ? (
                    <span className="bg-[#FF4F5A] text-white text-[9px] font-black rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  ) : (
                    <ChevronRight className={cn(
                      "w-3.5 h-3.5 transition-all duration-200 flex-shrink-0",
                      activeTab === item.id ? "text-white/60 translate-x-0.5" : "text-foreground/20 group-hover/item:text-foreground/40"
                    )} />
                  )}
                </motion.button>
              ))}
            </nav>

            {extraAction && (
              <div className="mt-6 pt-5 border-t border-border/40">
                <Button
                  onClick={extraAction.onClick}
                  className={cn(
                    "w-full h-11 rounded-2xl font-bold text-sm transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-md",
                    extraAction.variant === "destructive"
                      ? "bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/30 shadow-none"
                      : extraAction.variant === "premium"
                      ? "bg-gradient-to-r from-[#FF4F5A] to-[#FF6B74] text-white shadow-lg shadow-[#FF4F5A]/25"
                      : "bg-gradient-to-r from-[#0F2A2E] to-[#1A4851] text-white shadow-lg shadow-[#0F2A2E]/20"
                  )}
                >
                  {extraAction.variant === "premium" && <Sparkles className="w-4 h-4 mr-2" />}
                  {extraAction.label}
                </Button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}
