'use client';

import { useState } from 'react';
import MathRenderer from './MathRenderer';

interface TableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTable: (tableData: string[][]) => void;
}

export default function TableModal({ isOpen, onClose, onAddTable }: TableModalProps) {
  const [tableData, setTableData] = useState<string[][]>([['', ''], ['', '']]);

  const addRow = () => {
    const newRow = new Array(tableData[0].length).fill('');
    setTableData([...tableData, newRow]);
  };

  const addColumn = () => {
    const newData = tableData.map(row => [...row, '']);
    setTableData(newData);
  };

  const removeRow = () => {
    if (tableData.length > 1) {
      setTableData(tableData.slice(0, -1));
    }
  };

  const removeColumn = () => {
    if (tableData[0].length > 1) {
      const newData = tableData.map(row => row.slice(0, -1));
      setTableData(newData);
    }
  };

  const handleAddTable = () => {
    onAddTable(tableData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[500px] max-h-[80vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Create Table</h3>
        
        {/* Table Controls */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={addRow}
            className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200"
          >
            Add Row
          </button>
          <button
            onClick={addColumn}
            className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200"
          >
            Add Column
          </button>
          <button
            onClick={removeRow}
            className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200"
          >
            Remove Row
          </button>
          <button
            onClick={removeColumn}
            className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200"
          >
            Remove Column
          </button>
        </div>

        {/* Table Editor */}
        <div className="mb-4 overflow-x-auto">
          <table className="border-collapse border border-gray-300">
            <tbody>
              {tableData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="border border-gray-300 p-0">
                      <input
                        type="text"
                        value={cell}
                        onChange={(e) => {
                          const newData = [...tableData];
                          newData[rowIndex][cellIndex] = e.target.value;
                          setTableData(newData);
                        }}
                        className="w-24 p-2 border-0 focus:outline-none focus:bg-blue-50 text-gray-800"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Preview */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
          <div className="p-3 border rounded bg-gray-50">
            <MathRenderer expression={`\\begin{array}{|${'c|'.repeat(tableData[0].length)}} \\hline ${tableData.map(row => row.join(' & ')).join(' \\\\ \\hline ')} \\\\ \\hline \\end{array}`} />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleAddTable}
            className="px-4 py-2 bg-purple-500 text-white rounded"
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

