import React, { useState, useEffect } from 'react';
import { CalculatorButton } from './components/CalculatorButton';
import { GraphingCalculator } from './components/GraphingCalculator';
import { FormulasSheet } from './components/FormulasSheet';
import { GoogleGenAI } from "@google/genai";
import { FunctionsPanel } from './components/FunctionsPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { LongDivisionCalculator } from './components/LongDivisionCalculator';
import { AiAssistant } from './components/AiAssistant';
import { CustomThemePanel, ThemeColors, lightTheme, darkTheme } from './components/CustomThemePanel';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);

const decimalToFraction = (decimal: number): string | null => {
    if (Math.abs(decimal) > 1000000000 || decimal % 1 === 0) return null;
    const tolerance = 1.0E-9;
    const sign = decimal < 0 ? "-" : "";
    const absDecimal = Math.abs(decimal);
    let h1 = 1, h2 = 0, k1 = 0, k2 = 1;
    let b = absDecimal;
    do {
        const a = Math.floor(b);
        let aux = h1; h1 = a * h1 + h2; h2 = aux;
        aux = k1; k1 = a * k1 + k2; k2 = aux;
        b = 1 / (b - a);
    } while (Math.abs(absDecimal - h1 / k1) > absDecimal * tolerance);
    if (k1 > 10000) return null;
    return `${sign}${h1}/${k1}`;
};

const preprocessPercentages = (expr: string): string => {
    let processedExpr = expr.replace(/(\d+(?:\.\d+)?)\s*([+\-])\s*(\d+(?:\.\d+)?)%/g, (match, base, operator, percentVal) => {
      return `${base} ${operator} (${base} * ${percentVal} / 100)`;
    });
    processedExpr = processedExpr.replace(/(\d+(?:\.\d+)?)%/g, '($1/100)');
    return processedExpr;
};

interface HistoryEntry {
    entry: string;
    timestamp: string;
}

const ERROR_STATES = [
    'Invalid Eq', 'Solve Error', 'Malformed Expression', 'Use Solve', 
    'Invalid Assign', 'Invalid Var', 'Assign Error', 'Calc Error',
    'Invalid root() syntax', 'root() needs 2 args',
    'Syntax Error', 'Mismatched Parentheses', 'Domain Error',
    'Invalid Function Args', 'Invalid Equation', 'Solver Failed'
];

