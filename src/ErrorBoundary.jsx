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
        <div className="flex flex-col items-center justify-center min-h-screen bg-red-900 text-white p-6 overflow-auto">
          <h1 className="text-3xl font-bold mb-4">¡Algo salió mal!</h1>
          <p className="mb-4">Por favor envíame el siguiente mensaje de error para poder solucionarlo:</p>
          <div className="bg-black/50 p-4 rounded-xl w-full max-w-2xl font-mono text-sm break-words whitespace-pre-wrap">
            <div className="text-red-400 font-bold mb-2">{this.state.error?.toString()}</div>
            <div className="text-gray-400">{this.state.errorInfo?.componentStack}</div>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-6 px-6 py-3 bg-white text-red-900 font-bold rounded-xl"
          >
            Recargar Página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
