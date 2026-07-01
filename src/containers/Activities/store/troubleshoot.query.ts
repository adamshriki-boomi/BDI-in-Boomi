import { activitiesApi } from './activities.query';

export interface TroubleshootRequest {
  run_id: string;
  river_id: string;
}

export interface TroubleshootResponse {
  run_id: string;
  status: string;
  confidence_score: number | null;
}

activitiesApi.injectEndpoints({
  endpoints: builder => ({
    getTroubleshootDiagnosis: builder.query<
      TroubleshootResponse,
      TroubleshootRequest
    >({
      query: body => ({
        url: '/troubleshooting/diagnose',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const useGetTroubleshootDiagnosisQuery = (
  activitiesApi as typeof activitiesApi & {
    useGetTroubleshootDiagnosisQuery: typeof activitiesApi.useGetActivitiesQuery;
  }
).useGetTroubleshootDiagnosisQuery;
