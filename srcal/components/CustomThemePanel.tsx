import React, { useState } from 'react';

export interface ThemeColors {
    '--bg-primary': string;
    '--bg-calculator': string;
    '--bg-display': string;
    '--bg-modal': string;
    '--text-primary': string;
    '--text-display': string;
    '--text-display-secondary': string;
    '--border-primary': string;
    '--btn-default-bg': string;
    '--btn-default-bg-hover': string;
    '--btn-default-text': string;
    '--btn-operator-bg': string;
    '--btn-operator-bg-hover': string;
    '--btn-operator-text': string;
    '--btn-function-bg': string;
    '--btn-function-bg-hover': string;
    '--btn-function-text': string;
    '--btn-solve-bg': string;
    '--btn-solve-bg-hover': string;
    '--btn-solve-text': string;
    '--btn-clear-bg': string;
    '--btn-clear-bg-hover': string;
    '--btn-clear-text': string;
    '--btn-equals-bg': string;
    '--btn-equals-bg-hover': string;
    '--btn-equals-text': string;
}

export const lightTheme: ThemeColors = {
    '--bg-primary': '#f3f4f6',
    '--bg-calculator': '#e5e7eb',
    '--bg-display': '#d1d5db',
    '--bg-modal': '#ffffff',
    '--text-primary': '#111827',
    '--text-display': '#111827',
    '--text-display-secondary': '#6b7280',
    '--border-primary': '#d1d5db',
    '--btn-default-bg': '#d1d5db',
    '--btn-default-bg-hover': '#9ca3af',
    '--btn-default-text': '#111827',
    '--btn-operator-bg': '#fb923c',
    '--btn-operator-bg-hover': '#f97316',
    '--btn-operator-text': '#ffffff',
    '--btn-function-bg': '#d1d5db',
    '--btn-function-bg-hover': '#9ca3af',
    '--btn-function-text': '#111827',
    '--btn-solve-bg': '#60a5fa',
    '--btn-solve-bg-hover': '#3b82f6',
    '--btn-solve-text': '#ffffff',
    '--btn-clear-bg': '#f87171',
    '--btn-clear-bg-hover': '#ef4444',
    '--btn-clear-text': '#ffffff',
    '--btn-equals-bg': '#4ade80',
    '--btn-equals-bg-hover': '#22c55e',
    '--btn-equals-text': '#ffffff',
};

export const darkTheme: ThemeColors = {
    '--bg-primary': '#111827',
    '--bg-calculator': '#1f2937',
    '--bg-display': '#374151',
    '--bg-modal': '#1f2937',
    '--text-primary': '#f9fafb',
    '--text-display': '#f9fafb',
    '--text-display-secondary': '#9ca3af',
    '--border-primary': '#4b5563',
    '--btn-default-bg': '#4b5563',
    '--btn-default-bg-hover': '#6b7280',
    '--btn-default-text': '#ffffff',
    '--btn-operator-bg': '#f97316',
    '--btn-operator-bg-hover': '#ea580c',
    '--btn-operator-text': '#ffffff',
    '--btn-function-bg': '#4b5563',
    '--btn-function-bg-hover': '#6b7280',
    '--btn-function-text': '#ffffff',
    '--btn-solve-bg': '#3b82f6',
    '--btn-solve-bg-hover': '#2563eb',
    '--btn-solve-text': '#ffffff',
    '--btn-clear-bg': '#ef4444',
    '--btn-clear-bg-hover': '#dc2626',
    '--btn-clear-text': '#ffffff',
    '--btn-equals-bg': '#22c55e',
    '--btn-equals-bg-hover': '#16a34a',
    '--btn-equals-text': '#ffffff',
};

interface ColorPickerProps {
    label: string;
    color: string;
    onChange: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ label, color, onChange }) => (
    <div className="flex items-center justify-between">
        <label className="text-sm text-gray-900 dark:text-white">{label}</label>
        <input 
            type="color"
            value={color}
            onChange={e => onChange(e.target.value)}
            className="w-10 h-10 p-0 border-none rounded cursor-pointer bg-transparent"
        />
    </div>
);

interface CustomThemePanelProps {
    onClose: () => void;
    onSave: (theme: ThemeColors) => void;
    initialTheme: ThemeColors;
}

