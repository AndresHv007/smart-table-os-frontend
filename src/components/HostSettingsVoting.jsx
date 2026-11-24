import React from 'react';
import { ArrowLeft } from 'lucide-react';

const HostSettingsVoting = ({ gameState, socket, onBack }) => {
  const toggleVoting = () => {
    socket.emit('updateModule', { module: 'voting', setting: 'enabled', value: !gameState.modules.voting.enabled });
  };

  const [newOption, setNewOption] = React.useState('');

  const updateSetting = (setting, value) => {
    socket.emit('updateModules', { voting: { ...gameState.modules.voting, [setting]: value } });
  };

  const addCustomOption = (e) => {
    e.preventDefault();
    if (newOption.trim()) {
      const currentOptions = gameState.modules.voting.customOptions || [];
      updateSetting('customOptions', [...currentOptions, newOption.trim()]);
      setNewOption('');
    }
  };

  const removeCustomOption = (idx) => {
    const currentOptions = gameState.modules.voting.customOptions || [];
    const newOptions = currentOptions.filter((_, i) => i !== idx);
    updateSetting('customOptions', newOptions);
  };

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto">
      <div className="flex items-center space-x-4 mb-6">
        <button onClick={onBack} className="w-10 h-10 flex flex-shrink-0 items-center justify-center text-gray-400 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-bold text-white">Configurar Votación Ciega</h2>
      </div>

      {gameState.modules.voting?.enabled && (
        <div className="space-y-6">
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
            <label className="block text-gray-400 text-sm font-bold mb-3">Tipo de Opciones (Por Defecto)</label>
            <select 
              value={gameState.modules.voting.mode}
              onChange={(e) => updateSetting('mode', e.target.value)}
              className="w-full bg-gray-900 text-white rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="yes_no">Sí / No</option>
              <option value="players">Jugadores de la Mesa</option>
              <option value="custom">Opciones Personalizadas</option>
            </select>
          </div>

          {gameState.modules.voting.mode === 'custom' && (
            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-gray-300 font-bold">Opciones Personalizadas</label>
                
                <div 
                  className="flex items-center space-x-2 cursor-pointer"
                  onClick={() => updateSetting('dynamicCustomOptions', !gameState.modules.voting.dynamicCustomOptions)}
                >
                  <span className="text-sm font-medium text-gray-400">¿Decidir en Juego?</span>
                  <div className={`w-12 h-6 flex flex-shrink-0 items-center bg-gray-700 rounded-full p-1 transition-colors ${gameState.modules.voting.dynamicCustomOptions ? 'bg-indigo-500' : ''}`}>
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${gameState.modules.voting.dynamicCustomOptions ? 'translate-x-6' : ''}`}></div>
                  </div>
                </div>
              </div>

              {!gameState.modules.voting.dynamicCustomOptions ? (
                <>
                  <div className="flex flex-col gap-2 mb-4">
                    {(gameState.modules.voting.customOptions || []).length === 0 ? (
                      <span className="text-gray-500 italic text-sm">No hay opciones predefinidas.</span>
                    ) : (
                      (gameState.modules.voting.customOptions || []).map((opt, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-gray-900 border border-gray-700 text-gray-200 px-3 py-2 rounded-lg">
                          <span className="font-medium">{opt}</span>
                          <button onClick={() => removeCustomOption(idx)} className="text-red-400 hover:text-red-300 font-bold p-1">×</button>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <form onSubmit={addCustomOption} className="flex space-x-2">
                    <input 
                      type="text" 
                      value={newOption}
                      onChange={(e) => setNewOption(e.target.value)}
                      placeholder="Añadir opción (ej: Atacar, Defender...)"
                      className="flex-1 min-w-0 bg-gray-900 text-white rounded-lg p-2 border border-gray-600 focus:border-blue-500 outline-none"
                    />
                    <button type="submit" className="bg-blue-600 flex-shrink-0 text-white px-4 py-2 rounded-lg font-bold">+</button>
                  </form>
                </>
              ) : (
                <div className="text-sm text-gray-400 italic bg-gray-900 p-3 rounded-lg border border-gray-700 text-center">
                  El host ingresará las opciones en tiempo real al momento de iniciar cada votación durante la partida.
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between bg-gray-800 p-4 rounded-xl border border-gray-700 cursor-pointer" onClick={() => updateSetting('showVotesOnReveal', !gameState.modules.voting.showVotesOnReveal)}>
            <div>
              <span className="font-bold text-lg text-white block">Voto Público al Revelar</span>
              <span className="text-sm text-gray-400 block">Si está desactivado, solo se mostrará la suma total sin delatar quién votó qué.</span>
            </div>
            <div className={`w-14 h-8 flex flex-shrink-0 items-center bg-gray-600 rounded-full p-1 transition-colors ${gameState.modules.voting.showVotesOnReveal ? 'bg-green-500' : ''}`}>
              <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${gameState.modules.voting.showVotesOnReveal ? 'translate-x-6' : ''}`}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HostSettingsVoting;
