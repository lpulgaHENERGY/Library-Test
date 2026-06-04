/**
 * useLibraryItems — React hook for the lpulga_libraryitem table.
 *
 * Fetches all library items on mount (single paginated call, default 50 items).
 * Returns { items, loading, error } — compatible with React 16's useState/useEffect.
 *
 * The hook does NOT handle client-side filtering; that responsibility stays in
 * Catalog.tsx where the URL query param `q` drives the useMemo filter.
 */

import { useState, useEffect } from 'react';
import { LibraryItem } from '../../types/libraryItem';
import { getLibraryItems } from '../services/libraryItemService';

export interface UseLibraryItemsResult {
  /** Fetched library items, empty array while loading or on error. */
  items: LibraryItem[];
  /** True while the initial fetch is in flight. */
  loading: boolean;
  /** Human-readable error message, or null when there is no error. */
  error: string | null;
}

/**
 * Fetches the full catalog of library items from the Power Pages Web API.
 *
 * Usage:
 *   const { items, loading, error } = useLibraryItems();
 */
export function useLibraryItems(): UseLibraryItemsResult {
  const [items, setItems]     = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    // cancelled flag prevents state updates after the component unmounts
    let cancelled = false;

    async function load(): Promise<void> {
      try {
        setLoading(true);
        setError(null);

        const page = await getLibraryItems({ pageSize: 50 });

        if (!cancelled) {
          setItems(page.items);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to load library items. Please try again.',
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    // void suppresses the "floating promise" TypeScript warning;
    // useEffect callbacks must return void | cleanup, not Promise.
    void load();

    return () => {
      cancelled = true;
    };
  }, []); // empty deps — fetch once on mount

  return { items, loading, error };
}
