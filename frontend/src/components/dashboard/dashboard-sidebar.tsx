import { motion, AnimatePresence } from "motion/react";
import { LucideIcon, Menu, X, ChevronRight, LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../ui/utils";

interface SidebarItem {
  icon: LucideIcon;
  label: string;
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
        <div className="bg-card/80 backdrop-blur-xl rounded-2xl p-4 shadow-sm border border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#0F2A2E] to-[#1A4851] rounded-full flex items-center justify-center text-white font-bold">
              {userAvatar ? (
                <img src={userAvatar} alt={userFullName} className="w-full h-full rounded-full object-cover" />
              ) : (
                userInitials
              )}
            </div>
            <div>
              <h3 className="font-bold text-foreground text-sm truncate max-w-[120px]">{userFullName || "Utilisateur"}</h3>
              <p className="text-xs text-muted-foreground">{activeTab}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-foreground hover:bg-muted rounded-full"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-2 z-50 relative"
            >
              <div className="bg-card/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-border p-4 flex flex-col gap-2">
                {items.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      setActiveTab(item.label);
                      setIsMobileMenuOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                      activeTab === item.label
                        ? "bg-[#0F2A2E] text-white shadow-lg"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </button>
                ))}
                {extraAction && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <Button
                      onClick={extraAction.onClick}
                      className={cn(
                        "w-full rounded-xl font-bold",
                        extraAction.variant === "destructive" ? "bg-red-500 hover:bg-red-600" : 
                        extraAction.variant === "premium" ? "bg-gradient-to-r from-[#FF4F5A] to-[#FF6B74] hover:shadow-lg shadow-[#FF4F5A]/20" :
                        "bg-[#FF4F5A] hover:bg-[#FF4F5A]/90"
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
        className={cn("hidden lg:block lg:col-span-3", className)}
      >
        <div className="bg-card/40 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl border border-border/50 sticky top-28 overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FF4F5A]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          {/* User Info */}
          <div className="flex flex-col items-center text-center pb-8 mb-8 border-b border-border/50">
            <div className="relative mb-4">
              <div className="absolute -inset-1 bg-gradient-to-br from-[#FF4F5A] to-[#0F2A2E] rounded-full opacity-20 blur-sm group-hover:opacity-40 transition-opacity" />
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userFullName}
                  className="relative w-20 h-20 rounded-full object-cover border-2 border-background shadow-xl"
                />
              ) : (
                <div className="relative w-20 h-20 bg-gradient-to-br from-[#0F2A2E] to-[#1A4851] rounded-full flex items-center justify-center text-white text-2xl font-black shadow-xl border-2 border-background">
                  {userInitials}
                </div>
              )}
            </div>
            <div className="max-w-full">
              <h3 className="font-black text-lg text-foreground truncate px-2">
                {userFullName || "Utilisateur"}
              </h3>
              <p className="text-xs text-muted-foreground truncate px-2 mt-1 opacity-70">{userEmail}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1.5">
            {items.map((item) => (
              <button
                key={item.label}
                onClick={() => setActiveTab(item.label)}
                className={cn(
                  "w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 relative group/item",
                  activeTab === item.label
                    ? "bg-[#0F2A2E] text-white shadow-xl shadow-[#0F2A2E]/20"
                    : "text-foreground/70 hover:text-foreground hover:bg-muted/50"
                )}
              >
                <div className={cn(
                   "p-2 rounded-xl transition-colors",
                   activeTab === item.label ? "bg-white/10" : "bg-muted/50 group-hover/item:bg-background"
                )}>
                  <item.icon className={cn("w-4 h-4", activeTab === item.label ? "text-white" : "text-[#FF4F5A]")} />
                </div>
                <span className="font-bold text-sm tracking-tight">{item.label}</span>
                {activeTab === item.label && (
                   <motion.div 
                     layoutId="sidebar-active"
                     className="absolute right-4 w-1.5 h-1.5 rounded-full bg-[#FF4F5A] shadow-[0_0_10px_#FF4F5A]"
                   />
                )}
              </button>
            ))}
          </nav>

          {extraAction && (
            <div className="mt-8 pt-6 border-t border-border/50">
              <Button
                onClick={extraAction.onClick}
                className={cn(
                  "w-full h-12 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:-translate-y-0.5 active:translate-y-0",
                  extraAction.variant === "destructive" ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20" : 
                  extraAction.variant === "premium" ? "bg-gradient-to-r from-[#FF4F5A] to-[#FF6B74] text-white shadow-xl shadow-[#FF4F5A]/30" :
                  "bg-[#0F2A2E] hover:bg-[#1A4851] text-white shadow-lg shadow-[#0F2A2E]/20"
                )}
              >
                {extraAction.label}
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
