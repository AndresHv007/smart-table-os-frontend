import React, { useState } from 'react';
import { ArrowLeft, Vote, Plus, X } from 'lucide-react';
import ToggleSwitch from './ui/ToggleSwitch';
import { useScrollEffects } from '../hooks/useScrollEffects';

const HostSettingsVoting = ({ gameState, socket, onBack }) => {
  const [newOption, setNewOption] = useState('');
  const { scrollRef, isScrolled, scrollProgress, hasOverflow } = useScrollEffects([
    gameState.modules.voting?.mode,
    gameState.modules.voting?.dynamicCustomOptions,
    gameState.modules.voting?.customOptions?.length,
  ]);

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
            <span className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
              <Vote size={17} />
            </span>
            <h2 className="text-lg font-extrabold text-white tracking-tight truncate">
              Configurar Votación Ciega
            </h2>
          </div>
        </div>
        {hasOverflow && (
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-400 to-violet-400 origin-left transition-transform duration-75"
              style={{ transform: `scaleX(${Math.max(0.03, scrollProgress)})` }}
            />
          </div>
        )}
      </div>

      {gameState.modules.voting?.enabled && (
        <div ref={scrollRef} className="flex-1 liquid-scroll px-5 pt-5 pb-16 space-y-4">
          <div className="scroll-reveal-card liquid-glass p-5 rounded-2xl">
            <label className="block text-slate-200 text-sm font-bold mb-2.5">
              Tipo de Opciones (Por Defecto)
            </label>
            <select
              value={gameState.modules.voting.mode}
              onChange={(e) => updateSetting('mode', e.target.value)}
              className="liquid-input w-full rounded-xl p-3 text-sm font-semibold"
            >
              <option value="yes_no">Sí / No</option>
              <option value="players">Jugadores de la Mesa</option>
              <option value="custom">Opciones Personalizadas</option>
            </select>
          </div>

          {gameState.modules.voting.mode === 'custom' && (
            <div className="scroll-reveal-card liquid-glass p-5 rounded-2xl">
              <div className="flex items-center justify-between gap-3 mb-4">
                <label className="block text-white font-bold text-sm">
                  Opciones Personalizadas
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-400">¿En juego?</span>
                  <ToggleSwitch
                    checked={gameState.modules.voting.dynamicCustomOptions}
                    onChange={(val) => updateSetting('dynamicCustomOptions', val)}
                    label="Decidir opciones en juego"
                    accent="indigo"
                    size="sm"
                  />
                </div>
              </div>

              {!gameState.modules.voting.dynamicCustomOptions ? (
                <>
                  <div className="flex flex-col gap-2 mb-4">
                    {(gameState.modules.voting.customOptions || []).length === 0 ? (
                      <span className="text-slate-400 italic text-xs">
                        No hay opciones predefinidas.
                      </span>
                    ) : (
                      (gameState.modules.voting.customOptions || []).map((opt, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between liquid-glass-subtle text-slate-100 px-3.5 py-2.5 rounded-xl"
                        >
                          <span className="font-semibold text-sm">{opt}</span>
                          <button
                            type="button"
                            onClick={() => removeCustomOption(idx)}
                            aria-label={`Eliminar opción ${opt}`}
                            className="text-rose-400 hover:text-rose-200 p-1 rounded-lg hover:bg-rose-500/15"
                          >
                            <X size={15} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={addCustomOption} className="flex gap-2">
                    <input
                      type="text"
                      value={newOption}
                      onChange={(e) => setNewOption(e.target.value)}
                      placeholder="Añadir opción (ej: Atacar, Defender...)"
                      className="liquid-input flex-1 min-w-0 rounded-xl p-2.5 text-sm"
                    />
                    <button
                      type="submit"
                      aria-label="Añadir opción"
                      className="liquid-btn bg-indigo-500 hover:bg-indigo-400 shrink-0 text-white px-4 py-2.5 rounded-xl font-bold flex items-center justify-center"
                    >
                      <Plus size={18} />
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-xs text-slate-300 italic liquid-glass-subtle p-3.5 rounded-xl text-center leading-relaxed">
                  El host ingresará las opciones en tiempo real al momento de iniciar cada votación
                  durante la partida.
                </div>
              )}
            </div>
          )}

          <div className="scroll-reveal-card liquid-glass p-5 rounded-2xl flex items-center justify-between gap-4">
            <div>
              <span className="font-bold text-sm text-white block">Voto Público al Revelar</span>
              <span className="text-xs text-slate-400 block mt-0.5 leading-relaxed">
                Si está desactivado, solo se mostrará la suma total sin revelar quién votó qué.
              </span>
            </div>
            <ToggleSwitch
              checked={gameState.modules.voting.showVotesOnReveal}
              onChange={(val) => updateSetting('showVotesOnReveal', val)}
              label="Voto público al revelar"
              size="sm"
            />
          </div>
        </div>
      )}
      {!gameState.modules.voting?.enabled && (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="liquid-glass-subtle rounded-2xl p-6 text-center text-sm text-slate-400 max-w-xs">
            Activa el módulo de Votación Ciega primero para configurar sus opciones.
          </div>
        </div>
      )}
    </div>
  );
};

export default HostSettingsVoting;
