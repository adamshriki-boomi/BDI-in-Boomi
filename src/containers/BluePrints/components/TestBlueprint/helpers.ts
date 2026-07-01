export const INTERFACE_PARAMS_BASE =
  'river.properties.source.additional_settings.interface_parameters';

export const GLOBAL_RUN_KEY = '__global__';

export type ResultSnapshot = {
  isSuccess: boolean;
  isError: boolean;
  data?: any;
  error?: any;
};

export function reportParamsPath(reportName: string) {
  return `${INTERFACE_PARAMS_BASE}.reports.${reportName}.source`;
}

export function reportDateRangePath(reportName: string) {
  return `${INTERFACE_PARAMS_BASE}.reports.${reportName}.date_range`;
}

export function allFieldsFilled(declared: any[] | undefined) {
  return (declared ?? []).every((p: any) => {
    const value = p?.value;
    return value !== undefined && value !== null && value !== '';
  });
}

export function isDateRangeFilled(dr: any) {
  return Boolean(dr?.start_date);
}
