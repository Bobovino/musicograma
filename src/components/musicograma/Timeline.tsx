'use client';

import { Circle } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { SHAPES } from './constants';
import { styles } from './styles';
import type { Segment } from './types';

interface TimelineProps {
  timelineRef: RefObject<HTMLDivElement | null>;
  waveform: number[];
  sortedSegments: Segment[];
  duration: number;
  currentTime: number;
  selectedSegmentId: string | null;
  onSelectSegment: (id: string) => void;
  onTimelineClick: (time: number) => void;
  onBoundaryChange: (segmentId: string, newStart: number) => void;
}

export function Timeline({
  timelineRef,
  waveform,
  sortedSegments,
  duration,
  currentTime,
  selectedSegmentId,
  onSelectSegment,
  onTimelineClick,
  onBoundaryChange,
}: TimelineProps) {
  const [draggingBoundary, setDraggingBoundary] = useState<string | null>(null);

  const handleBoundaryDrag = useCallback(
    (e: MouseEvent) => {
      if (!draggingBoundary || !timelineRef.current || !duration) return;
      const rect = timelineRef.current.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      onBoundaryChange(draggingBoundary, pct * duration);
    },
    [draggingBoundary, duration, onBoundaryChange, timelineRef]
  );

  useEffect(() => {
    if (!draggingBoundary) return;
    const up = () => setDraggingBoundary(null);
    window.addEventListener('mousemove', handleBoundaryDrag);
    window.addEventListener('mouseup', up);
    return () => {
      window.removeEventListener('mousemove', handleBoundaryDrag);
      window.removeEventListener('mouseup', up);
    };
  }, [draggingBoundary, handleBoundaryDrag]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current || !duration) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    onTimelineClick(pct * duration);
  };

  return (
    <div style={styles.timelineWrap}>
      <div ref={timelineRef} style={styles.timeline} onClick={handleClick}>
        <div style={styles.waveformLayer}>
          {waveform.map((v, i) => (
            <div
              key={i}
              style={{
                width: `${100 / waveform.length}%`,
                height: `${Math.max(4, v * 100)}%`,
                background: '#C4B8A5',
              }}
            />
          ))}
        </div>

        {sortedSegments.map((seg) => {
          const left = (seg.start / duration) * 100;
          const width = ((seg.end - seg.start) / duration) * 100;
          const ShapeIcon = SHAPES[seg.shape]?.icon ?? Circle;
          return (
            <div
              key={seg.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelectSegment(seg.id);
              }}
              style={{
                position: 'absolute',
                left: `${left}%`,
                width: `${width}%`,
                top: 0,
                bottom: 0,
                background: seg.color + '33',
                borderLeft: `2px solid ${seg.color}`,
                borderRight: seg === sortedSegments[sortedSegments.length - 1] ? `2px solid ${seg.color}` : 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                outline: selectedSegmentId === seg.id ? '2px solid #2D2620' : 'none',
                outlineOffset: -2,
              }}
            >
              <ShapeIcon size={18} color={seg.color} fill={seg.color} strokeWidth={1.5} />
            </div>
          );
        })}

        {sortedSegments.slice(1).map((seg) => {
          const left = (seg.start / duration) * 100;
          return (
            <div
              key={'b-' + seg.id}
              onMouseDown={(e) => {
                e.stopPropagation();
                setDraggingBoundary(seg.id);
              }}
              style={{
                position: 'absolute',
                left: `${left}%`,
                top: 0,
                bottom: 0,
                width: 8,
                marginLeft: -4,
                cursor: 'col-resize',
                zIndex: 5,
              }}
            />
          );
        })}

        {duration > 0 && (
          <div
            style={{
              position: 'absolute',
              left: `${(currentTime / duration) * 100}%`,
              top: 0,
              bottom: 0,
              width: 2,
              background: '#2D2620',
              pointerEvents: 'none',
            }}
          />
        )}
      </div>
      <p style={styles.timelineHint}>
        Click en la barra para mover la cabeza de reproducción · arrastra los bordes de los segmentos para ajustar tiempos
      </p>
    </div>
  );
}
