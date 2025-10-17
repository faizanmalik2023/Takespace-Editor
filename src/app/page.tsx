'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Line, Text as KonvaText } from 'react-konva';
import MathRenderer from '../components/MathRenderer';
import MathShape from '../components/MathShape';
import GraphShape from '../components/GraphShape';
import MathModal from '../components/MathModal';
import TableModal from '../components/TableModal';
import GraphModal from '../components/GraphModal';
import TextEditModal from '../components/TextEditModal';
import ClearCanvasModal from '../components/ClearCanvasModal';
import Toolbar from '../components/Toolbar';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import QuestionForm from '../components/QuestionForm';
import AnswerForm from '../components/AnswerForm';
import CurriculumSelector from '../components/CurriculumSelector';
import ProtectedRoute from '../components/ProtectedRoute';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Tool, Shape, Answer } from '../types';
import 'katex/dist/katex.min.css';
import { FiCheck, FiInfo } from 'react-icons/fi';

function CurriculumEditor() {
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('editor');
  const [questionTitle, setQuestionTitle] = useState<string>('');
  const [questionContent, setQuestionContent] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveProgress, setSaveProgress] = useState<string>('');
  const [answerStageRefs, setAnswerStageRefs] = useState<{ [answerId: string]: any }>({});
  
  // Curriculum categorization state
  const [syllabus, setSyllabus] = useState<string>('');
  const [grade, setGrade] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [unit, setUnit] = useState<string>('');
  const [topic, setTopic] = useState<string>('');
  
  // Answer state
  const [answers, setAnswers] = useState<Answer[]>([
    { id: '1', text: '', type: 'text', shapes: [], isCorrect: true },
    { id: '2', text: '', type: 'text', shapes: [], isCorrect: false },
    { id: '3', text: '', type: 'text', shapes: [], isCorrect: false },
    { id: '4', text: '', type: 'text', shapes: [], isCorrect: false },
  ]);
  const [currentLine, setCurrentLine] = useState<number[]>([]);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [textInput, setTextInput] = useState('');
  const [showMathModal, setShowMathModal] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [showGraphModal, setShowGraphModal] = useState(false);
  const [editingText, setEditingText] = useState<string | null>(null);
  const [textEditValue, setTextEditValue] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<number[]>([]);
  const [drawingPaths, setDrawingPaths] = useState<number[][]>([]);
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update stage size when container resizes
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setStageSize({ width: rect.width - 40, height: 600 });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Generate unique ID for shapes
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Handle stage mouse down
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

  // Handle stage mouse move
  const handleStageMouseMove = (e: any) => {
    if (!isDrawing || (activeTool !== 'draw' && activeTool !== 'line' && activeTool !== 'arrow')) return;
    
    const pos = e.target.getStage().getPointerPosition();
    
    if (activeTool === 'draw') {
      // For draw tool, add all points to create a freehand path
      setCurrentPath(prev => [...prev, pos.x, pos.y]);
    } else if (activeTool === 'line' || activeTool === 'arrow') {
      // For line and arrow tools, only keep start and current position (2 points)
      setCurrentPath(prev => [prev[0], prev[1], pos.x, pos.y]);
    }
  };

  // Handle stage mouse up
  const handleStageMouseUp = (e: any) => {
    if (!isDrawing) return;
    
    if (activeTool === 'draw') {
      // Create a new path shape for freehand drawing
      const newPath: Shape = {
        id: generateId(),
        type: 'path',
        path: currentPath,
        stroke: strokeColor,
        strokeWidth: strokeWidth
      };
      setShapes([...shapes, newPath]);
    } else if (activeTool === 'line') {
      // Create a new line shape
      const newLine: Shape = {
        id: generateId(),
        type: 'line',
        points: currentPath,
        stroke: strokeColor,
        strokeWidth: strokeWidth
      };
      setShapes([...shapes, newLine]);
    } else if (activeTool === 'arrow') {
      // Create a new arrow shape
      const newArrow: Shape = {
        id: generateId(),
        type: 'arrow',
        points: currentPath,
        stroke: strokeColor,
        strokeWidth: strokeWidth
      };
      setShapes([...shapes, newArrow]);
    }
    
    setIsDrawing(false);
    setCurrentPath([]);
  };

  // Handle stage click (for other tools)
  const handleStageClick = (e: any) => {
    if (activeTool === 'select') {
      setSelectedShape(null);
      return;
    }

    const pos = e.target.getStage().getPointerPosition();
    
    if (activeTool === 'text') {
      const newText: Shape = {
        id: generateId(),
        type: 'text',
        x: pos.x,
        y: pos.y,
        text: 'Click to edit',
        fill: '#1f2937',
        width: 200,
        height: 30
      };
      setShapes([...shapes, newText]);
    } else if (activeTool === 'rectangle') {
      const newRect: Shape = {
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
      setShapes([...shapes, newRect]);
    } else if (activeTool === 'circle') {
      const newCircle: Shape = {
        id: generateId(),
        type: 'circle',
        x: pos.x,
        y: pos.y,
        radius: 30,
        fill: '#ffffff',
        stroke: '#000000',
        strokeWidth: 2
      };
      setShapes([...shapes, newCircle]);
    }
  };

  // Handle shape selection
  const handleShapeClick = (e: any, shapeId: string) => {
    e.cancelBubble = true;
    setSelectedShape(shapeId);
    
    // If it's a text shape, enable editing
    const shape = shapes.find(s => s.id === shapeId);
    if (shape && shape.type === 'text') {
      setEditingText(shapeId);
      setTextEditValue(shape.text || '');
    }
  };


  // Cancel text editing
  const cancelTextEdit = () => {
    setEditingText(null);
    setTextEditValue('');
  };

  // Handle shape drag
  const handleShapeDrag = (e: any, shapeId: string) => {
    const newShapes = shapes.map(shape => {
      if (shape.id === shapeId) {
        return {
          ...shape,
          x: e.target.x(),
          y: e.target.y()
        };
      }
      return shape;
    });
    setShapes(newShapes);
  };

  // Handle math shape drag
  const handleMathShapeDrag = (e: any, shapeId: string, newX: number, newY: number) => {
    const newShapes = shapes.map(shape => {
      if (shape.id === shapeId) {
        return {
          ...shape,
          x: newX,
          y: newY
        };
      }
      return shape;
    });
    setShapes(newShapes);
  };

  // Delete selected shape
  const deleteSelectedShape = () => {
    if (selectedShape) {
      setShapes(shapes.filter(shape => shape.id !== selectedShape));
      setSelectedShape(null);
    }
  };

  // Add math expression
  const addMathExpression = (expression: string) => {
    const newMath: Shape = {
      id: generateId(),
      type: 'math',
      x: 50,
      y: 50,
      expression: expression,
      fill: '#1f2937'
    };
    setShapes([...shapes, newMath]);
  };

  // Add table
  const addTable = (tableData: string[][]) => {
    const tableText = tableData.map(row => row.join(' & ')).join(' \\\\ ');
    const newMath: Shape = {
      id: generateId(),
      type: 'math',
      x: 50,
      y: 100,
      expression: `\\begin{array}{|${'c|'.repeat(tableData[0].length)}} \\hline ${tableText} \\\\ \\hline \\end{array}`,
      fill: '#1f2937'
    };
    setShapes([...shapes, newMath]);
  };

  // Add graph
  const addGraph = (graphType: 'line' | 'bar' | 'scatter', graphData: {x: string, y: number}[]) => {
    const newGraph: Shape = {
      id: generateId(),
      type: 'graph',
      x: 50,
      y: 150,
      width: 300,
      height: 200,
      graphType: graphType,
      graphData: graphData
    };
    setShapes([...shapes, newGraph]);
  };

  // Clear canvas
  const clearCanvas = () => {
    setShapes([]);
    setSelectedShape(null);
    setEditingText(null);
    setTextEditValue('');
    setIsDrawing(false);
    setCurrentPath([]);
    setDrawingPaths([]);
    setShowClearConfirm(false);
  };

  // Convert Konva stage to PNG Blob for API upload
  const convertStageToBlob = (stage: any, width: number, height: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      try {
        // Create a temporary canvas with white background
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = width * 2; // 2x for high quality
        tempCanvas.height = height * 2;
        
        if (!tempCtx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        // Fill with white background
        tempCtx.fillStyle = '#ffffff';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        
        // Get the stage as image data
        const stageDataURL = stage.toDataURL({
          mimeType: 'image/png',
          quality: 1.0,
          pixelRatio: 2,
          width: width,
          height: height
        });
        
        // Create image from stage data
        const img = new Image();
        img.onload = () => {
          // Draw the stage image on top of white background
          tempCtx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);
          
          // Convert to blob
          tempCanvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob from canvas'));
            }
          }, 'image/png', 1.0);
        };
        img.onerror = () => {
          reject(new Error('Failed to load stage image'));
        };
        img.src = stageDataURL;
      } catch (error) {
        reject(error);
      }
    });
  };

  // Mock API function - Replace this with your actual API endpoint
  const sendQuestionToAPI = async (formData: FormData): Promise<any> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock successful response
    console.log('=== MOCK API CALL ===');
    console.log('FormData contents:');
    for (const [key, value] of formData.entries()) {
      if (value instanceof Blob) {
        console.log(`${key}: [Blob/File - ${value.size} bytes, type: ${value.type}]`);
      } else {
        console.log(`${key}:`, value);
      }
    }
    console.log('===================');
    
    // Return mock success response
    return {
      success: true,
      questionId: 'mock-question-' + Date.now(),
      message: 'Question saved successfully'
    };
    
    /* 
    // REPLACE THE ABOVE WITH YOUR ACTUAL API CALL:
    const response = await fetch('https://your-api.com/api/questions', {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header - browser will set it automatically with boundary
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
    */
  };

  // Save question and answers - Send to API
  const saveQuestionAndAnswers = async () => {
    setIsSaving(true);
    setSaveProgress('Validating data...');
    
    try {
      // Validation
      if (!questionTitle.trim()) {
        alert('Please enter a question title');
        setIsSaving(false);
        setSaveProgress('');
        return;
      }

      if (!syllabus || !grade || !subject || !unit || !topic) {
        alert('Please select all curriculum fields (Syllabus, Grade, Subject, Unit, Topic)');
        setIsSaving(false);
        setSaveProgress('');
        return;
      }

      const timestamp = Date.now();
      
      // Step 1: Create FormData for multipart/form-data upload
      setSaveProgress('Preparing files...');
      const formData = new FormData();
      
      // Add curriculum information
      formData.append('syllabus', syllabus);
      formData.append('grade', grade);
      formData.append('subject', subject);
      formData.append('unit', unit);
      formData.append('topic', topic);
      
      // Add question details
      formData.append('title', questionTitle);
      formData.append('content', questionContent || 'Question created with visual elements');
      formData.append('timestamp', new Date().toISOString());
      
      // Step 2: Convert and add question canvas as PNG blob
      if (stageRef.current && shapes.length > 0) {
        setSaveProgress('Processing question canvas...');
        try {
          const questionBlob = await convertStageToBlob(stageRef.current, stageSize.width, stageSize.height);
          formData.append('questionCanvas', questionBlob, `question_canvas_${timestamp}.png`);
          formData.append('hasQuestionCanvas', 'true');
        } catch (error) {
          console.error('Error converting question canvas:', error);
          formData.append('hasQuestionCanvas', 'false');
        }
      } else {
        formData.append('hasQuestionCanvas', 'false');
      }

      // Step 3: Process and add answer data
      setSaveProgress('Processing answers...');
      const answerPromises = answers.map(async (answer, index) => {
        const answerData = {
          id: answer.id,
          text: answer.text,
          type: answer.type,
          isCorrect: answer.isCorrect,
          position: index
        };
        
        // Add answer metadata
        formData.append(`answers[${index}]`, JSON.stringify(answerData));
        
        // Convert and add answer canvas if it exists
        if (answer.type === 'canvas' && answer.shapes.length > 0 && answerStageRefs[answer.id]) {
          try {
            const answerBlob = await convertStageToBlob(answerStageRefs[answer.id], 600, 300);
            const answerType = answer.isCorrect ? 'correct' : 'wrong';
            formData.append(
              `answerCanvas_${index}`, 
              answerBlob, 
              `answer_${index + 1}_${answerType}_${timestamp}.png`
            );
          } catch (error) {
            console.error(`Error converting answer ${index} canvas:`, error);
          }
        }
      });

      await Promise.all(answerPromises);

      // Add metadata
      formData.append('totalShapes', shapes.length.toString());
      formData.append('totalAnswers', answers.length.toString());
      formData.append('correctAnswerIndex', answers.findIndex(a => a.isCorrect).toString());

      // Step 4: Send to API
      setSaveProgress('Sending to server...');
      const response = await sendQuestionToAPI(formData);
      
      // Step 5: Show success message
      setSaveProgress('Complete!');
      setTimeout(() => {
        alert(`Question saved successfully!\n\nQuestion ID: ${response.questionId}\n\nDetails:\n- Title: ${questionTitle}\n- Curriculum: ${syllabus} / ${grade} / ${subject}\n- Unit: ${unit}\n- Topic: ${topic}\n- Answers: ${answers.length}\n- Canvas: ${shapes.length > 0 ? 'Yes' : 'No'}`);
        setSaveProgress('');
        
        // Optionally reset form after successful save
        // setQuestionTitle('');
        // setQuestionContent('');
        // setShapes([]);
        // etc...
      }, 500);
      
    } catch (error) {
      console.error('Error saving question:', error);
      alert(`Error saving question: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease try again.`);
      setSaveProgress('');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E3F3FF]">
      {/* Header */}
      <Header />

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
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

          {/* Content Area */}
          <div className="flex-1 overflow-auto">
            <div className="p-6 space-y-8">
              {/* Curriculum Categorization Section */}
              <CurriculumSelector
                syllabus={syllabus}
                grade={grade}
                subject={subject}
                unit={unit}
                topic={topic}
                onSyllabusChange={setSyllabus}
                onGradeChange={setGrade}
                onSubjectChange={setSubject}
                onUnitChange={setUnit}
                onTopicChange={setTopic}
              />

              {/* Question and Canvas Section */}
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  {/* Question Form */}
                  <div className="xl:col-span-1">
                  <QuestionForm
                    questionTitle={questionTitle}
                    questionContent={questionContent}
                    onTitleChange={setQuestionTitle}
                    onContentChange={setQuestionContent}
                  />
                  </div>

                  {/* Canvas Area */}
                  <div className="xl:col-span-2">
                    <Card variant="elevated" padding="md">
                      <CardHeader>
                        <CardTitle size="md">Visual Editor</CardTitle>
                        <CardDescription>
                          {activeTool === 'draw' 
                            ? 'Click and drag to draw freehand. Use the color picker and stroke width controls above.'
                            : activeTool === 'line'
                            ? 'Click and drag to draw a straight line. Use the color picker and stroke width controls above.'
                            : activeTool === 'arrow'
                            ? 'Click and drag to draw an arrow. Use the color picker and stroke width controls above.'
                            : 'Click on the canvas to add elements. Select elements to move or edit them.'
                          }
                        </CardDescription>
                      </CardHeader>

                    {/* Canvas */}
                    <div 
                      ref={containerRef}
                      className="bg-white border-2 border-gray-200 rounded-xl shadow-lg overflow-hidden relative"
                    >
                      <Stage
                        ref={stageRef}
                        width={stageSize.width}
                        height={stageSize.height}
                        onClick={handleStageClick}
                        onMouseDown={handleStageMouseDown}
                        onMouseMove={handleStageMouseMove}
                        onMouseUp={handleStageMouseUp}
                        onTouchStart={handleStageMouseDown}
                        onTouchMove={handleStageMouseMove}
                        onTouchEnd={handleStageMouseUp}
                      >
                        <Layer>
                          {/* Render shapes */}
                          {shapes.map((shape) => {
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
                          {/* Main line */}
                          <Line
                            points={[x1, y1, x2, y2]}
                            stroke={isSelected ? '#3b82f6' : shape.stroke}
                            strokeWidth={isSelected ? 3 : shape.strokeWidth}
                            onClick={(e) => handleShapeClick(e, shape.id)}
                            draggable
                            onDragEnd={(e) => handleShapeDrag(e, shape.id)}
                          />
                          {/* Arrow head */}
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
                        fill={shape.fill || '#1f2937'}
                        fontSize={16}
                        fontFamily="Arial, sans-serif"
                        onClick={(e) => handleShapeClick(e, shape.id)}
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
                        stroke={shape.stroke || '#000000'}
                        strokeWidth={shape.strokeWidth || 2}
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
                {isDrawing && currentPath.length > 0 && (
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
            
            {/* Render math shapes as HTML overlays */}
            {shapes.map((shape) => {
              if (shape.type === 'math') {
                return (
                  <MathShape
                    key={shape.id}
                    x={shape.x || 0}
                    y={shape.y || 0}
                    expression={shape.expression || ''}
                    fill={shape.fill || '#1f2937'}
                    onClick={(e) => handleShapeClick(e, shape.id)}
                    draggable
                    onDragEnd={(e, newX, newY) => handleMathShapeDrag(e, shape.id, newX, newY)}
                    isSelected={selectedShape === shape.id}
                  />
                );
              }
              return null;
            })}

            {/* Render graph shapes as HTML overlays */}
            {shapes.map((shape) => {
              if (shape.type === 'graph') {
                return (
                  <GraphShape
                    key={shape.id}
                    x={shape.x || 0}
                    y={shape.y || 0}
                    graphType={shape.graphType || 'line'}
                    graphData={shape.graphData || []}
                    width={shape.width || 300}
                    height={shape.height || 200}
                    onClick={(e) => handleShapeClick(e, shape.id)}
                    draggable
                    onDragEnd={(e, newX, newY) => handleMathShapeDrag(e, shape.id, newX, newY)}
                    isSelected={selectedShape === shape.id}
                  />
                );
              }
              return null;
            })}
                      </div>
                    </Card>
                  </div>
                </div>
              </div>

              {/* Answer Section */}
              <div className="max-w-7xl mx-auto">
                <AnswerForm
                  answers={answers}
                  onAnswersChange={setAnswers}
                  onStageRefsReady={setAnswerStageRefs}
                />
              </div>

              {/* Save Button Section */}
              <div className="max-w-7xl mx-auto">
                <Card variant="elevated" padding="lg">
                  <div className="text-center space-y-6">
                    <CardHeader>
                      <CardTitle size="lg">Submit Your Question</CardTitle>
                      <CardDescription>
                        Send your question with all curriculum details and images to the server
                      </CardDescription>
                    </CardHeader>
                    
                    {saveProgress && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-center gap-3">
                          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-blue-700 font-medium">{saveProgress}</span>
                        </div>
                      </div>
                    )}
                    
                    <button
                      onClick={saveQuestionAndAnswers}
                      disabled={isSaving || !syllabus || !grade || !subject || !unit || !topic || !questionTitle.trim()}
                      className={`group relative px-12 py-4 rounded-xl font-semibold text-white transition-all duration-200 ${
                        isSaving || !syllabus || !grade || !subject || !unit || !topic || !questionTitle.trim()
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isSaving ? (
                          <>
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span className="text-lg">Submitting...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                            <span className="text-lg">Submit to Server</span>
                          </>
                        )}
                      </div>
                    </button>
                    
                    <div className="text-sm text-gray-500">
                      <p className="font-medium mb-2">What will be sent:</p>
                      <ul className="mt-2 space-y-1 text-left max-w-md mx-auto">
                        <li className="flex items-center gap-2"><FiCheck className="w-4 h-4 text-green-500" /><strong>Curriculum Details:</strong> Syllabus, Grade, Subject, Unit, Topic</li>
                        <li className="flex items-center gap-2"><FiCheck className="w-4 h-4 text-green-500" /><strong>Question Data:</strong> Title, Content, Metadata</li>
                        <li className="flex items-center gap-2"><FiCheck className="w-4 h-4 text-green-500" /><strong>Question Canvas:</strong> PNG image (if available)</li>
                        <li className="flex items-center gap-2"><FiCheck className="w-4 h-4 text-green-500" /><strong>Answer Data:</strong> All 4 answers with text/canvas</li>
                        <li className="flex items-center gap-2"><FiCheck className="w-4 h-4 text-green-500" /><strong>Answer Canvases:</strong> PNG images for canvas answers</li>
                      </ul>
                      <p className="mt-4 text-xs text-gray-400">
                        (Currently using mock API - Check browser console for FormData details)
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <TextEditModal
        isOpen={!!editingText}
        text={editingText ? (shapes.find(s => s.id === editingText)?.text || '') : ''}
        onSave={(newText) => {
          if (editingText) {
            const newShapes = shapes.map(shape => {
              if (shape.id === editingText) {
                return {
                  ...shape,
                  text: newText
                };
              }
              return shape;
            });
            setShapes(newShapes);
            setEditingText(null);
            setTextEditValue('');
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

export default function Home() {
  return (<ProtectedRoute>
      <CurriculumEditor />
    </ProtectedRoute>
  );
}
