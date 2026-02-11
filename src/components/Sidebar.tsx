'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../app/contexts/AuthContext';
import { 
  FiUpload, 
  FiUser,
  FiBook,
  FiBookOpen,
  FiLayers,
  FiFolder,
  FiTag
} from 'react-icons/fi';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Check if user is Chief Editor (can manage syllabuses)
  const isChiefEditor = user?.role === 'chief_editor';
  
  const sections = [
    { id: '/bulk-question-upload', name: 'Question', icon: FiUpload, isRoute: true },
    { id: '/subjects', name: 'Subjects', icon: FiBookOpen, isRoute: true },
    { id: '/grades', name: 'Grades', icon: FiLayers, isRoute: true },
    { id: '/units', name: 'Units', icon: FiFolder, isRoute: true },
    { id: '/topics', name: 'Topics', icon: FiTag, isRoute: true },
    // Only show Syllabuses menu for Chief Editors
    ...(isChiefEditor ? [{ id: '/syllabuses', name: 'Syllabuses', icon: FiBook, isRoute: true }] : []),
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

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      <nav className="flex-1 px-4 py-4">
        <div className="space-y-2">
          {sections.map((section) => {
            const isActiveItem = isActive(section);
  return (
            <button
              key={section.id}
              onClick={() => handleNavigation(section)}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                  isActiveItem 
                    ? 'bg-[#103358] text-white' 
                    : 'text-[#103358] hover:bg-gray-100'
              }`}
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: isActiveItem ? 600 : 400,
                  fontSize: '16px',
                  lineHeight: '20px'
                }}
            >
                <section.icon className="w-5 h-5 mr-3" />
                {section.name}
            </button>
            );
          })}
        </div>
        </nav>
    </div>
  );

  return (
    <>
      {/* Desktop: Fixed sidebar */}
      <div 
        className="hidden md:block fixed left-0 bg-white"
        style={{
          top: '100px',
          height: 'calc(100vh - 100px)',
          width: '250px',
          overflowY: 'auto',
          overflowX: 'hidden',
          background: '#FFFFFF',
          borderRight: '1px solid #e5e7eb'
        }}
      >
        <SidebarContent />
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .sidebar-scroll {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e0 #f7fafc;
        }
        
        .sidebar-scroll::-webkit-scrollbar {
          width: 6px;
        }
        
        .sidebar-scroll::-webkit-scrollbar-track {
          background: #f7fafc;
        }
        
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background-color: #cbd5e0;
          border-radius: 3px;
        }
        
        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background-color: #a0aec0;
        }
      `}</style>
    </>
  );
}



