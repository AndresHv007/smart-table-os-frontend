import React from 'react';

const DiceShape = ({ faces, value, isRolling, idx, isSpecial }) => {
  let clipPath = 'none';
  let borderRadius = '1.25rem';

  if (faces === 4) {
    clipPath = 'polygon(50% 2%, 2% 96%, 98% 96%)';
    borderRadius = '0';
  } else if (faces === 8) {
    clipPath = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
    borderRadius = '0';
  } else if (faces === 10 || faces === 12 || faces === 20) {
    clipPath = 'polygon(50% 0%, 96% 25%, 96% 75%, 50% 100%, 4% 75%, 4% 25%)';
    borderRadius = '0';
  }

  const baseColors = isSpecial
    ? 'from-amber-300 via-yellow-400 to-amber-600 text-amber-950'
    : 'from-rose-500 via-red-600 to-red-800 text-white';

  const wrapperDropShadow = isSpecial
    ? 'drop-shadow(0 0 28px rgba(250, 204, 21, 0.8)) drop-shadow(0 14px 20px rgba(0, 0, 0, 0.55))'
    : 'drop-shadow(0 14px 22px rgba(0, 0, 0, 0.55)) drop-shadow(0 0 14px rgba(239, 68, 68, 0.25))';

  const glowEffect = isSpecial && !isRolling ? 'animate-pulse' : '';
  const rollEffect = isRolling ? 'animate-bounce' : 'transition-transform duration-300 hover:scale-105';
  const yOffset = faces === 4 ? 'pt-7' : '';

  return (
    <div
      className={`relative inline-flex flex-col items-center justify-center ${rollEffect} ${glowEffect}`}
      style={{
        animationDelay: `${(idx % 3) * 0.09}s`,
      }}
    >
      <div className="relative inline-flex items-center justify-center" style={{ filter: wrapperDropShadow }}>
        {/* Special golden halo */}
        {isSpecial && !isRolling && (
          <div
            className="absolute -inset-2 bg-yellow-400/50 blur-xl pointer-events-none"
            style={{ clipPath, borderRadius }}
          />
        )}

        {/* Polygon Die Body */}
        <div
          className={`relative flex items-center justify-center w-28 h-28 bg-gradient-to-br ${baseColors} font-black text-5xl tabular-nums select-none`}
          style={{
            clipPath,
            borderRadius,
            boxShadow:
              clipPath === 'none'
                ? isSpecial
                  ? 'inset 0 2px 0 rgba(255,255,255,0.65), inset 0 -4px 10px rgba(146,64,14,0.5), 0 0 0 2px rgba(254,240,138,0.75)'
                  : 'inset 0 2px 0 rgba(255,255,255,0.38), inset 0 -4px 10px rgba(69,10,10,0.6), 0 0 0 2px rgba(255,255,255,0.2)'
                : undefined,
          }}
        >
          {/* Top crystalline sheen overlay */}
          <div
            className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/30 via-white/5 to-black/25"
            style={{ clipPath, borderRadius }}
          />

          {/* Inner subtle facet highlight */}
          <div
            className="absolute inset-[3px] pointer-events-none border border-white/25"
            style={{
              borderRadius: clipPath === 'none' ? '1.05rem' : '0',
              display: clipPath === 'none' ? 'block' : 'none',
            }}
          />

          <span className={`relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)] ${yOffset}`}>
            {value > 0 ? value : '–'}
          </span>
        </div>
      </div>

      {/* Die-face pill placed outside polygon clipPath so D4/D8 never clip or collide */}
      {faces && faces !== 6 && (
        <span className="mt-1.5 px-2 py-0.5 rounded-full liquid-glass-subtle text-[10px] font-extrabold uppercase tracking-widest text-slate-200/90 leading-none select-none">
          D{faces}
        </span>
      )}
    </div>
  );
};

export default DiceShape;
