import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen mobile-obsidian-bg text-slate-100 p-6 overflow-auto">
          <div className="liquid-glass-modal rounded-[2rem] p-8 w-full max-w-2xl text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-rose-300 text-2xl font-black">
              !
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white mb-2">¡Algo salió mal!</h1>
            <p className="text-slate-300 text-sm mb-5">
              Ocurrió un error inesperado en la interfaz. Puedes recargar para restablecer la sesión.
            </p>
            <div className="liquid-glass-subtle text-left p-4 rounded-2xl w-full font-mono text-xs break-words whitespace-pre-wrap max-h-60 liquid-scroll">
              <div className="text-rose-300 font-bold mb-2">{this.state.error?.toString()}</div>
              <div className="text-slate-400">{this.state.errorInfo?.componentStack}</div>
            </div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="liquid-btn mt-6 px-7 py-3 bg-gradient-to-r from-sky-500 to-indigo-500 hover:brightness-110 text-white font-bold rounded-xl shadow-[0_10px_28px_rgba(56,189,248,0.3)]"
            >
              Recargar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
