'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  FiFileText, 
  FiEdit3, 
  FiFile, 
  FiBarChart, 
  FiSettings, 
  FiSave, 
  FiUpload, 
  FiRotateCcw 
} from 'react-icons/fi';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  const sections = [
    { id: '/', name: 'Create Question', icon: FiFileText, isRoute: true },
    { id: '/edit-question', name: 'Edit Questions', icon: FiEdit3, isRoute: true },
    { id: 'templates', name: 'Templates', icon: FiFile, isRoute: false },
    { id: 'analytics', name: 'Analytics', icon: FiBarChart, isRoute: false },
    { id: 'settings', name: 'Settings', icon: FiSettings, isRoute: false },
  ];

  const handleNavigation = (section: typeof sections[0]) => {
    if (section.isRoute) {
      // Navigate to a different page
      router.push(section.id);
    } else {
      // Just change section within the same page
      onSectionChange(section.id);
    }
  };

  const isActive = (section: typeof sections[0]) => {
    if (section.isRoute) {
      return pathname === section.id;
    }
    return activeSection === section.id;
  };

  return (
    <aside className="w-64 bg-white/95 backdrop-blur-md border-r border-gray-200/60 shadow-sm h-full">
      <div className="p-6">
        <nav className="space-y-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => handleNavigation(section)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                isActive(section)
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <section.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{section.name}</span>
            </button>
          ))}
        </nav>

        {/* Quick Actions */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Quick Actions
          </h3>
          <div className="space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200">
              <FiSave className="w-4 h-4" />
              <span>Save Draft</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200">
              <FiUpload className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200">
              <FiRotateCcw className="w-4 h-4" />
              <span>Recent</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}



