import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface RobotFaceProps {
  expression: 'happy' | 'sad' | 'surprised' | 'angry' | 'neutral' | 'blink' | 'thinking' | 'excited' | 'listening';
  isActive: boolean;
}

const faceVariants = {
  breathing: {
    scale: [1, 1.02, 1],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" as const }
  }
};

const eyeVariants = {
  neutral: { pathLength: 1, d: "M -12,0 a 12,12 0 1,0 24,0 a 12,12 0 1,0 -24,0" },
  happy: { pathLength: 1, d: "M -15,5 C -10,-5 10,-5 15,5" },
  excited: { pathLength: 1, d: "M -15,0 a 15,15 0 1,0 30,0 a 15,15 0 1,0 -30,0" },
  sad: { pathLength: 1, d: "M -15,-5 C -10,5 10,5 15,-5" },
  angry: { pathLength: 1, d: "M -15,-5 L 15,5 M -15,5 L 15,-5" },
  surprised: { pathLength: 1, d: "M -14,0 a 14,14 0 1,0 28,0 a 14,14 0 1,0 -28,0" },
  thinking: { pathLength: 1, d: "M -10,0 L 10,0" },
  listening: { pathLength: 1, d: "M -13,0 a 13,13 0 1,0 26,0 a 13,13 0 1,0 -26,0" },
  blink: { pathLength: 1, d: "M -15,0 L 15,0" },
};

const mouthVariants = {
  neutral: { d: "M -20,30 L 20,30" },
  happy: { d: "M -25,25 Q 0,45 25,25" },
  excited: { d: "M -25,25 Q 0,45 25,25" },
  sad: { d: "M -25,35 Q 0,15 25,35" },
  angry: { d: "M -25,30 L 25,30" },
  surprised: { d: "M 0,30 a 12 12 0 1 0 0.001 0" },
  thinking: { d: "M -10,30 Q 0,25 10,30" },
  listening: { d: "M -15,30 Q 0,35 15,30" },
};

const cheekVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
};

export const RobotFace: React.FC<RobotFaceProps> = ({ expression, isActive }) => {
  const [currentExpression, setCurrentExpression] = useState(expression);

  useEffect(() => {
    if (expression === 'blink') {
      setTimeout(() => setCurrentExpression('neutral'), 200);
    } else {
      setCurrentExpression(expression);
    }
  }, [expression]);
  
  // Auto-blink logic
  useEffect(() => {
    let blinkTimeout: NodeJS.Timeout;
    const scheduleBlink = () => {
      blinkTimeout = setTimeout(() => {
        setCurrentExpression('blink');
        setTimeout(() => setCurrentExpression(expression), 150);
        scheduleBlink();
      }, 3000 + Math.random() * 4000);
    };
    scheduleBlink();
    return () => clearTimeout(blinkTimeout);
  }, [expression]);

  const showCheeks = ['happy', 'excited'].includes(currentExpression);

  return (
    <div className="relative w-full aspect-square mx-auto">
      <motion.div variants={faceVariants} animate="breathing" className="w-full h-full">
        <svg viewBox="-60 -60 120 120" className={`w-full h-full ${isActive ? 'pulse-glow' : ''}`}>
          {/* Face Outline */}
          <motion.circle cx="0" cy="0" r="58" fill="none" stroke="rgba(59, 130, 246, 0.5)" strokeWidth="1.5" />
          
          {/* Eyes */}
          <g transform="translate(-25, -10)">
            <motion.path
              variants={eyeVariants}
              initial={false}
              animate={currentExpression}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              stroke="rgb(59, 130, 246)" strokeWidth="3" fill="none" strokeLinecap="round"
            />
          </g>
          <g transform="translate(25, -10)">
            <motion.path
              variants={eyeVariants}
              initial={false}
              animate={currentExpression}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              stroke="rgb(59, 130, 246)" strokeWidth="3" fill="none" strokeLinecap="round"
            />
          </g>

          {/* Mouth */}
          <g>
            <motion.path
              variants={mouthVariants}
              initial={false}
              animate={currentExpression}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              stroke="rgb(59, 130, 246)" strokeWidth="2" fill="none" strokeLinecap="round"
            />
          </g>

          {/* Cheeks */}
          <AnimatePresence>
            {showCheeks && (
              <>
                <motion.circle
                  cx="-35" cy="15" r="8" fill="rgba(236, 72, 153, 0.6)"
                  variants={cheekVariants} initial="hidden" animate="visible" exit="hidden"
                />
                <motion.circle
                  cx="35" cy="15" r="8" fill="rgba(236, 72, 153, 0.6)"
                  variants={cheekVariants} initial="hidden" animate="visible" exit="hidden"
                />
              </>
            )}
          </AnimatePresence>

          {/* Listening Indicator */}
          <AnimatePresence>
            {currentExpression === 'listening' && (
              <motion.circle cx="0" cy="0" r="58" fill="none" stroke="rgba(167, 139, 250, 0.7)" strokeWidth="2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                exit={{ pathLength: 0, opacity: 0 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            )}
          </AnimatePresence>
        </svg>
      </motion.div>
      <div className="absolute bottom-[-1rem] left-1/2 -translate-x-1/2 text-center">
        <div className="text-sm font-medium text-blue-300 capitalize">{expression}</div>
      </div>
    </div>
  );
};
