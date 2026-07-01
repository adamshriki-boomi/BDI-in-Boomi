import {
  createRiveryApi,
  createRiveryApiV1,
  createRiveryApiV1AccountEnv,
} from 'store/createRiveryApi';
import { metadataApi } from 'store/metadata';
import { remoteFileApi } from 'store/remoteFiles';
import { trackingHandler } from './tracking';

const middlewares = [
  trackingHandler,
  remoteFileApi.middleware,
  metadataApi.middleware,
  createRiveryApi.middleware,
  createRiveryApiV1.middleware,
  createRiveryApiV1AccountEnv.middleware,
];
export default middlewares;
