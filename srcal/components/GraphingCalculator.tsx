import React, { useRef, useEffect, useState } from 'react';
import { CalculatorButton } from './CalculatorButton';

interface GraphingCalculatorProps {
  expression: string;
  onClose: () => void;
}

export const GraphingCalculator: React.FC<GraphingCalculatorProps> = ({ expression, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const initialExpression = expression.startsWith('y=') 
      ? expression.substring(2) 
      : (expression === '0' || /^[A-Za-z\s]+$/.test(expression)) ? '' : expression;

  const [localExpression, setLocalExpression] = useState(initialExpression);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const theme = localStorage.getItem('calculator-theme') || 'dark';
    const gridColor = theme === 'dark' ? '#4a5568' : '#e2e8f0';
    const axisColor = theme === 'dark' ? '#e2e8f0' : '#2d3748';
    const plotColor = '#ec4899';

    const width = canvas.width;
    const height = canvas.height;
    const scale = 20;
    const originX = width / 2;
    const originY = height / 2;

    let funcBody = localExpression.trim();
    if (!funcBody) {
        drawGrid();
        return;
    }
    
    funcBody = funcBody
      .replace(/π/g, 'Math.PI')
      .replace(/\be\b/g, 'Math.E') // Use word boundary to not conflict with scientific notation
      .replace(/\^/g, '**')
      .replace(/sin\(/g, 'Math.sin(Math.PI/180 *')
      .replace(/cos\(/g, 'Math.cos(Math.PI/180 *')
      .replace(/tan\(/g, 'Math.tan(Math.PI/180 *')
      .replace(/log\(/g, 'Math.log10(')
      .replace(/root\(([^,]+),([^)]+)\)/g, 'Math.pow($2, 1/$1)');

    let func: (x: number) => number;
    try {
        func = new Function('x', `return ${funcBody}`) as (x: number) => number;
        func(1); 
    } catch (e) {
        drawGrid();
        return;
    }

    function drawGrid() {
        ctx.clearRect(0, 0, width, height);
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 0.5;
        for (let i = originX + scale; i < width; i += scale) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke(); }
        for (let i = originX - scale; i > 0; i -= scale) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke(); }
        for (let i = originY + scale; i < height; i += scale) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke(); }
        for (let i = originY - scale; i > 0; i -= scale) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke(); }
        ctx.strokeStyle = axisColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, originY); ctx.lineTo(width, originY);
        ctx.moveTo(originX, 0); ctx.lineTo(originX, height);
        ctx.stroke();
    }
    
    drawGrid();
    ctx.strokeStyle = plotColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    let firstPoint = true;
    for (let pixelX = 0; pixelX < width; pixelX++) {
      try {
        const x = (pixelX - originX) / scale;
        const y = func(x);
        if (isNaN(y) || !isFinite(y)) { firstPoint = true; continue; }
        const pixelY = originY - y * scale;
        if (firstPoint) { ctx.moveTo(pixelX, pixelY); firstPoint = false; }
        else { ctx.lineTo(pixelX, pixelY); }
      } catch (e) { firstPoint = true; }
    }
    ctx.stroke();

  }, [localExpression]);

  const handleGraphButtonClick = (value: string) => {
    if (value === 'C') {
        setLocalExpression('');
    } else if (value === 'DEL') {
        setLocalExpression(prev => prev.length > 0 ? prev.slice(0, -1) : '');
    } else {
        const lastChar = localExpression.slice(-1);
        const operators = ['+', '-', '*', '/', '^'];
        if (operators.includes(value) && operators.includes(lastChar)) {
            setLocalExpression(prev => prev.slice(0, -1) + value);
            return;
        }
        setLocalExpression(prev => prev + value);
    }
  };
  
  const numpadButtonClass = "h-12";
  const opButtonClass = `bg-orange-400 dark:bg-orange-500 hover:bg-orange-500 dark:hover:bg-orange-600 text-white ${numpadButtonClass}`;
  const clearButtonClass = `bg-red-400 dark:bg-red-500 hover:bg-red-500 dark:hover:bg-red-600 text-white ${numpadButtonClass}`;
  const funcButtonClass = `bg-gray-300 dark:bg-gray-500 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-900 dark:text-white ${numpadButtonClass}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 font-mono">
       <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-4xl flex gap-6">
          {/* Left Side: Graph */}
          <div className='flex-grow'>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Graphing Calculator</h2>
              <button onClick={onClose} className="text-2xl text-gray-500 hover:text-gray-900 dark:hover:text-white flex-shrink-0">&times;</button>
            </div>
            <canvas ref={canvasRef} width="500" height="500" className="bg-gray-50 dark:bg-gray-900 rounded-lg w-full aspect-square"></canvas>
          </div>
          {/* Right Side: Numpad */}
          <div className='w-full max-w-xs'>
              <div className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-left rounded-lg p-3 mb-4 overflow-x-auto break-all min-h-[50px] flex items-center">
                  <span className='text-2xl text-gray-500 dark:text-gray-400 mr-2'>y =</span>
                  <span className="text-2xl break-all flex-grow text-right">{localExpression || ''}</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                <CalculatorButton label="7" onClick={handleGraphButtonClick} className={numpadButtonClass}/>
                <CalculatorButton label="8" onClick={handleGraphButtonClick} className={numpadButtonClass}/>
                <CalculatorButton label="9" onClick={handleGraphButtonClick} className={numpadButtonClass}/>
                <CalculatorButton label="DEL" onClick={handleGraphButtonClick} className={opButtonClass}/>
                <CalculatorButton label="C" onClick={handleGraphButtonClick} className={clearButtonClass}/>
                
                <CalculatorButton label="4" onClick={handleGraphButtonClick} className={numpadButtonClass}/>
                <CalculatorButton label="5" onClick={handleGraphButtonClick} className={numpadButtonClass}/>
                <CalculatorButton label="6" onClick={handleGraphButtonClick} className={numpadButtonClass}/>
                <CalculatorButton label="*" onClick={handleGraphButtonClick} className={opButtonClass}/>
                <CalculatorButton label="/" onClick={handleGraphButtonClick} className={opButtonClass}/>

                <CalculatorButton label="1" onClick={handleGraphButtonClick} className={numpadButtonClass}/>
                <CalculatorButton label="2" onClick={handleGraphButtonClick} className={numpadButtonClass}/>
                <CalculatorButton label="3" onClick={handleGraphButtonClick} className={numpadButtonClass}/>
                <CalculatorButton label="+" onClick={handleGraphButtonClick} className={opButtonClass}/>
                <CalculatorButton label="-" onClick={handleGraphButtonClick} className={opButtonClass}/>
                
                <CalculatorButton label="0" onClick={handleGraphButtonClick} className={numpadButtonClass}/>
                <CalculatorButton label="." onClick={handleGraphButtonClick} className={numpadButtonClass}/>
                <CalculatorButton label="(" onClick={handleGraphButtonClick} className={funcButtonClass}/>
                <CalculatorButton label=")" onClick={handleGraphButtonClick} className={funcButtonClass}/>
                <CalculatorButton label="^" onClick={handleGraphButtonClick} className={opButtonClass}/>

                <CalculatorButton label="x" onClick={handleGraphButtonClick} className={funcButtonClass}/>
                <CalculatorButton label="y" onClick={handleGraphButtonClick} className={funcButtonClass}/>
                <CalculatorButton label="z" onClick={handleGraphButtonClick} className={funcButtonClass}/>
                <CalculatorButton label="π" onClick={handleGraphButtonClick} className={funcButtonClass}/>
                <CalculatorButton label="e" onClick={handleGraphButtonClick} className={funcButtonClass}/>
              </div>
          </div>
       </div>
    </div>
  );
};
