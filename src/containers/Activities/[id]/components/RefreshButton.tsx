import { Divider, Flex, Icon, RefreshIcon, RiveryButton } from 'components';
import { findDateByDuration } from 'components/Form';
import { calculateTime } from 'utils/date.utils';
import { getQueryParams } from 'hooks/router';
import { Link } from 'react-router-dom';
import { upsertSearchParam } from 'utils/searchParams';

export function RefreshButton({ ...props }) {
  const paramsTime = getQueryParams(['end_time', 'start_time']);
  const urlDate = findDateByDuration(
    paramsTime?.start_time,
    paramsTime?.end_time,
  );
  const lastEndTime = () => calculateTime('D', 1)?.event_end_time;
  const isCustomDate = () => urlDate.label === 'Custom';
  const end_time = () =>
    isCustomDate() ? Number(paramsTime?.end_time) + 1 : lastEndTime();
  return (
    <Flex gap={2} alignItems="end">
      <Divider orientation="vertical" h="30px" color="gray.300" />
      <RiveryButton
        as={Link}
        label="Refresh"
        variant="text"
        leftIcon={<Icon as={RefreshIcon} boxSize="14px" />}
        to={{ search: upsertSearchParam('end_time', end_time().toString()) }}
        {...props}
      />
    </Flex>
  );
}
