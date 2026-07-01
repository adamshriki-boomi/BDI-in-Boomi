import { ErrorDisplay } from './ErrorDisplay';
import { GetInTouchWithSupport } from './GetInTouchWithSupport';

type ErrorFallbackRiversProps = {
  error?: Error;
  resetErrorBoundary?: () => any;
};
export function ErrorFallbackRivers({
  error,
  resetErrorBoundary = () => undefined,
}: ErrorFallbackRiversProps) {
  return (
    <ErrorDisplay
      header="Oops... Something went wrong"
      onClick={resetErrorBoundary}
      error={error}
    >
      You may try to refresh or try again later.
      <br />
      <GetInTouchWithSupport />
      <br />
      Thanks for your patience!
    </ErrorDisplay>
  );
}
