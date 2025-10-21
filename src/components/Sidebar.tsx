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
  FiRotateCcw ,
  FiUser
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
      
      </div>
    </aside>
  );
}



