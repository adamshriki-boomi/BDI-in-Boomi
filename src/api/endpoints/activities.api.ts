import { StatusTypes } from 'api/types';

interface CommonPayloadProps {
  start_time: number;
  end_time: number;
}
export interface OptionalCommonPayloadProps {
  status: StatusTypes[];
  group_id: string[] | string;
  is_scheduled: string;
  search: string;
  river_type: string[];
}
export interface ActivitiesPayload
  extends CommonPayloadProps,
    Partial<OptionalCommonPayloadProps> {}

export interface ListAllPayload extends ActivitiesPayload {
  cache_context_id?: string;
  page?: number;
  return_last_runs?: boolean;
  sort_by?: 'name' | 'last_run';
  sort_order?: 'desc' | 'asc' | '';
}
