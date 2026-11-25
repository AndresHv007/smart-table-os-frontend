import React, { useEffect, useId, useRef, useCallback } from 'react';
import { X } from 'lucide-react';

let cachedDisplayTransitionSupport;

function canTransitionDisplay() {
  if (cachedDisplayTransitionSupport !== undefined) return cachedDisplayTransitionSupport;
  if (
    typeof window === 'undefined' ||
    !window.CSS?.supports?.('transition-behavior', 'allow-discrete') ||
    !document.body
  ) {
    return false;
  }
  const probe = document.createElement('div');
  probe.style.cssText = 'transition: display 1s allow-discrete !important; display: block;';
  document.body.appendChild(probe);
  window.getComputedStyle(probe).display;
  probe.style.display = 'none';
  cachedDisplayTransitionSupport = window.getComputedStyle(probe).display === 'block';
  probe.remove();
  return cachedDisplayTransitionSupport;
}

function supportsTopLayerExit() {
  return (
    typeof window !== 'undefined' &&
    window.CSS?.supports?.('overlay', 'auto') &&
    canTransitionDisplay()
  );
}

/**
 * Accessible native <dialog> modal styled with the Liquid Crystal frosted glass aesthetic.
 * Follows modern-web-guidance:
 * - Native top-layer showModal(), Esc dismissal, focus management
 * - No redundant role="dialog" or aria-modal
 * - Scroll containment via overflow:hidden + overscroll-behavior:contain on <dialog> & ::backdrop
 * - Smooth @starting-style entry & cross-browser exit animation fallback (Firefox/Safari)
 * - Light-dismiss via closedby="any" + bounding-rect pointer fallback for Safari
 */
const LiquidModal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon = null,
  titleClassName = 'text-white',
  maxWidthClass = 'max-w-md',
  dismissible = true,
  children,
}) => {
  const dialogRef = useRef(null);
  const closingRef = useRef(false);
  const isOpenRef = useRef(isOpen);
  const onCloseRef = useRef(onClose);
  const dismissibleRef = useRef(dismissible);
  const titleId = useId();

  isOpenRef.current = isOpen;
  onCloseRef.current = onClose;
  dismissibleRef.current = dismissible;

  const finishClose = useCallback(async () => {
    const dialog = dialogRef.current;
    if (!dialog || !dialog.open) return;

    if (!supportsTopLayerExit()) {
      if (closingRef.current) return;
      closingRef.current = true;
      dialog.setAttribute('data-closing', '');
      const animations = dialog.getAnimations({ subtree: true });
      if (animations.length > 0) {
        await Promise.race([
          Promise.allSettled(animations.map((a) => a.finished)),
          new Promise((resolve) => setTimeout(resolve, 450)),
        ]);
      }
      // Abort close if the modal was reopened before exit animation settled
      if (!dialog.hasAttribute('data-closing')) {
        closingRef.current = false;
        return;
      }
      dialog.removeAttribute('data-closing');
      closingRef.current = false;
    }

    if (dialog.open) {
      dialog.close();
    }
  }, []);

  // Sync React isOpen prop with native <dialog> top-layer state
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    let focusRafId = null;

    if (isOpen) {
      dialog.removeAttribute('data-closing');
      closingRef.current = false;
      if (!dialog.open) {
        dialog.showModal();
        const focusTarget = dialog.querySelector(
          '[data-autofocus], input:not([disabled]):not([type="hidden"]), [autofocus]'
        );
        if (focusTarget && typeof focusTarget.focus === 'function') {
          focusRafId = window.requestAnimationFrame(() => focusTarget.focus());
        }
      }
    } else if (dialog.open) {
      finishClose();
    }

    return () => {
      if (focusRafId !== null) {
        window.cancelAnimationFrame(focusRafId);
      }
    };
  }, [isOpen, finishClose]);

  // Attach native cancel/close and Safari light-dismiss fallback once per mount (stable refs)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (event) => {
      event.preventDefault();
      if (!dismissibleRef.current) return;
      onCloseRef.current?.();
    };

    const handleNativeClose = () => {
      dialog.returnValue = '';
      if (isOpenRef.current) {
        if (!dismissibleRef.current) {
          // Guard against forced Esc dismissal on non-dismissible dialogs in older browsers
          try {
            dialog.showModal();
          } catch {
            // ignore if detached
          }
          return;
        }
        onCloseRef.current?.();
      }
    };

    dialog.addEventListener('cancel', handleCancel);
    dialog.addEventListener('close', handleNativeClose);

    let pressedOutside = false;
    const isPointerOutside = (event) => {
      const rect = dialog.getBoundingClientRect();
      return (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      );
    };

    const handlePointerDown = (event) => {
      if (!dismissibleRef.current) return;
      pressedOutside = event.target === dialog && isPointerOutside(event);
    };

    const handlePointerUp = (event) => {
      if (!dismissibleRef.current) return;
      if (pressedOutside && event.target === dialog && isPointerOutside(event)) {
        onCloseRef.current?.();
      }
      pressedOutside = false;
    };

    const supportsClosedBy =
      typeof HTMLDialogElement !== 'undefined' && 'closedBy' in HTMLDialogElement.prototype;

    if (!supportsClosedBy) {
      dialog.addEventListener('pointerdown', handlePointerDown);
      dialog.addEventListener('pointerup', handlePointerUp);
    }

    return () => {
      dialog.removeEventListener('cancel', handleCancel);
      dialog.removeEventListener('close', handleNativeClose);
      if (!supportsClosedBy) {
        dialog.removeEventListener('pointerdown', handlePointerDown);
        dialog.removeEventListener('pointerup', handlePointerUp);
      }
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={title ? titleId : undefined}
      closedby={dismissible ? 'any' : 'none'}
      className={`liquid-glass-modal liquid-dialog rounded-[1.75rem] ${maxWidthClass}`}
    >
      <div className="flex flex-col max-h-[88dvh]">
        {(title || dismissible) && (
          <div className="flex items-start justify-between gap-3 px-6 pt-6 pb-3 relative z-10">
            <div className="min-w-0">
              {title && (
                <h2
                  id={titleId}
                  className={`text-lg sm:text-xl font-black tracking-tight leading-tight flex items-center gap-2.5 ${titleClassName}`}
                >
                  {icon && <span className="shrink-0">{icon}</span>}
                  <span>{title}</span>
                </h2>
              )}
              {subtitle && (
                <p className="text-sm text-slate-300/80 mt-1 leading-relaxed">{subtitle}</p>
              )}
            </div>
            {dismissible && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar diálogo"
                className="liquid-btn liquid-btn-glass shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-slate-300 hover:text-white"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        <div className="px-6 pb-6 pt-2 liquid-scroll relative z-10">{children}</div>
      </div>
    </dialog>
  );
};

export default LiquidModal;
