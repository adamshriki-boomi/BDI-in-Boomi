import { ErrorDisplay } from './ErrorDisplay';
import { GetInTouchWithSupport } from './GetInTouchWithSupport';

export function RiverNotFound() {
  return (
    <ErrorDisplay header="We looked everywhere">
      Looks like this data flow doesn't exist in this account or environment.
      <br />
      <GetInTouchWithSupport />
    </ErrorDisplay>
  );
}
