import { Component, type ReactNode, type ErrorInfo } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RotateCcw } from 'lucide-react';

export interface FallbackProps {
  error: Error | null;
  resetErrorBoundary: () => void;
  sectionName?: string;
}

export interface ErrorBoundaryProps {
  sectionName?: string;
  fallback?: ReactNode | ((props: FallbackProps) => ReactNode);
  onReset?: () => void;
  children: ReactNode;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Reusable ErrorBoundary Class Component
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a resilient fallback UI instead of crashing the whole application.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  // Update state so the next render will show the fallback UI
  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  // Catch errors thrown by children and log diagnostic information
  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error(
      `[ErrorBoundary: ${this.props.sectionName || 'Section'}] caught an unhandled error:`,
      error,
      errorInfo
    );
    this.setState({ errorInfo });
  }

  // Reset the boundary to attempt re-rendering the children
  public resetErrorBoundary = (): void => {
    this.props.onReset?.();
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      // 1. Render custom render-prop fallback if provided
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback({
          error: this.state.error,
          resetErrorBoundary: this.resetErrorBoundary,
          sectionName: this.props.sectionName,
        });
      }

      // 2. Render static custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 3. Render robust default section fallback UI
      const sectionTitle = this.props.sectionName || 'This section';

      return (
        <div
          role="alert"
          aria-live="assertive"
          className="my-4 rounded-xl border border-destructive/40 bg-destructive/5 p-5 text-card-foreground shadow-sm transition-all"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive/15 text-destructive">
              <AlertCircle className="h-5 w-5" />
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-semibold text-foreground">
                  {sectionTitle} failed to render
                </h3>
                <span className="rounded-md border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                  Section Isolated
                </span>
              </div>

              <p className="text-sm text-muted-foreground">
                An isolated error occurred in this component. The rest of your application remains fully functional and intact.
              </p>

              {this.state.error && (
                <div className="rounded-md bg-muted/80 p-2.5 font-mono text-xs text-muted-foreground overflow-x-auto max-h-24">
                  {this.state.error.message || 'Unknown runtime error'}
                </div>
              )}

              <div className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={this.resetErrorBoundary}
                  className="gap-2 border-destructive/30 hover:bg-destructive/10 hover:text-destructive text-foreground"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Try again
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
