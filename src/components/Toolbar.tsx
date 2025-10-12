'use client';

import { Tool } from '../types';

interface ToolbarProps {
  activeTool: Tool;
  onToolChange: (tool: Tool) => void;
  onShowMathModal: () => void;
  onShowTableModal: () => void;
  onShowGraphModal: () => void;
  onDeleteSelected: () => void;
  onClearCanvas: () => void;
  selectedShape: string | null;
  strokeColor: string;
  onStrokeColorChange: (color: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
}

export default function Toolbar({
  activeTool,
  onToolChange,
  onShowMathModal,
  onShowTableModal,
  onShowGraphModal,
  onDeleteSelected,
  onClearCanvas,
  selectedShape,
  strokeColor,
  onStrokeColorChange,
  strokeWidth,
  onStrokeWidthChange
}: ToolbarProps) {
  return (
    <div className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200/60 shadow-lg backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex flex-wrap gap-6 items-center">
          {/* Basic Tools */}
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-2xl p-3 shadow-sm border border-gray-200/50">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-1">Tools</div>
            <div className="h-6 w-px bg-gray-300"></div>
            <button
              onClick={() => onToolChange('select')}
              className={`group relative px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                activeTool === 'select' 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25' 
                  : 'bg-white/60 text-gray-700 hover:bg-white hover:shadow-md border border-gray-200/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-md flex items-center justify-center ${
                  activeTool === 'select' ? 'bg-white/20' : 'bg-gray-100'
                }`}>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm font-medium">Select</span>
              </div>
            </button>
            <button
              onClick={() => onToolChange('text')}
              className={`group relative px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                activeTool === 'text' 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25' 
                  : 'bg-white/60 text-gray-700 hover:bg-white hover:shadow-md border border-gray-200/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-md flex items-center justify-center ${
                  activeTool === 'text' ? 'bg-white/20' : 'bg-gray-100'
                }`}>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a1 1 0 000 2h.5a.5.5 0 01.5.5v6a.5.5 0 01-.5.5H4a1 1 0 100 2h12a1 1 0 100-2h-.5a.5.5 0 01-.5-.5v-6a.5.5 0 01.5-.5H16a1 1 0 100-2H4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm font-medium">Text</span>
              </div>
            </button>
            <button
              onClick={() => onToolChange('draw')}
              className={`group relative px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                activeTool === 'draw' 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25' 
                  : 'bg-white/60 text-gray-700 hover:bg-white hover:shadow-md border border-gray-200/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-md flex items-center justify-center ${
                  activeTool === 'draw' ? 'bg-white/20' : 'bg-gray-100'
                }`}>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </div>
                <span className="text-sm font-medium">Draw</span>
              </div>
            </button>
          </div>
          
          {/* Shapes */}
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-2xl p-3 shadow-sm border border-gray-200/50">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-1">Shapes</div>
            <div className="h-6 w-px bg-gray-300"></div>
            <button
              onClick={() => onToolChange('rectangle')}
              className={`group relative px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                activeTool === 'rectangle' 
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25' 
                  : 'bg-white/60 text-gray-700 hover:bg-white hover:shadow-md border border-gray-200/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-md flex items-center justify-center ${
                  activeTool === 'rectangle' ? 'bg-white/20' : 'bg-gray-100'
                }`}>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 1v10h10V5H5z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm font-medium">Rectangle</span>
              </div>
            </button>
            <button
              onClick={() => onToolChange('circle')}
              className={`group relative px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                activeTool === 'circle' 
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25' 
                  : 'bg-white/60 text-gray-700 hover:bg-white hover:shadow-md border border-gray-200/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-md flex items-center justify-center ${
                  activeTool === 'circle' ? 'bg-white/20' : 'bg-gray-100'
                }`}>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm font-medium">Circle</span>
              </div>
            </button>
            <button
              onClick={() => onToolChange('line')}
              className={`group relative px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                activeTool === 'line' 
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25' 
                  : 'bg-white/60 text-gray-700 hover:bg-white hover:shadow-md border border-gray-200/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-md flex items-center justify-center ${
                  activeTool === 'line' ? 'bg-white/20' : 'bg-gray-100'
                }`}>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm font-medium">Line</span>
              </div>
            </button>
            <button
              onClick={() => onToolChange('arrow')}
              className={`group relative px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                activeTool === 'arrow' 
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25' 
                  : 'bg-white/60 text-gray-700 hover:bg-white hover:shadow-md border border-gray-200/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-md flex items-center justify-center ${
                  activeTool === 'arrow' ? 'bg-white/20' : 'bg-gray-100'
                }`}>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm font-medium">Arrow</span>
              </div>
            </button>
          </div>

          {/* Advanced Tools */}
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-2xl p-3 shadow-sm border border-gray-200/50">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-1">Advanced</div>
            <div className="h-6 w-px bg-gray-300"></div>
            <button
              onClick={onShowMathModal}
              className="group relative px-4 py-2.5 rounded-xl font-medium transition-all duration-200 bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm font-medium">Math</span>
              </div>
            </button>
            <button
              onClick={onShowTableModal}
              className="group relative px-4 py-2.5 rounded-xl font-medium transition-all duration-200 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 1v10h10V5H5z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm font-medium">Table</span>
              </div>
            </button>
            <button
              onClick={onShowGraphModal}
              className="group relative px-4 py-2.5 rounded-xl font-medium transition-all duration-200 bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm font-medium">Graph</span>
              </div>
            </button>
          </div>

          {/* Drawing Controls */}
          {(activeTool === 'draw' || activeTool === 'line' || activeTool === 'arrow') && (
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-2xl p-3 shadow-sm border border-gray-200/50">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-1">Style</div>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-1">
                  <input
                    type="color"
                    value={strokeColor}
                    onChange={(e) => onStrokeColorChange(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border-2 border-gray-300 hover:border-blue-500 transition-all duration-200"
                    style={{ 
                      padding: '2px',
                      backgroundColor: 'white'
                    }}
                    title="Choose stroke color"
                  />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <select
                    value={strokeWidth}
                    onChange={(e) => onStrokeWidthChange(parseInt(e.target.value))}
                    className="px-3 py-2 border-2 border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                  >
                    <option value={1}>1px</option>
                    <option value={2}>2px</option>
                    <option value={3}>3px</option>
                    <option value={4}>4px</option>
                    <option value={5}>5px</option>
                    <option value={8}>8px</option>
                    <option value={10}>10px</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 ml-auto">
            {selectedShape && (
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-2xl p-3 shadow-sm border border-gray-200/50">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-1">Actions</div>
                <div className="h-6 w-px bg-gray-300"></div>
                <button
                  onClick={onDeleteSelected}
                  className="group relative px-4 py-2.5 rounded-xl font-medium transition-all duration-200 bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/25 hover:shadow-red-500/40"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium">Delete</span>
                  </div>
                </button>
              </div>
            )}
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-2xl p-3 shadow-sm border border-gray-200/50">
              <button
                onClick={onClearCanvas}
                className="group relative px-4 py-2.5 rounded-xl font-medium transition-all duration-200 bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700 shadow-lg shadow-gray-500/25 hover:shadow-gray-500/40"
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">Clear</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
