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
  MdMenuBook
} from 'react-icons/md';
import { getSubjects, createSubject, updateSubject, deleteSubject } from '../lib/api';

const SubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [subjectToDelete, setSubjectToDelete] = useState<any>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 100,
    count: 0,
    next: null,
    previous: null
  });
  const [formData, setFormData] = useState({
    name: ''
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async (page = 1) => {
    try {
      setLoading(true);
      const response = await getSubjects(page, 100);
      let subjectsList = [];
      let paginationData = {};
      
      if (response.data && response.data.results) {
        subjectsList = response.data.results;
        paginationData = {
          page: response.page || page,
          pageSize: response.pageSize || 100,
          count: parseInt(response.data.count) || response.data.results.length,
          next: response.data.next,
          previous: response.data.previous
        };
      } else if (response.results) {
        subjectsList = response.results;
        paginationData = {
          page: response.page || page,
          pageSize: response.pageSize || 100,
          count: response.count || response.results.length,
          next: response.next,
          previous: response.previous
        };
      } else if (Array.isArray(response)) {
        subjectsList = response;
        paginationData = {
          page: 1,
          pageSize: response.length,
          count: response.length,
          next: null,
          previous: null
        };
      }
      
      setSubjects(subjectsList);
      setPagination(paginationData);
    } catch (error: any) {
      console.error('Error fetching subjects:', error);
      toast.error(error.message || 'Failed to load subjects');
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      if (!formData.name) {
        toast.error('Subject name is required');
        return;
      }

      await createSubject(formData);
      toast.success('Subject created successfully');
      setShowCreateModal(false);
      resetForm();
      fetchSubjects(1);
    } catch (error: any) {
      console.error('Error creating subject:', error);
      toast.error(error.message || 'Failed to create subject');
    }
  };

  const handleUpdate = async () => {
    if (!selectedSubject) return;

    try {
      if (!formData.name) {
        toast.error('Subject name is required');
        return;
      }

      await updateSubject(selectedSubject.id, formData);
      toast.success('Subject updated successfully');
      setShowEditModal(false);
      setSelectedSubject(null);
      resetForm();
      fetchSubjects();
    } catch (error: any) {
      console.error('Error updating subject:', error);
      toast.error(error.message || 'Failed to update subject');
    }
  };

  const handleDeleteClick = (subject: any) => {
    setSubjectToDelete(subject);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!subjectToDelete) return;

    try {
      await deleteSubject(subjectToDelete.id);
      toast.success('Subject deleted successfully');
      setShowDeleteModal(false);
      setSubjectToDelete(null);
      fetchSubjects();
    } catch (error: any) {
      console.error('Error deleting subject:', error);
      toast.error(error.message || 'Failed to delete subject');
      setShowDeleteModal(false);
      setSubjectToDelete(null);
    }
  };

  const openEditModal = (subject: any) => {
    setSelectedSubject(subject);
    setFormData({
      name: subject.name || ''
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: ''
    });
    setSelectedSubject(null);
  };

  if (loading) {
    return (
      <PageLayout title="Subjects" subtitle="Manage subjects for curriculum organization">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title="Subjects" 
      subtitle="Manage subjects for curriculum organization"
      actions={
        <Button
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
          className="flex items-center gap-2"
        >
          <MdAdd className="w-5 h-5" />
          Create Subject
        </Button>
      }
    >
      <div className="space-y-6">
        {subjects.length === 0 ? (
          <CardSimple>
            <div className="text-center py-12">
              <MdMenuBook className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Subjects</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first subject</p>
              <Button
                onClick={() => {
                  resetForm();
                  setShowCreateModal(true);
                }}
              >
                <MdAdd className="w-5 h-5 mr-2" />
                Create Subject
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
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Organization</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Units</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Topics</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Questions</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((subject: any) => (
                    <tr key={subject.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{subject.name}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-gray-600 text-sm">
                          {subject.organization ? subject.organization.name : 'All Organizations'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-700">{subject.total_units || 0}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-700">{subject.total_topics || 0}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-700">{subject.total_questions || 0}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(subject)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <MdEdit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(subject)}
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
                  Showing {((pagination.page - 1) * pagination.pageSize) + 1} to {Math.min(pagination.page * pagination.pageSize, pagination.count)} of {pagination.count} subjects
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchSubjects(pagination.page - 1)}
                    disabled={!pagination.previous}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm text-gray-700">
                    Page {pagination.page}
                  </span>
                  <button
                    onClick={() => fetchSubjects(pagination.page + 1)}
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
            title="Create New Subject"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Mathematics"
                  error={undefined}
                />
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
                <Button onClick={handleCreate}>
                  <MdSave className="w-5 h-5 mr-2" />
                  Create
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedSubject && (
          <Modal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              resetForm();
            }}
            title="Edit Subject"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Mathematics"
                  error={undefined}
                />
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
                <Button onClick={handleUpdate}>
                  <MdSave className="w-5 h-5 mr-2" />
                  Update
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && subjectToDelete && (
          <ConfirmModal
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setSubjectToDelete(null);
            }}
            onConfirm={handleDeleteConfirm}
            title="Delete Subject"
            message={`Are you sure you want to delete "${subjectToDelete.name}"? This action cannot be undone.`}
            confirmText="Delete"
            cancelText="Cancel"
            type="danger"
          />
        )}
      </div>
    </PageLayout>
  );
};

export default SubjectsPage;
