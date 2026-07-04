export type ShapeKey = 'circle' | 'square' | 'triangle' | 'star' | 'wave' | 'line';

export type InstrumentKey =
  | 'none'
  | 'violin'
  | 'flauta'
  | 'tambor'
  | 'piano'
  | 'trompeta'
  | 'guitarra'
  | 'voz'
  | 'campana';

export interface Segment {
  id: string;
  start: number;
  end: number;
  shape: ShapeKey;
  color: string;
  icon: InstrumentKey;
  label: string;
}

export interface ColorSwatch {
  name: string;
  hex: string;
}

export interface Template {
  name: string;
  segments: number;
  shapes: ShapeKey[];
  colors: string[];
}

export interface ProjectRecord {
  projectName: string;
  segments: Segment[];
  duration: number;
  audioBlob: Blob | null;
  audioFileName: string | null;
  audioMimeType: string | null;
  savedAt: string;
}

export type AppMode = 'edit' | 'present';
