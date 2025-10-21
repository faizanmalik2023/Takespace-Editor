'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Line, Text as KonvaText } from 'react-konva';
import MathShape from './MathShape';
import GraphShape from './GraphShape';
import MathModal from './MathModal';
import TableModal from './TableModal';
import GraphModal from './GraphModal';
import TextEditModal from './TextEditModal';
import ClearCanvasModal from './ClearCanvasModal';
import Toolbar from './Toolbar';
import { Tool, Shape } from '../types';
import { FiCheck } from 'react-icons/fi';
import 'katex/dist/katex.min.css';

interface Answer {
  id: string;
  text: string;
  type: 'text' | 'canvas';
  shapes: Shape[];
  isCorrect: boolean;
}

interface AnswerImage {
  id: string;
  image_type: string;
  image: string;
  caption: string;
  alt_text: string;
  sort_order: string;
}

interface AnswerFormProps {
  answers: Answer[];
  onAnswersChange: (answers: Answer[]) => void;
  onStageRefsReady?: (refs: { [answerId: string]: any }) => void;
  existingImages?: AnswerImage[];
  onMakeNewCanvas?: (answerId: string) => void;
  editingAnswerImages?: { [answerId: string]: boolean };
}

export default function AnswerForm({ 
  answers, 
  onAnswersChange, 
  onStageRefsReady, 
  existingImages = [], 
  onMakeNewCanvas,
  editingAnswerImages = {}
}: AnswerFormProps) {
  const [activeAnswerId, setActiveAnswerId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string | null>(null);
  const [showMathModal, setShowMathModal] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [showGraphModal, setShowGraphModal] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<number[]>([]);
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [stageSize, setStageSize] = useState({ width: 600, height: 300 });
  
  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRefs = useRef<{ [answerId: string]: any }>({});

  // Get answer image from existing images
  const getAnswerImage = (answerId: string) => {
    const imageTypeMap: { [key: string]: string } = {
      '1': 'choice_a',
      '2': 'choice_b', 
      '3': 'choice_c',
      '4': 'choice_d'
    };
    return existingImages.find(img => img.image_type === imageTypeMap[answerId]);
  };

  // Generate unique ID
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Update stage size based on container
  useEffect(() => {
    const updateStageSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = containerRef.current.offsetHeight;
        setStageSize({
          width: Math.max(600, containerWidth - 4), // Account for border
          height: Math.max(300, containerHeight - 4)
        });
      }
    };

    updateStageSize();
    
    // Use ResizeObserver for better performance
    const resizeObserver = new ResizeObserver(updateStageSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    window.addEventListener('resize', updateStageSize);
    
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateStageSize);
    };
  }, [activeAnswerId]);

  // Notify parent when stage refs are ready
  useEffect(() => {
    if (onStageRefsReady) {
      onStageRefsReady(stageRefs.current);
    }
  }, [answers, onStageRefsReady]);

  // Get current answer
  const getCurrentAnswer = () => answers.find(a => a.id === activeAnswerId);

  // Update answer
  const updateAnswer = (answerId: string, updates: Partial<Answer>) => {
    const newAnswers = answers.map(answer => 
      answer.id === answerId ? { ...answer, ...updates } : answer
    );
    onAnswersChange(newAnswers);
  };

  // Handle canvas interactions
  const handleStageMouseDown = (e: any) => {
    const pos = e.target.getStage().getPointerPosition();
    
    if (activeTool === 'draw' || activeTool === 'line' || activeTool === 'arrow') {
      setIsDrawing(true);
      setCurrentPath([pos.x, pos.y]);
      return;
    }
    
    if (activeTool === 'select') {
      setSelectedShape(null);
      return;
    }
  };

  const handleStageMouseMove = (e: any) => {
    if (!isDrawing || (activeTool !== 'draw' && activeTool !== 'line' && activeTool !== 'arrow')) return;
    
    const pos = e.target.getStage().getPointerPosition();
    
    if (activeTool === 'draw') {
      setCurrentPath(prev => [...prev, pos.x, pos.y]);
    } else if (activeTool === 'line' || activeTool === 'arrow') {
      setCurrentPath(prev => [prev[0], prev[1], pos.x, pos.y]);
    }
  };

  const handleStageMouseUp = (e: any) => {
    if (!isDrawing || !activeAnswerId) return;
    
    const currentAnswer = getCurrentAnswer();
    if (!currentAnswer) return;
    
    let newShape: Shape | null = null;
    
    if (activeTool === 'draw') {
      newShape = {
        id: generateId(),
        type: 'path',
        path: currentPath,
        stroke: strokeColor,
        strokeWidth: strokeWidth
      };
    } else if (activeTool === 'line') {
      newShape = {
        id: generateId(),
        type: 'line',
        points: currentPath,
        stroke: strokeColor,
        strokeWidth: strokeWidth
      };
    } else if (activeTool === 'arrow') {
      newShape = {
        id: generateId(),
        type: 'arrow',
        points: currentPath,
        stroke: strokeColor,
        strokeWidth: strokeWidth
      };
    }
    
    if (newShape && activeAnswerId) {
      updateAnswer(activeAnswerId, {
        shapes: [...currentAnswer.shapes, newShape]
      });
    }
    
    setIsDrawing(false);
    setCurrentPath([]);
  };

  const handleStageClick = (e: any) => {
    if (activeTool === 'select') {
      setSelectedShape(null);
      return;
    }

    const pos = e.target.getStage().getPointerPosition();
    const currentAnswer = getCurrentAnswer();
    if (!currentAnswer) return;
    
    let newShape: Shape | null = null;
    
    if (activeTool === 'text') {
      newShape = {
        id: generateId(),
        type: 'text',
        x: pos.x,
        y: pos.y,
        text: 'Click to edit',
        fill: '#1f2937',
        width: 200,
        height: 30
      };
    } else if (activeTool === 'rectangle') {
      newShape = {
        id: generateId(),
        type: 'rectangle',
        x: pos.x,
        y: pos.y,
        width: 100,
        height: 60,
        fill: '#ffffff',
        stroke: '#000000',
        strokeWidth: 2
      };
    } else if (activeTool === 'circle') {
      newShape = {
        id: generateId(),
        type: 'circle',
        x: pos.x,
        y: pos.y,
        radius: 30,
        fill: '#ffffff',
        stroke: '#000000',
        strokeWidth: 2
      };
    }
    
    if (newShape && activeAnswerId) {
      updateAnswer(activeAnswerId, {
        shapes: [...currentAnswer.shapes, newShape]
      });
    }
  };

  const handleShapeClick = (e: any, shapeId: string) => {
    e.cancelBubble = true;
    setSelectedShape(shapeId);
  };

  const handleShapeDrag = (e: any, shapeId: string) => {
    const currentAnswer = getCurrentAnswer();
    if (!currentAnswer || !activeAnswerId) return;
    
    const newShapes = currentAnswer.shapes.map(shape => {
      if (shape.id === shapeId) {
        return {
          ...shape,
          x: e.target.x(),
          y: e.target.y()
        };
      }
      return shape;
    });
    
    updateAnswer(activeAnswerId, { shapes: newShapes });
  };

  const deleteSelectedShape = () => {
    if (!selectedShape || !activeAnswerId) return;
    
    const currentAnswer = getCurrentAnswer();
    if (!currentAnswer) return;
    
    const newShapes = currentAnswer.shapes.filter(shape => shape.id !== selectedShape);
    updateAnswer(activeAnswerId, { shapes: newShapes });
    setSelectedShape(null);
  };

  const clearCanvas = () => {
    if (!activeAnswerId) return;
    updateAnswer(activeAnswerId, { shapes: [] });
    setShowClearConfirm(false);
  };

  // Modal handlers
  const addMathExpression = (expression: string) => {
    if (!activeAnswerId) return;
    const currentAnswer = getCurrentAnswer();
    if (!currentAnswer) return;
    
    const newShape: Shape = {
      id: generateId(),
      type: 'math',
      x: 50,
      y: 50,
      expression: expression
    };
    
    updateAnswer(activeAnswerId, {
      shapes: [...currentAnswer.shapes, newShape]
    });
    setShowMathModal(false);
  };

  const addTable = (tableData: string[][]) => {
    if (!activeAnswerId) return;
    const currentAnswer = getCurrentAnswer();
    if (!currentAnswer) return;
    
    const latexTable = `\\begin{array}{${'c'.repeat(tableData[0].length)}}
${tableData.map(row => row.join(' & ')).join(' \\\\ ')}
\\end{array}`;
    
    const newShape: Shape = {
      id: generateId(),
      type: 'math',
      x: 50,
      y: 50,
      expression: latexTable
    };
    
    updateAnswer(activeAnswerId, {
      shapes: [...currentAnswer.shapes, newShape]
    });
    setShowTableModal(false);
  };

  const addGraph = (graphType: 'line' | 'bar' | 'scatter', graphData: {x: string, y: number}[]) => {
    if (!activeAnswerId) return;
    const currentAnswer = getCurrentAnswer();
    if (!currentAnswer) return;
    
    const newShape: Shape = {
      id: generateId(),
      type: 'graph',
      x: 50,
      y: 50,
      graphType: graphType,
      graphData: graphData
    };
    
    updateAnswer(activeAnswerId, {
      shapes: [...currentAnswer.shapes, newShape]
    });
    setShowGraphModal(false);
  };

  const cancelTextEdit = () => {
    setEditingText(null);
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
            Multiple Choice Answers
          </h2>
          <p className="text-gray-600 font-medium">
            Create 4 answers - one correct and three incorrect options
          </p>
        </div>

        {/* Answer Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-x-auto">
          {answers.map((answer, index) => (
            <div key={answer.id} className="space-y-4 min-w-0 w-full">
              {/* Answer Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    answer.isCorrect 
                      ? 'bg-gradient-to-r from-green-500 to-green-600' 
                      : 'bg-gradient-to-r from-gray-400 to-gray-500'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="font-semibold text-gray-800">
                    {answer.isCorrect ? 'Correct Answer' : 'Option ' + (index + 1)}
                  </span>
                </div>
                <button
                  onClick={() => setActiveAnswerId(answer.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeAnswerId === answer.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {activeAnswerId === answer.id ? 'Active' : 'Select'}
                </button>
              </div>

              {/* Answer Type Selection */}
              <div className="flex gap-2">
                <button
                  onClick={() => updateAnswer(answer.id, { type: 'text' })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    answer.type === 'text'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Text
                </button>
                <button
                  onClick={() => updateAnswer(answer.id, { type: 'canvas' })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    answer.type === 'canvas'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Canvas
                </button>
              </div>

              {/* Answer Content */}
              {answer.type === 'text' ? (
                <div className="space-y-2">
                  <textarea
                    value={answer.text}
                    onChange={(e) => updateAnswer(answer.id, { text: e.target.value })}
                    placeholder={`Enter answer option ${index + 1}...`}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 font-medium resize-none"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Mini Toolbar */}
                  {activeAnswerId === answer.id && (
                    <div className="bg-gray-50 rounded-xl p-3">
                      <Toolbar
                        activeTool={activeTool}
                        onToolChange={setActiveTool}
                        onShowMathModal={() => setShowMathModal(true)}
                        onShowTableModal={() => setShowTableModal(true)}
                        onShowGraphModal={() => setShowGraphModal(true)}
                        onDeleteSelected={deleteSelectedShape}
                        onClearCanvas={() => setShowClearConfirm(true)}
                        selectedShape={selectedShape}
                        strokeColor={strokeColor}
                        onStrokeColorChange={setStrokeColor}
                        strokeWidth={strokeWidth}
                        onStrokeWidthChange={setStrokeWidth}
                      />
                    </div>
                  )}

                  {/* Canvas */}
                  <div 
                    ref={activeAnswerId === answer.id ? containerRef : null}
                    className="bg-white border-2 border-gray-200 rounded-xl shadow-sm relative w-full overflow-visible"
                    style={{ minWidth: '600px', minHeight: '300px', width: '600px' }}
                  >
                    <Stage
                      ref={(ref) => {
                        if (ref) {
                          stageRefs.current[answer.id] = ref;
                        }
                        if (activeAnswerId === answer.id) {
                          stageRef.current = ref;
                        }
                      }}
                      width={stageSize.width}
                      height={stageSize.height}
                      onClick={activeAnswerId === answer.id ? handleStageClick : undefined}
                      onMouseDown={activeAnswerId === answer.id ? handleStageMouseDown : undefined}
                      onMouseMove={activeAnswerId === answer.id ? handleStageMouseMove : undefined}
                      onMouseUp={activeAnswerId === answer.id ? handleStageMouseUp : undefined}
                    >
                      <Layer>
                        {/* Render shapes */}
                        {answer.shapes.map((shape) => {
                          const isSelected = selectedShape === shape.id;
                          
                          if (shape.type === 'rectangle') {
                            return (
                              <Rect
                                key={shape.id}
                                x={shape.x}
                                y={shape.y}
                                width={shape.width}
                                height={shape.height}
                                fill={shape.fill}
                                stroke={isSelected ? '#3b82f6' : shape.stroke}
                                strokeWidth={isSelected ? 3 : shape.strokeWidth}
                                onClick={(e) => handleShapeClick(e, shape.id)}
                                draggable
                                onDragEnd={(e) => handleShapeDrag(e, shape.id)}
                              />
                            );
                          }
                          
                          if (shape.type === 'circle') {
                            return (
                              <Circle
                                key={shape.id}
                                x={shape.x}
                                y={shape.y}
                                radius={shape.radius}
                                fill={shape.fill}
                                stroke={isSelected ? '#3b82f6' : shape.stroke}
                                strokeWidth={isSelected ? 3 : shape.strokeWidth}
                                onClick={(e) => handleShapeClick(e, shape.id)}
                                draggable
                                onDragEnd={(e) => handleShapeDrag(e, shape.id)}
                              />
                            );
                          }
                          
                          if (shape.type === 'line') {
                            return (
                              <Line
                                key={shape.id}
                                points={shape.points}
                                stroke={isSelected ? '#3b82f6' : shape.stroke}
                                strokeWidth={isSelected ? 3 : shape.strokeWidth}
                                onClick={(e) => handleShapeClick(e, shape.id)}
                                draggable
                                onDragEnd={(e) => handleShapeDrag(e, shape.id)}
                              />
                            );
                          }
                          
                          if (shape.type === 'arrow') {
                            const points = shape.points || [];
                            if (points.length >= 4) {
                              const [x1, y1, x2, y2] = points;
                              const angle = Math.atan2(y2 - y1, x2 - x1);
                              const arrowLength = 15;
                              const arrowAngle = Math.PI / 6;
                              
                              const arrowX1 = x2 - arrowLength * Math.cos(angle - arrowAngle);
                              const arrowY1 = y2 - arrowLength * Math.sin(angle - arrowAngle);
                              const arrowX2 = x2 - arrowLength * Math.cos(angle + arrowAngle);
                              const arrowY2 = y2 - arrowLength * Math.sin(angle + arrowAngle);
                              
                              return (
                                <React.Fragment key={shape.id}>
                                  <Line
                                    points={[x1, y1, x2, y2]}
                                    stroke={isSelected ? '#3b82f6' : shape.stroke}
                                    strokeWidth={isSelected ? 3 : shape.strokeWidth}
                                    onClick={(e) => handleShapeClick(e, shape.id)}
                                    draggable
                                    onDragEnd={(e) => handleShapeDrag(e, shape.id)}
                                  />
                                  <Line
                                    points={[arrowX1, arrowY1, x2, y2, arrowX2, arrowY2]}
                                    stroke={isSelected ? '#3b82f6' : shape.stroke}
                                    strokeWidth={isSelected ? 3 : shape.strokeWidth}
                                    onClick={(e) => handleShapeClick(e, shape.id)}
                                    draggable
                                    onDragEnd={(e) => handleShapeDrag(e, shape.id)}
                                  />
                                </React.Fragment>
                              );
                            }
                            return null;
                          }
                          
                          if (shape.type === 'text') {
                            return (
                              <KonvaText
                                key={shape.id}
                                x={shape.x}
                                y={shape.y}
                                text={shape.text}
                                fill={isSelected ? '#3b82f6' : shape.fill}
                                fontSize={16}
                                fontFamily="Arial"
                                width={shape.width}
                                height={shape.height}
                                onClick={(e) => {
                                  handleShapeClick(e, shape.id);
                                  setEditingText(shape.id);
                                }}
                                draggable
                                onDragEnd={(e) => handleShapeDrag(e, shape.id)}
                              />
                            );
                          }
                          
                          if (shape.type === 'path') {
                            return (
                              <Line
                                key={shape.id}
                                points={shape.path}
                                stroke={isSelected ? '#3b82f6' : shape.stroke}
                                strokeWidth={isSelected ? 3 : shape.strokeWidth}
                                lineCap="round"
                                lineJoin="round"
                                onClick={(e) => handleShapeClick(e, shape.id)}
                                draggable
                                onDragEnd={(e) => handleShapeDrag(e, shape.id)}
                              />
                            );
                          }
                          
                          return null;
                        })}
                        
                        {/* Current drawing path */}
                        {isDrawing && currentPath.length > 0 && activeAnswerId === answer.id && (
                          <>
                            <Line
                              points={currentPath}
                              stroke={strokeColor}
                              strokeWidth={strokeWidth}
                              lineCap={activeTool === 'line' || activeTool === 'arrow' ? 'round' : 'round'}
                              lineJoin={activeTool === 'line' || activeTool === 'arrow' ? 'round' : 'round'}
                            />
                            {/* Arrow preview */}
                            {activeTool === 'arrow' && currentPath.length >= 4 && (() => {
                              const [x1, y1, x2, y2] = currentPath;
                              const angle = Math.atan2(y2 - y1, x2 - x1);
                              const arrowLength = 15;
                              const arrowAngle = Math.PI / 6;
                              
                              const arrowX1 = x2 - arrowLength * Math.cos(angle - arrowAngle);
                              const arrowY1 = y2 - arrowLength * Math.sin(angle - arrowAngle);
                              const arrowX2 = x2 - arrowLength * Math.cos(angle + arrowAngle);
                              const arrowY2 = y2 - arrowLength * Math.sin(angle + arrowAngle);
                              
                              return (
                                <Line
                                  points={[arrowX1, arrowY1, x2, y2, arrowX2, arrowY2]}
                                  stroke={strokeColor}
                                  strokeWidth={strokeWidth}
                                />
                              );
                            })()}
                          </>
                        )}
                      </Layer>
                    </Stage>
                    
                    {/* Render math and graph shapes as HTML overlays */}
                    {answer.shapes.map((shape) => {
                      if (shape.type === 'math') {
                        return (
                          <MathShape
                            key={shape.id}
                            x={shape.x || 0}
                            y={shape.y || 0}
                            expression={shape.expression || ''}
                            onClick={(e) => handleShapeClick(e, shape.id)}
                            draggable={true}
                            onDragEnd={(e, newX, newY) => {
                              const currentAnswer = getCurrentAnswer();
                              if (!currentAnswer || !activeAnswerId) return;
                              
                              const newShapes = currentAnswer.shapes.map(s => {
                                if (s.id === shape.id) {
                                  return { ...s, x: newX, y: newY };
                                }
                                return s;
                              });
                              
                              updateAnswer(activeAnswerId, { shapes: newShapes });
                            }}
                            isSelected={selectedShape === shape.id}
                          />
                        );
                      }
                      
                      if (shape.type === 'graph') {
                        return (
                          <GraphShape
                            key={shape.id}
                            x={shape.x || 0}
                            y={shape.y || 0}
                            graphType={shape.graphType || 'line'}
                            graphData={shape.graphData || []}
                            width={250}
                            height={150}
                            onClick={(e) => handleShapeClick(e, shape.id)}
                            draggable={true}
                            onDragEnd={(e, newX, newY) => {
                              const currentAnswer = getCurrentAnswer();
                              if (!currentAnswer || !activeAnswerId) return;
                              
                              const newShapes = currentAnswer.shapes.map(s => {
                                if (s.id === shape.id) {
                                  return { ...s, x: newX, y: newY };
                                }
                                return s;
                              });
                              
                              updateAnswer(activeAnswerId, { shapes: newShapes });
                            }}
                            isSelected={selectedShape === shape.id}
                          />
                        );
                      }
                      
                      return null;
                    })}
                  </div>
                </div>
              )}

              {/* Correct Answer Toggle */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    // Set all other answers to incorrect
                    const newAnswers = answers.map(a => ({
                      ...a,
                      isCorrect: a.id === answer.id
                    }));
                    onAnswersChange(newAnswers);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    answer.isCorrect
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {answer.isCorrect ? (
                    <>
                      <FiCheck className="w-4 h-4 mr-1" />
                      Correct Answer
                    </>
                  ) : 'Mark as Correct'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <TextEditModal
        isOpen={!!editingText}
        text={editingText ? (getCurrentAnswer()?.shapes.find(s => s.id === editingText)?.text || '') : ''}
        onSave={(newText) => {
          if (editingText && activeAnswerId) {
            const currentAnswer = getCurrentAnswer();
            if (!currentAnswer) return;
            
            const newShapes = currentAnswer.shapes.map(shape => {
              if (shape.id === editingText) {
                return { ...shape, text: newText };
              }
              return shape;
            });
            
            updateAnswer(activeAnswerId, { shapes: newShapes });
            setEditingText(null);
          }
        }}
        onCancel={cancelTextEdit}
      />

      <ClearCanvasModal
        isOpen={showClearConfirm}
        onConfirm={clearCanvas}
        onCancel={() => setShowClearConfirm(false)}
      />

      <MathModal
        isOpen={showMathModal}
        onClose={() => setShowMathModal(false)}
        onAddMath={addMathExpression}
      />

      <TableModal
        isOpen={showTableModal}
        onClose={() => setShowTableModal(false)}
        onAddTable={addTable}
      />

      <GraphModal
        isOpen={showGraphModal}
        onClose={() => setShowGraphModal(false)}
        onAddGraph={addGraph}
      />
    </div>
  );
}
