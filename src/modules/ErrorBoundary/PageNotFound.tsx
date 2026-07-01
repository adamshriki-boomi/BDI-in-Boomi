import { ErrorDisplay } from './ErrorDisplay';
import { GetInTouchWithSupport } from './GetInTouchWithSupport';

export function PageNotFound() {
  return (
    <ErrorDisplay header="We looked everywhere">
      Looks like this page doesn't exist
      <br />
      <GetInTouchWithSupport />
    </ErrorDisplay>
  );
}
