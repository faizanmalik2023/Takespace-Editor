'use client';

import React, { useState, useEffect } from 'react';

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
  // Dynamic units and topics from API
  const [availableUnits, setAvailableUnits] = useState<string[]>([]);
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  const [loadingUnits, setLoadingUnits] = useState<boolean>(false);
  const [loadingTopics, setLoadingTopics] = useState<boolean>(false);

  // Mock API function to fetch units based on syllabus, grade, and subject
  const fetchUnits = async (syllabusValue: string, gradeValue: string, subjectValue: string): Promise<string[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock data - in real implementation, this would be an API call
    const mockUnitsData: { [key: string]: string[] } = {
      'IB-Grade 11-Mathematics': ['Algebra', 'Functions', 'Geometry and Trigonometry', 'Statistics and Probability', 'Calculus'],
      'IB-Grade 11-Physics': ['Measurements and Uncertainties', 'Mechanics', 'Thermal Physics', 'Waves', 'Electricity and Magnetism'],
      'IB-Grade 11-Chemistry': ['Stoichiometry', 'Atomic Structure', 'Periodicity', 'Chemical Bonding', 'Energetics'],
      'IGCSE-Grade 10-Mathematics': ['Number', 'Algebra and Graphs', 'Coordinate Geometry', 'Geometry', 'Mensuration', 'Trigonometry', 'Vectors and Transformations', 'Probability', 'Statistics'],
      'IGCSE-Grade 10-Physics': ['General Physics', 'Thermal Physics', 'Properties of Waves', 'Electricity and Magnetism', 'Atomic Physics'],
      'Common Core-Grade 9-Mathematics': ['Expressions and Equations', 'Functions', 'Geometry', 'Statistics and Probability'],
      'AP-Grade 12-Calculus': ['Limits and Continuity', 'Differentiation', 'Integration', 'Applications of Derivatives', 'Applications of Integrals'],
      'default': ['Unit 1', 'Unit 2', 'Unit 3', 'Unit 4', 'Unit 5']
    };
    
    const key = `${syllabusValue}-${gradeValue}-${subjectValue}`;
    return mockUnitsData[key] || mockUnitsData['default'];
  };

  // Mock API function to fetch topics based on selected unit
  const fetchTopics = async (syllabusValue: string, gradeValue: string, subjectValue: string, unitValue: string): Promise<string[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock data - in real implementation, this would be an API call
    const mockTopicsData: { [key: string]: string[] } = {
      'Algebra': ['Linear Equations', 'Quadratic Equations', 'Polynomials', 'Exponential Functions', 'Logarithmic Functions'],
      'Functions': ['Domain and Range', 'Composite Functions', 'Inverse Functions', 'Transformations of Functions'],
      'Geometry and Trigonometry': ['Trigonometric Ratios', 'Trigonometric Identities', 'Vectors', 'Three-Dimensional Geometry'],
      'Statistics and Probability': ['Descriptive Statistics', 'Probability Distributions', 'Binomial Distribution', 'Normal Distribution'],
      'Calculus': ['Limits and Derivatives', 'Integration', 'Applications of Differentiation', 'Differential Equations'],
      'Measurements and Uncertainties': ['SI Units', 'Uncertainty and Error', 'Vectors and Scalars'],
      'Mechanics': ['Motion', 'Forces', 'Work Energy and Power', 'Momentum and Impulse'],
      'Thermal Physics': ['Temperature and Heat', 'Thermal Properties of Matter', 'Ideal Gases'],
      'Waves': ['Wave Properties', 'Wave Phenomena', 'Standing Waves'],
      'Electricity and Magnetism': ['Electric Fields', 'Electric Circuits', 'Magnetic Fields', 'Electromagnetic Induction'],
      'Stoichiometry': ['Mole Concept', 'Chemical Equations', 'Mass and Volume Relationships'],
      'Atomic Structure': ['Atomic Models', 'Electron Configuration', 'Isotopes'],
      'Number': ['Integers', 'Fractions and Decimals', 'Percentages', 'Ratio and Proportion'],
      'Algebra and Graphs': ['Linear Equations', 'Simultaneous Equations', 'Quadratic Equations', 'Graphing'],
      'default': ['Topic 1.1', 'Topic 1.2', 'Topic 1.3', 'Topic 1.4']
    };
    
    return mockTopicsData[unitValue] || mockTopicsData['default'];
  };

  // Fetch units when syllabus, grade, and subject are all selected
  useEffect(() => {
    if (syllabus && grade && subject) {
      setLoadingUnits(true);
      onUnitChange(''); // Reset unit selection
      onTopicChange(''); // Reset topic selection
      setAvailableTopics([]); // Clear topics
      
      fetchUnits(syllabus, grade, subject)
        .then(units => {
          setAvailableUnits(units);
          setLoadingUnits(false);
        })
        .catch(error => {
          console.error('Error fetching units:', error);
          setLoadingUnits(false);
          setAvailableUnits([]);
        });
    } else {
      setAvailableUnits([]);
      onUnitChange('');
      onTopicChange('');
      setAvailableTopics([]);
    }
  }, [syllabus, grade, subject]);

  // Fetch topics when unit is selected
  useEffect(() => {
    if (syllabus && grade && subject && unit) {
      setLoadingTopics(true);
      onTopicChange(''); // Reset topic selection
      
      fetchTopics(syllabus, grade, subject, unit)
        .then(topics => {
          setAvailableTopics(topics);
          setLoadingTopics(false);
        })
        .catch(error => {
          console.error('Error fetching topics:', error);
          setLoadingTopics(false);
          setAvailableTopics([]);
        });
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
                  {!syllabus || !grade || !subject 
                    ? 'Please select Syllabus, Grade, and Subject to load available Units' 
                    : !unit
                    ? loadingUnits 
                      ? 'Loading units...' 
                      : `${availableUnits.length} units available - Select a Unit to load Topics`
                    : !topic
                    ? loadingTopics
                      ? 'Loading topics...'
                      : `${availableTopics.length} topics available - Select a Topic to proceed`
                    : '✓ All curriculum fields selected - Ready to create your question!'}
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
            <select
              id="syllabus"
              value={syllabus}
              onChange={(e) => onSyllabusChange(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 transition-all duration-200"
            >
              <option value="">Select Syllabus</option>
              <option value="IB">IB</option>
              <option value="IGCSE">IGCSE</option>
              <option value="Common Core">Common Core</option>
              <option value="National Curriculum">National Curriculum</option>
              <option value="AP">AP (Advanced Placement)</option>
              <option value="A-Levels">A-Levels</option>
              <option value="CBSE">CBSE</option>
              <option value="ICSE">ICSE</option>
            </select>
          </div>

          {/* Grade Dropdown */}
          <div>
            <label htmlFor="grade" className="block text-sm font-semibold text-gray-700 mb-2">
              Grade
            </label>
            <select
              id="grade"
              value={grade}
              onChange={(e) => onGradeChange(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 transition-all duration-200"
            >
              <option value="">Select Grade</option>
              <option value="Grade 1">Grade 1</option>
              <option value="Grade 2">Grade 2</option>
              <option value="Grade 3">Grade 3</option>
              <option value="Grade 4">Grade 4</option>
              <option value="Grade 5">Grade 5</option>
              <option value="Grade 6">Grade 6</option>
              <option value="Grade 7">Grade 7</option>
              <option value="Grade 8">Grade 8</option>
              <option value="Grade 9">Grade 9</option>
              <option value="Grade 10">Grade 10</option>
              <option value="Grade 11">Grade 11</option>
              <option value="Grade 12">Grade 12</option>
            </select>
          </div>

          {/* Subject Dropdown */}
          <div>
            <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
              Subject
            </label>
            <select
              id="subject"
              value={subject}
              onChange={(e) => onSubjectChange(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 transition-all duration-200"
            >
              <option value="">Select Subject</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
              <option value="English">English</option>
              <option value="History">History</option>
              <option value="Geography">Geography</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Economics">Economics</option>
              <option value="Business Studies">Business Studies</option>
            </select>
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
                  {loadingUnits ? 'Loading units...' : availableUnits.length > 0 ? 'Select Unit' : 'Select Syllabus, Grade & Subject first'}
                </option>
                {availableUnits.map((unitOption, index) => (
                  <option key={index} value={unitOption}>
                    {unitOption}
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
                disabled={!unit || loadingTopics}
                className={`w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 transition-all duration-200 ${
                  (!unit || loadingTopics) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <option value="">
                  {loadingTopics ? 'Loading topics...' : availableTopics.length > 0 ? 'Select Topic' : 'Select Unit first'}
                </option>
                {availableTopics.map((topicOption, index) => (
                  <option key={index} value={topicOption}>
                    {topicOption}
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








