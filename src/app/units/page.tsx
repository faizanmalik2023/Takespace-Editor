'use client';
import { useState, useEffect, useRef } from 'react';
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
  MdFolder,
  MdSearch,
  MdClear
} from 'react-icons/md';
import { getEditorUnits, searchEditorUnits, createUnit, updateUnit, deleteUnit, getSubjects, getGrades } from '../lib/api';

const UnitsPage = () => {
  const [units, setUnits] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingLookup, setLoadingLookup] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [unitToDelete, setUnitToDelete] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 100,
    count: 0,
    next: null,
    previous: null
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    grade: '',
    youtube_video_url: ''
  });

  useEffect(() => {
    fetchUnits();
    fetchLookupData();
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showSuggestions && !(event.target as Element)?.closest('.search-container')) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSuggestions]);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSuggestions(false);
      fetchUnits(1);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setIsSearching(true);
        const results = await searchEditorUnits(searchQuery);
        const resultsArray = Array.isArray(results) ? results : (results.results || []);
        setSearchResults(resultsArray);
        setShowSuggestions(true);
        setPagination({
          page: 1,
          pageSize: 100,
          count: resultsArray.length,
          next: null,
          previous: null
        });
      } catch (error: any) {
        console.error('Error searching units:', error);
        setSearchResults([]);
        toast.error('Failed to search units');
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const fetchLookupData = async () => {
    try {
      setLoadingLookup(true);
      const [subjectsRes, gradesRes] = await Promise.all([
        getSubjects(1, 1000),
        getGrades(1, 1000)
      ]);
      const subjectsList = Array.isArray(subjectsRes) 
        ? subjectsRes 
        : (subjectsRes?.results || subjectsRes?.data?.results || []);
      const gradesList = Array.isArray(gradesRes) 
        ? gradesRes 
        : (gradesRes?.results || gradesRes?.data?.results || []);
      setSubjects(subjectsList);
      setGrades(gradesList);
    } catch (error: any) {
      console.error('Error fetching lookup data:', error);
      toast.error('Failed to load subjects and grades');
    } finally {
      setLoadingLookup(false);
    }
  };

  const fetchUnits = async (page = 1) => {
    try {
      setLoading(true);
      const response = await getEditorUnits(page, 100);
      let unitsList = [];
      let paginationData = {};
      
      if (response.data && response.data.results) {
        unitsList = response.data.results;
        paginationData = {
          page: response.page || page,
          pageSize: response.pageSize || 100,
          count: parseInt(response.data.count) || response.data.results.length,
          next: response.data.next,
          previous: response.data.previous
        };
      } else if (response.results) {
        unitsList = response.results;
        paginationData = {
          page: response.page || page,
          pageSize: response.pageSize || 100,
          count: response.count || response.results.length,
          next: response.next,
          previous: response.previous
        };
      } else if (Array.isArray(response)) {
        unitsList = response;
        paginationData = {
          page: 1,
          pageSize: response.length,
          count: response.length,
          next: null,
          previous: null
        };
      }
      
      setUnits(unitsList);
      setPagination(paginationData);
    } catch (error: any) {
      console.error('Error fetching units:', error);
      toast.error(error.message || 'Failed to load units');
      setUnits([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      if (!formData.name) {
        toast.error('Unit name is required');
        return;
      }
      if (!formData.subject) {
        toast.error('Subject is required');
        return;
      }
      if (!formData.grade) {
        toast.error('Grade is required');
        return;
      }

      await createUnit({
        name: formData.name,
        subject: parseInt(formData.subject),
        grade: parseInt(formData.grade),
        youtube_video_url: formData.youtube_video_url || null
      });
      toast.success('Unit created successfully');
      setShowCreateModal(false);
      resetForm();
      fetchUnits(1);
    } catch (error: any) {
      console.error('Error creating unit:', error);
      toast.error(error.message || 'Failed to create unit');
    }
  };

  const handleUpdate = async () => {
    if (!selectedUnit) return;

    try {
      if (!formData.name) {
        toast.error('Unit name is required');
        return;
      }

      await updateUnit((selectedUnit as any).id, {
        name: formData.name,
        subject: formData.subject ? parseInt(formData.subject) : (selectedUnit as any).subject,
        grade: formData.grade ? parseInt(formData.grade) : (selectedUnit as any).grade,
        youtube_video_url: formData.youtube_video_url || null
      });
      toast.success('Unit updated successfully');
      setShowEditModal(false);
      setSelectedUnit(null);
      resetForm();
      fetchUnits();
    } catch (error: any) {
      console.error('Error updating unit:', error);
      toast.error(error.message || 'Failed to update unit');
    }
  };

  const handleDeleteClick = (unit: any) => {
    setUnitToDelete(unit);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!unitToDelete) return;

    try {
      await deleteUnit((unitToDelete as any).id);
      
      if (searchQuery) {
        setSearchResults((prev: any[]) => prev.filter((u: any) => u.id !== (unitToDelete as any).id));
      } else {
        setUnits((prev: any[]) => prev.filter((u: any) => u.id !== (unitToDelete as any).id));
      }
      
      toast.success('Unit deleted successfully');
      setShowDeleteModal(false);
      setUnitToDelete(null);
      
      if (searchQuery) {
        try {
          const results = await searchEditorUnits(searchQuery);
          const resultsArray = Array.isArray(results) ? results : (results.results || []);
          setSearchResults(resultsArray);
        } catch (searchError) {
          console.error('Error refreshing search results:', searchError);
        }
      } else {
        fetchUnits(pagination.page);
      }
    } catch (error: any) {
      console.error('Error deleting unit:', error);
      toast.error(error.message || 'Failed to delete unit');
      setShowDeleteModal(false);
      setUnitToDelete(null);
    }
  };

  const openEditModal = (unit: any) => {
    setSelectedUnit(unit);
    setFormData({
      name: unit.name || '',
      subject: unit.subject?.id || unit.subject || '',
      grade: unit.grade?.id || unit.grade || '',
      youtube_video_url: unit.youtube_video_url || ''
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      subject: '',
      grade: '',
      youtube_video_url: ''
    });
    setSelectedUnit(null);
  };

  if (loading) {
    return (
      <PageLayout title="Units" subtitle="Manage units for curriculum organization">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </PageLayout>
    );
  }

  const displayUnits = searchQuery ? searchResults : units;
  const isEmpty = displayUnits.length === 0;
  const isCurrentlySearching = searchQuery && isSearching;

  return (
    <PageLayout 
      title="Units" 
      subtitle="Manage units for curriculum organization"
      actions={
        <Button
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
          className="flex items-center gap-2"
        >
          <MdAdd className="w-5 h-5" />
          Create Unit
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Search Bar */}
        <CardSimple>
          <div className="relative search-container">
            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
            <Input
              type="text"
              placeholder="Search units by name, subject, or grade..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery && setShowSuggestions(true)}
              className="pl-10 pr-10"
              error={undefined}
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setShowSuggestions(false);
                  fetchUnits(1);
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <MdClear className="w-5 h-5" />
              </button>
            )}
            {/* Suggestions Dropdown */}
            {showSuggestions && searchQuery && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center text-gray-500">Searching...</div>
                ) : searchResults.length > 0 ? (
                  <>
                    {searchResults.slice(0, 10).map((unit: any) => (
                      <div
                        key={unit.id}
                        onClick={() => {
                          setSearchQuery(unit.name);
                          setShowSuggestions(false);
                          setUnits(searchResults);
                          setPagination({
                            page: 1,
                            pageSize: 100,
                            count: searchResults.length,
                            next: null,
                            previous: null
                          });
                        }}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">{unit.name}</div>
                        <div className="text-sm text-gray-500">
                          {unit.subject_name || unit.subject?.name || 'N/A'} • {unit.grade_name || unit.grade?.name || 'N/A'}
                        </div>
                      </div>
                    ))}
                    {searchResults.length > 10 && (
                      <div className="p-2 text-center text-sm text-gray-500 border-t border-gray-200">
                        Showing 10 of {searchResults.length} results
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-4 text-center text-gray-500">No results found</div>
                )}
              </div>
            )}
          </div>
        </CardSimple>

        {/* Units List */}
        {isEmpty && !isCurrentlySearching ? (
          <CardSimple>
            <div className="text-center py-12">
              <MdFolder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchQuery ? 'No Results Found' : 'No Units'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery 
                  ? `No units found matching "${searchQuery}"`
                  : 'Get started by creating your first unit'}
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => {
                    resetForm();
                    setShowCreateModal(true);
                  }}
                >
                  <MdAdd className="w-5 h-5 mr-2" />
                  Create Unit
                </Button>
              )}
            </div>
          </CardSimple>
        ) : isEmpty && isCurrentlySearching ? (
          <CardSimple>
            <div className="text-center py-12">
              <LoadingSpinner />
              <p className="text-gray-600 mt-4">Searching...</p>
            </div>
          </CardSimple>
        ) : (
          <CardSimple>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Subject</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Grade</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Topics</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Questions</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayUnits.map((unit: any) => (
                    <tr key={unit.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{unit.name}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-gray-600 text-sm">
                          {unit.subject_name || unit.subject?.name || 'N/A'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-gray-600 text-sm">
                          {unit.grade_name || unit.grade?.name || 'N/A'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-700">{unit.total_topics || 0}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-700">{unit.total_questions || 0}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(unit)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <MdEdit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(unit)}
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
            {!searchQuery && (pagination.next || pagination.previous) && (
              <div className="flex items-center justify-between mt-4 px-4 py-3 border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Showing {((pagination.page - 1) * pagination.pageSize) + 1} to {Math.min(pagination.page * pagination.pageSize, pagination.count)} of {pagination.count} units
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchUnits(pagination.page - 1)}
                    disabled={!pagination.previous}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm text-gray-700">
                    Page {pagination.page}
                  </span>
                  <button
                    onClick={() => fetchUnits(pagination.page + 1)}
                    disabled={!pagination.next}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
            {searchQuery && (
              <div className="flex items-center justify-between mt-4 px-4 py-3 border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Found {searchResults.length} unit{searchResults.length !== 1 ? 's' : ''} matching "{searchQuery}"
                </div>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setShowSuggestions(false);
                    fetchUnits(1);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Clear Search
                </button>
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
            title="Create New Unit"
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
                  placeholder="e.g., Algebra Fundamentals"
                  error={undefined}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject *
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#103358]"
                  disabled={loadingLookup}
                >
                  <option value="">Select Subject</option>
                  {subjects.map((subject: any) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grade *
                </label>
                <select
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#103358]"
                  disabled={loadingLookup}
                >
                  <option value="">Select Grade</option>
                  {grades.map((grade: any) => (
                    <option key={grade.id} value={grade.id}>
                      {grade.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  YouTube Video URL (Optional)
                </label>
                <Input
                  type="url"
                  value={formData.youtube_video_url}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, youtube_video_url: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
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
        {showEditModal && selectedUnit && (
          <Modal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              resetForm();
            }}
            title="Edit Unit"
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
                  placeholder="e.g., Algebra Fundamentals"
                  error={undefined}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject *
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#103358]"
                  disabled={loadingLookup}
                >
                  <option value="">Select Subject</option>
                  {subjects.map((subject: any) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grade *
                </label>
                <select
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#103358]"
                  disabled={loadingLookup}
                >
                  <option value="">Select Grade</option>
                  {grades.map((grade: any) => (
                    <option key={grade.id} value={grade.id}>
                      {grade.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  YouTube Video URL (Optional)
                </label>
                <Input
                  type="url"
                  value={formData.youtube_video_url}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, youtube_video_url: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
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
        {showDeleteModal && unitToDelete && (
          <ConfirmModal
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setUnitToDelete(null);
            }}
            onConfirm={handleDeleteConfirm}
            title="Delete Unit"
            message={`Are you sure you want to delete "${(unitToDelete as any).name}"? This action cannot be undone.`}
            confirmText="Delete"
            cancelText="Cancel"
            type="danger"
          />
        )}
      </div>
    </PageLayout>
  );
};

export default UnitsPage;
