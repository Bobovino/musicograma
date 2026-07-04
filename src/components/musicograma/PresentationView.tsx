'use client';

import { Circle, Pause, Play, X } from 'lucide-react';
import type { RefObject } from 'react';
import { INSTRUMENT_ICONS, SHAPES } from './constants';
import { styles } from './styles';
import type { Segment } from './types';
import { formatTime } from './utils';

interface PresentationViewProps {
  segments: Segment[];
  currentIndex: number;
  audioRef: RefObject<HTMLAudioElement | null>;
  audioUrl: string | null;
  isPlaying: boolean;
  togglePlay: () => void;
  onTimeUpdate: () => void;
  onLoadedMetadata: () => void;
  currentTime: number;
  duration: number;
  onExitPresent: () => void;
}

export function PresentationView({
  segments,
  currentIndex,
  audioRef,
  audioUrl,
  isPlaying,
  togglePlay,
  onTimeUpdate,
  onLoadedMetadata,
  currentTime,
  duration,
  onExitPresent,
}: PresentationViewProps) {
  const seg = segments[currentIndex];
  const ShapeIcon = seg ? SHAPES[seg.shape]?.icon ?? Circle : Circle;

  return (
    <div style={styles.presentWrap}>
      {audioUrl && (
        <audio ref={audioRef} src={audioUrl} onTimeUpdate={onTimeUpdate} onLoadedMetadata={onLoadedMetadata} />
      )}
      <button style={styles.exitPresentBtn} onClick={onExitPresent} className="no-print">
        <X size={22} />
      </button>

      <div style={styles.presentStage}>
        {seg ? (
          <>
            <ShapeIcon
              size={220}
              color={seg.color}
              fill={seg.color}
              strokeWidth={1}
              style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.15))' }}
            />
            {seg.icon !== 'none' && (
              <div style={styles.presentInstrumentIcon}>{INSTRUMENT_ICONS[seg.icon]}</div>
            )}
            {seg.label && <p style={styles.presentLabel}>{seg.label}</p>}
          </>
        ) : (
          <p style={{ color: '#fff', fontSize: 20 }}>No hay segmentos que mostrar</p>
        )}
      </div>

      <div style={styles.presentStrip}>
        {segments.map((s, i) => (
          <div
            key={s.id}
            style={{
              flex: s.end - s.start,
              height: i === currentIndex ? 10 : 6,
              background: s.color,
              opacity: i === currentIndex ? 1 : 0.4,
              borderRadius: 4,
              transition: 'all 0.2s',
            }}
          />
        ))}
      </div>

      <div style={styles.presentControls} className="no-print">
        <button style={styles.presentPlayBtn} onClick={togglePlay}>
          {isPlaying ? <Pause size={26} /> : <Play size={26} style={{ marginLeft: 3 }} />}
        </button>
        <span style={styles.presentTime}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>
    </div>
  );
}
