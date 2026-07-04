'use client';

import { FolderOpen, Trash2, X } from 'lucide-react';
import { styles } from './styles';

interface ProjectsModalProps {
  projects: string[];
  onClose: () => void;
  onOpen: (name: string) => void;
  onDelete: (name: string) => void;
}

export function ProjectsModal({ projects, onClose, onOpen, onDelete }: ProjectsModalProps) {
  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h3 style={{ margin: 0 }}>Proyectos guardados</h3>
          <button style={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <p style={styles.modalHint}>Se guardan en este navegador, en este dispositivo, junto con el audio.</p>
        {projects.map((name) => (
          <div
            key={name}
            role="button"
            tabIndex={0}
            style={styles.templateRow}
            onClick={() => onOpen(name)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onOpen(name);
            }}
          >
            <FolderOpen size={16} color="#8B7355" />
            <span style={{ flex: 1 }}>{name}</span>
            <button
              style={{ ...styles.deleteBtn, marginLeft: 'auto' }}
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`¿Borrar el proyecto "${name}"? Esto no se puede deshacer.`)) {
                  onDelete(name);
                }
              }}
              title="Borrar proyecto"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
