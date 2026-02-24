// API configuration and functions for Takespace-Dekstop-Teacher
const API_BASE_URL = 'https://dev.takespace.com/api/v1';

// Generic fetcher has been removed; no mock delays

// API request helper
const apiRequest = async (url, options = {}) => {
  const accessToken = (typeof window !== 'undefined')
    ? (localStorage.getItem('access_token') || sessionStorage.getItem('access_token'))
    : null;

  const baseHeaders = {
    'accept': 'application/json',
    'Content-Type': 'application/json',
    'X-CSRFTOKEN': 'TB8QUbGYWtbYimRQnA9cgfvnuIUpqRj9UWpN25DrXkPUresdEwZnzVwTcJTvepDy',
  };

  if (accessToken) {
    baseHeaders['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, {
    headers: {
      ...baseHeaders,
      ...options.headers
    },
    ...options
  });

  if (!response.ok) {
    const text = await response.text();
    let body = null;
    try { body = text ? JSON.parse(text) : null; } catch (_) {}

    // Build a human-readable message even if API returns objects
    const extractMessage = (payload) => {
      if (!payload) return null;
      if (typeof payload === 'string') return payload;
      if (typeof payload === 'object') {
        if (payload.message && typeof payload.message === 'string') return payload.message;
        if (payload.detail && typeof payload.detail === 'string') return payload.detail;
        if (payload.error) return extractMessage(payload.error) || JSON.stringify(payload.error);
        return JSON.stringify(payload);
      }
      return String(payload);
    };

    const message = extractMessage(body) || `API request failed: ${response.status} ${response.statusText}`;

    const error = new Error(message);
    error.status = response.status;
    error.body = body;
    throw error;
  }

  // Handle 204 No Content (common for DELETE requests)
  if (response.status === 204 || response.status === 201 && !response.headers.get('content-type')?.includes('application/json')) {
    return null;
  }

  // Check if response has content before parsing JSON
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    return text || null;
  }

  return response.json();
};

// Learning page data
// Removed mock fallback. Use real endpoints only via specific calls below.
const getLearningData = async () => {
  throw new Error('getLearningData is deprecated. Use getSubjects/getGrades/getUnits instead.');
};

// Auth functions
const login = async (username, password) => {
  try {
    const url = `${API_BASE_URL}/auth/login/`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password })
    });
    
    const text = await response.text();
    const json = text ? JSON.parse(text) : null;
    
    if (!response.ok) {
      let message = `HTTP error ${response.status}`;
      if (json) {
        if (json.error && json.error.message) message = json.error.message;
        else if (json.detail) message = json.detail;
        else if (json.message) message = json.message;
        else if (json.error) message = json.error;
      }
      const err = new Error(message);
      err.status = response.status;
      err.body = json;
      throw err;
    }
    return json;
  } catch (error) {
    throw error;
  }
};

// Account-related API methods
const getOrganizationDetails = async () => {
  try {
    const url = `https://dev.takespace.com/admin/v1/organization/`;
    const data = await apiRequest(url);
    return data;
  } catch (error) {
    console.error('Error fetching organization details:', error);
    throw error;
  }
};

const updateOrganizationDetails = async (organizationData) => {
  try {
    const url = `https://dev.takespace.com/admin/v1/organization/`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token') || sessionStorage.getItem('access_token')}`
      },
      body: JSON.stringify(organizationData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating organization details:', error);
    throw error;
  }
};

const updateOrganizationLogo = async (logoFile) => {
  try {
    const url = `https://dev.takespace.com/admin/v1/organization/logo/`;
    const formData = new FormData();
    formData.append('login_logo', logoFile);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token') || sessionStorage.getItem('access_token')}`
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating organization logo:', error);
    throw error;
  }
};

const getAccountContacts = async () => {
  try {
    const url = `https://dev.takespace.com/admin/v1/organization/contacts/`;
    const data = await apiRequest(url);
    return data;
  } catch (error) {
    console.error('Error fetching account contacts:', error);
    throw error;
  }
};

const updateAccountContact = async (contactId, contactData) => {
  try {
    const url = `https://dev.takespace.com/admin/v1/organization/contacts/${contactId}/`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token') || sessionStorage.getItem('access_token')}`
      },
      body: JSON.stringify(contactData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating account contact:', error);
    throw error;
  }
};

