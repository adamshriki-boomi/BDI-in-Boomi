import { BillingTypes } from 'api/types/billing.types';
import { RiveryColumn } from 'components/Exosphere/ExoTable/types';
import { useMemo } from 'react';
import { useCore } from 'store/core';
import { displayDate, patternDate } from 'utils/date.utils';

export const useNotificationGridColumns = () => {
  const { billingType } = useCore();
  const isPayg = billingType === BillingTypes.ON_DEMAND;
  const columns: RiveryColumn[] = useMemo(
    () => [
      {
        field: 'timeframe',
        header: 'Timeframe',
        editable: false,
        flex: 1,
      },
      {
        field: 'thresholdType',
        header: 'Threshold type',
        editable: false,
        flex: 1.5,
      },
      {
        field: 'thresholdValue',
        header: 'Threshold value',
        editable: false,
        flex: 0.75,
        cellStyle: {
          textAlign: 'right',
          justifyContent: 'flex-end',
        },
        formatter: (value, row) =>
          row.thresholdType === 'Percentage' ? `${value}%` : `${value} BDU`,
      },
      {
        field: 'recipients',
        header: 'Recipients',
        editable: false,
        type: 'tags',
        flex: 3,
      },
      {
        field: 'updated_at',
        header: 'Last Modified',
        editable: false,
        flex: 1,
        formatter: value => {
          if (!value) return null;
          if (typeof value === 'string') {
            const localDate = new Date(value + 'Z'); // Adding 'Z' ensures it's treated as UTC
            const localTimeString = localDate.toLocaleString();
            return displayDate(localTimeString, patternDate);
          }
          return displayDate(value, patternDate);
        },
      },
      {
        field: 'updated_by',
        header: 'Modified By',
        editable: false,
        flex: 1,
      },
      {
        field: 'triggered',
        header: 'Last Triggered',
        editable: false,
        flex: 1,
        formatter: value => {
          if (!value) return null;
          if (typeof value === 'string') {
            const localDate = new Date(value + 'Z'); // Adding 'Z' ensures it's treated as UTC
            const localTimeString = localDate.toLocaleString();
            return displayDate(localTimeString, patternDate);
          }
          return displayDate(value, patternDate);
        },
      },
    ],
    [],
  );
  return { columns, isPayg };
};
