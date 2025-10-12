'use client';

import React from 'react';

interface QuestionFormProps {
  questionTitle: string;
  questionContent: string;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
}

export default function QuestionForm({
  questionTitle,
  questionContent,
  onTitleChange,
  onContentChange
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

        {/* Question Title */}
        <div className="space-y-3">
          <label className="block">
            <span className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Question Title
            </span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={questionTitle}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Enter a descriptive title for your question..."
              className="w-full px-6 py-4 bg-gray-50/80 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 font-medium text-lg"
            />
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
              placeholder="Describe your question in detail. Include any specific instructions or context..."
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
