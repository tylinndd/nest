import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertOctagon, RefreshCw } from "lucide-react";

type Props = { children: ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.warn("[nest] render error:", error.message, info.componentStack);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div
        role="alert"
        className="flex min-h-[70vh] items-center justify-center px-6"
      >
        <div className="w-full max-w-md rounded-2xl border border-nest-coral/30 bg-white/90 p-6 shadow-soft">
          <div className="mb-3 flex items-center gap-2 text-nest-coral">
            <AlertOctagon className="h-5 w-5" aria-hidden />
            <h1 className="text-base font-semibold">Something broke.</h1>
          </div>
          <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
            Nest hit an unexpected error. Your saved answers are safe — try
            again, or reload the page if it keeps happening.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={this.handleRetry}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-nest-forest px-4 py-2.5 text-sm font-medium text-white transition hover:bg-nest-forest/90"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-nest-forest/20 bg-white px-4 py-2.5 text-sm font-medium text-nest-forest transition hover:bg-nest-forest/5"
            >
              <RefreshCw className="h-4 w-4" aria-hidden />
              Reload
            </button>
          </div>
        </div>
      </div>
    );
  }
}
