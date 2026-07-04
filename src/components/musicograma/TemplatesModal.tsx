'use client';

import { X } from 'lucide-react';
import { SHAPES, TEMPLATES } from './constants';
import { styles } from './styles';
import type { Template } from './types';

interface TemplatesModalProps {
  onClose: () => void;
  onApply: (template: Template) => void;
}

export function TemplatesModal({ onClose, onApply }: TemplatesModalProps) {
  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h3 style={{ margin: 0 }}>Plantillas</h3>
          <button style={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <p style={styles.modalHint}>
          Reparte el audio en partes iguales con formas/colores ya asignados. Podrás ajustar los tiempos después.
        </p>
        {TEMPLATES.map((t) => (
          <button key={t.name} style={styles.templateRow} onClick={() => onApply(t)}>
            <div style={styles.templatePreview}>
              {t.shapes.map((s, i) => {
                const Icon = SHAPES[s].icon;
                return <Icon key={i} size={14} color={t.colors[i]} fill={t.colors[i]} />;
              })}
            </div>
            <span>{t.name}</span>
            <span style={styles.templateMeta}>{t.segments} partes</span>
          </button>
        ))}
      </div>
    </div>
  );
}
