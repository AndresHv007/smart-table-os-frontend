import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useSocket } from '../context/SocketContext';
import { Dices, RefreshCw, Trophy, BarChart3 } from 'lucide-react';
import DiceShape from './DiceShape';
import StatisticsScreen from './StatisticsScreen';

const TableScreen = () => {
  const { socket, gameState, isConnected, serverIp, appEnv, appVersion } = useSocket();
  const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const [localIp, setLocalIp] = useState(`${window.location.origin}/mobile`);
  const [isRolling, setIsRolling] = useState(false);
  const [displayDice, setDisplayDice] = useState([]);

  useEffect(() => {
    if (isLocalHost && serverIp) {
      setLocalIp(`http://${serverIp}:${window.location.port || '5173'}/mobile`);
    } else {
      setLocalIp(`${window.location.origin}/mobile`);
    }
  }, [serverIp, isLocalHost]);

  useEffect(() => {
    if (!socket) return;
    
    const handleDiceRolled = (roll) => {
      setIsRolling(true);
      
      const interval = setInterval(() => {
        setDisplayDice(roll.values.map(() => Math.floor(Math.random() * 6) + 1));
      }, 50);

      setTimeout(() => {
        clearInterval(interval);
        setDisplayDice(roll.values);
        setIsRolling(false);
      }, 600);
    };

    socket.on('diceRolled', handleDiceRolled);
    return () => socket.off('diceRolled', handleDiceRolled);
  }, [socket]);

  useEffect(() => {
    if (!isRolling && gameState?.moduleStates?.dice?.lastRoll?.values) {
      setDisplayDice(gameState.moduleStates.dice.lastRoll.values.length > 0 ? gameState.moduleStates.dice.lastRoll.values : []);
    }
  }, [gameState?.moduleStates?.dice?.lastRoll?.values, isRolling]);

  // Local IP removed from state, using window.location.hostname

  // We don't need useEffect to set localIp since window.location.hostname is available synchronously

  if (!gameState) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  const { players, colors, names, modules, moduleStates } = gameState;
  const lastRoll = moduleStates.dice.lastRoll;

  const BG_COLORS = {
    red: 'bg-red-600 text-white', 
    blue: 'bg-blue-600 text-white', 
    green: 'bg-green-600 text-white', 
    yellow: 'bg-yellow-400 text-gray-900'
  };

  const TEXT_COLORS = {
    red: 'text-red-400', 
    blue: 'text-blue-400', 
    green: 'text-green-400', 
    yellow: 'text-yellow-400'
  };

  const getPlayerClass = (role) => {
    if (!players[role]) return 'bg-gray-700 text-gray-400 border border-gray-600 border-dashed';
    const colorId = colors[role];
    const isReady = gameState.ready?.[role];
    const readyClass = isReady 
      ? 'border-4 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.8)] scale-110' 
      : 'border-2 border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.2)]';

    if (colorId && BG_COLORS[colorId]) {
      return `${BG_COLORS[colorId]} ${readyClass}`;
    }
    return 'bg-gray-600 text-gray-300 animate-pulse'; // Joined but picking color
  };

  const BORDER_COLORS = {
    red: 'border-red-500',
    blue: 'border-blue-500',
    green: 'border-green-500',
    yellow: 'border-yellow-500'
  };

  return (
    <div className="relative w-full h-full bg-green-900 overflow-hidden flex flex-col items-center justify-center">
      {/* Background / Board Placeholder */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'url(https://www.transparenttextures.com/patterns/cubes.png)' }}></div>

      {gameState.showStats && <StatisticsScreen onClose={() => {}} isTV={true} />}

      {/* Massive Timer Progress Bar */}
      {gameState.status === 'PLAYING' && gameState.modules.timer?.enabled && (
        <div className="absolute bottom-0 left-0 w-full h-4 bg-gray-900 z-50">
          <div 
            className={`h-full transition-colors ${gameState.moduleStates.timer.timeLeft <= 10 ? 'bg-red-500 animate-pulse' : gameState.moduleStates.timer.timeLeft <= gameState.modules.timer.seconds / 2 ? 'bg-yellow-400' : 'bg-green-500'}`}
            style={{ 
              width: `${(gameState.moduleStates.timer.timeLeft / Math.max(1, gameState.modules.timer.seconds)) * 100}%`,
              transition: 'width 1s linear'
            }}
          ></div>
        </div>
      )}

      {/* Background Timer Number */}
      {gameState.status === 'PLAYING' && gameState.modules.timer?.enabled && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
          <span className={`text-[400px] font-black opacity-10 select-none ${gameState.moduleStates.timer.timeLeft <= 10 ? 'text-red-500' : 'text-white'}`}>
            {gameState.moduleStates.timer.timeLeft}
          </span>
        </div>
      )}

      <div className="z-10 w-full h-full flex items-center justify-center relative">
        {/* Connection QR Code */}
        {gameState.status === 'LOBBY' ? (
          <div className="bg-gray-800 p-10 rounded-3xl shadow-2xl border border-gray-700 flex flex-col items-center z-20">
            <h1 className={`text-4xl font-black text-white tracking-wider ${gameState.activePreset ? 'mb-2' : 'mb-8'}`}>Smart Table OS</h1>
            {gameState.activePreset && (
              <div className="mb-8 bg-blue-900/40 border border-blue-500/50 px-6 py-2 rounded-2xl shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                <h2 className="text-2xl font-black text-blue-300 uppercase tracking-widest">{gameState.activePreset}</h2>
              </div>
            )}
            <div className="bg-white p-4 rounded-xl flex flex-col items-center justify-center" style={{ minWidth: 232, minHeight: 256 }}>
              {localIp ? (
                <QRCodeSVG value={localIp} size={200} />
              ) : (
                <div className="w-[200px] h-[200px] bg-gray-200 animate-pulse rounded"></div>
              )}
              <p className="text-center text-gray-800 font-bold mt-4 text-lg">Únete a la partida</p>
            </div>
            <p className="mt-8 text-gray-400 text-xl font-medium animate-pulse">Esperando jugadores...</p>
            
            <div className="mt-6 flex flex-wrap justify-center gap-4 max-w-[550px]">
              {modules.turns?.enabled && (
                <div className="bg-gray-700 px-4 py-2 rounded-xl flex items-center space-x-2 text-gray-300">
                  <RefreshCw size={20} />
                  <span className="font-bold">Turnos</span>
                </div>
              )}
              {modules.timer?.enabled && (
                <div className="bg-gray-700 px-4 py-2 rounded-xl flex items-center space-x-2 text-gray-300">
                  <span className="font-bold">⏱ Tiempo</span>
                </div>
              )}
              {modules.dice?.enabled && (
                <div className="bg-gray-700 px-4 py-2 rounded-xl flex items-center space-x-2 text-gray-300">
                  <Dices size={20} />
                  <span className="font-bold">Dados</span>
                </div>
              )}
              {modules.score?.enabled && (
                <div className="bg-gray-700 px-4 py-2 rounded-xl flex items-center space-x-2 text-gray-300">
                  <div className="font-black text-xl leading-none">#</div>
                  <span className="font-bold">Puntos</span>
                </div>
              )}
              {modules.voting?.enabled && (
                <div className="bg-gray-700 px-4 py-2 rounded-xl flex items-center space-x-2 text-gray-300">
                  <span className="font-bold">✋ Votación</span>
                </div>
              )}
              {modules.hiddenRoles?.enabled && (
                <div className="bg-gray-700 px-4 py-2 rounded-xl flex items-center space-x-2 text-gray-300">
                  <span className="font-bold">🛡 Roles</span>
                </div>
              )}
            </div>
          </div>
        ) : gameState.status === 'PLAYING' ? (
          <div className="flex flex-col items-center justify-center relative z-10 w-full h-full">
            {/* Voting Overlay */}
            {gameState.modules.voting?.enabled && (gameState.moduleStates.voting?.active || gameState.moduleStates.voting?.resultsRevealed) && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-500">
                <div className="bg-indigo-900/90 p-12 rounded-[3rem] border-2 border-indigo-500 shadow-[0_0_50px_rgba(99,102,241,0.5)] max-w-4xl w-full text-center">
                  <h2 className="text-6xl font-black text-white mb-8 drop-shadow-lg flex items-center justify-center">
                    <span className="mr-6 text-7xl">✋</span> {gameState.moduleStates.voting.question}
                  </h2>

                  {!gameState.moduleStates.voting.resultsRevealed ? (
                    <div className="mt-12">
                      {(() => {
                        const activeVotingPlayers = Object.keys(gameState.colors).filter(r => gameState.colors[r] && gameState.colors[r] !== 'moderator' && !gameState.moduleStates.turns?.deadPlayers?.includes(r));
                        const allVoted = activeVotingPlayers.length > 0 && activeVotingPlayers.every(r => !!gameState.moduleStates.voting.votes[r]);
                        return allVoted ? (
                          <h3 className="text-3xl text-green-400 font-bold mb-6 animate-pulse">¡Todos han votado!</h3>
                        ) : (
                          <h3 className="text-3xl text-indigo-300 font-bold mb-6">Esperando Votos...</h3>
                        );
                      })()}
                      <div className="flex flex-wrap justify-center gap-6">
                        {Object.keys(gameState.colors)
                          .filter(r => gameState.colors[r] && gameState.colors[r] !== 'moderator' && !gameState.moduleStates.turns?.deadPlayers?.includes(r))
                          .map(playerRole => {
                            const hasVoted = !!gameState.moduleStates.voting.votes[playerRole];
                            return (
                              <div key={playerRole} className={`flex items-center px-6 py-3 rounded-full border-2 transition-all ${hasVoted ? 'bg-green-600/80 border-green-400 text-white shadow-[0_0_20px_rgba(74,222,128,0.5)] scale-110' : 'bg-gray-800/80 border-gray-600 text-gray-400'}`}>
                                <span className={`w-4 h-4 rounded-full mr-3 ${hasVoted ? 'bg-green-300 animate-pulse' : 'bg-gray-500'}`}></span>
                                <span className="text-2xl font-bold">{gameState.names[playerRole]}</span>
                              </div>
                            );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-12 animate-in zoom-in duration-500">
                      <h3 className="text-4xl text-yellow-400 font-black mb-8 drop-shadow-md">¡Resultados!</h3>
                      {(() => {
                        const votes = gameState.moduleStates.voting.votes;
                        const optionCounts = {};
                        Object.values(votes).forEach(opt => {
                          optionCounts[opt] = (optionCounts[opt] || 0) + 1;
                        });
                        const sortedOptions = Object.keys(optionCounts).sort((a, b) => optionCounts[b] - optionCounts[a]);

                        return (
                          <div className="space-y-6">
                            {sortedOptions.map((opt, idx) => (
                              <div key={opt} className={`bg-gray-800/80 p-6 rounded-2xl flex justify-between items-center border ${idx === 0 ? 'border-yellow-500 shadow-[0_0_30px_rgba(250,204,21,0.3)]' : 'border-gray-700'}`}>
                                <div className="text-left">
                                  <span className={`text-3xl font-bold ${idx === 0 ? 'text-yellow-400' : 'text-white'}`}>{opt}</span>
                                  {gameState.modules.voting.showVotesOnReveal && (
                                    <div className="text-indigo-300 text-lg mt-2 font-medium">
                                      {Object.keys(votes).filter(r => votes[r] === opt).map(r => gameState.names[r]).join(', ')}
                                    </div>
                                  )}
                                </div>
                                <span className="text-5xl font-black text-white bg-gray-900 px-6 py-2 rounded-xl">{optionCounts[opt]}</span>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Active Turn Banner */}
            {gameState.modules.turns?.enabled && gameState.turn && (
              <div className="flex flex-col items-center mb-8">
                {gameState.modules.turns.countRounds && (() => {
                  const isLastRound = modules.score?.enabled && modules.score.endCondition?.type === 'rounds' && moduleStates.turns.currentRound === parseInt(modules.score.endCondition.value);
                  return (
                    <div className={`bg-gray-800 font-bold px-8 py-1 rounded-t-2xl text-xl tracking-widest uppercase border-t border-l border-r -mb-2 z-10 transition-colors ${isLastRound ? 'text-yellow-400 border-yellow-500 shadow-[0_-10px_20px_rgba(250,204,21,0.2)] animate-pulse' : 'text-gray-400 border-gray-700'}`}>
                      {isLastRound ? 'Última Ronda' : `Ronda ${moduleStates.turns.currentRound}`}
                    </div>
                  );
                })()}
                <div className={`bg-gray-900/95 px-12 py-4 rounded-full text-3xl font-bold border-4 shadow-[0_0_30px_rgba(0,0,0,0.5)] z-20 transition-all ${BORDER_COLORS[colors[gameState.turn]] || 'border-yellow-500'}`}>
                  <span className="text-gray-300">Turno de: </span>
                  <span className={`${TEXT_COLORS[colors[gameState.turn]] || 'text-white'}`}>
                    {names?.[gameState.turn] || gameState.turn}
                  </span>
                </div>
              </div>
            )}
            
            <div className="flex space-x-12 z-20 items-center">
              {/* Giant Dice Results */}
              {modules.dice.enabled && (
                <div className="flex flex-col items-center bg-gray-900/95 p-12 rounded-[3rem] border border-gray-700 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                  <div className="flex items-center space-x-8 relative max-w-4xl">
                    
                    <div className="flex flex-wrap justify-center gap-6 w-full max-w-[400px]">
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

                    <div className="flex flex-col items-center ml-6 px-6 border-l-2 border-gray-700">
                      <span className="text-xl text-gray-400 uppercase tracking-widest font-bold mb-2">Total</span>
                      <span className={`text-7xl font-black drop-shadow-lg transition-colors ${lastRoll.isTotalSpecial && !isRolling ? 'text-yellow-400 scale-110 drop-shadow-[0_0_20px_rgba(250,204,21,0.8)]' : 'text-white'}`}>
                        {isRolling ? '?' : (lastRoll.total > 0 ? lastRoll.total : '-')}
                      </span>
                    </div>
                  </div>
                  {lastRoll.player && (
                    <div className={`text-gray-400 text-xl mt-6 font-medium tracking-wide transition-opacity duration-300 ${isRolling ? 'opacity-0' : 'opacity-100'}`}>
                      Lanzado por: <span className={`${TEXT_COLORS[colors[lastRoll.player]] || 'text-white'} font-bold`}>{names?.[lastRoll.player] || lastRoll.player}</span>
                    </div>
                  )}
                </div>
              )}
              
              {/* Scoreboard */}
              {modules.score.enabled && (
                <div className="flex flex-col bg-gray-900/95 p-8 rounded-[3rem] border border-gray-700 shadow-[0_20px_50px_rgba(0,0,0,0.5)] min-w-[300px]">
                  <h3 className="text-gray-400 text-center font-bold tracking-widest uppercase mb-6 border-b border-gray-700 pb-4">
                    {modules.score.mode === 'teams' ? 'Equipos' : modules.score.mode === 'global' ? 'Puntuación Global' : 'Puntuación'}
                  </h3>
                  <div className="space-y-4">
                    {(() => {
                      let entries = [];
                      if (modules.score.mode === 'individual') {
                        entries = ['Norte', 'Este', 'Sur', 'Oeste'].filter(r => colors[r] && colors[r] !== 'moderator').map(r => ({
                          id: r, label: names[r], score: moduleStates.score[r] || 0, color: colors[r],
                          isDead: moduleStates.turns?.deadPlayers?.includes(r)
                        }));
                      } else if (modules.score.mode === 'teams') {
                        entries = Object.keys(modules.score.teams).map(tId => ({
                          id: tId, label: modules.score.teams[tId].name, score: moduleStates.score[tId] || 0, color: colors[modules.score.teams[tId].colorRole]
                        }));
                      } else {
                        entries = [{ id: 'global', label: 'Global', score: moduleStates.score.global || 0, color: null }];
                      }

                      // Sort entries
                      entries.sort((a, b) => modules.score.winCondition === 'lowest' ? a.score - b.score : b.score - a.score);

                      return entries.map((entry, idx) => (
                        <div key={entry.id} className={`flex justify-between items-center bg-gray-800 p-4 rounded-xl border border-gray-700 relative overflow-hidden ${entry.isDead ? 'opacity-50' : ''}`}>
                          {idx === 0 && entries.length > 1 && !entry.isDead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500 shadow-[0_0_10px_rgba(250,204,21,1)]"></div>}
                          <span className={`font-bold text-xl ${TEXT_COLORS[entry.color] || 'text-white'} ${idx===0 && entries.length>1 && !entry.isDead ? 'ml-2':''} ${entry.isDead ? 'line-through text-gray-500' : ''}`}>{entry.label}</span>
                          <span className="text-3xl font-black text-white bg-gray-900 px-4 py-1 rounded-lg border border-gray-600">{entry.score}</span>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : gameState.status === 'FINISHED' ? (
          <div className="flex flex-col items-center justify-center relative z-20 w-full h-full animate-in zoom-in duration-500">
            <Trophy size={120} className="text-yellow-400 mb-8 animate-bounce" />
            <h1 className="text-6xl font-black text-white uppercase tracking-widest drop-shadow-[0_0_30px_rgba(250,204,21,0.5)] mb-4">¡Partida Terminada!</h1>
            <div className="flex items-center space-x-6">
              <span className="text-4xl text-gray-300 font-bold uppercase tracking-widest mt-2">Ganador:</span>
              <span className="text-yellow-400 text-7xl font-black">{names[gameState.winner] || gameState.winner || gameState.modules.score.teams?.[gameState.winner]?.name}</span>
            </div>
          </div>
        ) : null}
      </div>

      {/* Players Indicators */}
      <div className="absolute top-4 w-full flex justify-center">
        <div className={`px-6 py-2 rounded-full font-bold transition-all ${getPlayerClass('Norte')}`}>{names?.Norte || 'Norte'}</div>
      </div>
      <div className={`absolute w-full flex justify-center transition-all ${gameState.status === 'PLAYING' && gameState.modules.timer?.enabled ? 'bottom-8' : 'bottom-4'}`}>
        <div className={`px-6 py-2 rounded-full font-bold rotate-180 transition-all ${getPlayerClass('Sur')}`}>{names?.Sur || 'Sur'}</div>
      </div>
      <div className="absolute left-4 h-full flex flex-col justify-center">
        <div className={`px-6 py-2 rounded-full font-bold -rotate-90 transition-all ${getPlayerClass('Oeste')}`}>{names?.Oeste || 'Oeste'}</div>
      </div>
      <div className="absolute right-4 h-full flex flex-col justify-center">
        <div className={`px-6 py-2 rounded-full font-bold rotate-90 transition-all ${getPlayerClass('Este')}`}>{names?.Este || 'Este'}</div>
      </div>
      
      {!isConnected && (
        <div className="absolute top-2 left-2 text-red-500 font-bold text-sm">Offline</div>
      )}

      {/* Environment & Version Badge */}
      <div className="absolute top-3 right-3 z-40 flex items-center space-x-2 bg-gray-900/80 border border-gray-700 px-3 py-1 rounded-full text-xs font-bold tracking-wider">
        <span
          className={`w-2 h-2 rounded-full ${
            appEnv === 'production' ? 'bg-emerald-400' : 'bg-amber-400'
          }`}
        />
        <span className={appEnv === 'production' ? 'text-emerald-300' : 'text-amber-300'}>
          {appEnv === 'production' ? 'PROD' : 'DEV'}
        </span>
        <span className="text-gray-400">·</span>
        <span className="text-gray-300">{appVersion}</span>
      </div>
    </div>
  );
};

export default TableScreen;
