import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useSocket } from '../context/SocketContext';
import {
  Dices,
  RefreshCw,
  Trophy,
  Timer,
  Hash,
  Vote,
  Shield,
  Wifi,
  WifiOff,
  Smartphone,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  Crown,
} from 'lucide-react';
import DiceShape from './DiceShape';
import StatisticsScreen from './StatisticsScreen';
import { useToast } from './ui/LiquidToast';

const TableScreen = () => {
  const { socket, gameState, isConnected, serverIp, appEnv, appVersion } = useSocket();
  const toast = useToast();
  const isLocalHost =
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const [localIp, setLocalIp] = useState(`${window.location.origin}/mobile`);
  const [isRolling, setIsRolling] = useState(false);
  const [displayDice, setDisplayDice] = useState([]);
  const [copiedUrl, setCopiedUrl] = useState(false);

  useEffect(() => {
    if (isLocalHost && serverIp) {
      setLocalIp(`http://${serverIp}:${window.location.port || '5173'}/mobile`);
    } else {
      setLocalIp(`${window.location.origin}/mobile`);
    }
  }, [serverIp, isLocalHost]);

  useEffect(() => {
    if (!socket) return;

    let intervalId;
    let timeoutId;

    const handleDiceRolled = (roll) => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
      setIsRolling(true);

      const faces = gameState?.modules?.dice?.faces || 6;
      intervalId = setInterval(() => {
        setDisplayDice(roll.values.map(() => Math.floor(Math.random() * faces) + 1));
      }, 50);

      timeoutId = setTimeout(() => {
        clearInterval(intervalId);
        setDisplayDice(roll.values);
        setIsRolling(false);
      }, 600);
    };

    socket.on('diceRolled', handleDiceRolled);
    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
      socket.off('diceRolled', handleDiceRolled);
    };
  }, [socket, gameState?.modules?.dice?.faces]);

  useEffect(() => {
    if (!isRolling && gameState?.moduleStates?.dice?.lastRoll?.values) {
      setDisplayDice(
        gameState.moduleStates.dice.lastRoll.values.length > 0
          ? gameState.moduleStates.dice.lastRoll.values
          : []
      );
    }
  }, [gameState?.moduleStates?.dice?.lastRoll?.values, isRolling]);

  const handleCopyMobileUrl = async () => {
    try {
      await navigator.clipboard.writeText(localIp);
      setCopiedUrl(true);
      toast.success('Enlace móvil copiado al portapapeles');
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      toast.info(`Abre ${localIp} en tu móvil`);
    }
  };

  // Top-left Live Connection Indicator & Top-right Environment/Version Badge
  const renderSystemBadges = () => (
    <>
      {/* Live Socket Connection Indicator (Issue #5) */}
      <div
        className={`absolute top-4 left-4 z-40 liquid-glass-pill px-3.5 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold tracking-wide transition-colors ${
          isConnected
            ? 'border-emerald-400/35 text-emerald-200'
            : 'border-rose-400/45 text-rose-200'
        }`}
        role="status"
        aria-live="polite"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isConnected ? 'bg-emerald-400' : 'bg-rose-400'
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              isConnected ? 'bg-emerald-400' : 'bg-rose-500'
            }`}
          />
        </span>
        {isConnected ? <Wifi size={13} className="text-emerald-300" /> : <WifiOff size={13} className="text-rose-300" />}
        <span>{isConnected ? 'Conectado' : 'Offline'}</span>
      </div>

      {/* Environment & Version Badge (Preserved DEV/PROD runtime indicator) */}
      <div className="absolute top-4 right-4 z-40 liquid-glass-pill px-3.5 py-1.5 rounded-full flex items-center space-x-2 text-xs font-bold tracking-wider">
        <span
          className={`w-2 h-2 rounded-full shadow-sm ${
            appEnv === 'production'
              ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]'
              : 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.9)]'
          }`}
        />
        <span className={appEnv === 'production' ? 'text-emerald-300' : 'text-amber-300'}>
          {appEnv === 'production' ? 'PROD' : 'DEV'}
        </span>
        <span className="text-slate-500">·</span>
        <span className="text-slate-200 font-semibold">{appVersion}</span>
      </div>
    </>
  );

  if (!gameState) {
    return (
      <div className="relative w-full h-full table-felt-surface overflow-hidden flex items-center justify-center p-6">
        <div className="absolute inset-0 table-geo-grid pointer-events-none" />
        {renderSystemBadges()}
        <div className="liquid-glass-modal rounded-[2rem] px-10 py-9 flex flex-col items-center text-center max-w-sm w-full animate-modal-pop">
          <div className="relative w-16 h-16 mb-5 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-emerald-400/20" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-emerald-400 animate-spin" />
            <Dices size={26} className="text-emerald-300" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Smart Table OS</h1>
          <p className="text-sm text-slate-300/80 mt-2">
            {isConnected ? 'Sincronizando tablero...' : 'Conectando con el servidor de mesa...'}
          </p>
        </div>
      </div>
    );
  }

  const { players, colors, names, modules, moduleStates } = gameState;
  const lastRoll = moduleStates.dice.lastRoll;

  const SEAT_STYLES = {
    red: 'bg-gradient-to-b from-rose-500/90 to-red-700/90 text-white border-rose-300/45 shadow-[0_10px_28px_-6px_rgba(239,68,68,0.55)]',
    blue: 'bg-gradient-to-b from-sky-500/90 to-blue-700/90 text-white border-sky-300/45 shadow-[0_10px_28px_-6px_rgba(59,130,246,0.55)]',
    green: 'bg-gradient-to-b from-emerald-500/90 to-green-700/90 text-white border-emerald-300/45 shadow-[0_10px_28px_-6px_rgba(16,185,129,0.55)]',
    yellow: 'bg-gradient-to-b from-amber-300 to-yellow-500 text-slate-950 border-yellow-100/70 shadow-[0_10px_28px_-6px_rgba(250,204,21,0.55)]',
  };

  const TEXT_COLORS = {
    red: 'text-rose-400',
    blue: 'text-sky-400',
    green: 'text-emerald-400',
    yellow: 'text-amber-300',
  };

  const DOT_COLORS = {
    red: 'bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.9)]',
    blue: 'bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.9)]',
    green: 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]',
    yellow: 'bg-amber-300 shadow-[0_0_10px_rgba(252,211,77,0.9)]',
  };

  const TURN_BORDER_STYLES = {
    red: 'border-rose-400/70 liquid-glow-rose',
    blue: 'border-sky-400/70 liquid-glow-sky',
    green: 'border-emerald-400/70 liquid-glow-emerald',
    yellow: 'border-amber-300/75 liquid-glow-amber',
  };

  const getPlayerClass = (seat) => {
    if (!players[seat]) {
      return 'liquid-glass-pill text-slate-400/80 border-dashed border-white/15';
    }
    const colorId = colors[seat];
    const isReady = gameState.status === 'LOBBY' && gameState.ready?.[seat];
    const isActiveTurn = gameState.status === 'PLAYING' && gameState.turn === seat;

    const highlightClass = isReady
      ? 'ring-2 ring-amber-300 ring-offset-2 ring-offset-emerald-950/80 scale-105'
      : isActiveTurn
        ? 'ring-2 ring-white/90 ring-offset-2 ring-offset-emerald-950/80 scale-110'
        : '';

    if (colorId && SEAT_STYLES[colorId]) {
      return `border backdrop-blur-md ${SEAT_STYLES[colorId]} ${highlightClass}`;
    }
    return 'liquid-glass-pill text-slate-200 animate-pulse border-white/25';
  };

  const connectedPlayersCount = Object.values(players || {}).filter(Boolean).length;
  const readyPlayersCount = Object.keys(gameState.ready || {}).filter(
    (r) => gameState.ready[r]
  ).length;

  const activeModulesList = [
    modules.turns?.enabled && { key: 'turns', label: 'Turnos', icon: RefreshCw },
    modules.timer?.enabled && { key: 'timer', label: 'Tiempo', icon: Timer },
    modules.dice?.enabled && { key: 'dice', label: 'Dados', icon: Dices },
    modules.score?.enabled && { key: 'score', label: 'Puntos', icon: Hash },
    modules.voting?.enabled && { key: 'voting', label: 'Votación', icon: Vote },
    modules.hiddenRoles?.enabled && { key: 'hiddenRoles', label: 'Roles', icon: Shield },
  ].filter(Boolean);

  return (
    <div className="relative w-full h-full table-felt-surface overflow-hidden flex flex-col items-center justify-center">
      {/* Ambient Volumetric Light & Geometric Felt Pattern */}
      <div className="absolute inset-0 table-geo-grid pointer-events-none" />
      <div className="absolute -top-32 left-1/4 w-[32rem] h-[32rem] rounded-full bg-emerald-400/10 blur-[120px] pointer-events-none animate-float-slow" />
      <div
        className="absolute -bottom-32 right-1/4 w-[28rem] h-[28rem] rounded-full bg-teal-300/10 blur-[120px] pointer-events-none animate-float-slow"
        style={{ animationDelay: '-7s' }}
      />

      {gameState.showStats && <StatisticsScreen onClose={() => {}} isTV={true} />}

      {/* Massive Timer Progress Bar */}
      {gameState.status === 'PLAYING' && gameState.modules.timer?.enabled && (
        <div className="absolute bottom-0 left-0 w-full h-3.5 bg-slate-950/85 border-t border-white/10 z-50 backdrop-blur-md overflow-hidden">
          <div
            className={`h-full rounded-r-full transition-colors ${
              gameState.moduleStates.timer.timeLeft <= 10
                ? 'bg-gradient-to-r from-rose-600 to-rose-400 shadow-[0_0_24px_rgba(244,63,94,0.9)] animate-pulse'
                : gameState.moduleStates.timer.timeLeft <= gameState.modules.timer.seconds / 2
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-300 shadow-[0_0_20px_rgba(250,204,21,0.75)]'
                  : 'bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.75)]'
            }`}
            style={{
              width: `${
                (gameState.moduleStates.timer.timeLeft /
                  Math.max(1, gameState.modules.timer.seconds)) *
                100
              }%`,
              transition: 'width 1s linear',
            }}
          />
        </div>
      )}

      {/* Background Timer Watermark */}
      {gameState.status === 'PLAYING' && gameState.modules.timer?.enabled && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
          <span
            className={`text-[clamp(14rem,34vw,26rem)] font-black tabular-nums leading-none tracking-tighter opacity-[0.07] select-none transition-colors duration-500 ${
              gameState.moduleStates.timer.timeLeft <= 10 ? 'text-rose-400' : 'text-white'
            }`}
          >
            {gameState.moduleStates.timer.timeLeft}
          </span>
        </div>
      )}

      {/* Center Interactive Stage */}
      <div className="z-10 w-full h-full flex items-center justify-center relative px-20 py-16">
        {gameState.status === 'LOBBY' ? (
          <div className="liquid-glass-modal rounded-[2.25rem] w-full max-w-[34rem] max-h-[calc(100dvh-7.5rem)] overflow-hidden flex flex-col z-20 animate-modal-pop">
            <div className="p-8 sm:p-10 liquid-scroll flex flex-col items-center">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full liquid-glass-subtle text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-300 mb-3">
                <Sparkles size={12} />
                <span>Mesa Interactiva</span>
              </div>

            <h1
              className={`text-4xl sm:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-emerald-200/80 text-center ${
                gameState.activePreset ? 'mb-3' : 'mb-6'
              }`}
            >
              Smart Table OS
            </h1>

            {gameState.activePreset && (
              <div className="mb-6 bg-sky-500/15 border border-sky-300/35 px-5 py-1.5 rounded-full shadow-[0_0_24px_rgba(56,189,248,0.28)]">
                <h2 className="text-lg font-extrabold text-sky-200 uppercase tracking-[0.18em]">
                  {gameState.activePreset}
                </h2>
              </div>
            )}

            {/* QR Code Pedestal */}
            <div className="relative bg-white p-4 rounded-2xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.65)] ring-4 ring-white/20 flex flex-col items-center justify-center">
              {localIp ? (
                <QRCodeSVG
                  value={localIp}
                  size={188}
                  bgColor="#ffffff"
                  fgColor="#090d16"
                  level="M"
                />
              ) : (
                <div className="w-[188px] h-[188px] bg-slate-200 animate-pulse rounded-xl" />
              )}
              <p className="text-center text-slate-800 font-extrabold mt-3 text-sm tracking-tight">
                Escanea para unirte a la partida
              </p>
            </div>

            {/* Clickable Link to /mobile below QR code (Issue #5) */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 w-full">
              <a
                href="/mobile"
                target="_blank"
                rel="noopener noreferrer"
                className="liquid-btn inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500/25 to-sky-500/25 hover:from-emerald-500/35 hover:to-sky-500/35 border border-emerald-300/40 text-emerald-100 text-sm font-bold shadow-[0_8px_24px_-8px_rgba(16,185,129,0.45)]"
              >
                <Smartphone size={15} className="text-emerald-300" />
                <span>Abrir control móvil (/mobile)</span>
                <ExternalLink size={13} className="opacity-80" />
              </a>
              <button
                type="button"
                onClick={handleCopyMobileUrl}
                title="Copiar enlace móvil"
                aria-label="Copiar enlace móvil"
                className="liquid-btn liquid-btn-glass px-3 py-2 rounded-xl text-slate-200 hover:text-white inline-flex items-center gap-1.5 text-xs font-semibold"
              >
                {copiedUrl ? (
                  <Check size={14} className="text-emerald-300" />
                ) : (
                  <Copy size={14} />
                )}
                <span>{copiedUrl ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>

            <p className="mt-2 text-[11px] font-mono text-slate-400/90 truncate max-w-full px-2">
              {localIp}
            </p>

            {/* Live Lobby Readiness */}
            <div className="mt-5 flex items-center gap-3 text-sm font-semibold text-slate-300">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full liquid-glass-subtle tabular-nums">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {connectedPlayersCount} / 4 en mesa
              </span>
              {connectedPlayersCount > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full liquid-glass-subtle text-amber-200 tabular-nums">
                  <Check size={13} className="text-amber-300" />
                  {readyPlayersCount} listos
                </span>
              )}
            </div>

            {connectedPlayersCount === 0 && (
              <p className="mt-3 text-slate-300/80 text-base font-medium animate-pulse">
                Esperando jugadores...
              </p>
            )}

            {/* Active Modules Chips */}
            {activeModulesList.length > 0 && (
              <div className="mt-5 pt-5 border-t border-white/10 flex flex-wrap justify-center gap-2 w-full">
                {activeModulesList.map(({ key, label, icon: Icon }) => (
                  <div
                    key={key}
                    className="liquid-glass-subtle px-3.5 py-1.5 rounded-xl flex items-center gap-2 text-slate-200 text-xs font-bold tracking-wide"
                  >
                    <Icon size={14} className="text-emerald-300" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            )}
            </div>
          </div>
        ) : gameState.status === 'PLAYING' ? (
          <div className="flex flex-col items-center relative z-10 w-full max-h-[calc(100dvh-7.5rem)] liquid-scroll py-4">
            {/* Liquid Crystal Voting Overlay */}
            {gameState.modules.voting?.enabled &&
              (gameState.moduleStates.voting?.active ||
                gameState.moduleStates.voting?.resultsRevealed) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 liquid-backdrop animate-fade-slide-up">
                  <div className="liquid-glass-modal liquid-glow-indigo rounded-[2.5rem] max-w-4xl w-full max-h-[88dvh] overflow-hidden flex flex-col border-indigo-300/35">
                    <div className="p-8 sm:p-12 liquid-scroll text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-300/35 text-indigo-200 text-xs font-extrabold uppercase tracking-[0.2em] mb-4">
                      <Vote size={14} />
                      <span>Votación de la Mesa</span>
                    </div>

                    <h2 className="text-4xl sm:text-5xl font-black text-white mb-8 tracking-tight drop-shadow">
                      {gameState.moduleStates.voting.question}
                    </h2>

                    {!gameState.moduleStates.voting.resultsRevealed ? (
                      <div className="mt-6">
                        {(() => {
                          const activeVotingPlayers = Object.keys(gameState.colors).filter(
                            (r) =>
                              gameState.colors[r] &&
                              gameState.colors[r] !== 'moderator' &&
                              !gameState.moduleStates.turns?.deadPlayers?.includes(r)
                          );
                          const allVoted =
                            activeVotingPlayers.length > 0 &&
                            activeVotingPlayers.every(
                              (r) => !!gameState.moduleStates.voting.votes[r]
                            );
                          return allVoted ? (
                            <h3 className="text-2xl text-emerald-300 font-extrabold mb-6 animate-pulse">
                              ¡Todos han votado!
                            </h3>
                          ) : (
                            <h3 className="text-2xl text-indigo-200/90 font-bold mb-6">
                              Esperando votos...
                            </h3>
                          );
                        })()}
                        <div className="flex flex-wrap justify-center gap-4">
                          {Object.keys(gameState.colors)
                            .filter(
                              (r) =>
                                gameState.colors[r] &&
                                gameState.colors[r] !== 'moderator' &&
                                !gameState.moduleStates.turns?.deadPlayers?.includes(r)
                            )
                            .map((playerRole) => {
                              const hasVoted = !!gameState.moduleStates.voting.votes[playerRole];
                              return (
                                <div
                                  key={playerRole}
                                  className={`flex items-center px-5 py-3 rounded-full border transition-all duration-300 ${
                                    hasVoted
                                      ? 'bg-emerald-500/25 border-emerald-300/60 text-white shadow-[0_0_24px_rgba(52,211,153,0.45)] scale-105'
                                      : 'liquid-glass-subtle text-slate-400 border-white/10'
                                  }`}
                                >
                                  <span
                                    className={`w-3 h-3 rounded-full mr-3 ${
                                      hasVoted
                                        ? 'bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.9)]'
                                        : 'bg-slate-600'
                                    }`}
                                  />
                                  <span className="text-xl font-bold">
                                    {gameState.names[playerRole]}
                                  </span>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-6 animate-modal-pop">
                        <h3 className="text-3xl text-amber-300 font-black mb-6 tracking-wide">
                          ¡Resultados!
                        </h3>
                        {(() => {
                          const votes = gameState.moduleStates.voting.votes;
                          const totalVotes = Math.max(1, Object.keys(votes).length);
                          const optionCounts = {};
                          Object.values(votes).forEach((opt) => {
                            optionCounts[opt] = (optionCounts[opt] || 0) + 1;
                          });
                          const sortedOptions = Object.keys(optionCounts).sort(
                            (a, b) => optionCounts[b] - optionCounts[a]
                          );

                          return (
                            <div className="space-y-4">
                              {sortedOptions.map((opt, idx) => {
                                const count = optionCounts[opt];
                                const pct = Math.round((count / totalVotes) * 100);
                                return (
                                  <div
                                    key={opt}
                                    className={`relative overflow-hidden liquid-glass-subtle p-5 rounded-2xl border ${
                                      idx === 0
                                        ? 'border-amber-400/60 shadow-[0_0_32px_-8px_rgba(251,191,36,0.45)]'
                                        : 'border-white/10'
                                    }`}
                                  >
                                    {/* Proportional animated vote bar */}
                                    <div
                                      className={`absolute inset-y-0 left-0 transition-all duration-700 ${
                                        idx === 0
                                          ? 'bg-gradient-to-r from-amber-400/20 to-amber-300/5'
                                          : 'bg-gradient-to-r from-indigo-400/15 to-transparent'
                                      }`}
                                      style={{ width: `${pct}%` }}
                                    />
                                    <div className="relative z-10 flex justify-between items-center gap-4">
                                      <div className="text-left min-w-0">
                                        <div className="flex items-center gap-2.5">
                                          {idx === 0 && (
                                            <Crown size={22} className="text-amber-300 shrink-0" />
                                          )}
                                          <span
                                            className={`text-2xl sm:text-3xl font-extrabold truncate ${
                                              idx === 0 ? 'text-amber-300' : 'text-white'
                                            }`}
                                          >
                                            {opt}
                                          </span>
                                        </div>
                                        {gameState.modules.voting.showVotesOnReveal && (
                                          <div className="text-indigo-200/85 text-base mt-1.5 font-medium">
                                            {Object.keys(votes)
                                              .filter((r) => votes[r] === opt)
                                              .map((r) => gameState.names[r])
                                              .join(', ')}
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-3 shrink-0">
                                        <span className="text-sm font-bold text-slate-300 tabular-nums">
                                          {pct}%
                                        </span>
                                        <span className="text-4xl font-black text-white tabular-nums liquid-glass-pill px-5 py-1.5 rounded-xl">
                                          {count}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                    </div>
                  </div>
                </div>
              )}

            {/* Active Turn Banner */}
            {gameState.modules.turns?.enabled && gameState.turn && (
              <div className="flex flex-col items-center mb-8 animate-fade-slide-up">
                {gameState.modules.turns.countRounds &&
                  (() => {
                    const isLastRound =
                      modules.score?.enabled &&
                      modules.score.endCondition?.type === 'rounds' &&
                      moduleStates.turns.currentRound ===
                        parseInt(modules.score.endCondition.value, 10);
                    return (
                      <div
                        className={`liquid-glass-pill font-extrabold px-6 py-1 rounded-t-2xl text-xs tracking-[0.2em] uppercase -mb-2 z-10 transition-colors tabular-nums ${
                          isLastRound
                            ? 'text-amber-300 border-amber-400/50 shadow-[0_-8px_20px_rgba(250,204,21,0.25)] animate-pulse'
                            : 'text-slate-300'
                        }`}
                      >
                        {isLastRound
                          ? 'Última Ronda'
                          : `Ronda ${moduleStates.turns.currentRound}`}
                      </div>
                    );
                  })()}
                <div
                  className={`liquid-glass-modal px-10 py-3.5 rounded-full text-2xl sm:text-3xl font-extrabold border-2 z-20 transition-all duration-300 flex items-center gap-3 ${
                    TURN_BORDER_STYLES[colors[gameState.turn]] || 'border-amber-400/60'
                  }`}
                >
                  <span
                    className={`w-3 h-3 rounded-full ${
                      DOT_COLORS[colors[gameState.turn]] || 'bg-white'
                    }`}
                  />
                  <span className="text-slate-300 font-semibold">Turno de</span>
                  <span className={TEXT_COLORS[colors[gameState.turn]] || 'text-white'}>
                    {names?.[gameState.turn] || gameState.turn}
                  </span>
                </div>
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-8 sm:gap-10 z-20 items-center max-w-6xl">
              {/* Giant Dice Stage */}
              {modules.dice.enabled && (
                <div className="liquid-glass-modal flex flex-col items-center p-8 sm:p-10 rounded-[2.5rem]">
                  <div className="flex items-center gap-8 relative">
                    <div className="flex flex-wrap justify-center gap-5 max-w-[380px]">
                      {displayDice.map((val, idx) => {
                        const isSpecialDice = lastRoll.specialIndices?.includes(idx);
                        return (
                          <DiceShape
                            key={idx}
                            faces={modules.dice.faces}
                            value={val}
                            isRolling={isRolling}
                            idx={idx}
                            isSpecial={isSpecialDice && !isRolling}
                          />
                        );
                      })}
                    </div>

                    <div className="flex flex-col items-center pl-8 border-l border-white/15">
                      <span className="text-xs text-slate-400 uppercase tracking-[0.22em] font-extrabold mb-1">
                        Total
                      </span>
                      <span
                        className={`text-7xl font-black tabular-nums transition-all duration-300 ${
                          lastRoll.isTotalSpecial && !isRolling
                            ? 'text-amber-300 scale-110 drop-shadow-[0_0_24px_rgba(250,204,21,0.85)]'
                            : 'text-white drop-shadow'
                        }`}
                      >
                        {isRolling ? '?' : lastRoll.total > 0 ? lastRoll.total : '–'}
                      </span>
                    </div>
                  </div>
                  {lastRoll.player && (
                    <div
                      className={`mt-6 px-4 py-1.5 rounded-full liquid-glass-subtle text-slate-300 text-sm font-medium tracking-wide transition-opacity duration-300 ${
                        isRolling ? 'opacity-0' : 'opacity-100'
                      }`}
                    >
                      Lanzado por{' '}
                      <span
                        className={`${TEXT_COLORS[colors[lastRoll.player]] || 'text-white'} font-extrabold`}
                      >
                        {names?.[lastRoll.player] || lastRoll.player}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Scoreboard Stage */}
              {modules.score.enabled && (
                <div className="liquid-glass-modal flex flex-col p-7 rounded-[2.25rem] min-w-[300px] sm:min-w-[330px]">
                  <div className="flex items-center justify-center gap-2 text-slate-300 font-extrabold text-xs tracking-[0.22em] uppercase mb-5 pb-3.5 border-b border-white/10">
                    <Trophy size={14} className="text-amber-300" />
                    <span>
                      {modules.score.mode === 'teams'
                        ? 'Equipos'
                        : modules.score.mode === 'global'
                          ? 'Puntuación Global'
                          : 'Puntuación'}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {(() => {
                      let entries = [];
                      if (modules.score.mode === 'individual') {
                        entries = ['Norte', 'Este', 'Sur', 'Oeste']
                          .filter((r) => colors[r] && colors[r] !== 'moderator')
                          .map((r) => ({
                            id: r,
                            label: names[r],
                            score: moduleStates.score[r] || 0,
                            color: colors[r],
                            isDead: moduleStates.turns?.deadPlayers?.includes(r),
                          }));
                      } else if (modules.score.mode === 'teams') {
                        entries = Object.keys(modules.score.teams).map((tId) => ({
                          id: tId,
                          label: modules.score.teams[tId].name,
                          score: moduleStates.score[tId] || 0,
                          color: colors[modules.score.teams[tId].colorRole],
                        }));
                      } else {
                        entries = [
                          {
                            id: 'global',
                            label: 'Global',
                            score: moduleStates.score.global || 0,
                            color: null,
                          },
                        ];
                      }

                      entries.sort((a, b) =>
                        modules.score.winCondition === 'lowest'
                          ? a.score - b.score
                          : b.score - a.score
                      );

                      return entries.map((entry, idx) => {
                        const isLeader = idx === 0 && entries.length > 1 && !entry.isDead;
                        return (
                          <div
                            key={entry.id}
                            className={`flex justify-between items-center liquid-glass-subtle px-4 py-3 rounded-2xl relative overflow-hidden transition-all ${
                              isLeader ? 'border-amber-400/40 bg-amber-500/[0.07]' : ''
                            } ${entry.isDead ? 'opacity-45' : ''}`}
                          >
                            {isLeader && (
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-300 to-yellow-500 shadow-[0_0_12px_rgba(250,204,21,1)]" />
                            )}
                            <div className={`flex items-center gap-2.5 min-w-0 ${isLeader ? 'ml-1.5' : ''}`}>
                              {entry.color && (
                                <span
                                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                    DOT_COLORS[entry.color] || 'bg-slate-400'
                                  }`}
                                />
                              )}
                              <span
                                className={`font-bold text-lg truncate ${
                                  TEXT_COLORS[entry.color] || 'text-white'
                                } ${entry.isDead ? 'line-through text-slate-500' : ''}`}
                              >
                                {entry.label}
                              </span>
                            </div>
                            <span className="text-2xl font-black tabular-nums text-white bg-slate-950/70 px-3.5 py-1 rounded-xl border border-white/10 ml-3 shrink-0">
                              {entry.score}
                            </span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : gameState.status === 'FINISHED' ? (
          <div className="liquid-glass-modal liquid-glow-amber rounded-[2.5rem] relative z-20 max-w-2xl w-full max-h-[calc(100dvh-7.5rem)] overflow-hidden flex flex-col text-center animate-modal-pop border-amber-300/35">
            <div className="px-10 sm:px-12 py-10 sm:py-12 liquid-scroll flex flex-col items-center">
              <div className="w-24 h-24 rounded-3xl bg-amber-400/15 border border-amber-300/40 flex items-center justify-center mb-6 shadow-[0_0_45px_rgba(250,204,21,0.35)]">
                <Trophy size={56} className="text-amber-300 animate-bounce" />
              </div>
              <h1 className="text-5xl sm:text-6xl font-black text-white uppercase tracking-wider drop-shadow mb-5">
                ¡Partida Terminada!
              </h1>
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-5 px-8 py-4 rounded-2xl liquid-glass-subtle border-amber-300/25">
                <span className="text-lg text-slate-300 font-bold uppercase tracking-[0.2em]">
                  Ganador
                </span>
                <span className="text-amber-300 text-5xl sm:text-6xl font-black tracking-tight">
                  {names?.[gameState.winner] ||
                    gameState.modules.score?.teams?.[gameState.winner]?.name ||
                    gameState.winner}
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Physical Tabletop Player Seat Indicators */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
        <div
          className={`px-6 py-2 rounded-full font-bold text-sm sm:text-base tracking-wide flex items-center gap-2 transition-all duration-300 ${getPlayerClass('Norte')}`}
        >
          <span>{names?.Norte || 'Norte'}</span>
          {gameState.status === 'LOBBY' && gameState.ready?.Norte && <Check size={15} />}
        </div>
      </div>

      <div
        className={`absolute left-1/2 -translate-x-1/2 z-30 pointer-events-none transition-all duration-300 ${
          gameState.status === 'PLAYING' && gameState.modules.timer?.enabled
            ? 'bottom-7'
            : 'bottom-4'
        }`}
      >
        <div
          className={`px-6 py-2 rounded-full font-bold text-sm sm:text-base tracking-wide rotate-180 flex items-center gap-2 transition-all duration-300 ${getPlayerClass('Sur')}`}
        >
          <span>{names?.Sur || 'Sur'}</span>
          {gameState.status === 'LOBBY' && gameState.ready?.Sur && <Check size={15} />}
        </div>
      </div>

      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-30 pointer-events-none">
        <div
          className={`px-6 py-2 rounded-full font-bold text-sm sm:text-base tracking-wide -rotate-90 flex items-center gap-2 transition-all duration-300 ${getPlayerClass('Oeste')}`}
        >
          <span>{names?.Oeste || 'Oeste'}</span>
          {gameState.status === 'LOBBY' && gameState.ready?.Oeste && <Check size={15} />}
        </div>
      </div>

      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-30 pointer-events-none">
        <div
          className={`px-6 py-2 rounded-full font-bold text-sm sm:text-base tracking-wide rotate-90 flex items-center gap-2 transition-all duration-300 ${getPlayerClass('Este')}`}
        >
          <span>{names?.Este || 'Este'}</span>
          {gameState.status === 'LOBBY' && gameState.ready?.Este && <Check size={15} />}
        </div>
      </div>

      {renderSystemBadges()}
    </div>
  );
};

export default TableScreen;
