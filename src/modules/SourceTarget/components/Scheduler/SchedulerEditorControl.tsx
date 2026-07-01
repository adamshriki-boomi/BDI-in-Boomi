import {
  normalizeCronTo5Fields,
  ScheduleEditor,
} from 'containers/River/Settings/components/ScheduleEditor';
import * as React from 'react';
import { useGetRiverCommonProps, useSchedulers } from '../form';

const DEFAULT_CRON = '0 * * * ';

export function SchedulerEditorControl({ isDisabled = false }) {
  const { value, update } = useSchedulers(0);
  //For new scheduler
  const normalizedExpression = `0 ${value?.cron_expression ?? DEFAULT_CRON} *`;

  const onSchedulerChange = (cronExpression: string) => {
    const cron = normalizeCronTo5Fields(cronExpression);
    if (cron !== value?.cron_expression) {
      update({ ...value, cron_expression: cron });
    }
  };
  const { isCDC } = useGetRiverCommonProps();
  return (
    <ScheduleEditor
      schedule={normalizedExpression}
      onChange={onSchedulerChange}
      isDisabled={isDisabled}
      isCDCRiver={isCDC}
      short
    />
  );
}

export function EditModeSchedulerEditorControl({
  isDisabled = false,
  isReadOnly = false,
  isCDC,
  value,
  setValue,
}) {
  return (
    <ScheduleEditor
      schedule={value}
      onChange={setValue}
      isDisabled={isDisabled}
      isReadOnly={isReadOnly}
      isCDCRiver={isCDC}
      short
    />
  );
}
