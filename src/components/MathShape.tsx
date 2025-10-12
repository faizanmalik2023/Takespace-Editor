'use client';

import { useEffect, useRef, useState } from 'react';
import katex from 'katex';

interface MathShapeProps {
  x: number;
  y: number;
  expression: string;
  fontSize?: number;
  fill?: string;
  onClick?: (e: any) => void;
  draggable?: boolean;
  onDragEnd?: (e: any, newX: number, newY: number) => void;
  isSelected?: boolean;
}

export default function MathShape({ 
  x, 
  y, 
  expression, 
  fontSize = 16, 
  fill = '#1f2937',
  onClick,
  draggable = false,
  onDragEnd,
  isSelected = false
}: MathShapeProps) {
  const mathRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x, y });

  useEffect(() => {
    setCurrentPos({ x, y });
  }, [x, y]);

  useEffect(() => {
    if (mathRef.current && expression) {
      try {
        // Remove the $ delimiters if present
        const cleanExpression = expression.replace(/^\$|\$$/g, '');
        katex.render(cleanExpression, mathRef.current, {
          throwOnError: false,
          displayMode: false,
          fontSize: fontSize,
        });
      } catch (error) {
        console.error('KaTeX rendering error:', error);
        if (mathRef.current) {
          mathRef.current.textContent = expression;
        }
      }
    }
  }, [expression, fontSize]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!draggable) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - currentPos.x,
      y: e.clientY - currentPos.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !draggable) return;
    
    e.preventDefault();
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    setCurrentPos({ x: newX, y: newY });
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging || !draggable) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(false);
    
    if (onDragEnd) {
      onDragEnd(e, currentPos.x, currentPos.y);
    }
  };

  // Add global mouse event listeners when dragging
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        setCurrentPos({ x: newX, y: newY });
      };

      const handleGlobalMouseUp = (e: MouseEvent) => {
        setIsDragging(false);
        if (onDragEnd) {
          onDragEnd(e, currentPos.x, currentPos.y);
        }
      };

      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging, dragStart, currentPos, onDragEnd]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        left: currentPos.x,
        top: currentPos.y,
        cursor: draggable ? (isDragging ? 'grabbing' : 'grab') : 'pointer',
        color: fill,
        fontSize: `${fontSize}px`,
        userSelect: 'none',
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.8 : 1,
        border: isSelected ? '2px solid #3b82f6' : 'none',
        borderRadius: isSelected ? '4px' : '0',
        padding: isSelected ? '2px' : '0',
      }}
      onClick={onClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div ref={mathRef} />
    </div>
  );
}
