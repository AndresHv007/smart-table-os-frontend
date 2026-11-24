import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import RoleSelection from './RoleSelection';
import ColorSelection from './ColorSelection';
import { Dices, Pencil, Settings, Shield } from 'lucide-react';
import HostSettingsDice from './HostSettingsDice';
import HostSettingsTurns from './HostSettingsTurns';
import HostSettingsScore from './HostSettingsScore';
import HostSettingsTimer from './HostSettingsTimer';
import HostSettingsVoting from './HostSettingsVoting';
import HostSettingsHiddenRoles from './HostSettingsHiddenRoles';
import AdminPanel from './AdminPanel';
import StatisticsScreen from './StatisticsScreen';

const MobileScreen = () => {
  const { socket, gameState, isConnected, role, setRole, presetsData, isAdmin, setIsAdmin } = useSocket();
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [activeSettingsMode, setActiveSettingsMode] = useState(null);
  const [isSavingPreset, setIsSavingPreset] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [confirmLobby, setConfirmLobby] = useState(false);
  const [confirmRound, setConfirmRound] = useState(false);
  const [customScore, setCustomScore] = useState('');
  const [tempTeamColor, setTempTeamColor] = useState('');
  const [customGameName, setCustomGameName] = useState('');
  const [showAdmin, setShowAdmin] = useState(false);
  const [modalState, setModalState] = useState('hidden'); // hidden, confirm, adminLogin
  const [passwordInput, setPasswordInput] = useState('');
  const [existingProfile, setExistingProfile] = useState(null);
  const [pendingName, setPendingName] = useState('');
  const [showMobileStats, setShowMobileStats] = useState(false);
  const [isGameSaved, setIsGameSaved] = useState(false);
  const [secretRole, setSecretRole] = useState(null);
  const [showSecretRole, setShowSecretRole] = useState(false);
  const [allSecretRoles, setAllSecretRoles] = useState(null);
  const [dynamicVoteOptions, setDynamicVoteOptions] = useState([]);
  const [newDynamicOption, setNewDynamicOption] = useState('');
  const [showInGameSettings, setShowInGameSettings] = useState(false);

  React.useEffect(() => {
    if (!socket) return;
    
    const handleSecretRole = (r) => setSecretRole(r);
    const handleAllSecretRoles = (rolesMap) => setAllSecretRoles(rolesMap);
    const handleClearSecretRole = () => { 
      setSecretRole(null); 
      setShowSecretRole(false); 
      setAllSecretRoles(null); 
    };
    
    socket.on('secretRole', handleSecretRole);
    socket.on('allSecretRoles', handleAllSecretRoles);
    socket.on('clearSecretRole', handleClearSecretRole);
    
    return () => {
      socket.off('secretRole', handleSecretRole);
      socket.off('allSecretRoles', handleAllSecretRoles);
      socket.off('clearSecretRole', handleClearSecretRole);
    };
  }, [socket]);

  React.useEffect(() => {
    if (socket && !gameState?.moduleStates?.hiddenRoles?.rolesDistributed) {
      setSecretRole(null);
      setAllSecretRoles(null);
      setShowSecretRole(false);
    }
  }, [gameState?.moduleStates?.hiddenRoles?.rolesDistributed, socket]);

  // Request role on mount if distributed
  React.useEffect(() => {
    if (socket && gameState?.moduleStates?.hiddenRoles?.rolesDistributed) {
      socket.emit('requestMyRole');
    }
  }, [socket, gameState?.status]);

  React.useEffect(() => {
    if (gameState?.status !== 'FINISHED') {
      setIsGameSaved(false);
      setCustomGameName('');
    }
    // Close in-game settings if we return to lobby
    if (gameState?.status === 'LOBBY') {
      setShowInGameSettings(false);
    }
  }, [gameState?.status]);

  if (!isConnected || !gameState) {
    return <div className="flex items-center justify-center h-full text-xl">Connecting...</div>;
  }

  // If user hasn't picked a role or is trying to pick one
  if (!role) {
    return <RoleSelection setRole={setRole} gameState={gameState} socket={socket} />;
  }

  // If user has picked a role but not a color
  if (!gameState.colors[role]) {
    return <ColorSelection gameState={gameState} socket={socket} role={role} />;
  }

  const handleRollDice = () => {
    if (socket) {
      socket.emit('rollDice');
    }
  };

  const handleNameChange = (e) => {
    e?.preventDefault?.();
    const name = tempName.trim();
    if (!name) return;

    if (name.toLowerCase() === 'admin') {
      setModalState('adminLogin');
      setPasswordInput('');
      setIsEditingName(false);
      return;
    }
    
    // Clear admin if switching to another name
    setIsAdmin(false);

    socket.emit('checkProfile', name, (response) => {
      if (response.exists) {
        setExistingProfile(response.profile);
        setPendingName(name);
        setModalState('confirm');
        setIsEditingName(false);
      } else {
        socket.emit('createProfile', name, (createRes) => {
          if (createRes.success) {
            socket.emit('changeName', name);
            socket.emit('changeProfile', createRes.profile.id);
            alert(`¡Usuario "${name}" creado exitosamente!`);
          }
          setIsEditingName(false);
        });
      }
    });
  };

  const handleConfirmProfile = (useExisting) => {
    if (useExisting) {
      socket.emit('changeName', existingProfile.name);
      socket.emit('changeProfile', existingProfile.id);
    } else {
      setTempName(displayName);
    }
    setModalState('hidden');
  };

  const handleReady = () => {
    if (socket) {
      socket.emit('setReady');
    }
  };

  const TEXT_COLORS = {
    red: 'text-red-400', blue: 'text-blue-400', 
    green: 'text-green-400', yellow: 'text-yellow-400'
  };
  const myColorId = gameState.colors[role];
  const headerColorClass = TEXT_COLORS[myColorId] || 'text-yellow-400';
  const displayName = gameState.names?.[role] || role;

  return (
    <div className="flex flex-col h-full bg-gray-900 relative">
      {/* Modals for Name Change */}
      {modalState !== 'hidden' && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-6 z-50">
          <div className="bg-gray-800 w-full max-w-sm rounded-2xl border border-gray-700 p-6 shadow-2xl">
            {modalState === 'confirm' && (
              <div>
                <h2 className="text-xl font-bold text-yellow-400 mb-2">¡Perfil Encontrado!</h2>
                <p className="text-gray-300 mb-4">Se ha encontrado un jugador registrado con el nombre <strong>{existingProfile?.name}</strong>. ¿Eres tú?</p>
                <div className="flex flex-col space-y-3">
                  <button onClick={() => handleConfirmProfile(true)} className="w-full p-3 bg-blue-600 text-white font-bold rounded-xl active:bg-blue-700">Sí, soy yo</button>
                  <button onClick={() => handleConfirmProfile(false)} className="w-full p-3 bg-gray-700 text-white font-bold rounded-xl active:bg-gray-600">No, cancelar</button>
                </div>
              </div>
            )}
            {modalState === 'adminLogin' && (
              <form onSubmit={(e) => {
                e.preventDefault();
                socket.emit('adminLogin', passwordInput, (res) => {
                  if (res.success) {
                    setIsAdmin(true);
                    socket.emit('changeName', 'Administrador');
                    setModalState('hidden');
                  } else {
                    alert(res.error);
                    setModalState('hidden');
                  }
                });
              }}>
                <h2 className="text-xl font-bold text-red-500 mb-2">Acceso de Administrador</h2>
                <p className="text-gray-400 mb-4 text-sm">Ingresa la contraseña para acceder a las funciones administrativas.</p>
                <input 
                  type="password" autoFocus
                  className="w-full bg-gray-900 border border-gray-700 text-white p-3 rounded-xl mb-4 focus:outline-none focus:border-red-500"
                  value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)}
                />
                <div className="flex space-x-3">
                  <button type="button" onClick={() => setModalState('hidden')} className="flex-1 p-3 bg-gray-700 text-white font-bold rounded-xl active:bg-gray-600">Cancelar</button>
                  <button type="submit" disabled={!passwordInput} className="flex-1 p-3 bg-red-600 text-white font-bold rounded-xl active:bg-red-700 disabled:opacity-50">Ingresar</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Mobile Stats / Remote Control Modal */}
      {showMobileStats && (
        <div className="absolute inset-0 bg-gray-900 z-50 flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <StatisticsScreen 
              isTV={false} 
              onClose={() => {
                setShowMobileStats(false);
                socket.emit('toggleStatsView', false);
              }} 
            />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center shadow-md">
        <div className="font-bold text-lg flex items-center space-x-2">
          {!isEditingName ? (
            <>
              <span className="text-gray-300">Jugador:</span>
              <button onClick={() => {setTempName(displayName); setIsEditingName(true);}} className={`${headerColorClass} flex items-center space-x-2 bg-gray-700/50 px-3 py-1 rounded-lg active:scale-95 transition-all`}>
                <span>{displayName}</span>
                <Pencil size={14} className="opacity-70" />
              </button>
            </>
          ) : (
            <form onSubmit={handleNameChange} className="flex items-center space-x-2">
              <span className="text-gray-300">Jugador:</span>
              <input 
                autoFocus
                type="text" 
                value={tempName} 
                onChange={e => setTempName(e.target.value)} 
                className="bg-gray-700 text-white px-3 py-1 rounded-lg text-base w-32 outline-none border border-gray-600 focus:border-blue-500"
                maxLength={15}
              />
            </form>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {isAdmin && gameState.status === 'LOBBY' && (
            <button 
              onClick={() => setShowAdmin(true)}
              className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors shadow-lg flex items-center"
              title="Panel de Administración"
            >
              <Settings size={16} />
            </button>
          )}
          <span className="text-sm px-2 py-1 bg-green-900 text-green-400 rounded-full">Conectado</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 flex flex-col justify-between overflow-y-auto">
        {gameState.status === 'LOBBY' ? (
          activeSettingsMode === 'dice' ? (
            <HostSettingsDice gameState={gameState} socket={socket} onBack={() => setActiveSettingsMode(null)} />
          ) : activeSettingsMode === 'turns' ? (
            <HostSettingsTurns gameState={gameState} socket={socket} onBack={() => setActiveSettingsMode(null)} />
          ) : activeSettingsMode === 'score' ? (
            <HostSettingsScore gameState={gameState} socket={socket} onBack={() => setActiveSettingsMode(null)} />
          ) : activeSettingsMode === 'timer' ? (
            <HostSettingsTimer gameState={gameState} socket={socket} onBack={() => setActiveSettingsMode(null)} />
          ) : activeSettingsMode === 'voting' ? (
            <HostSettingsVoting gameState={gameState} socket={socket} onBack={() => setActiveSettingsMode(null)} />
          ) : activeSettingsMode === 'hiddenRoles' ? (
            <HostSettingsHiddenRoles gameState={gameState} socket={socket} onBack={() => setActiveSettingsMode(null)} />
          ) : (
          <div className="flex-1 flex flex-col justify-between">
            {gameState.host === role ? (
              <>
                {/* Host Moderator Toggle */}
                <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl mb-6 flex flex-col items-center">
                  <h2 className="text-xl font-bold text-gray-400 mb-2">Tu Rol:</h2>
                  {gameState.colors[role] === 'moderator' ? (
                    <div className="text-purple-400 font-bold mb-4 text-lg">Moderador (Sin Color)</div>
                  ) : (
                    <div className="text-green-400 font-bold mb-4 text-lg">Jugador Activo</div>
                  )}
                  <button
                    onClick={() => {
                      if (gameState.colors[role] === 'moderator') {
                        socket.emit('selectColor', null);
                      } else {
                        socket.emit('selectColor', 'moderator');
                      }
                    }}
                    className={`w-full font-bold py-3 rounded-xl transition-colors ${gameState.colors[role] === 'moderator' ? 'bg-red-900/60 text-red-400 hover:bg-red-800/60 border border-red-800/50' : 'bg-purple-900/40 text-purple-400 border border-purple-800 hover:bg-purple-800/40'}`}
                  >
                    {gameState.colors[role] === 'moderator' ? 'Jugar como Jugador Normal' : 'Activar Modo Moderador'}
                  </button>
                  <p className="text-gray-500 text-xs text-center mt-3">
                    {gameState.colors[role] === 'moderator' 
                      ? 'No participarás en turnos ni puntuaciones. Usa esto si solo administrarás la partida.' 
                      : 'Participarás en turnos y puntuaciones como un jugador más.'}
                  </p>
                </div>

                {/* Presets Section */}
                <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-yellow-400 font-bold text-xl">Presets de Juegos</h2>
                  </div>
                  
                  <select 
                    className="w-full bg-gray-900 border border-gray-700 text-white p-3 rounded-xl mb-4 focus:outline-none focus:border-blue-500"
                    value={gameState.activePreset || ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        socket.emit('loadPreset', e.target.value);
                      }
                    }}
                  >
                    <option value="" disabled>-- Cargar Preset --</option>
                    {presetsData && presetsData.map(p => (
                      <option key={p.id} value={p.name}>{p.name} {p.isBuiltIn ? '(Oficial)' : ''}</option>
                    ))}
                  </select>

                  {!isSavingPreset ? (
                    <button 
                      onClick={() => setIsSavingPreset(true)}
                      className="w-full py-2 bg-blue-900/50 text-blue-400 font-bold rounded-xl border border-blue-800 active:bg-blue-800"
                    >
                      Guardar Configuración Actual
                    </button>
                  ) : (
                    <div className="flex flex-col space-y-3">
                      <input 
                        type="text" 
                        placeholder="Nombre del Preset"
                        value={newPresetName}
                        onChange={e => setNewPresetName(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 text-white p-3 rounded-xl focus:outline-none focus:border-blue-500"
                      />
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => {
                            if (newPresetName.trim()) {
                              socket.emit('savePreset', newPresetName.trim());
                              setIsSavingPreset(false);
                              setNewPresetName('');
                            }
                          }}
                          className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl active:bg-green-700 flex items-center justify-center"
                        >
                          Guardar Preset
                        </button>
                        <button 
                          onClick={() => setIsSavingPreset(false)}
                          className="px-6 py-3 flex-shrink-0 bg-gray-700 text-white font-bold rounded-xl active:bg-gray-600 flex items-center justify-center"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-sm text-gray-400">
                      {gameState.activePreset ? `Preset actual: ${presetsData?.find(p=>p.name===gameState.activePreset)?.name || gameState.activePreset}` : 'Personalizado'}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl mb-6">
                  <h2 className="text-yellow-400 font-bold text-xl mb-6">Configuración de Partida</h2>
                  
                  {/* Turns Module Toggle */}
                  <div className="flex items-center justify-between py-3 border-b border-gray-700/50">
                    <div>
                      <div className="text-white font-semibold">Turnos</div>
                      <div className="text-xs text-gray-400">Sistema de orden de juego</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => gameState.modules.turns?.enabled && setActiveSettingsMode('turns')} 
                        className={`p-1 transition-all ${gameState.modules.turns?.enabled ? 'text-gray-400 hover:text-white' : 'text-gray-600 opacity-30 cursor-not-allowed'}`}
                        disabled={!gameState.modules.turns?.enabled}
                      >
                        <Settings size={20} />
                      </button>
                      <button 
                        onClick={() => socket.emit('updateModules', { turns: { ...gameState.modules.turns, enabled: !gameState.modules.turns?.enabled } })}
                        className={`w-14 h-8 flex flex-shrink-0 items-center rounded-full p-1 transition-colors ${gameState.modules.turns?.enabled ? 'bg-green-500' : 'bg-gray-600'}`}
                      >
                        <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${gameState.modules.turns?.enabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                      </button>
                    </div>
                  </div>

                  {/* Dice Module Toggle */}
                  <div className="flex items-center justify-between py-3 border-b border-gray-700/50">
                    <div>
                      <div className="text-white font-semibold">Dados</div>
                      <div className="text-xs text-gray-400">Tiradas virtuales</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => gameState.modules.dice?.enabled && setActiveSettingsMode('dice')} 
                        className={`p-1 transition-all ${gameState.modules.dice?.enabled ? 'text-gray-400 hover:text-white' : 'text-gray-600 opacity-30 cursor-not-allowed'}`}
                        disabled={!gameState.modules.dice?.enabled}
                      >
                        <Settings size={20} />
                      </button>
                      <button 
                        onClick={() => socket.emit('updateModules', { dice: { ...gameState.modules.dice, enabled: !gameState.modules.dice?.enabled } })}
                        className={`w-14 h-8 flex flex-shrink-0 items-center rounded-full p-1 transition-colors ${gameState.modules.dice?.enabled ? 'bg-green-500' : 'bg-gray-600'}`}
                      >
                        <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${gameState.modules.dice?.enabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                      </button>
                    </div>
                  </div>
                  
                  {/* Timer Module Toggle */}
                  <div className="flex items-center justify-between py-3 border-b border-gray-700/50">
                    <div>
                      <div className="text-white font-semibold">Temporizador</div>
                      <div className="text-xs text-gray-400">Control de tiempo</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => gameState.modules.timer?.enabled && setActiveSettingsMode('timer')} 
                        className={`p-1 transition-all ${gameState.modules.timer?.enabled ? 'text-gray-400 hover:text-white' : 'text-gray-600 opacity-30 cursor-not-allowed'}`}
                        disabled={!gameState.modules.timer?.enabled}
                      >
                        <Settings size={20} />
                      </button>
                      <button 
                        onClick={() => socket.emit('updateModules', { timer: { ...gameState.modules.timer, enabled: !gameState.modules.timer?.enabled } })}
                        className={`w-14 h-8 flex flex-shrink-0 items-center rounded-full p-1 transition-colors ${gameState.modules.timer?.enabled ? 'bg-green-500' : 'bg-gray-600'}`}
                      >
                        <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${gameState.modules.timer?.enabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                      </button>
                    </div>
                  </div>

                  {/* Voting Module Toggle */}
                  <div className="flex items-center justify-between py-3 border-b border-gray-700/50">
                    <div>
                      <div className="text-white font-semibold">Votación Ciega</div>
                      <div className="text-xs text-gray-400">Decisiones grupales secretas</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => gameState.modules.voting?.enabled && setActiveSettingsMode('voting')} 
                        className={`p-1 transition-all ${gameState.modules.voting?.enabled ? 'text-gray-400 hover:text-white' : 'text-gray-600 opacity-30 cursor-not-allowed'}`}
                        disabled={!gameState.modules.voting?.enabled}
                      >
                        <Settings size={20} />
                      </button>
                      <button 
                        onClick={() => socket.emit('updateModules', { voting: { ...gameState.modules.voting, enabled: !gameState.modules.voting?.enabled } })}
                        className={`w-14 h-8 flex flex-shrink-0 items-center rounded-full p-1 transition-colors ${gameState.modules.voting?.enabled ? 'bg-green-500' : 'bg-gray-600'}`}
                      >
                        <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${gameState.modules.voting?.enabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                      </button>
                    </div>
                  </div>

                  {/* Hidden Roles Module Toggle */}
                  <div className="flex items-center justify-between py-3 border-b border-gray-700/50">
                    <div>
                      <div className="text-white font-semibold">Roles Ocultos</div>
                      <div className="text-xs text-gray-400">Identidades secretas cifradas</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => gameState.modules.hiddenRoles?.enabled && setActiveSettingsMode('hiddenRoles')} 
                        className={`p-1 transition-all ${gameState.modules.hiddenRoles?.enabled ? 'text-gray-400 hover:text-white' : 'text-gray-600 opacity-30 cursor-not-allowed'}`}
                        disabled={!gameState.modules.hiddenRoles?.enabled}
                      >
                        <Settings size={20} />
                      </button>
                      <button 
                        onClick={() => socket.emit('updateModules', { hiddenRoles: { ...gameState.modules.hiddenRoles, enabled: !gameState.modules.hiddenRoles?.enabled } })}
                        className={`w-14 h-8 flex flex-shrink-0 items-center rounded-full p-1 transition-colors ${gameState.modules.hiddenRoles?.enabled ? 'bg-green-500' : 'bg-gray-600'}`}
                      >
                        <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${gameState.modules.hiddenRoles?.enabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                      </button>
                    </div>
                  </div>
                
                {/* Score Module Toggle */}
                <div className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-white font-semibold">Puntuación</div>
                    <div className="text-xs text-gray-400">Puntos de victoria</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => gameState.modules.score?.enabled && setActiveSettingsMode('score')} 
                      className={`p-1 transition-all ${gameState.modules.score?.enabled ? 'text-gray-400 hover:text-white' : 'text-gray-600 opacity-30 cursor-not-allowed'}`}
                      disabled={!gameState.modules.score?.enabled}
                    >
                      <Settings size={20} />
                    </button>
                    <button 
                      onClick={() => socket.emit('updateModules', { score: { ...gameState.modules.score, enabled: !gameState.modules.score?.enabled } })}
                      className={`w-14 h-8 flex flex-shrink-0 items-center rounded-full p-1 transition-colors ${gameState.modules.score?.enabled ? 'bg-green-500' : 'bg-gray-600'}`}
                    >
                      <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${gameState.modules.score?.enabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                  </div>
                </div>
              </div>
              </>
            ) : (
              <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 mb-6 text-center">
                <p className="text-gray-400 mb-2">El Anfitrión ({gameState.names?.[gameState.host] || gameState.host}) está configurando la partida.</p>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {gameState.modules.turns?.enabled && <div className="px-3 py-1 rounded-full text-xs font-bold bg-green-900 text-green-400">Turnos</div>}
                  {gameState.modules.timer?.enabled && <div className="px-3 py-1 rounded-full text-xs font-bold bg-green-900 text-green-400">Tiempo</div>}
                  {gameState.modules.dice?.enabled && <div className="px-3 py-1 rounded-full text-xs font-bold bg-green-900 text-green-400">Dados</div>}
                  {gameState.modules.score?.enabled && <div className="px-3 py-1 rounded-full text-xs font-bold bg-green-900 text-green-400">Puntuación</div>}
                  {gameState.modules.voting?.enabled && <div className="px-3 py-1 rounded-full text-xs font-bold bg-green-900 text-green-400">Votación</div>}
                  {gameState.modules.hiddenRoles?.enabled && <div className="px-3 py-1 rounded-full text-xs font-bold bg-green-900 text-green-400">Roles</div>}
                </div>
              </div>
            )}
            
            <div className="pt-4 pb-8 space-y-4">
              <div className="text-center text-sm font-bold text-gray-400 mb-2">
                {Object.keys(gameState.ready).filter(r => gameState.ready[r]).length} / {Object.keys(gameState.colors).filter(r => gameState.colors[r]).length} Jugadores Listos
              </div>
              
              
              {gameState.host === role && (
                <div className="space-y-4">
                  <button 
                    onClick={() => {
                      setShowMobileStats(true);
                      socket.emit('toggleStatsView', true);
                    }}
                    className="w-full font-bold text-xl py-4 rounded-2xl shadow-xl transition-all border-2 bg-blue-900 text-blue-300 border-blue-700"
                  >
                    Estadísticas e Historial
                  </button>
                  <button 
                    onClick={() => socket.emit('startGame')}
                    className="w-full bg-yellow-500 text-yellow-950 font-black text-xl py-4 rounded-2xl shadow-xl transition-transform active:scale-95"
                  >
                    Forzar Inicio
                  </button>
                </div>
              )}
              
              {!gameState.ready?.[role] ? (
                <button 
                  onClick={handleReady}
                  className="w-full bg-gradient-to-r from-green-600 to-green-500 active:from-green-700 active:to-green-600 text-white font-bold text-xl py-4 rounded-2xl shadow-xl transition-transform active:scale-95"
                >
                  ¡Estoy Listo!
                </button>
              ) : (
                <button 
                  onClick={handleReady}
                  className="w-full bg-gray-800 text-green-400 font-bold text-xl py-4 rounded-2xl border-2 border-green-700 transition-transform active:scale-95 flex flex-col items-center"
                >
                  <span>Listo</span>
                  <span className="text-xs text-gray-400 font-normal mt-1">(Toca para cancelar)</span>
                  </button>
              )}
            </div>
          </div>
          )
        ) : gameState.status === 'FINISHED' ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6">
            <h1 className="text-4xl font-black text-yellow-400 text-center uppercase tracking-widest">Partida Terminada</h1>
            <p className="text-gray-300 text-xl text-center">Ganador: <span className="font-bold text-white">{gameState.names[gameState.winner] || gameState.winner || gameState.modules.score?.teams?.[gameState.winner]?.name}</span></p>
            
            {gameState.host === role && (
              <div className="w-full space-y-4 mt-8">
                {/* Custom Game Name Input (Only if no preset active) */}
                {!gameState.activePreset ? (
                  <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                    <label className="block text-gray-400 text-sm mb-2">Nombre de la Partida (Para Historial)</label>
                    <div className="flex flex-col space-y-3">
                      <input 
                        type="text" 
                        value={customGameName}
                        onChange={(e) => setCustomGameName(e.target.value)}
                        placeholder="Partida Personalizada"
                        className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-3 rounded-lg outline-none focus:border-blue-500"
                      />
                      <button 
                        onClick={() => {
                          if (customGameName.trim() && !isGameSaved) {
                            socket.emit('updateGameName', customGameName.trim());
                            setIsGameSaved(true);
                          }
                        }}
                        disabled={isGameSaved}
                        className={`w-full px-4 py-3 rounded-lg font-bold shadow-lg transition-all active:scale-95 ${isGameSaved ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
                      >
                        {isGameSaved ? '✓ Guardado en Historial' : 'Guardar'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-800 p-4 rounded-xl border border-green-700/50 text-center shadow-md">
                    <div className="text-green-400 font-bold mb-1">✓ Guardado Automáticamente</div>
                    <div className="text-gray-400 text-sm">El juego se registró en el historial como: <span className="text-white font-bold">{gameState.activePreset}</span></div>
                  </div>
                )}

                <button 
                  onClick={() => {
                    setShowMobileStats(true);
                    socket.emit('toggleStatsView', true);
                  }}
                  className="w-full font-bold text-xl py-4 rounded-xl transition-all border bg-blue-900 text-blue-300 border-blue-700"
                >
                  Estadísticas e Historial
                </button>

                <button 
                  onClick={() => {
                    if (confirmLobby) socket.emit('returnToLobby');
                    else {
                      setConfirmLobby(true);
                      setTimeout(() => setConfirmLobby(false), 3000);
                    }
                  }}
                  className={`w-full font-bold text-xl py-4 rounded-xl transition-colors ${confirmLobby ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}
                >
                  {confirmLobby ? '¿Estás Seguro? (Toca de nuevo)' : 'Volver al Lobby'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col space-y-6 pb-8">
            {/* Host In-Game Settings Button */}
            {gameState.host === role && !showInGameSettings && !activeSettingsMode && (
              <button 
                onClick={() => setShowInGameSettings(true)}
                className="fixed bottom-6 right-6 z-50 bg-gray-800 border-2 border-gray-600 text-white p-4 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:bg-gray-700 transition-colors"
              >
                <Settings size={28} />
              </button>
            )}

            {/* In-Game Settings Modal Overlay */}
            {showInGameSettings && (
              <div className="fixed inset-0 z-50 bg-gray-900 overflow-y-auto">
                <div className="p-4 border-b border-gray-800 bg-gray-900 sticky top-0 z-10 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button onClick={() => setShowInGameSettings(false)} className="text-gray-400 hover:text-white bg-gray-800 p-2 rounded-full">
                      <span className="text-xl">←</span>
                    </button>
                    <h2 className="text-xl font-bold text-white">Configuración en Juego</h2>
                  </div>
                </div>
                
                {/* Render the actual Lobby settings but inside the modal! */}
                <div className="p-4 pb-20">
                  {activeSettingsMode === 'dice' ? (
                    <HostSettingsDice gameState={gameState} socket={socket} onBack={() => setActiveSettingsMode(null)} />
                  ) : activeSettingsMode === 'turns' ? (
                    <HostSettingsTurns gameState={gameState} socket={socket} onBack={() => setActiveSettingsMode(null)} />
                  ) : activeSettingsMode === 'score' ? (
                    <HostSettingsScore gameState={gameState} socket={socket} onBack={() => setActiveSettingsMode(null)} />
                  ) : activeSettingsMode === 'timer' ? (
                    <HostSettingsTimer gameState={gameState} socket={socket} onBack={() => setActiveSettingsMode(null)} />
                  ) : activeSettingsMode === 'voting' ? (
                    <HostSettingsVoting gameState={gameState} socket={socket} onBack={() => setActiveSettingsMode(null)} />
                  ) : activeSettingsMode === 'hiddenRoles' ? (
                    <HostSettingsHiddenRoles gameState={gameState} socket={socket} onBack={() => setActiveSettingsMode(null)} />
                  ) : (
                    <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl mb-6">
                      <h2 className="text-yellow-400 font-bold text-xl mb-4 border-b border-gray-700 pb-2">Módulos de la Mesa</h2>
                      
                      {/* Dice Toggle */}
                      <div className="flex items-center justify-between py-3 border-b border-gray-700/50">
                        <div>
                          <div className="text-white font-semibold">Dados</div>
                          <div className="text-xs text-gray-400">Activar tiradas de dados</div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button onClick={() => setActiveSettingsMode('dice')} className="p-2 bg-gray-700 rounded-lg text-gray-300 hover:text-white"><Settings size={18} /></button>
                          <button onClick={() => socket.emit('updateModules', { dice: { ...gameState.modules.dice, enabled: !gameState.modules.dice.enabled } })} className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors ${gameState.modules.dice?.enabled ? 'bg-green-500' : 'bg-gray-600'}`}>
                            <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${gameState.modules.dice?.enabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                          </button>
                        </div>
                      </div>

                      {/* Turns Toggle */}
                      <div className="flex items-center justify-between py-3 border-b border-gray-700/50">
                        <div>
                          <div className="text-white font-semibold">Turnos</div>
                          <div className="text-xs text-gray-400">Sistema de turnos organizados</div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button onClick={() => setActiveSettingsMode('turns')} className="p-2 bg-gray-700 rounded-lg text-gray-300 hover:text-white"><Settings size={18} /></button>
                          <button onClick={() => socket.emit('updateModules', { turns: { ...gameState.modules.turns, enabled: !gameState.modules.turns.enabled } })} className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors ${gameState.modules.turns?.enabled ? 'bg-green-500' : 'bg-gray-600'}`}>
                            <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${gameState.modules.turns?.enabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                          </button>
                        </div>
                      </div>

                      {/* Score Toggle */}
                      <div className="flex items-center justify-between py-3 border-b border-gray-700/50">
                        <div>
                          <div className="text-white font-semibold">Puntuación</div>
                          <div className="text-xs text-gray-400">Contador de puntos</div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button onClick={() => setActiveSettingsMode('score')} className="p-2 bg-gray-700 rounded-lg text-gray-300 hover:text-white"><Settings size={18} /></button>
                          <button onClick={() => socket.emit('updateModules', { score: { ...gameState.modules.score, enabled: !gameState.modules.score.enabled } })} className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors ${gameState.modules.score?.enabled ? 'bg-green-500' : 'bg-gray-600'}`}>
                            <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${gameState.modules.score?.enabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                          </button>
                        </div>
                      </div>

                      {/* Timer Toggle */}
                      <div className="flex items-center justify-between py-3 border-b border-gray-700/50">
                        <div>
                          <div className="text-white font-semibold">Temporizador</div>
                          <div className="text-xs text-gray-400">Límite de tiempo por turno/global</div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button onClick={() => setActiveSettingsMode('timer')} className="p-2 bg-gray-700 rounded-lg text-gray-300 hover:text-white"><Settings size={18} /></button>
                          <button onClick={() => socket.emit('updateModules', { timer: { ...gameState.modules.timer, enabled: !gameState.modules.timer.enabled } })} className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors ${gameState.modules.timer?.enabled ? 'bg-green-500' : 'bg-gray-600'}`}>
                            <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${gameState.modules.timer?.enabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                          </button>
                        </div>
                      </div>

                      {/* Voting Toggle */}
                      <div className="flex items-center justify-between py-3 border-b border-gray-700/50">
                        <div>
                          <div className="text-white font-semibold">Votación Ciega</div>
                          <div className="text-xs text-gray-400">Hacer preguntas secretas a todos</div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button onClick={() => setActiveSettingsMode('voting')} className="p-2 bg-gray-700 rounded-lg text-gray-300 hover:text-white"><Settings size={18} /></button>
                          <button onClick={() => socket.emit('updateModules', { voting: { ...gameState.modules.voting, enabled: !gameState.modules.voting.enabled } })} className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors ${gameState.modules.voting?.enabled ? 'bg-green-500' : 'bg-gray-600'}`}>
                            <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${gameState.modules.voting?.enabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                          </button>
                        </div>
                      </div>

                      {/* Hidden Roles Toggle */}
                      <div className="flex items-center justify-between py-3">
                        <div>
                          <div className="text-white font-semibold">Roles Ocultos</div>
                          <div className="text-xs text-gray-400">Repartir identidades secretas</div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button onClick={() => setActiveSettingsMode('hiddenRoles')} className="p-2 bg-gray-700 rounded-lg text-gray-300 hover:text-white"><Settings size={18} /></button>
                          <button onClick={() => socket.emit('updateModules', { hiddenRoles: { ...gameState.modules.hiddenRoles, enabled: !gameState.modules.hiddenRoles.enabled } })} className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors ${gameState.modules.hiddenRoles?.enabled ? 'bg-green-500' : 'bg-gray-600'}`}>
                            <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${gameState.modules.hiddenRoles?.enabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Hidden Roles UI */}
            {gameState.modules.hiddenRoles?.enabled && gameState.moduleStates.hiddenRoles?.rolesDistributed && (
              <div className="bg-gray-800 p-6 rounded-3xl border border-indigo-700/50 flex flex-col items-center shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 pointer-events-none"></div>
                <span className="text-indigo-400 font-bold mb-2 uppercase tracking-widest text-sm relative z-10">Tu Rol Secreto</span>
                <button
                  onPointerDown={() => setShowSecretRole(true)}
                  onPointerUp={() => setShowSecretRole(false)}
                  onPointerLeave={() => setShowSecretRole(false)}
                  onContextMenu={(e) => e.preventDefault()}
                  className={`w-full py-6 rounded-2xl border-2 transition-all duration-300 relative z-10 ${showSecretRole ? 'bg-indigo-600 border-indigo-400 scale-105 shadow-[0_0_30px_rgba(99,102,241,0.5)]' : 'bg-gray-900 border-gray-700'}`}
                  style={{ touchAction: 'none' }}
                >
                  <span className={`text-3xl font-black transition-opacity duration-300 ${showSecretRole ? 'text-white' : 'text-transparent bg-clip-text bg-gradient-to-r from-gray-600 to-gray-500 blur-sm'}`}>
                    {showSecretRole ? (secretRole || 'Sin Rol') : 'Mantén presionado'}
                  </span>
                </button>
              </div>
            )}

            {/* Score Module UI */}
            {gameState.modules.score?.enabled && (
              <div className="bg-gray-800 p-6 rounded-3xl border border-gray-700 flex flex-col items-center shadow-lg">
                <span className="text-gray-400 font-bold mb-2 uppercase tracking-widest text-sm">Puntos</span>
                
                {/* Score calculation logic depending on mode */}
                {(() => {
                  let target = role;
                  if (gameState.modules.score?.mode === 'global') target = 'global';
                  if (gameState.modules.score?.mode === 'teams') {
                    target = Object.keys(gameState.modules.score?.teams).find(tId => gameState.modules.score?.teams[tId].members.includes(role)) || null;
                  }
                  
                  if (!target) return <div className="text-gray-500">No tienes equipo</div>;
                  
                  return (
                    <>
                      <div className="flex flex-col items-center w-full mb-4">
                        {gameState.modules.score?.mode === 'teams' && (
                          <div className="flex flex-col items-center mb-2 w-full">
                            {(() => {
                              const team = gameState.modules.score?.teams[target];
                              const isLeader = team.members[0] === role;
                              
                              if (isEditingName && isLeader) {
                                return (
                                  <div className="flex flex-col items-center space-y-2 w-full px-4">
                                    <input 
                                      type="text" 
                                      value={tempName} 
                                      onChange={e => setTempName(e.target.value)}
                                      className="bg-gray-900 text-white px-3 py-1 rounded w-full border border-gray-600 text-center"
                                      placeholder="Nombre del equipo"
                                    />
                                    <div className="flex items-center space-x-2 w-full">
                                      <select 
                                        className="bg-gray-900 text-white rounded p-1 flex-1 border border-gray-600 text-xs"
                                        value={tempTeamColor || team.colorRole}
                                        onChange={e => setTempTeamColor(e.target.value)}
                                      >
                                        {team.members.map(m => (
                                          <option key={m} value={m}>Color de {gameState.names[m] || m}</option>
                                        ))}
                                      </select>
                                      <button 
                                        onClick={() => {
                                          socket.emit('updateTeam', { teamId: target, name: tempName, colorRole: tempTeamColor || team.colorRole });
                                          setIsEditingName(false);
                                        }}
                                        className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                                      >
                                        ✓
                                      </button>
                                    </div>
                                  </div>
                                );
                              }
                              
                              return (
                                <div className="flex items-center space-x-2">
                                  <span className="text-xl font-bold text-white">{team.name}</span>
                                  {isLeader && (
                                    <button 
                                      onClick={() => {
                                        setTempName(team.name);
                                        setTempTeamColor(team.colorRole);
                                        setIsEditingName(true);
                                      }}
                                      className="text-gray-400 hover:text-white"
                                    >
                                      <Pencil size={14} />
                                    </button>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        )}
                        <div className="flex items-center justify-between w-full px-4">
                        <button 
                          onClick={() => socket.emit('updateScore', { target, delta: -1 })}
                          className="w-16 h-16 bg-red-900/50 text-red-400 rounded-2xl flex items-center justify-center text-4xl font-black border border-red-800 active:scale-95"
                        >-</button>
                        <span className="text-6xl font-black text-white">{gameState.moduleStates.score[target] || 0}</span>
                        <button 
                          onClick={() => socket.emit('updateScore', { target, delta: 1 })}
                          className="w-16 h-16 bg-green-900/50 text-green-400 rounded-2xl flex items-center justify-center text-4xl font-black border border-green-800 active:scale-95"
                        >+</button>
                      </div>
                      </div>
                      
                      <div className="flex space-x-2 w-full mt-4 bg-gray-900/50 p-2 rounded-2xl border border-gray-700/50">
                        <input 
                          type="number"
                          placeholder="0"
                          value={customScore}
                          onChange={e => setCustomScore(e.target.value)}
                          className="flex-1 bg-gray-900 text-white p-2 rounded-xl border border-gray-700 text-center outline-none focus:border-blue-500 min-w-0"
                        />
                        <button 
                          onClick={() => {
                            const val = parseInt(customScore);
                            if (!isNaN(val) && val !== 0) {
                              socket.emit('updateScore', { target, delta: -Math.abs(val) });
                              setCustomScore('');
                            }
                          }}
                          className="bg-red-900/50 text-red-200 font-bold px-4 py-2 rounded-xl active:bg-red-800 border border-red-800/50"
                        >
                          Quitar
                        </button>
                        <button 
                          onClick={() => {
                            const val = parseInt(customScore);
                            if (!isNaN(val) && val !== 0) {
                              socket.emit('updateScore', { target, delta: Math.abs(val) });
                              setCustomScore('');
                            }
                          }}
                          className="bg-green-900/50 text-green-200 font-bold px-4 py-2 rounded-xl active:bg-green-800 border border-green-800/50"
                        >
                          Añadir
                        </button>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

              {/* Voting Module UI */}
              {gameState.modules.voting?.enabled && gameState.moduleStates.voting?.active && (
                <div className="w-full bg-indigo-900/50 rounded-3xl p-6 mb-8 border border-indigo-500 shadow-xl animate-in fade-in zoom-in duration-300">
                  <h3 className="text-2xl font-black text-white mb-2 text-center flex items-center justify-center">
                    <span className="mr-2">✋</span> {gameState.moduleStates.voting.question}
                  </h3>
                  
                  {gameState.moduleStates.voting.resultsRevealed ? (
                    <div className="mt-6 text-center text-indigo-200 font-bold">
                      ¡Resultados revelados en la pantalla principal!
                    </div>
                  ) : gameState.moduleStates.voting.votes[role] ? (
                    <div className="mt-6 text-center text-indigo-300 font-bold bg-indigo-900/50 py-4 rounded-xl">
                      Has votado: {gameState.moduleStates.voting.votes[role]}<br/>
                      <span className="text-sm font-normal text-indigo-400 mt-2 block">Esperando a los demás...</span>
                    </div>
                  ) : (
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {gameState.moduleStates.voting.options.map(opt => (
                        <button
                          key={opt}
                          onClick={() => socket.emit('submitVote', opt)}
                          className="bg-indigo-700 hover:bg-indigo-600 text-white font-bold py-4 px-4 rounded-xl active:scale-95 transition-transform"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}

                  {gameState.host === role && (
                    <div className="mt-6 pt-4 border-t border-indigo-700/50 flex flex-col space-y-2">
                      <p className="text-center text-indigo-300 text-sm mb-2 font-semibold">
                        Votos recibidos: {Object.keys(gameState.moduleStates.voting.votes).length} / {Object.keys(gameState.colors).filter(r => gameState.colors[r] && gameState.colors[r] !== 'moderator').length}
                      </p>
                      {!gameState.moduleStates.voting.resultsRevealed ? (
                        <button 
                          onClick={() => socket.emit('revealVote')}
                          className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg"
                        >
                          Revelar Resultados
                        </button>
                      ) : (
                        <button 
                          onClick={() => socket.emit('closeVote')}
                          className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg"
                        >
                          Cerrar Votación
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            
            {/* Host Start Vote Button */}
            {gameState.host === role && gameState.modules.voting?.enabled && !gameState.moduleStates.voting?.active && (
              <div className="mt-4 bg-indigo-900/40 p-4 rounded-xl border border-indigo-700/50 mb-8">
                {gameState.moduleStates.voting?.resultsRevealed ? (
                  <button 
                    onClick={() => socket.emit('closeVote')}
                    className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg flex items-center justify-center space-x-2"
                  >
                    <span>Ocultar Resultados de TV</span>
                  </button>
                ) : (
                  <>
                    {gameState.modules.voting.mode === 'custom' && gameState.modules.voting.dynamicCustomOptions && (
                      <div className="mb-4 bg-indigo-950/50 p-3 rounded-lg border border-indigo-700/50">
                        <label className="block text-indigo-300 text-sm font-bold mb-3">Opciones de esta votación</label>
                        <div className="flex flex-col gap-2 mb-3">
                          {dynamicVoteOptions.length === 0 ? (
                            <span className="text-gray-500 italic text-sm text-center">No hay opciones. Añade al menos 2.</span>
                          ) : (
                            dynamicVoteOptions.map((opt, idx) => (
                              <div key={idx} className="flex items-center justify-between bg-indigo-900/60 border border-indigo-700 text-gray-200 px-3 py-2 rounded-lg">
                                <span className="font-medium">{opt}</span>
                                <button onClick={() => setDynamicVoteOptions(prev => prev.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-300 font-bold p-1">×</button>
                              </div>
                            ))
                          )}
                        </div>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          if (newDynamicOption.trim()) {
                            setDynamicVoteOptions(prev => [...prev, newDynamicOption.trim()]);
                            setNewDynamicOption('');
                          }
                        }} className="flex space-x-2">
                          <input 
                            type="text" 
                            value={newDynamicOption}
                            onChange={(e) => setNewDynamicOption(e.target.value)}
                            placeholder="Nueva opción..."
                            className="flex-1 min-w-0 bg-gray-900 text-white rounded-lg p-2 border border-gray-600 focus:border-indigo-400 outline-none"
                          />
                          <button type="submit" className="bg-indigo-600 flex-shrink-0 text-white px-4 py-2 rounded-lg font-bold">+</button>
                        </form>
                      </div>
                    )}
                    <button 
                      onClick={() => {
                        let opts = [];
                        if (gameState.modules.voting.mode === 'custom' && gameState.modules.voting.dynamicCustomOptions) {
                          if (dynamicVoteOptions.length < 2) {
                            alert("Ingresa al menos 2 opciones");
                            return;
                          }
                          opts = [...dynamicVoteOptions];
                        }
                        // Emit null as question, and opts as options
                        socket.emit('startVote', null, opts);
                        
                        // Clear the dynamic options for the next vote
                        setDynamicVoteOptions([]);
                      }}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg"
                    >
                      Iniciar Votación (Host)
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Host Hidden Roles Button */}
            {gameState.host === role && gameState.modules.hiddenRoles?.enabled && !gameState.moduleStates.hiddenRoles?.rolesDistributed && (
              <button 
                onClick={() => socket.emit('distributeHiddenRoles', gameState.modules.hiddenRoles.roleDeck || [])}
                className="mt-4 mb-8 w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg"
              >
                Repartir Roles Ocultos (Host)
              </button>
            )}

            {/* Timer UI */}
            {gameState.modules.timer?.enabled && (
              <div className="bg-gray-800 p-6 rounded-3xl border border-gray-700 flex flex-col items-center shadow-lg mb-4">
                <span className="text-gray-400 font-bold mb-2 uppercase tracking-widest text-sm">Tiempo</span>
                <span className={`text-6xl font-black ${gameState.moduleStates.timer.timeLeft <= 10 && gameState.moduleStates.timer.isRunning ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                  {gameState.moduleStates.timer.timeLeft}s
                </span>
                {((gameState.modules.timer?.allowPlayerControls && gameState.turn === role) || gameState.host === role) && (
                  <div className="flex space-x-4 mt-4 w-full">
                    {gameState.moduleStates.timer.isRunning ? (
                      <button onClick={() => socket.emit('pauseTimer')} className="flex-1 bg-yellow-600 text-white font-bold py-3 rounded-xl active:bg-yellow-700">Pausar</button>
                    ) : (
                      <button onClick={() => socket.emit('startTimer')} className="flex-1 bg-green-600 text-white font-bold py-3 rounded-xl active:bg-green-700">Iniciar</button>
                    )}
                    <button onClick={() => socket.emit('resetTimer')} className="flex-1 bg-gray-600 text-white font-bold py-3 rounded-xl active:bg-gray-700">Reiniciar</button>
                  </div>
                )}
              </div>
            )}
            
            {/* Action Buttons (Dice & Turns) */}
            <div className="pt-2 space-y-4">
              {/* Dice Button */}
              {gameState.modules.dice?.enabled && (
                (!gameState.modules.turns?.enabled || gameState.turn === role || gameState.modules.dice?.allowOutOfTurn) ? (
                  <button 
                    onClick={() => socket.emit('rollDice')}
                    className="w-full bg-gradient-to-r from-red-600 to-red-500 active:from-red-700 active:to-red-600 text-white font-bold text-xl py-6 rounded-3xl shadow-xl flex items-center justify-center space-x-3 transition-transform active:scale-95"
                  >
                    <Dices size={30} />
                    <span>Tirar Dados</span>
                  </button>
                ) : (
                  <button 
                    disabled
                    className="w-full bg-gray-800 text-gray-500 font-bold text-xl py-6 rounded-3xl border border-gray-700 flex items-center justify-center space-x-3"
                  >
                    <Dices size={30} className="opacity-50" />
                    <span>Esperando tu turno...</span>
                  </button>
                )
              )}
              
              {/* Pass Turn Button */}
              {gameState.modules.turns?.enabled && (
                gameState.turn === role ? (
                  <button 
                    onClick={() => socket.emit('endTurn')}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 active:from-blue-700 active:to-blue-600 text-white font-bold text-xl py-6 rounded-3xl shadow-xl flex items-center justify-center transition-transform active:scale-95"
                  >
                    Terminar Turno
                  </button>
                ) : (
                  !gameState.modules.dice?.enabled && (
                    <div className="text-center text-gray-500 font-bold py-6">Esperando tu turno...</div>
                  )
                )
              )}
              
              {/* Host Advance Round Button */}
              {gameState.host === role && gameState.modules.turns?.enabled && gameState.modules.turns?.countRounds && !gameState.modules.turns?.autoRound && (
                <button 
                  onClick={() => {
                    if (confirmRound) {
                      socket.emit('advanceRound');
                      setConfirmRound(false);
                    } else {
                      setConfirmRound(true);
                      setTimeout(() => setConfirmRound(false), 3000);
                    }
                  }}
                  className={`w-full font-bold text-lg py-4 rounded-xl mt-4 transition-colors ${confirmRound ? 'bg-indigo-600 text-white' : 'bg-indigo-900/50 text-indigo-400 border border-indigo-700'}`}
                >
                  {confirmRound ? '¿Avanzar de Ronda? (Toca de nuevo)' : 'Avanzar Ronda (Host)'}
                </button>
              )}

              {/* Host Moderator Panel */}
              {gameState.host === role && gameState.modules.turns?.showModeratorPanel !== false && (
                <div className="w-full mt-8 bg-gray-800 rounded-2xl border border-gray-700 p-4 shadow-lg">
                  <h3 className="text-xl font-bold text-white mb-4 text-center">Panel de Moderador</h3>
                  <div className="space-y-3">
                    {Object.keys(gameState.colors)
                      .filter(r => gameState.colors[r] && gameState.colors[r] !== 'moderator')
                      .map(playerRole => {
                        const isDead = gameState.moduleStates.turns.deadPlayers?.includes(playerRole);
                        const isTurn = gameState.turn === playerRole;
                        return (
                          <div key={playerRole} className={`flex flex-col sm:flex-row justify-between items-center p-3 rounded-xl border ${isTurn ? 'bg-indigo-900/30 border-indigo-700' : 'bg-gray-900 border-gray-800'}`}>
                            <span className={`font-bold text-lg mb-2 sm:mb-0 ${isDead ? 'text-gray-600 line-through' : (isTurn ? 'text-indigo-400' : 'text-white')}`}>
                              {gameState.names[playerRole]} {isTurn && ' (En Turno)'}
                            </span>
                            <div className="flex space-x-2 w-full sm:w-auto">
                              {gameState.modules.score?.enabled && (
                                <>
                                  <button onClick={() => socket.emit('updateScore', { target: playerRole, delta: -1 })} className="flex-1 sm:flex-none bg-red-900/50 hover:bg-red-900/80 text-red-300 font-bold w-10 h-10 rounded-lg flex items-center justify-center">-1</button>
                                  <button onClick={() => socket.emit('updateScore', { target: playerRole, delta: 1 })} className="flex-1 sm:flex-none bg-green-900/50 hover:bg-green-900/80 text-green-300 font-bold w-10 h-10 rounded-lg flex items-center justify-center">+1</button>
                                </>
                              )}
                              {gameState.modules.turns?.enabled && (
                                <button 
                                  onClick={() => socket.emit('togglePlayerDead', playerRole)} 
                                  className={`flex-1 sm:flex-none font-bold px-3 py-2 rounded-lg flex items-center justify-center ${isDead ? 'bg-indigo-900/50 text-indigo-300 hover:bg-indigo-800' : 'bg-red-900/50 text-red-300 hover:bg-red-800'}`}
                                >
                                  {isDead ? 'Revivir' : 'Matar'}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Host Return to Lobby Button */}
              {gameState.host === role && (
                <button 
                  onClick={() => {
                    if (confirmLobby) socket.emit('returnToLobby');
                    else {
                      setConfirmLobby(true);
                      setTimeout(() => setConfirmLobby(false), 3000);
                    }
                  }}
                  className={`w-full font-bold text-xl py-4 rounded-xl mt-4 transition-colors ${confirmLobby ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}
                >
                  {confirmLobby ? '¿Estás Seguro? (Toca de nuevo)' : 'Volver al Lobby (Host)'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
    </div>
  );
};

export default MobileScreen;
