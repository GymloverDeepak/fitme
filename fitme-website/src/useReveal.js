import { useEffect, useRef } from 'react';

// Adds the "is-visible" class when the element scrolls into view (subtle fade-up, see styles.css).
// Users who prefer reduced motion get no animation (handled in CSS).
export default function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    if (!('IntersectionObserver' in window)) {
      node.classList.add('is-visible');
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.classList.add('is-visible');
          observer.disconnect();
        }
      },
      { threshold: 0.01, rootMargin: '0px 0px -5% 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return ref;
}
