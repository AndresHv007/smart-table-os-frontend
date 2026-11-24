import React, { useEffect, useState } from 'react';
import { Trophy, History, Medal, X } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

const StatisticsScreen = ({ onClose, isTV = false }) => {
  const { socket, gameState } = useSocket();
  const [stats, setStats] = useState({ leaderboard: [], history: [], profiles: [] });
  const [loading, setLoading] = useState(true);

  const activeTab = gameState?.activeStatsTab || 'leaderboard';

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
          setStats({ leaderboard: data.leaderboard || [], history: data.history || [], profiles: data.profiles || [] });
        }
        setLoading(false);
      });
    };

    fetchStats();
    socket.on('statsUpdated', fetchStats);
    
    return () => socket.off('statsUpdated', fetchStats);
  }, [socket]);

  return (
    <div className="absolute inset-0 bg-gray-900/95 z-50 flex flex-col p-8 overflow-hidden backdrop-blur-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
        <h1 className="text-4xl font-black text-white flex items-center space-x-4">
          <Trophy size={40} className="text-yellow-400" />
          <span>Salón de la Fama</span>
        </h1>
        {!isTV && (
          <button 
            onClick={onClose}
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 p-3 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        )}
      </div>

      <div className={`grid grid-cols-2 gap-2 mb-6 ${isTV ? 'opacity-90 pointer-events-none' : ''}`}>
        <button 
          onClick={() => handleTabClick('leaderboard')}
          className={`flex items-center justify-center space-x-2 p-3 rounded-xl font-bold transition-colors ${activeTab === 'leaderboard' ? 'bg-yellow-500 text-yellow-950' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
        >
          <Medal size={20} className="flex-shrink-0" />
          <span className="text-sm sm:text-lg truncate">Clasificación</span>
        </button>
        <button 
          onClick={() => handleTabClick('history')}
          className={`flex items-center justify-center space-x-2 p-3 rounded-xl font-bold transition-colors ${activeTab === 'history' ? 'bg-blue-500 text-blue-950' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
        >
          <History size={20} className="flex-shrink-0" />
          <span className="text-sm sm:text-lg truncate">Historial</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto bg-gray-800/50 rounded-3xl border border-gray-700 p-6 relative">
        {loading ? (
          <div className="flex h-full items-center justify-center text-2xl text-gray-400 animate-pulse">
            Cargando estadísticas...
          </div>
        ) : (
          <>
            {!isTV && (
              <div className="bg-blue-900/30 border border-blue-800 p-4 rounded-2xl text-center mb-6">
                <h3 className="text-lg text-blue-400 font-bold">Control Remoto de TV</h3>
                <p className="text-gray-400 text-sm">Navegar aquí también cambia la vista en la pantalla de la mesa.</p>
              </div>
            )}
            {activeTab === 'leaderboard' && (
              <div className="space-y-4">
                {stats.leaderboard.length === 0 ? (
                  <div className="text-center text-gray-500 py-12">Aún no hay partidas registradas.</div>
                ) : (
                  stats.leaderboard.map((user, idx) => (
                    <div key={user.name} className="flex items-center justify-between bg-gray-800 p-4 rounded-2xl border border-gray-700 shadow-md">
                      <div className="flex items-center space-x-4 sm:space-x-6 overflow-hidden">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-full flex items-center justify-center font-black text-lg sm:text-xl ${idx === 0 ? 'bg-yellow-500 text-yellow-950 shadow-[0_0_15px_rgba(250,204,21,0.5)]' : idx === 1 ? 'bg-gray-300 text-gray-800' : idx === 2 ? 'bg-amber-700 text-amber-100' : 'bg-gray-700 text-gray-400'}`}>
                          #{idx + 1}
                        </div>
                        <span className="text-xl sm:text-2xl font-bold text-white truncate">{user.name}</span>
                      </div>
                      <div className="text-lg sm:text-xl font-bold text-yellow-400 flex-shrink-0 ml-2">
                        {user.wins} {isTV ? (user.wins === 1 ? 'Victoria' : 'Victorias') : ''}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                {stats.history.length === 0 ? (
                  <div className="text-center text-gray-500 py-12">Aún no hay historial de partidas.</div>
                ) : (
                  stats.history.map((game) => (
                    <div key={game.id} className="bg-gray-800 p-5 rounded-2xl border border-gray-700 shadow-md">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-700 pb-3 mb-3 gap-3">
                        <div className="flex flex-col items-start gap-1 w-full sm:w-auto">
                          <span className="text-sm font-bold bg-blue-900 text-blue-300 px-3 py-1 rounded-full truncate max-w-full">{game.presetName || 'Custom'}</span>
                          <span className="text-xs text-gray-400">{new Date(game.date).toLocaleString()}</span>
                        </div>
                        <div className="text-yellow-400 font-bold flex items-center space-x-2 shrink-0">
                          <Trophy size={16} />
                          <span className="truncate max-w-[150px] sm:max-w-[200px]">{game.winnerName || 'Empate / Sin Ganador'}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(game.scoresData || {}).map(([name, score]) => (
                          <div key={name} className="flex justify-between items-center bg-gray-900/50 p-2 rounded-lg">
                            <span className="text-gray-300 truncate mr-2">{name}</span>
                            <span className="font-bold text-white">{score}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
                
                {!isTV && (
                  <div className="pt-6 border-t border-gray-700 mt-6">
                    <button 
                      onClick={() => document.getElementById('addRecordDialog').showModal()}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl flex items-center justify-center transition-all shadow-lg active:scale-95"
                    >
                      <span className="text-xl">+ Nuevo Registro al Historial</span>
                    </button>
                    
                    <dialog id="addRecordDialog" className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-2xl backdrop:bg-black/80 max-w-md w-full">
                      <AddRecordForm onClose={() => document.getElementById('addRecordDialog').close()} profiles={stats.profiles} isTV={isTV} />
                    </dialog>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const AddRecordForm = ({ onClose, profiles = [], isTV }) => {
  const { socket } = useSocket();
  const [recordPreset, setRecordPreset] = useState('Custom');
  const [recordWinner, setRecordWinner] = useState('');
  const [playerScores, setPlayerScores] = useState([{ name: '', score: '' }]);
  const [error, setError] = useState('');

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

    socket.emit('addManualRecord', {
      presetName: recordPreset,
      winnerName: recordWinner,
      scores: parsedScores
    }, (res) => {
      if (res.success) {
        alert('Registro añadido con éxito.');
        setRecordPreset('Custom');
        setRecordWinner('');
        setPlayerScores([{ name: '', score: '' }]);
        onClose();
        socket.emit('getStats', () => {}); 
      } else {
        setError(res.error);
      }
    });
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
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white text-xl font-bold">Nuevo Registro</h3>
        <button type="button" onClick={onClose} className="text-gray-400 hover:text-white"><X size={20}/></button>
      </div>
      
      {error && <div className="text-red-400 text-sm bg-red-900/30 p-2 rounded">{error}</div>}
      
      <div>
        <label className="block text-gray-400 text-xs mb-1">Nombre del Juego / Preset</label>
        <input 
          value={recordPreset} onChange={e => setRecordPreset(e.target.value)}
          className="w-full bg-gray-900 text-white p-3 rounded-xl border border-gray-700 outline-none focus:border-blue-500" required 
        />
      </div>
      
      <div>
        <label className="block text-gray-400 text-xs mb-1">Ganador</label>
        <select 
          value={recordWinner} 
          onChange={e => {
            const newWinner = e.target.value;
            setRecordWinner(newWinner);
            if (newWinner !== 'Empate') {
              const exists = playerScores.find(ps => ps.name === newWinner);
              if (!exists) {
                setPlayerScores([{ name: newWinner, score: '' }, ...playerScores]);
              }
            }
          }}
          className="w-full bg-gray-900 text-white p-3 rounded-xl border border-gray-700 outline-none focus:border-blue-500" required 
        >
          <option value="" disabled>Selecciona al ganador</option>
          {profiles.map(p => (
            <option key={p.id} value={p.name}>{p.name}</option>
          ))}
          <option value="Empate">Empate</option>
        </select>
      </div>

      <div>
        <label className="block text-gray-400 text-xs mb-2">Puntuaciones</label>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {playerScores.map((ps, index) => (
            <div key={index} className="flex space-x-2 items-center">
              <select 
                value={ps.name} onChange={e => updatePlayerScore(index, 'name', e.target.value)}
                className="flex-1 bg-gray-900 text-white p-2 rounded-xl border border-gray-700 text-sm outline-none" required
              >
                <option value="" disabled>Jugador</option>
                {profiles.map(p => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
              <input 
                type="number" 
                placeholder="Ptos"
                value={ps.score} onChange={e => updatePlayerScore(index, 'score', e.target.value)}
                className="w-20 bg-gray-900 text-white p-2 rounded-xl border border-gray-700 text-sm text-center outline-none" required 
              />
              <button 
                type="button" 
                onClick={() => removePlayerScore(index)} 
                disabled={ps.name === recordWinner && ps.name !== ''}
                className={`p-2 ${ps.name === recordWinner && ps.name !== '' ? 'text-gray-600 opacity-50 cursor-not-allowed' : 'text-red-500 hover:text-red-400'}`}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addPlayerScore} className="mt-2 text-sm text-blue-400 font-bold flex items-center hover:text-blue-300">
          + Añadir Jugador
        </button>
      </div>

      <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all">
        Guardar Registro
      </button>
    </form>
  );
};

export default StatisticsScreen;
