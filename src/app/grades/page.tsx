'use client';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import PageLayout from '../../components/layout/PageLayout';
import CardSimple from '../../components/ui/CardSimple';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { 
  MdAdd, 
  MdEdit, 
  MdDelete, 
  MdClose,
  MdSave,
  MdClass
} from 'react-icons/md';
import { getGrades, createGrade, updateGrade, deleteGrade } from '../lib/api';

const GradesPage = () => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<any>(null);
  const [gradeToDelete, setGradeToDelete] = useState<any>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 100,
    count: 0,
    next: null,
    previous: null
  });
  const [formData, setFormData] = useState({
    level: 1
  });
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async (page = 1) => {
    try {
      setLoading(true);
      const response = await getGrades(page, 100);
      let gradesList = [];
      let paginationData = {};
      
      if (response.data && response.data.results) {
        gradesList = response.data.results;
        paginationData = {
          page: response.page || page,
          pageSize: response.pageSize || 100,
          count: parseInt(response.data.count) || response.data.results.length,
          next: response.data.next,
          previous: response.data.previous
        };
      } else if (response.results) {
        gradesList = response.results;
        paginationData = {
          page: response.page || page,
          pageSize: response.pageSize || 100,
          count: response.count || response.results.length,
          next: response.next,
          previous: response.previous
        };
      } else if (Array.isArray(response)) {
        gradesList = response;
        paginationData = {
          page: 1,
          pageSize: response.length,
          count: response.length,
          next: null,
          previous: null
        };
      }
      
      setGrades(gradesList);
      setPagination(paginationData);
    } catch (error: any) {
      console.error('Error fetching grades:', error);
      toast.error(error.message || 'Failed to load grades');
      setGrades([]);
    } finally {
      setLoading(false);
    }
  };

  const validateGradeLevel = (level: number, excludeId: number | null = null) => {
    const numLevel = parseInt(level.toString());
    
    if (isNaN(numLevel) || numLevel < 1 || numLevel > 12) {
      return 'Grade level must be between 1 and 12';
    }

    const existingGrade = grades.find((g: any) => g.level === numLevel && g.id !== excludeId);
    if (existingGrade) {
      return `Grade level ${numLevel} already exists`;
    }
    
    return '';
  };

  const handleLevelChange = (value: string) => {
    const numValue = parseInt(value);
    
    let clampedValue = numValue;
    if (!isNaN(numValue)) {
      if (numValue < 1) clampedValue = 1;
      if (numValue > 12) clampedValue = 12;
    } else {
      clampedValue = 1;
    }
    
    setFormData({ ...formData, level: clampedValue });
    
    const error = validateGradeLevel(clampedValue, selectedGrade?.id);
    setValidationError(error);
  };

  const handleCreate = async () => {
    const error = validateGradeLevel(formData.level);
    if (error) {
      toast.error(error);
      setValidationError(error);
      return;
    }

    try {
      await createGrade(formData);
      toast.success('Grade created successfully');
      setShowCreateModal(false);
      resetForm();
      setValidationError('');
      fetchGrades(1);
    } catch (error: any) {
      console.error('Error creating grade:', error);
      toast.error(error.message || 'Failed to create grade');
    }
  };

  const handleUpdate = async () => {
    if (!selectedGrade) return;

    const error = validateGradeLevel(formData.level, selectedGrade.id);
    if (error) {
      toast.error(error);
      setValidationError(error);
      return;
    }

    try {
      await updateGrade(selectedGrade.id, formData);
      toast.success('Grade updated successfully');
      setShowEditModal(false);
      setSelectedGrade(null);
      resetForm();
      setValidationError('');
      fetchGrades();
    } catch (error: any) {
      console.error('Error updating grade:', error);
      toast.error(error.message || 'Failed to update grade');
    }
  };

  const handleDeleteClick = (grade: any) => {
    setGradeToDelete(grade);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!gradeToDelete) return;

    try {
      await deleteGrade(gradeToDelete.id);
      toast.success('Grade deleted successfully');
      setShowDeleteModal(false);
      setGradeToDelete(null);
      fetchGrades();
    } catch (error: any) {
      console.error('Error deleting grade:', error);
      toast.error(error.message || 'Failed to delete grade');
      setShowDeleteModal(false);
      setGradeToDelete(null);
    }
  };

  const openEditModal = (grade: any) => {
    setSelectedGrade(grade);
    setFormData({
      level: grade.level || 1
    });
    setValidationError('');
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      level: 1
    });
    setSelectedGrade(null);
    setValidationError('');
  };

  if (loading) {
    return (
      <PageLayout title="Grades" subtitle="Manage grade levels for curriculum organization">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title="Grades" 
      subtitle="Manage grade levels for curriculum organization"
      actions={
        <Button
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
          className="flex items-center gap-2"
        >
          <MdAdd className="w-5 h-5" />
          Create Grade
        </Button>
      }
    >
      <div className="space-y-6">
        {grades.length === 0 ? (
          <CardSimple>
            <div className="text-center py-12">
              <MdClass className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Grades</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first grade</p>
              <Button
                onClick={() => {
                  resetForm();
                  setShowCreateModal(true);
                }}
              >
                <MdAdd className="w-5 h-5 mr-2" />
                Create Grade
              </Button>
            </div>
          </CardSimple>
        ) : (
          <CardSimple>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Level</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Units</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Topics</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Questions</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.sort((a: any, b: any) => a.level - b.level).map((grade: any) => (
                    <tr key={grade.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{grade.level}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{grade.name || `Grade ${grade.level}`}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-700">{grade.total_units || 0}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-700">{grade.total_topics || 0}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-700">{grade.total_questions || 0}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(grade)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <MdEdit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(grade)}
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
            {/* Pagination Controls */}
            {(pagination.next || pagination.previous) && (
              <div className="flex items-center justify-between mt-4 px-4 py-3 border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Showing {((pagination.page - 1) * pagination.pageSize) + 1} to {Math.min(pagination.page * pagination.pageSize, pagination.count)} of {pagination.count} grades
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchGrades(pagination.page - 1)}
                    disabled={!pagination.previous}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm text-gray-700">
                    Page {pagination.page}
                  </span>
                  <button
                    onClick={() => fetchGrades(pagination.page + 1)}
                    disabled={!pagination.next}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
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
            title="Create New Grade"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grade Level * (1-12)
                </label>
                <Input
                  type="number"
                  min="1"
                  max="12"
                  value={formData.level}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleLevelChange(e.target.value)}
                  placeholder="e.g., 1"
                  error={validationError ? validationError : undefined}
                />
                {validationError ? (
                  <p className="text-xs text-red-600 mt-1">{validationError}</p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">
                    Grade level from 1 (1st Grade) to 12 (12th Grade)
                  </p>
                )}
              </div>
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
                <Button 
                  onClick={handleCreate}
                  disabled={!!validationError || !formData.level}
                >
                  <MdSave className="w-5 h-5 mr-2" />
                  Create
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedGrade && (
          <Modal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              resetForm();
            }}
            title="Edit Grade"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grade Level * (1-12)
                </label>
                <Input
                  type="number"
                  min="1"
                  max="12"
                  value={formData.level}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleLevelChange(e.target.value)}
                  onBlur={() => {
                    const error = validateGradeLevel(formData.level, selectedGrade?.id);
                    setValidationError(error);
                  }}
                  placeholder="e.g., 1"
                  error={validationError ? validationError : undefined}
                />
                {validationError ? (
                  <p className="text-xs text-red-600 mt-1">{validationError}</p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">
                    Grade level from 1 (1st Grade) to 12 (12th Grade)
                  </p>
                )}
              </div>
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
                <Button 
                  onClick={handleUpdate}
                  disabled={!!validationError || !formData.level}
                >
                  <MdSave className="w-5 h-5 mr-2" />
                  Update
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && gradeToDelete && (
          <ConfirmModal
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setGradeToDelete(null);
            }}
            onConfirm={handleDeleteConfirm}
            title="Delete Grade"
            message={`Are you sure you want to delete "${gradeToDelete.name || `Grade ${gradeToDelete.level}`}"? This action cannot be undone.`}
            confirmText="Delete"
            cancelText="Cancel"
            type="danger"
          />
        )}
      </div>
    </PageLayout>
  );
};

export default GradesPage;
