import { useRiver } from 'store/river';

const DEFAULT_CRON = '0 * * *';

export const normalizeCron = (expression: string) => {
  const isLinuxExpression = expression?.split(' ').length === 5;
  return isLinuxExpression ? `0 ${expression ?? DEFAULT_CRON} *` : expression;
};

export const useEditModeSchedulerDataFromStore = () => {
  const { schedulerAndNotifications } = useRiver();
  const {
    on_failure: failure = {},
    on_warning: warning = {},
    on_run_threshold: run_threshold = {},
  } = schedulerAndNotifications?.settings?.notification;
  const data = {
    settings: {
      run_timeout_seconds:
        schedulerAndNotifications?.settings?.run_timeout_seconds,
      notification: {
        failure: { ...failure, is_enabled: failure?.enabled },
        warning: { ...warning, is_enabled: warning?.enabled },
        run_threshold: { ...run_threshold, is_enabled: run_threshold?.enabled },
      },
    },
    schedulers: {
      is_enabled: schedulerAndNotifications?.scheduling?.[0]?.is_enabled,
      cron_expression: normalizeCron(
        schedulerAndNotifications?.scheduling?.[0]?.cron_expression,
      ),
    },
  };
  return data;
};
