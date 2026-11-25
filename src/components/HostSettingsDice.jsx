import React from 'react';
import { ArrowLeft, Dices, Sparkles, Plus, X } from 'lucide-react';
import ToggleSwitch from './ui/ToggleSwitch';
import { useScrollEffects } from '../hooks/useScrollEffects';

const HostSettingsDice = ({ gameState, socket, onBack }) => {
  const dice = gameState.modules.dice;
  const { scrollRef, isScrolled, scrollProgress, hasOverflow } = useScrollEffects([
    dice.goldenEnabled,
    dice.goldenConditions?.length,
  ]);

  const updateDice = (updates) => {
    socket.emit('updateModules', { dice: { ...dice, ...updates } });
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Sticky Liquid Header */}
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
            <span className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-rose-300 shrink-0">
              <Dices size={17} />
            </span>
            <h2 className="text-lg font-extrabold text-white tracking-tight truncate">
              Configurar Dados
            </h2>
          </div>
        </div>
        {hasOverflow && (
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-rose-400 to-amber-300 origin-left transition-transform duration-75"
              style={{ transform: `scaleX(${Math.max(0.03, scrollProgress)})` }}
            />
          </div>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 liquid-scroll px-5 pt-5 pb-16 space-y-4">
        <div className="scroll-reveal-card liquid-glass p-5 rounded-2xl">
          <label className="block text-slate-200 font-bold text-sm mb-2.5">
            Cantidad de Dados
          </label>
          <select
            className="liquid-input w-full rounded-xl p-3 text-sm font-semibold"
            value={dice.count}
            onChange={(e) => updateDice({ count: parseInt(e.target.value, 10) })}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <option key={n} value={n}>
                {n} Dado(s)
              </option>
            ))}
          </select>
        </div>

        <div className="scroll-reveal-card liquid-glass p-5 rounded-2xl">
          <label className="block text-slate-200 font-bold text-sm mb-2.5">Caras por Dado</label>
          <select
            className="liquid-input w-full rounded-xl p-3 text-sm font-semibold"
            value={dice.faces}
            onChange={(e) => updateDice({ faces: parseInt(e.target.value, 10) })}
          >
            {[4, 6, 8, 10, 12, 20].map((n) => (
              <option key={n} value={n}>
                D{n}
              </option>
            ))}
          </select>
        </div>

        <div className="scroll-reveal-card liquid-glass p-5 rounded-2xl flex justify-between items-center gap-4">
          <div>
            <div className="text-white font-bold text-sm">Tirar fuera de turno</div>
            <div className="text-xs text-slate-400 mt-0.5">
              Cualquiera puede tirar en cualquier momento
            </div>
          </div>
          <ToggleSwitch
            checked={dice.allowOutOfTurn}
            onChange={(val) => updateDice({ allowOutOfTurn: val })}
            label="Tirar fuera de turno"
            size="sm"
          />
        </div>

        <div className="scroll-reveal-card liquid-glass p-5 rounded-2xl border-amber-400/25">
          <div className="flex justify-between items-center gap-4">
            <div>
              <div className="text-amber-300 font-extrabold text-base flex items-center gap-1.5">
                <Sparkles size={16} />
                <span>Dado Dorado (Golden Roll)</span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Activa animaciones doradas épicas en la TV
              </div>
            </div>
            <ToggleSwitch
              checked={dice.goldenEnabled}
              onChange={(val) =>
                updateDice({
                  goldenEnabled: val,
                  goldenConditions: dice.goldenConditions || [],
                })
              }
              label="Activar Dado Dorado"
              accent="amber"
              size="sm"
            />
          </div>

          {dice.goldenEnabled && (
            <div className="space-y-3 pt-4 mt-4 border-t border-white/10">
              {(dice.goldenConditions || []).map((cond, index) => (
                <div
                  key={index}
                  className="liquid-glass-subtle p-3.5 rounded-xl relative border-white/10"
                >
                  <button
                    type="button"
                    aria-label="Eliminar condición"
                    onClick={() => {
                      const newConds = [...(dice.goldenConditions || [])];
                      newConds.splice(index, 1);
                      updateDice({ goldenConditions: newConds });
                    }}
                    className="absolute top-2.5 right-2.5 p-1 rounded-lg text-rose-400 hover:text-rose-200 hover:bg-rose-500/15 transition-colors"
                  >
                    <X size={15} />
                  </button>
                  <div className="pr-7 space-y-3">
                    <div>
                      <label className="block text-slate-400 text-xs font-bold mb-1">
                        Condición
                      </label>
                      <select
                        className="liquid-input w-full rounded-xl p-2.5 text-sm"
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
                      <label className="block text-slate-400 text-xs font-bold mb-1">
                        Valor Requerido
                      </label>
                      <input
                        type="number"
                        className="liquid-input w-full rounded-xl p-2.5 text-sm tabular-nums"
                        value={cond.value || 0}
                        onChange={(e) => {
                          const newConds = [...(dice.goldenConditions || [])];
                          newConds[index] = { ...cond, value: parseInt(e.target.value, 10) || 0 };
                          updateDice({ goldenConditions: newConds });
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const newConds = [
                    ...(dice.goldenConditions || []),
                    { type: 'single_exact', value: 20 },
                  ];
                  updateDice({ goldenConditions: newConds });
                }}
                className="liquid-btn w-full py-2.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-bold text-sm rounded-xl border border-amber-400/30 flex items-center justify-center gap-1.5"
              >
                <Plus size={16} />
                <span>Añadir Condición</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HostSettingsDice;
