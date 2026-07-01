import { api, extractData, post, putData } from 'api/api.proxy';
import { Partner } from 'api/types';

const REGISTER = `/register`;
const FINISH = `/finish`;

type RegisterProps = {
  account_name: string;
  button_clicked?: boolean;
  company_name: string;
  // country: string;
  // country_code: string;
  first_name: string;
  google_id?: string | number;
  last_name: string;
  phone_number: string;
  /**
   * added automatically by default within the function
   */
  referrer_url?: string;
  user_email: string;
};
// TODO what successful response looks like?
export type RegisterResponse = {
  message?: string; // for error
  success?: string;
  ok?: boolean;
  account: string;
  login_method: 'google' | string;
  needVerification: boolean;
  user_email: string;
  user_id: string;
};
export async function register(
  props: RegisterProps,
  params: any,
  token,
): Promise<RegisterResponse> {
  const headers = token ? { authorization: token } : {};
  return putData(
    REGISTER,
    { ...props, referrer_url: document?.referrer },
    {
      params,
      headers: { ...api.defaults.headers, ...headers },
    },
  );
}
export type RegisterPartnerProps = {
  company_name: string;
  country: string;
  state?: string;
  password: string;
  partner?: Partner;
  phone_number?: string;
  job_title?: string;
  singleOptIn?: boolean;
};
export type PartnerResponse = {
  is_sf: boolean;
  account: { $oid: string };
  is_registered: boolean;
  user_email: string;
};
export async function registerPartner(
  props: RegisterPartnerProps,
  token: string,
): Promise<PartnerResponse> {
  const { partner = Partner.SNOWFLAKE } = props;
  return post(`${REGISTER}/${partner}${FINISH}/${token}`, props).then(
    extractData,
  );
}
