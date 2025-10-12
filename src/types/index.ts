// Tool types
export type Tool = 'select' | 'text' | 'draw' | 'rectangle' | 'circle' | 'line' | 'arrow' | 'table' | 'math' | 'graph';

// Shape types for the canvas
export interface Shape {
  id: string;
  type: 'rectangle' | 'circle' | 'line' | 'arrow' | 'text' | 'path' | 'math' | 'graph';
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  radius?: number;
  points?: number[];
  text?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  path?: number[];
  expression?: string;
  graphType?: 'line' | 'bar' | 'scatter';
  graphData?: {x: string, y: number}[];
}

// Answer types for MCQ questions
export interface Answer {
  id: string;
  text: string;
  type: 'text' | 'canvas';
  shapes: Shape[];
  isCorrect: boolean;
}
