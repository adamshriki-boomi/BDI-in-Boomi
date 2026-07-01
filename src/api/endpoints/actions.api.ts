import { RiveryId } from 'api/types';
import { postBody } from '../api.proxy';

const ACTIONS_URL = `/actions`;

type ParamsWithRiverId = Record<string, any> & RiveryId;

export const listOne = (params: ParamsWithRiverId) => {
  return postBody(`${ACTIONS_URL}/list`, params);
};
