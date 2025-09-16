import React from 'react';

interface FormulasSheetProps {
  onClose: () => void;
}

const formulas = {
  'Algebra': [
    { name: 'Quadratic Formula', formula: 'x = [-b ± sqrt(b²-4ac)] / 2a' },
    { name: 'Pythagorean Theorem', formula: 'a² + b² = c²' },
  ],
  'Geometry': [
    { name: 'Area of a Circle', formula: 'A = πr²' },
    { name: 'Circumference of a Circle', formula: 'C = 2πr' },
    { name: 'Area of a Triangle', formula: 'A = (1/2)bh' },
  ],
  'Trigonometry': [
    { name: 'Sine', formula: 'sin(θ) = Opposite / Hypotenuse' },
    { name: 'Cosine', formula: 'cos(θ) = Adjacent / Hypotenuse' },
    { name: 'Tangent', formula: 'tan(θ) = Opposite / Adjacent' },
  ],
};

export const FormulasSheet: React.FC<FormulasSheetProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 font-mono">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-300 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Common Formulas</h2>
          <button onClick={onClose} className="text-2xl text-gray-500 hover:text-gray-900 dark:hover:text-white">&times;</button>
        </div>
        <div className="space-y-6">
          {Object.entries(formulas).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-xl font-semibold mb-2 text-indigo-500 dark:text-indigo-400">{category}</h3>
              <ul className="space-y-2">
                {items.map(item => (
                  <li key={item.name} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                    <strong className="text-gray-900 dark:text-white">{item.name}:</strong>
                    <p className="text-gray-700 dark:text-gray-300 font-sans">{item.formula}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
