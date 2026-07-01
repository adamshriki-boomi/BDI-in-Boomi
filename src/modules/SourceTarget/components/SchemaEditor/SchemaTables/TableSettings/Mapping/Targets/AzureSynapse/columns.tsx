import { RiveryCheckbox } from 'components/Form';
import { useCallback } from 'react';
import { DecimalField } from '../../../components/DecimalFields';
import { DistRadio } from '../../../components/DistributionCheck';
import { useTableSettings } from '../../../form.hooks';
import {
  baseColumns,
  headerProps,
} from '../../components/AllColumns/commonColumns';
import { EditColumn } from '../../components/EditColumn';

export const columns: any[] = [
  ...baseColumns,
  {
    Header: 'Length',
    accessor: 'length',
    Cell: DecimalField,
    weight: 'auto',
    headerProps,
  },
  {
    Header: 'Dist.',
    accessor: 'is_dist_key',
    Cell: DistRadio,
    styleProps: { justifyContent: 'center' },
    weight: 'min-content',
    headerProps,
  },
  {
    Header: 'Cluster Index',
    id: 'cluster_index',
    Cell: ClusterIndex,
    styleProps: { justifyContent: 'center' },
    weight: 'auto',
    headerProps,
  },
  {
    Header: '',
    id: 'edit-column',
    Cell: EditColumn,
    weight: 'min-content',
  },
];

function ClusterIndex({
  row: { original },
  column: {
    getProps: {
      updateClusterKeyByIndex,
      updateColumn,
      updateClusterIndexByOrder,
    },
  },
}) {
  const {
    value,
    update: updateMappingOrder,
  }: { value: string[]; update: any } = useTableSettings(
    'additional_target_settings.mapping_order',
  );

  const isChecked = value?.includes(original?.name);

  const onChange = useCallback(
    ({ target }) => {
      let newMappingOrder;
      if (target.checked) {
        if (Boolean(value?.length)) {
          const mapping = [...value];
          newMappingOrder = mapping.concat(original?.name);
        } else {
          newMappingOrder = [original?.name];
        }
        updateMappingOrder(newMappingOrder);
        updateClusterIndexByOrder(newMappingOrder);
      } else {
        newMappingOrder = value?.filter(
          (key: string) => key !== original?.name,
        );
        updateMappingOrder(newMappingOrder);
        updateClusterIndexByOrder(newMappingOrder);
      }
    },
    [updateMappingOrder, value, updateClusterIndexByOrder, original?.name],
  );

  return (
    <RiveryCheckbox
      onChange={onChange}
      name="cluster_index"
      label={isChecked ? value?.indexOf(original?.name) + 1 : ' '}
      isChecked={isChecked}
    />
  );
}