const updatePassword = async (passwordData) => {
  try {
    const url = `https://dev.takespace.com/admin/v1/organization/update-password/`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token') || sessionStorage.getItem('access_token')}`
      },
      body: JSON.stringify(passwordData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
};

// Learning-related API methods
export const getSubjects = async (page = 1, pageSize = 100) => {
  try {
    // Use editor subjects endpoint with pagination support
    const url = `${API_BASE_URL}/editor/subjects/?page=${page}&page_size=${pageSize}`;
    const response = await apiRequest(url, { method: 'GET' });
    // Handle different response formats
    if (response.data && response.data.results) return response.data;
    if (response.results) return response;
    if (Array.isArray(response)) return { results: response, count: response.length };
    // Fallback for old format (direct data from lookup endpoint)
    return response || { results: [], count: 0 };
  } catch (error) {
    console.error('Error fetching subjects:', error);
    throw error;
  }
};

// Get grades API
export const getGrades = async (page = 1, pageSize = 100) => {
  try {
    // Use editor grades endpoint with pagination support
    const url = `${API_BASE_URL}/editor/grades/?page=${page}&page_size=${pageSize}`;
    const response = await apiRequest(url, { method: 'GET' });
    // Handle different response formats
    if (response.data && response.data.results) return response.data;
    if (response.results) return response;
    if (Array.isArray(response)) return { results: response, count: response.length };
    // Fallback for old format (direct data)
    return response || { results: [], count: 0 };
  } catch (error) {
    console.error('Error fetching grades:', error);
    throw error;
  }
};

// Editor Subjects CRUD
export const createSubject = async (subjectData) => {
  try {
    const url = `${API_BASE_URL}/editor/subjects/`;
    const response = await apiRequest(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subjectData)
    });
    return response.data || response;
  } catch (error) {
    console.error('Error creating subject:', error);
    throw error;
  }
};

export const updateSubject = async (subjectId, subjectData) => {
  try {
    const url = `${API_BASE_URL}/editor/subjects/${subjectId}/`;
    const response = await apiRequest(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subjectData)
    });
    return response.data || response;
  } catch (error) {
    console.error('Error updating subject:', error);
    throw error;
  }
};

export const deleteSubject = async (subjectId) => {
  try {
    const url = `${API_BASE_URL}/editor/subjects/${subjectId}/`;
    await apiRequest(url, { method: 'DELETE' });
    return true;
  } catch (error) {
    console.error('Error deleting subject:', error);
    throw error;
  }
};

// Editor Grades CRUD
export const createGrade = async (gradeData) => {
  try {
    const url = `${API_BASE_URL}/editor/grades/`;
    const response = await apiRequest(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(gradeData)
    });
    return response.data || response;
  } catch (error) {
    console.error('Error creating grade:', error);
    throw error;
  }
};

export const updateGrade = async (gradeId, gradeData) => {
  try {
    const url = `${API_BASE_URL}/editor/grades/${gradeId}/`;
    const response = await apiRequest(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(gradeData)
    });
    return response.data || response;
  } catch (error) {
    console.error('Error updating grade:', error);
    throw error;
  }
};

export const deleteGrade = async (gradeId) => {
  try {
    const url = `${API_BASE_URL}/editor/grades/${gradeId}/`;
    await apiRequest(url, { method: 'DELETE' });
    return true;
  } catch (error) {
    console.error('Error deleting grade:', error);
    throw error;
  }
};

// Get students by subject and grade
const getStudentsBySubjectAndGrade = async (subjectId, gradeId, page = 1, pageSize = 20) => {
  try {
    const url = `https://dev.takespace.com/admin/v1/solo-teacher-desktop/subjects/${subjectId}/grades/${gradeId}/students/?page=${page}&page_size=${pageSize}`;
    const data = await apiRequest(url);
    return data;
  } catch (error) {
    console.error('Error fetching students:', error);
    // If API indicates no students found, return empty results with 404 code
    if (error.status === 404) {
      return { statusCode: 404, data: { results: [], count: 0, next: null, previous: null } };
    }
    // For any other error, rethrow
    throw error;
  }
};

const getUnits = async (subjectId, grade = null) => {
  try {
    let url = `${API_BASE_URL}/subjects/${subjectId}/units/?page=1`;
    if (grade) {
      url += `&grade=${grade}`;
    }
    
    const data = await apiRequest(url);
    return data;
  } catch (error) {
    console.error('Error fetching units:', error);
    throw error;
  }
};

