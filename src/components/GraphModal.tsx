'use client';

import { useState } from 'react';
import GraphShape from './GraphShape';

interface GraphData {
  x: string;
  y: number;
}

interface GraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGraph: (graphType: 'line' | 'bar' | 'scatter', graphData: GraphData[]) => void;
}

export default function GraphModal({ isOpen, onClose, onAddGraph }: GraphModalProps) {
  const [graphType, setGraphType] = useState<'line' | 'bar' | 'scatter'>('line');
  const [graphData, setGraphData] = useState<GraphData[]>([
    {x: '1', y: 2},
    {x: '2', y: 4},
    {x: '3', y: 6},
    {x: '4', y: 8}
  ]);

  const addDataPoint = () => {
    setGraphData([...graphData, {x: '', y: 0}]);
  };

  const removeDataPoint = (index: number) => {
    if (graphData.length > 1) {
      setGraphData(graphData.filter((_, i) => i !== index));
    }
  };

  const updateDataPoint = (index: number, field: 'x' | 'y', value: string | number) => {
    const newData = [...graphData];
    newData[index] = { ...newData[index], [field]: value };
    setGraphData(newData);
  };

  const handleAddGraph = () => {
    onAddGraph(graphType, graphData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[500px] max-h-[80vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Create Graph</h3>
        
        {/* Graph Type Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Graph Type</label>
          <div className="flex gap-2">
            {(['line', 'bar', 'scatter'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setGraphType(type)}
                className={`px-3 py-2 rounded capitalize ${
                  graphType === type ? 'bg-orange-500 text-white' : 'bg-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Data Points */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">Data Points</label>
            <button
              onClick={addDataPoint}
              className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200"
            >
              Add Point
            </button>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {graphData.map((point, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={point.x}
                  onChange={(e) => updateDataPoint(index, 'x', e.target.value)}
                  placeholder="X value"
                  className="w-20 p-2 border border-gray-300 rounded text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                <input
                  type="number"
                  value={point.y}
                  onChange={(e) => updateDataPoint(index, 'y', parseFloat(e.target.value) || 0)}
                  placeholder="Y value"
                  className="w-20 p-2 border border-gray-300 rounded text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                <button
                  onClick={() => removeDataPoint(index)}
                  className="px-2 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
          <div className="p-3 border rounded bg-gray-50 min-h-[200px] flex items-center justify-center relative">
            <GraphShape
              x={0}
              y={0}
              graphType={graphType}
              graphData={graphData}
              width={250}
              height={150}
              draggable={false}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleAddGraph}
            className="px-4 py-2 bg-orange-500 text-white rounded"
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
