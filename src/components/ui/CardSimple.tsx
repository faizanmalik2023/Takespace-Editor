'use client';

import React from 'react';

interface CardSimpleProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  padding?: 'none' | 'sm' | 'default' | 'lg';
}

const CardSimple = ({ 
  children, 
  className = '', 
  title,
  subtitle,
  actions,
  padding = 'default'
}: CardSimpleProps) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8'
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm ${paddingClasses[padding]} ${className}`}>
      {(title || subtitle || actions) && (
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              {title && (
                <h2 className="text-xl font-semibold text-[#0F172A] mb-2">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-sm text-[#475569]">
                  {subtitle}
                </p>
              )}
            </div>
            {actions && (
              <div className="flex items-center space-x-2">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}
      {children}
    </div>
  );
};

export default CardSimple;
