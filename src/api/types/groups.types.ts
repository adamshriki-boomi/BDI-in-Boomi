import { OID } from './common.types';

export interface IGroup {
  update_time: number;
  name: string;
  color: string;
  is_default: boolean;
  insert_time: number;
  cross_id: OID;
  _id: OID;
  icon: string;
  version_id?: OID;
}

export interface IDeleteGroupResponse {
  default_group: OID;
  deleted_group: OID;
  rivers_affected: OID[];
}