export const CustomThemePanel: React.FC<CustomThemePanelProps> = ({ onClose, onSave, initialTheme }) => {
    const [colors, setColors] = useState<ThemeColors>(initialTheme);

    const handleColorChange = (key: keyof ThemeColors, value: string) => {
        setColors(prev => ({...prev, [key]: value}));
    };

    const handleSave = () => {
        onSave(colors);
        onClose();
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 font-mono">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-300 dark:border-gray-700 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Custom Theme</h2>
                    <button onClick={onClose} className="text-2xl text-gray-500 hover:text-gray-900 dark:hover:text-white">&times;</button>
                </div>

                <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        <h3 className="md:col-span-2 text-lg font-semibold text-indigo-500 dark:text-indigo-400">General</h3>
                        <ColorPicker label="Background" color={colors['--bg-primary']} onChange={v => handleColorChange('--bg-primary', v)} />
                        <ColorPicker label="Calculator Body" color={colors['--bg-calculator']} onChange={v => handleColorChange('--bg-calculator', v)} />
                        <ColorPicker label="Display" color={colors['--bg-display']} onChange={v => handleColorChange('--bg-display', v)} />
                        <ColorPicker label="Display Text" color={colors['--text-display']} onChange={v => handleColorChange('--text-display', v)} />

                        <h3 className="md:col-span-2 text-lg font-semibold text-indigo-500 dark:text-indigo-400 pt-4">Buttons</h3>
                        <ColorPicker label="Default BG" color={colors['--btn-default-bg']} onChange={v => handleColorChange('--btn-default-bg', v)} />
                        <ColorPicker label="Default BG (Hover)" color={colors['--btn-default-bg-hover']} onChange={v => handleColorChange('--btn-default-bg-hover', v)} />
                        <ColorPicker label="Default Text" color={colors['--btn-default-text']} onChange={v => handleColorChange('--btn-default-text', v)} />
                        
                        <ColorPicker label="Operator BG" color={colors['--btn-operator-bg']} onChange={v => handleColorChange('--btn-operator-bg', v)} />
                        <ColorPicker label="Operator BG (Hover)" color={colors['--btn-operator-bg-hover']} onChange={v => handleColorChange('--btn-operator-bg-hover', v)} />
                        <ColorPicker label="Operator Text" color={colors['--btn-operator-text']} onChange={v => handleColorChange('--btn-operator-text', v)} />

                        <ColorPicker label="Function BG" color={colors['--btn-function-bg']} onChange={v => handleColorChange('--btn-function-bg', v)} />
                        <ColorPicker label="Function BG (Hover)" color={colors['--btn-function-bg-hover']} onChange={v => handleColorChange('--btn-function-bg-hover', v)} />
                        <ColorPicker label="Function Text" color={colors['--btn-function-text']} onChange={v => handleColorChange('--btn-function-text', v)} />
                        
                        <ColorPicker label="Clear BG" color={colors['--btn-clear-bg']} onChange={v => handleColorChange('--btn-clear-bg', v)} />
                        <ColorPicker label="Clear BG (Hover)" color={colors['--btn-clear-bg-hover']} onChange={v => handleColorChange('--btn-clear-bg-hover', v)} />
                        <ColorPicker label="Clear Text" color={colors['--btn-clear-text']} onChange={v => handleColorChange('--btn-clear-text', v)} />

                        <ColorPicker label="Solve BG" color={colors['--btn-solve-bg']} onChange={v => handleColorChange('--btn-solve-bg', v)} />
                        <ColorPicker label="Solve BG (Hover)" color={colors['--btn-solve-bg-hover']} onChange={v => handleColorChange('--btn-solve-bg-hover', v)} />
                        <ColorPicker label="Solve Text" color={colors['--btn-solve-text']} onChange={v => handleColorChange('--btn-solve-text', v)} />

                        <ColorPicker label="Equals BG" color={colors['--btn-equals-bg']} onChange={v => handleColorChange('--btn-equals-bg', v)} />
                        <ColorPicker label="Equals BG (Hover)" color={colors['--btn-equals-bg-hover']} onChange={v => handleColorChange('--btn-equals-bg-hover', v)} />
                        <ColorPicker label="Equals Text" color={colors['--btn-equals-text']} onChange={v => handleColorChange('--btn-equals-text', v)} />
                    </div>
                </div>

                <div className="flex-shrink-0 pt-4 mt-4 border-t border-gray-300 dark:border-gray-700 flex justify-end gap-4">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-semibold transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-semibold transition-colors">
                        Save Theme
                    </button>
                </div>
            </div>
        </div>
    );
};
