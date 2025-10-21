'use client';

import React from 'react';

interface QuestionFormProps {
  questionContent: string;
  difficulty: string;
  onContentChange: (content: string) => void;
  onDifficultyChange: (difficulty: string) => void;
}

export default function QuestionForm({
  questionContent,
  difficulty,
  onContentChange,
  onDifficultyChange
}: QuestionFormProps) {
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8 h-fit">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
            Create Question
          </h2>
          <p className="text-gray-600 font-medium">
            Design interactive curriculum questions with visual elements
          </p>
        </div>


        {/* Difficulty Level */}
        <div className="space-y-3">
          <label className="block">
            <span className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Difficulty Level
            </span>
          </label>
          <div className="relative">
            <select
              value={difficulty}
              onChange={(e) => onDifficultyChange(e.target.value)}
              className="w-full px-6 py-4 bg-gray-50/80 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 font-medium appearance-none cursor-pointer"
            >
              <option value="">Select difficulty level...</option>
              <option value="Easy">Easy</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Hard">Hard</option>
              <option value="Olympiad">Olympiad</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-6 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <div className="absolute inset-0 rounded-xl ring-2 ring-transparent focus-within:ring-blue-500/20 transition-all duration-200 pointer-events-none"></div>
          </div>
        </div>

        {/* Question Content */}
        <div className="space-y-3">
          <label className="block">
            <span className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Question Content
            </span>
          </label>
          <div className="relative">
            <textarea
              value={questionContent}
              onChange={(e) => onContentChange(e.target.value)}
              placeholder="Enter your question content here..."
              rows={6}
              className="w-full px-6 py-4 bg-gray-50/80 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 font-medium resize-none"
            />
            <div className="absolute inset-0 rounded-xl ring-2 ring-transparent focus-within:ring-blue-500/20 transition-all duration-200 pointer-events-none"></div>
          </div>
        </div>

      </div>
    </div>
  );
}
