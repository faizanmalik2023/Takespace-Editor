'use client';

import { useState } from 'react';
import MathRenderer from './MathRenderer';

interface MathModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMath: (expression: string) => void;
}

export default function MathModal({ isOpen, onClose, onAddMath }: MathModalProps) {
  const [mathExpression, setMathExpression] = useState('');

  // Mathematical symbols
  const mathSymbols = [
    { symbol: '+', latex: '+' },
    { symbol: '−', latex: '-' },
    { symbol: '×', latex: '\\times' },
    { symbol: '÷', latex: '\\div' },
    { symbol: '=', latex: '=' },
    { symbol: '≠', latex: '\\neq' },
    { symbol: '<', latex: '<' },
    { symbol: '>', latex: '>' },
    { symbol: '≤', latex: '\\leq' },
    { symbol: '≥', latex: '\\geq' },
    { symbol: '±', latex: '\\pm' },
    { symbol: '∞', latex: '\\infty' },
    { symbol: '√', latex: '\\sqrt{x}' },
    { symbol: '∑', latex: '\\sum' },
    { symbol: '∫', latex: '\\int' },
    { symbol: 'π', latex: '\\pi' },
    { symbol: 'α', latex: '\\alpha' },
    { symbol: 'β', latex: '\\beta' },
    { symbol: 'γ', latex: '\\gamma' },
    { symbol: 'δ', latex: '\\delta' },
    { symbol: 'θ', latex: '\\theta' },
    { symbol: 'λ', latex: '\\lambda' },
    { symbol: 'μ', latex: '\\mu' },
    { symbol: 'σ', latex: '\\sigma' },
    { symbol: 'φ', latex: '\\phi' },
    { symbol: 'ω', latex: '\\omega' },
  ];

  const insertSymbol = (latex: string) => {
    setMathExpression(prev => prev + latex);
  };

  const handleAddMath = () => {
    if (mathExpression.trim()) {
      onAddMath(mathExpression);
      setMathExpression('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[600px] max-h-[80vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Add Mathematical Expression</h3>
        
        {/* Symbol Palette */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Common Symbols</h4>
          <div className="grid grid-cols-8 gap-2">
            {mathSymbols.map((item, index) => (
              <button
                key={index}
                onClick={() => insertSymbol(item.latex)}
                className="p-2 border rounded hover:bg-gray-100 text-center"
                title={item.latex}
              >
                {item.symbol}
              </button>
            ))}
          </div>
        </div>

        {/* Expression Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">LaTeX Expression</label>
          <textarea
            value={mathExpression}
            onChange={(e) => setMathExpression(e.target.value)}
            placeholder="Enter LaTeX expression (e.g., x^2 + y^2 = r^2)"
            className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent h-20"
          />
        </div>

        {/* Preview */}
        {mathExpression && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
            <div className="p-3 border rounded bg-gray-50">
              <MathRenderer expression={`$${mathExpression}$`} />
            </div>
          </div>
        )}

        {/* Quick Templates */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Templates</h4>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setMathExpression('x^2 + y^2 = r^2')}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
            >
              Circle
            </button>
            <button
              onClick={() => setMathExpression('y = mx + b')}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
            >
              Line
            </button>
            <button
              onClick={() => setMathExpression('\\frac{a}{b}')}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
            >
              Fraction
            </button>
            <button
              onClick={() => setMathExpression('\\int_{a}^{b} f(x) dx')}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
            >
              Integral
            </button>
            <button
              onClick={() => setMathExpression('\\sum_{i=1}^{n} x_i')}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
            >
              Sum
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleAddMath}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Add to Canvas
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

