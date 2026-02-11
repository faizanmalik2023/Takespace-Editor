'use client';

import React from 'react';
import Header from '../Header';
import Sidebar from '../Sidebar';
import { Toaster } from 'react-hot-toast';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

const PageLayout = ({ 
  children, 
  title,
  subtitle,
  actions,
  className = '',
  activeSection = '',
  onSectionChange = () => {}
}: PageLayoutProps) => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <div className="flex flex-1 pt-[100px]">
        <Sidebar activeSection={activeSection} onSectionChange={onSectionChange} />
        <main className="flex-1 p-8 ml-[250px]">
          {/* Page Header */}
          {(title || subtitle || actions) && (
            <div className="mb-8">
              <div className="flex items-start justify-between">
                <div>
                  {title && (
                    <h1 className="text-3xl font-bold text-[#103358] mb-2">
                      {title}
                    </h1>
                  )}
                  {subtitle && (
                    <p className="text-lg text-[#475569]">
                      {subtitle}
                    </p>
                  )}
                </div>
                {actions && (
                  <div className="flex items-center space-x-3">
                    {actions}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Page Content */}
          <div className={className}>
            {children}
          </div>
        </main>
      </div>
      <Toaster position="top-right" />
    </div>
  );
};

export default PageLayout;
