import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useHistory } from '../../hooks/useHistory';
import { useTranslation } from '../../context/language-context';
import { motion } from 'motion/react';
import { Sparkles, MapPin, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router';

export function NexusRecommendations() {
  const { getRecommendedCategoryIds } = useHistory();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      const topCategories = getRecommendedCategoryIds();
      
      if (topCategories.length === 0) {
        setIsLoading(false);
        return; // No history yet
      }

      try {
        // Fetch top 6 items from the most visited categories
        const { data, error } = await supabase
          .from('items')
          .select('id, title, thumbnail_url, price_per_day, location, listing_type, category_id')
          .in('category_id', topCategories.slice(0, 3))
          .eq('is_available', true)
          .order('created_at', { ascending: false })
          .limit(6);

        if (error) throw error;
        setItems(data || []);
      } catch (err) {
        console.error('Failed to fetch recommendations', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF4F5A]" />
      </div>
    );
  }

  if (items.length === 0) {
    return null; // Don't show the section if there's no history/items
  }

  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-purple-500" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Recommandé pour vous</h2>
      </div>

      <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex-shrink-0 w-[280px] bg-card rounded-2xl border border-border overflow-hidden group cursor-pointer hover:shadow-xl transition-all"
            onClick={() => navigate(`/item/${item.id}`)}
          >
            <div className="aspect-[4/3] relative overflow-hidden bg-muted">
              <img 
                src={item.thumbnail_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'} 
                alt={item.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-black">
                {item.listing_type}
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-bold text-lg line-clamp-1 mb-1">{item.title}</h3>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                <MapPin className="w-3 h-3" /> {item.location}
              </div>
              <div className="font-black text-[#FF4F5A] text-lg">
                {item.price_per_day} {t("common.da")} <span className="text-sm font-normal text-muted-foreground">/ j</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
