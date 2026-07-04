'use client';

import { FolderOpen, Loader2, Trash2, X } from 'lucide-react';
import { styles } from './styles';

interface ProjectsModalProps {
  projects: string[];
  loadingProjectName: string | null;
  onClose: () => void;
  onOpen: (name: string) => void;
  onDelete: (name: string) => void;
}

export function ProjectsModal({ projects, loadingProjectName, onClose, onOpen, onDelete }: ProjectsModalProps) {
  const isLoading = loadingProjectName !== null;
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
        {projects.map((name) => {
          const isThisLoading = loadingProjectName === name;
          return (
            <div
              key={name}
              role="button"
              tabIndex={isLoading ? -1 : 0}
              style={{ ...styles.templateRow, opacity: isLoading && !isThisLoading ? 0.5 : 1, cursor: isLoading ? 'default' : 'pointer' }}
              onClick={() => !isLoading && onOpen(name)}
              onKeyDown={(e) => {
                if (!isLoading && (e.key === 'Enter' || e.key === ' ')) onOpen(name);
              }}
            >
              {isThisLoading ? (
                <Loader2 size={16} color="#8B7355" style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <FolderOpen size={16} color="#8B7355" />
              )}
              <span style={{ flex: 1 }}>{name}</span>
              {isThisLoading ? (
                <span style={{ fontSize: 12, color: '#8B7355' }}>Cargando...</span>
              ) : (
                <button
                  style={{ ...styles.deleteBtn, marginLeft: 'auto' }}
                  disabled={isLoading}
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
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
