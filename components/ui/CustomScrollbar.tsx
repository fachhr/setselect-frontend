'use client';

import { useRef, useState, useEffect, useCallback, ReactNode, CSSProperties } from 'react';

interface CustomScrollbarProps {
  children: ReactNode;
  className?: string;
  enableDragToPan?: boolean;
  enableShiftScroll?: boolean;
  showScrollShadows?: boolean;
}

/**
 * Custom horizontal scrollbar with enhanced interaction:
 * - Drag-to-pan: Click and drag anywhere on content to scroll horizontally
 * - Shift+scroll: Hold Shift + mousewheel for horizontal scrolling
 * - Scroll shadows: Visual indicators showing more content exists
 */
export function CustomScrollbar({
  children,
  className = '',
  enableDragToPan = true,
  enableShiftScroll = true,
  showScrollShadows = true,
}: CustomScrollbarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Scrollbar thumb state
  const [thumbLeft, setThumbLeft] = useState(0);
  const [thumbWidth, setThumbWidth] = useState(20);
  const [canScroll, setCanScroll] = useState(true);
  const [isDraggingThumb, setIsDraggingThumb] = useState(false);

  // Drag-to-pan state
  const [isDraggingContent, setIsDraggingContent] = useState(false);

  // Scroll shadow state
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Refs for drag tracking
  const thumbDragData = useRef({ startX: 0, startScrollLeft: 0 });
  const contentDragData = useRef({ startX: 0, startScrollLeft: 0 });

  // Measure and update thumb + scroll shadows
  const measure = useCallback(() => {
    const scrollEl = scrollRef.current;
    const trackEl = trackRef.current;
    if (!scrollEl || !trackEl) return;

    const { scrollWidth, clientWidth, scrollLeft } = scrollEl;
    const trackWidth = trackEl.offsetWidth;

    const hasOverflow = scrollWidth > clientWidth;
    setCanScroll(hasOverflow);

    // Update scroll shadow indicators
    setCanScrollLeft(scrollLeft > 1);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);

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
  }, []);

  // Initial measurement and resize observer
  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

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
  }, [measure]);

  // ============ THUMB DRAG HANDLERS ============
  const onThumbMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingThumb(true);
    thumbDragData.current = {
      startX: e.clientX,
      startScrollLeft: scrollRef.current?.scrollLeft || 0,
    };
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    if (!isDraggingThumb) return;

    const onMouseMove = (e: MouseEvent) => {
      const scrollEl = scrollRef.current;
      const trackEl = trackRef.current;
      if (!scrollEl || !trackEl) return;

      const deltaX = e.clientX - thumbDragData.current.startX;
      const trackWidth = trackEl.offsetWidth;
      const { scrollWidth, clientWidth } = scrollEl;

      const maxScrollLeft = scrollWidth - clientWidth;
      const maxThumbLeft = trackWidth - thumbWidth;

      if (maxThumbLeft > 0) {
        const scrollDelta = (deltaX / maxThumbLeft) * maxScrollLeft;
        scrollEl.scrollLeft = thumbDragData.current.startScrollLeft + scrollDelta;
      }
    };

    const onMouseUp = () => {
      setIsDraggingThumb(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDraggingThumb, thumbWidth]);

  // ============ CONTENT DRAG-TO-PAN HANDLERS ============
  const onContentMouseDown = (e: React.MouseEvent) => {
    if (!enableDragToPan || !canScroll) return;

    // Ignore if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('button, a, input, select, textarea, [role="button"], th[class*="cursor-pointer"]')) return;

    setIsDraggingContent(true);
    contentDragData.current = {
      startX: e.clientX,
      startScrollLeft: scrollRef.current?.scrollLeft || 0,
    };
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    if (!isDraggingContent) return;

    const onMouseMove = (e: MouseEvent) => {
      const scrollEl = scrollRef.current;
      if (!scrollEl) return;

      const dx = e.clientX - contentDragData.current.startX;
      scrollEl.scrollLeft = contentDragData.current.startScrollLeft - dx;
    };

    const onMouseUp = () => {
      setIsDraggingContent(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDraggingContent]);

  // ============ SHIFT+SCROLL HORIZONTAL SCROLLING ============
  useEffect(() => {
    if (!enableShiftScroll) return;

    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.shiftKey && canScroll) {
        e.preventDefault();
        scrollEl.scrollLeft += e.deltaY;
      }
    };

    scrollEl.addEventListener('wheel', handleWheel, { passive: false });
    return () => scrollEl.removeEventListener('wheel', handleWheel);
  }, [enableShiftScroll, canScroll]);

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

  // ============ STYLES ============
  const scrollContainerStyle: CSSProperties = {
    overflowX: 'auto',
    scrollbarWidth: 'none', // Firefox
    msOverflowStyle: 'none', // IE/Edge
    cursor: enableDragToPan && canScroll && !isDraggingContent ? 'grab' : undefined,
  };

  const trackStyle: CSSProperties = {
    height: '14px',
    backgroundColor: 'var(--bg-surface-2)',
    borderTop: '1px solid var(--border-strong)',
    position: 'relative',
    cursor: 'pointer',
    flexShrink: 0,
  };

  const thumbStyle: CSSProperties = {
    position: 'absolute',
    top: '0',
    bottom: '0',
    left: `${thumbLeft}px`,
    width: `${thumbWidth}px`,
    backgroundColor: isDraggingThumb
      ? 'var(--gold)'
      : canScroll
        ? '#94a3b8'
        : 'var(--border-strong)',
    borderRadius: '7px',
    border: '3px solid var(--bg-surface-2)',
    backgroundClip: 'content-box',
    cursor: isDraggingThumb ? 'grabbing' : 'grab',
    transition: isDraggingThumb ? 'none' : 'background-color 0.15s ease',
    boxSizing: 'border-box',
  };

  const shadowBaseStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    bottom: '14px', // Above the scrollbar track
    width: '60px',
    pointerEvents: 'none',
    zIndex: 10,
    transition: 'opacity 0.2s ease',
  };

  const leftShadowStyle: CSSProperties = {
    ...shadowBaseStyle,
    left: 0,
    background: 'linear-gradient(to right, var(--bg-surface-1), transparent)',
    opacity: showScrollShadows && canScrollLeft ? 1 : 0,
  };

  const rightShadowStyle: CSSProperties = {
    ...shadowBaseStyle,
    right: 0,
    background: 'linear-gradient(to left, var(--bg-surface-1), transparent)',
    opacity: showScrollShadows && canScrollRight ? 1 : 0,
  };

  return (
    <div className={`flex flex-col relative ${className}`}>
      {/* Hide webkit scrollbar with inline style tag */}
      <style>{`
        .custom-scroll-hide::-webkit-scrollbar {
          display: none !important;
          height: 0 !important;
          width: 0 !important;
        }
      `}</style>

      {/* Scroll shadow indicators */}
      <div style={leftShadowStyle} aria-hidden="true" />
      <div style={rightShadowStyle} aria-hidden="true" />

      {/* Scrollable content area with drag-to-pan */}
      <div
        ref={scrollRef}
        className="custom-scroll-hide"
        style={scrollContainerStyle}
        onMouseDown={onContentMouseDown}
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
