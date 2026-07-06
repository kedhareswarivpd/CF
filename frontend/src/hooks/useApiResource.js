import { useEffect, useState } from 'react';

/**
 * @param {() => Promise<{data: any[]}>} fetchFn  API call returning the backend envelope
 * @param {(item: any) => any} adapt               maps one backend record to the shape components expect
 * @param {any[]} fallbackData                      already-adapted demo data, used on error or empty results
 * @param {any[]} deps                               effect dependencies (e.g. active filter)
 */
export default function useApiResource(fetchFn, adapt, fallbackData, deps = []) {
  const [state, setState] = useState({
    items: fallbackData,
    loading: true,
    error: null,
    isFallback: true,
  });

  useEffect(() => {
    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    fetchFn()
      .then((payload) => {
        if (cancelled) return;
        const records = payload?.data ?? [];
        if (records.length === 0) {
          setState({ items: fallbackData, loading: false, error: null, isFallback: true });
        } else {
          setState({ items: records.map(adapt), loading: false, error: null, isFallback: false });
        }
      })
      .catch((error) => {
        if (cancelled) return;
        // eslint-disable-next-line no-console
        console.warn('[CoreFusion] Falling back to demo data:', error.message);
        setState({ items: fallbackData, loading: false, error, isFallback: true });
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
