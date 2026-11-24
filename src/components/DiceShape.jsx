import React from 'react';

const DiceShape = ({ faces, value, isRolling, idx, isSpecial }) => {
  let clipPath = 'none';
  let borderRadius = '1rem';
  
  if (faces === 4) {
    clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
    borderRadius = '0';
  } else if (faces === 8) {
    clipPath = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
    borderRadius = '0';
  } else if (faces === 10 || faces === 12 || faces === 20) {
    clipPath = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';
    borderRadius = '0';
  }

  // Golden styles if special
  const baseColors = isSpecial 
    ? 'from-yellow-400 to-yellow-600 border-yellow-200 text-white shadow-[0_0_50px_rgba(250,204,21,1)]' 
    : 'from-red-500 to-red-700 border-red-800 text-white';

  const glowEffect = isSpecial && !isRolling ? 'animate-pulse' : '';
  const rollEffect = isRolling ? 'animate-bounce' : '';
  
  const yOffset = faces === 4 ? 'pt-8' : ''; // D4 text needs to be lower due to triangle

  return (
    <div 
      className={`relative flex items-center justify-center w-28 h-28 bg-gradient-to-br ${baseColors} font-black text-6xl border-4 shadow-2xl ${rollEffect} ${glowEffect}`}
      style={{ 
        clipPath, 
        borderRadius,
        animationDelay: `${(idx % 3) * 0.1}s`
      }}
    >
      <span className={yOffset}>{value > 0 ? value : '-'}</span>
      
      {/* If special, add a glowing halo behind */}
      {isSpecial && (
        <div 
          className="absolute inset-0 bg-yellow-400 blur-xl opacity-50 z-[-1]"
          style={{ clipPath, borderRadius }}
        ></div>
      )}
    </div>
  );
};

export default DiceShape;
