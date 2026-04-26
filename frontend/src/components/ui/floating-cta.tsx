import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { ArrowUp, MessageCircle, HelpCircle, Sparkles } from "lucide-react";
import { Button } from "./button";

export function FloatingCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-3 items-end">
          {/* Menu items */}
          <AnimatePresence>
            {isMenuOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.8 }}
                  transition={{ delay: 0 }}
                >
                  <button className="flex items-center gap-3 bg-white hover:bg-gray-50 rounded-full px-4 py-3 shadow-lg hover:shadow-xl transition-all group">
                    <span className="text-sm font-medium text-gray-700">Help Center</span>
                    <div className="w-10 h-10 bg-[#0F2A2E] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <HelpCircle className="w-5 h-5 text-white" />
                    </div>
                  </button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.8 }}
                  transition={{ delay: 0.05 }}
                >
                  <button className="flex items-center gap-3 bg-white hover:bg-gray-50 rounded-full px-4 py-3 shadow-lg hover:shadow-xl transition-all group">
                    <span className="text-sm font-medium text-gray-700">Chat with us</span>
                    <div className="w-10 h-10 bg-[#FF4F5A] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                  </button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.8 }}
                  transition={{ delay: 0.1 }}
                >
                  <button 
                    onClick={scrollToTop}
                    className="flex items-center gap-3 bg-white hover:bg-gray-50 rounded-full px-4 py-3 shadow-lg hover:shadow-xl transition-all group"
                  >
                    <span className="text-sm font-medium text-gray-700">Back to top</span>
                    <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ArrowUp className="w-5 h-5 text-white" />
                    </div>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Main CTA button */}
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="relative w-14 h-14 bg-gradient-to-br from-[#FF4F5A] to-[#FF6B74] rounded-full shadow-2xl shadow-[#FF4F5A]/50 hover:shadow-[#FF4F5A]/70 flex items-center justify-center group hover:scale-110 transition-all"
          >
            <motion.div
              animate={{ rotate: isMenuOpen ? 45 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <Sparkles className="w-6 h-6 text-white" />
            </motion.div>

            {/* Pulse animation ring */}
            <motion.div
              className="absolute inset-0 rounded-full bg-[#FF4F5A]"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 0, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.button>
        </div>
      )}
    </AnimatePresence>
  );
}
