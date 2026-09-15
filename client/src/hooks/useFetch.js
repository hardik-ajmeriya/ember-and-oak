import { useCallback, useEffect, useState } from 'react';
import api from '../lib/api.js';

/**
 * Small data-fetching hook: handles loading, errors and refetching,
 * and ignores responses that arrive after the component unmounts.
 */
export default function useFetch(url, { skip = false, deps = [] } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState(null);
  const [nonce, setNonce] = useState(0);

  const refetch = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    if (skip || !url) return undefined;

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    api
      .get(url, { signal: controller.signal })
      .then((res) => setData(res.data))
      .catch((err) => {
        if (err.name !== 'CanceledError') setError(err.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, skip, nonce, ...deps]);

  return { data, loading, error, refetch };
}