// Teacher Analytics API functions
const getTeacherAnalyticsAPI = async (filters = {}) => {
  try {
    // Resolve teacher id: prefer explicit filter, else from stored user
    let teacherId = filters.teacherId;
    if (!teacherId && typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          teacherId = parsed?.id || parsed?.teacher_id || parsed?.user_id;
        }
      } catch (_) {}
    }
    if (!teacherId) {
      throw new Error('Missing teacher id for analytics');
    }

    const params = new URLSearchParams();
    if (filters.dateRange) {
      // Map filter values to API expected values
      const dateRangeMap = {
        'Last 30 days': '30d',
        'Last 90 days': '90d',
        'Last 7 days': '7d',
        'All time': 'all_time',
        'Last year': 'last_year',
        'Today': 'today',
        'Yesterday': 'yesterday'
      };
      params.set('date_range', dateRangeMap[filters.dateRange] || '30d');
    }
    if (filters.grade && filters.grade !== 'All grades') {
      // Extract grade number from "Grade X" format
      const gradeMatch = filters.grade.match(/Grade (\d+)/);
      if (gradeMatch) {
        params.set('grade', gradeMatch[1]);
      }
    }
    if (filters.subject && filters.subject !== 'All subjects') {
      // Map subject names to IDs
      const subjectMap = {
        'Math': '1',
        'Science': '2', 
        'English': '3',
        'Geography': '4'
      };
      if (subjectMap[filters.subject]) {
        params.set('subject', subjectMap[filters.subject]);
      }
    }
    
    const url = `https://dev.takespace.com/admin/v1/teacher-analytics/${teacherId}/?${params.toString()}`;
    const data = await apiRequest(url);
    return data;
  } catch (error) {
    console.error('Error fetching teacher analytics:', error);
    throw error;
  }
};

// Update Subject Goals (PATCH)
const updateSubjectGoals = async (filters = {}, goals = {}) => {
  try {
    const params = new URLSearchParams();

    // Extract grade id
    if (filters.grade && filters.grade !== 'All grades') {
      const gradeMatch = String(filters.grade).match(/Grade (\d+)/);
      if (gradeMatch) {
        params.set('grade', gradeMatch[1]);
      }
    }

    // Map subject to id
    if (filters.subject && filters.subject !== 'All subjects') {
      const subjectMap = {
        'Math': '1',
        'Science': '2',
        'English': '3',
        'Geography': '4'
      };
      if (subjectMap[filters.subject]) {
        params.set('subject', subjectMap[filters.subject]);
      }
    }

    const url = `${API_BASE_URL}/admin/subject-goals/?${params.toString()}`;

    // Build body. Only include provided values.
    const body = {};
    if (goals.practiceTime !== undefined && goals.practiceTime !== null && goals.practiceTime !== '') {
      body.time_practiced_goal_per_week = Number(goals.practiceTime);
    }
    if (goals.topicsMastered !== undefined && goals.topicsMastered !== null && goals.topicsMastered !== '') {
      body.topics_mastered_goal_per_week = Number(goals.topicsMastered);
    }
    if (goals.examDate) {
      body.exam_date = goals.examDate;
    }
    if (goals.lastGradeTestScore !== undefined && goals.lastGradeTestScore !== null && goals.lastGradeTestScore !== '') {
      body.last_grade_test_score = Number(goals.lastGradeTestScore);
    }

    // Send PATCH
    const response = await apiRequest(url, {
      method: 'PATCH',
      body: JSON.stringify(body)
    });

    return response;
  } catch (error) {
    console.error('Error updating subject goals:', error);
    throw error;
  }
};

