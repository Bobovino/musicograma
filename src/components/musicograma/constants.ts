import { Circle, Square, Triangle, Star, Waves, Minus } from 'lucide-react';
import type { ComponentType } from 'react';
import type { ColorSwatch, InstrumentKey, ShapeKey, Template } from './types';

export const SHAPES: Record<ShapeKey, { icon: ComponentType<{ size?: number; color?: string; fill?: string; strokeWidth?: number }>; label: string }> = {
  circle: { icon: Circle, label: 'Círculo' },
  square: { icon: Square, label: 'Cuadrado' },
  triangle: { icon: Triangle, label: 'Triángulo' },
  star: { icon: Star, label: 'Estrella' },
  wave: { icon: Waves, label: 'Onda' },
  line: { icon: Minus, label: 'Línea' },
};

export const SHAPE_KEYS = Object.keys(SHAPES) as ShapeKey[];

export const COLORS: ColorSwatch[] = [
  { name: 'Coral', hex: '#E8603C' },
  { name: 'Mostaza', hex: '#E8A93C' },
  { name: 'Verde salvia', hex: '#7A9B76' },
  { name: 'Azul petróleo', hex: '#2D6E7E' },
  { name: 'Ciruela', hex: '#7B4B94' },
  { name: 'Rosa polvo', hex: '#D67B9C' },
];

export const INSTRUMENT_ICONS: Record<InstrumentKey, string | null> = {
  none: null,
  violin: '🎻',
  flauta: '🪈',
  tambor: '🥁',
  piano: '🎹',
  trompeta: '🎺',
  guitarra: '🎸',
  voz: '🎤',
  campana: '🔔',
};

export const TEMPLATES: Template[] = [
  {
    name: 'Pedro y el lobo (tema Pedro)',
    segments: 4,
    shapes: ['circle', 'circle', 'square', 'circle'],
    colors: ['#2D6E7E', '#2D6E7E', '#E8603C', '#2D6E7E'],
  },
  {
    name: 'Las cuatro estaciones - Primavera',
    segments: 6,
    shapes: ['wave', 'circle', 'triangle', 'wave', 'star', 'wave'],
    colors: ['#7A9B76', '#E8A93C', '#D67B9C', '#7A9B76', '#E8603C', '#7A9B76'],
  },
  {
    name: 'Estructura AB simple',
    segments: 2,
    shapes: ['circle', 'square'],
    colors: ['#2D6E7E', '#E8603C'],
  },
  {
    name: 'Estructura ABA (rondó simple)',
    segments: 3,
    shapes: ['circle', 'triangle', 'circle'],
    colors: ['#2D6E7E', '#E8A93C', '#2D6E7E'],
  },
];
