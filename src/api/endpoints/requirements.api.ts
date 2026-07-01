import { getSignedFile } from './files.api';

const REQUIREMENTS_URL = `/logicode_file/requirements`;

export const fetch = (): Promise<any> => {
  return getSignedFile(REQUIREMENTS_URL);
};