// Combined function for the Teacher Analytics Page to load all its data
const getTeacherAnalyticsPageData = async (filters = {}) => {
  try {
    // Use real API
    const apiData = await getTeacherAnalyticsAPI(filters);
    
    // Format API response to match expected structure
    const formattedData = {
      homeworkQuestions: {
        labels: apiData.data.homework_questions.labels || [],
        data: apiData.data.homework_questions.data || [],
        average: apiData.data.homework_questions.avg || 0,
        goal: apiData.data.homework_questions.goal || 0
      },
      classroomQuestions: {
        labels: apiData.data.classroom_questions.labels || [],
        data: apiData.data.classroom_questions.data || [],
        average: apiData.data.classroom_questions.avg || 0,
        goal: apiData.data.classroom_questions.goal || 0
      },
      charts: {
        homeworkToClasswork: {
          data: [
            { label: 'Homework', value: apiData.data.homework_to_classwork_questions.homework || 0 },
            { label: 'Classwork', value: apiData.data.homework_to_classwork_questions.classwork || 0 }
          ]
        },
        timeComparison: {
          data: [
            { label: 'Homework', value: apiData.data.homework_to_classwork_time.homework_time || 0 },
            { label: 'Classwork', value: apiData.data.homework_to_classwork_time.classwork_time || 0 }
          ]
        },
        teacherEngagement: {
          percentage: apiData.data.teacher_engagement || 0
        }
      },
      leaderboard: {
        // Format difficult topic leaderboard
        ...apiData.data.difficult_topic_leaderboard.reduce((acc, subject) => {
          const subjectKey = subject.subject_name.toLowerCase();
          acc[subjectKey] = subject.topics.map(topic => ({
            id: topic.code,
            name: topic.name,
            count: topic.student_names.length
          }));
          return acc;
        }, {})
      },
      goals: {
        practiceTime: 5,
        topicsMastered: 5,
        examDate: ''
      }
    };
    
    return formattedData;
  } catch (err) {
    throw err;
  }
};

