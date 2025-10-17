"use client"

import { ChevronDown } from "lucide-react"
import { useState } from "react"
import { FiBarChart, FiActivity, FiBook } from "react-icons/fi"

const subjects = [
  { id: "math", name: "Math", color: "bg-blue-500", icon: FiBarChart },
  { id: "science", name: "Science", color: "bg-green-500", icon: FiActivity },
  { id: "english", name: "English", color: "bg-orange-500", icon: FiBook },
]

const grades = [
  { id: "grade-3", name: "Grade 3", number: "3" },
  { id: "grade-4", name: "Grade 4", number: "4" },
  { id: "grade-5", name: "Grade 5", number: "5" },
  { id: "grade-6", name: "Grade 6", number: "6" },
]

export function DashboardSidebar() {
  const [selectedSubject, setSelectedSubject] = useState("science")
  const [selectedGrade, setSelectedGrade] = useState("grade-5")
  const [subjectOpen, setSubjectOpen] = useState(true)
  const [gradeOpen, setGradeOpen] = useState(true)

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4">
      {/* Subject Section */}
      <div className="space-y-2">
        <button
          onClick={() => setSubjectOpen(!subjectOpen)}
          className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded p-2"
        >
          <span className="font-medium text-gray-900">Subject</span>
          <ChevronDown
            className={`w-4 h-4 text-gray-500 transition-transform ${subjectOpen ? "rotate-0" : "-rotate-90"}`}
          />
        </button>
        {subjectOpen && (
          <div className="space-y-1">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubject(subject.id)}
                className={`flex items-center space-x-3 w-full p-2 rounded transition-colors ${
                  selectedSubject === subject.id ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50"
                }`}
              >
                <div className={`w-4 h-4 rounded ${subject.color} flex items-center justify-center`}>
                  <subject.icon className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm font-medium">{subject.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grade Section */}
      <div className="space-y-2 mt-6">
        <button
          onClick={() => setGradeOpen(!gradeOpen)}
          className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded p-2"
        >
          <span className="font-medium text-gray-900">Grade</span>
          <ChevronDown
            className={`w-4 h-4 text-gray-500 transition-transform ${gradeOpen ? "rotate-0" : "-rotate-90"}`}
          />
        </button>
        {gradeOpen && (
          <div className="space-y-1">
            {grades.map((grade) => (
              <button
                key={grade.id}
                onClick={() => setSelectedGrade(grade.id)}
                className={`flex items-center space-x-3 w-full p-2 rounded transition-colors ${
                  selectedGrade === grade.id ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50"
                }`}
              >
                <span className="text-sm font-medium text-gray-600 w-4">{grade.number}</span>
                <span className="text-sm font-medium">{grade.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
