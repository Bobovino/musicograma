'use client';

import { Circle, Trash2 } from 'lucide-react';
import { INSTRUMENT_ICONS, SHAPES } from './constants';
import { styles } from './styles';
import type { Segment } from './types';
import { formatTime } from './utils';

interface SegmentListProps {
  segments: Segment[];
  selectedSegmentId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function SegmentList({ segments, selectedSegmentId, onSelect, onDelete }: SegmentListProps) {
  return (
    <div style={styles.segmentList}>
      <h3 style={styles.sectionTitle}>Segmentos ({segments.length})</h3>
      {segments.length === 0 && (
        <p style={styles.emptyHint}>Usa &quot;Marcar aquí&quot;, &quot;Dividir en partes&quot; o una plantilla para empezar.</p>
      )}
      {segments.map((seg) => {
        const ShapeIcon = SHAPES[seg.shape]?.icon ?? Circle;
        return (
          <div
            key={seg.id}
            onClick={() => onSelect(seg.id)}
            style={{
              ...styles.segmentRow,
              background: selectedSegmentId === seg.id ? '#F0E8D8' : 'transparent',
            }}
          >
            <div style={{ ...styles.segmentSwatch, background: seg.color }}>
              <ShapeIcon size={13} color="#fff" fill="#fff" />
            </div>
            <span style={styles.segmentTime}>
              {formatTime(seg.start)}–{formatTime(seg.end)}
            </span>
            {seg.icon !== 'none' && <span>{INSTRUMENT_ICONS[seg.icon]}</span>}
            <span style={styles.segmentLabelText}>{seg.label}</span>
            <button
              style={styles.deleteBtn}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(seg.id);
              }}
            >
              <Trash2 size={13} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
