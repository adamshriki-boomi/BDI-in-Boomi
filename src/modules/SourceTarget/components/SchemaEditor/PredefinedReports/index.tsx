import { Grid } from 'components';
import { ReportsTable } from './ReportsTable';

export function ReportsExplorer() {
  return (
    <Grid overflow="auto" height="full" gridTemplateRows="auto 1fr">
      <ReportsTable />
    </Grid>
  );
}
