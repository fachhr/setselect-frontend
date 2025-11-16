'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface DualRangeSliderProps {
  min: number;
  max: number;
  step: number;
  valueMin: number;
  valueMax: number;
  onChange: (min: number, max: number) => void;
  prefix?: string;
  suffix?: string;
  formatValue?: (value: number) => string;
  disabled?: boolean;
}

export function DualRangeSlider({
  min,
  max,
  step,
  valueMin,
  valueMax,
  onChange,
  prefix = '',
  suffix = '',
  formatValue,
  disabled = false
}: DualRangeSliderProps) {
  const [minValue, setMinValue] = useState(valueMin);
  const [maxValue, setMaxValue] = useState(valueMax);
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);

  const rangeRef = useRef<HTMLDivElement>(null);

  // Update local state when props change
  useEffect(() => {
    setMinValue(valueMin);
    setMaxValue(valueMax);
  }, [valueMin, valueMax]);

  const formatDisplayValue = useCallback((value: number): string => {
    if (formatValue) return formatValue(value);
    return `${prefix}${value.toFixed(1)}${suffix}`;
  }, [prefix, suffix, formatValue]);

  const getPercentage = useCallback((value: number): number => {
    return ((value - min) / (max - min)) * 100;
  }, [min, max]);

  const handleMouseDown = (handle: 'min' | 'max') => (e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragging(handle);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !rangeRef.current || disabled) return;

    const rect = rangeRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    let newValue = min + (percentage / 100) * (max - min);

    // Snap to step
    newValue = Math.round(newValue / step) * step;
    newValue = Math.max(min, Math.min(max, newValue));

    if (isDragging === 'min') {
      if (newValue <= maxValue) {
        setMinValue(newValue);
        onChange(newValue, maxValue);
      }
    } else {
      if (newValue >= minValue) {
        setMaxValue(newValue);
        onChange(minValue, newValue);
      }
    }
  }, [isDragging, min, max, step, minValue, maxValue, onChange, disabled]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const minPercentage = getPercentage(minValue);
  const maxPercentage = getPercentage(maxValue);

  // Generate grid marks (matching original: 5 grid lines plus edges = 6 total marks)
  const gridMarks = [];
  const numMarks = 6; // 0, 3, 6, 9, 12, 15
  for (let i = 0; i < numMarks; i++) {
    const value = min + (i / (numMarks - 1)) * (max - min);
    gridMarks.push(value);
  }

  return (
    <div className="ion-range-slider-container">
      <div className="irs--flat">
        {/* Min/Max labels at top */}
        <span className="irs-min">{formatDisplayValue(min)}</span>
        <span className="irs-max">{formatDisplayValue(max)}</span>

        {/* Track container */}
        <div ref={rangeRef} className="irs-line-container">
          {/* Background track */}
          <span className="irs-line" />

          {/* Active range bar */}
          <span
            className="irs-bar"
            style={{
              left: `${minPercentage}%`,
              width: `${maxPercentage - minPercentage}%`
            }}
          />

          {/* Min handle */}
          <span
            className={`irs-handle ${isDragging === 'min' ? 'state_hover' : ''}`}
            style={{ left: `${minPercentage}%` }}
            onMouseDown={handleMouseDown('min')}
          >
            <span className="irs-from">{formatDisplayValue(minValue)}</span>
          </span>

          {/* Max handle */}
          <span
            className={`irs-handle ${isDragging === 'max' ? 'state_hover' : ''}`}
            style={{ left: `${maxPercentage}%` }}
            onMouseDown={handleMouseDown('max')}
          >
            <span className="irs-to">{formatDisplayValue(maxValue)}</span>
          </span>
        </div>

        {/* Grid */}
        <div className="irs-grid">
          {gridMarks.map((value, index) => (
            <span
              key={index}
              className="irs-grid-pol"
              style={{ left: `${getPercentage(value)}%` }}
            >
              <span className="irs-grid-text">{formatDisplayValue(value)}</span>
            </span>
          ))}
        </div>
      </div>

      <style jsx>{`
        /* EXACT replication of Ion.RangeSlider styles from original project */
        .ion-range-slider-container {
          padding-top: 10px;
          margin-bottom: 20px;
        }

        .irs--flat {
          position: relative;
          height: auto;
          min-height: 50px;
        }

        .irs-line-container {
          position: relative;
          display: block;
          height: 8px;
        }

        .irs-line {
          position: absolute;
          display: block;
          left: 0;
          width: 100%;
          background-color: var(--light-600);
          border: 1px solid var(--light-400);
          height: 8px;
          top: 25px;
          border-radius: 4px;
        }

        .irs-bar {
          position: absolute;
          display: block;
          background-color: var(--primary);
          height: 8px;
          top: 25px;
          border-radius: 4px;
        }

        .irs-handle {
          position: absolute;
          display: block;
          background-color: var(--primary);
          border: 3px solid var(--light);
          width: 24px;
          height: 24px;
          top: 17px;
          margin-left: -12px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          border-radius: 50%;
          cursor: ${disabled ? 'not-allowed' : 'pointer'};
          transition: background-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
        }

        .irs-handle.state_hover,
        .irs-handle:hover {
          background-color: var(--primary-dark);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
          transform: scale(1.1);
        }

        .irs-min,
        .irs-max {
          position: absolute;
          display: block;
          color: var(--dark-600);
          font-size: 0.85em;
          line-height: 1;
          top: 0;
          padding: 1px 3px;
          background-color: transparent;
          border-radius: 4px;
        }

        .irs-min {
          left: 0;
        }

        .irs-max {
          right: 0;
        }

        .irs-from,
        .irs-to {
          position: absolute;
          display: block;
          top: -5px;
          left: 50%;
          transform: translateX(-50%);
          background-color: var(--dark-800);
          color: var(--light);
          font-size: 0.9em;
          line-height: 1.333;
          text-align: center;
          padding: 2px 8px;
          border-radius: 4px;
          white-space: nowrap;
          cursor: default;
        }

        .irs-from::before,
        .irs-to::before {
          position: absolute;
          display: block;
          content: "";
          bottom: -5px;
          left: 50%;
          width: 0;
          height: 0;
          margin-left: -3px;
          overflow: hidden;
          border: 3px solid transparent;
          border-top-color: var(--dark-800);
        }

        .irs-grid {
          position: absolute;
          display: block;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 20px;
          top: 40px;
        }

        .irs-grid-pol {
          position: absolute;
          top: 0;
          left: 0;
          width: 1px;
          height: 8px;
          background-color: var(--light-400);
        }

        .irs-grid-pol.small {
          background-color: var(--light-600);
        }

        .irs-grid-text {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          white-space: nowrap;
          text-align: center;
          font-size: 0.8em;
          line-height: 1;
          padding: 0 3px;
          color: var(--dark-400);
        }

        /* Dark mode support */
        :global(.dark) .irs-line {
          background-color: var(--light-600);
          border-color: var(--light-400);
        }

        :global(.dark) .irs-min,
        :global(.dark) .irs-max {
          color: var(--dark-600);
        }

        :global(.dark) .irs-grid-pol {
          background-color: var(--light-400);
        }

        :global(.dark) .irs-grid-pol.small {
          background-color: var(--light-600);
        }

        :global(.dark) .irs-grid-text {
          color: var(--dark-600);
        }
      `}</style>
    </div>
  );
}
