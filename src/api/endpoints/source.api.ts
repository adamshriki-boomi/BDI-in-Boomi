import { getData } from 'api/api.proxy';

export const sourceTypes = (): Promise<any[]> => {
  return getData('datasource_types/source');
};
