import React, { useState, useEffect } from 'react';
import { Palette, Lock, MapPin } from 'lucide-react';

const COLORS = [
  {
    id: 'red',
    name: 'Rojo',
    orb: 'from-rose-400 via-red-500 to-red-700',
    card: 'from-rose-500/30 to-red-700/20 border-rose-300/40 hover:border-rose-300/75 shadow-[0_14px_30px_-10px_rgba(244,63,94,0.55)]',
    text: 'text-rose-100',
  },
  {
    id: 'blue',
    name: 'Azul',
    orb: 'from-sky-400 via-blue-500 to-blue-700',
    card: 'from-sky-500/30 to-blue-700/20 border-sky-300/40 hover:border-sky-300/75 shadow-[0_14px_30px_-10px_rgba(56,189,248,0.55)]',
    text: 'text-sky-100',
  },
  {
    id: 'green',
    name: 'Verde',
    orb: 'from-emerald-400 via-green-500 to-emerald-700',
    card: 'from-emerald-500/30 to-green-700/20 border-emerald-300/40 hover:border-emerald-300/75 shadow-[0_14px_30px_-10px_rgba(16,185,129,0.55)]',
    text: 'text-emerald-100',
  },
  {
    id: 'yellow',
    name: 'Amarillo',
    orb: 'from-amber-200 via-yellow-400 to-amber-500',
    card: 'from-amber-400/30 to-yellow-600/20 border-amber-200/50 hover:border-amber-200/85 shadow-[0_14px_30px_-10px_rgba(250,204,21,0.5)]',
    text: 'text-amber-100',
  },
];

const ColorSelection = ({ gameState, socket, role }) => {
  const [error, setError] = useState('');

  useEffect(() => {
    if (!socket) return;
    const errorHandler = (msg) => setError(msg);
    socket.on('errorMsg', errorHandler);
    return () => socket.off('errorMsg', errorHandler);
  }, [socket]);

  const takenColors = Object.values(gameState.colors).filter((c) => c !== null);

  const handleSelectColor = (colorId) => {
    setError('');
    socket.emit('selectColor', colorId);
  };

  return (
    <div className="relative flex flex-col items-center justify-center h-full mobile-obsidian-bg p-5 overflow-hidden">
      {/* Ambient chromatic glow */}
      <div className="absolute -top-24 right-0 w-72 h-72 rounded-full bg-indigo-500/20 blur-[110px] pointer-events-none animate-float-slow" />
      <div
        className="absolute -bottom-24 left-0 w-72 h-72 rounded-full bg-rose-500/15 blur-[110px] pointer-events-none animate-float-slow"
        style={{ animationDelay: '-7s' }}
      />

      <div className="liquid-glass-modal rounded-[2.25rem] p-6 sm:p-8 w-full max-w-md relative z-10 animate-modal-pop">
        <div className="flex flex-col items-center text-center mb-7">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full liquid-glass-subtle text-xs font-bold uppercase tracking-[0.16em] text-slate-200 mb-3">
            <MapPin size={13} className="text-sky-300" />
            <span>Posición: {role}</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
            <Palette size={26} className="text-sky-300" />
            <span>Elige tu Color</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1.5">
            Este color identificará tu ficha y turnos en la mesa.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full">
          {COLORS.map((c) => {
            const isTaken = takenColors.includes(c.id);
            return (
              <button
                key={c.id}
                type="button"
                disabled={isTaken}
                onClick={() => handleSelectColor(c.id)}
                className={`liquid-btn p-5 rounded-2xl font-bold transition-all flex flex-col items-center justify-center gap-3 border ${
                  isTaken
                    ? 'liquid-glass-subtle text-slate-500 cursor-not-allowed border-white/5 opacity-60'
                    : `bg-gradient-to-br ${c.card} ${c.text}`
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full bg-gradient-to-br ${c.orb} shadow-[inset_0_2px_4px_rgba(255,255,255,0.55),0_8px_18px_rgba(0,0,0,0.4)] flex items-center justify-center ${
                    isTaken ? 'grayscale opacity-50' : ''
                  }`}
                >
                  {isTaken && <Lock size={16} className="text-white" />}
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-lg font-extrabold tracking-tight">{c.name}</span>
                  {isTaken && <span className="text-[11px] font-semibold text-slate-400">En uso</span>}
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Solo un jugador puede elegir cada color.
        </p>

        {error && (
          <div className="mt-4 text-rose-300 bg-rose-500/15 px-4 py-2.5 rounded-xl border border-rose-400/30 text-sm text-center font-medium">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default ColorSelection;
