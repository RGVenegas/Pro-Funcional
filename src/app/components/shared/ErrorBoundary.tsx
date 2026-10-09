import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[300px] w-full p-6 flex flex-col items-center justify-center text-center my-4 rounded-2xl bg-[#0b1726]/90 border border-red-500/40 shadow-2xl backdrop-blur-md">
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl mb-4 text-red-400">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            {this.props.fallbackTitle || 'Ocurrió un inconveniente al cargar esta vista'}
          </h3>
          <p className="text-sm text-white/60 max-w-md mb-4">
            Se ha producido un error temporal durante la renderización. Puedes restablecer la vista o recargar la página.
          </p>

          {this.state.error?.message && (
            <div className="max-w-md w-full bg-red-950/40 border border-red-500/30 rounded-xl p-3 mb-6 text-left">
              <p className="text-[11px] font-mono text-red-300 break-words">
                <strong className="text-red-400">Detalle del error:</strong> {this.state.error.message}
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={this.handleReset}
              className="px-5 py-2.5 rounded-xl bg-[#00E676] text-[#021826] text-xs font-bold hover:bg-[#00E676]/90 shadow-lg shadow-[#00E676]/20 flex items-center gap-2 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Reintentar y Cargar Vista
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20"
            >
              Recargar Aplicación
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

