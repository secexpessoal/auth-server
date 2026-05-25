import { Component, type ErrorInfo, type ReactNode } from "react";
import { ErrorPage } from "./error.component";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AppErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
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
        <ErrorPage
          code={500}
          message="Ops! Ocorreu um erro inesperado."
          details={this.state.error?.message}
          onRetry={() => window.location.reload()}
        />
      );
    }

    return this.props.children;
  }
}
