import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import GlassCard from './GlassCard';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class RouteErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Route loading error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <GlassCard className="p-6 max-w-md text-center" animate={false}>
            <h2 className="text-xl font-semibold text-white mb-2">
              Failed to load page
            </h2>
            <p className="text-white/70 mb-4">
              There was a problem loading this page. Please try again.
            </p>
            <Button onClick={this.handleRetry}>
              Retry
            </Button>
          </GlassCard>
        </div>
      );
    }

    return this.props.children;
  }
}

export default RouteErrorBoundary;