// Profile API
const getUserProfile = async () => {
  try {
    const url = `${API_BASE_URL}/editor/profile/`;
    const data = await apiRequest(url);
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

const changePassword = async (passwordData) => {
  try {
    const url = `${API_BASE_URL}/editor/profile/change-password/`;
    
    // Create FormData for multipart/form-data
    const formData = new FormData();
    formData.append('current_password', passwordData.current_password);
    formData.append('new_password', passwordData.new_password);
    formData.append('confirm_password', passwordData.confirm_password);
    
    const accessToken = (typeof window !== 'undefined')
      ? (localStorage.getItem('access_token') || sessionStorage.getItem('access_token'))
      : null;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'Authorization': `Bearer ${accessToken}`,
        'X-CSRFTOKEN': 'dXSyhbcqpWFmev8iBSRLn5U1LqnO2uNzOcPRjSBwpWq60VJjjnKWwGvh8UCSABly'
      },
      body: formData
    });

    if (!response.ok) {
      const text = await response.text();
      let body = null;
      try { body = text ? JSON.parse(text) : null; } catch (_) {}
      
      const extractMessage = (payload) => {
        if (!payload) return null;
        if (typeof payload === 'string') return payload;
        if (typeof payload === 'object') {
          if (payload.message && typeof payload.message === 'string') return payload.message;
          if (payload.detail && typeof payload.detail === 'string') return payload.detail;
          if (payload.error) return extractMessage(payload.error) || JSON.stringify(payload.error);
          return JSON.stringify(payload);
        }
        return String(payload);
      };

      const message = extractMessage(body) || `Password change failed: ${response.status} ${response.statusText}`;
      const error = new Error(message);
      error.status = response.status;
      error.body = body;
      throw error;
    }

    return await response.json();
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

const updateProfile = async (profileData) => {
  try {
    const url = `${API_BASE_URL}/editor/profile/update/`;
    
    // Create FormData for multipart/form-data
    const formData = new FormData();
    
    // Add all profile fields to FormData
    if (profileData.first_name) formData.append('first_name', profileData.first_name);
    if (profileData.last_name) formData.append('last_name', profileData.last_name);
    if (profileData.phone) formData.append('phone', profileData.phone);
    if (profileData.date_of_birth) formData.append('date_of_birth', profileData.date_of_birth);
    if (profileData.specialization) formData.append('specialization', profileData.specialization);
    if (profileData.experience_level !== undefined) formData.append('experience_level', profileData.experience_level.toString());
    if (profileData.mode) formData.append('mode', profileData.mode);
    if (profileData.notifications_enabled !== undefined) formData.append('notifications_enabled', profileData.notifications_enabled.toString());
    
    // Handle avatar file upload
    if (profileData.avatar && profileData.avatar instanceof File) {
      formData.append('avatar', profileData.avatar);
    }
    
    const accessToken = (typeof window !== 'undefined')
      ? (localStorage.getItem('access_token') || sessionStorage.getItem('access_token'))
      : null;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'X-CSRFTOKEN': 'dXSyhbcqpWFmev8iBSRLn5U1LqnO2uNzOcPRjSBwpWq60VJjjnKWwGvh8UCSABly'
      },
      body: formData
    });

    if (!response.ok) {
      const text = await response.text();
      let body = null;
      try { body = text ? JSON.parse(text) : null; } catch (_) {}
      
      const extractMessage = (payload) => {
        if (!payload) return null;
        if (typeof payload === 'string') return payload;
        if (typeof payload === 'object') {
          if (payload.message && typeof payload.message === 'string') return payload.message;
          if (payload.detail && typeof payload.detail === 'string') return payload.detail;
          if (payload.error) return extractMessage(payload.error) || JSON.stringify(payload.error);
          return JSON.stringify(payload);
        }
        return String(payload);
      };

      const message = extractMessage(body) || `Profile update failed: ${response.status} ${response.statusText}`;
      const error = new Error(message);
      error.status = response.status;
      error.body = body;
      throw error;
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

export const api = {
  getLearningData,
  login,
  getOrganizationDetails,
  updateOrganizationDetails,
  updateOrganizationLogo,
  getAccountContacts,
  updateAccountContact,
  updatePassword,
  getSubjects,
  getGrades,
  getStudentsBySubjectAndGrade,
  getUnits,
  // Teacher Analytics API functions
  getTeacherAnalyticsAPI,
  updateSubjectGoals,
  getTeacherAnalyticsPageData,
  // Profile API
  getUserProfile,
  changePassword,
  updateProfile,
  // Student APIs will be appended below
};

export default api;
// --- Student APIs for teacher ---
export const getStudentProgress = async (studentId, subjectId, dateRange = 'last_30_days') => {
  const url = `${API_BASE_URL}/teacher/students/${studentId}/progress/${subjectId}/?date_range=${encodeURIComponent(dateRange)}`;
  return apiRequest(url);
};

export const getStudentStatistics = async (studentId, subjectId, dateRange = 'last_30_days') => {
  const url = `${API_BASE_URL}/teacher/students/${studentId}/statistics/${subjectId}/?date_range=${encodeURIComponent(dateRange)}`;
  return apiRequest(url);
};

export const updateStudentGoals = async (studentId, subjectId, payload) => {
  const url = `${API_BASE_URL}/teacher/students/${studentId}/goals/${subjectId}/`;
  return apiRequest(url, { method: 'PATCH', body: JSON.stringify(payload) });
};

// --- Lookup APIs for Curriculum Selector ---
export const getSyllabuses = async () => {
  const url = `${API_BASE_URL}/lookup/syllabuses/`;
  return apiRequest(url);
};

export const getLookupGrades = async (syllabusId) => {
  const url = `${API_BASE_URL}/lookup/grades/?syllabus_id=${syllabusId}`;
  return apiRequest(url);
};

export const getLookupSubjects = async (syllabusId, gradeId) => {
  const url = `${API_BASE_URL}/lookup/subjects/?syllabus_id=${syllabusId}&grade_id=${gradeId}`;
  return apiRequest(url);
};

export const getLookupUnits = async (syllabusId, gradeId, subjectId) => {
  const url = `${API_BASE_URL}/lookup/units/?syllabus_id=${syllabusId}&grade_id=${gradeId}&subject_id=${subjectId}`;
  return apiRequest(url);
};

export const getLookupTopics = async (syllabusId, gradeId, subjectId, unitId) => {
  const url = `${API_BASE_URL}/lookup/topics/?syllabus_id=${syllabusId}&grade_id=${gradeId}&subject_id=${subjectId}&unit_id=${unitId}`;
  return apiRequest(url);
};

// --- Editor Syllabus Management APIs ---
export const getEditorSyllabuses = async () => {
  const url = `${API_BASE_URL}/editor-syllabuses/`;
  const data = await apiRequest(url);
  return data;
};

export const getEditorSyllabus = async (syllabusId) => {
  const url = `${API_BASE_URL}/editor-syllabuses/${syllabusId}/`;
  const data = await apiRequest(url);
  return data;
};

export const createEditorSyllabus = async (syllabusData) => {
  const url = `${API_BASE_URL}/editor-syllabuses/`;
  const data = await apiRequest(url, {
    method: 'POST',
    body: JSON.stringify(syllabusData)
  });
  return data;
};

export const updateEditorSyllabus = async (syllabusId, syllabusData) => {
  const url = `${API_BASE_URL}/editor-syllabuses/${syllabusId}/`;
  const data = await apiRequest(url, {
    method: 'PATCH',
    body: JSON.stringify(syllabusData)
  });
  return data;
};

export const deleteEditorSyllabus = async (syllabusId) => {
  const url = `${API_BASE_URL}/editor-syllabuses/${syllabusId}/`;
  const data = await apiRequest(url, {
    method: 'DELETE'
  });
  return data;
};

export const addUnitsToSyllabus = async (syllabusId, unitIds) => {
  const url = `${API_BASE_URL}/editor-syllabuses/${syllabusId}/add_units/`;
  const data = await apiRequest(url, {
    method: 'POST',
    body: JSON.stringify({ unit_ids: unitIds })
  });
  return data;
};

export const removeUnitFromSyllabus = async (syllabusId, unitId) => {
  const url = `${API_BASE_URL}/editor-syllabuses/${syllabusId}/remove-unit/${unitId}/`;
  const data = await apiRequest(url, {
    method: 'DELETE'
  });
  return data;
};

export const getSyllabusStatistics = async (syllabusId) => {
  const url = `${API_BASE_URL}/editor-syllabuses/${syllabusId}/statistics/`;
  const data = await apiRequest(url);
  return data;
};

// --- Editor Question Bulk Upload APIs ---
export const bulkUploadQuestions = async (topicId, file, category = 'quiz') => {
  const url = `${API_BASE_URL}/editor-questions/bulk-upload/`;
  const formData = new FormData();
  formData.append('topic_id', String(topicId));
  formData.append('file', file);
  formData.append('category', category); // 'quiz' or 'practice'

  const accessToken = (typeof window !== 'undefined')
    ? (localStorage.getItem('access_token') || sessionStorage.getItem('access_token'))
    : null;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`
      // Let the browser set multipart boundary
    },
    body: formData
  });

  const text = await response.text();
  const json = text ? JSON.parse(text) : null;

  if (!response.ok || (json && json.statusCode && json.statusCode !== 200)) {
    let message = `HTTP error ${response.status}`;
    if (json) {
      if (json.error && json.error.message) message = json.error.message;
      else if (json.message) message = json.message;
      else if (json.detail) message = json.detail;
    }
    const err = new Error(message);
    err.status = response.status;
    err.body = json;
    throw err;
  }

  return json?.data || json;
};

// Get topics for editor (using regular topics endpoint like superadmin)


// Editor Units API (for units management page - different from getUnits which filters by subject/grade)
export const getEditorUnits = async (page = 1, pageSize = 100) => {
  try {
    const url = `${API_BASE_URL}/editor/units/?page=${page}&page_size=${pageSize}`;
    const response = await apiRequest(url, { method: 'GET' });
    // Handle different response formats
    if (response.data && response.data.results) return response.data;
    if (response.results) return response;
    if (Array.isArray(response)) return { results: response, count: response.length };
    return { results: [], count: 0 };
  } catch (error) {
    console.error('Error fetching units:', error);
    throw error;
  }
};

export const searchEditorUnits = async (query) => {
  try {
    const url = `${API_BASE_URL}/editor/units/search/?q=${encodeURIComponent(query)}`;
    const response = await apiRequest(url, { method: 'GET' });
    return Array.isArray(response) ? response : (response.data || []);
  } catch (error) {
    console.error('Error searching units:', error);
    throw error;
  }
};

export const createUnit = async (unitData) => {
  try {
    const url = `${API_BASE_URL}/editor/units/`;
    const response = await apiRequest(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(unitData)
    });
    return response.data || response;
  } catch (error) {
    console.error('Error creating unit:', error);
    throw error;
  }
};

export const updateUnit = async (unitId, unitData) => {
  try {
    const url = `${API_BASE_URL}/editor/units/${unitId}/`;
    const response = await apiRequest(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(unitData)
    });
    return response.data || response;
  } catch (error) {
    console.error('Error updating unit:', error);
    throw error;
  }
};

export const deleteUnit = async (unitId) => {
  try {
    const url = `${API_BASE_URL}/editor/units/${unitId}/`;
    await apiRequest(url, { method: 'DELETE' });
    return true;
  } catch (error) {
    console.error('Error deleting unit:', error);
    throw error;
  }
};

export const getTopics = async (page = 1, pageSize = 100) => {
  try {
    // Use regular topics endpoint - same as superadmin but without /superadmin prefix
    const url = `${API_BASE_URL}/topics/?page=${page}&page_size=${pageSize}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': '*/*',
        ...(typeof window !== 'undefined' && (localStorage.getItem('access_token') || sessionStorage.getItem('access_token'))
          ? { 'Authorization': `Bearer ${localStorage.getItem('access_token') || sessionStorage.getItem('access_token')}` }
          : {})
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP error ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error) errorMessage = errorJson.error;
        else if (errorJson.detail) errorMessage = errorJson.detail;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      const err = new Error(errorMessage);
      err.status = response.status;
      throw err;
    }
    
    const result = await response.json();
    // Handle different response formats
    if (result.data && result.data.results) {
      return {
        results: result.data.results,
        count: result.data.count || result.data.results.length,
        next: result.data.next,
        previous: result.data.previous,
        page: page,
        pageSize: pageSize,
        data: result.data
      };
    }
    if (result.results) {
      return {
        results: result.results,
        count: result.count || result.results.length,
        next: result.next,
        previous: result.previous,
        page: page,
        pageSize: pageSize
      };
    }
    // Fallback for non-paginated responses
    const items = Array.isArray(result) ? result : (result.results || result.data || []);
    return {
      results: items,
      count: items.length,
      next: null,
      previous: null,
      page: 1,
      pageSize: items.length
    };
  } catch (error) {
    console.error('Error fetching topics:', error);
    throw error;
  }
};

// Editor Topics API (using editor endpoints)
export const getEditorTopics = async (page = 1, pageSize = 100) => {
  try {
    const url = `${API_BASE_URL}/editor/topics/?page=${page}&page_size=${pageSize}`;
    const response = await apiRequest(url, { method: 'GET' });
    // Handle different response formats
    if (response.data && response.data.results) return response.data;
    if (response.results) return response;
    if (Array.isArray(response)) return { results: response, count: response.length };
    return { results: [], count: 0 };
  } catch (error) {
    console.error('Error fetching topics:', error);
    throw error;
  }
};

export const searchTopics = async (query) => {
  try {
    const url = `${API_BASE_URL}/editor/topics/search/?q=${encodeURIComponent(query)}`;
    const response = await apiRequest(url, { method: 'GET' });
    return Array.isArray(response) ? response : (response.data || []);
  } catch (error) {
    console.error('Error searching topics:', error);
    throw error;
  }
};

export const createTopic = async (topicData) => {
  try {
    const url = `${API_BASE_URL}/editor/topics/`;
    const response = await apiRequest(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(topicData)
    });
    return response.data || response;
  } catch (error) {
    console.error('Error creating topic:', error);
    throw error;
  }
};

export const updateTopic = async (topicId, topicData) => {
  try {
    const url = `${API_BASE_URL}/editor/topics/${topicId}/`;
    const response = await apiRequest(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(topicData)
    });
    return response.data || response;
  } catch (error) {
    console.error('Error updating topic:', error);
    throw error;
  }
};

export const deleteTopic = async (topicId) => {
  try {
    const url = `${API_BASE_URL}/editor/topics/${topicId}/`;
    await apiRequest(url, { method: 'DELETE' });
    return true;
  } catch (error) {
    console.error('Error deleting topic:', error);
    throw error;
  }
};


// Get revision metadata for all topics (SRS stats)
export const getTopicRevisionMetadata = async () => {
  try {
    const url = `${API_BASE_URL}/editor/topics/revision-metadata/`;
    const data = await apiRequest(url);
    return Array.isArray(data) ? data : (data?.results || data?.data || []);
  } catch (error) {
    console.error('Error fetching topic revision metadata:', error);
    throw error;
  }
};

// Get questions for a topic (editor's questions only)
export const getTopicQuestions = async (topicId) => {
  try {
    // Use by-syllabus endpoint with topic_id filter
    const url = `${API_BASE_URL}/editor-questions/by-syllabus/?topic_id=${encodeURIComponent(topicId)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': '*/*',
        ...(typeof window !== 'undefined' && (localStorage.getItem('access_token') || sessionStorage.getItem('access_token'))
          ? { 'Authorization': `Bearer ${localStorage.getItem('access_token') || sessionStorage.getItem('access_token')}` }
          : {})
      }
    });

    if (!response.ok) {
      const text = await response.text();
      let message = `HTTP error ${response.status}`;
      try {
        const json = text ? JSON.parse(text) : null;
        if (json && json.error && json.error.message) message = json.error.message;
        else if (json && json.detail) message = json.detail;
      } catch {
        if (text) message = text;
      }
      const err = new Error(message);
      err.status = response.status;
      throw err;
    }

    const json = await response.json();
    // Handle different response formats - API may return array directly or wrapped in data
    if (Array.isArray(json)) return json;
    if (Array.isArray(json.data)) return json.data;
    if (json.results && Array.isArray(json.results)) return json.results;
    return [];
  } catch (error) {
    console.error('Error fetching topic questions:', error);
    throw error;
  }
};

