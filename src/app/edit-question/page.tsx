'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Line, Text as KonvaText } from 'react-konva';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Toolbar from '../../components/Toolbar';
import QuestionForm from '../../components/QuestionForm';
import AnswerForm from '../../components/AnswerForm';
import MathShape from '../../components/MathShape';
import GraphShape from '../../components/GraphShape';
import MathModal from '../../components/MathModal';
import TableModal from '../../components/TableModal';
import GraphModal from '../../components/GraphModal';
import TextEditModal from '../../components/TextEditModal';
import ClearCanvasModal from '../../components/ClearCanvasModal';
import ProtectedRoute from '../../components/ProtectedRoute';
import { Tool, Shape, Answer } from '../../types';
import 'katex/dist/katex.min.css';

interface SearchResult {
  id: string;
  title: string;
  syllabus: string;
  grade: string;
  subject: string;
  unit: string;
  topic: string;
  createdAt: string;
}

interface QuestionData {
  id: string;
  title: string;
  content: string;
  syllabus: string;
  grade: string;
  subject: string;
  unit: string;
  topic: string;
  answers: Answer[];
}

function EditQuestion() {
  const [activeSection, setActiveSection] = useState<string>('editor');
  const [editMode, setEditMode] = useState<'search' | 'edit'>('search');
  
  // Search state
  const [syllabus, setSyllabus] = useState<string>('');
  const [grade, setGrade] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  
  // Question editing state (same as create page)
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [questionTitle, setQuestionTitle] = useState<string>('');
  const [questionContent, setQuestionContent] = useState<string>('');
  const [unit, setUnit] = useState<string>('');
  const [topic, setTopic] = useState<string>('');
  const [answers, setAnswers] = useState<Answer[]>([
    { id: '1', text: '', type: 'text', shapes: [], isCorrect: true },
    { id: '2', text: '', type: 'text', shapes: [], isCorrect: false },
    { id: '3', text: '', type: 'text', shapes: [], isCorrect: false },
    { id: '4', text: '', type: 'text', shapes: [], isCorrect: false },
  ]);
  const [answerStageRefs, setAnswerStageRefs] = useState<{ [answerId: string]: any }>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveProgress, setSaveProgress] = useState<string>('');
  
  // Canvas state
  const [currentLine, setCurrentLine] = useState<number[]>([]);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
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

  // Mock API: Search questions
  const searchQuestions = async (syllabusVal: string, gradeVal: string, subjectVal: string, query: string): Promise<SearchResult[]> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock search results
    const mockResults: SearchResult[] = [
      {
        id: 'q1',
        title: 'Solve the quadratic equation x² + 5x + 6 = 0',
        syllabus: syllabusVal,
        grade: gradeVal,
        subject: subjectVal,
        unit: 'Algebra',
        topic: 'Quadratic Equations',
        createdAt: '2025-10-05T10:30:00Z'
      },
      {
        id: 'q2',
        title: 'Find the derivative of f(x) = 3x² + 2x - 1',
        syllabus: syllabusVal,
        grade: gradeVal,
        subject: subjectVal,
        unit: 'Calculus',
        topic: 'Differentiation',
        createdAt: '2025-10-04T14:20:00Z'
      },
      {
        id: 'q3',
        title: 'Calculate the area of a circle with radius 5cm',
        syllabus: syllabusVal,
        grade: gradeVal,
        subject: subjectVal,
        unit: 'Geometry',
        topic: 'Area and Perimeter',
        createdAt: '2025-10-03T09:15:00Z'
      },
    ];

    // Filter by search query if provided
    if (query.trim()) {
      return mockResults.filter(result => 
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.topic.toLowerCase().includes(query.toLowerCase())
      );
    }

    return mockResults;
  };

  // Mock API: Fetch question details
  const fetchQuestionDetails = async (questionId: string): Promise<QuestionData> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock question data
    const mockQuestion: QuestionData = {
      id: questionId,
      title: 'Solve the quadratic equation x² + 5x + 6 = 0',
      content: 'Find the roots of the given quadratic equation using any suitable method.',
      syllabus: syllabus,
      grade: grade,
      subject: subject,
      unit: 'Algebra',
      topic: 'Quadratic Equations',
      answers: [
        { id: '1', text: 'x = -2 or x = -3', type: 'text', shapes: [], isCorrect: true },
        { id: '2', text: 'x = 2 or x = 3', type: 'text', shapes: [], isCorrect: false },
        { id: '3', text: 'x = -1 or x = -6', type: 'text', shapes: [], isCorrect: false },
        { id: '4', text: 'x = 1 or x = 6', type: 'text', shapes: [], isCorrect: false },
      ]
    };

    return mockQuestion;
  };

  // Handle search
  const handleSearch = async () => {
    if (!syllabus || !grade || !subject) {
      alert('Please select Syllabus, Grade, and Subject first');
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchQuestions(syllabus, grade, subject, searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      alert('Error searching questions. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle question selection
  const handleSelectQuestion = async (questionId: string) => {
    setSelectedQuestionId(questionId);
    try {
      const questionData = await fetchQuestionDetails(questionId);
      
      // Populate form with question data
      setQuestionTitle(questionData.title);
      setQuestionContent(questionData.content);
      setUnit(questionData.unit);
      setTopic(questionData.topic);
      setAnswers(questionData.answers);
      
      // Clear canvas (user will redraw if needed)
      setShapes([]);
      
      // Switch to edit mode
      setEditMode('edit');
    } catch (error) {
      console.error('Error fetching question:', error);
      alert('Error loading question. Please try again.');
    }
  };

  // Handle back to search
  const handleBackToSearch = () => {
    setEditMode('search');
    setSelectedQuestionId(null);
    setQuestionTitle('');
    setQuestionContent('');
    setUnit('');
    setTopic('');
    setShapes([]);
    setAnswers([
      { id: '1', text: '', type: 'text', shapes: [], isCorrect: true },
      { id: '2', text: '', type: 'text', shapes: [], isCorrect: false },
      { id: '3', text: '', type: 'text', shapes: [], isCorrect: false },
      { id: '4', text: '', type: 'text', shapes: [], isCorrect: false },
    ]);
  };

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
      setCurrentPath(prev => [...prev, pos.x, pos.y]);
    } else if (activeTool === 'line' || activeTool === 'arrow') {
      setCurrentPath(prev => [prev[0], prev[1], pos.x, pos.y]);
    }
  };

  // Handle stage mouse up
  const handleStageMouseUp = (e: any) => {
    if (!isDrawing) return;
    
    if (activeTool === 'draw') {
      const newPath: Shape = {
        id: generateId(),
        type: 'path',
        path: currentPath,
        stroke: strokeColor,
        strokeWidth: strokeWidth
      };
      setShapes([...shapes, newPath]);
    } else if (activeTool === 'line') {
      const newLine: Shape = {
        id: generateId(),
        type: 'line',
        points: currentPath,
        stroke: strokeColor,
        strokeWidth: strokeWidth
      };
      setShapes([...shapes, newLine]);
    } else if (activeTool === 'arrow') {
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

  // Handle stage click
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

  // Handle shape click
  const handleShapeClick = (e: any, shapeId: string) => {
    e.cancelBubble = true;
    setSelectedShape(shapeId);
    
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

  // Save updated question
  const saveUpdatedQuestion = async () => {
    setIsSaving(true);
    setSaveProgress('Updating question...');
    
    try {
      // Mock API call to update question
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSaveProgress('Complete!');
      setTimeout(() => {
        alert('Question updated successfully!');
        setSaveProgress('');
        handleBackToSearch();
      }, 500);
    } catch (error) {
      console.error('Error updating question:', error);
      alert('Error updating question. Please try again.');
      setSaveProgress('');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <Header />

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {editMode === 'search' ? (
            /* SEARCH MODE */
            <div className="flex-1 overflow-auto">
              <div className="p-6">
                <div className="max-w-7xl mx-auto">
                  {/* Page Header */}
                  <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Questions</h1>
                    <p className="text-gray-600">
                      Search and edit your existing questions
                    </p>
                  </div>

                  {/* Search Section */}
                  <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Search Questions</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      {/* Syllabus */}
                      <div>
                        <label htmlFor="search-syllabus" className="block text-sm font-semibold text-gray-700 mb-2">
                          Syllabus
                        </label>
                        <select
                          id="search-syllabus"
                          value={syllabus}
                          onChange={(e) => setSyllabus(e.target.value)}
                          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                        >
                          <option value="">Select Syllabus</option>
                          <option value="IB">IB</option>
                          <option value="IGCSE">IGCSE</option>
                          <option value="Common Core">Common Core</option>
                          <option value="AP">AP</option>
                        </select>
                      </div>

                      {/* Grade */}
                      <div>
                        <label htmlFor="search-grade" className="block text-sm font-semibold text-gray-700 mb-2">
                          Grade
                        </label>
                        <select
                          id="search-grade"
                          value={grade}
                          onChange={(e) => setGrade(e.target.value)}
                          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                        >
                          <option value="">Select Grade</option>
                          <option value="Grade 9">Grade 9</option>
                          <option value="Grade 10">Grade 10</option>
                          <option value="Grade 11">Grade 11</option>
                          <option value="Grade 12">Grade 12</option>
                        </select>
                      </div>

                      {/* Subject */}
                      <div>
                        <label htmlFor="search-subject" className="block text-sm font-semibold text-gray-700 mb-2">
                          Subject
                        </label>
                        <select
                          id="search-subject"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                        >
                          <option value="">Select Subject</option>
                          <option value="Mathematics">Mathematics</option>
                          <option value="Physics">Physics</option>
                          <option value="Chemistry">Chemistry</option>
                          <option value="Biology">Biology</option>
                        </select>
                      </div>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-4">
                      <label htmlFor="search-query" className="block text-sm font-semibold text-gray-700 mb-2">
                        Search by title or topic
                      </label>
                      <div className="flex gap-3">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            id="search-query"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="Type to search questions..."
                            disabled={!syllabus || !grade || !subject}
                            className="w-full px-4 py-2.5 pl-10 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                          <svg
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                        </div>
                        <button
                          onClick={handleSearch}
                          disabled={!syllabus || !grade || !subject || isSearching}
                          className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSearching ? 'Searching...' : 'Search'}
                        </button>
                      </div>
                    </div>

                    {!syllabus || !grade || !subject ? (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                        <p className="text-sm text-yellow-800">
                          ℹ️ Please select Syllabus, Grade, and Subject to enable search
                        </p>
                      </div>
                    ) : null}
                  </div>

                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">
                        Search Results ({searchResults.length})
                      </h3>
                      <div className="space-y-3">
                        {searchResults.map((result) => (
                          <div
                            key={result.id}
                            onClick={() => handleSelectQuestion(result.id)}
                            className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all duration-200 group"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 mb-2">
                                  {result.title}
                                </h4>
                                <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                                  <span className="px-2 py-1 bg-gray-100 rounded-lg">
                                    {result.unit}
                                  </span>
                                  <span className="px-2 py-1 bg-gray-100 rounded-lg">
                                    {result.topic}
                                  </span>
                                  <span className="px-2 py-1 bg-gray-100 rounded-lg">
                                    {new Date(result.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <svg
                                  className="w-6 h-6 text-gray-400 group-hover:text-blue-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty State */}
                  {searchResults.length === 0 && syllabus && grade && subject && (
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-12 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {isSearching ? 'Searching...' : 'Click "Search" to find questions'}
                      </h3>
                      <p className="text-gray-600">
                        Enter keywords or click search to see all questions for the selected criteria
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* EDIT MODE - Reuse layout from create page */
            <>
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

              <div className="flex-1 overflow-auto">
                <div className="p-6 space-y-8">
                  {/* Back Button */}
                  <div className="max-w-7xl mx-auto">
                    <button
                      onClick={handleBackToSearch}
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      <span className="font-medium">Back to Search</span>
                    </button>
                  </div>

                  {/* Edit Header */}
                  <div className="max-w-7xl mx-auto">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        <div>
                          <h3 className="text-lg font-bold text-blue-900">Editing Mode</h3>
                          <p className="text-sm text-blue-700">
                            {syllabus} • {grade} • {subject} • {unit} • {topic}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

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
                        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
                          <div className="mb-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Visual Editor</h3>
                            <p className="text-gray-600">
                              {activeTool === 'draw' 
                                ? 'Click and drag to draw freehand.'
                                : activeTool === 'line'
                                ? 'Click and drag to draw a straight line.'
                                : activeTool === 'arrow'
                                ? 'Click and drag to draw an arrow.'
                                : 'Click on the canvas to add elements. Select elements to move or edit them.'}
                            </p>
                          </div>

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
                                      lineCap="round"
                                      lineJoin="round"
                                    />
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
                        </div>
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

                  {/* Update Button Section */}
                  <div className="max-w-7xl mx-auto">
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8">
                      <div className="text-center space-y-6">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">Update Question</h3>
                          <p className="text-gray-600">
                            Save your changes to update this question
                          </p>
                        </div>
                        
                        {saveProgress && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center justify-center gap-3">
                              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-blue-700 font-medium">{saveProgress}</span>
                            </div>
                          </div>
                        )}
                        
                        <button
                          onClick={saveUpdatedQuestion}
                          disabled={isSaving || !questionTitle.trim()}
                          className={`group relative px-12 py-4 rounded-xl font-semibold text-white transition-all duration-200 ${
                            isSaving || !questionTitle.trim()
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {isSaving ? (
                              <>
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span className="text-lg">Updating...</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
                                </svg>
                                <span className="text-lg">Update Question</span>
                              </>
                            )}
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
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

export default function EditQuestionPage() {
  return (
    <ProtectedRoute>
      <EditQuestion />
    </ProtectedRoute>
  );
}
