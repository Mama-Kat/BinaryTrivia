import React from 'react';

interface CalculatorButtonProps {
    label: string;
    onClick: (label: string) => void;
    className?: string;
}

export const CalculatorButton: React.FC<CalculatorButtonProps> = ({ label, onClick, className = '' }) => {
    const baseClasses = "text-[var(--btn-default-text)] text-3xl font-bold rounded-lg h-16 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white transition-colors duration-200";
    
    const defaultBg = 'bg-[var(--btn-default-bg)] hover:bg-[var(--btn-default-bg-hover)]';

    const finalClassName = `${baseClasses} ${className.includes('bg-') ? '' : defaultBg} ${className}`;

    return (
        <button
            onClick={() => onClick(label)}
            className={finalClassName}
        >
            {label}
        </button>
    );
};