import React, { useState, useEffect, useId, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import RoleSelection from './RoleSelection';
import ColorSelection from './ColorSelection';
import {
  Dices,
  Pencil,
  Settings,
  Shield,
  RefreshCw,
  Timer,
  Vote,
  Trophy,
  BarChart3,
  Play,
  Pause,
  RotateCcw,
  Check,
  X,
  ArrowLeft,
  Eye,
  EyeOff,
  Sparkles,
  UserCheck,
  Lock,
  Layers,
  Plus,
  Crown,
} from 'lucide-react';
import HostSettingsDice from './HostSettingsDice';
import HostSettingsTurns from './HostSettingsTurns';
import HostSettingsScore from './HostSettingsScore';
import HostSettingsTimer from './HostSettingsTimer';
import HostSettingsVoting from './HostSettingsVoting';
import HostSettingsHiddenRoles from './HostSettingsHiddenRoles';
import AdminPanel from './AdminPanel';
import StatisticsScreen from './StatisticsScreen';
import LiquidModal from './ui/LiquidModal';
import ToggleSwitch from './ui/ToggleSwitch';
import { useToast } from './ui/LiquidToast';
import { useScrollEffects } from '../hooks/useScrollEffects';

const MobileScreen = () => {
  const { socket, gameState, isConnected, role, setRole, presetsData, isAdmin, setIsAdmin } =
    useSocket();
  const toast = useToast();

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [isEditingTeamName, setIsEditingTeamName] = useState(false);
  const [tempTeamName, setTempTeamName] = useState('');
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
  const [adminLoginError, setAdminLoginError] = useState('');
  const [existingProfile, setExistingProfile] = useState(null);
  const lastProfileRef = useRef(null);
  const inGameSettingsTitleId = useId();
  const [showMobileStats, setShowMobileStats] = useState(false);

  if (existingProfile) {
    lastProfileRef.current = existingProfile;
  }
  const displayProfile = existingProfile || lastProfileRef.current;
  const [isGameSaved, setIsGameSaved] = useState(false);
  const [secretRole, setSecretRole] = useState(null);
  const [showSecretRole, setShowSecretRole] = useState(false);
  const [allSecretRoles, setAllSecretRoles] = useState(null);
  const [dynamicVoteOptions, setDynamicVoteOptions] = useState([]);
  const [newDynamicOption, setNewDynamicOption] = useState('');
  const [showInGameSettings, setShowInGameSettings] = useState(false);

  const mainScroll = useScrollEffects([
    gameState?.status,
    activeSettingsMode,
    gameState?.host === role,
    role,
    gameState?.moduleStates?.voting?.active,
    gameState?.moduleStates?.hiddenRoles?.rolesDistributed,
    isSavingPreset,
  ]);

  const inGameSettingsScroll = useScrollEffects([showInGameSettings, activeSettingsMode]);

  useEffect(() => {
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

  useEffect(() => {
    if (socket && !gameState?.moduleStates?.hiddenRoles?.rolesDistributed) {
      setSecretRole(null);
      setAllSecretRoles(null);
      setShowSecretRole(false);
    }
  }, [gameState?.moduleStates?.hiddenRoles?.rolesDistributed, socket]);

  useEffect(() => {
    if (socket && gameState?.moduleStates?.hiddenRoles?.rolesDistributed) {
      socket.emit('requestMyRole');
    }
  }, [socket, gameState?.status]);

  useEffect(() => {
    if (gameState?.status !== 'FINISHED') {
      setIsGameSaved(false);
      setCustomGameName('');
    }
    if (gameState?.status === 'LOBBY') {
      setShowInGameSettings(false);
    }
    mainScroll.resetScroll();
  }, [gameState?.status, mainScroll.resetScroll]);

  useEffect(() => {
    if (!showInGameSettings) return;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !document.querySelector('dialog[open]')) {
        if (activeSettingsMode) {
          setActiveSettingsMode(null);
        } else {
          setShowInGameSettings(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showInGameSettings, activeSettingsMode]);

  if (!isConnected || !gameState) {
    return (
      <div className="relative flex items-center justify-center h-full mobile-obsidian-bg p-6 overflow-hidden">
        <div className="absolute -top-24 left-1/4 w-72 h-72 rounded-full bg-sky-500/20 blur-[110px] pointer-events-none animate-float-slow" />
        <div className="liquid-glass-modal rounded-[2rem] px-8 py-9 flex flex-col items-center text-center max-w-xs w-full animate-modal-pop">
          <div className="relative w-14 h-14 mb-4 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-sky-400/20" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-sky-400 animate-spin" />
            <Dices size={22} className="text-sky-300" />
          </div>
          <h1 className="text-xl font-black text-white tracking-tight">Smart Table OS</h1>
          <p className="text-sm text-slate-300/80 mt-1.5">Conectando con la mesa...</p>
        </div>
      </div>
    );
  }

  if (!role) {
    return <RoleSelection setRole={setRole} gameState={gameState} socket={socket} />;
  }

  if (!gameState.colors[role]) {
    return <ColorSelection gameState={gameState} socket={socket} role={role} />;
  }

  const handleNameChange = (e) => {
    e?.preventDefault?.();
    const name = tempName.trim();
    if (!name) return;

    if (name.toLowerCase() === 'admin') {
      setModalState('adminLogin');
      setPasswordInput('');
      setAdminLoginError('');
      setIsEditingName(false);
      return;
    }

    setIsAdmin(false);

    socket.emit('checkProfile', name, (response) => {
      if (response.exists) {
        setExistingProfile(response.profile);
        setModalState('confirm');
        setIsEditingName(false);
      } else {
        socket.emit('createProfile', name, (createRes) => {
          if (createRes.success) {
            socket.emit('changeName', name);
            socket.emit('changeProfile', createRes.profile.id);
            toast.success(`¡Usuario "${name}" creado exitosamente!`);
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
      toast.success(`Sesión vinculada como ${existingProfile.name}`);
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
    red: 'text-rose-400',
    blue: 'text-sky-400',
    green: 'text-emerald-400',
    yellow: 'text-amber-300',
    moderator: 'text-violet-300',
  };

  const ORB_ACCENTS = {
    red: { primary: 'bg-rose-500/20', secondary: 'bg-red-600/15', bar: 'from-rose-400 to-amber-300', dot: 'bg-rose-400' },
    blue: { primary: 'bg-sky-500/20', secondary: 'bg-indigo-500/15', bar: 'from-sky-400 to-indigo-400', dot: 'bg-sky-400' },
    green: { primary: 'bg-emerald-500/20', secondary: 'bg-teal-500/15', bar: 'from-emerald-400 to-teal-300', dot: 'bg-emerald-400' },
    yellow: { primary: 'bg-amber-400/20', secondary: 'bg-yellow-500/15', bar: 'from-amber-300 to-yellow-500', dot: 'bg-amber-300' },
    moderator: { primary: 'bg-violet-500/20', secondary: 'bg-indigo-500/15', bar: 'from-violet-400 to-sky-400', dot: 'bg-violet-400' },
  };

  const myColorId = gameState.colors[role];
  const headerColorClass = TEXT_COLORS[myColorId] || 'text-amber-300';
  const themeAccent = ORB_ACCENTS[myColorId] || ORB_ACCENTS.blue;
  const displayName = gameState.names?.[role] || role;
  const isHost = gameState.host === role;

  const renderSettingsSubpage = () => {
    if (activeSettingsMode === 'dice') {
      return (
        <HostSettingsDice
          gameState={gameState}
          socket={socket}
          onBack={() => setActiveSettingsMode(null)}
        />
      );
    }
    if (activeSettingsMode === 'turns') {
      return (
        <HostSettingsTurns
          gameState={gameState}
          socket={socket}
          onBack={() => setActiveSettingsMode(null)}
        />
      );
    }
    if (activeSettingsMode === 'score') {
      return (
        <HostSettingsScore
          gameState={gameState}
          socket={socket}
          onBack={() => setActiveSettingsMode(null)}
        />
      );
    }
    if (activeSettingsMode === 'timer') {
      return (
        <HostSettingsTimer
          gameState={gameState}
          socket={socket}
          onBack={() => setActiveSettingsMode(null)}
        />
      );
    }
    if (activeSettingsMode === 'voting') {
      return (
        <HostSettingsVoting
          gameState={gameState}
          socket={socket}
          onBack={() => setActiveSettingsMode(null)}
        />
      );
    }
    if (activeSettingsMode === 'hiddenRoles') {
      return (
        <HostSettingsHiddenRoles
          gameState={gameState}
          socket={socket}
          onBack={() => setActiveSettingsMode(null)}
        />
      );
    }
    return null;
  };

  const MODULE_ROWS = [
    {
      key: 'turns',
      title: 'Turnos',
      lobbyDesc: 'Sistema de orden de juego',
      inGameDesc: 'Sistema de turnos organizados',
      icon: RefreshCw,
      iconTone: 'bg-sky-500/20 text-sky-300 border-sky-400/30',
    },
    {
      key: 'dice',
      title: 'Dados',
      lobbyDesc: 'Tiradas virtuales',
      inGameDesc: 'Activar tiradas de dados',
      icon: Dices,
      iconTone: 'bg-rose-500/20 text-rose-300 border-rose-400/30',
    },
    {
      key: 'timer',
      title: 'Temporizador',
      lobbyDesc: 'Control de tiempo',
      inGameDesc: 'Límite de tiempo por turno/global',
      icon: Timer,
      iconTone: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
    },
    {
      key: 'voting',
      title: 'Votación Ciega',
      lobbyDesc: 'Decisiones grupales secretas',
      inGameDesc: 'Hacer preguntas secretas a todos',
      icon: Vote,
      iconTone: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30',
    },
    {
      key: 'hiddenRoles',
      title: 'Roles Ocultos',
      lobbyDesc: 'Identidades secretas cifradas',
      inGameDesc: 'Repartir identidades secretas',
      icon: Shield,
      iconTone: 'bg-violet-500/20 text-violet-300 border-violet-400/30',
    },
    {
      key: 'score',
      title: 'Puntuación',
      lobbyDesc: 'Puntos de victoria',
      inGameDesc: 'Contador de puntos',
      icon: Trophy,
      iconTone: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
    },
  ];

  const readyCount = Object.keys(gameState.ready || {}).filter((r) => gameState.ready[r]).length;
  const totalColoredPlayers = Object.keys(gameState.colors || {}).filter(
    (r) => gameState.colors[r]
  ).length;

  const isInLobbySubSettings = gameState.status === 'LOBBY' && Boolean(activeSettingsMode);

  return (
    <div className="flex flex-col h-full mobile-obsidian-bg relative overflow-hidden">
      {/* Ambient Parallax Aurora Orbs */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden z-0"
        style={{
          transform: `translate3d(0, ${mainScroll.parallaxY}px, 0)`,
          transition: 'transform 120ms ease-out',
        }}
      >
        <div
          className={`absolute -top-20 -right-20 w-72 h-72 rounded-full blur-[110px] ${themeAccent.primary}`}
        />
        <div
          className={`absolute top-1/2 -left-24 w-72 h-72 rounded-full blur-[120px] ${themeAccent.secondary}`}
        />
      </div>

      {/* Liquid Crystal Modals for Name Confirm & Admin Login */}
      <LiquidModal
        isOpen={modalState === 'confirm'}
        onClose={() => handleConfirmProfile(false)}
        title="¡Perfil Encontrado!"
        icon={<UserCheck size={20} className="text-amber-300" />}
        titleClassName="text-amber-200"
        maxWidthClass="max-w-sm"
      >
        <p className="text-slate-300 text-sm leading-relaxed mb-5">
          Se ha encontrado un jugador registrado con el nombre{' '}
          <strong className="text-white">{displayProfile?.name}</strong>. ¿Eres tú?
        </p>
        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            autoFocus
            data-autofocus
            onClick={() => handleConfirmProfile(true)}
            className="liquid-btn w-full py-3.5 bg-gradient-to-r from-sky-500 to-indigo-500 hover:brightness-110 text-white font-extrabold rounded-xl shadow-[0_10px_26px_-8px_rgba(56,189,248,0.65)]"
          >
            Sí, soy yo
          </button>
          <button
            type="button"
            onClick={() => handleConfirmProfile(false)}
            className="liquid-btn liquid-btn-glass w-full py-3 text-slate-200 font-bold rounded-xl"
          >
            No, cancelar
          </button>
        </div>
      </LiquidModal>

      <LiquidModal
        isOpen={modalState === 'adminLogin'}
        onClose={() => {
          setModalState('hidden');
          setAdminLoginError('');
        }}
        title="Acceso de Administrador"
        subtitle="Ingresa la contraseña para desbloquear funciones administrativas."
        icon={<Lock size={19} className="text-rose-400" />}
        titleClassName="text-rose-200"
        maxWidthClass="max-w-sm"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setAdminLoginError('');
            socket.emit('adminLogin', passwordInput, (res) => {
              if (res.success) {
                setIsAdmin(true);
                socket.emit('changeName', 'Administrador');
                setModalState('hidden');
                setPasswordInput('');
                setAdminLoginError('');
                toast.success('Modo Administrador activado');
              } else {
                const errMsg = res.error || 'Contraseña incorrecta';
                setAdminLoginError(errMsg);
                setPasswordInput('');
                toast.error(errMsg);
              }
            });
          }}
          className="space-y-4"
        >
          {adminLoginError && (
            <div className="text-rose-200 text-xs font-semibold bg-rose-500/15 border border-rose-400/35 px-3.5 py-2.5 rounded-xl">
              {adminLoginError}
            </div>
          )}
          <input
            type="password"
            autoFocus
            placeholder="Contraseña de administrador"
            className="liquid-input w-full p-3.5 rounded-xl text-sm"
            value={passwordInput}
            onChange={(e) => {
              setPasswordInput(e.target.value);
              if (adminLoginError) setAdminLoginError('');
            }}
          />
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => {
                setModalState('hidden');
                setAdminLoginError('');
              }}
              className="liquid-btn liquid-btn-glass flex-1 py-3 text-slate-200 font-bold rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!passwordInput}
              className="liquid-btn flex-1 py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:brightness-110 text-white font-extrabold rounded-xl disabled:opacity-40 shadow-[0_10px_24px_-8px_rgba(244,63,94,0.6)]"
            >
              Ingresar
            </button>
          </div>
        </form>
      </LiquidModal>

      {/* Mobile Stats / Remote Control Liquid Crystal Modal */}
      {showMobileStats && (
        <StatisticsScreen
          isTV={false}
          onClose={() => {
            setShowMobileStats(false);
            socket.emit('toggleStatsView', false);
          }}
        />
      )}

      {/* Dynamic Sticky Liquid Crystal Header */}
      <header
        className={`relative z-30 px-4 flex justify-between items-center gap-2 liquid-header ${
          mainScroll.isScrolled && !isInLobbySubSettings
            ? 'liquid-header-scrolled py-2.5'
            : 'py-3.5'
        }`}
      >
        <div className="font-bold text-base flex items-center gap-2 min-w-0">
          {!isEditingName ? (
            <button
              type="button"
              onClick={() => {
                setTempName(displayName);
                setIsEditingName(true);
              }}
              className="liquid-btn liquid-btn-glass flex items-center gap-2 px-3 py-1.5 rounded-xl max-w-full"
            >
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${themeAccent.dot}`} />
              <span className={`${headerColorClass} font-extrabold truncate max-w-[130px] sm:max-w-[200px]`}>
                {displayName}
              </span>
              <Pencil size={13} className="text-slate-400 shrink-0" />
            </button>
          ) : (
            <form onSubmit={handleNameChange} className="flex items-center gap-1.5">
              <input
                autoFocus
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="liquid-input px-3 py-1.5 rounded-xl text-sm w-32 sm:w-40"
                maxLength={15}
                placeholder="Tu nombre"
              />
              <button
                type="submit"
                aria-label="Guardar nombre"
                className="liquid-btn p-1.5 rounded-lg bg-emerald-500/25 border border-emerald-400/35 text-emerald-200 hover:bg-emerald-500/35"
              >
                <Check size={15} />
              </button>
              <button
                type="button"
                aria-label="Cancelar edición"
                onClick={() => setIsEditingName(false)}
                className="liquid-btn liquid-btn-glass p-1.5 rounded-lg text-slate-300"
              >
                <X size={15} />
              </button>
            </form>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isAdmin && gameState.status === 'LOBBY' && (
            <button
              type="button"
              onClick={() => setShowAdmin(true)}
              className="liquid-btn bg-rose-500/25 hover:bg-rose-500/40 border border-rose-400/40 text-rose-100 p-2 rounded-xl shadow-md flex items-center"
              title="Panel de Administración"
              aria-label="Panel de Administración"
            >
              <Settings size={16} />
            </button>
          )}
          <span className="liquid-glass-subtle text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 text-emerald-300 border-emerald-400/25">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
            <span>Conectado</span>
          </span>
        </div>

        {/* Luminous Scroll Progress Hairline */}
        {mainScroll.hasOverflow && !isInLobbySubSettings && (
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5 overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${themeAccent.bar} origin-left transition-transform duration-75`}
              style={{ transform: `scaleX(${Math.max(0.03, mainScroll.scrollProgress)})` }}
            />
          </div>
        )}
      </header>

      {/* Main Content Area */}
      {isInLobbySubSettings ? (
        <div className="flex-1 flex flex-col overflow-hidden relative z-10">
          {renderSettingsSubpage()}
        </div>
      ) : (
        <main
          ref={mainScroll.scrollRef}
          className="flex-1 liquid-scroll relative z-10 px-4 sm:px-6 pt-5 pb-10"
        >
          <div className="max-w-lg mx-auto min-h-full flex flex-col justify-between">
            {gameState.status === 'LOBBY' ? (
              <div className="flex-1 flex flex-col justify-between gap-5">
                {isHost ? (
                  <div className="space-y-5">
                    {/* Host Moderator Toggle */}
                    <section className="scroll-reveal-card liquid-glass p-5 rounded-[1.75rem] flex flex-col items-center text-center">
                      <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-400 mb-1.5">
                        Tu Rol en la Mesa
                      </span>
                      {gameState.colors[role] === 'moderator' ? (
                        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-violet-500/20 border border-violet-400/35 text-violet-200 font-extrabold text-sm mb-4">
                          <Shield size={15} />
                          <span>Moderador (Sin Color)</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 font-extrabold text-sm mb-4">
                          <Sparkles size={15} />
                          <span>Jugador Activo</span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          if (gameState.colors[role] === 'moderator') {
                            socket.emit('selectColor', null);
                          } else {
                            socket.emit('selectColor', 'moderator');
                          }
                        }}
                        className={`liquid-btn w-full font-bold py-3 px-4 rounded-xl text-sm border ${
                          gameState.colors[role] === 'moderator'
                            ? 'bg-rose-500/20 text-rose-200 hover:bg-rose-500/30 border-rose-400/35'
                            : 'bg-violet-500/20 text-violet-200 hover:bg-violet-500/30 border-violet-400/35'
                        }`}
                      >
                        {gameState.colors[role] === 'moderator'
                          ? 'Jugar como Jugador Normal'
                          : 'Activar Modo Moderador'}
                      </button>
                      <p className="text-slate-400 text-xs mt-3 leading-relaxed">
                        {gameState.colors[role] === 'moderator'
                          ? 'No participarás en turnos ni puntuaciones. Ideal si solo administrarás la partida.'
                          : 'Participarás en turnos y puntuaciones como un jugador más.'}
                      </p>
                    </section>

                    {/* Presets Section */}
                    <section className="scroll-reveal-card liquid-glass p-5 rounded-[1.75rem]">
                      <div className="flex justify-between items-center mb-3.5">
                        <h2 className="text-amber-300 font-extrabold text-base flex items-center gap-2">
                          <Layers size={18} />
                          <span>Presets de Juegos</span>
                        </h2>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full liquid-glass-subtle text-slate-300 truncate max-w-[140px]">
                          {gameState.activePreset
                            ? presetsData?.find((p) => p.name === gameState.activePreset)?.name ||
                              gameState.activePreset
                            : 'Personalizado'}
                        </span>
                      </div>

                      <select
                        className="liquid-input w-full p-3 rounded-xl text-sm font-semibold mb-3.5"
                        value={gameState.activePreset || ''}
                        onChange={(e) => {
                          if (e.target.value) {
                            socket.emit('loadPreset', e.target.value);
                          }
                        }}
                      >
                        <option value="" disabled>
                          -- Cargar Preset --
                        </option>
                        {presetsData &&
                          presetsData.map((p) => (
                            <option key={p.id} value={p.name}>
                              {p.name} {p.isBuiltIn ? '(Oficial)' : ''}
                            </option>
                          ))}
                      </select>

                      {!isSavingPreset ? (
                        <button
                          type="button"
                          onClick={() => setIsSavingPreset(true)}
                          className="liquid-btn w-full py-2.5 bg-sky-500/15 hover:bg-sky-500/25 text-sky-200 font-bold text-sm rounded-xl border border-sky-400/30"
                        >
                          Guardar Configuración Actual
                        </button>
                      ) : (
                        <div className="flex flex-col gap-2.5 animate-fade-slide-up">
                          <input
                            type="text"
                            placeholder="Nombre del Preset"
                            value={newPresetName}
                            onChange={(e) => setNewPresetName(e.target.value)}
                            className="liquid-input w-full p-3 rounded-xl text-sm"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (newPresetName.trim()) {
                                  socket.emit('savePreset', newPresetName.trim());
                                  toast.success(`Preset "${newPresetName.trim()}" guardado`);
                                  setIsSavingPreset(false);
                                  setNewPresetName('');
                                }
                              }}
                              className="liquid-btn flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm rounded-xl"
                            >
                              Guardar Preset
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsSavingPreset(false)}
                              className="liquid-btn liquid-btn-glass px-5 py-2.5 text-slate-200 font-bold text-sm rounded-xl"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )}
                    </section>

                    {/* Game Modules Config */}
                    <section className="scroll-reveal-tall liquid-glass p-5 rounded-[1.75rem]">
                      <h2 className="text-amber-300 font-extrabold text-base mb-4 flex items-center gap-2">
                        <Settings size={18} />
                        <span>Configuración de Partida</span>
                      </h2>

                      <div className="divide-y divide-white/10">
                        {MODULE_ROWS.map((mod) => {
                          const Icon = mod.icon;
                          const isEnabled = Boolean(gameState.modules[mod.key]?.enabled);
                          return (
                            <div
                              key={mod.key}
                              className="flex items-center justify-between gap-3 py-3.5 first:pt-1 last:pb-1"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span
                                  className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 transition-opacity ${
                                    mod.iconTone
                                  } ${isEnabled ? 'opacity-100' : 'opacity-45'}`}
                                >
                                  <Icon size={17} />
                                </span>
                                <div className="min-w-0">
                                  <div className="text-white font-bold text-sm truncate">
                                    {mod.title}
                                  </div>
                                  <div className="text-xs text-slate-400 truncate">
                                    {mod.lobbyDesc}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => isEnabled && setActiveSettingsMode(mod.key)}
                                  aria-label={`Configurar ${mod.title}`}
                                  disabled={!isEnabled}
                                  className={`liquid-btn p-2 rounded-xl border transition-all ${
                                    isEnabled
                                      ? 'liquid-btn-glass text-slate-200 hover:text-white'
                                      : 'border-transparent text-slate-600 opacity-30 cursor-not-allowed'
                                  }`}
                                >
                                  <Settings size={17} />
                                </button>
                                <ToggleSwitch
                                  checked={isEnabled}
                                  onChange={(val) =>
                                    socket.emit('updateModules', {
                                      [mod.key]: { ...gameState.modules[mod.key], enabled: val },
                                    })
                                  }
                                  label={`Activar ${mod.title}`}
                                  size="sm"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  </div>
                ) : (
                  <section className="scroll-reveal-card liquid-glass p-6 rounded-[1.75rem] text-center">
                    <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center mx-auto mb-3 text-sky-300">
                      <Crown size={22} />
                    </div>
                    <p className="text-slate-200 text-sm font-semibold">
                      El anfitrión{' '}
                      <span className="text-white font-extrabold">
                        {gameState.names?.[gameState.host] || gameState.host}
                      </span>{' '}
                      está configurando la partida.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                      {MODULE_ROWS.filter((m) => gameState.modules[m.key]?.enabled).map((m) => {
                        const Icon = m.icon;
                        return (
                          <div
                            key={m.key}
                            className="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/15 border border-emerald-400/30 text-emerald-200 inline-flex items-center gap-1.5"
                          >
                            <Icon size={13} />
                            <span>{m.title}</span>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* Lobby Footer Actions */}
                <section className="scroll-reveal-card pt-2 pb-4 space-y-3">
                  {/* Readiness bar */}
                  <div className="liquid-glass-subtle px-4 py-3 rounded-2xl">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-2 tabular-nums">
                      <span>Jugadores Listos</span>
                      <span className="text-emerald-300">
                        {readyCount} / {totalColoredPlayers}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-sky-400 transition-all duration-300"
                        style={{
                          width: `${
                            totalColoredPlayers > 0
                              ? Math.round((readyCount / totalColoredPlayers) * 100)
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  {isHost && (
                    <div className="grid grid-cols-1 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowMobileStats(true);
                          socket.emit('toggleStatsView', true);
                        }}
                        className="liquid-btn w-full font-bold text-base py-3.5 rounded-2xl border bg-sky-500/15 hover:bg-sky-500/25 text-sky-200 border-sky-400/35 flex items-center justify-center gap-2"
                      >
                        <BarChart3 size={19} />
                        <span>Estadísticas e Historial</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => socket.emit('startGame')}
                        className="liquid-btn w-full bg-gradient-to-r from-amber-400 to-yellow-500 hover:brightness-105 text-amber-950 font-black text-lg py-4 rounded-2xl shadow-[0_14px_30px_-10px_rgba(250,204,21,0.6)]"
                      >
                        Forzar Inicio
                      </button>
                    </div>
                  )}

                  {!gameState.ready?.[role] ? (
                    <button
                      type="button"
                      onClick={handleReady}
                      className="liquid-btn w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:brightness-105 text-slate-950 font-black text-lg py-4 rounded-2xl shadow-[0_16px_34px_-10px_rgba(16,185,129,0.65)]"
                    >
                      ¡Estoy Listo!
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleReady}
                      className="liquid-btn w-full liquid-glass text-emerald-300 font-extrabold text-lg py-3.5 rounded-2xl border-emerald-400/50 shadow-[0_0_24px_-8px_rgba(52,211,153,0.45)] flex flex-col items-center"
                    >
                      <span className="flex items-center gap-1.5">
                        <Check size={19} />
                        <span>Listo</span>
                      </span>
                      <span className="text-xs text-slate-400 font-medium mt-0.5">
                        Toca para cancelar
                      </span>
                    </button>
                  )}
                </section>
              </div>
            ) : gameState.status === 'FINISHED' ? (
              <div className="flex-1 flex flex-col items-center justify-center py-6 space-y-5">
                <div className="liquid-glass-modal liquid-glow-amber rounded-[2.25rem] p-7 w-full text-center border-amber-300/35 animate-modal-pop">
                  <div className="w-16 h-16 rounded-2xl bg-amber-400/15 border border-amber-300/40 flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(250,204,21,0.3)]">
                    <Trophy size={34} className="text-amber-300" />
                  </div>
                  <h1 className="text-3xl font-black text-amber-300 uppercase tracking-wider">
                    Partida Terminada
                  </h1>
                  <p className="text-slate-300 text-base mt-3">
                    Ganador:{' '}
                    <span className="font-black text-white text-xl">
                      {gameState.names?.[gameState.winner] ||
                        gameState.modules.score?.teams?.[gameState.winner]?.name ||
                        gameState.winner}
                    </span>
                  </p>
                </div>

                {isHost && (
                  <div className="w-full space-y-3.5">
                    {!gameState.activePreset ? (
                      <div className="liquid-glass p-4 rounded-2xl">
                        <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
                          Nombre de la Partida (Para Historial)
                        </label>
                        <div className="flex flex-col gap-2.5">
                          <input
                            type="text"
                            value={customGameName}
                            onChange={(e) => setCustomGameName(e.target.value)}
                            placeholder="Partida Personalizada"
                            className="liquid-input w-full px-3.5 py-3 rounded-xl text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (customGameName.trim() && !isGameSaved) {
                                socket.emit('updateGameName', customGameName.trim());
                                setIsGameSaved(true);
                                toast.success('Partida guardada en el historial');
                              }
                            }}
                            disabled={isGameSaved || !customGameName.trim()}
                            className={`liquid-btn w-full px-4 py-3 rounded-xl font-extrabold text-sm ${
                              isGameSaved || !customGameName.trim()
                                ? 'liquid-glass-subtle text-slate-400 cursor-not-allowed opacity-70'
                                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                            }`}
                          >
                            {isGameSaved ? '✓ Guardado en Historial' : 'Guardar'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="liquid-glass p-4 rounded-2xl border-emerald-400/35 text-center">
                        <div className="text-emerald-300 font-extrabold text-sm mb-1">
                          ✓ Guardado Automáticamente
                        </div>
                        <div className="text-slate-300 text-xs">
                          Registrado como:{' '}
                          <span className="text-white font-bold">{gameState.activePreset}</span>
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setShowMobileStats(true);
                        socket.emit('toggleStatsView', true);
                      }}
                      className="liquid-btn w-full font-bold text-base py-3.5 rounded-2xl border bg-sky-500/15 hover:bg-sky-500/25 text-sky-200 border-sky-400/35 flex items-center justify-center gap-2"
                    >
                      <BarChart3 size={19} />
                      <span>Estadísticas e Historial</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirmLobby) socket.emit('returnToLobby');
                        else {
                          setConfirmLobby(true);
                          setTimeout(() => setConfirmLobby(false), 3000);
                        }
                      }}
                      className={`liquid-btn w-full font-bold text-base py-4 rounded-2xl border ${
                        confirmLobby
                          ? 'bg-rose-600 text-white border-rose-400 shadow-[0_12px_28px_-8px_rgba(244,63,94,0.6)]'
                          : 'liquid-btn-glass text-slate-300'
                      }`}
                    >
                      {confirmLobby ? '¿Estás Seguro? (Toca de nuevo)' : 'Volver al Lobby'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-5 pb-24">
                {/* Turn Status Banner */}
                {gameState.modules.turns?.enabled && gameState.turn && (
                  <div
                    className={`scroll-reveal-card px-4 py-3 rounded-2xl border flex items-center justify-between transition-all ${
                      gameState.turn === role
                        ? 'bg-gradient-to-r from-sky-500/20 via-indigo-500/20 to-emerald-500/20 border-sky-300/45 shadow-[0_10px_28px_-10px_rgba(56,189,248,0.45)]'
                        : 'liquid-glass-subtle'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          gameState.turn === role
                            ? 'bg-sky-300 animate-ping'
                            : 'bg-slate-500'
                        }`}
                      />
                      <span className="text-sm font-extrabold text-white">
                        {gameState.turn === role
                          ? '¡Es tu turno!'
                          : `Turno de ${gameState.names?.[gameState.turn] || gameState.turn}`}
                      </span>
                    </div>
                    {gameState.modules.turns.countRounds && (
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300 tabular-nums px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10">
                        Ronda {gameState.moduleStates.turns.currentRound}
                      </span>
                    )}
                  </div>
                )}

                {/* Hidden Roles UI */}
                {gameState.modules.hiddenRoles?.enabled &&
                  gameState.moduleStates.hiddenRoles?.rolesDistributed && (
                    <section className="scroll-reveal-card liquid-glass p-5 rounded-[1.75rem] border-violet-400/30 flex flex-col items-center relative overflow-hidden">
                      <span className="text-violet-300 font-extrabold mb-3 uppercase tracking-[0.2em] text-xs flex items-center gap-1.5">
                        <Shield size={14} />
                        <span>Tu Rol Secreto</span>
                      </span>
                      <button
                        type="button"
                        onPointerDown={() => setShowSecretRole(true)}
                        onPointerUp={() => setShowSecretRole(false)}
                        onPointerLeave={() => setShowSecretRole(false)}
                        onPointerCancel={() => setShowSecretRole(false)}
                        onContextMenu={(e) => e.preventDefault()}
                        className={`liquid-btn w-full py-6 px-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-2 ${
                          showSecretRole
                            ? 'bg-gradient-to-br from-indigo-600/90 to-violet-700/90 border-violet-300/80 scale-[1.02] shadow-[0_0_36px_rgba(129,140,248,0.55)]'
                            : 'liquid-glass-subtle border-white/10'
                        }`}
                        style={{ touchAction: 'none' }}
                      >
                        <span className="text-violet-200/80">
                          {showSecretRole ? <Eye size={20} /> : <EyeOff size={20} />}
                        </span>
                        <span
                          className={`text-2xl font-black transition-all duration-300 ${
                            showSecretRole ? 'text-white blur-0' : 'text-slate-400 blur-[3px] select-none'
                          }`}
                        >
                          {showSecretRole ? secretRole || 'Sin Rol' : 'Mantén presionado'}
                        </span>
                      </button>

                      {isHost &&
                        gameState.modules.hiddenRoles?.hostSeesAll &&
                        allSecretRoles &&
                        typeof allSecretRoles === 'object' &&
                        Object.keys(allSecretRoles).length > 0 && (
                          <div className="w-full mt-3 pt-3 border-t border-white/10">
                            <div className="text-[11px] font-bold uppercase tracking-wider text-violet-300/80 mb-2 text-center">
                              Vista de Moderador
                            </div>
                            <div className="grid grid-cols-2 gap-1.5">
                              {Object.entries(allSecretRoles).map(([pRole, assigned]) => (
                                <div
                                  key={pRole}
                                  className="liquid-glass-subtle px-2.5 py-1.5 rounded-xl flex justify-between items-center text-xs"
                                >
                                  <span className="text-slate-300 truncate mr-1">
                                    {gameState.names?.[pRole] || pRole}
                                  </span>
                                  <span className="font-bold text-violet-200 truncate">
                                    {assigned}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                    </section>
                  )}

                {/* Score Module UI */}
                {gameState.modules.score?.enabled && (
                  <section className="scroll-reveal-card liquid-glass p-5 rounded-[1.75rem] flex flex-col items-center">
                    <span className="text-slate-400 font-extrabold mb-2 uppercase tracking-[0.2em] text-xs">
                      Puntos
                    </span>

                    {(() => {
                      let target = role;
                      if (gameState.modules.score?.mode === 'global') target = 'global';
                      if (gameState.modules.score?.mode === 'teams') {
                        target =
                          Object.keys(gameState.modules.score?.teams).find((tId) =>
                            gameState.modules.score?.teams[tId].members.includes(role)
                          ) || null;
                      }

                      if (!target) {
                        return <div className="text-slate-400 text-sm py-3">No tienes equipo</div>;
                      }

                      return (
                        <>
                          <div className="flex flex-col items-center w-full mb-3">
                            {gameState.modules.score?.mode === 'teams' && (
                              <div className="flex flex-col items-center mb-3 w-full">
                                {(() => {
                                  const team = gameState.modules.score?.teams[target];
                                  const isLeader = team.members[0] === role;

                                  if (isEditingTeamName && isLeader) {
                                    return (
                                      <div className="flex flex-col items-center gap-2 w-full">
                                        <input
                                          type="text"
                                          value={tempTeamName}
                                          onChange={(e) => setTempTeamName(e.target.value)}
                                          className="liquid-input px-3 py-2 rounded-xl w-full text-center text-sm"
                                          placeholder="Nombre del equipo"
                                        />
                                        <div className="flex items-center gap-2 w-full">
                                          <select
                                            className="liquid-input rounded-xl p-2 flex-1 text-xs"
                                            value={tempTeamColor || team.colorRole}
                                            onChange={(e) => setTempTeamColor(e.target.value)}
                                          >
                                            {team.members.map((m) => (
                                              <option key={m} value={m}>
                                                Color de {gameState.names[m] || m}
                                              </option>
                                            ))}
                                          </select>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              socket.emit('updateTeam', {
                                                teamId: target,
                                                name: tempTeamName,
                                                colorRole: tempTeamColor || team.colorRole,
                                              });
                                              setIsEditingTeamName(false);
                                            }}
                                            className="liquid-btn bg-emerald-500 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-sm"
                                          >
                                            <Check size={16} />
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  }

                                  return (
                                    <div className="flex items-center gap-2">
                                      <span className="text-lg font-extrabold text-white">
                                        {team.name}
                                      </span>
                                      {isLeader && (
                                        <button
                                          type="button"
                                          aria-label="Editar nombre del equipo"
                                          onClick={() => {
                                            setTempTeamName(team.name);
                                            setTempTeamColor(team.colorRole);
                                            setIsEditingTeamName(true);
                                          }}
                                          className="text-slate-400 hover:text-white p-1"
                                        >
                                          <Pencil size={14} />
                                        </button>
                                      )}
                                    </div>
                                  );
                                })()}
                              </div>
                            )}

                            <div className="flex items-center justify-between w-full px-2">
                              <button
                                type="button"
                                aria-label="Restar 1 punto"
                                onClick={() => socket.emit('updateScore', { target, delta: -1 })}
                                className="liquid-btn w-16 h-16 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-2xl flex items-center justify-center text-4xl font-black border border-rose-400/35"
                              >
                                −
                              </button>
                              <span className="text-6xl font-black text-white tabular-nums tracking-tight drop-shadow">
                                {gameState.moduleStates.score[target] || 0}
                              </span>
                              <button
                                type="button"
                                aria-label="Sumar 1 punto"
                                onClick={() => socket.emit('updateScore', { target, delta: 1 })}
                                className="liquid-btn w-16 h-16 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-2xl flex items-center justify-center text-4xl font-black border border-emerald-400/35"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div className="flex gap-2 w-full mt-2 liquid-glass-subtle p-2 rounded-2xl">
                            <input
                              type="number"
                              placeholder="0"
                              value={customScore}
                              onChange={(e) => setCustomScore(e.target.value)}
                              className="liquid-input flex-1 p-2 rounded-xl text-center font-bold tabular-nums min-w-0"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const val = parseInt(customScore, 10);
                                if (!isNaN(val) && val !== 0) {
                                  socket.emit('updateScore', { target, delta: -Math.abs(val) });
                                  setCustomScore('');
                                }
                              }}
                              className="liquid-btn bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-bold text-sm px-3.5 py-2 rounded-xl border border-rose-400/30"
                            >
                              Quitar
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const val = parseInt(customScore, 10);
                                if (!isNaN(val) && val !== 0) {
                                  socket.emit('updateScore', { target, delta: Math.abs(val) });
                                  setCustomScore('');
                                }
                              }}
                              className="liquid-btn bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-bold text-sm px-3.5 py-2 rounded-xl border border-emerald-400/30"
                            >
                              Añadir
                            </button>
                          </div>
                        </>
                      );
                    })()}
                  </section>
                )}

                {/* Active Voting Module UI */}
                {gameState.modules.voting?.enabled && gameState.moduleStates.voting?.active && (
                  <section className="liquid-glass-modal liquid-glow-indigo rounded-[1.75rem] p-5 border-indigo-400/40 animate-modal-pop">
                    <h3 className="text-xl font-black text-white mb-2 text-center flex items-center justify-center gap-2">
                      <Vote size={20} className="text-indigo-300" />
                      <span>{gameState.moduleStates.voting.question}</span>
                    </h3>

                    {gameState.moduleStates.voting.resultsRevealed ? (
                      <div className="mt-4 text-center text-indigo-200 font-bold text-sm liquid-glass-subtle py-3.5 px-4 rounded-xl">
                        ¡Resultados revelados en la pantalla principal!
                      </div>
                    ) : gameState.moduleStates.voting.votes[role] ? (
                      <div className="mt-4 text-center text-indigo-200 font-bold liquid-glass-subtle py-4 px-4 rounded-xl border-indigo-400/25">
                        Has votado:{' '}
                        <span className="text-white">
                          {gameState.moduleStates.voting.votes[role]}
                        </span>
                        <span className="text-xs font-medium text-indigo-300/80 mt-1.5 block">
                          Esperando a los demás...
                        </span>
                      </div>
                    ) : (
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {gameState.moduleStates.voting.options.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => socket.emit('submitVote', opt)}
                            className="liquid-btn bg-indigo-500/30 hover:bg-indigo-500/45 border border-indigo-300/35 text-white font-extrabold py-3.5 px-4 rounded-xl"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}

                    {isHost && (
                      <div className="mt-5 pt-4 border-t border-white/10 flex flex-col gap-2">
                        <p className="text-center text-indigo-200 text-xs font-bold tabular-nums">
                          Votos recibidos: {Object.keys(gameState.moduleStates.voting.votes).length}{' '}
                          /{' '}
                          {
                            Object.keys(gameState.colors).filter(
                              (r) => gameState.colors[r] && gameState.colors[r] !== 'moderator'
                            ).length
                          }
                        </p>
                        {!gameState.moduleStates.voting.resultsRevealed ? (
                          <button
                            type="button"
                            onClick={() => socket.emit('revealVote')}
                            className="liquid-btn w-full bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 font-black py-3 rounded-xl"
                          >
                            Revelar Resultados
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => socket.emit('closeVote')}
                            className="liquid-btn w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-xl"
                          >
                            Cerrar Votación
                          </button>
                        )}
                      </div>
                    )}
                  </section>
                )}

                {/* Host Start Vote Controls */}
                {isHost &&
                  gameState.modules.voting?.enabled &&
                  !gameState.moduleStates.voting?.active && (
                    <section className="scroll-reveal-card liquid-glass p-4 rounded-2xl border-indigo-400/25">
                      {gameState.moduleStates.voting?.resultsRevealed ? (
                        <button
                          type="button"
                          onClick={() => socket.emit('closeVote')}
                          className="liquid-btn w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-xl"
                        >
                          Ocultar Resultados de TV
                        </button>
                      ) : (
                        <>
                          {gameState.modules.voting.mode === 'custom' &&
                            gameState.modules.voting.dynamicCustomOptions && (
                              <div className="mb-3.5 liquid-glass-subtle p-3.5 rounded-xl">
                                <label className="block text-indigo-200 text-xs font-bold uppercase tracking-wider mb-2.5">
                                  Opciones de esta votación
                                </label>
                                <div className="flex flex-col gap-1.5 mb-3">
                                  {dynamicVoteOptions.length === 0 ? (
                                    <span className="text-slate-400 italic text-xs text-center py-1">
                                      No hay opciones. Añade al menos 2.
                                    </span>
                                  ) : (
                                    dynamicVoteOptions.map((opt, idx) => (
                                      <div
                                        key={idx}
                                        className="flex items-center justify-between bg-indigo-500/15 border border-indigo-400/25 text-slate-100 px-3 py-2 rounded-xl text-sm"
                                      >
                                        <span className="font-semibold">{opt}</span>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setDynamicVoteOptions((prev) =>
                                              prev.filter((_, i) => i !== idx)
                                            )
                                          }
                                          aria-label={`Quitar opción ${opt}`}
                                          className="text-rose-400 hover:text-rose-200 p-1"
                                        >
                                          <X size={14} />
                                        </button>
                                      </div>
                                    ))
                                  )}
                                </div>
                                <form
                                  onSubmit={(e) => {
                                    e.preventDefault();
                                    if (newDynamicOption.trim()) {
                                      setDynamicVoteOptions((prev) => [
                                        ...prev,
                                        newDynamicOption.trim(),
                                      ]);
                                      setNewDynamicOption('');
                                    }
                                  }}
                                  className="flex gap-2"
                                >
                                  <input
                                    type="text"
                                    value={newDynamicOption}
                                    onChange={(e) => setNewDynamicOption(e.target.value)}
                                    placeholder="Nueva opción..."
                                    className="liquid-input flex-1 min-w-0 rounded-xl p-2.5 text-sm"
                                  />
                                  <button
                                    type="submit"
                                    aria-label="Añadir opción"
                                    className="liquid-btn bg-indigo-500 hover:bg-indigo-400 shrink-0 text-white px-3.5 py-2.5 rounded-xl font-bold"
                                  >
                                    <Plus size={18} />
                                  </button>
                                </form>
                              </div>
                            )}
                          <button
                            type="button"
                            onClick={() => {
                              let opts = [];
                              if (
                                gameState.modules.voting.mode === 'custom' &&
                                gameState.modules.voting.dynamicCustomOptions
                              ) {
                                if (dynamicVoteOptions.length < 2) {
                                  toast.error('Ingresa al menos 2 opciones para votar');
                                  return;
                                }
                                opts = [...dynamicVoteOptions];
                              }
                              socket.emit('startVote', null, opts);
                              setDynamicVoteOptions([]);
                            }}
                            className="liquid-btn w-full bg-gradient-to-r from-indigo-500 to-violet-500 hover:brightness-110 text-white font-extrabold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-[0_12px_28px_-10px_rgba(99,102,241,0.65)]"
                          >
                            <Vote size={18} />
                            <span>Iniciar Votación (Host)</span>
                          </button>
                        </>
                      )}
                    </section>
                  )}

                {/* Host Distribute Hidden Roles Button */}
                {isHost &&
                  gameState.modules.hiddenRoles?.enabled &&
                  !gameState.moduleStates.hiddenRoles?.rolesDistributed && (
                    <button
                      type="button"
                      onClick={() =>
                        socket.emit(
                          'distributeHiddenRoles',
                          gameState.modules.hiddenRoles.roleDeck || []
                        )
                      }
                      className="scroll-reveal-card liquid-btn w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:brightness-110 text-white font-extrabold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-[0_12px_28px_-10px_rgba(139,92,246,0.6)]"
                    >
                      <Shield size={18} />
                      <span>Repartir Roles Ocultos (Host)</span>
                    </button>
                  )}

                {/* Timer Card */}
                {gameState.modules.timer?.enabled && (
                  <section className="scroll-reveal-card liquid-glass p-5 rounded-[1.75rem] flex flex-col items-center">
                    <span className="text-slate-400 font-extrabold mb-1 uppercase tracking-[0.2em] text-xs flex items-center gap-1.5">
                      <Timer size={14} />
                      <span>Tiempo</span>
                    </span>
                    <span
                      className={`text-6xl font-black tabular-nums tracking-tight ${
                        gameState.moduleStates.timer.timeLeft <= 10 &&
                        gameState.moduleStates.timer.isRunning
                          ? 'text-rose-400 animate-pulse drop-shadow-[0_0_20px_rgba(244,63,94,0.65)]'
                          : 'text-white'
                      }`}
                    >
                      {gameState.moduleStates.timer.timeLeft}s
                    </span>

                    {/* Timer Progress Track */}
                    <div className="w-full h-2 rounded-full bg-slate-900/90 border border-white/10 mt-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          gameState.moduleStates.timer.timeLeft <= 10
                            ? 'bg-rose-500'
                            : gameState.moduleStates.timer.timeLeft <=
                                gameState.modules.timer.seconds / 2
                              ? 'bg-amber-400'
                              : 'bg-emerald-400'
                        }`}
                        style={{
                          width: `${
                            (gameState.moduleStates.timer.timeLeft /
                              Math.max(1, gameState.modules.timer.seconds)) *
                            100
                          }%`,
                        }}
                      />
                    </div>

                    {((gameState.modules.timer?.allowPlayerControls && gameState.turn === role) ||
                      isHost) && (
                      <div className="flex gap-2.5 mt-4 w-full">
                        {gameState.moduleStates.timer.isRunning ? (
                          <button
                            type="button"
                            onClick={() => socket.emit('pauseTimer')}
                            className="liquid-btn flex-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/35 text-amber-200 font-bold py-3 rounded-xl flex items-center justify-center gap-1.5"
                          >
                            <Pause size={16} />
                            <span>Pausar</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => socket.emit('startTimer')}
                            className="liquid-btn flex-1 bg-emerald-500/25 hover:bg-emerald-500/35 border border-emerald-400/40 text-emerald-200 font-bold py-3 rounded-xl flex items-center justify-center gap-1.5"
                          >
                            <Play size={16} />
                            <span>Iniciar</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => socket.emit('resetTimer')}
                          className="liquid-btn liquid-btn-glass flex-1 text-slate-200 font-bold py-3 rounded-xl flex items-center justify-center gap-1.5"
                        >
                          <RotateCcw size={16} />
                          <span>Reiniciar</span>
                        </button>
                      </div>
                    )}
                  </section>
                )}

                {/* Primary Action Buttons (Dice & Turns) */}
                <section className="scroll-reveal-card space-y-3">
                  {gameState.modules.dice?.enabled &&
                    (!gameState.modules.turns?.enabled ||
                    gameState.turn === role ||
                    gameState.modules.dice?.allowOutOfTurn ? (
                      <button
                        type="button"
                        onClick={() => socket.emit('rollDice')}
                        className="liquid-btn w-full bg-gradient-to-r from-rose-600 via-red-500 to-rose-500 hover:brightness-110 text-white font-black text-xl py-5 rounded-[1.75rem] shadow-[0_18px_38px_-10px_rgba(239,68,68,0.65)] border border-rose-300/35 flex items-center justify-center gap-3"
                      >
                        <Dices size={28} />
                        <span>Tirar Dados</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="w-full liquid-glass-subtle text-slate-500 font-bold text-lg py-5 rounded-[1.75rem] flex items-center justify-center gap-3 cursor-not-allowed"
                      >
                        <Dices size={24} className="opacity-40" />
                        <span>Esperando tu turno...</span>
                      </button>
                    ))}

                  {gameState.modules.turns?.enabled &&
                    (gameState.turn === role ? (
                      <button
                        type="button"
                        onClick={() => socket.emit('endTurn')}
                        className="liquid-btn w-full bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 hover:brightness-110 text-white font-black text-xl py-5 rounded-[1.75rem] shadow-[0_18px_38px_-10px_rgba(56,189,248,0.55)] border border-sky-300/40 flex items-center justify-center"
                      >
                        Terminar Turno
                      </button>
                    ) : (
                      !gameState.modules.dice?.enabled && (
                        <div className="liquid-glass-subtle rounded-2xl text-center text-slate-400 font-bold py-5 text-sm">
                          Esperando tu turno...
                        </div>
                      )
                    ))}

                  {isHost &&
                    gameState.modules.turns?.enabled &&
                    gameState.modules.turns?.countRounds &&
                    !gameState.modules.turns?.autoRound && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirmRound) {
                            socket.emit('advanceRound');
                            setConfirmRound(false);
                          } else {
                            setConfirmRound(true);
                            setTimeout(() => setConfirmRound(false), 3000);
                          }
                        }}
                        className={`liquid-btn w-full font-bold text-base py-3.5 rounded-2xl border ${
                          confirmRound
                            ? 'bg-indigo-600 text-white border-indigo-400'
                            : 'bg-indigo-500/15 text-indigo-200 border-indigo-400/30 hover:bg-indigo-500/25'
                        }`}
                      >
                        {confirmRound
                          ? '¿Avanzar de Ronda? (Toca de nuevo)'
                          : 'Avanzar Ronda (Host)'}
                      </button>
                    )}
                </section>

                {/* Host Moderator Panel */}
                {isHost && gameState.modules.turns?.showModeratorPanel !== false && (
                  <section className="scroll-reveal-tall liquid-glass rounded-[1.75rem] p-5">
                    <h3 className="text-base font-extrabold text-white mb-4 text-center uppercase tracking-[0.16em]">
                      Panel de Moderador
                    </h3>
                    <div className="space-y-2.5">
                      {Object.keys(gameState.colors)
                        .filter((r) => gameState.colors[r] && gameState.colors[r] !== 'moderator')
                        .map((playerRole) => {
                          const isDead =
                            gameState.moduleStates.turns?.deadPlayers?.includes(playerRole);
                          const isTurn = gameState.turn === playerRole;
                          return (
                            <div
                              key={playerRole}
                              className={`flex flex-col sm:flex-row justify-between items-center gap-2.5 p-3.5 rounded-2xl border ${
                                isTurn
                                  ? 'bg-indigo-500/15 border-indigo-400/40'
                                  : 'liquid-glass-subtle'
                              }`}
                            >
                              <span
                                className={`font-bold text-base ${
                                  isDead
                                    ? 'text-slate-500 line-through'
                                    : isTurn
                                      ? 'text-indigo-200'
                                      : 'text-white'
                                }`}
                              >
                                {gameState.names[playerRole]}
                                {isTurn && (
                                  <span className="ml-2 text-xs font-extrabold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200">
                                    En Turno
                                  </span>
                                )}
                              </span>
                              <div className="flex gap-2 w-full sm:w-auto">
                                {gameState.modules.score?.enabled && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        socket.emit('updateScore', {
                                          target: playerRole,
                                          delta: -1,
                                        })
                                      }
                                      className="liquid-btn flex-1 sm:flex-none bg-rose-500/20 hover:bg-rose-500/35 border border-rose-400/30 text-rose-200 font-bold w-10 h-10 rounded-xl flex items-center justify-center"
                                    >
                                      -1
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        socket.emit('updateScore', {
                                          target: playerRole,
                                          delta: 1,
                                        })
                                      }
                                      className="liquid-btn flex-1 sm:flex-none bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-400/30 text-emerald-200 font-bold w-10 h-10 rounded-xl flex items-center justify-center"
                                    >
                                      +1
                                    </button>
                                  </>
                                )}
                                {gameState.modules.turns?.enabled && (
                                  <button
                                    type="button"
                                    onClick={() => socket.emit('togglePlayerDead', playerRole)}
                                    className={`liquid-btn flex-1 sm:flex-none font-bold px-3.5 py-2 rounded-xl text-sm border ${
                                      isDead
                                        ? 'bg-indigo-500/20 text-indigo-200 border-indigo-400/30 hover:bg-indigo-500/35'
                                        : 'bg-rose-500/20 text-rose-200 border-rose-400/30 hover:bg-rose-500/35'
                                    }`}
                                  >
                                    {isDead ? 'Revivir' : 'Matar'}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </section>
                )}

                {/* Host Return to Lobby Button */}
                {isHost && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirmLobby) socket.emit('returnToLobby');
                      else {
                        setConfirmLobby(true);
                        setTimeout(() => setConfirmLobby(false), 3000);
                      }
                    }}
                    className={`scroll-reveal-card liquid-btn w-full font-bold text-base py-4 rounded-2xl border ${
                      confirmLobby
                        ? 'bg-rose-600 text-white border-rose-400 shadow-[0_12px_28px_-8px_rgba(244,63,94,0.6)]'
                        : 'liquid-btn-glass text-slate-300'
                    }`}
                  >
                    {confirmLobby ? '¿Estás Seguro? (Toca de nuevo)' : 'Volver al Lobby (Host)'}
                  </button>
                )}
              </div>
            )}
          </div>
        </main>
      )}

      {/* Host In-Game Settings Floating Liquid Crystal Action Button */}
      {gameState.status === 'PLAYING' && isHost && !showInGameSettings && !activeSettingsMode && (
        <button
          type="button"
          onClick={() => setShowInGameSettings(true)}
          aria-label="Abrir configuración en juego"
          className="liquid-btn liquid-glass-modal fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full flex items-center justify-center text-white hover:scale-105 group"
        >
          <Settings
            size={24}
            className="transition-transform duration-300 group-hover:rotate-45"
          />
        </button>
      )}

      {/* In-Game Settings Liquid Crystal Modal Drawer */}
      {showInGameSettings && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={inGameSettingsTitleId}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setActiveSettingsMode(null);
              setShowInGameSettings(false);
            }
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 liquid-backdrop animate-fade-slide-up"
        >
          <div className="liquid-glass-modal rounded-[2rem] w-full max-w-lg h-full max-h-[90dvh] flex flex-col overflow-hidden">
            {activeSettingsMode ? (
              renderSettingsSubpage()
            ) : (
              <>
                <div
                  className={`relative z-20 px-5 transition-all duration-200 border-b border-white/10 flex items-center justify-between ${
                    inGameSettingsScroll.isScrolled
                      ? 'py-3 bg-slate-950/65 backdrop-blur-xl shadow-lg'
                      : 'py-4'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowInGameSettings(false)}
                      aria-label="Cerrar configuración en juego"
                      className="liquid-btn liquid-btn-glass w-10 h-10 rounded-full flex items-center justify-center text-slate-300 hover:text-white"
                    >
                      <ArrowLeft size={19} />
                    </button>
                    <h2
                      id={inGameSettingsTitleId}
                      className="text-lg font-extrabold text-white tracking-tight"
                    >
                      Configuración en Juego
                    </h2>
                  </div>

                  {inGameSettingsScroll.hasOverflow && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-sky-400 to-indigo-400 origin-left transition-transform duration-75"
                        style={{
                          transform: `scaleX(${Math.max(0.03, inGameSettingsScroll.scrollProgress)})`,
                        }}
                      />
                    </div>
                  )}
                </div>

                <div ref={inGameSettingsScroll.scrollRef} className="flex-1 liquid-scroll p-5">
                  <div className="liquid-glass-subtle p-4 sm:p-5 rounded-2xl">
                    <h3 className="text-amber-300 font-extrabold text-sm uppercase tracking-[0.16em] mb-3 pb-2.5 border-b border-white/10">
                      Módulos de la Mesa
                    </h3>
                    <div className="divide-y divide-white/10">
                      {MODULE_ROWS.map((mod) => {
                        const Icon = mod.icon;
                        const isEnabled = Boolean(gameState.modules[mod.key]?.enabled);
                        return (
                          <div
                            key={mod.key}
                            className="scroll-reveal-card flex items-center justify-between gap-3 py-3.5 first:pt-1 last:pb-1"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span
                                className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 transition-opacity ${
                                  mod.iconTone
                                } ${isEnabled ? 'opacity-100' : 'opacity-45'}`}
                              >
                                <Icon size={17} />
                              </span>
                              <div className="min-w-0">
                                <div className="text-white font-bold text-sm truncate">
                                  {mod.title}
                                </div>
                                <div className="text-xs text-slate-400 truncate">
                                  {mod.inGameDesc}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => isEnabled && setActiveSettingsMode(mod.key)}
                                aria-label={`Ajustes de ${mod.title}`}
                                disabled={!isEnabled}
                                className={`liquid-btn p-2 rounded-xl border transition-all ${
                                  isEnabled
                                    ? 'liquid-btn-glass text-slate-200 hover:text-white'
                                    : 'border-transparent text-slate-600 opacity-30 cursor-not-allowed'
                                }`}
                              >
                                <Settings size={17} />
                              </button>
                              <ToggleSwitch
                                checked={isEnabled}
                                onChange={(val) =>
                                  socket.emit('updateModules', {
                                    [mod.key]: { ...gameState.modules[mod.key], enabled: val },
                                  })
                                }
                                label={`Activar ${mod.title}`}
                                size="sm"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
    </div>
  );
};

export default MobileScreen;
