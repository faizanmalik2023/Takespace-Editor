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
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Tool, Shape, Answer } from '../../types';
import { 
  getSyllabuses, 
  getLookupGrades, 
  getLookupSubjects, 
  getLookupUnits, 
  getLookupTopics 
} from '../lib/api';
import 'katex/dist/katex.min.css';
import { FiInfo } from 'react-icons/fi';

interface QuestionImage {
  id: string;
  image_type: string;
  image: string;
  caption: string;
  alt_text: string;
  sort_order: string;
}

interface SearchResult {
  id: string;
  text_content: string;
  hint: string;
  correct_answer: string;
  type: string;
  category: string;
  difficulty_level: string;
  choice_a: string;
  choice_b: string;
  choice_c: string;
  choice_d: string;
  wrong_answer_1: string;
  wrong_answer_2: string;
  wrong_answer_3: string;
  images: QuestionImage[];
  topic_name: string;
  unit_name: string;
  subject_name: string;
  created_by_editor_name: string;
  created_at: string;
  modified_at: string;
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
  
  // Lookup API state
  const [availableSyllabuses, setAvailableSyllabuses] = useState<{id: string, name: string}[]>([]);
  const [availableGrades, setAvailableGrades] = useState<{id: string, name: string}[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<{id: string, name: string}[]>([]);
  const [availableUnits, setAvailableUnits] = useState<{id: string, name: string}[]>([]);
  const [availableTopics, setAvailableTopics] = useState<{id: string, name: string}[]>([]);
  
  // Loading states for lookup APIs
  const [loadingSyllabuses, setLoadingSyllabuses] = useState<boolean>(false);
  const [loadingGrades, setLoadingGrades] = useState<boolean>(false);
  const [loadingSubjects, setLoadingSubjects] = useState<boolean>(false);
  const [loadingUnits, setLoadingUnits] = useState<boolean>(false);
  const [loadingTopics, setLoadingTopics] = useState<boolean>(false);
  
  // Question editing state (same as create page)
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [questionTitle, setQuestionTitle] = useState<string>('');
  const [questionContent, setQuestionContent] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('');
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
  
  // Image editing state
  const [editingQuestionImage, setEditingQuestionImage] = useState<boolean>(false);
  const [editingAnswerImages, setEditingAnswerImages] = useState<{ [answerId: string]: boolean }>({});
  const [selectedQuestionData, setSelectedQuestionData] = useState<SearchResult | null>(null);

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

  // Fetch syllabuses on mount
  useEffect(() => {
    const fetchSyllabusesData = async () => {
      try {
        setLoadingSyllabuses(true);
        const response = await getSyllabuses();
        const syllabusData = response?.data?.results || [];
        setAvailableSyllabuses(syllabusData);
      } catch (error) {
        console.error('Error fetching syllabuses:', error);
        setAvailableSyllabuses([]);
      } finally {
        setLoadingSyllabuses(false);
      }
    };

    fetchSyllabusesData();
  }, []);

  // Fetch grades when syllabus is selected
  useEffect(() => {
    if (syllabus) {
      const fetchGradesData = async () => {
        try {
          setLoadingGrades(true);
          // Reset dependent fields
          setGrade('');
          setSubject('');
          setAvailableGrades([]);
          setAvailableSubjects([]);

          const response = await getLookupGrades(syllabus);
          const gradesData = response?.data?.results || [];
          setAvailableGrades(gradesData);
        } catch (error) {
          console.error('Error fetching grades:', error);
          setAvailableGrades([]);
        } finally {
          setLoadingGrades(false);
        }
      };

      fetchGradesData();
    } else {
      setAvailableGrades([]);
      setAvailableSubjects([]);
      setGrade('');
      setSubject('');
    }
  }, [syllabus]);

  // Fetch subjects when syllabus and grade are selected
  useEffect(() => {
    if (syllabus && grade) {
      const fetchSubjectsData = async () => {
        try {
          setLoadingSubjects(true);
          // Reset dependent fields
          setSubject('');
          setAvailableSubjects([]);

          const response = await getLookupSubjects(syllabus, grade);
          const subjectsData = response?.data?.results || [];
          setAvailableSubjects(subjectsData);
        } catch (error) {
          console.error('Error fetching subjects:', error);
          setAvailableSubjects([]);
        } finally {
          setLoadingSubjects(false);
        }
      };

      fetchSubjectsData();
    } else {
      setAvailableSubjects([]);
      setSubject('');
    }
  }, [syllabus, grade]);

  // Real API: Search questions
  const searchQuestions = async (syllabusVal: string, gradeVal: string, subjectVal: string, query: string): Promise<SearchResult[]> => {
    try {
      // Get the access token from localStorage or sessionStorage
      const accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      
      if (!accessToken) {
        throw new Error('No access token found. Please log in again.');
      }

      // Build query parameters
      const params = new URLSearchParams();
      if (syllabusVal) params.append('syllabus_id', syllabusVal);
      if (gradeVal) params.append('grade_id', gradeVal);
      if (subjectVal) params.append('subject_id', subjectVal);
      if (query) params.append('q', query);

      const url = `https://dev.takespace.com/api/v1/editor-questions/search/?${params.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Search API Error Response:', errorText);
        
        // If token is invalid, redirect to login
        if (response.status === 401) {
          alert('Your session has expired. Please log in again.');
          localStorage.removeItem('access_token');
          sessionStorage.removeItem('access_token');
          window.location.href = '/login';
          return [];
        }
        
        throw new Error(`Search API Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data?.data?.questions || [];
      
    } catch (error) {
      console.error('Error searching questions:', error);
      throw error;
    }
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
      // Find the selected question from search results
      const selectedQuestion = searchResults.find(q => q.id === questionId);
      if (!selectedQuestion) {
        throw new Error('Question not found');
      }
      
      // Store the selected question data
      setSelectedQuestionData(selectedQuestion);
      
      // Populate form with question data
      setQuestionContent(selectedQuestion.text_content);
      setUnit(selectedQuestion.unit_name);
      setTopic(selectedQuestion.topic_name);
      
      // Map difficulty level from integer to string
      const difficultyMap: { [key: string]: string } = {
        '1': 'Easy',
        '2': 'Intermediate',
        '3': 'Hard',
        '4': 'Olympiad'
      };
      setDifficulty(difficultyMap[selectedQuestion.difficulty_level] || 'Easy');
      
      // Map answers from API format to our format
      const mappedAnswers: Answer[] = [
        { 
          id: '1', 
          text: selectedQuestion.correct_answer, 
          type: selectedQuestion.images.find(img => img.image_type === 'choice_a') ? 'canvas' : 'text', 
          shapes: [], 
          isCorrect: true 
        },
        { 
          id: '2', 
          text: selectedQuestion.wrong_answer_1, 
          type: selectedQuestion.images.find(img => img.image_type === 'choice_b') ? 'canvas' : 'text', 
          shapes: [], 
          isCorrect: false 
        },
        { 
          id: '3', 
          text: selectedQuestion.wrong_answer_2, 
          type: selectedQuestion.images.find(img => img.image_type === 'choice_c') ? 'canvas' : 'text', 
          shapes: [], 
          isCorrect: false 
        },
        { 
          id: '4', 
          text: selectedQuestion.wrong_answer_3, 
          type: selectedQuestion.images.find(img => img.image_type === 'choice_d') ? 'canvas' : 'text', 
          shapes: [], 
          isCorrect: false 
        }
      ];
      setAnswers(mappedAnswers);
      
      // Clear canvas (user will redraw if needed)
      setShapes([]);
      
      // Switch to edit mode
      setEditMode('edit');
    } catch (error) {
      console.error('Error loading question:', error);
      alert('Error loading question. Please try again.');
    }
  };

