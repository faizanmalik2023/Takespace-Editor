'use client';

import React, { useState } from 'react';

interface GraphData {
  x: string;
  y: number;
}

interface GraphShapeProps {
  x: number;
  y: number;
  graphType: 'line' | 'bar' | 'scatter';
  graphData: GraphData[];
  width?: number;
  height?: number;
  onClick?: (e: any) => void;
  draggable?: boolean;
  onDragEnd?: (e: any, newX: number, newY: number) => void;
  isSelected?: boolean;
}

export default function GraphShape({ 
  x, 
  y, 
  graphType,
  graphData,
  width = 300,
  height = 200,
  onClick,
  draggable = false,
  onDragEnd,
  isSelected = false
}: GraphShapeProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x, y });

  // Calculate graph dimensions and scaling
  const padding = 40;
  const graphWidth = width - padding * 2;
  const graphHeight = height - padding * 2;
  
  // Find data ranges for scaling
  const xValues = graphData.map(d => parseFloat(d.x) || 0);
  const yValues = graphData.map(d => d.y);
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);
  
  // Add some padding to the data range
  const xRange = maxX - minX || 1;
  const yRange = maxY - minY || 1;
  const xScale = graphWidth / xRange;
  const yScale = graphHeight / yRange;

  // Convert data points to SVG coordinates
  const svgPoints = graphData.map(d => {
    const x = padding + (parseFloat(d.x) - minX) * xScale;
    const y = padding + graphHeight - (d.y - minY) * yScale;
    return { x, y, originalX: d.x, originalY: d.y };
  });

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
  React.useEffect(() => {
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

  const renderGraph = () => {
    switch (graphType) {
      case 'line':
        const linePath = svgPoints.map((point, index) => 
          `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
        ).join(' ');
        
        return (
          <g>
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width={width} height={height} fill="url(#grid)" />
            
            {/* Axes */}
            <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#374151" strokeWidth="2"/>
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#374151" strokeWidth="2"/>
            
            {/* Line */}
            <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth="3"/>
            
            {/* Data points */}
            {svgPoints.map((point, index) => (
              <circle key={index} cx={point.x} cy={point.y} r="4" fill="#3b82f6" stroke="white" strokeWidth="2"/>
            ))}
          </g>
        );

      case 'bar':
        const barWidth = graphWidth / svgPoints.length * 0.8;
        const barSpacing = graphWidth / svgPoints.length;
        
        return (
          <g>
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width={width} height={height} fill="url(#grid)" />
            
            {/* Axes */}
            <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#374151" strokeWidth="2"/>
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#374151" strokeWidth="2"/>
            
            {/* Bars */}
            {svgPoints.map((point, index) => (
              <rect
                key={index}
                x={padding + index * barSpacing + (barSpacing - barWidth) / 2}
                y={point.y}
                width={barWidth}
                height={height - padding - point.y}
                fill="#3b82f6"
                stroke="white"
                strokeWidth="1"
              />
            ))}
          </g>
        );

      case 'scatter':
        return (
          <g>
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width={width} height={height} fill="url(#grid)" />
            
            {/* Axes */}
            <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#374151" strokeWidth="2"/>
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#374151" strokeWidth="2"/>
            
            {/* Scatter points */}
            {svgPoints.map((point, index) => (
              <circle key={index} cx={point.x} cy={point.y} r="6" fill="#3b82f6" stroke="white" strokeWidth="2"/>
            ))}
          </g>
        );

      default:
        return null;
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: currentPos.x,
        top: currentPos.y,
        cursor: draggable ? (isDragging ? 'grabbing' : 'grab') : 'pointer',
        userSelect: 'none',
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.8 : 1,
        border: isSelected ? '2px solid #3b82f6' : 'none',
        borderRadius: isSelected ? '4px' : '0',
        padding: isSelected ? '2px' : '0',
        backgroundColor: 'white',
      }}
      onClick={onClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <svg width={width} height={height} style={{ display: 'block' }}>
        {renderGraph()}
      </svg>
    </div>
  );
}
