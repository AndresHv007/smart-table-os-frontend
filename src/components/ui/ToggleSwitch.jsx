import React from 'react';

const ACCENT_CLASSES = {
  emerald: 'bg-emerald-500/90 border-emerald-300/60 shadow-[0_0_16px_rgba(16,185,129,0.45)]',
  indigo: 'bg-indigo-500/90 border-indigo-300/60 shadow-[0_0_16px_rgba(99,102,241,0.45)]',
  amber: 'bg-amber-500/90 border-amber-300/60 shadow-[0_0_16px_rgba(245,158,11,0.45)]',
};

const ToggleSwitch = ({
  checked = false,
  onChange,
  label,
  accent = 'emerald',
  size = 'md',
  disabled = false,
}) => {
  const isSmall = size === 'sm';
  const trackSize = isSmall ? 'w-12 h-7' : 'w-14 h-8';
  const knobSize = isSmall ? 'w-5 h-5' : 'w-6 h-6';
  const knobShift = isSmall ? 'translate-x-5' : 'translate-x-6';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={Boolean(checked)}
      aria-label={label}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onChange?.(!checked);
      }}
      className={`liquid-btn ${trackSize} flex shrink-0 items-center rounded-full p-1 border transition-all duration-200 ${
        checked
          ? ACCENT_CLASSES[accent] || ACCENT_CLASSES.emerald
          : 'bg-slate-800/80 border-white/15 shadow-inner'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`${knobSize} rounded-full bg-gradient-to-b from-white to-slate-200 shadow-[0_2px_6px_rgba(0,0,0,0.45)] transform transition-transform duration-200 ease-out ${
          checked ? knobShift : 'translate-x-0'
        }`}
      />
    </button>
  );
};

export default ToggleSwitch;
