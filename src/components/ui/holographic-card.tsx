import React from 'react';
import { cn } from '@/lib/utils';

interface HolographicCardProps {
  variant?: 'default' | 'glow' | 'neon' | 'pulse';
  intensity?: 'low' | 'medium' | 'high';
  children: React.ReactNode;
  className?: string;
}

export const HolographicCard: React.FC<HolographicCardProps> = ({
  variant = 'default',
  intensity = 'medium',
  className,
  children,
}) => {
  const getVariantClasses = () => {
    const baseClasses = 'relative overflow-hidden rounded-xl border backdrop-blur-sm';
    
    switch (variant) {
      case 'glow':
        return cn(
          baseClasses,
          'bg-slate-900/50 border-blue-500/30',
          'shadow-lg shadow-blue-500/20',
          intensity === 'high' && 'shadow-xl shadow-blue-500/30',
          intensity === 'low' && 'shadow-md shadow-blue-500/10'
        );
      
      case 'neon':
        return cn(
          baseClasses,
          'bg-slate-900/60 border-cyan-400/40',
          'shadow-lg shadow-cyan-400/25',
          intensity === 'high' && 'shadow-xl shadow-cyan-400/40',
          intensity === 'low' && 'shadow-md shadow-cyan-400/15'
        );
      
      case 'pulse':
        return cn(
          baseClasses,
          'bg-slate-900/50 border-purple-500/30',
          'shadow-lg shadow-purple-500/20',
          intensity === 'high' && 'shadow-xl shadow-purple-500/30',
          intensity === 'low' && 'shadow-md shadow-purple-500/10'
        );
      
      default:
        return cn(
          baseClasses,
          'bg-slate-900/50 border-slate-700/50',
          'shadow-lg shadow-slate-900/20'
        );
    }
  };



  return (
    <div
      className={cn(getVariantClasses(), className)}
    >
      {/* Holographic overlay effect */}
      <div className="absolute inset-0 opacity-30">
        <div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 -translate-x-full"
          style={{
            animation: variant !== 'default' ? 'shimmer 3s infinite' : 'none',
          }}
        />
      </div>
      
      {/* Border glow effect */}
      {variant !== 'default' && (
        <div className="absolute inset-0 rounded-xl">
          <div 
            className={cn(
              'absolute inset-0 rounded-xl',
              variant === 'glow' && 'bg-gradient-to-r from-blue-500/20 via-transparent to-blue-500/20',
              variant === 'neon' && 'bg-gradient-to-r from-cyan-400/20 via-transparent to-cyan-400/20',
              variant === 'pulse' && 'bg-gradient-to-r from-purple-500/20 via-transparent to-purple-500/20'
            )}
            style={{
              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              maskComposite: 'xor',
              padding: '1px',
            }}
          />
        </div>
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Corner accents */}
      {variant !== 'default' && (
        <>
          <div
            className={cn(
              'absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 rounded-tl-xl',
              variant === 'glow' && 'border-blue-400/60',
              variant === 'neon' && 'border-cyan-400/60',
              variant === 'pulse' && 'border-purple-400/60'
            )}
          />
          <div
            className={cn(
              'absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 rounded-tr-xl',
              variant === 'glow' && 'border-blue-400/60',
              variant === 'neon' && 'border-cyan-400/60',
              variant === 'pulse' && 'border-purple-400/60'
            )}
          />
          <div
            className={cn(
              'absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 rounded-bl-xl',
              variant === 'glow' && 'border-blue-400/60',
              variant === 'neon' && 'border-cyan-400/60',
              variant === 'pulse' && 'border-purple-400/60'
            )}
          />
          <div
            className={cn(
              'absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 rounded-br-xl',
              variant === 'glow' && 'border-blue-400/60',
              variant === 'neon' && 'border-cyan-400/60',
              variant === 'pulse' && 'border-purple-400/60'
            )}
          />
        </>
      )}
    </div>
  );
};

// Add the shimmer animation to global CSS
const shimmerStyles = `
  @keyframes shimmer {
    0% {
      transform: translateX(-100%) skewX(-12deg);
    }
    100% {
      transform: translateX(200%) skewX(-12deg);
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = shimmerStyles;
  document.head.appendChild(styleSheet);
}
