'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import PageLayout from '../../components/layout/PageLayout';
import CardSimple from '../../components/ui/CardSimple';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ProtectedRoute from '../../components/ProtectedRoute';
import { toast } from 'react-hot-toast';
import {
  MdPerson,
  MdEmail,
  MdCalendarToday,
  MdPhone,
  MdEdit,
  MdSave,
  MdClose,
  MdNotifications,
  MdSettings,
  MdStar,
  MdShield,
  MdAccessTime,
  MdCheck,
  MdLock,
  MdVisibility,
  MdVisibilityOff
} from 'react-icons/md';

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

function ProfilePageContent() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<UserProfile>>({});

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
      const profileData = data?.data || data || {};
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

      const response = await api.updateProfile(updateData);
      const updatedProfile = response?.data || response || {};
      const mergedProfile = {
        ...profile,
        ...updatedProfile,
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

      setProfile(mergedProfile);
      setEditing(false);
      toast.success('Profile updated successfully');

      if (!updatedProfile.first_name && !updatedProfile.last_name) {
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
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhoneChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    handleInputChange('phone', numericValue);
  };

  const handlePasswordChange = async () => {
    try {
      setPasswordLoading(true);

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
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error(error?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handlePasswordInputChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const openPasswordModal = () => {
    setShowPasswordModal(true);
    setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
  };

  if (loading) {
    return (
      <PageLayout title="Profile" subtitle="Manage your account settings">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </PageLayout>
    );
  }

  if (!profile) {
    return (
      <PageLayout title="Profile" subtitle="Manage your account settings">
        <CardSimple>
          <div className="text-center py-12">
            <MdPerson className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Failed to load profile data</p>
            <Button onClick={fetchProfile}>
              Retry
            </Button>
          </div>
        </CardSimple>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Profile"
      subtitle="Manage your account settings"
      actions={
        editing ? (
          <div className="flex gap-3">
            <Button onClick={handleSave} variant="success" className="flex items-center gap-2">
              <MdSave className="w-4 h-4" />
              Save
            </Button>
            <Button onClick={handleCancel} variant="secondary" className="flex items-center gap-2">
              <MdClose className="w-4 h-4" />
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex gap-3">
            <Button onClick={handleEdit} className="flex items-center gap-2">
              <MdEdit className="w-4 h-4" />
              Edit Profile
            </Button>
            <Button onClick={openPasswordModal} variant="warning" className="flex items-center gap-2">
              <MdLock className="w-4 h-4" />
              Change Password
            </Button>
          </div>
        )
      }
    >
      <div className="space-y-6">
        {/* Profile Header Card */}
        <CardSimple>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-[#103358] to-[#398AC8] rounded-full flex items-center justify-center">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <MdPerson className="w-10 h-10 text-white" />
                )}
              </div>
              {editing && (
                <label className="absolute -bottom-1 -right-1 bg-[#103358] text-white rounded-full p-1 cursor-pointer hover:bg-[#0a2544] transition-colors">
                  <MdEdit className="w-3 h-3" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleInputChange('avatar', file);
                    }}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {profile.full_name || `${profile.first_name || 'N/A'} ${profile.last_name || 'N/A'}`}
              </h2>
              <p className="text-gray-600">{profile.email || 'N/A'}</p>
              <p className="text-sm text-gray-500 capitalize">{profile.specialization || 'N/A'}</p>
            </div>
          </div>
        </CardSimple>

        {/* Profile Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <CardSimple title="Personal Information">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                {editing ? (
                  <Input
                    type="text"
                    value={editData.first_name || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('first_name', e.target.value)}
                    error={undefined}
                  />
                ) : (
                  <p className="text-gray-900">{profile.first_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                {editing ? (
                  <Input
                    type="text"
                    value={editData.last_name || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('last_name', e.target.value)}
                    error={undefined}
                  />
                ) : (
                  <p className="text-gray-900">{profile.last_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="flex items-center space-x-2">
                  <MdEmail className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                    {profile.email || 'N/A'}
                  </p>
                  <span className="text-xs text-gray-500">(Read-only)</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                {editing ? (
                  <Input
                    type="tel"
                    value={editData.phone || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePhoneChange(e.target.value)}
                    placeholder="Enter phone number"
                    error={undefined}
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <MdPhone className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-900">{profile.phone || 'N/A'}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                {editing ? (
                  <Input
                    type="date"
                    value={editData.date_of_birth ? editData.date_of_birth.split('T')[0] : ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('date_of_birth', e.target.value)}
                    error={undefined}
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <MdCalendarToday className="w-4 h-4 text-gray-400" />
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
                  <Input
                    type="text"
                    value={editData.specialization || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('specialization', e.target.value)}
                    placeholder="Enter specialization"
                    error={undefined}
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <MdSettings className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-900">{profile.specialization || 'N/A'}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
                {editing ? (
                  <Input
                    type="number"
                    value={editData.experience_level || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('experience_level', parseInt(e.target.value) || 0)}
                    placeholder="Enter experience level (1-100)"
                    error={undefined}
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <MdStar className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-900">{profile.experience_level || 'N/A'}</p>
                  </div>
                )}
              </div>
            </div>
          </CardSimple>

          {/* Account Information */}
          <CardSimple title="Account Information">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
                <div className="flex items-center space-x-2">
                  <MdCalendarToday className="w-4 h-4 text-gray-400" />
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
                  <MdAccessTime className="w-4 h-4 text-gray-400" />
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
                  <MdStar className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">{profile.experience_level || 'N/A'}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                <div className="flex items-center space-x-2">
                  <MdSettings className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">{profile.specialization || 'N/A'}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mode</label>
                {editing ? (
                  <select
                    value={editData.mode || ''}
                    onChange={(e) => handleInputChange('mode', e.target.value)}
                    className="w-full h-12 px-4 py-3 bg-white border-[1.5px] border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#398AC8] text-[#0F172A] transition-all duration-200"
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
                    <MdNotifications className="w-4 h-4 text-gray-400" />
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
          </CardSimple>
        </div>

        {/* Permissions */}
        <CardSimple title="Permissions">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Question Management</label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <MdCheck className={`w-4 h-4 ${profile.can_create_questions ? 'text-green-500' : 'text-red-500'}`} />
                  <span className="text-sm text-gray-700">Create Questions</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MdCheck className={`w-4 h-4 ${profile.can_edit_questions ? 'text-green-500' : 'text-red-500'}`} />
                  <span className="text-sm text-gray-700">Edit Questions</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Topic Management</label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <MdCheck className={`w-4 h-4 ${profile.can_create_topics ? 'text-green-500' : 'text-red-500'}`} />
                  <span className="text-sm text-gray-700">Create Topics</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MdCheck className={`w-4 h-4 ${profile.can_edit_topics ? 'text-green-500' : 'text-red-500'}`} />
                  <span className="text-sm text-gray-700">Edit Topics</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unit Management</label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <MdCheck className={`w-4 h-4 ${profile.can_create_units ? 'text-green-500' : 'text-red-500'}`} />
                  <span className="text-sm text-gray-700">Create Units</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MdCheck className={`w-4 h-4 ${profile.can_edit_units ? 'text-green-500' : 'text-red-500'}`} />
                  <span className="text-sm text-gray-700">Edit Units</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Status</label>
              <div className="flex items-center space-x-2">
                <MdShield className="w-4 h-4 text-gray-400" />
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
        </CardSimple>

        {/* Password Change Modal */}
        {showPasswordModal && (
          <Modal
            isOpen={showPasswordModal}
            onClose={() => {
              setShowPasswordModal(false);
              setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
            }}
            title="Change Password"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <Input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordData.current_password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePasswordInputChange('current_password', e.target.value)}
                    placeholder="Enter current password"
                    error={undefined}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPasswords.current ? (
                      <MdVisibilityOff className="w-5 h-5 text-gray-400" />
                    ) : (
                      <MdVisibility className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.new_password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePasswordInputChange('new_password', e.target.value)}
                    placeholder="Enter new password"
                    error={undefined}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPasswords.new ? (
                      <MdVisibilityOff className="w-5 h-5 text-gray-400" />
                    ) : (
                      <MdVisibility className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirm_password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePasswordInputChange('confirm_password', e.target.value)}
                    placeholder="Confirm new password"
                    error={undefined}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPasswords.confirm ? (
                      <MdVisibilityOff className="w-5 h-5 text-gray-400" />
                    ) : (
                      <MdVisibility className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <p>Password requirements:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>At least 8 characters long</li>
                  <li>Must match confirmation</li>
                </ul>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
                  }}
                  disabled={passwordLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="warning"
                  onClick={handlePasswordChange}
                  disabled={passwordLoading}
                  className="flex items-center gap-2"
                >
                  {passwordLoading ? (
                    <>
                      <LoadingSpinner size="small" />
                      <span>Changing...</span>
                    </>
                  ) : (
                    <>
                      <MdLock className="w-4 h-4" />
                      <span>Change Password</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </PageLayout>
  );
}

export default function Profile() {
  return (
    <ProtectedRoute>
      <ProfilePageContent />
    </ProtectedRoute>
  );
}
