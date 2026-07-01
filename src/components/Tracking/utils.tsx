import useEffectOnce from 'react-use/lib/useEffectOnce';

export enum GTMEvents {
  TRIAL_FORM_1_CLICK = 'trial_form_1_click',
  TRIAL_FORM_1_VIEW = 'trial_form_1_view',
  TRIAL_FORM_1_SUCCESS = 'trial_form_1_success',
  TRIAL_FORM_2_CLICK = 'trial_form_2_click',
  TRIAL_FORM_2_VIEW = 'trial_form_2_view',
  TRIAL_FORM_2_SUCCESS = 'trial_form_2_success',
  ONBOARDING_START_VIEW = 'onboarding_start_view',
  TRIAL_FROM_PARTNER = 'trial_form_partner',
  TRIAL_EMAIL_CONFIRMED = 'trial_email_confirmed',
  USER_LOGIN = 'user_login',
}

export enum ClickElement {
  FORM = 'form',
  GOOGLE = 'google',
}

export const handleEventTracking = eventData =>
  eventData && sendEventToGTM({ event: eventData.event, ...eventData.data });

export function withEventTracking(
  handler: (any) => void,
  trackingData: any | undefined,
) {
  return (e = null) => {
    if (trackingData) {
      const eventData =
        typeof trackingData === 'function' ? trackingData(e) : trackingData;
      handleEventTracking(eventData);
    }
    return handler && handler(e);
  };
}

export function useViewTracking(data) {
  useEffectOnce(() => {
    handleEventTracking(data);
  });
}

const sendEventToGTM = eventObj => {
  const dataLayer = window['dataLayer'];
  try {
    dataLayer?.push(eventObj);
  } catch (e) {
    console.log(e);
  }
};
