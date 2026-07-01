import { TestTypeId } from './qualityTestTypes.types';

export enum QaulityTestLogStatus {
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
}
export interface IQualityTestLog {
  data_quality_test_id: string;
  error_description: string;
  river_id: string;
  status: QaulityTestLogStatus;
  step_id: string;
  step_name: string;
  test_end_time: string;
  test_insert_time: string;
  test_name: TestTypeId;
  test_run_id: string;
  test_run_time: string;
  test_schema: string[];
}
