import { API } from 'api';
import { Partner, SignupResponse } from 'api/types';
import {
  CheckmarkSolid,
  Divider,
  Flex,
  HStack,
  Icon,
  RenderGuard,
  RiveryButton,
  Text,
} from 'components';
import { RecaptchaInput } from 'components/Form/components/RecaptchaInput';
import {
  ClickElement,
  GTMEvents,
  useViewTracking,
  withEventTracking,
} from 'components/Tracking/utils';
import { getQueryParams } from 'hooks/router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { useToggle } from 'react-use';
import { GetStartedWithBoomi } from '../components/GetStartedWithBoomi';
import { GoogleSignIn } from '../components/GoogleSignIn';
import { Or } from '../components/Or';
import { LOGIN_TYPE } from '../Login';
import { LoginRoutes } from '../LoginRoutes';
import {
  ContactSupportWrap,
  EmailAndPassword,
  ErrorBox,
  NewLoginBox,
} from './NewLoginBox';

export const signupParams = ['ds', 'dt', 'partner', 'partner_account_id'];

type FormProps = {
  user_email: string;
  password: string;
  recaptcha: string;
};

type UrlParams = {
  partner: Partner;
  partner_account_id: string;
};

enum SignupStatus {
  EXISTS = 'Exists',
}
type SignupErrorResponse = {
  message: string;
  status?: SignupStatus | string;
};

export function NewSignupHeaderActions() {
  const { hideWhenPartnerGoogle } = usePartnerUrlParams();
  const exoTheme = import.meta.env.VITE_EXO_THEME === 'true';
  return (
    <ContactSupportWrap isSignup>
      <RenderGuard condition={!hideWhenPartnerGoogle}>
        <HStack textStyle="R7">
          <Text>Already have an account?</Text>
          <RiveryButton
            label="Login"
            variant="link"
            fontWeight="medium"
            as={Link}
            to={LoginRoutes.LOGIN_ROOT}
            {...(!exoTheme && { color: 'yellow.300' })}
          />
        </HStack>
        <Divider
          orientation="vertical"
          h="14px"
          opacity={1}
          borderColor="border-contrast"
        />
      </RenderGuard>
    </ContactSupportWrap>
  );
}

export function NewSignUp() {
  useViewTracking({ event: GTMEvents.TRIAL_FORM_1_VIEW });
  const history = useHistory();
  const { handleSubmit, ...formHookApi } = useForm<FormProps>();
  const [inProgress, toggleProgress] = useToggle(false);
  const [signUpError, setSignUpError] = useState<SignupErrorResponse>();
  const [signUpState, setSignUpState] = useState<SignupResponse>();
  const { urlParams } = usePartnerUrlParams();

  const onSubmit = async (data: FormProps) => {
    setSignUpError(undefined);
    toggleProgress(true);
    const { recaptcha, ...credentials } = data;
    try {
      const internalData = {
        login_type: LOGIN_TYPE.PASSWORD,
        ...getQueryParams(signupParams),
        ...credentials,
        ...urlParams,
      };
      const response = await API.auth.signUp(internalData, recaptcha);
      if (Boolean(response?.registration)) {
        setSignUpState(response);
      }
    } catch (error) {
      setSignUpError(error?.response?.data);
    } finally {
      toggleProgress(false);
    }
  };

  const isSignUpSuccessful = Boolean(signUpState?.registration === true);

  if (isSignUpSuccessful) {
    history.push({
      pathname: LoginRoutes.CREATE_ACCOUNT,
      state: { data: signUpState },
    });
  }

  return (
    <NewLoginBox
      header="Start your free trial"
      subHeader={
        <HStack
          textStyle="R7"
          justify="space-between"
          gap={4}
          color="font-secondary"
        >
          <HStack>
            <Icon as={CheckmarkSolid} color="inherit" boxSize={4} />
            <Text>Get 1,000 free usage credits</Text>
          </HStack>
          <HStack>
            <Icon as={CheckmarkSolid} color="inherit" boxSize={4} />
            <Text>No credit card required</Text>
          </HStack>
        </HStack>
      }
    >
      <form
        style={{ width: '100%' }}
        onSubmit={withEventTracking(handleSubmit(onSubmit), () => ({
          data: {
            user_email: formHookApi.getValues().user_email,
            click_element: ClickElement.FORM,
          },
          event: GTMEvents.TRIAL_FORM_1_CLICK,
        }))}
      >
        <Flex flexDir="column" gap={6} mb={6}>
          {signUpError && (
            <ErrorBox>
              {isUserExists(signUpError) ? (
                <Flex flexDir="column">
                  <Text>
                    An account with this email address already exists.
                  </Text>
                  <Text>Use a different email address or try to log in.</Text>
                </Flex>
              ) : (
                signUpError?.message
              )}
            </ErrorBox>
          )}
          <GoogleSignIn mode={GoogleSignIn.ActionModes.signup} />
          <Or />
          <GetStartedWithBoomi />
          <Or />
          <EmailAndPassword
            formHookApi={formHookApi}
            login={false}
            withValidation
          />
        </Flex>
        <RecaptchaInput api={formHookApi} />
        <RiveryButton
          w="full"
          mt={6}
          label="Get Started"
          isLoading={inProgress}
          type="submit"
          variant="primary"
        />
      </form>
    </NewLoginBox>
  );
}

const usePartnerUrlParams = () => {
  const { state } = useLocation<{ data: UrlParams }>();
  const { data: urlParams } = state || {};
  const partner = urlParams?.partner;
  const hideWhenPartnerGoogle = partner === Partner.GOOGLE_MARKETPLACE;
  return { hideWhenPartnerGoogle, urlParams };
};

const isUserExists = (signUpError: SignupErrorResponse) =>
  signUpError.status === SignupStatus.EXISTS;
