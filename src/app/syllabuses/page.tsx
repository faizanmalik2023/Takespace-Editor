'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import ProtectedRoute from '../../components/ProtectedRoute';
import { api } from '../lib/api';
import { 
  getEditorSyllabuses, 
  createEditorSyllabus, 
  updateEditorSyllabus, 
  deleteEditorSyllabus,
  getEditorSyllabus,
  addUnitsToSyllabus,
  removeUnitFromSyllabus,
  getSyllabusStatistics,
  getLookupUnits
} from '../lib/api';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiBook, FiX, FiSave, FiCheck } from 'react-icons/fi';
import { toast } from 'react-toastify';

interface Syllabus {
  id: number;
  name: string;
  description: string;
  version: string;
  syllabus_type: string;
  is_active: boolean;
  is_public: boolean;
  subjects: Array<{ id: number; name: string }>;
  grades: Array<{ id: number; name: string; level: number }>;
  total_units: number;
  total_topics: number;
  total_questions: number;
  created_at: string;
  modified_at: string;
}

const SyllabusesPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [syllabuses, setSyllabuses] = useState<Syllabus[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('syllabuses');
  
  // Check if user is Chief Editor
  const isChiefEditor = user?.role === 'chief_editor';
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSyllabus, setSelectedSyllabus] = useState<Syllabus | null>(null);
  const [syllabusDetails, setSyllabusDetails] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [loadingLookupData, setLoadingLookupData] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    version: '1.0',
    is_active: true,
    is_public: false,
    difficulty_level: 2,
    estimated_duration_weeks: null as number | null,
    learning_objectives: '',
    prerequisites: '',
    subject_ids: [] as number[],
    grade_ids: [] as number[],
    unit_ids: [] as number[]
  });
  const [errors, setErrors] = useState<{
    name?: string;
    subjects?: string;
    grades?: string;
  }>({});

  useEffect(() => {
    fetchSyllabuses();
    fetchLookupData();
  }, []);

  const fetchSyllabuses = async () => {
    try {
      setLoading(true);
      const response = await getEditorSyllabuses();
      if (response?.results) {
        setSyllabuses(response.results);
      } else if (Array.isArray(response)) {
        setSyllabuses(response);
      } else if (response?.data?.results) {
        setSyllabuses(response.data.results);
      } else {
        setSyllabuses([]);
      }
    } catch (error: any) {
      console.error('Error fetching syllabuses:', error);
      toast.error('Failed to load syllabuses');
      setSyllabuses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLookupData = async () => {
    try {
      setLoadingLookupData(true);
      const [subjectsRes, gradesRes] = await Promise.all([
        api.getSubjects(),
        api.getGrades()
      ]);
      
      // Handle subjects response - lookup/subjects returns array directly
      if (Array.isArray(subjectsRes)) {
        setSubjects(subjectsRes);
      } else if (subjectsRes?.results) {
        setSubjects(subjectsRes.results);
      } else if (subjectsRes?.data?.results) {
        setSubjects(subjectsRes.data.results);
      } else if (subjectsRes?.data && Array.isArray(subjectsRes.data)) {
        setSubjects(subjectsRes.data);
      } else {
        console.warn('Unexpected subjects response format:', subjectsRes);
        setSubjects([]);
      }
      
      // Handle grades response - grades/ returns array directly
      if (Array.isArray(gradesRes)) {
        setGrades(gradesRes);
      } else if (gradesRes?.results) {
        setGrades(gradesRes.results);
      } else if (gradesRes?.data?.results) {
        setGrades(gradesRes.data.results);
      } else if (gradesRes?.data && Array.isArray(gradesRes.data)) {
        setGrades(gradesRes.data);
      } else {
        console.warn('Unexpected grades response format:', gradesRes);
        setGrades([]);
      }
    } catch (error) {
      console.error('Error fetching lookup data:', error);
      toast.error('Failed to load subjects and grades');
      setSubjects([]);
      setGrades([]);
    } finally {
      setLoadingLookupData(false);
    }
  };

  const fetchUnits = async (subjectId: number, gradeId: number) => {
    try {
      const response = await getLookupUnits(0, gradeId, subjectId);
      if (response?.results) {
        setUnits(response.results);
      } else if (Array.isArray(response)) {
        setUnits(response);
      } else {
        setUnits([]);
      }
    } catch (error) {
      console.error('Error fetching units:', error);
      setUnits([]);
    }
  };

  const handleCreate = async () => {
    // Validate form before submission
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
        return;
      }

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        version: formData.version,
        is_active: formData.is_active,
        is_public: formData.is_public,
        difficulty_level: formData.difficulty_level,
        estimated_duration_weeks: formData.estimated_duration_weeks,
        learning_objectives: formData.learning_objectives,
        prerequisites: formData.prerequisites,
        subject_ids: formData.subject_ids.map(id => typeof id === 'string' ? parseInt(id) : id),
        grade_ids: formData.grade_ids.map(id => typeof id === 'string' ? parseInt(id) : id),
        unit_ids: formData.unit_ids.map(id => typeof id === 'string' ? parseInt(id) : id)
      };

      const response = await createEditorSyllabus(payload);
      
      if (response?.id || response?.data?.id) {
        toast.success('Syllabus created successfully');
        setShowCreateModal(false);
        resetForm();
        fetchSyllabuses();
      } else {
        toast.error('Failed to create syllabus');
      }
    } catch (error: any) {
      console.error('Error creating syllabus:', error);
      toast.error(error?.message || 'Failed to create syllabus');
    }
  };

  const handleEdit = async () => {
    if (!selectedSyllabus) return;

    // Validate form before submission
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const payload: any = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        version: formData.version,
        is_active: formData.is_active,
        is_public: formData.is_public,
        difficulty_level: formData.difficulty_level,
        subject_ids: formData.subject_ids.map(id => typeof id === 'string' ? parseInt(id) : id),
        grade_ids: formData.grade_ids.map(id => typeof id === 'string' ? parseInt(id) : id),
        unit_ids: formData.unit_ids.map(id => typeof id === 'string' ? parseInt(id) : id)
      };

      if (formData.estimated_duration_weeks !== null) {
        payload.estimated_duration_weeks = formData.estimated_duration_weeks;
      }
      if (formData.learning_objectives) {
        payload.learning_objectives = formData.learning_objectives;
      }
      if (formData.prerequisites) {
        payload.prerequisites = formData.prerequisites;
      }

      const response = await updateEditorSyllabus(selectedSyllabus.id, payload);
      
      if (response?.id || response?.data?.id) {
        toast.success('Syllabus updated successfully');
        setShowEditModal(false);
        resetForm();
        fetchSyllabuses();
      } else {
        toast.error('Failed to update syllabus');
      }
    } catch (error: any) {
      console.error('Error updating syllabus:', error);
      toast.error(error?.message || 'Failed to update syllabus');
    }
  };

  const handleDelete = async (syllabus: Syllabus) => {
    if (!confirm(`Are you sure you want to delete "${syllabus.name}"?`)) {
      return;
    }

    try {
      await deleteEditorSyllabus(syllabus.id);
      toast.success('Syllabus deleted successfully');
      fetchSyllabuses();
    } catch (error: any) {
      console.error('Error deleting syllabus:', error);
      toast.error(error?.message || 'Failed to delete syllabus');
    }
  };

  const handleView = async (syllabus: Syllabus) => {
    try {
      setSelectedSyllabus(syllabus);
      const response = await getEditorSyllabus(syllabus.id);
      if (response?.data) {
        setSyllabusDetails(response.data);
        setShowViewModal(true);
      } else {
        toast.error('Failed to load syllabus details');
      }
    } catch (error: any) {
      console.error('Error fetching syllabus details:', error);
      toast.error('Failed to load syllabus details');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      version: '1.0',
      is_active: true,
      is_public: false,
      difficulty_level: 2,
      estimated_duration_weeks: null,
      learning_objectives: '',
      prerequisites: '',
      subject_ids: [],
      grade_ids: [],
      unit_ids: []
    });
    setSelectedSyllabus(null);
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: {
      name?: string;
      subjects?: string;
      grades?: string;
    } = {};

    // Validate syllabus name
    if (!formData.name.trim()) {
      newErrors.name = 'Syllabus name is required';
    }

    // Validate subjects
    if (formData.subject_ids.length === 0) {
      newErrors.subjects = 'At least one subject is required';
    }

    // Validate grades
    if (formData.grade_ids.length === 0) {
      newErrors.grades = 'At least one grade is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const openEditModal = async (syllabus: Syllabus) => {
    setSelectedSyllabus(syllabus);
    setFormData({
      name: syllabus.name,
      description: syllabus.description || '',
      version: syllabus.version,
      is_active: syllabus.is_active,
      is_public: syllabus.is_public,
      difficulty_level: 2,
      estimated_duration_weeks: null,
      learning_objectives: '',
      prerequisites: '',
      subject_ids: syllabus.subjects.map(s => s.id),
      grade_ids: syllabus.grades.map(g => g.id),
      unit_ids: []
    });
    // Ensure data is loaded before opening modal
    if (subjects.length === 0 || grades.length === 0) {
      await fetchLookupData();
    }
    setShowEditModal(true);
  };

  // If not Chief Editor, show access denied message
  if (!isChiefEditor) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#E3F3FF]">
          <Header />
          <div className="flex h-[calc(100vh-80px)]">
            <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
            <div className="flex-1 overflow-auto p-6">
              <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <FiBook className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
                  <p className="text-gray-600 mb-4">
                    Syllabus management is only available for Chief Editors.
                  </p>
                  <p className="text-sm text-gray-500">
                    Please contact your administrator if you need access to this feature.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#E3F3FF]">
        <Header />
        
        <div className="flex h-[calc(100vh-80px)]">
          <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
          
          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Syllabus Management</h1>
                  <p className="text-gray-600 mt-1">Create and manage syllabuses for curriculum organization (Chief Editor only)</p>
                </div>
                <button
                  onClick={async () => {
                    resetForm();
                    // Ensure data is loaded before opening modal
                    if (subjects.length === 0 || grades.length === 0) {
                      await fetchLookupData();
                    }
                    setShowCreateModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FiPlus className="w-5 h-5" />
                  Create Syllabus
                </button>
              </div>

              {/* Syllabuses List */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Loading syllabuses...</p>
                </div>
              ) : syllabuses.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                  <FiBook className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Syllabuses</h3>
                  <p className="text-gray-600 mb-4">Get started by creating your first syllabus</p>
                  <button
                    onClick={async () => {
                      resetForm();
                      // Ensure data is loaded before opening modal
                      if (subjects.length === 0 || grades.length === 0) {
                        await fetchLookupData();
                      }
                      setShowCreateModal(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Syllabus
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {syllabuses.map((syllabus) => (
                    <div
                      key={syllabus.id}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{syllabus.name}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2">{syllabus.description || 'No description'}</p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleView(syllabus)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <FiEye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => openEditModal(syllabus)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <FiEdit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(syllabus)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Version:</span>
                          <span className="font-medium">{syllabus.version}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subjects:</span>
                          <span className="font-medium">{syllabus.subjects.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Grades:</span>
                          <span className="font-medium">{syllabus.grades.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Units:</span>
                          <span className="font-medium">{syllabus.total_units || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Topics:</span>
                          <span className="font-medium">{syllabus.total_topics || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Questions:</span>
                          <span className="font-medium">{syllabus.total_questions || 0}</span>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            syllabus.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {syllabus.is_active ? 'Active' : 'Inactive'}
                          </span>
                          {syllabus.is_public && (
                            <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                              Public
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: '#00000047' }}>
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Create New Syllabus</h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Syllabus Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (errors.name) {
                        setErrors({ ...errors, name: undefined });
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., GCSE Mathematics"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Describe the syllabus..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Version
                    </label>
                    <input
                      type="text"
                      value={formData.version}
                      onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="1.0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Difficulty Level
                    </label>
                    <select
                      value={formData.difficulty_level}
                      onChange={(e) => setFormData({ ...formData, difficulty_level: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={1}>Beginner</option>
                      <option value={2}>Intermediate</option>
                      <option value={3}>Advanced</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Estimated Duration (weeks)
                  </label>
                  <input
                    type="number"
                    value={formData.estimated_duration_weeks || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      estimated_duration_weeks: e.target.value ? parseInt(e.target.value) : null 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 12"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Subjects *
                  </label>
                  <div className={`max-h-48 overflow-y-auto border rounded-lg p-3 bg-white ${
                    errors.subjects ? 'border-red-500' : 'border-gray-300'
                  }`}>
                    {loadingLookupData ? (
                      <p className="text-sm text-gray-500 text-center py-4">Loading subjects...</p>
                    ) : subjects.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">No subjects available</p>
                    ) : (
                      <div className="space-y-2">
                        {subjects.map((subject) => (
                          <label
                            key={subject.id}
                            className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={formData.subject_ids.includes(subject.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  const newSubjectIds = [...formData.subject_ids, subject.id];
                                  setFormData({
                                    ...formData,
                                    subject_ids: newSubjectIds
                                  });
                                  if (errors.subjects && newSubjectIds.length > 0) {
                                    setErrors({ ...errors, subjects: undefined });
                                  }
                                } else {
                                  const newSubjectIds = formData.subject_ids.filter(id => id !== subject.id);
                                  setFormData({
                                    ...formData,
                                    subject_ids: newSubjectIds
                                  });
                                  if (errors.subjects && newSubjectIds.length > 0) {
                                    setErrors({ ...errors, subjects: undefined });
                                  }
                                }
                              }}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-black">{subject.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.subjects && (
                    <p className="mt-1 text-sm text-red-600">{errors.subjects}</p>
                  )}
                  {formData.subject_ids.length > 0 && !errors.subjects && (
                    <p className="mt-1 text-xs text-blue-600">
                      {formData.subject_ids.length} subject(s) selected
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Grades *
                  </label>
                  <div className={`max-h-48 overflow-y-auto border rounded-lg p-3 bg-white ${
                    errors.grades ? 'border-red-500' : 'border-gray-300'
                  }`}>
                    {loadingLookupData ? (
                      <p className="text-sm text-gray-500 text-center py-4">Loading grades...</p>
                    ) : grades.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">No grades available</p>
                    ) : (
                      <div className="space-y-2">
                        {grades.sort((a, b) => (a.level || 0) - (b.level || 0)).map((grade) => (
                          <label
                            key={grade.id}
                            className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={formData.grade_ids.includes(grade.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  const newGradeIds = [...formData.grade_ids, grade.id];
                                  setFormData({
                                    ...formData,
                                    grade_ids: newGradeIds
                                  });
                                  if (errors.grades && newGradeIds.length > 0) {
                                    setErrors({ ...errors, grades: undefined });
                                  }
                                } else {
                                  const newGradeIds = formData.grade_ids.filter(id => id !== grade.id);
                                  setFormData({
                                    ...formData,
                                    grade_ids: newGradeIds
                                  });
                                  if (errors.grades && newGradeIds.length > 0) {
                                    setErrors({ ...errors, grades: undefined });
                                  }
                                }
                              }}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-black">{grade.name || `Grade ${grade.level}`}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.grades && (
                    <p className="mt-1 text-sm text-red-600">{errors.grades}</p>
                  )}
                  {formData.grade_ids.length > 0 && !errors.grades && (
                    <p className="mt-1 text-xs text-blue-600">
                      {formData.grade_ids.length} grade(s) selected
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-black">Active</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_public}
                      onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-black">Public</span>
                  </label>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <FiSave className="w-4 h-4" />
                  Create Syllabus
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedSyllabus && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: '#00000047' }}>
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Edit Syllabus</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Syllabus Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (errors.name) {
                        setErrors({ ...errors, name: undefined });
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Version
                    </label>
                    <input
                      type="text"
                      value={formData.version}
                      onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Difficulty Level
                    </label>
                    <select
                      value={formData.difficulty_level}
                      onChange={(e) => setFormData({ ...formData, difficulty_level: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={1}>Beginner</option>
                      <option value={2}>Intermediate</option>
                      <option value={3}>Advanced</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Subjects *
                  </label>
                  <div className={`max-h-48 overflow-y-auto border rounded-lg p-3 bg-white ${
                    errors.subjects ? 'border-red-500' : 'border-gray-300'
                  }`}>
                    {loadingLookupData ? (
                      <p className="text-sm text-gray-500 text-center py-4">Loading subjects...</p>
                    ) : subjects.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">No subjects available</p>
                    ) : (
                      <div className="space-y-2">
                        {subjects.map((subject) => (
                          <label
                            key={subject.id}
                            className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={formData.subject_ids.includes(subject.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  const newSubjectIds = [...formData.subject_ids, subject.id];
                                  setFormData({
                                    ...formData,
                                    subject_ids: newSubjectIds
                                  });
                                  if (errors.subjects && newSubjectIds.length > 0) {
                                    setErrors({ ...errors, subjects: undefined });
                                  }
                                } else {
                                  const newSubjectIds = formData.subject_ids.filter(id => id !== subject.id);
                                  setFormData({
                                    ...formData,
                                    subject_ids: newSubjectIds
                                  });
                                  if (errors.subjects && newSubjectIds.length > 0) {
                                    setErrors({ ...errors, subjects: undefined });
                                  }
                                }
                              }}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-black">{subject.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.subjects && (
                    <p className="mt-1 text-sm text-red-600">{errors.subjects}</p>
                  )}
                  {formData.subject_ids.length > 0 && !errors.subjects && (
                    <p className="mt-1 text-xs text-blue-600">
                      {formData.subject_ids.length} subject(s) selected
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Grades *
                  </label>
                  <div className={`max-h-48 overflow-y-auto border rounded-lg p-3 bg-white ${
                    errors.grades ? 'border-red-500' : 'border-gray-300'
                  }`}>
                    {loadingLookupData ? (
                      <p className="text-sm text-gray-500 text-center py-4">Loading grades...</p>
                    ) : grades.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">No grades available</p>
                    ) : (
                      <div className="space-y-2">
                        {grades.sort((a, b) => (a.level || 0) - (b.level || 0)).map((grade) => (
                          <label
                            key={grade.id}
                            className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={formData.grade_ids.includes(grade.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  const newGradeIds = [...formData.grade_ids, grade.id];
                                  setFormData({
                                    ...formData,
                                    grade_ids: newGradeIds
                                  });
                                  if (errors.grades && newGradeIds.length > 0) {
                                    setErrors({ ...errors, grades: undefined });
                                  }
                                } else {
                                  const newGradeIds = formData.grade_ids.filter(id => id !== grade.id);
                                  setFormData({
                                    ...formData,
                                    grade_ids: newGradeIds
                                  });
                                  if (errors.grades && newGradeIds.length > 0) {
                                    setErrors({ ...errors, grades: undefined });
                                  }
                                }
                              }}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-black">{grade.name || `Grade ${grade.level}`}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.grades && (
                    <p className="mt-1 text-sm text-red-600">{errors.grades}</p>
                  )}
                  {formData.grade_ids.length > 0 && !errors.grades && (
                    <p className="mt-1 text-xs text-blue-600">
                      {formData.grade_ids.length} grade(s) selected
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-black">Active</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_public}
                      onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-black">Public</span>
                  </label>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <FiSave className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Details Modal */}
        {showViewModal && syllabusDetails && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: '#00000047' }}>
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">{syllabusDetails.name}</h2>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSyllabusDetails(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Version:</span>
                      <span className="ml-2 font-medium">{syllabusDetails.version}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Type:</span>
                      <span className="ml-2 font-medium">{syllabusDetails.syllabus_type}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${
                        syllabusDetails.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {syllabusDetails.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {syllabusDetails.is_public && (
                      <div>
                        <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                          Public
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {syllabusDetails.description && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-700">{syllabusDetails.description}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Subjects & Grades</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Subjects:</p>
                      <div className="flex flex-wrap gap-2">
                        {syllabusDetails.subjects?.map((subject: any) => (
                          <span key={subject.id} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {subject.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Grades:</p>
                      <div className="flex flex-wrap gap-2">
                        {syllabusDetails.grades?.map((grade: any) => (
                          <span key={grade.id} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                            {grade.name || `Grade ${grade.level}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {syllabusDetails.content_structure && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Content Structure</h3>
                    <div className="space-y-4">
                      {syllabusDetails.content_structure.units?.map((unit: any) => (
                        <div key={unit.id} className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2">{unit.name}</h4>
                          <div className="ml-4 space-y-2">
                            {unit.topics?.map((topic: any) => (
                              <div key={topic.id} className="text-sm text-gray-700">
                                • {topic.name} ({topic.question_count || 0} questions)
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {syllabusDetails.usage_statistics && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Statistics</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">
                          {syllabusDetails.usage_statistics.total_units || 0}
                        </div>
                        <div className="text-sm text-gray-600">Units</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">
                          {syllabusDetails.usage_statistics.total_topics || 0}
                        </div>
                        <div className="text-sm text-gray-600">Topics</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">
                          {syllabusDetails.usage_statistics.total_questions || 0}
                        </div>
                        <div className="text-sm text-gray-600">Questions</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSyllabusDetails(null);
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default SyllabusesPage;

