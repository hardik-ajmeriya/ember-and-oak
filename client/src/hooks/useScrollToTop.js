import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Resets scroll on route change — React Router does not do this by default. */
export default function useScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }, [pathname]);
}
