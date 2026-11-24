import React from 'react';
import { ArrowLeft } from 'lucide-react';

const HostSettingsTimer = ({ gameState, socket, onBack }) => {
  const timer = gameState.modules.timer;

  const updateTimer = (updates) => {
    socket.emit('updateModules', { timer: { ...timer, ...updates } });
  };

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto">
      <div className="flex items-center space-x-4 mb-6">
        <button onClick={onBack} className="w-10 h-10 flex flex-shrink-0 items-center justify-center text-gray-400 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-bold text-white">Configurar Temporizador</h2>
      </div>

      <div className="space-y-6">
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <label className="block text-gray-300 font-bold mb-2">Segundos por Turno</label>
          <input 
            type="number"
            className="w-full bg-gray-900 text-white rounded-lg p-3 border border-gray-600 outline-none mb-2"
            value={timer.seconds}
            onChange={(e) => updateTimer({ seconds: parseInt(e.target.value) || 0 })}
          />
        </div>

        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-white font-bold">Inicio Automático</div>
              <div className="text-xs text-gray-400">Iniciar automáticamente al empezar el turno</div>
            </div>
            <button 
              onClick={() => updateTimer({ autoStart: !timer.autoStart })}
              className={`w-12 h-7 flex flex-shrink-0 items-center rounded-full p-1 transition-colors ${timer.autoStart ? 'bg-green-500' : 'bg-gray-600'}`}
            >
              <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${timer.autoStart ? 'translate-x-5' : 'translate-x-0'}`}></div>
            </button>
          </div>

          <div className="flex items-center justify-between py-4 border-t border-gray-700">
            <div>
              <div className="text-white font-bold">Pase de Turno Automático</div>
              <div className="text-xs text-gray-400">Pasar al siguiente turno si el tiempo llega a 0</div>
            </div>
            <button 
              onClick={() => updateTimer({ autoPass: !timer.autoPass })}
              className={`w-12 h-7 flex flex-shrink-0 items-center rounded-full p-1 transition-colors ${timer.autoPass ? 'bg-green-500' : 'bg-gray-600'}`}
            >
              <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${timer.autoPass ? 'translate-x-5' : 'translate-x-0'}`}></div>
            </button>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-700">
            <div>
              <div className="text-white font-bold">Permitir Pausar al Jugador</div>
              <div className="text-xs text-gray-400">El jugador activo puede pausar/reiniciar su reloj</div>
            </div>
            <button 
              onClick={() => updateTimer({ allowPlayerControls: !timer.allowPlayerControls })}
              className={`w-12 h-7 flex flex-shrink-0 items-center rounded-full p-1 transition-colors ${timer.allowPlayerControls ? 'bg-green-500' : 'bg-gray-600'}`}
            >
              <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${timer.allowPlayerControls ? 'translate-x-5' : 'translate-x-0'}`}></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostSettingsTimer;
