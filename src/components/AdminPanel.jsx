import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { Settings, Trash2, X, Plus } from 'lucide-react';

const AdminPanel = ({ onClose }) => {
  const { socket, isAdmin, role, gameState } = useSocket();
  const isHost = role === gameState?.host;
  const [activeTab, setActiveTab] = useState('profiles'); // profiles, presets
  const [profiles, setProfiles] = useState([]);
  const [presets, setPresets] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAdmin) {
      socket.emit('getAdminData', (res) => {
        if (res.error) setError(res.error);
        else {
          setProfiles(res.profiles || []);
          setPresets(res.presets || []);
        }
      });
    }
  }, [socket, isAdmin]);

  const handleDeleteProfile = (id) => {
    if (confirm('¿Seguro que deseas eliminar este perfil? Esto no afectará las partidas ya guardadas, pero el jugador no podrá volver a usar este nombre.')) {
      socket.emit('deleteProfile', id, (res) => {
        if (res.success) {
          setProfiles(profiles.filter(p => p.id !== id));
        } else {
          setError(res.error);
        }
      });
    }
  };

  const handleDeletePreset = (id) => {
    if (confirm('¿Seguro que deseas eliminar este preset personalizado?')) {
      socket.emit('deletePreset', id, (res) => {
        if (res.success) {
          setPresets(presets.filter(p => p.id !== id));
        } else {
          setError(res.error);
        }
      });
    }
  };


  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col p-4 overflow-hidden animate-in slide-in-from-bottom duration-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-red-500 flex items-center">
          <Settings className="mr-2" /> Panel de Administración
        </h2>
        <button onClick={onClose} className="p-2 bg-gray-800 rounded-full text-gray-400">
          <X />
        </button>
      </div>

      <div className="flex space-x-2 mb-6">
        <button 
          onClick={() => setActiveTab('profiles')}
          className={`flex-1 py-2 rounded-lg font-bold text-sm ${activeTab === 'profiles' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400'}`}
        >
          Perfiles
        </button>
        <button 
          onClick={() => setActiveTab('presets')}
          className={`flex-1 py-2 rounded-lg font-bold text-sm ${activeTab === 'presets' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400'}`}
        >
          Presets
        </button>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded-xl mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-4 pb-12">
        {activeTab === 'profiles' && (
          <div className="space-y-3">
            <h3 className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-2">Jugadores Registrados ({profiles.length})</h3>
            {profiles.map(p => (
              <div key={p.id} className="flex justify-between items-center bg-gray-800 p-4 rounded-xl border border-gray-700">
                <div>
                  <div className="font-bold text-white text-lg">{p.name}</div>
                  <div className="text-xs text-gray-500">ID: {p.id}</div>
                </div>
                <button onClick={() => handleDeleteProfile(p.id)} className="p-2 text-red-400 hover:text-red-300">
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'presets' && (
          <div className="space-y-3">
            <h3 className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-2">Configuraciones Guardadas ({presets.length})</h3>
            {presets.map(p => (
              <div key={p.id} className="flex justify-between items-center bg-gray-800 p-4 rounded-xl border border-gray-700">
                <div>
                  <div className="font-bold text-white text-lg">{p.name}</div>
                  <div className="text-xs text-gray-500">{p.isBuiltIn ? 'Oficial (Protegido)' : 'Personalizado'}</div>
                </div>
                <button onClick={() => handleDeletePreset(p.id)} className="p-2 text-red-400 hover:text-red-300">
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        )}


      </div>
    </div>
  );
};

export default AdminPanel;
