import React from 'react';

interface SettingsPanelProps {
  onClose: () => void;
  theme: 'light' | 'dark' | 'custom';
  setTheme: React.Dispatch<React.SetStateAction<'light' | 'dark' | 'custom'>>;
  roundingPrecision: string;
  setRoundingPrecision: React.Dispatch<React.SetStateAction<string>>;
  onOpenCustomThemePanel: () => void;
  customThemeExists: boolean;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose, theme, setTheme, roundingPrecision, setRoundingPrecision, onOpenCustomThemePanel, customThemeExists }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 font-mono">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-300 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
          <button onClick={onClose} className="text-2xl text-gray-500 hover:text-gray-900 dark:hover:text-white">&times;</button>
        </div>
        <div className="space-y-6">
          
          {/* Theme Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-lg text-gray-900 dark:text-white">Theme</label>
            <div className="flex items-center gap-1 p-1 rounded-full bg-gray-200 dark:bg-gray-700">
                <button 
                    onClick={() => setTheme('light')} 
                    className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${theme === 'light' ? 'bg-white text-gray-900 shadow' : 'text-gray-500'}`}>
                    Light
                </button>
                <button 
                    onClick={() => setTheme('dark')}
                    className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${theme === 'dark' ? 'bg-gray-900 text-white shadow' : 'text-gray-500'}`}>
                    Dark
                </button>
                 {customThemeExists && (
                    <button 
                        onClick={() => setTheme('custom')}
                        className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${theme === 'custom' ? 'bg-indigo-500 text-white shadow' : 'text-gray-500'}`}>
                        Custom
                    </button>
                 )}
            </div>
          </div>

          {/* Rounding Precision */}
          <div className="flex items-center justify-between">
            <label htmlFor="rounding" className="text-lg text-gray-900 dark:text-white">Rounding Precision</label>
            <select
                id="rounding"
                value={roundingPrecision}
                onChange={(e) => setRoundingPrecision(e.target.value)}
                className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-md p-2 border-2 border-transparent focus:outline-none focus:border-indigo-500"
            >
                <option value="None">None</option>
                {Array.from({ length: 9 }, (_, i) => (
                    <option key={i} value={i}>{i}</option>
                ))}
            </select>
          </div>

          {/* Custom Theme Creator */}
          <div>
            <button
              onClick={() => {
                onOpenCustomThemePanel();
                onClose();
              }}
              className="w-full text-center bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 rounded-lg transition-colors"
            >
              Create Custom Theme
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};