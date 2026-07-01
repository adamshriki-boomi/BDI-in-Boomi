import { Box, Flex } from '@chakra-ui/react';
import { API } from 'api';
import { Partner } from 'api/types';
import { AppRoutes, RoutesBuilder } from 'app/routes';
import { RenderGuard, RiveryButton, Text } from 'components';
import RiveryAlert from 'components/Alert/Alert';
import { FormRenderer, InputTypes, RiveryCheckbox } from 'components/Form';
import {
  ClickElement,
  GTMEvents,
  withEventTracking,
} from 'components/Tracking/utils';
import { CountriesSelect } from 'containers/Login/components/CreateAccountForm/CountriesSelect';
import { RiverTypeBoxes } from 'containers/Onboarding/components/Steps/Step1';
import { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useCoreActions } from 'store/core';
import { getId, getOId } from 'utils/api.sanitizer';
import { useRiverRouteBuilder } from 'utils/create-river.helpers';
import { passwordNote, passwordRegex } from 'utils/validations';
import { BoomiTerms, NewLoginBox } from './NewLoginBox';

type CreateAccountFormProps = {
  username: string;
  company_name: string;
  password: string;
  country: string;
  state: string;
  job_title: string;
  phone: string;
  singleOptIn: boolean;
};
type PartnerUrlParams = {
  token: string;
  first_name: string;
  last_name: string;
  account_name: string;
  email: string;
  partner: Partner;
  database: string;
  schema: string;
  partnerConnect: string;
};
export function NewPartnerSignUp({ exoTheme }) {
  const { state } = useLocation<{ data: PartnerUrlParams }>();
  const details = !state?.data?.email
    ? JSON.parse(atob(state?.data?.partnerConnect))
    : state?.data;
  const formData = { ...details, username: details?.email };

  const [signUpError, setSignUpError] = useState<any>();
  const [signUpState, setSignUpState] =
    useState<API.registration.PartnerResponse>();

  const onSubmit = async (data: CreateAccountFormProps) => {
    try {
      const {
        company_name,
        password,
        country,
        state,
        job_title,
        phone,
        singleOptIn,
      } = data;
      const registerData = {
        partner: formData.partner,
        company_name,
        password,
        country,
        state,
        job_title,
        phone,
        singleOptIn:
          singleOptIn === undefined
            ? !CountriesSelect.doubleOptCountries.includes(country)
            : singleOptIn,
      };
      const response = await API.registration.registerPartner(
        registerData,
        formData.token,
      );

      if (response?.is_registered) {
        setSignUpState(response);
      }
    } catch (error) {
      setSignUpError('There was an error creating the account.');
    }
  };

  const isSignUpSuccessful = signUpState?.user_email;
  const onRiverTypeSelect = useRouteToRiver();

  return (
    <NewLoginBox
      header={null}
      {...(!exoTheme && {
        border: '2px',
        borderColor: 'purple.200',
        shadow: 'md',
      })}
    >
      {isSignUpSuccessful ? (
        <Flex flexDir="column" gap={4}>
          <Flex flexDir="column">
            <Text textStyle="M5" color="primary">
              Create Data Pipelines & Workflows
            </Text>
            <Text>
              Each type of Data Flow helps you accomplish different tasks.
            </Text>
          </Flex>
          <RiverTypeBoxes
            homePage={false}
            createDrawer
            partnerSignup
            onRiverClick={onRiverTypeSelect}
          />
        </Flex>
      ) : (
        <Flex flexDir="column" gap={3}>
          <Flex flexDir="column" color="primary">
            <Text textStyle="M5">Welcome, {details.first_name}!</Text>
            <Text>
              Build complex end-to-end ELT data pipelines fast. Whether it’s
              no-code or custom code, we work for you.
            </Text>
          </Flex>
          <Text>To set up your account, let’s start with some basics:</Text>

          <FormRenderer
            onSubmit={withEventTracking(onSubmit, () => ({
              data: {
                user_email: formData?.email ?? formData?.username,
                partner: formData.hasOwnProperty('sfConnectSignup')
                  ? 'snowflake'
                  : formData.partner,
                click_element: ClickElement.FORM,
              },
              event: GTMEvents.TRIAL_FROM_PARTNER,
            }))}
            controls={fields}
            formData={formData}
            render={({ useFormApi }) => {
              return (
                <Box mt={3}>
                  <CountriesSelect api={useFormApi} registration />

                  <RiveryButton
                    w="full"
                    my={6}
                    type="submit"
                    aria-label="create my account"
                    label="Create Account"
                  />
                  <Flex alignItems="start" gap={1} mb={2}>
                    <RenderGuard
                      condition={CountriesSelect.doubleOptCountries.includes(
                        useFormApi?.watch('country'),
                      )}
                    >
                      <RiveryCheckbox
                        ariaLabel="terms-agree"
                        mt={1}
                        name="singleOptIn"
                        label={null}
                        api={useFormApi}
                        checked={useFormApi.getValues('singleOptIn')}
                      />
                    </RenderGuard>
                    <Text>
                      By providing my contact information, I authorize Boomi to
                      provide occasional updates about products and solutions. I
                      understand I can opt-out at any time and that my data will
                      be handled according to <BoomiTerms />.
                    </Text>
                  </Flex>
                  {signUpError && (
                    <RiveryAlert
                      variant="error-light"
                      description={signUpError}
                    />
                  )}
                </Box>
              );
            }}
          />
        </Flex>
      )}
    </NewLoginBox>
  );
}

const useRouteToRiver = () => {
  const { push } = useHistory();
  const { autoSignIn } = useCoreActions();
  const { createLinkByRiverType } = useRiverRouteBuilder();
  const onRiverTypeSelect = async type => {
    const response: any = await autoSignIn(undefined);
    const account = response.payload?.login?.user_accounts[0];

    const route = account
      ? type === 'kits'
        ? RoutesBuilder.kits({
            accountId: getId(account),
            envId: getOId(account?.env_id),
          })
        : createLinkByRiverType({
            type,
            accountId: getId(account),
            envId: getOId(account?.env_id),
          })
      : AppRoutes.ROOT;
    push(route);
  };
  return onRiverTypeSelect;
};

const fields = [
  {
    display_name: 'Email Address',
    type: InputTypes.EMAIL,
    name: 'username',
    required: true,
    disabled: true,
    chakra: true,
  },
  {
    display_name: 'Job Title',
    type: InputTypes.TEXT,
    name: 'job_title',
    required: true,
    chakra: true,
  },
  {
    display_name: 'Phone Number',
    type: InputTypes.TEXT,
    name: 'phone_number',
    required: true,
    chakra: true,
  },
  {
    display_name: 'Company Name',
    type: InputTypes.TEXT,
    name: 'company_name',
    required: true,
    chakra: true,
  },
  {
    display_name: 'Password',
    type: InputTypes.PASSWORD,
    name: 'password',
    required: passwordNote,
    pattern: passwordRegex,
    chakra: true,
  },
];
