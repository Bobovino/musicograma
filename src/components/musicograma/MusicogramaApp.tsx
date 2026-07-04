'use client';

import { Circle, Download, FolderOpen, Grid3x3, Music, Pause, Play, Plus, Save, Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { COLORS, INSTRUMENT_ICONS, SHAPES, SHAPE_KEYS, TEMPLATES } from './constants';
import { dbDeleteProject, dbListProjects, dbLoadProject, dbSaveProject } from './db';
import { ProjectsModal } from './ProjectsModal';
import { PresentationView } from './PresentationView';
import { SegmentEditor } from './SegmentEditor';
import { SegmentList } from './SegmentList';
import { SplitDialog } from './SplitDialog';
import { styles, PRINT_STYLES } from './styles';
import { TemplatesModal } from './TemplatesModal';
import { Timeline } from './Timeline';
import type { AppMode, Segment, Template } from './types';
import { formatTime, uid } from './utils';
import { useWaveformAnalysis } from './useWaveformAnalysis';

export default function MusicogramaApp() {
  const [audioFile, setAudioFile] = useState<File | Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [waveform, setWaveform] = useState<number[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);
  const [mode, setMode] = useState<AppMode>('edit');
  const [presentIndex, setPresentIndex] = useState(0);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSplitDialog, setShowSplitDialog] = useState(false);
  const [splitCount, setSplitCount] = useState(4);
  const [projectName, setProjectName] = useState('Mi musicograma');
  const [toast, setToast] = useState<string | null>(null);
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [savedProjects, setSavedProjects] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const analyzeWaveform = useWaveformAnalysis();

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleFileUpload = async (file: File | undefined) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAudioFile(file);
    setAudioUrl(url);
    setSegments([]);
    setSelectedSegmentId(null);
    setWaveform(await analyzeWaveform(file));
  };

  const onAudioLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const onTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onEnded = () => setIsPlaying(false);
    el.addEventListener('ended', onEnded);
    return () => el.removeEventListener('ended', onEnded);
  }, [audioUrl]);

  const sortedSegments = [...segments].sort((a, b) => a.start - b.start);

  const splitAt = (t: number) => {
    setSegments((prev) => {
      const sorted = [...prev].sort((a, b) => a.start - b.start);
      if (sorted.length === 0) {
        return [
          { id: uid(), start: 0, end: t, shape: 'circle', color: COLORS[0].hex, icon: 'none', label: '' },
          { id: uid(), start: t, end: duration, shape: 'square', color: COLORS[1].hex, icon: 'none', label: '' },
        ];
      }
      const idx = sorted.findIndex((s) => t > s.start && t < s.end);
      if (idx === -1) return sorted;
      const target = sorted[idx];
      const colorIdx = idx % COLORS.length;
      const newSeg: Segment = {
        id: uid(),
        start: t,
        end: target.end,
        shape: SHAPE_KEYS[(idx + 1) % SHAPE_KEYS.length],
        color: COLORS[(colorIdx + 1) % COLORS.length].hex,
        icon: 'none',
        label: '',
      };
      const updated = [...sorted];
      updated[idx] = { ...target, end: t };
      updated.splice(idx + 1, 0, newSeg);
      return updated;
    });
    showToast('Marcador añadido');
  };

  const addManualMarker = () => {
    if (!duration) return;
    splitAt(currentTime);
  };

  const applyTemplate = (template: Template) => {
    if (!duration) {
      showToast('Carga primero un audio');
      return;
    }
    const segLen = duration / template.segments;
    const newSegments: Segment[] = Array.from({ length: template.segments }, (_, i) => ({
      id: uid(),
      start: i * segLen,
      end: (i + 1) * segLen,
      shape: template.shapes[i] ?? 'circle',
      color: template.colors[i] ?? COLORS[0].hex,
      icon: 'none',
      label: '',
    }));
    setSegments(newSegments);
    setShowTemplates(false);
    showToast(`Plantilla "${template.name}" aplicada`);
  };

  const applyEqualSplit = (n: number) => {
    if (!duration) {
      showToast('Carga primero un audio');
      return;
    }
    const segLen = duration / n;
    const newSegments: Segment[] = Array.from({ length: n }, (_, i) => ({
      id: uid(),
      start: i * segLen,
      end: (i + 1) * segLen,
      shape: SHAPE_KEYS[i % SHAPE_KEYS.length],
      color: COLORS[i % COLORS.length].hex,
      icon: 'none',
      label: '',
    }));
    setSegments(newSegments);
    setShowSplitDialog(false);
    showToast(`Dividido en ${n} partes`);
  };

  const deleteSegment = (id: string) => {
    setSegments((prev) => {
      const sorted = [...prev].sort((a, b) => a.start - b.start);
      const idx = sorted.findIndex((s) => s.id === id);
      if (idx === -1) return prev;
      if (sorted.length === 1) return [];
      if (idx === 0) {
        const updated = [...sorted];
        updated[1] = { ...updated[1], start: 0 };
        updated.splice(0, 1);
        return updated;
      }
      const updated = [...sorted];
      updated[idx - 1] = { ...updated[idx - 1], end: sorted[idx].end };
      updated.splice(idx, 1);
      return updated;
    });
    setSelectedSegmentId(null);
  };

  const updateSegment = (id: string, patch: Partial<Segment>) => {
    setSegments((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const updateBoundary = (id: string, newStart: number) => {
    setSegments((prev) => {
      const sorted = [...prev].sort((a, b) => a.start - b.start);
      const idx = sorted.findIndex((s) => s.id === id);
      if (idx <= 0) return prev;
      const clamped = Math.max(sorted[idx - 1].start + 0.05, Math.min(newStart, sorted[idx].end - 0.05));
      const updated = [...sorted];
      updated[idx] = { ...updated[idx], start: clamped };
      updated[idx - 1] = { ...updated[idx - 1], end: clamped };
      return updated;
    });
  };

  const handleTimelineClick = (t: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = t;
      setCurrentTime(t);
    }
  };

  useEffect(() => {
    if (mode !== 'present') return;
    const idx = sortedSegments.findIndex((s) => currentTime >= s.start && currentTime < s.end);
    if (idx !== -1 && idx !== presentIndex) setPresentIndex(idx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTime, mode]);

  const saveProject = async () => {
    if (!projectName.trim()) {
      showToast('Ponle un nombre al proyecto primero');
      return;
    }
    setIsSaving(true);
    try {
      await dbSaveProject({
        projectName,
        segments,
        duration,
        audioBlob: audioFile ?? null,
        audioFileName: audioFile instanceof File ? audioFile.name : null,
        audioMimeType: audioFile?.type ?? null,
        savedAt: new Date().toISOString(),
      });
      showToast(audioFile ? 'Proyecto y audio guardados' : 'Proyecto guardado (sin audio)');
    } catch (e) {
      console.error(e);
      showToast('Error al guardar el proyecto');
    } finally {
      setIsSaving(false);
    }
  };

  const openLoadDialog = async () => {
    try {
      const names = await dbListProjects();
      if (names.length === 0) {
        showToast('No hay proyectos guardados todavía');
        return;
      }
      setSavedProjects(names);
      setShowOpenDialog(true);
    } catch {
      showToast('Error al leer proyectos guardados');
    }
  };

  const loadProject = async (name: string) => {
    try {
      const data = await dbLoadProject(name);
      if (!data) {
        showToast('Proyecto no encontrado');
        return;
      }
      setProjectName(data.projectName);
      setSegments(data.segments || []);
      setSelectedSegmentId(null);

      if (data.audioBlob) {
        const url = URL.createObjectURL(data.audioBlob);
        setAudioFile(data.audioBlob);
        setAudioUrl(url);
        setWaveform(await analyzeWaveform(data.audioBlob));
        showToast(`Proyecto "${name}" cargado, con audio incluido`);
      } else {
        setAudioFile(null);
        setAudioUrl(null);
        showToast(`Proyecto "${name}" cargado — no tenía audio guardado`);
      }
      setShowOpenDialog(false);
    } catch (e) {
      console.error(e);
      showToast('Error al cargar el proyecto');
    }
  };

  const deleteProject = async (name: string) => {
    try {
      await dbDeleteProject(name);
      setSavedProjects((prev) => prev.filter((n) => n !== name));
      showToast(`Proyecto "${name}" borrado`);
    } catch {
      showToast('Error al borrar');
    }
  };

  const exportAsImage = () => {
    showToast('Preparando imagen para imprimir...');
    window.print();
  };

  const selectedSegment = sortedSegments.find((s) => s.id === selectedSegmentId);

  return (
    <div style={styles.app}>
      <style>{PRINT_STYLES}</style>

      <header style={styles.header} className="no-print">
        <div style={styles.headerLeft}>
          <div style={styles.logoMark}>
            <Music size={20} strokeWidth={2.5} />
          </div>
          <input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            style={styles.projectNameInput}
          />
        </div>
        <div style={styles.headerRight}>
          <button style={styles.iconBtn} onClick={saveProject} title="Guardar proyecto (incluye el audio)" disabled={isSaving}>
            <Save size={16} /> {isSaving ? 'Guardando...' : 'Guardar'}
          </button>
          <button style={styles.iconBtn} onClick={openLoadDialog} title="Abrir proyecto guardado">
            <FolderOpen size={16} /> Abrir
          </button>
          <button
            style={{ ...styles.iconBtn, ...styles.primaryBtn }}
            onClick={() => setMode(mode === 'edit' ? 'present' : 'edit')}
          >
            {mode === 'edit' ? '▶ Modo presentación' : '✎ Modo edición'}
          </button>
        </div>
      </header>

      {mode === 'present' ? (
        <PresentationView
          segments={sortedSegments}
          currentIndex={presentIndex}
          audioRef={audioRef}
          audioUrl={audioUrl}
          isPlaying={isPlaying}
          togglePlay={togglePlay}
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onAudioLoadedMetadata}
          currentTime={currentTime}
          duration={duration}
          onExitPresent={() => setMode('edit')}
        />
      ) : (
        <main style={styles.main}>
          {!audioUrl && (
            <div
              style={styles.uploadZone}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFileUpload(e.dataTransfer.files[0]);
              }}
            >
              <Upload size={40} strokeWidth={1.5} color="#8B7355" />
              <p style={styles.uploadText}>Arrastra un archivo de audio (mp3, wav) o haz click para elegir</p>
              <p style={styles.uploadSubtext}>Todo se procesa en tu navegador — no se sube a ningún servidor</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            style={{ display: 'none' }}
            onChange={(e) => handleFileUpload(e.target.files?.[0])}
          />

          {audioUrl && (
            <>
              <audio
                ref={audioRef}
                src={audioUrl}
                onLoadedMetadata={onAudioLoadedMetadata}
                onTimeUpdate={onTimeUpdate}
              />

              <div style={styles.transport}>
                <button style={styles.playBtn} onClick={togglePlay}>
                  {isPlaying ? <Pause size={22} /> : <Play size={22} style={{ marginLeft: 2 }} />}
                </button>
                <span style={styles.timeLabel}>{formatTime(currentTime)}</span>
                <span style={styles.timeSep}>/</span>
                <span style={styles.timeLabel}>{formatTime(duration)}</span>

                <div style={{ flex: 1 }} />

                <button style={styles.secondaryBtn} onClick={addManualMarker}>
                  <Plus size={15} /> Marcar aquí
                </button>
                <button style={styles.secondaryBtn} onClick={() => setShowSplitDialog(true)}>
                  <Grid3x3 size={15} /> Dividir en partes
                </button>
                <button style={styles.secondaryBtn} onClick={() => setShowTemplates(true)}>
                  Plantillas
                </button>
                <button
                  style={{ ...styles.secondaryBtn, color: '#B5482A' }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Cambiar audio
                </button>
              </div>

              <Timeline
                timelineRef={timelineRef}
                waveform={waveform}
                sortedSegments={sortedSegments}
                duration={duration}
                currentTime={currentTime}
                selectedSegmentId={selectedSegmentId}
                onSelectSegment={setSelectedSegmentId}
                onTimelineClick={handleTimelineClick}
                onBoundaryChange={updateBoundary}
              />

              <div style={styles.editorGrid}>
                <SegmentList
                  segments={sortedSegments}
                  selectedSegmentId={selectedSegmentId}
                  onSelect={setSelectedSegmentId}
                  onDelete={deleteSegment}
                />
                <SegmentEditor segment={selectedSegment} onUpdate={updateSegment} />
              </div>

              {sortedSegments.length > 0 && (
                <div style={styles.exportSection}>
                  <div style={styles.exportHeader}>
                    <h3 style={styles.sectionTitle}>Vista de impresión</h3>
                    <button style={{ ...styles.iconBtn, ...styles.primaryBtn }} onClick={exportAsImage}>
                      <Download size={15} /> Exportar / Imprimir
                    </button>
                  </div>
                  <div id="print-strip" style={styles.printStrip}>
                    <h2 style={styles.printTitle}>{projectName}</h2>
                    <div style={styles.printRow}>
                      {sortedSegments.map((seg) => {
                        const ShapeIcon = SHAPES[seg.shape]?.icon ?? Circle;
                        return (
                          <div key={seg.id} style={styles.printCell}>
                            <div style={{ ...styles.printShapeBox, borderColor: seg.color }}>
                              <ShapeIcon size={32} color={seg.color} fill={seg.color} strokeWidth={1.2} />
                              {seg.icon !== 'none' && (
                                <span style={styles.printIcon}>{INSTRUMENT_ICONS[seg.icon]}</span>
                              )}
                            </div>
                            {seg.label && <p style={styles.printLabel}>{seg.label}</p>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      )}

      {showTemplates && <TemplatesModal onClose={() => setShowTemplates(false)} onApply={applyTemplate} />}

      {showOpenDialog && (
        <ProjectsModal
          projects={savedProjects}
          onClose={() => setShowOpenDialog(false)}
          onOpen={loadProject}
          onDelete={deleteProject}
        />
      )}

      {showSplitDialog && (
        <SplitDialog
          splitCount={splitCount}
          onChangeSplitCount={setSplitCount}
          onClose={() => setShowSplitDialog(false)}
          onApply={() => applyEqualSplit(splitCount)}
        />
      )}

      {toast && <div style={styles.toast}>{toast}</div>}
    </div>
  );
}
