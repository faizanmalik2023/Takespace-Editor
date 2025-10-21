'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import ProtectedRoute from '../../components/ProtectedRoute';
import { FiUser, FiMail, FiCalendar, FiMapPin, FiPhone, FiEdit3, FiSave, FiX, FiBell, FiSettings, FiAward, FiShield, FiClock, FiCheck, FiX as FiXIcon, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { toast } from 'react-toastify';

interface UserProfile {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string | null;
  avatar: string | null;
  notifications_enabled: boolean;
  mode: string;
  specialization: string;
  experience_level: number;
  is_active: boolean;
  can_create_questions: boolean;
  can_edit_questions: boolean;
  can_create_topics: boolean;
  can_edit_topics: boolean;
  can_create_units: boolean;
  can_edit_units: boolean;
  full_name: string;
  permissions_summary: {
    can_create_questions: boolean;
    can_edit_questions: boolean;
    can_create_topics: boolean;
    can_edit_topics: boolean;
    can_create_units: boolean;
    can_edit_units: boolean;
  };
  created_at: string;
  modified_at: string;
}

function ProfilePage() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<UserProfile>>({});
  const [activeSection, setActiveSection] = useState<string>('profile');
  
  // Password change state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await api.getUserProfile();
      console.log('Profile data received:', data); // Debug log
      
      // Handle different response formats
      const profileData = data?.data || data || {};
      console.log('Processed profile data:', profileData); // Debug log
      
      setProfile(profileData);
      setEditData(profileData);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setEditData(profile || {});
  };

  const handleCancel = () => {
    setEditing(false);
    setEditData(profile || {});
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Prepare data for API call
      const updateData = {
        first_name: editData.first_name,
        last_name: editData.last_name,
        phone: editData.phone,
        date_of_birth: editData.date_of_birth,
        specialization: editData.specialization,
        experience_level: editData.experience_level,
        mode: editData.mode,
        notifications_enabled: editData.notifications_enabled,
        avatar: editData.avatar
      };
      
      // Call the update API
      const response = await api.updateProfile(updateData);
      console.log('Profile update response:', response); // Debug log
      
      // Handle different response formats
      const updatedProfile = response?.data || response || {};
      
      // Merge the updated data with existing profile to preserve all fields
      const mergedProfile = {
        ...profile,
        ...updatedProfile,
        // Ensure we have the updated fields
        first_name: updatedProfile.first_name || profile?.first_name,
        last_name: updatedProfile.last_name || profile?.last_name,
        phone: updatedProfile.phone || profile?.phone,
        date_of_birth: updatedProfile.date_of_birth || profile?.date_of_birth,
        specialization: updatedProfile.specialization || profile?.specialization,
        experience_level: updatedProfile.experience_level || profile?.experience_level,
        mode: updatedProfile.mode || profile?.mode,
        notifications_enabled: updatedProfile.notifications_enabled !== undefined ? updatedProfile.notifications_enabled : profile?.notifications_enabled,
        avatar: updatedProfile.avatar || profile?.avatar,
        full_name: updatedProfile.full_name || profile?.full_name || `${updatedProfile.first_name || profile?.first_name} ${updatedProfile.last_name || profile?.last_name}`
      };
      
      // Update local state with the merged profile
      setProfile(mergedProfile);
      setEditing(false);
      toast.success('Profile updated successfully');
      
      // If the response doesn't contain all necessary fields, refetch the profile
      if (!updatedProfile.first_name && !updatedProfile.last_name) {
        console.log('Refetching profile data due to incomplete response');
        setTimeout(() => {
          fetchProfile();
        }, 1000);
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof UserProfile, value: string | number | boolean | File) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Password change functions
  const handlePasswordChange = async () => {
    try {
      setPasswordLoading(true);
      
      // Validation
      if (!passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password) {
        toast.error('Please fill in all password fields');
        return;
      }
      
      if (passwordData.new_password !== passwordData.confirm_password) {
        toast.error('New password and confirm password do not match');
        return;
      }
      
      if (passwordData.new_password.length < 8) {
        toast.error('New password must be at least 8 characters long');
        return;
      }
      
      await api.changePassword(passwordData);
      toast.success('Password changed successfully');
      setShowPasswordModal(false);
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error(error?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handlePasswordInputChange = (field: string, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const openPasswordModal = () => {
    setShowPasswordModal(true);
    setPasswordData({
      current_password: '',
      new_password: '',
      confirm_password: ''
    });
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordData({
      current_password: '',
      new_password: '',
      confirm_password: ''
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E3F3FF]">
        <Header />
        <div className="flex h-[calc(100vh-80px)]">
          <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#E3F3FF]">
        <Header />
        <div className="flex h-[calc(100vh-80px)]">
          <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600">Failed to load profile data</p>
              <button 
                onClick={fetchProfile}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E3F3FF]">
      {/* Header */}
      <Header />

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    {profile.avatar ? (
                      <img 
                        src={profile.avatar} 
                        alt="Profile" 
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <FiUser className="w-10 h-10 text-white" />
                    )}
                  </div>
                  {editing && (
                    <label className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-1 cursor-pointer hover:bg-blue-700 transition-colors">
                      <FiEdit3 className="w-3 h-3" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleInputChange('avatar', file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {profile.full_name || `${profile.first_name || 'N/A'} ${profile.last_name || 'N/A'}`}
                  </h1>
                  <p className="text-gray-600">{profile.email || 'N/A'}</p>
                  <p className="text-sm text-gray-500 capitalize">{profile.specialization || 'N/A'}</p>
                </div>
              </div>
              <div className="flex space-x-3">
                {editing ? (
                  <>
                    <button
                      onClick={handleSave}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <FiSave className="w-4 h-4" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <FiX className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleEdit}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <FiEdit3 className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </button>
                    <button
                      onClick={openPasswordModal}
                      className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      <FiLock className="w-4 h-4" />
                      <span>Change Password</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                {editing ? (
                  <input
                    type="text"
                    value={editData.first_name || ''}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  />
                ) : (
                  <p className="text-gray-900">{profile.first_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                {editing ? (
                  <input
                    type="text"
                    value={editData.last_name || ''}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  />
                ) : (
                  <p className="text-gray-900">{profile.last_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="flex items-center space-x-2">
                  <FiMail className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                    {profile.email || 'N/A'}
                  </p>
                  <span className="text-xs text-gray-500">(Read-only)</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                {editing ? (
                  <input
                    type="tel"
                    value={editData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    placeholder="Enter phone number"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <FiPhone className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-900">{profile.phone || 'N/A'}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                {editing ? (
                  <input
                    type="date"
                    value={editData.date_of_birth ? editData.date_of_birth.split('T')[0] : ''}
                    onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <FiCalendar className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-900">
                      {profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                {editing ? (
                  <input
                    type="text"
                    value={editData.specialization || ''}
                    onChange={(e) => handleInputChange('specialization', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    placeholder="Enter specialization"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <FiSettings className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-900">{profile.specialization || 'N/A'}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
                {editing ? (
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={editData.experience_level || ''}
                    onChange={(e) => handleInputChange('experience_level', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    placeholder="Enter experience level (1-100)"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <FiAward className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-900">{profile.experience_level || 'N/A'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Account Information</h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
                <div className="flex items-center space-x-2">
                  <FiCalendar className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">
                    {profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'N/A'}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Modified</label>
                <div className="flex items-center space-x-2">
                  <FiClock className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">
                    {profile.modified_at ? new Date(profile.modified_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'N/A'}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  profile.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {profile.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
                <div className="flex items-center space-x-2">
                  <FiAward className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">{profile.experience_level || 'N/A'}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                <div className="flex items-center space-x-2">
                  <FiSettings className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">{profile.specialization || 'N/A'}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mode</label>
                {editing ? (
                  <select
                    value={editData.mode || ''}
                    onChange={(e) => handleInputChange('mode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  >
                    <option value="">Select mode</option>
                    <option value="auto">Auto</option>
                    <option value="manual">Manual</option>
                  </select>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 capitalize">
                    {profile.mode || 'N/A'}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notifications</label>
                {editing ? (
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={editData.notifications_enabled || false}
                        onChange={(e) => handleInputChange('notifications_enabled', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Enable notifications</span>
                    </label>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <FiBell className="w-4 h-4 text-gray-400" />
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      profile.notifications_enabled 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {profile.notifications_enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Permissions Information */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Permissions</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Question Management</label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    {profile.can_create_questions ? (
                      <FiCheck className="w-4 h-4 text-green-500" />
                    ) : (
                      <FiXIcon className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-sm text-gray-700">Create Questions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {profile.can_edit_questions ? (
                      <FiCheck className="w-4 h-4 text-green-500" />
                    ) : (
                      <FiXIcon className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-sm text-gray-700">Edit Questions</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Topic Management</label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    {profile.can_create_topics ? (
                      <FiCheck className="w-4 h-4 text-green-500" />
                    ) : (
                      <FiXIcon className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-sm text-gray-700">Create Topics</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {profile.can_edit_topics ? (
                      <FiCheck className="w-4 h-4 text-green-500" />
                    ) : (
                      <FiXIcon className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-sm text-gray-700">Edit Topics</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unit Management</label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    {profile.can_create_units ? (
                      <FiCheck className="w-4 h-4 text-green-500" />
                    ) : (
                      <FiXIcon className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-sm text-gray-700">Create Units</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {profile.can_edit_units ? (
                      <FiCheck className="w-4 h-4 text-green-500" />
                    ) : (
                      <FiXIcon className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-sm text-gray-700">Edit Units</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Status</label>
                <div className="flex items-center space-x-2">
                  <FiShield className="w-4 h-4 text-gray-400" />
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    profile.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {profile.is_active ? 'Active Account' : 'Inactive Account'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Password Change Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">Change Password</h3>
                  <button
                    onClick={closePasswordModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordData.current_password}
                      onChange={(e) => handlePasswordInputChange('current_password', e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPasswords.current ? (
                        <FiEyeOff className="w-4 h-4 text-gray-400" />
                      ) : (
                        <FiEye className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordData.new_password}
                      onChange={(e) => handlePasswordInputChange('new_password', e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPasswords.new ? (
                        <FiEyeOff className="w-4 h-4 text-gray-400" />
                      ) : (
                        <FiEye className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordData.confirm_password}
                      onChange={(e) => handlePasswordInputChange('confirm_password', e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPasswords.confirm ? (
                        <FiEyeOff className="w-4 h-4 text-gray-400" />
                      ) : (
                        <FiEye className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Password Requirements */}
                <div className="text-sm text-gray-600">
                  <p>Password requirements:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>At least 8 characters long</li>
                    <li>Must match confirmation</li>
                  </ul>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={closePasswordModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={passwordLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordChange}
                  disabled={passwordLoading}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {passwordLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Changing...</span>
                    </>
                  ) : (
                    <>
                      <FiLock className="w-4 h-4" />
                      <span>Change Password</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Profile() {
  return (
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  );
}


