import React, { useState } from 'react';
import { ArrowLeft, Trophy, Plus, Trash2 } from 'lucide-react';
import { useScrollEffects } from '../hooks/useScrollEffects';

const HostSettingsScore = ({ gameState, socket, onBack }) => {
  const score = gameState.modules.score;
  const [newTeamId, setNewTeamId] = useState(1);

  const { scrollRef, isScrolled, scrollProgress, hasOverflow } = useScrollEffects([
    score.mode,
    score.endCondition?.type,
    Object.keys(score.teams || {}).length,
  ]);

  const updateScore = (updates) => {
    socket.emit('updateModules', { score: { ...score, ...updates } });
  };

  const activeRoles = Object.keys(gameState.colors).filter((r) => gameState.colors[r] !== null);

  const handleModeChange = (e) => {
    const mode = e.target.value;
    if (mode === 'teams' && Object.keys(score.teams || {}).length === 0) {
      updateScore({
        mode,
        teams: {
          team1: { name: 'Equipo 1', members: [], colorRole: null },
          team2: { name: 'Equipo 2', members: [], colorRole: null },
        },
      });
      setNewTeamId(3);
    } else {
      updateScore({ mode });
    }
  };

  const addTeam = () => {
    const id = `team${newTeamId}`;
    setNewTeamId(newTeamId + 1);
    updateScore({
      teams: {
        ...score.teams,
        [id]: { name: `Equipo ${newTeamId}`, members: [], colorRole: null },
      },
    });
  };

  const assignPlayerToTeam = (role, teamId) => {
    const newTeams = JSON.parse(JSON.stringify(score.teams));

    Object.keys(newTeams).forEach((tId) => {
      newTeams[tId].members = newTeams[tId].members.filter((m) => m !== role);
    });

    newTeams[teamId].members.push(role);

    if (newTeams[teamId].members.length === 1 && !newTeams[teamId].colorRole) {
      newTeams[teamId].colorRole = role;
    }

    updateScore({ teams: newTeams });
  };

  const removeTeam = (teamId) => {
    const newTeams = { ...score.teams };
    delete newTeams[teamId];
    updateScore({ teams: newTeams });
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
            <span className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
              <Trophy size={17} />
            </span>
            <h2 className="text-lg font-extrabold text-white tracking-tight truncate">
              Configurar Puntuación
            </h2>
          </div>
        </div>
        {hasOverflow && (
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-300 to-emerald-400 origin-left transition-transform duration-75"
              style={{ transform: `scaleX(${Math.max(0.03, scrollProgress)})` }}
            />
          </div>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 liquid-scroll px-5 pt-5 pb-20 space-y-4">
        <div className="scroll-reveal-card liquid-glass p-5 rounded-2xl">
          <label className="block text-slate-200 font-bold text-sm mb-2.5">
            Modo de Puntuación
          </label>
          <select
            className="liquid-input w-full rounded-xl p-3 text-sm font-semibold"
            value={score.mode}
            onChange={handleModeChange}
          >
            <option value="individual">Individual (Todos contra todos)</option>
            <option value="global">Global (Cooperativo)</option>
            <option value="teams">Por Equipos</option>
          </select>
        </div>

        {score.mode === 'teams' && (
          <div className="scroll-reveal-card liquid-glass p-5 rounded-2xl">
            <h3 className="text-white font-bold text-sm mb-3.5">Equipos</h3>
            <div className="space-y-3">
              {Object.keys(score.teams).map((tId) => {
                const team = score.teams[tId];
                return (
                  <div key={tId} className="liquid-glass-subtle p-3.5 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-white text-sm">{team.name}</span>
                      <button
                        type="button"
                        onClick={() => removeTeam(tId)}
                        className="text-rose-400 hover:text-rose-300 text-xs font-bold inline-flex items-center gap-1"
                      >
                        <Trash2 size={12} />
                        <span>Eliminar</span>
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {team.members.map((m) => (
                        <span
                          key={m}
                          className="px-2.5 py-1 bg-sky-500/15 border border-sky-400/25 text-xs font-bold rounded-full text-sky-200"
                        >
                          {gameState.names[m] || m}
                        </span>
                      ))}
                      {team.members.length === 0 && (
                        <span className="text-slate-500 text-xs italic">Vacío</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2 border-t border-white/10 pt-2.5">
                      <span className="text-[11px] text-slate-400 w-full mb-0.5">
                        Añadir jugador:
                      </span>
                      {activeRoles
                        .filter((r) => !team.members.includes(r))
                        .map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => assignPlayerToTeam(r, tId)}
                            className="liquid-btn liquid-btn-glass text-white text-xs font-semibold px-2.5 py-1 rounded-lg"
                          >
                            + {gameState.names[r] || r}
                          </button>
                        ))}
                    </div>
                  </div>
                );
              })}
              <button
                type="button"
                onClick={addTeam}
                className="liquid-btn liquid-btn-glass w-full py-2.5 text-slate-200 text-sm font-bold rounded-xl border-dashed flex items-center justify-center gap-1.5"
              >
                <Plus size={15} />
                <span>Añadir Nuevo Equipo</span>
              </button>
            </div>
          </div>
        )}

        <div className="scroll-reveal-card liquid-glass p-5 rounded-2xl">
          <label className="block text-slate-200 font-bold text-sm mb-2.5">
            Condición para Ganar
          </label>
          <select
            className="liquid-input w-full rounded-xl p-3 text-sm font-semibold"
            value={score.winCondition}
            onChange={(e) => updateScore({ winCondition: e.target.value })}
          >
            <option value="highest">El mayor puntaje gana</option>
            <option value="lowest">El menor puntaje gana</option>
          </select>
        </div>

        <div className="scroll-reveal-card liquid-glass p-5 rounded-2xl">
          <label className="block text-slate-200 font-bold text-sm mb-2.5">
            Meta de Fin de Juego
          </label>

          <select
            className="liquid-input w-full rounded-xl p-3 text-sm font-semibold mb-3"
            value={score.endCondition?.type || 'none'}
            onChange={(e) => {
              const type = e.target.value;
              if (type === 'none') {
                updateScore({ endCondition: { type: 'none', value: 0 } });
              } else if (type === 'rounds') {
                updateScore({ endCondition: { type: 'rounds', value: 10 } });
              } else {
                updateScore({ endCondition: { type: 'points', value: 10, direction: 'above' } });
              }
            }}
          >
            <option value="none">Sin límite (Juego infinito)</option>
            <option value="points">Al alcanzar cierta puntuación</option>
            <option value="rounds">Al terminar cierta cantidad de rondas</option>
          </select>

          {score.endCondition?.type === 'points' && (
            <div className="flex gap-2">
              <select
                className="liquid-input flex-1 rounded-xl p-2.5 text-sm"
                value={score.endCondition.direction}
                onChange={(e) =>
                  updateScore({
                    endCondition: { ...score.endCondition, direction: e.target.value },
                  })
                }
              >
                <option value="above">Llegar a (o más)</option>
                <option value="below">Bajar a (o menos)</option>
              </select>
              <input
                type="number"
                className="liquid-input w-24 rounded-xl p-2.5 text-center font-bold tabular-nums"
                value={score.endCondition.value}
                onChange={(e) =>
                  updateScore({
                    endCondition: {
                      ...score.endCondition,
                      value: parseInt(e.target.value, 10) || 0,
                    },
                  })
                }
              />
            </div>
          )}

          {score.endCondition?.type === 'rounds' && (
            <div className="flex gap-3 items-center">
              <span className="flex-1 text-xs text-slate-300">
                Terminar después de la ronda:
              </span>
              <input
                type="number"
                className="liquid-input w-24 rounded-xl p-2.5 text-center font-bold tabular-nums"
                value={score.endCondition.value}
                onChange={(e) =>
                  updateScore({
                    endCondition: {
                      ...score.endCondition,
                      value: parseInt(e.target.value, 10) || 0,
                    },
                  })
                }
              />
            </div>
          )}
        </div>

        <div className="scroll-reveal-card liquid-glass p-5 rounded-2xl">
          <label className="block text-slate-200 font-bold text-sm mb-1">
            Puntuación Inicial
          </label>
          <div className="text-xs text-slate-400 mb-3">
            Con cuántos puntos empiezan los jugadores o equipos.
          </div>
          <input
            type="number"
            className="liquid-input w-full rounded-xl p-3 text-center text-lg font-extrabold tabular-nums"
            value={score.initialScore !== undefined ? score.initialScore : 0}
            onChange={(e) => updateScore({ initialScore: parseInt(e.target.value, 10) || 0 })}
          />
        </div>
      </div>
    </div>
  );
};

export default HostSettingsScore;
