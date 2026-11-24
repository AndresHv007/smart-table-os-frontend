import React from 'react';
import { ArrowLeft } from 'lucide-react';

const HostSettingsDice = ({ gameState, socket, onBack }) => {
  const dice = gameState.modules.dice;

  const updateDice = (updates) => {
    socket.emit('updateModules', { dice: { ...dice, ...updates } });
  };

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto">
      <div className="flex items-center space-x-4 mb-6">
        <button onClick={onBack} className="w-10 h-10 flex flex-shrink-0 items-center justify-center text-gray-400 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-bold text-white">Configurar Dados</h2>
      </div>

      <div className="space-y-6">
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <label className="block text-gray-300 font-bold mb-2">Cantidad de Dados</label>
          <select 
            className="w-full bg-gray-900 text-white rounded-lg p-3 pr-10 border border-gray-600 outline-none"
            value={dice.count}
            onChange={(e) => updateDice({ count: parseInt(e.target.value) })}
          >
            {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} Dado(s)</option>)}
          </select>
        </div>

        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <label className="block text-gray-300 font-bold mb-2">Caras por Dado</label>
          <select 
            className="w-full bg-gray-900 text-white rounded-lg p-3 pr-10 border border-gray-600 outline-none"
            value={dice.faces}
            onChange={(e) => updateDice({ faces: parseInt(e.target.value) })}
          >
            {[4,6,8,10,12,20].map(n => <option key={n} value={n}>D{n}</option>)}
          </select>
        </div>

        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex justify-between items-center">
          <div>
            <div className="text-white font-bold">Tirar fuera de turno</div>
            <div className="text-xs text-gray-400">Cualquiera puede tirar en cualquier momento</div>
          </div>
          <button 
            onClick={() => updateDice({ allowOutOfTurn: !dice.allowOutOfTurn })}
            className={`w-12 h-7 flex flex-shrink-0 items-center rounded-full p-1 transition-colors ${dice.allowOutOfTurn ? 'bg-green-500' : 'bg-gray-600'}`}
          >
            <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${dice.allowOutOfTurn ? 'translate-x-5' : 'translate-x-0'}`}></div>
          </button>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-xl border border-yellow-700/50">
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="text-yellow-500 font-bold text-lg">Dado Dorado (Golden Roll)</div>
              <div className="text-xs text-gray-400">Activa animaciones doradas épicas en la TV</div>
            </div>
            <button 
              onClick={() => {
                updateDice({ goldenEnabled: !dice.goldenEnabled, goldenConditions: dice.goldenConditions || [] });
              }}
              className={`w-12 h-7 flex flex-shrink-0 items-center rounded-full p-1 transition-colors ${(dice.goldenEnabled) ? 'bg-green-500' : 'bg-gray-600'}`}
            >
              <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${(dice.goldenEnabled) ? 'translate-x-5' : 'translate-x-0'}`}></div>
            </button>
          </div>

          {dice.goldenEnabled && (
            <div className="space-y-4 pt-4 border-t border-gray-700">
              {(dice.goldenConditions || []).map((cond, index) => (
                <div key={index} className="bg-gray-900 p-3 rounded-lg border border-gray-700 relative">
                  <button 
                    onClick={() => {
                      const newConds = [...(dice.goldenConditions || [])];
                      newConds.splice(index, 1);
                      updateDice({ goldenConditions: newConds });
                    }}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-400"
                  >
                    ✕
                  </button>
                  <div className="pr-6 space-y-3">
                    <div>
                      <label className="block text-gray-400 text-xs mb-1">Condición</label>
                      <select 
                        className="w-full bg-gray-800 text-white rounded-lg p-2 border border-gray-600 outline-none text-sm"
                        value={cond.type || 'single_exact'}
                        onChange={(e) => {
                          const newConds = [...(dice.goldenConditions || [])];
                          newConds[index] = { ...cond, type: e.target.value };
                          updateDice({ goldenConditions: newConds });
                        }}
                      >
                        <option value="single_exact">Un dado exactamente igual a</option>
                        <option value="single_min">Un dado mayor o igual a</option>
                        <option value="single_max">Un dado menor o igual a</option>
                        <option value="sum_exact">Suma exacta de dados igual a</option>
                        <option value="sum_min">Suma mayor o igual a</option>
                        <option value="sum_max">Suma menor o igual a</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-400 text-xs mb-1">Valor Requerido</label>
                      <input 
                        type="number"
                        className="w-full bg-gray-800 text-white rounded-lg p-2 border border-gray-600 outline-none text-sm"
                        value={cond.value || 0}
                        onChange={(e) => {
                          const newConds = [...(dice.goldenConditions || [])];
                          newConds[index] = { ...cond, value: parseInt(e.target.value) || 0 };
                          updateDice({ goldenConditions: newConds });
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button 
                onClick={() => {
                  const newConds = [...(dice.goldenConditions || []), { type: 'single_exact', value: 20 }];
                  updateDice({ goldenConditions: newConds });
                }}
                className="w-full py-2 bg-yellow-900/40 text-yellow-500 font-bold rounded-lg border border-yellow-700/50 hover:bg-yellow-800/40"
              >
                + Añadir Condición
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HostSettingsDice;
