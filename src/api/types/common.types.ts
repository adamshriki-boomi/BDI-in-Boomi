import { StatusTypes } from './activities.types';

export interface RiveryId {
  _id: OID;
}
export interface AccountId {
  account: OID;
}
export interface OID {
  $oid: string;
}

export interface RiveryDate {
  $date: number;
}

export enum RunStatus {
  RUNNING = 'R',
  DONE = 'D',
  ERROR = 'E',
  WAITING = 'W',
  SKIPPED = 'S',
  NONE = 'none',
}

export const RunStatusConverter = {
  [StatusTypes.RUNNING]: RunStatus.RUNNING,
  [StatusTypes.FAILED]: RunStatus.ERROR,
  [StatusTypes.SUCCEEDED]: RunStatus.DONE,
  [StatusTypes.PENDING]: RunStatus.WAITING,
};

export enum AccountTypes {
  BLOCKED = 'blocked',
  ACTIVE = 'active',
  TRIAL = 'trial',
}
export enum Partner {
  SNOWFLAKE = 'snowflake',
  DATABRICKS = 'databricks',
  AWS = 'aws',
  GOOGLE_MARKETPLACE = 'google_marketplace',
}
