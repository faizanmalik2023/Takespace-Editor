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
  MdTopic,
  MdSearch,
  MdClear
} from 'react-icons/md';
import { getEditorTopics, searchTopics, createTopic, updateTopic, deleteTopic, getEditorUnits } from '../lib/api';

const TopicsPage = () => {
  const [topics, setTopics] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingLookup, setLoadingLookup] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [topicToDelete, setTopicToDelete] = useState(null);
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
    unit: ''
  });

  useEffect(() => {
    fetchTopics();
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
      fetchTopics(1);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setIsSearching(true);
        const results = await searchTopics(searchQuery);
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
        console.error('Error searching topics:', error);
        setSearchResults([]);
        toast.error('Failed to search topics');
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const fetchLookupData = async () => {
    try {
      setLoadingLookup(true);
      const unitsRes = await getEditorUnits(1, 1000);
      const unitsList = Array.isArray(unitsRes) 
        ? unitsRes 
        : (unitsRes?.results || unitsRes?.data?.results || []);
      setUnits(unitsList);
    } catch (error: any) {
      console.error('Error fetching lookup data:', error);
      toast.error('Failed to load units');
    } finally {
      setLoadingLookup(false);
    }
  };

  const fetchTopics = async (page = 1) => {
    try {
      setLoading(true);
      const response = await getEditorTopics(page, 100);
      let topicsList = [];
      let paginationData = {};
      
      if (response.data && response.data.results) {
        topicsList = response.data.results;
        paginationData = {
          page: response.page || page,
          pageSize: response.pageSize || 100,
          count: parseInt(response.data.count) || response.data.results.length,
          next: response.data.next,
          previous: response.data.previous
        };
      } else if (response.results) {
        topicsList = response.results;
        paginationData = {
          page: response.page || page,
          pageSize: response.pageSize || 100,
          count: response.count || response.results.length,
          next: response.next,
          previous: response.previous
        };
      } else if (Array.isArray(response)) {
        topicsList = response;
        paginationData = {
          page: 1,
          pageSize: response.length,
          count: response.length,
          next: null,
          previous: null
        };
      }
      
      setTopics(topicsList);
      setPagination(paginationData);
    } catch (error: any) {
      console.error('Error fetching topics:', error);
      toast.error(error.message || 'Failed to load topics');
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      if (!formData.name) {
        toast.error('Topic name is required');
        return;
      }
      if (!formData.unit) {
        toast.error('Unit is required');
        return;
      }

      await createTopic({
        name: formData.name,
        unit: parseInt(formData.unit)
      });
      toast.success('Topic created successfully');
      setShowCreateModal(false);
      resetForm();
      fetchTopics(1);
    } catch (error: any) {
      console.error('Error creating topic:', error);
      toast.error(error.message || 'Failed to create topic');
    }
  };

  const handleUpdate = async () => {
    if (!selectedTopic) return;

    try {
      if (!formData.name) {
        toast.error('Topic name is required');
        return;
      }

      await updateTopic((selectedTopic as any).id, {
        name: formData.name,
        unit: formData.unit ? parseInt(formData.unit) : (selectedTopic as any).unit
      });
      toast.success('Topic updated successfully');
      setShowEditModal(false);
      setSelectedTopic(null);
      resetForm();
      fetchTopics();
    } catch (error: any) {
      console.error('Error updating topic:', error);
      toast.error(error.message || 'Failed to update topic');
    }
  };

  const handleDeleteClick = (topic: any) => {
    setTopicToDelete(topic);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!topicToDelete) return;

    try {
      await deleteTopic((topicToDelete as any).id);
      
      if (searchQuery) {
        setSearchResults((prev: any[]) => prev.filter((t: any) => t.id !== (topicToDelete as any).id));
      } else {
        setTopics((prev: any[]) => prev.filter((t: any) => t.id !== (topicToDelete as any).id));
      }
      
      toast.success('Topic deleted successfully');
      setShowDeleteModal(false);
      setTopicToDelete(null);
      
      if (searchQuery) {
        try {
          const results = await searchTopics(searchQuery);
          const resultsArray = Array.isArray(results) ? results : (results.results || []);
          setSearchResults(resultsArray);
        } catch (searchError) {
          console.error('Error refreshing search results:', searchError);
        }
      } else {
        fetchTopics(pagination.page);
      }
    } catch (error: any) {
      console.error('Error deleting topic:', error);
      toast.error(error.message || 'Failed to delete topic');
      setShowDeleteModal(false);
      setTopicToDelete(null);
    }
  };

  const openEditModal = (topic: any) => {
    setSelectedTopic(topic);
    setFormData({
      name: topic.name || '',
      unit: topic.unit?.id || topic.unit || ''
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      unit: ''
    });
    setSelectedTopic(null);
  };

  if (loading) {
    return (
      <PageLayout title="Topics" subtitle="Manage topics for curriculum organization">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </PageLayout>
    );
  }

  const displayTopics = searchQuery ? searchResults : topics;
  const isEmpty = displayTopics.length === 0;
  const isCurrentlySearching = searchQuery && isSearching;

  return (
    <PageLayout 
      title="Topics" 
      subtitle="Manage topics for curriculum organization"
      actions={
        <Button
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
          className="flex items-center gap-2"
        >
          <MdAdd className="w-5 h-5" />
          Create Topic
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
              placeholder="Search topics by name, unit, subject, or grade..."
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
                  fetchTopics(1);
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
                    {searchResults.slice(0, 10).map((topic: any) => (
                      <div
                        key={topic.id}
                        onClick={() => {
                          setSearchQuery(topic.name);
                          setShowSuggestions(false);
                          setTopics(searchResults);
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
                        <div className="font-medium text-gray-900">{topic.name}</div>
                        <div className="text-sm text-gray-500">
                          {topic.unit_name || topic.unit?.name || 'N/A'} • {topic.subject_name || 'N/A'} • {topic.grade_name || 'N/A'}
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

        {/* Topics List */}
        {isEmpty && !isCurrentlySearching ? (
          <CardSimple>
            <div className="text-center py-12">
              <MdTopic className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchQuery ? 'No Results Found' : 'No Topics'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery 
                  ? `No topics found matching "${searchQuery}"`
                  : 'Get started by creating your first topic'}
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => {
                    resetForm();
                    setShowCreateModal(true);
                  }}
                >
                  <MdAdd className="w-5 h-5 mr-2" />
                  Create Topic
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
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Unit</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Subject</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Grade</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Questions</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayTopics.map((topic: any) => (
                    <tr key={topic.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{topic.name}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-gray-600 text-sm">
                          {topic.unit_name || topic.unit?.name || 'N/A'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-gray-600 text-sm">
                          {topic.subject_name || topic.unit?.subject?.name || 'N/A'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-gray-600 text-sm">
                          {topic.grade_name || topic.unit?.grade?.name || 'N/A'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-700">{topic.total_questions || 0}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(topic)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <MdEdit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(topic)}
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
                  Showing {((pagination.page - 1) * pagination.pageSize) + 1} to {Math.min(pagination.page * pagination.pageSize, pagination.count)} of {pagination.count} topics
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchTopics(pagination.page - 1)}
                    disabled={!pagination.previous}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm text-gray-700">
                    Page {pagination.page}
                  </span>
                  <button
                    onClick={() => fetchTopics(pagination.page + 1)}
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
                  Found {searchResults.length} topic{searchResults.length !== 1 ? 's' : ''} matching "{searchQuery}"
                </div>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setShowSuggestions(false);
                    fetchTopics(1);
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
            title="Create New Topic"
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
                  placeholder="e.g., Fractions"
                  error={undefined}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit *
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#103358]"
                  disabled={loadingLookup}
                >
                  <option value="">Select Unit</option>
                  {units.map((unit: any) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name} {unit.subject?.name ? `(${unit.subject.name})` : ''} {unit.grade?.name ? `- ${unit.grade.name}` : ''}
                    </option>
                  ))}
                </select>
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
        {showEditModal && selectedTopic && (
          <Modal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              resetForm();
            }}
            title="Edit Topic"
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
                  placeholder="e.g., Fractions"
                  error={undefined}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit *
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#103358]"
                  disabled={loadingLookup}
                >
                  <option value="">Select Unit</option>
                  {units.map((unit: any) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name} {unit.subject?.name ? `(${unit.subject.name})` : ''} {unit.grade?.name ? `- ${unit.grade.name}` : ''}
                    </option>
                  ))}
                </select>
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
        {showDeleteModal && topicToDelete && (
          <ConfirmModal
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setTopicToDelete(null);
            }}
            onConfirm={handleDeleteConfirm}
            title="Delete Topic"
            message={`Are you sure you want to delete "${(topicToDelete as any).name}"? This action cannot be undone.`}
            confirmText="Delete"
            cancelText="Cancel"
            type="danger"
          />
        )}
      </div>
    </PageLayout>
  );
};

export default TopicsPage;
