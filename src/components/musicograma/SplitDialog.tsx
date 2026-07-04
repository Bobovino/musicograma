'use client';

import { X } from 'lucide-react';
import { styles } from './styles';

interface SplitDialogProps {
  splitCount: number;
  onChangeSplitCount: (n: number) => void;
  onClose: () => void;
  onApply: () => void;
}

export function SplitDialog({ splitCount, onChangeSplitCount, onClose, onApply }: SplitDialogProps) {
  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h3 style={{ margin: 0 }}>Dividir en partes iguales</h3>
          <button style={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <label style={styles.fieldLabel}>Número de segmentos</label>
        <input
          type="number"
          min={2}
          max={20}
          value={splitCount}
          onChange={(e) => onChangeSplitCount(parseInt(e.target.value, 10) || 2)}
          style={styles.textInput}
        />
        <button
          style={{ ...styles.iconBtn, ...styles.primaryBtn, marginTop: 12, width: '100%', justifyContent: 'center' }}
          onClick={onApply}
        >
          Dividir
        </button>
      </div>
    </div>
  );
}
