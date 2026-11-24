import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

const HostSettingsScore = ({ gameState, socket, onBack }) => {
  const score = gameState.modules.score;
  const [newTeamId, setNewTeamId] = useState(1);

  const updateScore = (updates) => {
    socket.emit('updateModules', { score: { ...score, ...updates } });
  };

  const activeRoles = Object.keys(gameState.colors).filter(r => gameState.colors[r] !== null);

  const handleModeChange = (e) => {
    const mode = e.target.value;
    updateScore({ mode });
    if (mode === 'teams' && Object.keys(score.teams).length === 0) {
      // Create initial teams
      updateScore({
        teams: {
          team1: { name: 'Equipo 1', members: [], colorRole: null },
          team2: { name: 'Equipo 2', members: [], colorRole: null }
        }
      });
      setNewTeamId(3);
    }
  };

  const addTeam = () => {
    const id = `team${newTeamId}`;
    setNewTeamId(newTeamId + 1);
    updateScore({
      teams: {
        ...score.teams,
        [id]: { name: `Equipo ${newTeamId}`, members: [], colorRole: null }
      }
    });
  };

  const assignPlayerToTeam = (role, teamId) => {
    const newTeams = JSON.parse(JSON.stringify(score.teams));
    
    // Remove from other teams
    Object.keys(newTeams).forEach(tId => {
      newTeams[tId].members = newTeams[tId].members.filter(m => m !== role);
    });

    // Add to target team
    newTeams[teamId].members.push(role);
    
    // Set color if it's the first member
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
    <div className="flex-1 flex flex-col p-6 overflow-y-auto">
      <div className="flex items-center space-x-4 mb-6">
        <button onClick={onBack} className="w-10 h-10 flex flex-shrink-0 items-center justify-center text-gray-400 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-bold text-white">Configurar Puntuación</h2>
      </div>

      <div className="space-y-6 pb-20">
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <label className="block text-gray-300 font-bold mb-2">Modo de Puntuación</label>
          <select 
            className="w-full bg-gray-900 text-white rounded-lg p-3 border border-gray-600 outline-none"
            value={score.mode}
            onChange={handleModeChange}
          >
            <option value="individual">Individual (Todos contra todos)</option>
            <option value="global">Global (Cooperativo)</option>
            <option value="teams">Por Equipos</option>
          </select>
        </div>

        {score.mode === 'teams' && (
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
            <h3 className="text-white font-bold mb-4">Equipos</h3>
            <div className="space-y-4">
              {Object.keys(score.teams).map(tId => {
                const team = score.teams[tId];
                return (
                  <div key={tId} className="bg-gray-900 border border-gray-700 p-3 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-white">{team.name}</span>
                      <button onClick={() => removeTeam(tId)} className="text-red-500 text-xs">Eliminar</button>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {team.members.map(m => (
                        <span key={m} className="px-2 py-1 bg-gray-800 text-xs rounded text-gray-300">
                          {gameState.names[m] || m}
                        </span>
                      ))}
                      {team.members.length === 0 && <span className="text-gray-500 text-xs italic">Vacío</span>}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2 border-t border-gray-800 pt-2">
                      <span className="text-xs text-gray-500 w-full mb-1">Añadir jugador:</span>
                      {activeRoles.filter(r => !team.members.includes(r)).map(r => (
                        <button 
                          key={r}
                          onClick={() => assignPlayerToTeam(r, tId)}
                          className="bg-gray-700 text-white text-xs px-2 py-1 rounded"
                        >
                          + {gameState.names[r] || r}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
              <button 
                onClick={addTeam}
                className="w-full py-2 bg-gray-700 text-white rounded border border-gray-600 border-dashed"
              >
                + Añadir Nuevo Equipo
              </button>
            </div>
          </div>
        )}

        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <label className="block text-gray-300 font-bold mb-2">Condición para Ganar</label>
          <select 
            className="w-full bg-gray-900 text-white rounded-lg p-3 pr-10 border border-gray-600 outline-none"
            value={score.winCondition}
            onChange={(e) => updateScore({ winCondition: e.target.value })}
          >
            <option value="highest">El mayor puntaje gana</option>
            <option value="lowest">El menor puntaje gana</option>
          </select>
        </div>

        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <label className="block text-gray-300 font-bold mb-2">Meta de Fin de Juego</label>
          
          <select 
            className="w-full bg-gray-900 text-white rounded-lg p-3 pr-10 border border-gray-600 outline-none mb-3"
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
            <div className="flex space-x-2">
              <select 
                className="flex-1 bg-gray-900 text-white rounded-lg p-2 pr-8 border border-gray-600 outline-none text-sm"
                value={score.endCondition.direction}
                onChange={(e) => updateScore({ endCondition: { ...score.endCondition, direction: e.target.value } })}
              >
                <option value="above">Llegar a (o más)</option>
                <option value="below">Bajar a (o menos)</option>
              </select>
              <input 
                type="number"
                className="w-20 bg-gray-900 text-white rounded-lg p-2 border border-gray-600 outline-none text-center"
                value={score.endCondition.value}
                onChange={(e) => updateScore({ endCondition: { ...score.endCondition, value: parseInt(e.target.value) || 0 } })}
              />
            </div>
          )}

          {score.endCondition?.type === 'rounds' && (
            <div className="flex space-x-2 items-center">
              <span className="flex-1 text-sm text-gray-400">Terminar después de la ronda:</span>
              <input 
                type="number"
                className="w-20 bg-gray-900 text-white rounded-lg p-2 border border-gray-600 outline-none text-center"
                value={score.endCondition.value}
                onChange={(e) => updateScore({ endCondition: { ...score.endCondition, value: parseInt(e.target.value) || 0 } })}
              />
            </div>
          )}
        </div>

        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <label className="block text-gray-300 font-bold mb-2">Puntuación Inicial</label>
          <div className="text-xs text-gray-400 mb-3">Con cuántos puntos empiezan los jugadores o equipos.</div>
          <input 
            type="number"
            className="w-full bg-gray-900 text-white rounded-lg p-3 border border-gray-600 outline-none text-center"
            value={score.initialScore !== undefined ? score.initialScore : 0}
            onChange={(e) => updateScore({ initialScore: parseInt(e.target.value) || 0 })}
          />
        </div>
      </div>
    </div>
  );
};

export default HostSettingsScore;
