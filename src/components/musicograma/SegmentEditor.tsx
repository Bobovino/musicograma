'use client';

import { X } from 'lucide-react';
import { COLORS, INSTRUMENT_ICONS, SHAPES } from './constants';
import { styles } from './styles';
import type { InstrumentKey, Segment, ShapeKey } from './types';

interface SegmentEditorProps {
  segment: Segment | undefined;
  onUpdate: (id: string, patch: Partial<Segment>) => void;
}

export function SegmentEditor({ segment, onUpdate }: SegmentEditorProps) {
  return (
    <div style={styles.segmentEditor}>
      <h3 style={styles.sectionTitle}>Editar segmento</h3>
      {!segment ? (
        <p style={styles.emptyHint}>Selecciona un segmento de la lista o de la línea de tiempo.</p>
      ) : (
        <>
          <label style={styles.fieldLabel}>Etiqueta (opcional)</label>
          <input
            style={styles.textInput}
            value={segment.label}
            placeholder="ej. Entra el violín"
            onChange={(e) => onUpdate(segment.id, { label: e.target.value })}
          />

          <label style={styles.fieldLabel}>Forma</label>
          <div style={styles.swatchRow}>
            {(Object.entries(SHAPES) as [ShapeKey, (typeof SHAPES)[ShapeKey]][]).map(([key, { icon: Icon, label }]) => (
              <button
                key={key}
                title={label}
                onClick={() => onUpdate(segment.id, { shape: key })}
                style={{
                  ...styles.shapeBtn,
                  borderColor: segment.shape === key ? '#2D2620' : '#E0D5C0',
                  background: segment.shape === key ? '#F0E8D8' : '#fff',
                }}
              >
                <Icon size={18} color="#2D2620" />
              </button>
            ))}
          </div>

          <label style={styles.fieldLabel}>Color</label>
          <div style={styles.swatchRow}>
            {COLORS.map((c) => (
              <button
                key={c.hex}
                title={c.name}
                onClick={() => onUpdate(segment.id, { color: c.hex })}
                style={{
                  ...styles.colorBtn,
                  background: c.hex,
                  outline: segment.color === c.hex ? '2px solid #2D2620' : 'none',
                  outlineOffset: 2,
                }}
              />
            ))}
          </div>

          <label style={styles.fieldLabel}>Icono de instrumento (opcional)</label>
          <div style={styles.swatchRow}>
            {(Object.entries(INSTRUMENT_ICONS) as [InstrumentKey, string | null][]).map(([key, emoji]) => (
              <button
                key={key}
                onClick={() => onUpdate(segment.id, { icon: key })}
                style={{
                  ...styles.shapeBtn,
                  borderColor: segment.icon === key ? '#2D2620' : '#E0D5C0',
                  background: segment.icon === key ? '#F0E8D8' : '#fff',
                  fontSize: 16,
                }}
              >
                {emoji ?? <X size={14} />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
