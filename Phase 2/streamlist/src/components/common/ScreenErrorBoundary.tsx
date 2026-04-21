import React, { type ErrorInfo, type ReactNode } from 'react';
import { ScreenErrorFallback } from './ScreenErrorFallback.tsx';

export interface ScreenErrorBoundaryProps {
  onRetry: () => void;
  children: ReactNode;
}

interface ScreenErrorBoundaryState {
  hasError: boolean;
}

/**
 * Catches render errors in the screen subtree; Try Again resets and calls the screen hook refetch.
 */
export class ScreenErrorBoundary extends React.Component<
  ScreenErrorBoundaryProps,
  ScreenErrorBoundaryState
> {
  public constructor(props: ScreenErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(): ScreenErrorBoundaryState {
    return { hasError: true };
  }

  public override componentDidCatch(error: Error, info: ErrorInfo): void {
    if (__DEV__) {
      console.warn('ScreenErrorBoundary', error.message, info.componentStack);
    }
  }

  private readonly handleTryAgain = (): void => {
    this.setState({ hasError: false });
    this.props.onRetry();
  };

  public override render(): ReactNode {
    if (this.state.hasError) {
      return <ScreenErrorFallback reason="generic" onTryAgain={this.handleTryAgain} />;
    }
    return this.props.children;
  }
}
