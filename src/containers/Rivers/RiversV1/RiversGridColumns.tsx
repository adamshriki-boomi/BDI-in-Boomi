import { TableDateTime } from 'components';
import { RiverGroup } from 'containers/Activities/components/ActivitiesColumns';
import { NewRiverListActionsCell } from '../components/RiverListActionsCell';
import {
  RiverDescription,
  ScheduledV1Selector,
} from '../components/RiversColumnsComponents';
import { InterfaceSelect } from './components/InterfaceSelect';
import { RiverName } from './components/RiverName';
import { ScheduleIndicator } from './components/RiverScheduleIndicator';
import RiversGroupsSelect from './components/RiversGroupsSelect';
import { RiversGridTypeSelect } from './components/RiverTypeSelect';
import { StatusSelect } from './components/StatusSelect';
import { RiverV2Tag, StatusTag } from './components/StatusTag';

const headerProps = {
  px: 3,
  py: 3,
};

const styleProps = {
  px: 3,
};

export const riverColumns = canCreateNewInterface => {
  return [
    {
      Header: 'Name',
      accessor: 'name',
      id: 'name',
      Cell: RiverName,
      sortBy: 'river_name',
      headerProps,
      styleProps: { py: 0 },
      weight: 'minmax(300px, 2fr)',
      Filter: RiversGridTypeSelect,
    },
    {
      Header: 'Group',
      Cell: RiverGroup,
      accessor: 'group_id',
      headerProps,
      styleProps,
      weight: 'minmax(150px, 1fr)',
      Filter: RiversGroupsSelect,
      sortBy: 'group_name',
    },
    {
      Header: 'Scheduled',
      accessor: 'river_schedulers',
      id: 'schedule',
      Cell: ScheduleIndicator,
      headerProps: { px: 2 },
      weight: 'minmax(150px, 1fr)',
      Filter: ScheduledV1Selector,
    },
    {
      Header: 'Modified By',
      accessor: 'last_user_name_modified',
      weight: 'minmax(130px, 300px)',
      styleProps: { pl: 3, whiteSpace: 'nowrap' },
      headerProps,
    },
    {
      Header: 'Last Modified',
      accessor: 'last_updated_at',
      Cell: TableDateTime,
      weight: 'minmax(auto, 150px)',
      sortBy: 'last_updated_at',
      headerProps,
      styleProps: { pl: 3, whiteSpace: 'nowrap' },
    },
    {
      ...(canCreateNewInterface
        ? {
            Header: 'Interface',
            accessor: 'is_api_v2',
            Cell: RiverV2Tag,
            headerProps: { justifyContent: 'center' },
            styleProps: { justifyContent: 'center' },
            weight: 'min-content',
            Filter: InterfaceSelect,
          }
        : { id: 'no_tag', styleProps: { p: 0 }, headerProps: { p: 0 } }),
    },
    {
      ...(canCreateNewInterface
        ? {
            Header: 'Status',
            accessor: 'river_status',
            id: 'river_status',
            Cell: StatusTag,
            headerProps: { ...headerProps, justifyContent: 'center' },
            styleProps: { justifyContent: 'center' },
            weight: 'min-content',
            Filter: StatusSelect,
          }
        : { id: 'no_status', styleProps: { p: 0 }, headerProps: { p: 0 } }),
    },

    {
      Header: '',
      accessor: 'description',
      Cell: RiverDescription,
      headerProps: { justifyContent: 'center' },
      styleProps: { justifyContent: 'end' },
      weight: 'min-content',
    },
    {
      Header: '',
      id: 'river-actions',
      Cell: NewRiverListActionsCell,
      headerProps: { justifyContent: 'center' },
      styleProps: { justifyContent: 'center' },
      weight: 'min-content',
    },
  ];
};
