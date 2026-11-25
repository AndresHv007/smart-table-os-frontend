import React, { useState, useEffect, useId, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { Settings, Trash2, X, Users, Layers, ShieldAlert } from 'lucide-react';
import { useScrollEffects } from '../hooks/useScrollEffects';
import LiquidModal from './ui/LiquidModal';
import { useToast } from './ui/LiquidToast';

const AdminPanel = ({ onClose }) => {
  const { socket, isAdmin } = useSocket();
  const toast = useToast();
  const titleId = useId();
  const [activeTab, setActiveTab] = useState('profiles'); // profiles, presets
  const [profiles, setProfiles] = useState([]);
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null); // { type: 'profile'|'preset', id, name }
  const lastDeleteRef = useRef(null);

  if (pendingDelete) {
    lastDeleteRef.current = pendingDelete;
  }
  const displayDelete = pendingDelete || lastDeleteRef.current;

  const { scrollRef, resetScroll, isScrolled, scrollProgress, hasOverflow } = useScrollEffects([
    activeTab,
    loading,
    profiles.length,
    presets.length,
  ]);

  useEffect(() => {
    resetScroll();
  }, [activeTab, resetScroll]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !document.querySelector('dialog[open]')) {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!isAdmin || !socket) {
      setLoading(false);
      return;
    }
    setLoading(true);
    socket.emit('getAdminData', (res) => {
      if (res?.error) setError(res.error);
      else {
        setProfiles(res?.profiles || []);
        setPresets(res?.presets || []);
      }
      setLoading(false);
    });
  }, [socket, isAdmin]);

  const confirmDelete = () => {
    if (!pendingDelete) return;
    const { type, id, name } = pendingDelete;

    if (type === 'profile') {
      socket.emit('deleteProfile', id, (res) => {
        if (res.success) {
          setProfiles((prev) => prev.filter((p) => p.id !== id));
          toast.success(`Perfil "${name}" eliminado`);
        } else {
          setError(res.error);
          toast.error(res.error || 'No se pudo eliminar el perfil');
        }
      });
    } else if (type === 'preset') {
      socket.emit('deletePreset', id, (res) => {
        if (res.success) {
          setPresets((prev) => prev.filter((p) => p.id !== id));
          toast.success(`Preset "${name}" eliminado`);
        } else {
          setError(res.error);
          toast.error(res.error || 'No se pudo eliminar el preset');
        }
      });
    }
    setPendingDelete(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 liquid-backdrop animate-fade-slide-up"
    >
      <div className="liquid-glass-modal liquid-glow-rose rounded-[2rem] w-full max-w-xl h-full max-h-[90dvh] flex flex-col overflow-hidden border-rose-400/30">
        {/* Sticky Header */}
        <div
          className={`relative z-20 px-5 sm:px-6 transition-all duration-200 border-b border-white/10 ${
            isScrolled ? 'py-3.5 bg-slate-950/65 backdrop-blur-xl shadow-lg' : 'py-5'
          }`}
        >
          <div className="flex justify-between items-center gap-3">
            <h2
              id={titleId}
              className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5 tracking-tight"
            >
              <span className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-400/35 flex items-center justify-center text-rose-300 shrink-0">
                <Settings size={19} />
              </span>
              <span className="truncate">Panel de Administración</span>
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar panel de administración"
              className="liquid-btn liquid-btn-glass w-9 h-9 rounded-full flex items-center justify-center text-slate-300 hover:text-white shrink-0"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5 p-1.5 mt-4 rounded-2xl liquid-glass-subtle">
            <button
              type="button"
              onClick={() => setActiveTab('profiles')}
              className={`liquid-btn py-2.5 px-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                activeTab === 'profiles'
                  ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-[0_8px_20px_-6px_rgba(244,63,94,0.65)]'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users size={15} />
              <span>Perfiles</span>
              <span className="px-1.5 py-0.5 text-[11px] rounded-md bg-black/25 tabular-nums">
                {profiles.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('presets')}
              className={`liquid-btn py-2.5 px-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                activeTab === 'presets'
                  ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-[0_8px_20px_-6px_rgba(244,63,94,0.65)]'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Layers size={15} />
              <span>Presets</span>
              <span className="px-1.5 py-0.5 text-[11px] rounded-md bg-black/25 tabular-nums">
                {presets.length}
              </span>
            </button>
          </div>

          {hasOverflow && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-400 via-amber-300 to-rose-500 origin-left transition-transform duration-75"
                style={{ transform: `scaleX(${Math.max(0.03, scrollProgress)})` }}
              />
            </div>
          )}
        </div>

        {/* Body */}
        <div ref={scrollRef} className="flex-1 liquid-scroll p-5 space-y-4">
          {error && (
            <div className="bg-rose-500/15 border border-rose-400/35 text-rose-200 p-3.5 rounded-2xl text-sm font-medium">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex h-full min-h-[12rem] flex-col items-center justify-center gap-3 text-slate-300">
              <div className="w-9 h-9 rounded-full border-2 border-white/15 border-t-rose-400 animate-spin" />
              <span className="text-sm font-semibold">Cargando datos de administración...</span>
            </div>
          ) : (
            <>
              {activeTab === 'profiles' && (
                <div className="space-y-3">
                  <h3 className="text-slate-400 text-xs font-extrabold uppercase tracking-[0.18em] px-1">
                    Jugadores Registrados ({profiles.length})
                  </h3>
                  {profiles.length === 0 ? (
                    <div className="liquid-glass-subtle rounded-2xl p-8 text-center text-slate-400 text-sm">
                      No hay perfiles registrados todavía.
                    </div>
                  ) : (
                    profiles.map((p) => (
                      <div
                        key={p.id}
                        className="scroll-reveal-card flex justify-between items-center liquid-glass-subtle p-4 rounded-2xl hover:border-white/20 transition-colors"
                      >
                        <div className="min-w-0 pr-3">
                          <div className="font-bold text-white text-base truncate">{p.name}</div>
                          <div className="text-xs text-slate-400 font-mono mt-0.5">ID: {p.id}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPendingDelete({ type: 'profile', id: p.id, name: p.name })}
                          aria-label={`Eliminar perfil ${p.name}`}
                          className="liquid-btn p-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/30 border border-rose-400/25 text-rose-300 hover:text-rose-100 shrink-0"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'presets' && (
                <div className="space-y-3">
                  <h3 className="text-slate-400 text-xs font-extrabold uppercase tracking-[0.18em] px-1">
                    Configuraciones Guardadas ({presets.length})
                  </h3>
                  {presets.length === 0 ? (
                    <div className="liquid-glass-subtle rounded-2xl p-8 text-center text-slate-400 text-sm">
                      No hay presets guardados.
                    </div>
                  ) : (
                    presets.map((p) => (
                      <div
                        key={p.id}
                        className="scroll-reveal-card flex justify-between items-center liquid-glass-subtle p-4 rounded-2xl hover:border-white/20 transition-colors"
                      >
                        <div className="min-w-0 pr-3">
                          <div className="font-bold text-white text-base truncate">{p.name}</div>
                          <div className="mt-1">
                            <span
                              className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                                p.isBuiltIn
                                  ? 'bg-sky-500/15 text-sky-300 border border-sky-400/25'
                                  : 'bg-slate-700/60 text-slate-300 border border-white/10'
                              }`}
                            >
                              {p.isBuiltIn ? 'Oficial (Protegido)' : 'Personalizado'}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPendingDelete({ type: 'preset', id: p.id, name: p.name })}
                          aria-label={`Eliminar preset ${p.name}`}
                          className="liquid-btn p-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/30 border border-rose-400/25 text-rose-300 hover:text-rose-100 shrink-0"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Destructive Delete Confirmation Liquid Modal */}
      <LiquidModal
        isOpen={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        title={
          displayDelete?.type === 'profile' ? 'Eliminar Perfil' : 'Eliminar Preset'
        }
        icon={<ShieldAlert size={20} className="text-rose-400" />}
        titleClassName="text-rose-200"
        maxWidthClass="max-w-sm"
      >
        <p className="text-sm text-slate-300 leading-relaxed mb-5">
          {displayDelete?.type === 'profile' ? (
            <>
              ¿Seguro que deseas eliminar el perfil{' '}
              <strong className="text-white">{displayDelete?.name}</strong>? Esto no afectará las
              partidas ya guardadas, pero el jugador no podrá volver a usar este nombre.
            </>
          ) : (
            <>
              ¿Seguro que deseas eliminar el preset{' '}
              <strong className="text-white">{displayDelete?.name}</strong>?
            </>
          )}
        </p>
        <div className="flex gap-2.5">
          <button
            type="button"
            autoFocus
            data-autofocus
            onClick={() => setPendingDelete(null)}
            className="liquid-btn liquid-btn-glass flex-1 py-3 rounded-xl font-bold text-white"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={confirmDelete}
            className="liquid-btn flex-1 py-3 rounded-xl font-extrabold bg-gradient-to-r from-rose-600 to-red-600 hover:brightness-110 text-white shadow-[0_10px_24px_-8px_rgba(244,63,94,0.65)]"
          >
            Eliminar
          </button>
        </div>
      </LiquidModal>
    </div>
  );
};

export default AdminPanel;
