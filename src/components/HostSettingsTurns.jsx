import React from 'react';
import { ArrowLeft, RefreshCw, Trash2 } from 'lucide-react';
import ToggleSwitch from './ui/ToggleSwitch';
import { useScrollEffects } from '../hooks/useScrollEffects';

const HostSettingsTurns = ({ gameState, socket, onBack }) => {
  const turns = gameState.modules.turns;
  const { scrollRef, isScrolled, scrollProgress, hasOverflow } = useScrollEffects([
    turns.orderType,
    turns.countRounds,
    turns.customOrder?.length,
  ]);

  const updateTurns = (updates) => {
    socket.emit('updateModules', { turns: { ...turns, ...updates } });
  };

  const activeRoles = Object.keys(gameState.colors).filter((r) => gameState.colors[r] !== null);

  const addRoleToCustom = (role) => {
    updateTurns({ customOrder: [...turns.customOrder, role] });
  };

  const clearCustomOrder = () => {
    updateTurns({ customOrder: [] });
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
            <span className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300 shrink-0">
              <RefreshCw size={17} />
            </span>
            <h2 className="text-lg font-extrabold text-white tracking-tight truncate">
              Configurar Turnos
            </h2>
          </div>
        </div>
        {hasOverflow && (
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-400 to-indigo-400 origin-left transition-transform duration-75"
              style={{ transform: `scaleX(${Math.max(0.03, scrollProgress)})` }}
            />
          </div>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 liquid-scroll px-5 pt-5 pb-16 space-y-4">
        <div className="scroll-reveal-card liquid-glass p-5 rounded-2xl">
          <label className="block text-slate-200 font-bold text-sm mb-2.5">
            Sentido de Turnos
          </label>
          <select
            className="liquid-input w-full rounded-xl p-3 text-sm font-semibold"
            value={turns.orderType}
            onChange={(e) => updateTurns({ orderType: e.target.value })}
          >
            <option value="clockwise">Horario (Normal)</option>
            <option value="counterclockwise">Antihorario</option>
            <option value="custom">Orden Personalizado</option>
          </select>
        </div>

        {gameState.status === 'LOBBY' && (
          <div className="scroll-reveal-card liquid-glass p-5 rounded-2xl">
            <label className="block text-slate-200 font-bold text-sm mb-2.5">
              Primer Jugador
            </label>
            <select
              className="liquid-input w-full rounded-xl p-3 text-sm font-semibold"
              value={turns.firstPlayer || 'random'}
              onChange={(e) => updateTurns({ firstPlayer: e.target.value })}
            >
              <option value="random">Aleatorio (Por Defecto)</option>
              {activeRoles.map((r) => (
                <option key={r} value={r}>
                  {gameState.names[r] || r}
                </option>
              ))}
            </select>
          </div>
        )}

        {turns.orderType === 'custom' && (
          <div className="scroll-reveal-card liquid-glass p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-white font-bold text-sm">Secuencia Personalizada</h3>
              {turns.customOrder.length > 0 && (
                <button
                  type="button"
                  onClick={clearCustomOrder}
                  className="liquid-btn text-xs bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-400/25 px-2.5 py-1 rounded-lg inline-flex items-center gap-1 font-bold"
                >
                  <Trash2 size={12} />
                  <span>Limpiar</span>
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {turns.customOrder.map((r, i) => (
                <div
                  key={i}
                  className="liquid-glass-subtle text-slate-100 px-3 py-1 rounded-full text-xs font-bold tabular-nums"
                >
                  {i + 1}. {gameState.names[r] || r}
                </div>
              ))}
              {turns.customOrder.length === 0 && (
                <span className="text-slate-400 text-xs italic">
                  La secuencia está vacía. Selecciona abajo.
                </span>
              )}
            </div>

            <div className="border-t border-white/10 pt-3.5">
              <label className="block text-slate-400 text-xs mb-2.5">
                Añadir al ciclo (el ciclo se repetirá continuamente):
              </label>
              <div className="grid grid-cols-2 gap-2">
                {activeRoles.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => addRoleToCustom(r)}
                    className="liquid-btn liquid-btn-glass text-white rounded-xl p-2.5 text-sm font-bold"
                  >
                    + {gameState.names[r] || r}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="scroll-reveal-card liquid-glass p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-white font-bold text-sm">Llevar Cuenta de Rondas</div>
              <div className="text-xs text-slate-400 mt-0.5">
                Mostrar número de ronda en pantalla
              </div>
            </div>
            <ToggleSwitch
              checked={turns.countRounds}
              onChange={(val) => updateTurns({ countRounds: val })}
              label="Llevar cuenta de rondas"
              size="sm"
            />
          </div>

          {turns.countRounds && (
            <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-4">
              <div>
                <div className="text-white font-bold text-sm">Avance Automático</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Avanzar ronda al reiniciar el ciclo de turnos
                </div>
              </div>
              <ToggleSwitch
                checked={turns.autoRound}
                onChange={(val) => updateTurns({ autoRound: val })}
                label="Avance automático de ronda"
                size="sm"
              />
            </div>
          )}
        </div>

        <div className="scroll-reveal-card liquid-glass p-5 rounded-2xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-white font-bold text-sm">Panel de Moderador en Juego</div>
              <div className="text-xs text-slate-400 mt-0.5">
                Controles del host para eliminar/revivir jugadores y ajustar puntos.
              </div>
            </div>
            <ToggleSwitch
              checked={turns.showModeratorPanel !== false}
              onChange={(val) => updateTurns({ showModeratorPanel: val })}
              label="Mostrar panel de moderador en juego"
              size="sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostSettingsTurns;
