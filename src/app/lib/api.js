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
const getSubjects = async () => {
  try {
    const data = await apiRequest(`${API_BASE_URL}/subjects/`);
    return data;
  } catch (error) {
    console.error('Error fetching subjects:', error);
    throw error;
  }
};

// Get grades API
const getGrades = async () => {
  try {
    const data = await apiRequest(`${API_BASE_URL}/grades/`);
    return data;
  } catch (error) {
    console.error('Error fetching grades:', error);
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
