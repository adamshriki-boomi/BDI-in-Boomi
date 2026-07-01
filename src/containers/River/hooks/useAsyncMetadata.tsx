import { API } from 'api';
import { MetadataType } from 'api/endpoints/metadata.api';
import { ILogicStep } from 'api/types';
import { useCallback } from 'react';
import { useSelectedEnvironment } from 'store/environments/hooks/useGetEnvironment';
import { useRiver } from 'store/river/hooks';
import {
  CallType,
  useRiverForMetadataCall,
} from 'store/river/hooks/useRiverForMetadataCall';
import { getOId } from 'utils/api.sanitizer';

const POLL_INTERVAL = 2000;
export interface AsyncMetadataProps {
  step?: ILogicStep;
  type: MetadataType;
  callType: CallType;
  callFields?: any;
  withoutVariables?: boolean;
  /** returns polling response as return from the request */
  withoutTransforms?: boolean;
}

export function useAsyncMetadata({
  step = null,
  type,
  callType = null,
  callFields = null,
  withoutVariables = false,
  withoutTransforms = false,
}: AsyncMetadataProps) {
  const { selectedVariables } = useRiver();
  const { selectedEnv } = useSelectedEnvironment();
  const selectedEnvVariables = selectedEnv?.variables;

  const data = useRiverForMetadataCall({ callType, callFields, step });

  const loaderFN = useCallback(
    async (props?: Record<string, any>) => {
      const errorAssertion = () => {
        if (step && !getOId(step?.content?.gConnection))
          throw new SyntaxError('Please first select a source connection');
      };
      const pollingHandle = await API.metadata.getMetadata(
        props ? props : data,
        type,
        errorAssertion,
      );
      let pollingStatus = await API.metadata.pollMetadata(
        getOId(pollingHandle._id),
      );
      while (['R', 'W'].includes(pollingStatus.request_status)) {
        const { _id } = pollingStatus;
        pollingStatus = await new Promise(resolve =>
          setTimeout(
            resolve,
            POLL_INTERVAL,
            API.metadata.pollMetadata(getOId(_id)),
          ),
        );
      }

      if (pollingStatus.request_status === 'D') {
        if (withoutTransforms) {
          return pollingStatus;
        }
        const result = pollingStatus.results?.map(value => ({
          value,
          label: value,
        }));
        const variablesNames = Array.from(
          new Set(
            [Object.keys(selectedVariables), Object.keys(selectedEnvVariables)]
              .flat()
              .map(varName => `{${varName}}`),
          ),
        );
        if (withoutVariables || !variablesNames.length) {
          return result;
        } else {
          return result.concat(
            variablesNames?.map(value => ({ value, label: value })),
          );
        }
      } else {
        throw new Error(pollingStatus.error_msg);
      }
    },
    [
      type,
      step,
      data,
      withoutTransforms,
      selectedVariables,
      selectedEnvVariables,
      withoutVariables,
    ],
  );

  return loaderFN;
}

export function isVariableString(value: string) {
  let depth = 0;
  for (let char of value) {
    if (char === '{') depth++;
    if (char === '}') depth--;
    if (depth < 0) return false; // Closing brace before opening
  }
  return depth === 0; // All braces properly closed
}
