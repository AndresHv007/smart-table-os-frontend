import React from 'react';
import { ArrowLeft, Timer } from 'lucide-react';
import ToggleSwitch from './ui/ToggleSwitch';
import { useScrollEffects } from '../hooks/useScrollEffects';

const HostSettingsTimer = ({ gameState, socket, onBack }) => {
  const timer = gameState.modules.timer;
  const { scrollRef, isScrolled, scrollProgress, hasOverflow } = useScrollEffects([]);

  const updateTimer = (updates) => {
    socket.emit('updateModules', { timer: { ...timer, ...updates } });
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div
        className={`relative z-20 px-5 liquid-header ${
          isScrolled ? 'liquid-header-scrolled py-3' : 'py-4'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={onBack}
            aria-label="Volver"
            className="liquid-btn liquid-btn-glass w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-slate-300 hover:text-white"
          >
            <ArrowLeft size={19} />
          </button>
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
              <Timer size={17} />
            </span>
            <h2 className="text-lg font-extrabold text-white tracking-tight truncate">
              Configurar Temporizador
            </h2>
          </div>
        </div>
        {hasOverflow && (
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 origin-left transition-transform duration-75"
              style={{ transform: `scaleX(${Math.max(0.03, scrollProgress)})` }}
            />
          </div>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 liquid-scroll px-5 pt-5 pb-16 space-y-4">
        <div className="scroll-reveal-card liquid-glass p-5 rounded-2xl">
          <label className="block text-slate-200 font-bold text-sm mb-2.5">
            Segundos por Turno
          </label>
          <input
            type="number"
            min="1"
            className="liquid-input w-full rounded-xl p-3 text-center text-lg font-extrabold tabular-nums"
            value={timer.seconds}
            onChange={(e) => updateTimer({ seconds: parseInt(e.target.value, 10) || 0 })}
          />
        </div>

        <div className="scroll-reveal-card liquid-glass p-5 rounded-2xl divide-y divide-white/10">
          <div className="flex items-center justify-between gap-4 pb-4">
            <div>
              <div className="text-white font-bold text-sm">Inicio Automático</div>
              <div className="text-xs text-slate-400 mt-0.5">
                Iniciar automáticamente al empezar el turno
              </div>
            </div>
            <ToggleSwitch
              checked={timer.autoStart}
              onChange={(val) => updateTimer({ autoStart: val })}
              label="Inicio automático"
              size="sm"
            />
          </div>

          <div className="flex items-center justify-between gap-4 py-4">
            <div>
              <div className="text-white font-bold text-sm">Pase de Turno Automático</div>
              <div className="text-xs text-slate-400 mt-0.5">
                Pasar al siguiente turno si el tiempo llega a 0
              </div>
            </div>
            <ToggleSwitch
              checked={timer.autoPass}
              onChange={(val) => updateTimer({ autoPass: val })}
              label="Pase de turno automático"
              size="sm"
            />
          </div>

          <div className="flex items-center justify-between gap-4 pt-4">
            <div>
              <div className="text-white font-bold text-sm">Permitir Pausar al Jugador</div>
              <div className="text-xs text-slate-400 mt-0.5">
                El jugador activo puede pausar o reiniciar su reloj
              </div>
            </div>
            <ToggleSwitch
              checked={timer.allowPlayerControls}
              onChange={(val) => updateTimer({ allowPlayerControls: val })}
              label="Permitir pausar al jugador"
              size="sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostSettingsTimer;
