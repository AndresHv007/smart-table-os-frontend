import React, { useEffect, useId, useState } from 'react';
import { Trophy, History, Medal, X, Plus, Tv } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useScrollEffects } from '../hooks/useScrollEffects';
import LiquidModal from './ui/LiquidModal';
import { useToast } from './ui/LiquidToast';

const StatisticsScreen = ({ onClose, isTV = false }) => {
  const { socket, gameState } = useSocket();
  const titleId = useId();
  const [stats, setStats] = useState({ leaderboard: [], history: [], profiles: [] });
  const [loading, setLoading] = useState(true);
  const [isAddRecordOpen, setIsAddRecordOpen] = useState(false);

  const activeTab = gameState?.activeStatsTab || 'leaderboard';

  const { scrollRef, resetScroll, isScrolled, scrollProgress, hasOverflow } = useScrollEffects([
    activeTab,
    loading,
    stats.leaderboard.length,
    stats.history.length,
  ]);

  useEffect(() => {
    resetScroll();
  }, [activeTab, resetScroll]);

  useEffect(() => {
    if (isTV) return;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !document.querySelector('dialog[open]')) {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTV, onClose]);

  const handleTabClick = (tab) => {
    if (!isTV) {
      socket.emit('setStatsTab', tab);
    }
  };

  useEffect(() => {
    if (!socket) return;

    const fetchStats = () => {
      socket.emit('getStats', (data) => {
        if (data) {
          setStats({
            leaderboard: data.leaderboard || [],
            history: data.history || [],
            profiles: data.profiles || [],
          });
        }
        setLoading(false);
      });
    };

    fetchStats();
    socket.on('statsUpdated', fetchStats);

    return () => socket.off('statsUpdated', fetchStats);
  }, [socket]);

  return (
    <div
      role={!isTV ? 'dialog' : undefined}
      aria-modal={!isTV ? 'true' : undefined}
      aria-labelledby={!isTV ? titleId : undefined}
      onClick={(e) => {
        if (!isTV && e.target === e.currentTarget) onClose?.();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 liquid-backdrop animate-fade-slide-up"
    >
      <div
        className={`liquid-glass-modal rounded-[2rem] sm:rounded-[2.5rem] w-full max-w-5xl h-full max-h-[92dvh] flex flex-col overflow-hidden ${
          activeTab === 'leaderboard' ? 'liquid-glow-amber' : 'liquid-glow-sky'
        }`}
      >
        {/* Dynamic Sticky Liquid Header */}
        <div
          className={`relative z-20 px-5 sm:px-8 transition-all duration-200 border-b border-white/10 ${
            isScrolled ? 'py-3.5 bg-slate-950/60 backdrop-blur-xl shadow-lg' : 'py-5 sm:py-6'
          }`}
        >
          <div className="flex justify-between items-center gap-4">
            <h1
              id={titleId}
              className={`font-black text-white flex items-center gap-3 tracking-tight transition-all duration-200 ${
                isScrolled ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-4xl'
              }`}
            >
              <span className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-400/15 border border-amber-300/35 flex items-center justify-center shadow-[0_0_24px_rgba(250,204,21,0.28)] shrink-0">
                <Trophy size={isScrolled ? 20 : 26} className="text-amber-300" />
              </span>
              <span className="truncate">Salón de la Fama</span>
            </h1>
            {!isTV && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar Salón de la Fama"
                className="liquid-btn liquid-btn-glass w-10 h-10 rounded-full flex items-center justify-center text-slate-300 hover:text-white shrink-0"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Segmented Control Tabs */}
          <div
            className={`mt-4 grid grid-cols-2 gap-1.5 p-1.5 rounded-2xl liquid-glass-subtle ${
              isTV ? 'opacity-90 pointer-events-none' : ''
            }`}
          >
            <button
              type="button"
              onClick={() => handleTabClick('leaderboard')}
              className={`liquid-btn flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold transition-all ${
                activeTab === 'leaderboard'
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 shadow-[0_8px_22px_-6px_rgba(250,204,21,0.65)]'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Medal size={18} className="shrink-0" />
              <span className="text-sm sm:text-base truncate">Clasificación</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabClick('history')}
              className={`liquid-btn flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold transition-all ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-sky-400 to-indigo-500 text-slate-950 shadow-[0_8px_22px_-6px_rgba(56,189,248,0.6)]'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <History size={18} className="shrink-0" />
              <span className="text-sm sm:text-base truncate">Historial</span>
            </button>
          </div>

          {/* Scroll Progress Hairline */}
          {hasOverflow && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-300 via-sky-400 to-indigo-400 origin-left transition-transform duration-75"
                style={{ transform: `scaleX(${Math.max(0.03, scrollProgress)})` }}
              />
            </div>
          )}
        </div>

        {/* Scrollable Content Area */}
        <div ref={scrollRef} className="flex-1 liquid-scroll p-5 sm:p-7 relative">
          {loading ? (
            <div className="flex h-full min-h-[14rem] flex-col items-center justify-center gap-3 text-slate-300">
              <div className="w-10 h-10 rounded-full border-2 border-white/15 border-t-amber-300 animate-spin" />
              <span className="text-lg font-semibold">Cargando estadísticas...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {!isTV && (
                <div className="scroll-reveal-card bg-sky-500/10 border border-sky-400/30 p-4 rounded-2xl flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-sky-400/15 border border-sky-300/30 flex items-center justify-center shrink-0">
                    <Tv size={18} className="text-sky-300" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm text-sky-200 font-bold">Control Remoto de TV</h3>
                    <p className="text-slate-300/80 text-xs mt-0.5">
                      Navegar aquí sincroniza la vista en la pantalla principal de la mesa.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'leaderboard' && (
                <div className="space-y-3">
                  {stats.leaderboard.length === 0 ? (
                    <div className="text-center text-slate-400 py-14 liquid-glass-subtle rounded-2xl">
                      Aún no hay partidas registradas.
                    </div>
                  ) : (
                    stats.leaderboard.map((user, idx) => (
                      <div
                        key={user.name}
                        className={`scroll-reveal-card flex items-center justify-between liquid-glass-subtle p-4 rounded-2xl transition-colors ${
                          idx === 0
                            ? 'border-amber-400/40 bg-amber-400/[0.06]'
                            : idx === 1
                              ? 'border-slate-300/25'
                              : idx === 2
                                ? 'border-amber-600/35'
                                : ''
                        }`}
                      >
                        <div className="flex items-center space-x-4 sm:space-x-5 overflow-hidden">
                          <div
                            className={`w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-2xl flex items-center justify-center font-black text-base sm:text-lg tabular-nums ${
                              idx === 0
                                ? 'bg-gradient-to-br from-amber-300 to-yellow-500 text-amber-950 shadow-[0_0_20px_rgba(250,204,21,0.5)]'
                                : idx === 1
                                  ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-900'
                                  : idx === 2
                                    ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-amber-100'
                                    : 'bg-slate-800/90 text-slate-300 border border-white/10'
                            }`}
                          >
                            #{idx + 1}
                          </div>
                          <span className="text-lg sm:text-2xl font-extrabold text-white truncate">
                            {user.name}
                          </span>
                        </div>
                        <div className="text-base sm:text-xl font-black text-amber-300 shrink-0 ml-3 tabular-nums px-3.5 py-1.5 rounded-xl bg-amber-400/10 border border-amber-300/20">
                          {user.wins}{' '}
                          {isTV ? (user.wins === 1 ? 'Victoria' : 'Victorias') : '🏆'}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-4">
                  {stats.history.length === 0 ? (
                    <div className="text-center text-slate-400 py-14 liquid-glass-subtle rounded-2xl">
                      Aún no hay historial de partidas.
                    </div>
                  ) : (
                    stats.history.map((game) => (
                      <div
                        key={game.id}
                        className="scroll-reveal-card liquid-glass-subtle p-5 rounded-2xl"
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-3 mb-3.5 gap-2.5">
                          <div className="flex flex-col items-start gap-1 w-full sm:w-auto">
                            <span className="text-xs font-extrabold uppercase tracking-wider bg-sky-500/20 text-sky-200 border border-sky-400/30 px-3 py-1 rounded-full truncate max-w-full">
                              {game.presetName || 'Custom'}
                            </span>
                            <span className="text-xs text-slate-400 tabular-nums">
                              {new Date(game.date).toLocaleString()}
                            </span>
                          </div>
                          <div className="text-amber-300 font-extrabold flex items-center gap-2 shrink-0 bg-amber-400/10 border border-amber-300/25 px-3.5 py-1.5 rounded-xl">
                            <Trophy size={15} />
                            <span className="truncate max-w-[160px] sm:max-w-[220px] text-sm">
                              {game.winnerName || 'Empate / Sin Ganador'}
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                          {Object.entries(game.scoresData || {}).map(([name, score]) => (
                            <div
                              key={name}
                              className="flex justify-between items-center bg-slate-950/55 border border-white/5 px-3 py-2 rounded-xl"
                            >
                              <span className="text-slate-300 text-sm truncate mr-2">{name}</span>
                              <span className="font-black text-white tabular-nums">{score}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}

                  {!isTV && (
                    <div className="pt-4 border-t border-white/10 mt-4">
                      <button
                        type="button"
                        onClick={() => setIsAddRecordOpen(true)}
                        className="liquid-btn w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-slate-950 font-extrabold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-[0_14px_32px_-10px_rgba(16,185,129,0.6)]"
                      >
                        <Plus size={20} />
                        <span className="text-base sm:text-lg">Nuevo Registro al Historial</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {!isTV && (
        <LiquidModal
          isOpen={isAddRecordOpen}
          onClose={() => setIsAddRecordOpen(false)}
          title="Nuevo Registro"
          subtitle="Registra manualmente el resultado de una partida jugada en mesa."
          icon={<Trophy size={20} className="text-amber-300" />}
        >
          <AddRecordForm
            isOpen={isAddRecordOpen}
            onClose={() => setIsAddRecordOpen(false)}
            profiles={stats.profiles}
          />
        </LiquidModal>
      )}
    </div>
  );
};

const AddRecordForm = ({ isOpen, onClose, profiles = [] }) => {
  const { socket } = useSocket();
  const toast = useToast();
  const [recordPreset, setRecordPreset] = useState('Custom');
  const [recordWinner, setRecordWinner] = useState('');
  const [playerScores, setPlayerScores] = useState([{ name: '', score: '' }]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError('');
    }
  }, [isOpen]);

  const handleAddRecord = (e) => {
    e.preventDefault();
    if (!recordWinner) {
      setError('Debes seleccionar un ganador.');
      return;
    }

    const parsedScores = {};
    for (const ps of playerScores) {
      if (ps.name.trim()) {
        parsedScores[ps.name.trim()] = Number(ps.score) || 0;
      }
    }

    socket.emit(
      'addManualRecord',
      {
        presetName: recordPreset,
        winnerName: recordWinner,
        scores: parsedScores,
      },
      (res) => {
        if (res.success) {
          toast.success('Registro añadido al historial con éxito');
          setRecordPreset('Custom');
          setRecordWinner('');
          setPlayerScores([{ name: '', score: '' }]);
          setError('');
          onClose();
          socket.emit('getStats', () => {});
        } else {
          setError(res.error);
        }
      }
    );
  };

  const addPlayerScore = () => {
    setPlayerScores([...playerScores, { name: '', score: '' }]);
  };

  const updatePlayerScore = (index, field, value) => {
    const newScores = [...playerScores];
    newScores[index][field] = value;
    setPlayerScores(newScores);
  };

  const removePlayerScore = (index) => {
    const newScores = [...playerScores];
    newScores.splice(index, 1);
    setPlayerScores(newScores);
  };

  return (
    <form onSubmit={handleAddRecord} className="space-y-4">
      {error && (
        <div className="text-rose-200 text-sm bg-rose-500/15 border border-rose-400/35 px-3.5 py-2.5 rounded-xl">
          {error}
        </div>
      )}

      <div>
        <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-1.5">
          Nombre del Juego / Preset
        </label>
        <input
          value={recordPreset}
          onChange={(e) => setRecordPreset(e.target.value)}
          className="liquid-input w-full p-3 rounded-xl text-sm"
          required
        />
      </div>

      <div>
        <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-1.5">
          Ganador
        </label>
        <select
          value={recordWinner}
          onChange={(e) => {
            const newWinner = e.target.value;
            setRecordWinner(newWinner);
            if (newWinner !== 'Empate') {
              const exists = playerScores.find((ps) => ps.name === newWinner);
              if (!exists) {
                setPlayerScores([{ name: newWinner, score: '' }, ...playerScores]);
              }
            }
          }}
          className="liquid-input w-full p-3 rounded-xl text-sm"
          required
        >
          <option value="" disabled>
            Selecciona al ganador
          </option>
          {profiles.map((p) => (
            <option key={p.id} value={p.name}>
              {p.name}
            </option>
          ))}
          <option value="Empate">Empate</option>
        </select>
      </div>

      <div>
        <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
          Puntuaciones
        </label>
        <div className="space-y-2 max-h-44 liquid-scroll pr-1">
          {playerScores.map((ps, index) => (
            <div key={index} className="flex gap-2 items-center">
              <select
                value={ps.name}
                onChange={(e) => updatePlayerScore(index, 'name', e.target.value)}
                className="liquid-input flex-1 p-2.5 rounded-xl text-sm min-w-0"
                required
              >
                <option value="" disabled>
                  Jugador
                </option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Ptos"
                value={ps.score}
                onChange={(e) => updatePlayerScore(index, 'score', e.target.value)}
                className="liquid-input w-20 p-2.5 rounded-xl text-sm text-center tabular-nums"
                required
              />
              <button
                type="button"
                onClick={() => removePlayerScore(index)}
                disabled={ps.name === recordWinner && ps.name !== ''}
                aria-label="Quitar fila de jugador"
                className={`p-2 rounded-lg transition-colors ${
                  ps.name === recordWinner && ps.name !== ''
                    ? 'text-slate-600 opacity-40 cursor-not-allowed'
                    : 'text-rose-400 hover:text-rose-300 hover:bg-rose-500/15'
                }`}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addPlayerScore}
          className="mt-2.5 text-sm text-sky-300 font-bold inline-flex items-center gap-1 hover:text-sky-200 transition-colors"
        >
          <Plus size={15} />
          <span>Añadir Jugador</span>
        </button>
      </div>

      <div className="flex gap-2.5 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="liquid-btn liquid-btn-glass flex-1 py-3.5 rounded-xl font-bold text-slate-200"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="liquid-btn flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-slate-950 font-extrabold py-3.5 rounded-xl shadow-[0_10px_24px_-8px_rgba(16,185,129,0.6)]"
        >
          Guardar Registro
        </button>
      </div>
    </form>
  );
};

export default StatisticsScreen;
