import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// Matrix Rain Effect Component
export const MatrixRain: React.FC<{ className?: string; intensity?: 'low' | 'medium' | 'high' }> = ({ 
  className = '', 
  intensity = 'medium' 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(0);
    
    const dropSpeed = intensity === 'low' ? 50 : intensity === 'medium' ? 35 : 20;
    
    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#00ff41';
      ctx.font = `${fontSize}px monospace`;
      
      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };
    
    const interval = setInterval(draw, dropSpeed);
    return () => clearInterval(interval);
  }, [intensity]);
  
  return (
    <canvas
      ref={canvasRef}
      className={cn('absolute inset-0 opacity-30', className)}
      style={{ background: 'transparent' }}
    />
  );
};

// Terminal-style Loading Component
export const TerminalLoader: React.FC<{ 
  text?: string; 
  className?: string;
  speed?: number;
}> = ({ 
  text = 'CONNECTING TO ESP32...', 
  className = '',
  speed = 100
}) => {
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index <= text.length) {
        setDisplayText(text.slice(0, index));
        index++;
      } else {
        setDisplayText('');
        index = 0;
      }
    }, speed);
    
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    
    return () => {
      clearInterval(interval);
      clearInterval(cursorInterval);
    };
  }, [text, speed]);
  
  return (
    <div className={cn('font-mono text-green-400 text-sm', className)}>
      <span>{displayText}</span>
      <span className={`${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity`}>_</span>
    </div>
  );
};

// Glitch Effect Component
export const GlitchText: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
}> = ({ 
  children, 
  className = '',
  intensity = 'medium'
}) => {
  const [isGlitching, setIsGlitching] = useState(false);
  
  useEffect(() => {
    const glitchInterval = intensity === 'low' ? 3000 : intensity === 'medium' ? 2000 : 1000;
    const interval = setInterval(() => {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 200);
    }, glitchInterval);
    
    return () => clearInterval(interval);
  }, [intensity]);
  
  return (
    <div className={cn('relative', className)}>
      <div className={`${isGlitching ? 'animate-pulse' : ''} transition-all duration-200`}>
        {children}
      </div>
      {isGlitching && (
        <>
          <div 
            className="absolute inset-0 text-red-500 opacity-70"
            style={{ 
              transform: 'translate(-2px, 0)',
              clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 45%)'
            }}
          >
            {children}
          </div>
          <div 
            className="absolute inset-0 text-blue-500 opacity-70"
            style={{ 
              transform: 'translate(2px, 0)',
              clipPath: 'polygon(0 55%, 100% 55%, 100% 100%, 0 100%)'
            }}
          >
            {children}
          </div>
        </>
      )}
    </div>
  );
};

// Hacker-style Data Unavailable Component
export const DataUnavailable: React.FC<{ 
  title: string;
  message?: string;
  className?: string;
  showMatrix?: boolean;
}> = ({ 
  title, 
  message = 'ESP32 MODULE OFFLINE',
  className = '',
  showMatrix = true
}) => {
  return (
    <div className={cn('relative bg-black/80 border border-red-500/50 rounded-lg p-6 overflow-hidden', className)}>
      {showMatrix && <MatrixRain intensity="low" />}
      
      <div className="relative z-10 text-center">
        <GlitchText className="text-red-400 text-lg font-bold mb-2">
          {title}
        </GlitchText>
        
        <TerminalLoader 
          text={message}
          className="mb-4"
          speed={80}
        />
        
        <div className="grid grid-cols-3 gap-1 mb-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <motion.div
              key={i}
              className="h-2 bg-red-500/30 rounded"
              animate={{
                opacity: [0.3, 1, 0.3],
                backgroundColor: ['rgba(239, 68, 68, 0.3)', 'rgba(239, 68, 68, 0.8)', 'rgba(239, 68, 68, 0.3)']
              }}
              transition={{
                duration: 2,
                delay: i * 0.1,
                repeat: Infinity,
                repeatType: 'reverse'
              }}
            />
          ))}
        </div>
        
        <div className="text-xs text-red-300 font-mono">
          STATUS: DISCONNECTED
        </div>
      </div>
    </div>
  );
};

// Scanning Animation Component
export const ScanningAnimation: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent"
        animate={{
          x: ['-100%', '100%']
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-400/10 to-transparent" />
    </div>
  );
};

// Binary Rain Component
export const BinaryRain: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [binaryStrings, setBinaryStrings] = useState<string[]>([]);
  
  useEffect(() => {
    const generateBinary = () => {
      const strings = Array.from({ length: 20 }, () => 
        Array.from({ length: 8 }, () => Math.random() > 0.5 ? '1' : '0').join('')
      );
      setBinaryStrings(strings);
    };
    
    generateBinary();
    const interval = setInterval(generateBinary, 500);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className={cn('font-mono text-xs text-green-400/50 space-y-1', className)}>
      <AnimatePresence mode="wait">
        {binaryStrings.map((binary, index) => (
          <motion.div
            key={`${binary}-${index}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: index * 0.05 }}
          >
            {binary}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Hacker-style Progress Bar
export const HackerProgress: React.FC<{ 
  value: number;
  label?: string;
  className?: string;
}> = ({ value, label = 'LOADING', className = '' }) => {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-between text-xs font-mono text-green-400">
        <span>{label}</span>
        <span>{Math.round(value)}%</span>
      </div>
      <div className="h-2 bg-black border border-green-400/50 rounded overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-green-400 to-cyan-400"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <div className="text-xs font-mono text-green-400/70">
        {'█'.repeat(Math.floor(value / 5))}{'░'.repeat(20 - Math.floor(value / 5))}
      </div>
    </div>
  );
};
