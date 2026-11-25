import { useCallback, useEffect, useState } from 'react';

/**
 * Provides smooth, compositor-friendly scroll effects for any scrollable container:
 * - Callback ref attaches reliably even when scroll containers mount conditionally
 * - Observes ALL direct children + DOM mutations so dynamic card expansions update overflow/progress
 * - `isScrolled`: true once scrolled past 10px (drives sticky Liquid Crystal header elevation/shrink)
 * - `scrollProgress`: 0..1 normalized progress (drives luminous hairline indicator)
 * - `hasOverflow`: true when content exceeds viewport height
 * - `parallaxY`: subtle pixel offset for ambient backdrop orbs (0 under reduced motion)
 * - `resetScroll`: scrolls back to top cleanly when switching views/tabs
 * - Progressive enhancement fallback via IntersectionObserver when CSS `animation-timeline: view()` is unsupported
 */
export function useScrollEffects(deps = []) {
  const [scrollNode, setScrollNode] = useState(null);
  const [scrollState, setScrollState] = useState({
    isScrolled: false,
    scrollProgress: 0,
    hasOverflow: false,
    parallaxY: 0,
  });

  const scrollRef = useCallback((node) => {
    setScrollNode(node);
  }, []);

  const resetScroll = useCallback(() => {
    if (!scrollNode) return;
    if (typeof scrollNode.scrollTo === 'function') {
      scrollNode.scrollTo({ top: 0, behavior: 'instant' });
    }
    scrollNode.scrollTop = 0;
  }, [scrollNode]);

  useEffect(() => {
    const el = scrollNode;
    if (!el) {
      setScrollState({
        isScrolled: false,
        scrollProgress: 0,
        hasOverflow: false,
        parallaxY: 0,
      });
      return;
    }

    const motionQuery =
      typeof window !== 'undefined' && window.matchMedia
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : null;
    let prefersReducedMotion = Boolean(motionQuery?.matches);

    let rafId = null;

    const measure = () => {
      rafId = null;
      const maxScroll = Math.max(0, el.scrollHeight - el.clientHeight);
      const hasOverflow = maxScroll > 8;
      const top = el.scrollTop;
      const progress = hasOverflow ? Math.min(1, Math.max(0, top / maxScroll)) : 0;
      const isScrolled = top > 10;
      const parallaxY = prefersReducedMotion ? 0 : Math.round(progress * -38 * 10) / 10;

      setScrollState((prev) => {
        if (
          prev.isScrolled === isScrolled &&
          prev.hasOverflow === hasOverflow &&
          Math.abs(prev.scrollProgress - progress) < 0.004 &&
          Math.abs(prev.parallaxY - parallaxY) < 0.4
        ) {
          return prev;
        }
        return { isScrolled, scrollProgress: progress, hasOverflow, parallaxY };
      });
    };

    const scheduleMeasure = () => {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(measure);
      }
    };

    const handleMotionChange = (event) => {
      prefersReducedMotion = event.matches;
      scheduleMeasure();
    };
    motionQuery?.addEventListener?.('change', handleMotionChange);

    measure();
    el.addEventListener('scroll', scheduleMeasure, { passive: true });

    let resizeObserver;
    const resizeObserved = new Set();
    const syncResizeChildren = () => {
      if (!resizeObserver) return;
      Array.from(el.children).forEach((child) => {
        if (!resizeObserved.has(child)) {
          resizeObserver.observe(child);
          resizeObserved.add(child);
        }
      });
    };

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(scheduleMeasure);
      resizeObserver.observe(el);
      syncResizeChildren();
    }

    // Fallback scroll-reveal via IntersectionObserver ONLY when native CSS view() timeline is unsupported
    const supportsViewTimeline =
      typeof window !== 'undefined' &&
      window.CSS?.supports?.('(animation-timeline: view()) and (animation-range: entry)');

    let intersectionObserver;
    const ioObserved = new Set();

    const syncRevealNodes = () => {
      if (!intersectionObserver) return;
      const containerRect = el.getBoundingClientRect();
      el.querySelectorAll('.scroll-reveal-card, .scroll-reveal-tall').forEach((node) => {
        if (ioObserved.has(node)) return;
        ioObserved.add(node);
        const rect = node.getBoundingClientRect();
        const initiallyVisible =
          rect.top < containerRect.bottom && rect.bottom > containerRect.top;
        if (!initiallyVisible) {
          node.classList.add('scroll-reveal-io-pending');
        } else {
          node.classList.add('scroll-reveal-io-visible');
        }
        intersectionObserver.observe(node);
      });
    };

    if (
      !supportsViewTimeline &&
      !prefersReducedMotion &&
      typeof IntersectionObserver !== 'undefined'
    ) {
      intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.remove('scroll-reveal-io-pending');
              entry.target.classList.add('scroll-reveal-io-visible');
            }
          });
        },
        { root: el, threshold: 0.08 }
      );
      syncRevealNodes();
    }

    let mutationObserver;
    if (typeof MutationObserver !== 'undefined') {
      mutationObserver = new MutationObserver(() => {
        syncResizeChildren();
        syncRevealNodes();
        scheduleMeasure();
      });
      mutationObserver.observe(el, { childList: true, subtree: true });
    }

    return () => {
      el.removeEventListener('scroll', scheduleMeasure);
      motionQuery?.removeEventListener?.('change', handleMotionChange);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      if (resizeObserver) resizeObserver.disconnect();
      if (mutationObserver) mutationObserver.disconnect();
      if (intersectionObserver) {
        intersectionObserver.disconnect();
        ioObserved.forEach((node) => {
          node.classList.remove('scroll-reveal-io-pending', 'scroll-reveal-io-visible');
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollNode, ...deps]);

  return { scrollRef, resetScroll, ...scrollState };
}
