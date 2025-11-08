import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { scrollToTop, scrollToAnchor, prefersReducedMotion } from '@/utils/smoothScroll';

const SmoothScrollProvider = ({ children, options = {} }) => {
  const location = useLocation();

  const {
    scrollOnRouteChange = true,
    scrollToTopOnRoute = true,
    scrollToAnchorOnRoute = true,
    scrollDelay = 100,
    scrollOffset = 0,
    scrollDuration = 600
  } = options;

  useEffect(() => {
    if (!scrollOnRouteChange) return;

    const handleRouteChange = () => {
      const timer = setTimeout(() => {
        const hash = location.hash;

        if (hash && scrollToAnchorOnRoute) {
          scrollToAnchor(hash, {
            duration: scrollDuration,
            offset: scrollOffset,
            behavior: false
          });
        } else if (scrollToTopOnRoute) {
          scrollToTop({
            duration: scrollDuration,
            offset: 0,
            behavior: false
          });
        }
      }, scrollDelay);

      return () => clearTimeout(timer);
    };

    handleRouteChange();
  }, [location.pathname, location.hash, scrollOnRouteChange, scrollToTopOnRoute, scrollToAnchorOnRoute, scrollDelay, scrollOffset, scrollDuration]);

  useEffect(() => {
    const handleClick = (e) => {
      const target = e.target.closest('a[href^="#"]');
      
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href || href === '#') return;

      const isSamePage = !target.getAttribute('target') && 
                         !target.hasAttribute('download') &&
                         href.startsWith('#');

      if (isSamePage) {
        e.preventDefault();
        const hash = href.substring(1);
        if (hash) {
          scrollToAnchor(hash, {
            duration: scrollDuration,
            offset: scrollOffset,
            behavior: false
          });
          
          window.history.pushState(null, '', href);
        }
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [scrollDuration, scrollOffset]);

  return <>{children}</>;
};

export default SmoothScrollProvider;
