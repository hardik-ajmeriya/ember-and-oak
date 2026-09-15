import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message, tone = 'success') => {
      const id = crypto.randomUUID?.() ?? String(Date.now() + Math.random());
      setToasts((prev) => [...prev, { id, message, tone }]);
      setTimeout(() => dismiss(id), 5000);
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({ toast: push, success: (m) => push(m, 'success'), error: (m) => push(m, 'error') }),
    [push]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[100] flex w-[min(22rem,calc(100vw-3rem))] flex-col gap-3">
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className={`pointer-events-auto flex items-start gap-3 rounded-none border px-4 py-3 backdrop-blur-md ${
                t.tone === 'error'
                  ? 'border-clay/50 bg-clay/15 text-cream-50'
                  : 'border-brass/40 bg-brass/10 text-cream-50'
              }`}
            >
              {t.tone === 'error' ? (
                <AlertTriangle size={18} className="mt-0.5 shrink-0 text-clay" />
              ) : (
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-brass" />
              )}
              <p className="flex-1 text-sm leading-snug">{t.message}</p>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                className="text-cream-400 transition hover:text-cream-50"
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
};