// Create simple question (single question with topic_id)
export const createSimpleQuestion = async (questionData) => {
  try {
    const url = `${API_BASE_URL}/editor-questions/create-simple/`;
    
    const accessToken = (typeof window !== 'undefined')
      ? (localStorage.getItem('access_token') || sessionStorage.getItem('access_token'))
      : null;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(questionData)
    });

    if (!response.ok) {
      const text = await response.text();
      let body = null;
      try { body = text ? JSON.parse(text) : null; } catch (_) {}
      throw new Error(body?.error || body?.detail || body?.message || `HTTP error ${response.status}`);
    }

    const json = await response.json();
    // Handle different response formats
    if (json.data) return json.data;
    if (json.statusCode === 201 && json.data) return json.data;
    return json;
  } catch (error) {
    console.error('Error creating question:', error);
    throw error;
  }
};

// Update question
export const updateQuestion = async (questionId, questionData) => {
  try {
    const url = `${API_BASE_URL}/editor-questions/${questionId}/`;
    
    const accessToken = (typeof window !== 'undefined')
      ? (localStorage.getItem('access_token') || sessionStorage.getItem('access_token'))
      : null;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(questionData)
    });

    if (!response.ok) {
      const text = await response.text();
      let body = null;
      try { body = text ? JSON.parse(text) : null; } catch (_) {}
      throw new Error(body?.detail || body?.message || `HTTP error ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating question:', error);
    throw error;
  }
};

// Delete question (soft delete)
export const deleteQuestion = async (questionId) => {
  try {
    const url = `${API_BASE_URL}/editor-questions/${questionId}/`;
    const data = await apiRequest(url, { method: 'DELETE' });
    return data;
  } catch (error) {
    console.error('Error deleting question:', error);
    throw error;
  }
};

// Get question images
export const getQuestionImages = async (questionId) => {
  try {
    const url = `${API_BASE_URL}/editor-questions/${questionId}/images/`;
    const data = await apiRequest(url);
    return data?.data || data || [];
  } catch (error) {
    console.error('Error fetching question images:', error);
    throw error;
  }
};

// Add question image
export const addQuestionImage = async (questionId, imageFile, imageType = 'question', caption = '', altText = '') => {
  try {
    const url = `${API_BASE_URL}/editor-questions/${questionId}/add-image/`;
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('image_type', imageType);
    formData.append('caption', caption);
    formData.append('alt_text', altText);

    const accessToken = (typeof window !== 'undefined')
      ? (localStorage.getItem('access_token') || sessionStorage.getItem('access_token'))
      : null;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      body: formData
    });

    if (!response.ok) {
      const text = await response.text();
      let body = null;
      try { body = text ? JSON.parse(text) : null; } catch (_) {}
      throw new Error(body?.detail || body?.message || `HTTP error ${response.status}`);
    }

    const json = await response.json();
    return json?.data || json;
  } catch (error) {
    console.error('Error adding question image:', error);
    throw error;
  }
};

// Remove question image
export const removeQuestionImage = async (questionId, imageId) => {
  try {
    const url = `${API_BASE_URL}/editor-questions/${questionId}/remove-image/${imageId}/`;
    const data = await apiRequest(url, { method: 'DELETE' });
    return data;
  } catch (error) {
    console.error('Error removing question image:', error);
    throw error;
  }
};
