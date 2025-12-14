'use client';

import { useRef, useState, useEffect, ReactNode, CSSProperties } from 'react';

interface CustomScrollbarProps {
  children: ReactNode;
  className?: string;
}

/**
 * Custom horizontal scrollbar that is ALWAYS visible.
 * Renders a native-like scrollbar below the content that works on all platforms.
 */
export function CustomScrollbar({ children, className = '' }: CustomScrollbarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const [thumbLeft, setThumbLeft] = useState(0);
  const [thumbWidth, setThumbWidth] = useState(20);
  const [canScroll, setCanScroll] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const dragData = useRef({ startX: 0, startScrollLeft: 0 });

  // Measure and update thumb
  useEffect(() => {
    const scrollEl = scrollRef.current;
    const trackEl = trackRef.current;
    if (!scrollEl || !trackEl) return;

    const measure = () => {
      const { scrollWidth, clientWidth, scrollLeft } = scrollEl;
      const trackWidth = trackEl.offsetWidth;

      const hasOverflow = scrollWidth > clientWidth;
      setCanScroll(hasOverflow);

      if (!hasOverflow) {
        setThumbWidth(trackWidth);
        setThumbLeft(0);
        return;
      }

      // Calculate thumb width (proportional to visible area)
      const ratio = clientWidth / scrollWidth;
      const newThumbWidth = Math.max(ratio * trackWidth, 40);
      setThumbWidth(newThumbWidth);

      // Calculate thumb position
      const maxScrollLeft = scrollWidth - clientWidth;
      const maxThumbLeft = trackWidth - newThumbWidth;
      const scrollRatio = maxScrollLeft > 0 ? scrollLeft / maxScrollLeft : 0;
      setThumbLeft(scrollRatio * maxThumbLeft);
    };

    // Initial measure
    measure();

    // Measure on scroll
    scrollEl.addEventListener('scroll', measure, { passive: true });

    // Measure on resize
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(measure);
    });
    resizeObserver.observe(scrollEl);

    // Also observe the table/content for size changes
    const firstChild = scrollEl.firstElementChild;
    if (firstChild) {
      resizeObserver.observe(firstChild);
    }

    // Delayed measurements to catch late renders
    const t1 = setTimeout(measure, 50);
    const t2 = setTimeout(measure, 200);
    const t3 = setTimeout(measure, 500);

    return () => {
      scrollEl.removeEventListener('scroll', measure);
      resizeObserver.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  // Handle thumb drag
  const onThumbMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    dragData.current = {
      startX: e.clientX,
      startScrollLeft: scrollRef.current?.scrollLeft || 0,
    };
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e: MouseEvent) => {
      const scrollEl = scrollRef.current;
      const trackEl = trackRef.current;
      if (!scrollEl || !trackEl) return;

      const deltaX = e.clientX - dragData.current.startX;
      const trackWidth = trackEl.offsetWidth;
      const { scrollWidth, clientWidth } = scrollEl;

      const maxScrollLeft = scrollWidth - clientWidth;
      const maxThumbLeft = trackWidth - thumbWidth;

      if (maxThumbLeft > 0) {
        const scrollDelta = (deltaX / maxThumbLeft) * maxScrollLeft;
        scrollEl.scrollLeft = dragData.current.startScrollLeft + scrollDelta;
      }
    };

    const onMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging, thumbWidth]);

  // Handle track click
  const onTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Ignore clicks on the thumb itself
    if ((e.target as HTMLElement).dataset.role === 'thumb') return;

    const scrollEl = scrollRef.current;
    const trackEl = trackRef.current;
    if (!scrollEl || !trackEl) return;

    const rect = trackEl.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickRatio = clickX / rect.width;

    const maxScrollLeft = scrollEl.scrollWidth - scrollEl.clientWidth;
    scrollEl.scrollTo({
      left: clickRatio * maxScrollLeft,
      behavior: 'smooth',
    });
  };

  // Styles - matching sample code appearance (adapted to dark theme)
  const scrollContainerStyle: CSSProperties = {
    overflowX: 'auto',
    scrollbarWidth: 'none', // Firefox
    msOverflowStyle: 'none', // IE/Edge
  };

  // Track: light background with border-top (like sample's #f8fafc with #e2e8f0 border)
  // Dark theme equivalent: lighter surface with subtle border
  const trackStyle: CSSProperties = {
    height: '14px',
    backgroundColor: 'var(--bg-surface-2)', // #162943
    borderTop: '1px solid var(--border-strong)', // #2C4A6E
    position: 'relative',
    cursor: 'pointer',
    flexShrink: 0,
  };

  // Thumb: "floating" effect using border + background-clip trick
  // Sample uses: border: 3px solid track-color, background-clip: content-box, border-radius: 7px
  const thumbStyle: CSSProperties = {
    position: 'absolute',
    top: '0',
    bottom: '0',
    left: `${thumbLeft}px`,
    width: `${thumbWidth}px`,
    // The "floating" effect: border matches track, background-clip makes bg only fill inside
    backgroundColor: isDragging
      ? 'var(--gold)'
      : canScroll
        ? '#94a3b8' // slate-400 - more visible thumb color
        : 'var(--border-strong)',
    borderRadius: '7px',
    border: '3px solid var(--bg-surface-2)', // Same as track background
    backgroundClip: 'content-box',
    cursor: isDragging ? 'grabbing' : 'grab',
    transition: isDragging ? 'none' : 'background-color 0.15s ease',
    boxSizing: 'border-box',
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Hide webkit scrollbar with inline style tag */}
      <style>{`
        .custom-scroll-hide::-webkit-scrollbar {
          display: none !important;
          height: 0 !important;
          width: 0 !important;
        }
      `}</style>

      {/* Scrollable content area */}
      <div
        ref={scrollRef}
        className="custom-scroll-hide"
        style={scrollContainerStyle}
      >
        {children}
      </div>

      {/* Always-visible scrollbar track */}
      <div
        ref={trackRef}
        onClick={onTrackClick}
        style={trackStyle}
      >
        {/* Thumb */}
        <div
          data-role="thumb"
          onMouseDown={onThumbMouseDown}
          style={thumbStyle}
        />
      </div>
    </div>
  );
}
