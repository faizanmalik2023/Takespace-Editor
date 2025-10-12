// src/lib/i18n.js

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // --- Navigation ---
      learning: 'Learning',
      analytics: 'Analytics',
      students: 'Students',
      teachers: 'Teachers',
      leaderboards: 'Leaderboards',
      account: 'Account',
      searchPlaceholder: 'Search for something',
      
      // --- Learning Page ---
      unitsAndTopics: 'Units and Topics',
      fractions: '5.1 Fractions',
      unitsAndTopicsSection: 'Units and Topics',
      
      // --- Sidebar ---
      subject: 'Subject',
      grade: 'Grade',
      
      // --- Analytics Page Titles ---
      teacherEngagement: 'Teacher Engagement',
      studentAnalytics: 'Student Analytics',
      teacherAnalytics: 'Teacher Analytics',
      
      // --- Filters ---
      gradeFilterLabel: 'GRADE',
      subjectFilterLabel: 'SUBJECT',
      dateRangeFilterLabel: 'DATE RANGE',
      teachersFilterLabel: 'TEACHERS',
      sortByName: 'Sort by name',
      
      // --- Student Analytics ---
      questionAnsweredPerStudent: 'Question Answered Per Student',
      weeklyAverage: 'Weekly Average',
      monthlyAverage: 'Monthly Average',
      
      // --- Teacher Analytics ---
      homeworkQuestions: 'Homework Questions',
      classroomQuestions: 'Classroom Questions',
      
      // --- Students Table ---
      studentCount: '{{count}} Students',
      studentName: 'Student Name',
      teachersLabel: 'Teacher(s)',
      year: 'Year',
      questionsAnswered: 'Questions Answered',
      questionsAnsweredPerWeek: 'Questions Answered per week',
      timeSpent: 'Time Spent',
      timeSpentPerWeek: 'Time Spent per week',
      seeMore: 'See 100 more',
      total: 'Total',
      average: 'Average',
      
      // --- Dashboard / Teacher Analytics Page ---
      questionHomeworkToClasswork: 'Question: Homework to Classwork',
      timeHomeworkToClasswork: 'Time: Homework to Classwork (hour)',
      difficultTopicLeaderboard: 'Difficult Topic Leaderboard',
      mathematics: 'Mathematics',
      english: 'English',
      science: 'Science',
      defaultGoalsTitle: 'Default Goals For The Chosen Grade(s) And Subject(s)',
      practiceTime: 'Practice Time',
      practiceTimeSub: 'Per week, in hours',
      topicsMastered: 'Topics Mastered',
      topicsMasteredSub: 'Per week',
      examDate: 'Exam Date',
      examDatePlaceholder: 'dd/mm/yyyy',
      goal: 'Goal',

      // --- Goals ---
      saveGoals: 'Save goals',
      saving: 'Saving...',
      goalsUpdated: 'Goals updated successfully.',
      failedToUpdateGoals: 'Failed to update goals.',
      examDateMustBeFuture: 'Exam date must be in the future.',
      examDateRequired: 'Exam date is required.',
      selectSpecificGradeSubject: 'Please select a specific grade and subject.',
      
      // --- Common ---
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      refresh: 'Refresh',
      noDataAvailable: 'No data available'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
