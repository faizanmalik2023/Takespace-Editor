'use client';

import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import PageLayout from '../../components/layout/PageLayout';
import CardSimple from '../../components/ui/CardSimple';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { 
  bulkUploadQuestions, 
  getTopics, 
  searchTopics, 
  getTopicQuestions,
  updateQuestion,
  deleteQuestion,
  getQuestionImages,
  addQuestionImage,
  removeQuestionImage,
  createSimpleQuestion
} from '../lib/api';
import { MdUploadFile, MdSearch, MdEdit, MdDelete, MdCloudUpload, MdCheckCircle, MdInsertDriveFile, MdClose, MdDownload } from 'react-icons/md';

const BulkQuestionUploadPage = () => {
  const [topics, setTopics] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [selectedTopicLabel, setSelectedTopicLabel] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [resultSummary, setResultSummary] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    text_content: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctOptionKey: 'A',
    difficulty_level: 1,
    is_active: false,
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [questionImages, setQuestionImages] = useState<any[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('quiz');
  const [activeTab, setActiveTab] = useState('quiz');
  const [activeSection, setActiveSection] = useState('/bulk-question-upload');
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [addQuestionTopicId, setAddQuestionTopicId] = useState('');
  const [addQuestionCategory, setAddQuestionCategory] = useState('quiz');
  const [addQuestionForm, setAddQuestionForm] = useState({
    text_content: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: 'A',
    difficulty_level: 1,
  });
  const [creatingQuestion, setCreatingQuestion] = useState(false);

  useEffect(() => {
    const loadInitialTopics = async () => {
      try {
        setLoadingTopics(true);
        const response = await getTopics(1, 100);
        const list = response?.results || response?.data?.results || [];
        setTopics(list);
      } catch (error: any) {
        console.error('Error loading topics:', error);
        toast.error(error.message || 'Failed to load topics');
      } finally {
        setLoadingTopics(false);
      }
    };

    loadInitialTopics();
  }, []);

  const loadQuestionsForTopic = async (topicId: string) => {
    if (!topicId) {
      setQuestions([]);
      return;
    }
    try {
      setLoadingQuestions(true);
      const list = await getTopicQuestions(topicId);
      // Ensure list is an array
      const questionsList = Array.isArray(list) ? list : [];
      const normalised = questionsList.map((q: any) => ({
        ...q,
        is_active:
          String(q.is_active).toLowerCase() === 'true' ||
          q.is_active === true,
      }));
      setQuestions(normalised);
    } catch (error: any) {
      console.error('Error loading questions:', error);
      toast.error(error.message || 'Failed to load questions for this topic');
      setQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const filteredQuestions = questions.filter((q: any) => {
    const category = q.category?.toLowerCase() || 'free';
    if (activeTab === 'quiz') {
      return category === 'quiz';
    } else {
      return category === 'practice';
    }
  });

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setSearching(true);
        const results = await searchTopics(searchQuery.trim());
        setSuggestions(results?.results || []);
        setShowSuggestions((results?.results || []).length > 0);
      } catch (error: any) {
        console.error('Error searching topics:', error);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (!value.trim()) {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = (topic: any) => {
    setSearchQuery(topic.name);
    setSelectedTopicId(String(topic.id));
    const labelParts = [
      topic.name,
      topic.unit_name,
      topic.subject_name,
      topic.grade_name,
    ].filter(Boolean);
    setSelectedTopicLabel(labelParts.join(' • '));
    setShowSuggestions(false);
    setSuggestions([]);
    loadQuestionsForTopic(String(topic.id));
  };

  const handleTopicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedTopicId(value);
    const topic = topics.find((t: any) => String(t.id) === value);
    if (topic) {
      const labelParts = [
        topic.name,
        topic.unit_name,
        topic.subject_name,
        topic.grade_name,
      ].filter(Boolean);
      setSelectedTopicLabel(labelParts.join(' • '));
      loadQuestionsForTopic(value);
    } else {
      setSelectedTopicLabel('');
      setQuestions([]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) {
      setFile(null);
      return;
    }
    if (!f.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please select a CSV file');
      if (e.target) e.target.value = '';
      setFile(null);
      return;
    }
    setFile(f);
    setShowCategoryModal(true);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setShowCategoryModal(false);
    handleUpload(category);
  };

  const handleUpload = async (category: string | null = null) => {
    const uploadCategory = category || selectedCategory;
    
    if (!selectedTopicId) {
      toast.error('Please select a topic');
      return;
    }
    if (!file) {
      toast.error('Please select a CSV file to upload');
      return;
    }

    try {
      setUploading(true);
      setResultSummary(null);
      const data = await bulkUploadQuestions(selectedTopicId, file, uploadCategory);

      setResultSummary({
        topic_id: data.topic_id,
        created_count: data.created_count,
        error_count: data.error_count,
        created: data.created || [],
        errors: data.errors || [],
      });

      if (Number(data.error_count || 0) === 0) {
        toast.success(`Uploaded ${data.created_count} ${uploadCategory} questions successfully`);
      } else {
        toast.error(
          `Some rows failed: ${data.created_count} created, ${data.error_count} errors`
        );
      }
      await loadQuestionsForTopic(selectedTopicId);
      setActiveTab(uploadCategory);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Error uploading questions:', error);
      toast.error(error.message || 'Failed to upload questions');
    } finally {
      setUploading(false);
    }
  };

  const openEditQuestion = async (question: any) => {
    setEditingQuestion(question);
    const opts = Array.isArray(question.options)
      ? [...question.options]
      : [];
    while (opts.length < 4) opts.push('');
    const [a, b, c, d] = opts;

    let correctKey = 'A';
    if (question.correct_answer === b) correctKey = 'B';
    else if (question.correct_answer === c) correctKey = 'C';
    else if (question.correct_answer === d) correctKey = 'D';

    setEditForm({
      text_content: question.text_content || '',
      optionA: a,
      optionB: b,
      optionC: c,
      optionD: d,
      correctOptionKey: correctKey,
      difficulty_level: question.difficulty_level || 1,
      is_active:
        String(question.is_active).toLowerCase() === 'true' ||
        question.is_active === true,
    });
    
    try {
      const images = await getQuestionImages(question.id);
      setQuestionImages(images || []);
    } catch (error: any) {
      console.warn('Could not load question images:', error.message);
      setQuestionImages([]);
    }
    
    setShowEditModal(true);
  };

  const handleUpdateQuestion = async () => {
    if (!editingQuestion) return;
    if (!editForm.text_content.trim()) {
      toast.error('Question text is required');
      return;
    }
    const { optionA, optionB, optionC, optionD, correctOptionKey } = editForm;
    const optionMap: { [key: string]: string } = { A: optionA, B: optionB, C: optionC, D: optionD };
    const correct_answer = (optionMap[correctOptionKey] || '').trim();

    if (!optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim()) {
      toast.error('All four options (A, B, C, D) are required');
      return;
    }
    if (!correct_answer) {
      toast.error('Please choose which option is correct');
      return;
    }

    try {
      await updateQuestion(editingQuestion.id, {
        text_content: editForm.text_content,
        correct_answer,
        choice_a: optionA,
        choice_b: optionB,
        choice_c: optionC,
        choice_d: optionD,
        wrong_answer_1: correctOptionKey === 'A' ? optionB : optionA,
        wrong_answer_2: correctOptionKey === 'C' ? optionD : optionC,
        wrong_answer_3: correctOptionKey === 'A' ? optionD : optionB,
        difficulty_level: editForm.difficulty_level,
        is_active: editForm.is_active,
      });
      toast.success('Question updated successfully');
      setShowEditModal(false);
      await loadQuestionsForTopic(selectedTopicId);
    } catch (error: any) {
      console.error('Error updating question:', error);
      toast.error(error.message || 'Failed to update question');
    }
  };

  const handleDeleteQuestion = async () => {
    if (!questionToDelete) return;
    try {
      await deleteQuestion(questionToDelete.id);
      toast.success('Question deleted successfully');
      setShowDeleteModal(false);
      setQuestionToDelete(null);
      await loadQuestionsForTopic(selectedTopicId);
    } catch (error: any) {
      console.error('Error deleting question:', error);
      toast.error(error.message || 'Failed to delete question');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingQuestion || !e.target.files?.[0]) return;
    const imageFile = e.target.files[0];
    try {
      setUploadingImage(true);
      await addQuestionImage(editingQuestion.id, imageFile, 'question', '', '');
      toast.success('Image uploaded successfully');
      const images = await getQuestionImages(editingQuestion.id);
      setQuestionImages(images || []);
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = async (imageId: number) => {
    if (!editingQuestion) return;
    try {
      await removeQuestionImage(editingQuestion.id, imageId);
      toast.success('Image removed successfully');
      const images = await getQuestionImages(editingQuestion.id);
      setQuestionImages(images || []);
    } catch (error: any) {
      console.error('Error removing image:', error);
      toast.error(error.message || 'Failed to remove image');
    }
  };

  const handleUploadButtonClick = () => {
    if (!selectedTopicId) {
      toast.error('Please select a topic first');
      return;
    }
    fileInputRef.current?.click();
  };

  const handleAddQuestionSubmit = async () => {
    if (!addQuestionTopicId) {
      toast.error('Please select a topic first');
      return;
    }
    if (!addQuestionForm.text_content.trim()) {
      toast.error('Question text is required');
      return;
    }
    if (!addQuestionForm.option_a || !addQuestionForm.option_b || !addQuestionForm.option_c || !addQuestionForm.option_d) {
      toast.error('All four options are required');
      return;
    }
    if (!addQuestionForm.correct_option) {
      toast.error('Please select the correct option');
      return;
    }

    try {
      setCreatingQuestion(true);
      const questionData = {
        topic_id: parseInt(addQuestionTopicId),
        category: addQuestionCategory,
        text_content: addQuestionForm.text_content.trim(),
        option_a: addQuestionForm.option_a.trim(),
        option_b: addQuestionForm.option_b.trim(),
        option_c: addQuestionForm.option_c.trim(),
        option_d: addQuestionForm.option_d.trim(),
        correct_option: addQuestionForm.correct_option,
        difficulty_level: addQuestionForm.difficulty_level,
      };
      
      await createSimpleQuestion(questionData);
      toast.success('Question created successfully!');
      
      // Reset form
      setAddQuestionForm({
        text_content: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_option: 'A',
        difficulty_level: 1,
      });
      setAddQuestionTopicId('');
      setAddQuestionCategory('quiz');
      setShowAddQuestionModal(false);
      
      // Reload questions if the same topic is selected
      if (selectedTopicId === addQuestionTopicId) {
        await loadQuestionsForTopic(selectedTopicId);
      }
    } catch (error: any) {
      console.error('Error creating question:', error);
      toast.error(error.message || 'Failed to create question');
    } finally {
      setCreatingQuestion(false);
    }
  };

  if (loadingTopics) {
    return (
      <PageLayout
        title="Questions"
        subtitle="Select a topic and upload a CSV file with questions and four options"
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      >
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Questions"
      subtitle="Select a topic and upload a CSV file with questions and four options"
      actions={
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowAddQuestionModal(true)}
            variant="primary"
          >
            <MdCheckCircle className="w-5 h-5 mr-2" />
            Add Question
          </Button>
          <a
            href="/bulk-question-sample.csv"
            download
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#103358] text-[#103358] text-sm font-medium hover:bg-[#103358] hover:text-white transition-colors"
          >
            <MdDownload className="w-5 h-5" />
            Download sample CSV
          </a>
          <Button
            onClick={handleUploadButtonClick}
            disabled={!selectedTopicId}
          >
            <MdCloudUpload className="w-5 h-5 mr-2" />
            Upload CSV
          </Button>
        </div>
      }
      activeSection={activeSection}
      onSectionChange={setActiveSection}
    >
      <div className="space-y-6">
        {/* Topic selection + search */}
        <CardSimple>
          <div className="p-4 space-y-4">
            <h3 className="text-base font-semibold text-[#103358]">
              1. Choose Topic
            </h3>
            
            {/* Search with autocomplete */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search topics (type to see suggestions)
              </label>
              <div className="relative">
                <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  onFocus={() => {
                    if (suggestions.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                  onBlur={() => {
                    setTimeout(() => setShowSuggestions(false), 200);
                  }}
                  placeholder="Type to search topics (e.g., Linear Equations)"
                  className="pl-10"
                  error={undefined}
                />
                {searching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <LoadingSpinner />
                  </div>
                )}
                {/* Suggestions dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {suggestions.map((topic: any) => (
                      <button
                        key={topic.id}
                        type="button"
                        onClick={() => handleSelectSuggestion(topic)}
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">
                          {topic.name}
                        </div>
                        <div className="text-xs text-gray-600 mt-0.5">
                          {[
                            topic.unit_name,
                            topic.subject_name,
                            topic.grade_name,
                          ]
                            .filter(Boolean)
                            .join(' • ')}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {searchQuery && !selectedTopicId && !searching && suggestions.length === 0 && (
                <p className="mt-1 text-xs text-gray-500">
                  No topics found. Try a different search term.
                </p>
              )}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-2 my-2">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="text-xs text-gray-500">OR</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Dropdown selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select from dropdown *
              </label>
              {loadingTopics ? (
                <div className="flex items-center gap-2 py-2">
                  <LoadingSpinner />
                  <span className="text-sm text-gray-600">Loading topics...</span>
                </div>
              ) : (
                <select
                  value={selectedTopicId}
                  onChange={handleTopicChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="">Choose a topic from the list</option>
                  {topics.map((topic: any) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.name} — {topic.unit_name || 'Unit'} •{' '}
                      {topic.subject_name || 'Subject'} •{' '}
                      {topic.grade_name || 'Grade'}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Selected topic display */}
            {selectedTopicLabel && (
              <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-900">
                  Selected: {selectedTopicLabel}
                </p>
              </div>
            )}
          </div>
        </CardSimple>

        {/* File upload */}
        {selectedTopicId && (
          <CardSimple>
            <div className="p-4 space-y-4">
              <h3 className="text-base font-semibold text-[#103358]">
                2. Selected CSV File
              </h3>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="hidden"
              />

              {!file ? (
                <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 text-center">
                  <p className="text-sm text-gray-600">
                    No file selected. Click <strong>"Upload CSV"</strong> button above to select a file.
                  </p>
                </div>
              ) : (
                <div className="border-2 border-[#103358] rounded-lg bg-blue-50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 bg-[#103358] rounded-lg">
                        <MdInsertDriveFile className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <MdCheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-xs text-green-700 font-medium">Selected</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="ml-3 p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Remove file"
                    >
                      <MdClose className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </CardSimple>
        )}

        {/* Questions in this topic */}
        {selectedTopicId && (
          <CardSimple>
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-[#103358]">
                    3. Questions in this topic
                  </h3>
                  <p className="text-xs text-gray-600">
                    View, edit, or delete questions that belong to the selected topic.
                  </p>
                </div>
              </div>

              {loadingQuestions ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : questions.length === 0 ? (
                <p className="text-sm text-gray-600">
                  No questions found for this topic yet. Upload a CSV to add questions.
                </p>
              ) : (
                <>
                  {/* Tabs for Quiz and Practice */}
                  <div className="flex gap-2 border-b border-gray-200">
                    <button
                      onClick={() => setActiveTab('quiz')}
                      className={`px-4 py-2 text-sm font-medium transition-colors ${
                        activeTab === 'quiz'
                          ? 'text-[#103358] border-b-2 border-[#103358]'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Quiz Questions ({questions.filter((q: any) => (q.category?.toLowerCase() || 'free') === 'quiz').length})
                    </button>
                    <button
                      onClick={() => setActiveTab('practice')}
                      className={`px-4 py-2 text-sm font-medium transition-colors ${
                        activeTab === 'practice'
                          ? 'text-[#103358] border-b-2 border-[#103358]'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Practice Questions ({questions.filter((q: any) => (q.category?.toLowerCase() || 'free') === 'practice').length})
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 px-3 font-medium text-gray-700">
                            Question
                          </th>
                          <th className="text-left py-2 px-3 font-medium text-gray-700">
                            Options (A–D)
                          </th>
                          <th className="text-left py-2 px-3 font-medium text-gray-700">
                            Correct answer
                          </th>
                          <th className="text-left py-2 px-3 font-medium text-gray-700">
                            Difficulty
                          </th>
                          <th className="text-left py-2 px-3 font-medium text-gray-700">
                            Status
                          </th>
                          <th className="text-right py-2 px-3 font-medium text-gray-700">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredQuestions.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-gray-500">
                              No {activeTab} questions found for this topic yet.
                            </td>
                          </tr>
                        ) : (
                          filteredQuestions.map((q: any) => (
                            <tr
                              key={q.id}
                              className="border-b border-gray-100 hover:bg-gray-50"
                            >
                              <td className="py-2 px-3 align-top">
                                <div className="text-gray-900">
                                  {q.text_content?.length > 120
                                    ? `${q.text_content.slice(0, 120)}…`
                                    : q.text_content}
                                </div>
                              </td>
                              <td className="py-2 px-3 align-top text-gray-800">
                                <div className="text-xs text-gray-700 space-y-0.5">
                                  {(q.options || []).slice(0, 4).map((opt: string, idx: number) => (
                                    <div key={idx}>
                                      <span className="font-semibold">
                                        {String.fromCharCode(65 + idx)}.
                                      </span>{' '}
                                      {opt || '-'}
                                    </div>
                                  ))}
                                </div>
                              </td>
                              <td className="py-2 px-3 align-top text-gray-800">
                                {q.correct_answer || '-'}
                              </td>
                              <td className="py-2 px-3 align-top text-gray-700">
                                {q.difficulty_level || 1}
                              </td>
                              <td className="py-2 px-3 align-top">
                                {q.is_active ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                                    Active
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                                    Inactive
                                  </span>
                                )}
                              </td>
                              <td className="py-2 px-3 align-top">
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => openEditQuestion(q)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="View / Edit question"
                                  >
                                    <MdEdit className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setQuestionToDelete(q);
                                      setShowDeleteModal(true);
                                    }}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete question"
                                  >
                                    <MdDelete className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </CardSimple>
        )}

        {/* Result summary */}
        {resultSummary && (
          <CardSimple>
            <div className="p-4 space-y-2">
              <h3 className="text-base font-semibold text-[#103358]">
                Upload Summary
              </h3>
              <p className="text-sm text-gray-700">
                Topic ID: <strong>{resultSummary.topic_id}</strong>
              </p>
              <p className="text-sm text-gray-700">
                Created:{' '}
                <strong>{String(resultSummary.created_count || 0)}</strong> •
                Errors:{' '}
                <strong className={Number(resultSummary.error_count || 0) ? 'text-red-600' : 'text-green-600'}>
                  {String(resultSummary.error_count || 0)}
                </strong>
              </p>
              {resultSummary.errors &&
                resultSummary.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-red-700 mb-1">
                      Error details (first 5):
                    </p>
                    <ul className="text-xs text-red-700 space-y-1">
                      {resultSummary.errors.slice(0, 5).map((err: any, idx: number) => (
                        <li key={idx}>
                          Row {err.row}: {err.error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          </CardSimple>
        )}
      </div>

      {/* Category Selection Modal */}
      {showCategoryModal && (
        <Modal
          isOpen={showCategoryModal}
          onClose={() => {
            setShowCategoryModal(false);
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
          }}
          title="Select Question Category"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Please select whether you want to upload Quiz questions or Practice questions.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleCategorySelect('quiz')}
                className="p-6 border-2 border-gray-300 rounded-lg hover:border-[#103358] hover:bg-blue-50 transition-all text-center"
              >
                <div className="text-2xl font-bold text-[#103358] mb-2">Quiz</div>
                <div className="text-sm text-gray-600">
                  Questions for quiz assessments
                </div>
              </button>
              <button
                onClick={() => handleCategorySelect('practice')}
                className="p-6 border-2 border-gray-300 rounded-lg hover:border-[#103358] hover:bg-blue-50 transition-all text-center"
              >
                <div className="text-2xl font-bold text-[#103358] mb-2">Practice</div>
                <div className="text-sm text-gray-600">
                  Questions for practice sessions
                </div>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Question Modal */}
      {showEditModal && editingQuestion && (
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingQuestion(null);
          }}
          title="View / Edit Question"
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Question text *
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-black"
                rows={4}
                value={editForm.text_content}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    text_content: e.target.value,
                  }))
                }
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['A', 'B', 'C', 'D'].map((key) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Option {key}
                  </label>
                  <Input
                    value={
                      key === 'A'
                        ? editForm.optionA
                        : key === 'B'
                        ? editForm.optionB
                        : key === 'C'
                        ? editForm.optionC
                        : editForm.optionD
                    }
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditForm((prev) => ({
                        ...prev,
                        ...(key === 'A'
                          ? { optionA: e.target.value }
                          : key === 'B'
                          ? { optionB: e.target.value }
                          : key === 'C'
                          ? { optionC: e.target.value }
                          : { optionD: e.target.value }),
                      }))
                    }
                    placeholder={`Option ${key}`}
                    error={undefined}
                  />
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="radio"
                      id={`correct_${key}`}
                      name="correct_option"
                      checked={editForm.correctOptionKey === key}
                      onChange={() =>
                        setEditForm((prev) => ({
                          ...prev,
                          correctOptionKey: key,
                        }))
                      }
                      className="w-4 h-4 border-2 border-gray-300 rounded-full appearance-none cursor-pointer focus:ring-2 focus:ring-[#103358] focus:ring-offset-1 transition-all relative"
                      style={{
                        backgroundColor: editForm.correctOptionKey === key ? '#103358' : 'white',
                        ...(editForm.correctOptionKey === key && {
                          backgroundImage: 'radial-gradient(circle, white 35%, transparent 35%)',
                          backgroundSize: '100%',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat'
                        })
                      }}
                    />
                    <label
                      htmlFor={`correct_${key}`}
                      className={`text-xs cursor-pointer ${
                        editForm.correctOptionKey === key
                          ? 'text-[#103358] font-medium'
                          : 'text-gray-600'
                      }`}
                    >
                      Mark as correct
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty level
                </label>
                <Input
                  type="number"
                  min={1}
                  max={4}
                  value={editForm.difficulty_level}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditForm((prev) => ({
                      ...prev,
                      difficulty_level: parseInt(e.target.value || '1', 10),
                    }))
                  }
                  placeholder="Difficulty level"
                  error={undefined}
                />
                <p className="mt-1 text-xs text-gray-500">
                  1=Easy, 2=Intermediate, 3=Hard, 4=Olympiad
                </p>
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input
                  id="edit_is_active"
                  type="checkbox"
                  checked={editForm.is_active}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      is_active: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 border-2 border-gray-300 rounded appearance-none cursor-pointer focus:ring-2 focus:ring-[#103358] focus:ring-offset-1 transition-all"
                  style={{
                    backgroundColor: editForm.is_active ? '#103358' : 'transparent',
                    backgroundImage: editForm.is_active 
                      ? 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'white\' stroke-width=\'3\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'20 6 9 17 4 12\'%3E%3C/polyline%3E%3C/svg%3E")' 
                      : 'none',
                    backgroundSize: '100%',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}
                />
                <label
                  htmlFor="edit_is_active"
                  className="text-sm font-medium text-gray-700"
                >
                  Active
                </label>
              </div>
            </div>

            {/* Question Images Section */}
            <div className="pt-4 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Images
              </label>
              
              {questionImages.length > 0 && (
                <div className="space-y-2 mb-4">
                  {questionImages.map((img: any) => (
                    <div key={img.id} className="flex items-center gap-3 p-2 border border-gray-200 rounded-lg">
                      <img
                        src={img.image_url || img.image}
                        alt={img.caption || img.alt_text}
                        className="w-16 h-16 object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div className="flex-1">
                        <p className="text-xs text-gray-600">Type: {img.image_type}</p>
                        {img.caption && <p className="text-xs text-gray-500">{img.caption}</p>}
                      </div>
                      <button
                        onClick={() => handleRemoveImage(img.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <MdDelete className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploadingImage}
                  variant="secondary"
                  size="sm"
                >
                  {uploadingImage ? 'Uploading...' : 'Upload Question Image'}
                </Button>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-gray-200">
              <Button
                onClick={handleUpdateQuestion}
                variant="primary"
                className="flex-1"
              >
                Update Question
              </Button>
              <Button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingQuestion(null);
                }}
                variant="secondary"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && questionToDelete && (
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setQuestionToDelete(null);
          }}
          onConfirm={handleDeleteQuestion}
          title="Delete Question"
          message={`Are you sure you want to delete this question?\n\n${questionToDelete.text_content?.slice(
            0,
            120,
          )}${questionToDelete.text_content?.length > 120 ? '…' : ''}`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      )}

      {/* Add Question Modal */}
      <Modal
        isOpen={showAddQuestionModal}
        onClose={() => {
          setShowAddQuestionModal(false);
          setAddQuestionForm({
            text_content: '',
            option_a: '',
            option_b: '',
            option_c: '',
            option_d: '',
            correct_option: 'A',
            difficulty_level: 1,
          });
          setAddQuestionTopicId('');
          setAddQuestionCategory('quiz');
        }}
        title="Add New Question"
        size="xl"
      >
        <div className="pr-2">
          <div className="grid grid-cols-2 gap-4">
            {/* Left Column */}
            <div className="space-y-3">
              {/* Topic Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Topic *
                </label>
                <select
                  value={addQuestionTopicId}
                  onChange={(e) => setAddQuestionTopicId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-black"
                >
                  <option value="">Choose a topic</option>
                  {topics.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.name} — {topic.subject_name || 'N/A'} • {topic.unit_name || 'N/A'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="add_question_category"
                      value="quiz"
                      checked={addQuestionCategory === 'quiz'}
                      onChange={(e) => setAddQuestionCategory(e.target.value)}
                      className="w-4 h-4 border-2 border-gray-300 rounded-full appearance-none cursor-pointer focus:ring-2 focus:ring-[#103358] focus:ring-offset-1 transition-all"
                      style={{
                        backgroundColor: addQuestionCategory === 'quiz' ? '#103358' : 'white',
                        ...(addQuestionCategory === 'quiz' && {
                          backgroundImage: 'radial-gradient(circle, white 35%, transparent 35%)',
                          backgroundSize: '100%',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat'
                        })
                      }}
                    />
                    <span className="text-sm text-gray-700">Quiz</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="add_question_category"
                      value="practice"
                      checked={addQuestionCategory === 'practice'}
                      onChange={(e) => setAddQuestionCategory(e.target.value)}
                      className="w-4 h-4 border-2 border-gray-300 rounded-full appearance-none cursor-pointer focus:ring-2 focus:ring-[#103358] focus:ring-offset-1 transition-all"
                      style={{
                        backgroundColor: addQuestionCategory === 'practice' ? '#103358' : 'white',
                        ...(addQuestionCategory === 'practice' && {
                          backgroundImage: 'radial-gradient(circle, white 35%, transparent 35%)',
                          backgroundSize: '100%',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat'
                        })
                      }}
                    />
                    <span className="text-sm text-gray-700">Practice</span>
                  </label>
                </div>
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question text *
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-black"
                  rows={3}
                  value={addQuestionForm.text_content}
                  onChange={(e) =>
                    setAddQuestionForm((prev) => ({
                      ...prev,
                      text_content: e.target.value,
                    }))
                  }
                  placeholder="Enter the question text"
                />
              </div>

              {/* Difficulty Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty level
                </label>
                <Input
                  type="number"
                  value={addQuestionForm.difficulty_level}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setAddQuestionForm((prev) => ({
                      ...prev,
                      difficulty_level: parseInt(e.target.value) || 1,
                    }))
                  }
                  placeholder="1=Easy, 2=Intermediate, 3=Hard, 4=Olympiad"
                  error={undefined}
                />
                <p className="text-xs text-gray-500 mt-0.5">
                  1=Easy, 2=Intermediate, 3=Hard, 4=Olympiad
                </p>
              </div>
            </div>

            {/* Right Column - Options */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Answer Options *
              </label>
              {['A', 'B', 'C', 'D'].map((key) => (
                <div key={key} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Input
                      value={
                        key === 'A'
                          ? addQuestionForm.option_a
                          : key === 'B'
                          ? addQuestionForm.option_b
                          : key === 'C'
                          ? addQuestionForm.option_c
                          : addQuestionForm.option_d
                      }
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setAddQuestionForm((prev) => ({
                          ...prev,
                          ...(key === 'A'
                            ? { option_a: e.target.value }
                            : key === 'B'
                            ? { option_b: e.target.value }
                            : key === 'C'
                            ? { option_c: e.target.value }
                            : { option_d: e.target.value }),
                        }))
                      }
                      placeholder={`Option ${key}`}
                      error={undefined}
                    />
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <input
                        type="radio"
                        id={`add_correct_${key}`}
                        name="add_correct_option"
                        checked={addQuestionForm.correct_option === key}
                        onChange={() =>
                          setAddQuestionForm((prev) => ({
                            ...prev,
                            correct_option: key,
                          }))
                        }
                        className="w-4 h-4 border-2 border-gray-300 rounded-full appearance-none cursor-pointer focus:ring-2 focus:ring-[#103358] focus:ring-offset-1 transition-all"
                        style={{
                          backgroundColor: addQuestionForm.correct_option === key ? '#103358' : 'white',
                          ...(addQuestionForm.correct_option === key && {
                            backgroundImage: 'radial-gradient(circle, white 35%, transparent 35%)',
                            backgroundSize: '100%',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat'
                          })
                        }}
                      />
                      <label
                        htmlFor={`add_correct_${key}`}
                        className={`text-xs cursor-pointer whitespace-nowrap ${
                          addQuestionForm.correct_option === key
                            ? 'text-[#103358] font-medium'
                            : 'text-gray-600'
                        }`}
                      >
                        Correct
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={() => {
                setShowAddQuestionModal(false);
                setAddQuestionForm({
                  text_content: '',
                  option_a: '',
                  option_b: '',
                  option_c: '',
                  option_d: '',
                  correct_option: 'A',
                  difficulty_level: 1,
                });
                setAddQuestionTopicId('');
                setAddQuestionCategory('quiz');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddQuestionSubmit}
              disabled={creatingQuestion || !addQuestionTopicId}
            >
              {creatingQuestion ? 'Creating...' : 'Create Question'}
            </Button>
          </div>
        </div>
      </Modal>
    </PageLayout>
  );
};

export default function BulkQuestionUploadPageWrapper() {
  return <BulkQuestionUploadPage />;
}
