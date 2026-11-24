import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

const HostSettingsHiddenRoles = ({ gameState, socket, onBack }) => {
  const [newRole, setNewRole] = useState('');

  const toggleHiddenRoles = () => {
    socket.emit('updateModule', { module: 'hiddenRoles', setting: 'enabled', value: !gameState.modules.hiddenRoles.enabled });
  };

  const updateSetting = (setting, value) => {
    socket.emit('updateModules', { hiddenRoles: { ...gameState.modules.hiddenRoles, [setting]: value } });
  };

  const addRole = (e) => {
    e.preventDefault();
    if (!newRole.trim()) return;
    const updatedDeck = [...gameState.modules.hiddenRoles.roleDeck, newRole.trim()];
    updateSetting('roleDeck', updatedDeck);
    setNewRole('');
  };

  const removeRole = (index) => {
    const updatedDeck = [...gameState.modules.hiddenRoles.roleDeck];
    updatedDeck.splice(index, 1);
    updateSetting('roleDeck', updatedDeck);
  };

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto">
      <div className="flex items-center space-x-4 mb-6">
        <button onClick={onBack} className="w-10 h-10 flex flex-shrink-0 items-center justify-center text-gray-400 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-bold text-white">Configurar Roles Ocultos</h2>
      </div>

      {gameState.modules.hiddenRoles?.enabled && (
        <div className="space-y-6">
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
            <label className="block text-gray-300 font-bold mb-3">Mazo de Roles</label>
            <div className="flex flex-wrap gap-2 mb-4">
              {gameState.modules.hiddenRoles.roleDeck.length === 0 ? (
                <span className="text-gray-500 italic text-sm">El mazo está vacío.</span>
              ) : (
                gameState.modules.hiddenRoles.roleDeck.map((role, idx) => (
                  <div key={idx} className="bg-indigo-900/50 border border-indigo-700 text-indigo-200 px-3 py-1 rounded-full flex items-center">
                    <span className="mr-2">{role}</span>
                    <button onClick={() => removeRole(idx)} className="text-red-400 hover:text-red-300 font-bold">×</button>
                  </div>
                ))
              )}
            </div>
            
            <form onSubmit={addRole} className="flex space-x-2">
              <input 
                type="text" 
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                placeholder="Añadir rol (ej: Lobo)"
                className="flex-1 min-w-0 bg-gray-900 text-white rounded-lg p-2 border border-gray-600 focus:border-indigo-500 outline-none"
              />
              <button type="submit" className="bg-indigo-600 flex-shrink-0 text-white px-4 py-2 rounded-lg font-bold">+</button>
            </form>
          </div>

          <div className="flex items-center justify-between bg-gray-800 p-4 rounded-xl border border-gray-700 cursor-pointer" onClick={() => updateSetting('hostSeesAll', !gameState.modules.hiddenRoles.hostSeesAll)}>
            <div>
              <span className="font-bold text-lg text-white block">Host Moderador</span>
              <span className="text-sm text-gray-400 block">El host puede ver todos los roles (No juega a ciegas).</span>
            </div>
            <div className={`w-14 h-8 flex flex-shrink-0 items-center bg-gray-600 rounded-full p-1 transition-colors ${gameState.modules.hiddenRoles.hostSeesAll ? 'bg-green-500' : ''}`}>
              <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${gameState.modules.hiddenRoles.hostSeesAll ? 'translate-x-6' : ''}`}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HostSettingsHiddenRoles;
