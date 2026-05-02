import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHistory } from './useHistory';

describe('useHistory', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with empty history', () => {
    const { result } = renderHook(() => useHistory());
    expect(result.current.history).toEqual([]);
    expect(result.current.getRecommendedCategoryIds()).toEqual([]);
  });

  it('should add a visit and limit to max length', () => {
    const { result } = renderHook(() => useHistory());

    act(() => {
      result.current.addVisit('item1', 'cat1');
    });

    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0].itemId).toBe('item1');
    expect(result.current.history[0].categoryId).toBe('cat1');

    act(() => {
      result.current.addVisit('item2', 'cat2');
    });

    expect(result.current.history).toHaveLength(2);
    // newest should be first
    expect(result.current.history[0].itemId).toBe('item2');
    expect(result.current.history[1].itemId).toBe('item1');
  });

  it('should remove previous visits to the same item', () => {
    const { result } = renderHook(() => useHistory());

    act(() => {
      result.current.addVisit('item1', 'cat1');
      result.current.addVisit('item2', 'cat2');
      result.current.addVisit('item1', 'cat1'); // revisit item 1
    });

    expect(result.current.history).toHaveLength(2);
    expect(result.current.history[0].itemId).toBe('item1');
    expect(result.current.history[1].itemId).toBe('item2');
  });

  it('should sort categories by most visited', () => {
    const { result } = renderHook(() => useHistory());

    act(() => {
      result.current.addVisit('item1', 'cat_books');
      result.current.addVisit('item2', 'cat_electronics');
      result.current.addVisit('item3', 'cat_books');
      result.current.addVisit('item4', 'cat_books');
      result.current.addVisit('item5', 'cat_clothing');
      result.current.addVisit('item6', 'cat_clothing');
    });

    // Books: 3, Clothing: 2, Electronics: 1
    const recommended = result.current.getRecommendedCategoryIds();
    expect(recommended).toEqual(['cat_books', 'cat_clothing', 'cat_electronics']);
  });
});
