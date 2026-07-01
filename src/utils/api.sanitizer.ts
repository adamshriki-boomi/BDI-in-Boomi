import { ILogicStep } from 'api/types';
import { pluck } from './array.utils';

export const getOId = (id: any): string => id?.$oid ?? id;
export const createOId = ($oid: any) => ({ $oid });
export const createRiverId = (id: string) => ({ _id: createOId(id) });
export const getRefId = (item: any) => item?._id;
export const getId = (item: any) => getOId(item?._id);
export const getCrossId = (item: any) => getOId(item?.cross_id);
export const getDate = (date: any) => date?.$date;
export const getHashKey = pluck<Record<string, any>, string>('hash_key_init');
export const getStepId = (step: ILogicStep) =>
  typeof step?.step_id === 'string' ? step?.step_id : getOId(step?.step_id);

/**
 * Gets variable name from React App variables (.env) file
 * and return the data inside the current domain
 * @examples
 * getDataByDomainFromEnvFile({ variable: "VITE_HEAP_APPS" })
 * returns - 1056050459
 *
 * omitFromObject({ id: 'abc', active: true },{ active: true })
 * returns - { id: 'abc' }
 *
 * @param variable - string
 */
export const getDataByDomainFromEnvFile = variable => {
  const domains = import.meta.env?.[variable]?.split(',');
  const variableValue = domains?.find(value => getDataByHost(value));
  return getDataByHost(variableValue);
};

const getDataByHost = str => {
  const host = window.location.host;
  if (host.includes('preview-console.dev.rivery.in')) {
    return 'https://api.dev.rivery.in/v1';
  }
  return `https://${str}`?.split(`https://${host}:`)?.[1];
};
