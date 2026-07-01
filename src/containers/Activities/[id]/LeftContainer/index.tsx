import {
  useGetActivitiesTargetsQuery,
  useGetActivityRiverRunsQuery,
} from '../../store';
import { IActivityTarget, IRunScheduler } from '../../store/activities.types';
import { ParamName, useViewParam, ViewOptions } from '../components/ViewRadios';
import { SubRivers } from '../RightContainer/SubRivers';
import { RiverRuns } from './RiverRuns';
import { RunRow } from './RunRow';
import { TableRow } from './TableRow';

const ViewRenderer = {
  [ViewOptions.Runs]: () => (
    <RiverRuns<IRunScheduler>
      useApiHook={useGetActivityRiverRunsQuery}
      rowComponent={RunRow}
      headers={[
        { label: 'Run Time', width: '160px' },
        { label: 'Max Duration', sort: 'max_duration', width: '130px' },
        { label: 'BDU', sort: 'units' },
      ]}
    />
  ),
  [ViewOptions.Tables]: () => (
    <RiverRuns<IActivityTarget>
      useApiHook={useGetActivitiesTargetsQuery}
      rowComponent={TableRow}
      headers={[
        { label: 'Table', sort: 'table_name' },
        { label: 'BDU', sort: 'units' },
      ]}
    />
  ),
  [ViewOptions['Sub-Data Flows']]: () => (
    <SubRivers param={ParamName.Runs} filter={false} />
  ),
};
export function LeftContainer() {
  const viewParam = useViewParam();
  const ViewComponent = ViewRenderer?.[viewParam || ViewOptions.Runs];

  return <ViewComponent />;
}
