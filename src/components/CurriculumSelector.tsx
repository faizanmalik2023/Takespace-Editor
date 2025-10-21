'use client';

import React, { useState, useEffect } from 'react';
import { FiCheck } from 'react-icons/fi';
import { 
  getSyllabuses, 
  getLookupGrades, 
  getLookupSubjects, 
  getLookupUnits, 
  getLookupTopics 
} from '@/app/lib/api';

interface CurriculumItem {
  id: string;
  name: string;
}

interface CurriculumSelectorProps {
  syllabus: string;
  grade: string;
  subject: string;
  unit: string;
  topic: string;
  onSyllabusChange: (value: string) => void;
  onGradeChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  onUnitChange: (value: string) => void;
  onTopicChange: (value: string) => void;
}

export default function CurriculumSelector({
  syllabus,
  grade,
  subject,
  unit,
  topic,
  onSyllabusChange,
  onGradeChange,
  onSubjectChange,
  onUnitChange,
  onTopicChange,
}: CurriculumSelectorProps) {
  // Available options from API
  const [availableSyllabuses, setAvailableSyllabuses] = useState<CurriculumItem[]>([]);
  const [availableGrades, setAvailableGrades] = useState<CurriculumItem[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<CurriculumItem[]>([]);
  const [availableUnits, setAvailableUnits] = useState<CurriculumItem[]>([]);
  const [availableTopics, setAvailableTopics] = useState<CurriculumItem[]>([]);

  // Loading states
  const [loadingSyllabuses, setLoadingSyllabuses] = useState<boolean>(false);
  const [loadingGrades, setLoadingGrades] = useState<boolean>(false);
  const [loadingSubjects, setLoadingSubjects] = useState<boolean>(false);
  const [loadingUnits, setLoadingUnits] = useState<boolean>(false);
  const [loadingTopics, setLoadingTopics] = useState<boolean>(false);

  // Fetch syllabuses on mount
  useEffect(() => {
    const fetchSyllabusesData = async () => {
      try {
        setLoadingSyllabuses(true);
        const response = await getSyllabuses();
        const syllabusData = response?.data?.results || [];
        setAvailableSyllabuses(syllabusData);
      } catch (error) {
        console.error('Error fetching syllabuses:', error);
        setAvailableSyllabuses([]);
      } finally {
        setLoadingSyllabuses(false);
      }
    };

    fetchSyllabusesData();
  }, []);

  // Fetch grades when syllabus is selected
  useEffect(() => {
    if (syllabus) {
      const fetchGradesData = async () => {
        try {
          setLoadingGrades(true);
          // Reset dependent fields
          onGradeChange('');
          onSubjectChange('');
          onUnitChange('');
          onTopicChange('');
          setAvailableGrades([]);
          setAvailableSubjects([]);
          setAvailableUnits([]);
          setAvailableTopics([]);

          const response = await getLookupGrades(syllabus);
          const gradesData = response?.data?.results || [];
          setAvailableGrades(gradesData);
        } catch (error) {
          console.error('Error fetching grades:', error);
          setAvailableGrades([]);
        } finally {
          setLoadingGrades(false);
        }
      };

      fetchGradesData();
    } else {
      setAvailableGrades([]);
      setAvailableSubjects([]);
      setAvailableUnits([]);
      setAvailableTopics([]);
      onGradeChange('');
      onSubjectChange('');
      onUnitChange('');
      onTopicChange('');
    }
  }, [syllabus]);

  // Fetch subjects when syllabus and grade are selected
  useEffect(() => {
    if (syllabus && grade) {
      const fetchSubjectsData = async () => {
        try {
          setLoadingSubjects(true);
          // Reset dependent fields
          onSubjectChange('');
          onUnitChange('');
          onTopicChange('');
          setAvailableSubjects([]);
          setAvailableUnits([]);
          setAvailableTopics([]);

          const response = await getLookupSubjects(syllabus, grade);
          const subjectsData = response?.data?.results || [];
          setAvailableSubjects(subjectsData);
        } catch (error) {
          console.error('Error fetching subjects:', error);
          setAvailableSubjects([]);
        } finally {
          setLoadingSubjects(false);
        }
      };

      fetchSubjectsData();
    } else {
      setAvailableSubjects([]);
      setAvailableUnits([]);
      setAvailableTopics([]);
      onSubjectChange('');
      onUnitChange('');
      onTopicChange('');
    }
  }, [syllabus, grade]);

  // Fetch units when syllabus, grade, and subject are all selected
  useEffect(() => {
    if (syllabus && grade && subject) {
      const fetchUnitsData = async () => {
        try {
          setLoadingUnits(true);
          // Reset dependent fields
          onUnitChange('');
          onTopicChange('');
          setAvailableUnits([]);
          setAvailableTopics([]);
          
          const response = await getLookupUnits(syllabus, grade, subject);
          const unitsData = response?.data?.results || [];
          setAvailableUnits(unitsData);
        } catch (error) {
          console.error('Error fetching units:', error);
          setAvailableUnits([]);
        } finally {
          setLoadingUnits(false);
        }
      };

      fetchUnitsData();
    } else {
      setAvailableUnits([]);
      setAvailableTopics([]);
      onUnitChange('');
      onTopicChange('');
    }
  }, [syllabus, grade, subject]);

  // Fetch topics when all previous fields including unit are selected
  useEffect(() => {
    if (syllabus && grade && subject && unit) {
      const fetchTopicsData = async () => {
        try {
          setLoadingTopics(true);
          // Reset topic selection
          onTopicChange('');
          setAvailableTopics([]);
          
          const response = await getLookupTopics(syllabus, grade, subject, unit);
          const topicsData = response?.data?.results || [];
          setAvailableTopics(topicsData);
        } catch (error) {
          console.error('Error fetching topics:', error);
          setAvailableTopics([]);
        } finally {
          setLoadingTopics(false);
        }
      };

      fetchTopicsData();
    } else {
      setAvailableTopics([]);
      onTopicChange('');
    }
  }, [syllabus, grade, subject, unit]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Curriculum Information</h3>
        <p className="text-gray-600 mb-4">Select the curriculum details for this question</p>
        
        {/* Status Indicator */}
        {(syllabus || grade || subject || unit || topic) && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">
                  {!syllabus
                    ? 'Please select a Syllabus to begin'
                    : !grade
                    ? loadingGrades
                      ? 'Loading grades...'
                      : `${availableGrades.length} grades available - Select a Grade`
                    : !subject
                    ? loadingSubjects
                      ? 'Loading subjects...'
                      : `${availableSubjects.length} subjects available - Select a Subject`
                    : !unit
                    ? loadingUnits 
                      ? 'Loading units...' 
                      : `${availableUnits.length} units available - Select a Unit`
                    : !topic
                    ? loadingTopics
                      ? 'Loading topics...'
                      : `${availableTopics.length} topics available - Select a Topic`
                    : (
                      <>
                        <FiCheck className="w-4 h-4 inline mr-1" />
                        All curriculum fields selected - Ready to create your question!
                      </>
                    )}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Syllabus Dropdown */}
          <div>
            <label htmlFor="syllabus" className="block text-sm font-semibold text-gray-700 mb-2">
              Syllabus
            </label>
            <div className="relative">
              <select
                id="syllabus"
                value={syllabus}
                onChange={(e) => onSyllabusChange(e.target.value)}
                disabled={loadingSyllabuses}
                className={`w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 transition-all duration-200 ${
                  loadingSyllabuses ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <option value="">
                  {loadingSyllabuses ? 'Loading syllabuses...' : 'Select Syllabus'}
                </option>
                {availableSyllabuses.map((syllabusOption) => (
                  <option key={syllabusOption.id} value={syllabusOption.id}>
                    {syllabusOption.name}
                  </option>
                ))}
              </select>
              {loadingSyllabuses && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </div>

          {/* Grade Dropdown */}
          <div>
            <label htmlFor="grade" className="block text-sm font-semibold text-gray-700 mb-2">
              Grade
            </label>
            <div className="relative">
              <select
                id="grade"
                value={grade}
                onChange={(e) => onGradeChange(e.target.value)}
                disabled={!syllabus || loadingGrades}
                className={`w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 transition-all duration-200 ${
                  (!syllabus || loadingGrades) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <option value="">
                  {loadingGrades ? 'Loading grades...' : availableGrades.length > 0 ? 'Select Grade' : 'Select Syllabus first'}
                </option>
                {availableGrades.map((gradeOption) => (
                  <option key={gradeOption.id} value={gradeOption.id}>
                    {gradeOption.name}
                  </option>
                ))}
              </select>
              {loadingGrades && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </div>

          {/* Subject Dropdown */}
          <div>
            <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
              Subject
            </label>
            <div className="relative">
              <select
                id="subject"
                value={subject}
                onChange={(e) => onSubjectChange(e.target.value)}
                disabled={!syllabus || !grade || loadingSubjects}
                className={`w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 transition-all duration-200 ${
                  (!syllabus || !grade || loadingSubjects) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <option value="">
                  {loadingSubjects ? 'Loading subjects...' : availableSubjects.length > 0 ? 'Select Subject' : 'Select Grade first'}
                </option>
                {availableSubjects.map((subjectOption) => (
                  <option key={subjectOption.id} value={subjectOption.id}>
                    {subjectOption.name}
                  </option>
                ))}
              </select>
              {loadingSubjects && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </div>

          {/* Unit Dropdown */}
          <div>
            <label htmlFor="unit" className="block text-sm font-semibold text-gray-700 mb-2">
              Unit
            </label>
            <div className="relative">
              <select
                id="unit"
                value={unit}
                onChange={(e) => onUnitChange(e.target.value)}
                disabled={!syllabus || !grade || !subject || loadingUnits}
                className={`w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 transition-all duration-200 ${
                  (!syllabus || !grade || !subject || loadingUnits) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <option value="">
                  {loadingUnits ? 'Loading units...' : availableUnits.length > 0 ? 'Select Unit' : 'Select Subject first'}
                </option>
                {availableUnits.map((unitOption) => (
                  <option key={unitOption.id} value={unitOption.id}>
                    {unitOption.name}
                  </option>
                ))}
              </select>
              {loadingUnits && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </div>

          {/* Topic Dropdown */}
          <div>
            <label htmlFor="topic" className="block text-sm font-semibold text-gray-700 mb-2">
              Topic
            </label>
            <div className="relative">
              <select
                id="topic"
                value={topic}
                onChange={(e) => onTopicChange(e.target.value)}
                disabled={!syllabus || !grade || !subject || !unit || loadingTopics}
                className={`w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 transition-all duration-200 ${
                  (!syllabus || !grade || !subject || !unit || loadingTopics) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <option value="">
                  {loadingTopics ? 'Loading topics...' : availableTopics.length > 0 ? 'Select Topic' : 'Select Unit first'}
                </option>
                {availableTopics.map((topicOption) => (
                  <option key={topicOption.id} value={topicOption.id}>
                    {topicOption.name}
                  </option>
                ))}
              </select>
              {loadingTopics && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}








