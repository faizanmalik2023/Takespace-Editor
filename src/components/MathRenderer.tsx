'use client';

import { useEffect, useRef } from 'react';
import katex from 'katex';

interface MathRendererProps {
  expression: string;
  className?: string;
}

export default function MathRenderer({ expression, className = '' }: MathRendererProps) {
  const mathRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mathRef.current && expression) {
      try {
        // Remove the $ delimiters if present
        const cleanExpression = expression.replace(/^\$|\$$/g, '');
        katex.render(cleanExpression, mathRef.current, {
          throwOnError: false,
          displayMode: false,
        });
      } catch (error) {
        console.error('KaTeX rendering error:', error);
        if (mathRef.current) {
          mathRef.current.textContent = expression;
        }
      }
    }
  }, [expression]);

  return <div ref={mathRef} className={className} />;
}

