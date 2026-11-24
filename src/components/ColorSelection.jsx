import React, { useState, useEffect } from 'react';

const COLORS = [
  { id: 'red', name: 'Rojo', bgClass: 'bg-red-600', textClass: 'text-white' },
  { id: 'blue', name: 'Azul', bgClass: 'bg-blue-600', textClass: 'text-white' },
  { id: 'green', name: 'Verde', bgClass: 'bg-green-600', textClass: 'text-white' },
  { id: 'yellow', name: 'Amarillo', bgClass: 'bg-yellow-400', textClass: 'text-gray-900' }
];

const ColorSelection = ({ gameState, socket, role }) => {
  const [error, setError] = useState('');

  useEffect(() => {
    if (!socket) return;
    const errorHandler = (msg) => setError(msg);
    socket.on('errorMsg', errorHandler);
    return () => socket.off('errorMsg', errorHandler);
  }, [socket]);

  const takenColors = Object.values(gameState.colors).filter(c => c !== null);

  const handleSelectColor = (colorId) => {
    setError('');
    socket.emit('selectColor', colorId);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-900 p-6">
      <h1 className="text-3xl font-bold mb-2 text-white">Elige tu Color</h1>
      <p className="text-gray-400 mb-8">Posición: {role}</p>
      
      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        {COLORS.map((c) => {
          const isTaken = takenColors.includes(c.id);
          return (
            <button
              key={c.id}
              disabled={isTaken}
              onClick={() => handleSelectColor(c.id)}
              className={`p-6 rounded-xl font-bold text-xl transition-all flex items-center justify-center ${
                isTaken 
                  ? 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700' 
                  : `${c.bgClass} ${c.textClass} active:scale-95 shadow-lg border border-transparent`
              }`}
            >
              {c.name}
            </button>
          );
        })}
      </div>

      <p className="text-center text-xs text-gray-500 mt-6">
        Solo un jugador puede elegir cada color.
      </p>

      {error && (
        <div className="mt-6 text-red-400 bg-red-900/30 px-4 py-2 rounded-lg border border-red-800">
          {error}
        </div>
      )}
    </div>
  );
};

export default ColorSelection;