  // Handle back to search
  const handleBackToSearch = () => {
    setEditMode('search');
    setSelectedQuestionId(null);
    setSelectedQuestionData(null);
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
    setEditingQuestionImage(false);
    setEditingAnswerImages({});
  };

  // Handle "Make new Canvas" for question image
  const handleMakeNewQuestionCanvas = () => {
    setEditingQuestionImage(true);
    setShapes([]); // Clear existing shapes for new drawing
  };

  // Handle "Make new Canvas" for answer image
  const handleMakeNewAnswerCanvas = (answerId: string) => {
    setEditingAnswerImages(prev => ({
      ...prev,
      [answerId]: true
    }));
  };

  // Get question image from selected question data
  const getQuestionImage = () => {
    if (!selectedQuestionData) return null;
    return selectedQuestionData.images.find(img => img.image_type === 'question');
  };

  // Get answer image from selected question data
  const getAnswerImage = (answerId: string) => {
    if (!selectedQuestionData) return null;
    const imageTypeMap: { [key: string]: string } = {
      '1': 'choice_a',
      '2': 'choice_b', 
      '3': 'choice_c',
      '4': 'choice_d'
    };
    return selectedQuestionData.images.find(img => img.image_type === imageTypeMap[answerId]);
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

  // Save updated question
  const saveUpdatedQuestion = async () => {
    setIsSaving(true);
    setSaveProgress('Validating data...');
    
    try {
      // Check authentication
      if (!selectedQuestionId) {
        alert('No question selected for update');
        setIsSaving(false);
        setSaveProgress('');
        return;
      }

      // Validation
      if (!questionContent.trim()) {
        alert('Please enter question content');
        setIsSaving(false);
        setSaveProgress('');
        return;
      }

      if (!syllabus || !grade || !subject) {
        alert('Please select all curriculum fields (Syllabus, Grade, Subject)');
        setIsSaving(false);
        setSaveProgress('');
        return;
      }

      if (!difficulty) {
        alert('Please select a difficulty level for the question');
        setIsSaving(false);
        setSaveProgress('');
        return;
      }

      const timestamp = Date.now();
      
      // Step 1: Create FormData for multipart/form-data upload
      setSaveProgress('Preparing files...');
      const formData = new FormData();
      
      // Add question details
      formData.append('text_content', questionContent);
      
      // Map difficulty level to integer
      const difficultyMap: { [key: string]: string } = {
        'Easy': '1',
        'Intermediate': '2', 
        'Hard': '3',
        'Olympiad': '4'
      };
      const mappedDifficulty = difficultyMap[difficulty] || '1';
      formData.append('difficulty_level', mappedDifficulty);
      
      formData.append('type', 'choice');
      formData.append('hint', ''); // Optional hint field
      
      // Add correct answer
      const correctAnswer = answers.find(answer => answer.isCorrect);
      if (correctAnswer) {
        formData.append('correct_answer', correctAnswer.text || '');
        formData.append('choice_a', correctAnswer.text || '');
      }
      
      // Add wrong answers
      const wrongAnswers = answers.filter(answer => !answer.isCorrect);
      wrongAnswers.forEach((answer, index) => {
        formData.append(`wrong_answer_${index + 1}`, answer.text || '');
        formData.append(`choice_${String.fromCharCode(98 + index)}`, answer.text || ''); // b, c, d
      });
      
      // Step 2: Convert and add question canvas as PNG blob if editing
      if (editingQuestionImage && stageRef.current && shapes.length > 0) {
        setSaveProgress('Processing question canvas...');
        try {
          const questionBlob = await convertStageToBlob(stageRef.current, stageSize.width, stageSize.height);
          formData.append('question_image', questionBlob, `question_canvas_${timestamp}.png`);
        } catch (error) {
          console.error('Error converting question canvas:', error);
        }
      } else {
        // Send empty to clear existing image
        formData.append('question_image', '');
      }

      // Step 3: Process and add answer data
      setSaveProgress('Processing answers...');
      
      // Add correct answer image if it's a canvas type and being edited
      if (correctAnswer && correctAnswer.type === 'canvas' && editingAnswerImages[correctAnswer.id]) {
        if (answerStageRefs[correctAnswer.id]) {
          try {
            const answerBlob = await convertStageToBlob(answerStageRefs[correctAnswer.id], 600, 300);
            formData.append('choice_a_image', answerBlob, `correct_answer_${timestamp}.png`);
          } catch (error) {
            console.error('Error converting correct answer canvas:', error);
          }
        }
      } else {
        formData.append('choice_a_image', '');
      }
      
      // Add wrong answer images
      const wrongAnswerPromises = wrongAnswers.map(async (answer, index) => {
        const choiceLetter = String.fromCharCode(98 + index); // b, c, d
        if (answer.type === 'canvas' && editingAnswerImages[answer.id] && answerStageRefs[answer.id]) {
          try {
            const answerBlob = await convertStageToBlob(answerStageRefs[answer.id], 600, 300);
            formData.append(`choice_${choiceLetter}_image`, answerBlob, `wrong_answer_${index + 1}_${timestamp}.png`);
          } catch (error) {
            console.error(`Error converting wrong answer ${index + 1} canvas:`, error);
            formData.append(`choice_${choiceLetter}_image`, '');
          }
        } else {
          formData.append(`choice_${choiceLetter}_image`, '');
        }
      });

      await Promise.all(wrongAnswerPromises);

      // Step 4: Send to API
      setSaveProgress('Sending to server...');
      
      // Get the access token from localStorage or sessionStorage
      const accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      
      if (!accessToken) {
        throw new Error('No access token found. Please log in again.');
      }

      // Use the same CSRF token as the API utility
      const csrfToken = 'TB8QUbGYWtbYimRQnA9cgfvnuIUpqRj9UWpN25DrXkPUresdEwZnzVwTcJTvepDy';
      
      console.log('Using access token:', accessToken.substring(0, 20) + '...');
      console.log('Using CSRF token:', csrfToken.substring(0, 20) + '...');

      const response = await fetch(`https://dev.takespace.com/api/v1/editor-questions/${selectedQuestionId}/`, {
        method: 'PUT',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'X-CSRFTOKEN': csrfToken
        },
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Update API Error Response:', errorText);
        
        // If token is invalid, redirect to login
        if (response.status === 401) {
          alert('Your session has expired. Please log in again.');
          localStorage.removeItem('access_token');
          sessionStorage.removeItem('access_token');
          window.location.href = '/login';
          return;
        }
        
        throw new Error(`Update API Error: ${response.status} ${response.statusText}`);
      }
      
      const responseData = await response.json();
      
      // Step 5: Show success message
      setSaveProgress('Complete!');
      setTimeout(() => {
        alert(`Question updated successfully!\n\nQuestion ID: ${responseData.id || selectedQuestionId}\n\nDetails:\n- Content: ${questionContent.substring(0, 50)}...\n- Difficulty: ${difficulty}\n- Curriculum: ${syllabus} / ${grade} / ${subject}\n- Unit: ${unit}\n- Topic: ${topic}\n- Answers: ${answers.length}\n- Canvas: ${shapes.length > 0 ? 'Yes' : 'No'}`);
        setSaveProgress('');
        handleBackToSearch();
      }, 500);
      
    } catch (error) {
      console.error('Error updating question:', error);
      alert(`Error updating question: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease try again.`);
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
                  <Card variant="elevated" padding="md" className="mb-6">
                    <CardHeader>
                      <CardTitle size="md">Search Questions</CardTitle>
                    </CardHeader>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      {/* Syllabus */}
                      <div>
                        <label htmlFor="search-syllabus" className="block text-sm font-semibold text-gray-700 mb-2">
                          Syllabus
                        </label>
                        <div className="relative">
                          <select
                            id="search-syllabus"
                            value={syllabus}
                            onChange={(e) => setSyllabus(e.target.value)}
                            disabled={loadingSyllabuses}
                            className={`w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 transition-all duration-200 ${
                              loadingSyllabuses ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            <option value="">
                              {loadingSyllabuses ? 'Loading syllabuses...' : 'Select Syllabus'}
                            </option>
                            {availableSyllabuses.map((syllabusOption) => (
                              <option key={syllabusOption.id} value={syllabusOption.id}>
                                {syllabusOption.name}
                              </option>
                            ))}
                          </select>
                          {loadingSyllabuses && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Grade */}
                      <div>
                        <label htmlFor="search-grade" className="block text-sm font-semibold text-gray-700 mb-2">
                          Grade
                        </label>
                        <div className="relative">
                          <select
                            id="search-grade"
                            value={grade}
                            onChange={(e) => setGrade(e.target.value)}
                            disabled={!syllabus || loadingGrades}
                            className={`w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 transition-all duration-200 ${
                              (!syllabus || loadingGrades) ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            <option value="">
                              {loadingGrades ? 'Loading grades...' : availableGrades.length > 0 ? 'Select Grade' : 'Select Syllabus first'}
                            </option>
                            {availableGrades.map((gradeOption) => (
                              <option key={gradeOption.id} value={gradeOption.id}>
                                {gradeOption.name}
                              </option>
                            ))}
                          </select>
                          {loadingGrades && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Subject */}
                      <div>
                        <label htmlFor="search-subject" className="block text-sm font-semibold text-gray-700 mb-2">
                          Subject
                        </label>
                        <div className="relative">
                          <select
                            id="search-subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            disabled={!syllabus || !grade || loadingSubjects}
                            className={`w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 transition-all duration-200 ${
                              (!syllabus || !grade || loadingSubjects) ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            <option value="">
                              {loadingSubjects ? 'Loading subjects...' : availableSubjects.length > 0 ? 'Select Subject' : 'Select Grade first'}
                            </option>
                            {availableSubjects.map((subjectOption) => (
                              <option key={subjectOption.id} value={subjectOption.id}>
                                {subjectOption.name}
                              </option>
                            ))}
                          </select>
                          {loadingSubjects && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          )}
                        </div>
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
                        <p className="text-sm text-yellow-800 flex items-center gap-2">
                          <FiInfo className="w-4 h-4" />
                          Please select Syllabus, Grade, and Subject to enable search
                        </p>
                      </div>
                    ) : null}
                  </Card>

                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <Card variant="elevated" padding="md">
                      <CardHeader>
                        <CardTitle size="md">
                          Search Results ({searchResults.length})
                        </CardTitle>
                      </CardHeader>
                      <div className="space-y-3">
                        {searchResults.map((result) => {
                          // Find question image
                          const questionImage = result.images.find(img => img.image_type === 'question');
                          
                          return (
                            <div
                              key={result.id}
                              onClick={() => handleSelectQuestion(result.id)}
                              className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all duration-200 group"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 mb-2">
                                    {result.text_content}
                                  </h4>
                                  
                                  {/* Show question image if available */}
                                  {questionImage && (
                                    <div className="mb-3">
                                      <img 
                                        src={questionImage.image} 
                                        alt={questionImage.caption}
                                        className="max-w-xs max-h-32 object-contain border border-gray-200 rounded-lg"
                                      />
                                      <p className="text-xs text-gray-500 mt-1">{questionImage.caption}</p>
                                    </div>
                                  )}
                                  
                                  <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                                    <span className="px-2 py-1 bg-gray-100 rounded-lg">
                                      {result.unit_name}
                                    </span>
                                    <span className="px-2 py-1 bg-gray-100 rounded-lg">
                                      {result.topic_name}
                                    </span>
                                    <span className="px-2 py-1 bg-gray-100 rounded-lg">
                                      {result.subject_name}
                                    </span>
                                    <span className="px-2 py-1 bg-gray-100 rounded-lg">
                                      {new Date(result.created_at).toLocaleDateString()}
                                    </span>
                                    {result.images.length > 0 && (
                                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg">
                                        {result.images.length} image{result.images.length > 1 ? 's' : ''}
                                      </span>
                                    )}
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
                          );
                        })}
                      </div>
                    </Card>
                  )}

                  {/* Empty State */}
                  {searchResults.length === 0 && syllabus && grade && subject && (
                    <Card variant="elevated" padding="xl" className="text-center">
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
                      <CardTitle size="md">
                        {isSearching ? 'Searching...' : 'Click "Search" to find questions'}
                      </CardTitle>
                      <CardDescription>
                        Enter keywords or click search to see all questions for the selected criteria
                      </CardDescription>
                    </Card>
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
                    <Card variant="outlined" className="bg-blue-50 border-blue-200">
                      <div className="flex items-center gap-3">
                        <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        <div>
                          <CardTitle size="sm" className="text-blue-900">Editing Mode</CardTitle>
                          <CardDescription className="text-blue-700">
                            {syllabus} • {grade} • {subject} • {unit} • {topic}
                          </CardDescription>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Question and Canvas Section */}
                  <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                      {/* Question Form */}
                      <div className="xl:col-span-1">
                        <QuestionForm
                          questionContent={questionContent}
                          difficulty={difficulty}
                          onContentChange={setQuestionContent}
                          onDifficultyChange={setDifficulty}
                        />
                      </div>

                      {/* Canvas Area */}
                      <div className="xl:col-span-2">
                        <Card variant="elevated" padding="md">
                          <CardHeader>
                            <CardTitle size="md">Visual Editor</CardTitle>
                            <CardDescription>
                              {activeTool === 'draw' 
                                ? 'Click and drag to draw freehand.'
                                : activeTool === 'line'
                                ? 'Click and drag to draw a straight line.'
                                : activeTool === 'arrow'
                                ? 'Click and drag to draw an arrow.'
                                : 'Click on the canvas to add elements. Select elements to move or edit them.'}
                            </CardDescription>
                          </CardHeader>

                          {/* Show existing question image if available */}
                          {getQuestionImage() && !editingQuestionImage && (
                            <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-semibold text-gray-700">Current Question Image</h4>
                                <button
                                  onClick={handleMakeNewQuestionCanvas}
                                  className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                                >
                                  Make new Canvas
                                </button>
                              </div>
                              <img 
                                src={getQuestionImage()?.image} 
                                alt={getQuestionImage()?.caption}
                                className="max-w-full max-h-48 object-contain border border-gray-200 rounded-lg"
                              />
                              <p className="text-xs text-gray-500 mt-1">{getQuestionImage()?.caption}</p>
                            </div>
                          )}

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
                      existingImages={selectedQuestionData?.images || []}
                      onMakeNewCanvas={handleMakeNewAnswerCanvas}
                      editingAnswerImages={editingAnswerImages}
                    />
                  </div>

                  {/* Update Button Section */}
                  <div className="max-w-7xl mx-auto">
                    <Card variant="elevated" padding="lg">
                      <div className="text-center space-y-6">
                        <CardHeader>
                          <CardTitle size="lg">Update Question</CardTitle>
                          <CardDescription>
                            Save your changes to update this question
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
                          onClick={saveUpdatedQuestion}
                          disabled={isSaving || !questionContent.trim() || !syllabus || !grade || !subject || !difficulty}
                          className={`group relative px-12 py-4 rounded-xl font-semibold text-white transition-all duration-200 ${
                            isSaving || !questionContent.trim() || !syllabus || !grade || !subject || !difficulty
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
                    </Card>
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
