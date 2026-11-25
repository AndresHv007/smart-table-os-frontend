import React, { useState } from 'react';
import { ArrowLeft, Shield, Plus, X } from 'lucide-react';
import ToggleSwitch from './ui/ToggleSwitch';
import { useScrollEffects } from '../hooks/useScrollEffects';

const HostSettingsHiddenRoles = ({ gameState, socket, onBack }) => {
  const [newRole, setNewRole] = useState('');
  const { scrollRef, isScrolled, scrollProgress, hasOverflow } = useScrollEffects([
    gameState.modules.hiddenRoles?.roleDeck?.length,
  ]);

  const updateSetting = (setting, value) => {
    socket.emit('updateModules', {
      hiddenRoles: { ...gameState.modules.hiddenRoles, [setting]: value },
    });
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
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div
        className={`relative z-20 px-5 liquid-header ${
          isScrolled ? 'liquid-header-scrolled py-3' : 'py-4'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={onBack}
            aria-label="Volver"
            className="liquid-btn liquid-btn-glass w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-slate-300 hover:text-white"
          >
            <ArrowLeft size={19} />
          </button>
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-8 h-8 rounded-xl bg-violet-500/20 border border-violet-400/30 flex items-center justify-center text-violet-300 shrink-0">
              <Shield size={17} />
            </span>
            <h2 className="text-lg font-extrabold text-white tracking-tight truncate">
              Configurar Roles Ocultos
            </h2>
          </div>
        </div>
        {hasOverflow && (
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-400 to-indigo-400 origin-left transition-transform duration-75"
              style={{ transform: `scaleX(${Math.max(0.03, scrollProgress)})` }}
            />
          </div>
        )}
      </div>

      {gameState.modules.hiddenRoles?.enabled && (
        <div ref={scrollRef} className="flex-1 liquid-scroll px-5 pt-5 pb-16 space-y-4">
          <div className="scroll-reveal-card liquid-glass p-5 rounded-2xl">
            <label className="block text-slate-200 font-bold text-sm mb-3">Mazo de Roles</label>
            <div className="flex flex-wrap gap-2 mb-4">
              {gameState.modules.hiddenRoles.roleDeck.length === 0 ? (
                <span className="text-slate-400 italic text-xs">El mazo está vacío.</span>
              ) : (
                gameState.modules.hiddenRoles.roleDeck.map((role, idx) => (
                  <div
                    key={idx}
                    className="bg-violet-500/20 border border-violet-400/35 text-violet-100 px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold"
                  >
                    <span>{role}</span>
                    <button
                      type="button"
                      onClick={() => removeRole(idx)}
                      aria-label={`Eliminar rol ${role}`}
                      className="text-rose-300 hover:text-white rounded-full"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={addRole} className="flex gap-2">
              <input
                type="text"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                placeholder="Añadir rol (ej: Lobo)"
                className="liquid-input flex-1 min-w-0 rounded-xl p-2.5 text-sm"
              />
              <button
                type="submit"
                aria-label="Añadir rol al mazo"
                className="liquid-btn bg-violet-500 hover:bg-violet-400 shrink-0 text-white px-4 py-2.5 rounded-xl font-bold flex items-center justify-center"
              >
                <Plus size={18} />
              </button>
            </form>
          </div>

          <div className="scroll-reveal-card liquid-glass p-5 rounded-2xl flex items-center justify-between gap-4">
            <div>
              <span className="font-bold text-sm text-white block">Host Moderador</span>
              <span className="text-xs text-slate-400 block mt-0.5 leading-relaxed">
                El host puede ver todos los roles (no juega a ciegas).
              </span>
            </div>
            <ToggleSwitch
              checked={gameState.modules.hiddenRoles.hostSeesAll}
              onChange={(val) => updateSetting('hostSeesAll', val)}
              label="Host puede ver todos los roles"
              accent="indigo"
              size="sm"
            />
          </div>
        </div>
      )}
      {!gameState.modules.hiddenRoles?.enabled && (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="liquid-glass-subtle rounded-2xl p-6 text-center text-sm text-slate-400 max-w-xs">
            Activa el módulo de Roles Ocultos primero para configurar el mazo de roles.
          </div>
        </div>
      )}
    </div>
  );
};

export default HostSettingsHiddenRoles;
