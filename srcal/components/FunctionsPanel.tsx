import React, { useState } from 'react';
import { CalculatorButton } from './CalculatorButton';

interface FunctionsPanelProps {
  onButtonClick: (label: string) => void;
}

const functionGroups = {
  'Scientific': ['sin', 'cos', 'tan', 'log', '^', 'root', '!'],
  'Probability': ['nPr', 'nCr', '%'],
  'Algebra': ['x', 'y', 'z'],
  'Constants': ['π', 'e'],
  'Utilities': ['Graph', 'Formulas', 'Hist', 'Long Division', 'Assistant', '⚙️'],
};

export const FunctionsPanel: React.FC<FunctionsPanelProps> = ({ onButtonClick }) => {
  const [activeTab, setActiveTab] = useState<keyof typeof functionGroups>('Scientific');

  const getButtonClass = (label: string) => {
    // Reduced font size to help buttons fit better
    const base = "h-12 text-lg";
    if (['Graph', 'Formulas', 'Long Division'].includes(label)) return `${base} bg-purple-400 dark:bg-purple-500 hover:bg-purple-500 dark:hover:bg-purple-600 text-white`;
    if (label === 'Assistant') return `${base} bg-teal-400 dark:bg-teal-500 hover:bg-teal-500 dark:hover:bg-teal-600 text-white`;
    if (['Hist', '⚙️'].includes(label)) return `${base} bg-gray-300 dark:bg-gray-500 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-900 dark:text-white`;
    if (['π', 'e'].includes(label)) return `${base} bg-indigo-400 dark:bg-indigo-500 hover:bg-indigo-500 dark:hover:bg-indigo-600 text-white`;
    return `${base} bg-gray-300 dark:bg-gray-500 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-900 dark:text-white`;
  };
  
  const gridLayouts: { [key in keyof typeof functionGroups]: string } = {
    Scientific: 'grid-cols-7',
    Probability: 'grid-cols-3',
    Algebra: 'grid-cols-3',
    Constants: 'grid-cols-2',
    Utilities: 'grid-cols-3',
  };

  return (
    <div className="bg-gray-300/50 dark:bg-gray-900/50 rounded-lg p-2">
      <div className="flex flex-wrap justify-center gap-1 mb-2">
        {Object.keys(functionGroups).map((category) => (
          <button
            key={category}
            onClick={() => setActiveTab(category as keyof typeof functionGroups)}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
              activeTab === category
                ? 'bg-indigo-500 text-white shadow'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
      
      <div className={`grid ${gridLayouts[activeTab]} gap-1 pt-2`}>
        {functionGroups[activeTab].map(item => (
          <CalculatorButton 
            key={item} 
            label={item} 
            onClick={(label) => onButtonClick(label === '⚙️' ? 'Settings' : label)}
            className={getButtonClass(item)} 
          />
        ))}
      </div>
    </div>
  );
};
