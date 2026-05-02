import { useState, useEffect } from 'react';

const HISTORY_KEY = 'karrily_user_history';
const MAX_HISTORY_LENGTH = 50; // Keep track of the last 50 visited items

interface HistoryItem {
  itemId: string;
  categoryId: string;
  timestamp: number;
}

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Failed to load history from localStorage', err);
    }
  }, []);

  const addVisit = (itemId: string, categoryId: string) => {
    setHistory((prev) => {
      const newVisit: HistoryItem = { itemId, categoryId, timestamp: Date.now() };
      // Remove previous visits to the same item, keep only the latest
      let updated = prev.filter((item) => item.itemId !== itemId);
      updated.unshift(newVisit);
      // Cap at MAX_HISTORY_LENGTH
      if (updated.length > MAX_HISTORY_LENGTH) {
        updated = updated.slice(0, MAX_HISTORY_LENGTH);
      }
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save history to localStorage', err);
      }
      return updated;
    });
  };

  /**
   * Returns an array of category IDs, sorted by the number of visits in the history.
   * Useful for querying items in the most frequently visited categories.
   */
  const getRecommendedCategoryIds = (): string[] => {
    const categoryCounts: Record<string, number> = {};
    history.forEach((item) => {
      categoryCounts[item.categoryId] = (categoryCounts[item.categoryId] || 0) + 1;
    });

    return Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1]) // Sort by count descending
      .map(([categoryId]) => categoryId);
  };

  return { history, addVisit, getRecommendedCategoryIds };
}
