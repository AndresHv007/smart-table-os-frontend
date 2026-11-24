import React from 'react';
import { ArrowLeft } from 'lucide-react';

const HostSettingsTurns = ({ gameState, socket, onBack }) => {
  const turns = gameState.modules.turns;

  const updateTurns = (updates) => {
    socket.emit('updateModules', { turns: { ...turns, ...updates } });
  };

  const activeRoles = Object.keys(gameState.colors).filter(r => gameState.colors[r] !== null);

  const addRoleToCustom = (role) => {
    updateTurns({ customOrder: [...turns.customOrder, role] });
  };

  const clearCustomOrder = () => {
    updateTurns({ customOrder: [] });
  };

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto">
      <div className="flex items-center space-x-4 mb-6">
        <button onClick={onBack} className="w-10 h-10 flex flex-shrink-0 items-center justify-center text-gray-400 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-bold text-white">Configurar Turnos</h2>
      </div>

      <div className="space-y-6">
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <label className="block text-gray-300 font-bold mb-2">Sentido de Turnos</label>
          <select 
            className="w-full bg-gray-900 text-white rounded-lg p-3 pr-10 border border-gray-600 outline-none"
            value={turns.orderType}
            onChange={(e) => updateTurns({ orderType: e.target.value })}
          >
            <option value="clockwise">Horario (Normal)</option>
            <option value="counterclockwise">Antihorario</option>
            <option value="custom">Orden Personalizado</option>
          </select>
        </div>
        
        {gameState.status === 'LOBBY' && (
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
            <label className="block text-gray-300 font-bold mb-2">Primer Jugador</label>
            <select 
              className="w-full bg-gray-900 text-white rounded-lg p-3 pr-10 border border-gray-600 outline-none"
              value={turns.firstPlayer || 'random'}
              onChange={(e) => updateTurns({ firstPlayer: e.target.value })}
            >
              <option value="random">Aleatorio (Por Defecto)</option>
              {activeRoles.map(r => (
                <option key={r} value={r}>{gameState.names[r] || r}</option>
              ))}
            </select>
          </div>
        )}

        {turns.orderType === 'custom' && (
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
            <h3 className="text-white font-bold mb-4">Secuencia Personalizada</h3>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {turns.customOrder.map((r, i) => (
                <div key={i} className="flex items-center space-x-1 bg-gray-700 text-white px-2 py-1 rounded-md text-sm">
                  <span>{i+1}. {gameState.names[r] || r}</span>
                </div>
              ))}
              {turns.customOrder.length === 0 && <span className="text-gray-500 text-sm">La secuencia está vacía. Selecciona abajo.</span>}
            </div>
            
            {turns.customOrder.length > 0 && (
              <button onClick={clearCustomOrder} className="mb-4 text-xs bg-red-900/50 text-red-400 px-3 py-1 rounded">
                Limpiar Secuencia
              </button>
            )}

            <div className="border-t border-gray-700 pt-4">
              <label className="block text-gray-400 text-xs mb-2">Añadir al ciclo (El ciclo se repetirá infinitamente):</label>
              <div className="grid grid-cols-2 gap-2">
                {activeRoles.map(r => (
                  <button 
                    key={r}
                    onClick={() => addRoleToCustom(r)}
                    className="bg-gray-900 border border-gray-600 text-white rounded-lg p-2 text-sm active:bg-gray-700"
                  >
                    + {gameState.names[r] || r}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-white font-bold">Llevar Cuenta de Rondas</div>
              <div className="text-xs text-gray-400">Mostrar número de ronda en pantalla</div>
            </div>
            <button 
              onClick={() => updateTurns({ countRounds: !turns.countRounds })}
              className={`w-12 h-7 flex flex-shrink-0 items-center rounded-full p-1 transition-colors ${turns.countRounds ? 'bg-green-500' : 'bg-gray-600'}`}
            >
              <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${turns.countRounds ? 'translate-x-5' : 'translate-x-0'}`}></div>
            </button>
          </div>

          {turns.countRounds && (
            <>
              <div className="flex items-center justify-between mb-4 border-t border-gray-700 pt-4">
                <div>
                  <div className="text-white font-bold text-sm">Avance Automático</div>
                  <div className="text-xs text-gray-400">Avanzar ronda al reiniciar el ciclo de turnos</div>
                </div>
                <button 
                  onClick={() => updateTurns({ autoRound: !turns.autoRound })}
                  className={`w-12 h-7 flex flex-shrink-0 items-center rounded-full p-1 transition-colors ${turns.autoRound ? 'bg-green-500' : 'bg-gray-600'}`}
                >
                  <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${turns.autoRound ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </button>
              </div>

            </>
          )}
        </div>

        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-bold">Panel de Moderador en Juego</div>
              <div className="text-xs text-gray-400 max-w-[200px]">Muestra los controles del host para matar jugadores y alterar puntos manualmente.</div>
            </div>
            <button 
              onClick={() => updateTurns({ showModeratorPanel: !turns.showModeratorPanel })}
              className={`w-12 h-7 flex flex-shrink-0 items-center rounded-full p-1 transition-colors ${turns.showModeratorPanel ? 'bg-green-500' : 'bg-gray-600'}`}
            >
              <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${turns.showModeratorPanel ? 'translate-x-5' : 'translate-x-0'}`}></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostSettingsTurns;
