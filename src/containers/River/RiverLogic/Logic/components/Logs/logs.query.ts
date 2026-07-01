import { createRiveryApi } from 'store/createRiveryApi';

const ENDPOINT = 'activities/runs';
const getLogsEndpoint = (runId: string) => `${ENDPOINT}/details?id=${runId}`;
export interface IStepResponse {
  account: string;
  block_type: string;
  code_type: string;
  container: boolean;
  container_type: string;
  end_time: string;
  environment_id: string;
  error_description: string;
  has_log: boolean;
  start_time: string;
  step_index: string;
  step_duration: string;
  step_execution_id: string;
  step_status: string;
  step_id: string;
  loop_iteration_number: number;
}

interface ITasks {
  steps_response_details: Record<string, IStepResponse>;
}
interface ILogResponse {
  next_page: string;
  run_id: string;
  tasks: ITasks[];
}

export const runLogsApi = createRiveryApi
  .enhanceEndpoints({
    addTagTypes: ['RunLogs'],
  })
  .injectEndpoints({
    endpoints: builder => ({
      getLastRunLogs: builder.query<ILogResponse, string>({
        providesTags: ['RunLogs'],
        query: runId => ({
          url: getLogsEndpoint(runId),
        }),
      }),
    }),
  });

export const { useGetLastRunLogsQuery } = runLogsApi;
