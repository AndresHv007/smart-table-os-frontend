import React, { useState } from 'react';
import { Compass, Users, Lock, Sparkles } from 'lucide-react';

const SEAT_META = {
  Norte: { short: 'N', pos: 'col-start-2 row-start-1' },
  Oeste: { short: 'O', pos: 'col-start-1 row-start-2' },
  Este: { short: 'E', pos: 'col-start-3 row-start-2' },
  Sur: { short: 'S', pos: 'col-start-2 row-start-3' },
};

const roles = ['Norte', 'Oeste', 'Este', 'Sur'];

const RoleSelection = ({ setRole, gameState, socket }) => {
  const [error] = useState('');

  const join = (role) => {
    socket.emit('joinRole', { role, profileId: null, name: role });
    setRole(role);
  };

  const occupiedCount = roles.filter((r) => gameState.players[r] !== null).length;

  return (
    <div className="relative flex flex-col items-center justify-center h-full mobile-obsidian-bg p-5 overflow-hidden">
      {/* Ambient luminous orbs */}
      <div className="absolute -top-24 -left-16 w-72 h-72 rounded-full bg-sky-500/20 blur-[100px] pointer-events-none animate-float-slow" />
      <div
        className="absolute -bottom-24 -right-16 w-72 h-72 rounded-full bg-emerald-500/20 blur-[100px] pointer-events-none animate-float-slow"
        style={{ animationDelay: '-6s' }}
      />

      <div className="liquid-glass-modal rounded-[2.25rem] p-6 sm:p-8 w-full max-w-md relative z-10 animate-modal-pop">
        <div className="flex flex-col items-center text-center mb-7">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full liquid-glass-subtle text-xs font-bold uppercase tracking-[0.18em] text-sky-300 mb-3">
            <Sparkles size={13} />
            <span>Smart Table OS</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">Selecciona tu Asiento</h1>
          <p className="text-sm text-slate-400 mt-1.5">
            Elige tu posición alrededor de la mesa ({occupiedCount}/4 ocupados)
          </p>
        </div>

        {/* Spatial Tabletop Compass Layout */}
        <div className="grid grid-cols-3 grid-rows-3 gap-3 items-center justify-items-center w-full">
          {/* Center Miniature Table Emblem */}
          <div className="col-start-2 row-start-2 w-full aspect-square rounded-2xl bg-gradient-to-br from-emerald-500/20 via-emerald-900/30 to-slate-900/60 border border-emerald-400/25 flex flex-col items-center justify-center p-2 shadow-inner">
            <Compass size={26} className="text-emerald-300/90 mb-1" />
            <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-emerald-200/80">
              Mesa
            </span>
          </div>

          {roles.map((r) => {
            const isTaken = gameState.players[r] !== null;
            const occupantName = gameState.names?.[r];
            const meta = SEAT_META[r];

            return (
              <button
                key={r}
                type="button"
                disabled={isTaken}
                onClick={() => join(r)}
                className={`${meta.pos} liquid-btn w-full min-h-[5.5rem] p-3 rounded-2xl flex flex-col items-center justify-center text-center border transition-all ${
                  isTaken
                    ? 'liquid-glass-subtle text-slate-500 border-white/5 cursor-not-allowed opacity-70'
                    : 'bg-gradient-to-b from-sky-500/25 to-indigo-600/25 hover:from-sky-500/40 hover:to-indigo-500/35 border-sky-300/35 text-white shadow-[0_12px_28px_-10px_rgba(56,189,248,0.5)]'
                }`}
              >
                <span className="text-lg font-extrabold tracking-tight leading-tight">{r}</span>
                {isTaken ? (
                  <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 max-w-full truncate">
                    <Lock size={11} className="shrink-0" />
                    <span className="truncate">{occupantName && occupantName !== r ? occupantName : 'Ocupado'}</span>
                  </span>
                ) : (
                  <span className="mt-1 text-[11px] font-bold text-sky-300/90">Disponible</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-center gap-2 text-xs text-slate-400">
          <Users size={14} className="text-slate-400" />
          <span>Tu orientación se sincroniza con la pantalla principal</span>
        </div>

        {error && (
          <div className="mt-4 text-rose-300 bg-rose-500/15 px-4 py-2.5 rounded-xl border border-rose-400/30 text-sm text-center font-medium">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleSelection;