const App: React.FC = () => {
    const [display, setDisplay] = useState('0');
    const [fractionResult, setFractionResult] = useState<string | null>(null);
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [isHistoryVisible, setIsHistoryVisible] = useState(false);
    const [isSolving, setIsSolving] = useState(false);
    const [isGraphVisible, setIsGraphVisible] = useState(false);
    const [isFormulasVisible, setIsFormulasVisible] = useState(false);
    const [isLongDivisionVisible, setIsLongDivisionVisible] = useState(false);
    const [isFunctionsVisible, setIsFunctionsVisible] = useState(false);
    const [isSettingsPanelVisible, setIsSettingsPanelVisible] = useState(false);
    const [isAssistantVisible, setIsAssistantVisible] = useState(false);
    const [isCustomThemePanelVisible, setIsCustomThemePanelVisible] = useState(false);

    const [customTheme, setCustomTheme] = useState<ThemeColors | null>(() => {
        const saved = localStorage.getItem('calculator-custom-theme');
        return saved ? JSON.parse(saved) : null;
    });

    const [theme, setTheme] = useState<'light' | 'dark' | 'custom'>(() => {
        const savedTheme = localStorage.getItem('calculator-theme') as 'light' | 'dark' | 'custom' | null;
        if (savedTheme === 'custom' && customTheme) {
            return 'custom';
        }
        return savedTheme === 'light' ? 'light' : 'dark';
    });

    const [roundingPrecision, setRoundingPrecision] = useState<string>(() => {
        return localStorage.getItem('rounding-precision') || 'None';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        
        let themeToApply: ThemeColors;

        if (theme === 'custom' && customTheme) {
            themeToApply = customTheme;
            root.classList.remove('dark'); // Ensure no conflicts
        } else if (theme === 'light') {
            themeToApply = lightTheme;
            root.classList.remove('dark');
        } else {
            themeToApply = darkTheme;
            root.classList.add('dark');
        }
        
        Object.entries(themeToApply).forEach(([key, value]) => {
            root.style.setProperty(key, value);
        });

        localStorage.setItem('calculator-theme', theme);
    }, [theme, customTheme]);

    useEffect(() => {
        localStorage.setItem('rounding-precision', roundingPrecision);
    }, [roundingPrecision]);
    
    const handleSaveCustomTheme = (newTheme: ThemeColors) => {
        setCustomTheme(newTheme);
        setTheme('custom');
        localStorage.setItem('calculator-custom-theme', JSON.stringify(newTheme));
    };


    const handleSolve = async () => {
        if (!/[xyz]/.test(display) || !display.includes('=')) {
            setDisplay('Invalid Equation');
            return;
        }
        setIsSolving(true);
        setFractionResult(null);
        const originalEquation = display;
        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: `Solve this equation: ${originalEquation}`,
                config: {
                    systemInstruction: `You are an algebra solver. When given an equation, solve for the variable(s). Your response must only be the final answer for the variable, for example: 'x = 3'. If there are multiple solutions, separate them with a comma, for example: 'x = 2, x = -2'. Do not include any explanations, apologies, or conversational text. Only provide the result.`,
                },
            });

            const result = response.text.trim();
            const newTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            setDisplay(result);
            setHistory(prev => [{ entry: `${originalEquation} => ${result}`, timestamp: newTimestamp }, ...prev]);
        } catch (error) {
            console.error("Gemini API error:", error);
            setDisplay('Solver Failed');
        } finally {
            setIsSolving(false);
        }
    };
    
    const handleInputAppend = (value: string) => {
        const lastChar = display.slice(-1);

        if (value === '.') {
            const segments = display.split(/[+\-*/^()=,]/);
            if (segments[segments.length - 1].includes('.')) return;
        }

        const allOperators = ['+', '-', '*', '/', '^'];
        if (allOperators.includes(value)) {
             if (display === '0') {
                if (value === '-') setDisplay('-');
                return;
            }
            const lastCharIsOperator = allOperators.includes(lastChar);
            if (lastCharIsOperator) {
                if (value === '-' && ['*', '/', '^', '('].includes(lastChar)) {
                    setDisplay(prev => prev + value);
                    return;
                }
                const secondLastChar = display.length > 1 ? display.slice(-2, -1) : null;
                if (secondLastChar && allOperators.includes(secondLastChar)) {
                    setDisplay(prev => prev.slice(0, -2) + value);
                    return;
                }
                setDisplay(prev => prev.slice(0, -1) + value);
                return;
            }
        }
        
        const isErrorState = ERROR_STATES.includes(display);
        if ((display === '0' && value !== '.') || isErrorState) {
            if (!allOperators.includes(value)) {
                 setDisplay(value);
                 setFractionResult(null);
                 return;
            }
        }
        
        setDisplay(prevDisplay => prevDisplay + value);
    };

    const handleButtonClick = (value: string) => {
        const functions = ['sin', 'cos', 'tan', 'log', 'root', 'nPr', 'nCr'];
        const constants = ['π', 'e'];
        const isErrorState = ERROR_STATES.includes(display);

        if (functions.includes(value) || constants.includes(value) || value === '(') {
            const toAppend = functions.includes(value) ? `${value}(` : value;
            setDisplay(prev => {
                if (prev === '0' || isErrorState) return toAppend;
                const lastChar = prev.slice(-1);
                const needsImplicitMultiplication = /\d|\)|\π|e/.test(lastChar);
                if (needsImplicitMultiplication) return prev + '*' + toAppend;
                return prev + toAppend;
            });
            setFractionResult(null);
            return;
        }

        switch (value) {
            case 'Fn':
                setIsFunctionsVisible(!isFunctionsVisible);
                break;
            case 'Settings':
                setIsSettingsPanelVisible(true);
                break;
            case 'Solve':
                handleSolve();
                break;
            case 'Graph':
                setIsGraphVisible(true);
                break;
            case 'Formulas':
                setIsFormulasVisible(true);
                break;
            case 'Long Division':
                setIsLongDivisionVisible(true);
                break;
            case 'Assistant':
                setIsAssistantVisible(true);
                break;
            case 'C':
                setDisplay('0');
                setFractionResult(null);
                break;
            case 'DEL':
                setDisplay(prev => (prev.length > 1 ? prev.slice(0, -1) : '0'));
                setFractionResult(null);
                break;
            case 'Hist':
                setIsHistoryVisible(true);
                break;
            case '=':
                if (/[xyz]/.test(display)) {
                    const parts = display.split('=');
                    if (parts.length === 2 && parts[0].trim() && parts[1].trim()) {
                        handleSolve();
                    } else if (parts.length === 1) {
                        setDisplay(prevDisplay => prevDisplay + '=');
                    }
                    return;
                }
                
                try {
                    let expression = display;
                    const allOperators = ['+', '-', '*', '/', '^'];
                    const lastChar = expression.slice(-1);
                    if (allOperators.includes(lastChar)) expression = expression.slice(0, -1);
                    if (!expression) { setDisplay('Syntax Error'); return; }

                    const openParen = (expression.match(/\(/g) || []).length;
                    const closeParen = (expression.match(/\)/g) || []).length;
                    if (openParen !== closeParen) { setDisplay('Mismatched Parentheses'); setFractionResult(null); return; }
                    
                    const invalidFuncRegex = /(root|nPr|nCr)\s*\(([^,)]*,\s*|,\s*[^,)]*)\)/g;
                    if (invalidFuncRegex.test(expression)) { setDisplay('Invalid Function Args'); setFractionResult(null); return; }
                    const funcWithWrongArgCount = /(root|nPr|nCr)\s*\(([^,)]*|[^,)]*,[^,)]*,[^,)]*)\)/g;
                    if (funcWithWrongArgCount.test(expression)) { setDisplay('Invalid Function Args'); setFractionResult(null); return; }

                    const sin = (deg: number) => Math.sin((deg * Math.PI) / 180);
                    const cos = (deg: number) => Math.cos((deg * Math.PI) / 180);
                    const tan = (deg: number) => Math.tan((deg * Math.PI) / 180);
                    const log = (n: number) => Math.log10(n);
                    const root = (degree: number, num: number) => Math.pow(num, 1 / degree);
                    const factorial = (n: number): number => {
                        if (n < 0 || n % 1 !== 0) return NaN;
                        if (n === 0 || n === 1) return 1;
                        let result = 1;
                        for (let i = 2; i <= n; i++) { result *= i; }
                        return result;
                    };
                    const nPr = (n: number, r: number): number => {
                        if (n < r || n < 0 || r < 0 || n % 1 !== 0 || r % 1 !== 0) return NaN;
                        return factorial(n) / factorial(n - r);
                    };
                    const nCr = (n: number, r: number): number => {
                        if (n < r || n < 0 || r < 0 || n % 1 !== 0 || r % 1 !== 0) return NaN;
                        return factorial(n) / (factorial(r) * factorial(n - r));
                    };

                    let evalExpression = preprocessPercentages(expression)
                        .replace(/π/g, 'Math.PI')
                        .replace(/\be\b/g, 'Math.E')
                        .replace(/\^/g, '**')
                        .replace(/(\d+(?:\.\d+)?)!/g, (match, p1) => `factorial(${p1})`);

                    // eslint-disable-next-line no-eval
                    let result = eval(evalExpression);
                    
                    if (isNaN(result) || !isFinite(result)) { setDisplay('Domain Error'); setFractionResult(null); return; }

                    if (roundingPrecision !== 'None') {
                        const precision = parseInt(roundingPrecision, 10);
                        result = parseFloat(result.toFixed(precision));
                    }

                    const resultStr = String(result);
                    setDisplay(resultStr);

                    const newTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    setHistory(prev => [{ entry: `${expression} = ${resultStr}`, timestamp: newTimestamp }, ...prev]);

                    if (typeof result === 'number') setFractionResult(decimalToFraction(result));
                    else setFractionResult(null);
                } catch (error) {
                    setDisplay(error instanceof SyntaxError ? 'Syntax Error' : 'Malformed Expression');
                    setFractionResult(null);
                }
                break;
            case '%':
                 setDisplay(prev => prev + '%');
                break;
            case '!':
                setDisplay(prev => prev + '!');
                break;
            default:
                handleInputAppend(value);
                break;
        }
    };

    const operatorButtonClass = "bg-[var(--btn-operator-bg)] hover:bg-[var(--btn-operator-bg-hover)] text-[var(--btn-operator-text)]";
    const solveButtonClass = "bg-[var(--btn-solve-bg)] hover:bg-[var(--btn-solve-bg-hover)] text-[var(--btn-solve-text)]";
    const clearButtonClass = "bg-[var(--btn-clear-bg)] hover:bg-[var(--btn-clear-bg-hover)] text-[var(--btn-clear-text)]";
    const equalsButtonClass = "bg-[var(--btn-equals-bg)] hover:bg-[var(--btn-equals-bg-hover)] text-[var(--btn-equals-text)]";
    const functionButtonClass = "bg-[var(--btn-function-bg)] hover:bg-[var(--btn-function-bg-hover)] text-[var(--btn-function-text)]";

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center font-mono p-4 transition-colors duration-300">
            {isGraphVisible && <GraphingCalculator expression={display} onClose={() => setIsGraphVisible(false)} />}
            {isFormulasVisible && <FormulasSheet onClose={() => setIsFormulasVisible(false)} />}
            {isLongDivisionVisible && <LongDivisionCalculator onClose={() => setIsLongDivisionVisible(false)} ai={ai} />}
            {isAssistantVisible && <AiAssistant onClose={() => setIsAssistantVisible(false)} ai={ai} />}
            {isSettingsPanelVisible && <SettingsPanel 
                onClose={() => setIsSettingsPanelVisible(false)} 
                theme={theme}
                setTheme={setTheme}
                roundingPrecision={roundingPrecision}
                setRoundingPrecision={setRoundingPrecision}
                onOpenCustomThemePanel={() => setIsCustomThemePanelVisible(true)}
                customThemeExists={!!customTheme}
            />}
            {isCustomThemePanelVisible && <CustomThemePanel
                onClose={() => setIsCustomThemePanelVisible(false)}
                onSave={handleSaveCustomTheme}
                initialTheme={customTheme || darkTheme}
            />}
             {isHistoryVisible && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
                        <div className="bg-[var(--bg-modal)] rounded-2xl shadow-2xl p-4 w-full max-w-sm text-[var(--text-primary)]">
                            <div className="flex justify-between items-center mb-2 pb-2 border-b border-[var(--border-primary)]">
                                 <h3 className="text-lg font-bold">History</h3>
                                 <button onClick={() => setHistory([])} className="text-sm bg-red-500 hover:bg-red-600 px-2 py-1 rounded-md text-white">Clear</button>
                                 <button onClick={() => setIsHistoryVisible(false)} className="text-2xl text-gray-500 hover:text-[var(--text-primary)]">&times;</button>
                            </div>
                            <ul className="h-64 overflow-y-auto space-y-2">
                                {history.length > 0 ? (
                                    history.map((item, index) => (
                                        <li key={index} className="flex justify-between items-center text-sm break-words p-1 rounded">
                                            <span className="text-gray-400 dark:text-gray-500 pr-2 flex-shrink-0">{item.timestamp}</span>
                                            <span className="text-right flex-grow">{item.entry}</span>
                                        </li>
                                    ))
                                ) : (
                                    <p className="text-center text-gray-400 pt-20">No history yet.</p>
                                )}
                            </ul>
                        </div>
                    </div>
                )}


            <div className="w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto">
                <div className="bg-[var(--bg-calculator)] rounded-2xl shadow-2xl p-4 space-y-4 overflow-hidden">
                     <div className="relative">
                        <div className="bg-[var(--bg-display)] text-[var(--text-display)] text-right rounded-lg p-4 overflow-x-auto break-all h-28 flex flex-col justify-end">
                           <div className="text-xl text-[var(--text-display-secondary)] min-h-[1.75rem]">
                                {fractionResult || '\u00A0'}
                            </div>
                           <div className="text-4xl break-all">
                                {display}
                           </div>
                        </div>
                         {isSolving && (
                            <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center text-2xl text-white rounded-lg">
                                Solving...
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-5 gap-2">
                        <CalculatorButton label="Fn" onClick={handleButtonClick} className={`${functionButtonClass} ${isFunctionsVisible ? 'bg-indigo-500 dark:bg-indigo-600' : ''}`} />
                        <CalculatorButton label="(" onClick={handleButtonClick} className={functionButtonClass} />
                        <CalculatorButton label=")" onClick={handleButtonClick} className={functionButtonClass} />
                        <CalculatorButton label="DEL" onClick={handleButtonClick} className={operatorButtonClass} />
                        <CalculatorButton label="C" onClick={handleButtonClick} className={clearButtonClass} />
                        
                        <CalculatorButton label="7" onClick={handleButtonClick} />
                        <CalculatorButton label="8" onClick={handleButtonClick} />
                        <CalculatorButton label="9" onClick={handleButtonClick} />
                        <CalculatorButton label="/" onClick={handleButtonClick} className={operatorButtonClass} />
                        <CalculatorButton label="*" onClick={handleButtonClick} className={operatorButtonClass} />
                        
                        <CalculatorButton label="4" onClick={handleButtonClick} />
                        <CalculatorButton label="5" onClick={handleButtonClick} />
                        <CalculatorButton label="6" onClick={handleButtonClick} />
                        <CalculatorButton label="-" onClick={handleButtonClick} className={operatorButtonClass} />
                        <CalculatorButton label="+" onClick={handleButtonClick} className={operatorButtonClass} />

                        <CalculatorButton label="1" onClick={handleButtonClick} />
                        <CalculatorButton label="2" onClick={handleButtonClick} />
                        <CalculatorButton label="3" onClick={handleButtonClick} />
                        <CalculatorButton label="." onClick={handleButtonClick} />
                        <CalculatorButton label="Solve" onClick={handleButtonClick} className={solveButtonClass} />
                        
                        <CalculatorButton label="0" onClick={handleButtonClick} className="col-span-2" />
                        <CalculatorButton label="," onClick={handleButtonClick} />
                        <CalculatorButton label="=" onClick={handleButtonClick} className={`${equalsButtonClass} col-span-2`} />
                    </div>
                    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isFunctionsVisible ? 'max-h-48 opacity-100 pt-4' : 'max-h-0 opacity-0'}`}>
                         <FunctionsPanel onButtonClick={handleButtonClick} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;