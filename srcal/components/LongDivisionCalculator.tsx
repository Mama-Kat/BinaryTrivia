import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";

interface LongDivisionCalculatorProps {
  onClose: () => void;
  ai: GoogleGenAI;
}

export const LongDivisionCalculator: React.FC<LongDivisionCalculatorProps> = ({ onClose, ai }) => {
  const [dividend, setDividend] = useState('');
  const [divisor, setDivisor] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCalculate = async () => {
    if (!/^\d+$/.test(dividend) || !/^\d+$/.test(divisor)) {
      setResult("Invalid input: Please use non-negative integers.");
      return;
    }
    if (parseInt(divisor, 10) === 0) {
      setResult("Error: Cannot divide by zero.");
      return;
    }

    setIsLoading(true);
    setResult('');
    
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Solve the long division problem: ${dividend} / ${divisor}.`,
        config: {
          systemInstruction: `You are a math tutor. Your task is to provide the full step-by-step process of long division as you would write it on paper. Use monospaced formatting, ensuring all numbers, subtraction lines, and the final remainder are perfectly aligned. Do not include any other explanations, conversational text, or introductions. Only provide the formatted long division calculation.`,
        },
      });
      
      const aiResult = response.text.trim();
      setResult(aiResult);
    } catch (error) {
      console.error("Gemini API error during long division:", error);
      setResult("An error occurred while calculating. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 font-mono">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-300 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Long Division</h2>
          <button onClick={onClose} className="text-2xl text-gray-500 hover:text-gray-900 dark:hover:text-white">&times;</button>
        </div>
        <div className="space-y-4">
          <div className="flex gap-4">
            <input
              type="text"
              pattern="\d*"
              placeholder="Dividend"
              value={dividend}
              onChange={(e) => /^\d*$/.test(e.target.value) && setDividend(e.target.value)}
              className="w-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-md p-2 border-2 border-transparent focus:outline-none focus:border-indigo-500"
            />
            <span className="text-2xl text-gray-900 dark:text-white self-center">/</span>
            <input
              type="text"
              pattern="\d*"
              placeholder="Divisor"
              value={divisor}
              onChange={(e) => /^\d*$/.test(e.target.value) && setDivisor(e.target.value)}
              className="w-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-md p-2 border-2 border-transparent focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            onClick={handleCalculate}
            disabled={isLoading}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Calculating...' : 'Calculate'}
          </button>
          {(result || isLoading) && (
            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-900 rounded-md min-h-[100px]">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Result:</h3>
              {isLoading ? (
                 <div className="flex justify-center items-center h-full">
                    <p className="text-gray-800 dark:text-gray-200">AI is thinking...</p>
                 </div>
              ) : (
                <pre className="text-left text-gray-800 dark:text-gray-200 text-sm overflow-x-auto">{result}</pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
