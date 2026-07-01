import browserCookies from 'browser-cookies';
export enum StatusCodes {
  SUCCESS = 200,
  ACCEPTED = 202,
  SUCCESS_NO_CONTENT = 204,
  CREATED = 201,
  CONFLICT = 409,
}

type DataWithStatus = {
  [key: string]: any;
  status_code: number;
};
export const getHubSpotUTK = (): { hubspotutk: string } => ({
  hubspotutk: browserCookies.get('hubspotutk'),
});
export const isStatusSuccess = (data: DataWithStatus) => {
  return [data?.status_code, data?.status, data?.Code].some(
    status =>
      [StatusCodes.SUCCESS, StatusCodes.ACCEPTED, StatusCodes.CREATED].indexOf(
        status,
      ) >= 0,
  );
};
