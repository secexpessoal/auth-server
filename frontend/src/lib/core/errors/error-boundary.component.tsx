import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

type Props = {
  children?: ReactNode;
};

type State = {
  hasError: boolean;
  error?: Error;
};

export class AppErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 text-red-900 p-4">
          <div className="max-w-md bg-white p-6 rounded-lg shadow-xl border-l-4 border-red-500">
            <h1 className="text-xl font-bold mb-2">Ops! Ocorreu um erro inesperado.</h1>
            <p className="text-sm opacity-80 mb-4">Por favor, recarregue a página ou contate o suporte se o problema persistir.</p>
            <pre className="text-xs bg-red-100 p-2 rounded overflow-auto max-h-32">{this.state.error?.message}</pre>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Recarregar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
