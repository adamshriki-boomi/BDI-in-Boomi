import { ILogicStep } from 'api/types';
import { useCallback } from 'react';
import { useRiver } from 'store/river';
import { compare } from 'utils/array.utils';
import { riverErrorResolver } from '../river-error.resolver';
import {
  ValidationError,
  ValidationErrorMessage,
  ValidationErrorMessages,
} from '../validation.types';

/**
 * Validates schedule configuration
 * Returns error if schedule is enabled but cron expression is missing
 */
const validateSchedule = (
  schedule: any,
  schedulers: any[],
  isApiV2: boolean,
) => {
  if (isApiV2) {
    // New API format - river_definitions.schedulers
    const scheduler = schedulers?.[0];
    if (scheduler?.is_enabled && !scheduler?.cron_expression?.trim()) {
      return {
        isValid: false,
        error: 'Cron expression is required when schedule is enabled',
      };
    }
  } else {
    // Old API format - task_definitions.schedule
    if (schedule?.isEnabled && !schedule?.cronExp?.trim()) {
      return {
        isValid: false,
        error: 'Cron expression is required when schedule is enabled',
      };
    }
  }
  return { isValid: true, error: null };
};

/**
 * validates a river and update the store's river.errors
 */
export function useRiverValidator() {
  const { selectedLogicSteps, isApiV2, selectedRiver } = useRiver();
  const validate = useCallback(
    (steps = selectedLogicSteps) => {
      // 🌈 to have "always" validation, the "stepsValidationResults" validation should be in a useMemo and this "validate" in a useEffect
      const stepsValidationResults = steps
        ?.map((step: ILogicStep) => riverErrorResolver(step, isApiV2))
        ?.filter(compare('valid', false));
      const results = stepsValidationResults?.reduce(appendErrorsByHash, {});
      const hasStepErrors = Object.keys(results)?.length > 0;

      // Validate schedule - ensure cron expression exists when schedule is enabled
      const schedule = selectedRiver?.tasks_definitions?.[0]?.schedule;
      const schedulers = selectedRiver?.river_definitions?.schedulers;
      const scheduleValidation = validateSchedule(
        schedule,
        schedulers,
        isApiV2,
      );

      if (!scheduleValidation.isValid) {
        results['schedule'] = {
          'schedule.cronExp': { message: scheduleValidation.error },
        };
      }

      const hasErrors = hasStepErrors || !scheduleValidation.isValid;
      return { results, isValid: !hasErrors };
    },
    [selectedLogicSteps, isApiV2, selectedRiver],
  );

  const includesErrors = useCallback(() => {
    return !validate().isValid;
  }, [validate]);

  return { validate, includesErrors };
}

// UTILS
const isContainer = (path: string) => path?.includes('nodes');

const appendErrorsByHash = (acc, item): Record<string, any> => {
  const errors = item?.errors;
  const errorContainers = errors && appendContainersHashWithErrors(item);
  const hash = item.values.hash_key_init;
  // build errors object
  return errors
    ? {
        ...acc,
        ...errorContainers,
        [hash]: {
          ...acc?.[hash],
          ...errors,
        },
      }
    : acc;
};

/**
 * collects hash of container that includes an error
 */
const appendContainersHashWithErrors = ({
  errors,
  values,
}: ValidationError) => {
  const pathsWithErrors = Object.keys(errors).filter(isContainer);

  // add container's hash to indicate an error inside a container
  const containerErrors = pathsWithErrors.reduce(
    resolvePathHashKeys(values),
    [],
  );
  const errorMessagesByHash = pathsWithErrors
    .map(pairHashWithErrors(values, errors))
    // combine same hash errors under one hash object
    .reduce(combineErrorsByHash, {});

  const combinedErrors = containerErrors.reduce((combined, hash) => {
    const hashErrors = !combined?.[hash] ? { [hash]: {} } : undefined;
    return { ...combined, ...hashErrors };
  }, errorMessagesByHash);
  return combinedErrors;
};

function combineErrorsByHash(
  result: Record<string, any>,
  error: { hash: string; errors: any },
) {
  const hash = error.hash;
  if (!result[hash]) {
    result[hash] = {};
  }
  Object.assign(result[hash], error.errors);
  return result;
}

/**
 * a json-path TO error-by-hash mapper
 * ===================================
 */
function pairHashWithErrors(
  values: Record<string, any>,
  errors: ValidationErrorMessages,
): (value: string) => {
  hash: any;
  errors: { [path: string]: ValidationErrorMessage };
} {
  return path => {
    /**
     * given path = "nodes.0.content.target_table"
     * paths = ["nodes.0", ".target_table"]
     * containerPath = "nodes"
     *
     * given path = "nodes.0.nodes.0.content.target_table"
     * paths = ["nodes.0.nodes.0", ".target_table"]
     * containerPath = "nodes.0.nodes.0"
     */
    const [containerPath, ...paths] = splitPathByContent(path);
    const step = containerPath.reduce((node, subPath) => {
      return node[subPath];
    }, values);

    return {
      hash: step.hash_key_init,
      errors: {
        [`content${paths.join('')}`]: errors[path],
      },
    };
  };
}

/**
 * a json-path TO hash mapper
 */
function resolvePathHashKeys(
  values: Record<string, any>,
): (previousValue: any[], currentValue: string) => any[] {
  return (result, path) => {
    const [containerPath] = splitPathByContent(path);
    const hashes = containerPath?.reduce(
      (ref, subPath) => {
        const node = ref.node?.[subPath];
        const hash = node?.hash_key_init;
        return { node, containers: [...ref.containers, hash] };
      },
      { node: values, containers: [] },
    );
    return [...result, ...hashes.containers];
  };
}

/**
 * divides a json path to a container path (with nodes.0) and the rest step json path (content.table_name)
 */
const splitPathByContent = (path: string) => {
  const [containerPath, ...paths] = path.split('.content');
  return [containerPath.split('.'), paths];
};
