'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PageLayout from '../../components/layout/PageLayout';
import CardSimple from '../../components/ui/CardSimple';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ProtectedRoute from '../../components/ProtectedRoute';
import { toast } from 'react-hot-toast';
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdClose,
  MdSave,
  MdVisibility,
  MdMenuBook
} from 'react-icons/md';
import { api } from '../lib/api';
import {
  getEditorSyllabuses,
  createEditorSyllabus,
  updateEditorSyllabus,
  deleteEditorSyllabus,
  getEditorSyllabus
} from '../lib/api';

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

const SyllabusesPageContent = () => {
  const { user } = useAuth();
  const [syllabuses, setSyllabuses] = useState<Syllabus[]>([]);
  const [loading, setLoading] = useState(true);

  const isChiefEditor = user?.role === 'chief_editor';
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSyllabus, setSelectedSyllabus] = useState<Syllabus | null>(null);
  const [syllabusToDelete, setSyllabusToDelete] = useState<Syllabus | null>(null);
  const [syllabusDetails, setSyllabusDetails] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
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

      if (Array.isArray(subjectsRes)) {
        setSubjects(subjectsRes);
      } else if (subjectsRes?.results) {
        setSubjects(subjectsRes.results);
      } else if (subjectsRes?.data?.results) {
        setSubjects(subjectsRes.data.results);
      } else if (subjectsRes?.data && Array.isArray(subjectsRes.data)) {
        setSubjects(subjectsRes.data);
      } else {
        setSubjects([]);
      }

      if (Array.isArray(gradesRes)) {
        setGrades(gradesRes);
      } else if (gradesRes?.results) {
        setGrades(gradesRes.results);
      } else if (gradesRes?.data?.results) {
        setGrades(gradesRes.data.results);
      } else if (gradesRes?.data && Array.isArray(gradesRes.data)) {
        setGrades(gradesRes.data);
      } else {
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

  const handleCreate = async () => {
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

  const handleDeleteClick = (syllabus: Syllabus) => {
    setSyllabusToDelete(syllabus);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!syllabusToDelete) return;

    try {
      await deleteEditorSyllabus(syllabusToDelete.id);
      toast.success('Syllabus deleted successfully');
      setShowDeleteModal(false);
      setSyllabusToDelete(null);
      fetchSyllabuses();
    } catch (error: any) {
      console.error('Error deleting syllabus:', error);
      toast.error(error?.message || 'Failed to delete syllabus');
      setShowDeleteModal(false);
      setSyllabusToDelete(null);
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

    if (!formData.name.trim()) {
      newErrors.name = 'Syllabus name is required';
    }
    if (formData.subject_ids.length === 0) {
      newErrors.subjects = 'At least one subject is required';
    }
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
    if (subjects.length === 0 || grades.length === 0) {
      await fetchLookupData();
    }
    setShowEditModal(true);
  };

  const openCreateModal = async () => {
    resetForm();
    if (subjects.length === 0 || grades.length === 0) {
      await fetchLookupData();
    }
    setShowCreateModal(true);
  };

  // Syllabus form content (shared between create and edit modals)
  const renderSyllabusForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Syllabus Name *
        </label>
        <Input
          type="text"
          value={formData.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setFormData({ ...formData, name: e.target.value });
            if (errors.name) setErrors({ ...errors, name: undefined });
          }}
          placeholder="e.g., GCSE Mathematics"
          error={errors.name}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full h-20 px-4 py-3 bg-white border-[1.5px] border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#398AC8] text-[#0F172A] placeholder-gray-400 transition-all duration-200"
          rows={3}
          placeholder="Describe the syllabus..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Version
          </label>
          <Input
            type="text"
            value={formData.version}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, version: e.target.value })}
            placeholder="1.0"
            error={undefined}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Difficulty Level
          </label>
          <select
            value={formData.difficulty_level}
            onChange={(e) => setFormData({ ...formData, difficulty_level: parseInt(e.target.value) })}
            className="w-full h-12 px-4 py-3 bg-white border-[1.5px] border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#398AC8] text-[#0F172A] transition-all duration-200"
          >
            <option value={1}>Beginner</option>
            <option value={2}>Intermediate</option>
            <option value={3}>Advanced</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Estimated Duration (weeks)
        </label>
        <Input
          type="number"
          value={formData.estimated_duration_weeks || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({
            ...formData,
            estimated_duration_weeks: e.target.value ? parseInt(e.target.value) : null
          })}
          placeholder="e.g., 12"
          error={undefined}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Subjects *
        </label>
        <div className={`max-h-48 overflow-y-auto border-[1.5px] rounded-xl p-3 bg-white ${
          errors.subjects ? 'border-red-500' : 'border-[#CBD5E1]'
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
                      const newIds = e.target.checked
                        ? [...formData.subject_ids, subject.id]
                        : formData.subject_ids.filter(id => id !== subject.id);
                      setFormData({ ...formData, subject_ids: newIds });
                      if (errors.subjects && newIds.length > 0) {
                        setErrors({ ...errors, subjects: undefined });
                      }
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{subject.name}</span>
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
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Grades *
        </label>
        <div className={`max-h-48 overflow-y-auto border-[1.5px] rounded-xl p-3 bg-white ${
          errors.grades ? 'border-red-500' : 'border-[#CBD5E1]'
        }`}>
          {loadingLookupData ? (
            <p className="text-sm text-gray-500 text-center py-4">Loading grades...</p>
          ) : grades.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No grades available</p>
          ) : (
            <div className="space-y-2">
              {grades.sort((a: any, b: any) => (a.level || 0) - (b.level || 0)).map((grade: any) => (
                <label
                  key={grade.id}
                  className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.grade_ids.includes(grade.id)}
                    onChange={(e) => {
                      const newIds = e.target.checked
                        ? [...formData.grade_ids, grade.id]
                        : formData.grade_ids.filter(id => id !== grade.id);
                      setFormData({ ...formData, grade_ids: newIds });
                      if (errors.grades && newIds.length > 0) {
                        setErrors({ ...errors, grades: undefined });
                      }
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{grade.name || `Grade ${grade.level}`}</span>
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
          <span className="text-sm text-gray-700">Active</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.is_public}
            onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Public</span>
        </label>
      </div>
    </div>
  );

  if (!isChiefEditor) {
    return (
      <PageLayout title="Syllabuses" subtitle="Syllabus management for curriculum organization">
        <CardSimple>
          <div className="text-center py-12">
            <MdMenuBook className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
            <p className="text-gray-600 mb-4">
              Syllabus management is only available for Chief Editors.
            </p>
            <p className="text-sm text-gray-500">
              Please contact your administrator if you need access to this feature.
            </p>
          </div>
        </CardSimple>
      </PageLayout>
    );
  }

  if (loading) {
    return (
      <PageLayout title="Syllabuses" subtitle="Create and manage syllabuses for curriculum organization">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Syllabuses"
      subtitle="Create and manage syllabuses for curriculum organization"
      actions={
        <Button
          onClick={openCreateModal}
          className="flex items-center gap-2"
        >
          <MdAdd className="w-5 h-5" />
          Create Syllabus
        </Button>
      }
    >
      <div className="space-y-6">
        {syllabuses.length === 0 ? (
          <CardSimple>
            <div className="text-center py-12">
              <MdMenuBook className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Syllabuses</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first syllabus</p>
              <Button onClick={openCreateModal}>
                <MdAdd className="w-5 h-5 mr-2" />
                Create Syllabus
              </Button>
            </div>
          </CardSimple>
        ) : (
          <CardSimple>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Version</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Subjects</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Grades</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Units</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Topics</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Questions</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {syllabuses.map((syllabus) => (
                    <tr key={syllabus.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{syllabus.name}</div>
                        {syllabus.description && (
                          <div className="text-gray-500 text-xs mt-1 line-clamp-1">{syllabus.description}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-700">{syllabus.version}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-700">{syllabus.subjects.length}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-700">{syllabus.grades.length}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-700">{syllabus.total_units || 0}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-700">{syllabus.total_topics || 0}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-700">{syllabus.total_questions || 0}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            syllabus.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {syllabus.is_active ? 'Active' : 'Inactive'}
                          </span>
                          {syllabus.is_public && (
                            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              Public
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleView(syllabus)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <MdVisibility className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => openEditModal(syllabus)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <MdEdit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(syllabus)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <MdDelete className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardSimple>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <Modal
            isOpen={showCreateModal}
            onClose={() => {
              setShowCreateModal(false);
              resetForm();
            }}
            title="Create New Syllabus"
            size="lg"
          >
            {renderSyllabusForm()}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
              >
                <MdClose className="w-5 h-5 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleCreate}>
                <MdSave className="w-5 h-5 mr-2" />
                Create
              </Button>
            </div>
          </Modal>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedSyllabus && (
          <Modal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              resetForm();
            }}
            title="Edit Syllabus"
            size="lg"
          >
            {renderSyllabusForm()}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowEditModal(false);
                  resetForm();
                }}
              >
                <MdClose className="w-5 h-5 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleEdit}>
                <MdSave className="w-5 h-5 mr-2" />
                Save Changes
              </Button>
            </div>
          </Modal>
        )}

        {/* View Details Modal */}
        {showViewModal && syllabusDetails && (
          <Modal
            isOpen={showViewModal}
            onClose={() => {
              setShowViewModal(false);
              setSyllabusDetails(null);
            }}
            title={syllabusDetails.name}
            size="xl"
          >
            <div className="space-y-6">
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
                              - {topic.name} ({topic.question_count || 0} questions)
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
            <div className="flex justify-end pt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowViewModal(false);
                  setSyllabusDetails(null);
                }}
              >
                Close
              </Button>
            </div>
          </Modal>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && syllabusToDelete && (
          <ConfirmModal
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setSyllabusToDelete(null);
            }}
            onConfirm={handleDeleteConfirm}
            title="Delete Syllabus"
            message={`Are you sure you want to delete "${syllabusToDelete.name}"? This action cannot be undone.`}
            confirmText="Delete"
            cancelText="Cancel"
            type="danger"
          />
        )}
      </div>
    </PageLayout>
  );
};

export default function SyllabusesPage() {
  return (
    <ProtectedRoute>
      <SyllabusesPageContent />
    </ProtectedRoute>
  );
}
