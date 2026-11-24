import React, { useState, useEffect } from 'react';

import { useSocket } from '../context/SocketContext';

const roles = ['Norte', 'Sur', 'Este', 'Oeste'];

const RoleSelection = ({ setRole, gameState, socket }) => {
  const { setIsAdmin } = useSocket();
  const [error, setError] = useState('');
  const join = (role) => {
    socket.emit('joinRole', { role, profileId: null, name: role });
    setRole(role);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-900 p-6 relative">
      <h1 className="text-3xl font-bold mb-8 text-white">Selecciona tu Asiento</h1>
      
      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        {roles.map((r) => {
          const isTaken = gameState.players[r] !== null;
          return (
            <button
              key={r}
              disabled={isTaken}
              onClick={() => join(r)}
              className={`p-6 rounded-xl font-bold text-xl transition-all ${
                isTaken 
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700' 
                  : 'bg-blue-600 text-white active:bg-blue-700 active:scale-95 shadow-lg'
              }`}
            >
              {r}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="mt-6 text-red-400 bg-red-900/30 px-4 py-2 rounded-lg border border-red-800">
          {error}
        </div>
      )}

    </div>
  );
};

export default RoleSelection;
