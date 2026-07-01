import { Text } from 'components';
import { RPUDisplay } from 'containers/Activities/components/RPUDisplay';
import { useSearchParam } from 'react-use';
import { RUN_ID_PARAM } from '../params';
import { gridTemplateColumns } from './RiverRuns';
import { RowLink } from './RowLink';

export function TableRow({ item: run, index }) {
  const tableName = useSearchParam(RUN_ID_PARAM);
  return (
    <RowLink
      aria-label={`table-${index}`}
      enabled={tableName === run?.target_name}
      templateColumns={gridTemplateColumns(false)}
      to={run?.target_name}
    >
      <Text textOverflow="ellipsis" whiteSpace="nowrap" overflow="hidden">
        {run?.target_name}
      </Text>
      <RPUDisplay value={run?.rpu} />
    </RowLink>
  );
}
