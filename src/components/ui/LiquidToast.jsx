import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const containerRef = useRef(null);
  const timersRef = useRef(new Map());

  const removeToast = useCallback((id) => {
    const existingTimer = timersRef.current.get(id);
    if (existingTimer) {
      clearTimeout(existingTimer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback(
    (message, variant = 'info', duration = 3400) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => {
        const next = [...prev, { id, message, variant }];
        // Clean up timer for any evicted oldest toast when capping at 3
        if (next.length > 3) {
          const evicted = next.slice(0, next.length - 3);
          evicted.forEach((t) => {
            const timer = timersRef.current.get(t.id);
            if (timer) {
              clearTimeout(timer);
              timersRef.current.delete(t.id);
            }
          });
          return next.slice(-3);
        }
        return next;
      });
      if (duration > 0) {
        const timerId = setTimeout(() => removeToast(id), duration);
        timersRef.current.set(id, timerId);
      }
      return id;
    },
    [removeToast]
  );

  // Clear all pending timers on unmount
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timerId) => clearTimeout(timerId));
      timers.clear();
    };
  }, []);

  // Promote toast layer into browser Top Layer via popover="manual" when supported,
  // ensuring notifications paint ABOVE native <dialog> modals and their ::backdrop.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (typeof HTMLElement === 'undefined' || !Object.hasOwn(HTMLElement.prototype, 'popover')) {
      return;
    }

    if (!el.hasAttribute('popover')) {
      el.setAttribute('popover', 'manual');
    }

    try {
      if (toasts.length > 0) {
        if (el.matches(':popover-open')) {
          el.hidePopover();
        }
        el.showPopover();
      } else if (el.matches(':popover-open')) {
        el.hidePopover();
      }
    } catch {
      // Fallback to standard fixed z-[90] positioning
    }
  }, [toasts]);

  const api = useMemo(
    () => ({
      show: pushToast,
      success: (msg, duration) => pushToast(msg, 'success', duration),
      error: (msg, duration) => pushToast(msg, 'error', duration),
      info: (msg, duration) => pushToast(msg, 'info', duration),
    }),
    [pushToast]
  );

  const styles = {
    success: {
      ring: 'border-emerald-400/45 text-emerald-100',
      icon: <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />,
    },
    error: {
      ring: 'border-rose-400/50 text-rose-100',
      icon: <AlertCircle size={18} className="text-rose-400 shrink-0" />,
    },
    info: {
      ring: 'border-sky-400/45 text-sky-100',
      icon: <Info size={18} className="text-sky-400 shrink-0" />,
    },
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        ref={containerRef}
        aria-live="polite"
        aria-atomic="true"
        className="liquid-toast-layer"
      >
        {toasts.map((toast) => {
          const variantStyle = styles[toast.variant] || styles.info;
          return (
            <div
              key={toast.id}
              role="status"
              className={`pointer-events-auto w-full liquid-glass-modal rounded-2xl px-4 py-3 flex items-center gap-3 animate-modal-pop ${variantStyle.ring}`}
            >
              {variantStyle.icon}
              <p className="text-sm font-semibold leading-snug flex-1">{toast.message}</p>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                aria-label="Descartar notificación"
                className="text-slate-400 hover:text-white p-1 rounded-full transition-colors"
              >
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      show: (m) => console.info(m),
      success: (m) => console.info(m),
      error: (m) => console.error(m),
      info: (m) => console.info(m),
    };
  }
  return ctx;
};
