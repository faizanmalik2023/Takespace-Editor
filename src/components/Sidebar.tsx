'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  FiFileText, 
  FiEdit3, 
  FiFile, 
  FiBarChart, 
  FiSettings, 
  FiSave, 
  FiUpload, 
  FiRotateCcw ,
  FiUser,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const sections = [
    { id: '/', name: 'Create Question', icon: FiFileText, isRoute: true },
    { id: '/edit-question', name: 'Edit Questions', icon: FiEdit3, isRoute: true },
    { id: '/profile', name: 'Profile', icon: FiUser, isRoute: true },
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
    <aside className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white/95 backdrop-blur-md border-r border-gray-200/60 shadow-sm h-full transition-all duration-300 relative flex-shrink-0`}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 z-10 w-6 h-6 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? (
          <FiChevronRight className="w-4 h-4 text-gray-600" />
        ) : (
          <FiChevronLeft className="w-4 h-4 text-gray-600" />
        )}
      </button>

      <div className={`p-6 ${isCollapsed ? 'px-2' : ''}`}>
        <nav className="space-y-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => handleNavigation(section)}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-3 rounded-xl font-medium transition-all duration-200 ${
                isActive(section)
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
              title={isCollapsed ? section.name : ''}
            >
              <section.icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="text-sm font-medium">{section.name}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Quick Actions */}
      
      </div>
    </aside>
  );
}



