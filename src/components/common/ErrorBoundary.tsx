import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render shows the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can log the error to an error reporting service here
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: undefined });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // You can customize the fallback UI here
      return (
        this.props.fallback || (
          <Card className="p-6 bg-white/20 backdrop-blur-sm border-white/30 text-white">
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <AlertTriangle className="h-12 w-12 text-yellow-300" />
              <h3 className="text-xl font-semibold">Something went wrong</h3>
              <p className="text-white/70 text-center max-w-md">
                There was an error loading this component. This might be due to
                an issue with the data or a temporary glitch.
              </p>
              <div className="flex gap-4 mt-4">
                <Button
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/20"
                  onClick={this.handleReset}
                >
                  Try Again
                </Button>
                <Button
                  className="bg-white/20 hover:bg-white/30 text-white"
                  onClick={() => window.location.reload()}
                >
                  Reload Page
                </Button>
              </div>
            </div>
          </Card>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

