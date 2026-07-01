import { API } from 'api';
import {
  Box,
  Flex,
  Grid,
  HStack,
  ListItem,
  RenderGuard,
  RiveryInfoTooltip,
  Text,
  UnorderedList,
} from 'components';
import RiveryButton from 'components/Buttons/RiveryButton';
import {
  FormControl,
  FormControls,
  InputTypes,
  RiveryCheckbox,
} from 'components/Form';
import { GTMEvents, withEventTracking } from 'components/Tracking/utils';
import {
  activeAccountTypeInput,
  partnerPlanInput,
} from 'containers/AppSettings/AccountTypes';
import { useState } from 'react';
import { useController, useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';
import { useToggle } from 'react-use';
import { useCore } from 'store/core';
import { createNewAccountData } from '../components/CreateAccountForm';
import { CountriesSelect } from '../components/CreateAccountForm/CountriesSelect';
import public_emails from '../components/CreateAccountForm/public_domains.json';
import { BoomiTerms, ErrorBox, NewLoginBox } from './NewLoginBox';

export type CreateAccountFormProps = {
  title: string;
  subtitle?: string;
  account?: Record<string, any>;
  onSubmitSuccess?: (response?: any) => any;
  onCancel?: () => any;
  token?: string;
  exoTheme?: boolean;
};
export function NewCreateAccountForm({
  title,
  subtitle,
  account = {},
  onSubmitSuccess,
  token,
  exoTheme,
}: CreateAccountFormProps) {
  const { isSuperAdminUser } = useCore();
  const history = useHistory();
  const {
    useFormApi,
    errorMessage,
    suggestions,
    setErrorByStatus,
    clearFormError,
  } = useCreateForm(account);
  const {
    field: { onChange: setAccountName },
  } = useController({
    name: 'account_name',
    control: useFormApi.control,
  });

  const { boomiAccountId } = useCore();
  const [isRegistering, toggleRegister] = useToggle(false);
  const onSubmit = formData =>
    withEventTracking(
      () => submit(formData),
      !isSuperAdminUser
        ? {
            event: GTMEvents.TRIAL_FORM_2_CLICK,
            data: { account_name: formData.account_name },
          }
        : undefined,
    )(formData);
  const submit = async formData => {
    clearFormError();
    try {
      const signupData = {
        ...formData,
        singleOptIn:
          formData.singleOptIn === undefined
            ? !CountriesSelect.doubleOptCountries.includes(formData.country)
            : formData.singleOptIn,
        boomi_account_id: boomiAccountId,
      };
      const params = {};
      if (isSuperAdminUser) {
        params['loggedIn'] = true;
      }
      toggleRegister(true);
      const response: any = await API.registration.register(
        signupData as any,
        params,
        token,
      );
      if (Boolean(response?.ok)) {
        const { user_email, account_id, user_id } = response;
        onSubmitSuccess &&
          withEventTracking(() => onSubmitSuccess(response), {
            event: GTMEvents.TRIAL_FORM_2_SUCCESS,
            data: formData.account_name,
            user_email,
            account_id,
            user_id,
          })();
      } else {
        setErrorByStatus(response);
      }
    } catch (error) {
      setErrorByStatus(error);
    } finally {
      toggleRegister(false);
    }
  };
  return (
    <NewLoginBox
      header={null}
      minH="650px"
      height="auto"
      {...(!exoTheme && {
        border: '2px',
        borderColor: 'purple.200',
        shadow: 'md',
      })}
    >
      <Flex flexDir="column" h="full">
        <Flex flexDir="column" color="primary">
          <Text textStyle="M5">{title}</Text>
          <RenderGuard condition={subtitle}>
            <Text>{subtitle}</Text>
          </RenderGuard>
        </Flex>
        <Grid
          as="form"
          id="create_account_form"
          onSubmit={useFormApi.handleSubmit(onSubmit)}
          h="full"
          templateRows="repeat(4, min-content)"
        >
          {fullUserControls?.map((control: FormControl, index) => (
            <FormControls
              key={`${index}-${control?.name}`}
              controls={control as any}
              api={useFormApi}
              pt={2}
            />
          ))}
          <RenderGuard condition={!isSuperAdminUser}>
            {additionalUserControls.map((control: FormControl, idx) => (
              <FormControls
                key={`${idx}-${control?.name}`}
                controls={control as any}
                api={useFormApi}
                pt={2}
              />
            ))}
            <CountriesSelect api={useFormApi} pt={2} registration />
          </RenderGuard>
          {isSuperAdminUser ? (
            ownerEmailControls?.map((control: FormControl, index) => (
              <FormControls
                key={`${index}-${control?.name}`}
                controls={control as any}
                api={useFormApi}
                pt={2}
              />
            ))
          ) : (
            <>
              <FormControls
                controls={userEmailControl}
                api={useFormApi}
                display="none"
                //for zoom info (hidden field)
              />
            </>
          )}
          <FormControls
            pt={2}
            mb={0}
            controls={companyInput}
            api={useFormApi}
          />
          <RiveryInfoTooltip
            buttonProps={{ h: 'full', pt: 2, mt: 0, height: '70px' }}
            extraProps={{
              placement: 'end',
              contentProps: { w: '220px', mt: 0 },
            }}
            icon={<FormControls controls={accountControls} api={useFormApi} />}
            description={
              <Flex flexDir="column">
                Account name has to start with a letter and contain only:
                <UnorderedList>
                  <ListItem>Lower and upper case letters</ListItem>
                  <ListItem>Numbers (0-9)</ListItem>
                </UnorderedList>
              </Flex>
            }
          />
          {errorMessage !== '' ? (
            <Flex pt={2} mb={4}>
              <ErrorBox>
                <Text>
                  <Box fontWeight="medium">{errorMessage}</Box>
                  <RenderGuard condition={Boolean(suggestions?.length)}>
                    <Box color="font">
                      Suggestions:{' '}
                      <UnorderedList>
                        {suggestions.map(value => (
                          <ListItem>
                            <RiveryButton
                              variant="link"
                              color={'text'}
                              p={2}
                              m={0}
                              h="23px"
                              label={value}
                              onClick={() => {
                                setAccountName(value);
                                clearFormError();
                              }}
                            />
                          </ListItem>
                        ))}
                      </UnorderedList>
                    </Box>
                  </RenderGuard>
                </Text>
              </ErrorBox>
            </Flex>
          ) : null}
          <RenderGuard condition={!isSuperAdminUser}>
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
                understand I can opt-out at any time and that my data will be
                handled according to <BoomiTerms />.
              </Text>
            </Flex>
          </RenderGuard>
          <HStack justify="space-between" alignSelf="flex-end" pt={5}>
            <RiveryButton
              label="Back"
              variant="text"
              onClick={() => history.goBack()}
            />
            <RiveryButton
              isLoading={isRegistering}
              label="Next"
              aria-label="Get Started"
              type="submit"
              disabled={false}
            />
          </HStack>
        </Grid>
      </Flex>
    </NewLoginBox>
  );
}
const companyInput = {
  type: InputTypes.TEXT,
  name: 'company_name',
  id: 'company_name',
  display_name: 'Company Name',
  required: true,
  placeholder: 'Company Name',
  chakra: true,
  absoluteErrorPosition: true,
};
const fullUserControls: Array<FormControl | FormControl[]> = [
  {
    type: InputTypes.TEXT,
    name: 'first_name',
    id: 'first_name',
    display_name: 'First Name',
    required: true,
    placeholder: 'First Name',
    chakra: true,
    absoluteErrorPosition: true,
  },
  {
    type: InputTypes.TEXT,
    name: 'last_name',
    id: 'last_name',
    display_name: 'Last Name',
    required: true,
    placeholder: 'Last Name',
    chakra: true,
    absoluteErrorPosition: true,
  },
];

const additionalUserControls = [
  {
    type: InputTypes.TEXT,
    name: 'job_title',
    id: 'job_title',
    display_name: 'Job Title',
    required: true,
    placeholder: 'Job Title',
    chakra: true,
    absoluteErrorPosition: true,
  },
  {
    type: InputTypes.TEXT,
    name: 'phone_number',
    id: 'phone_number',
    display_name: 'Phone Number',
    required: true,
    placeholder: 'Phone Number',
    chakra: true,
    absoluteErrorPosition: true,
  },
];

const accountControls = [
  {
    type: InputTypes.TEXT,
    name: 'account_name',
    id: 'account_name',
    display_name: 'Account Name',
    required:
      'Account name should start with a letter and contains only A-Za-z0-9_- characters',
    pattern: /^[A-Za-z][A-Za-z0-9_-]*$/,
    placeholder: 'Account Name',
    chakra: true,
    absoluteErrorPosition: true,
  },
];

const ownerEmailControls = [
  {
    type: InputTypes.TEXT,
    name: 'owner_email',
    id: 'owner_email',
    display_name: 'Account Owner Email (client)',
    required: true,
    placeholder: 'Account Owner Email (client)',
    chakra: true,
    absoluteErrorPosition: true,
  },
  activeAccountTypeInput,
  partnerPlanInput,
];
const userEmailControl = [
  {
    type: InputTypes.TEXT,
    name: 'user_email',
    id: 'user_email',
    display_name: 'Email',
    required: true,
    placeholder: 'Email',
    chakra: true,
    absoluteErrorPosition: true,
  },
];

const SUGGESTIONS = [];

const useCreateForm = defaultValues => {
  const [suggestions, setSuggestions] = useState(SUGGESTIONS);
  const [errorMessage, setErrorMessage] = useState('');
  const { userEmail: userEmailAdmin } = useCore();
  const userEmail = userEmailAdmin || defaultValues?.user_email;
  const url = userEmail?.split('@')?.[1];
  const domain = url?.split('.')?.[0];
  const companyName = public_emails.includes(domain) ? null : domain;
  const useFormApi = useForm<any>({
    defaultValues: {
      ...createNewAccountData(),
      ...defaultValues,
      company_name: companyName,
      account_name: companyName,
      owner_email: userEmail,
      terms_agree: true,
    },
  });

  const clearFormError = () => {
    setErrorMessage('');
    setSuggestions(SUGGESTIONS);
  };
  const defaultErrorMessage =
    'We had a problem creating your account. Please try again later or open a support ticket';
  const setErrorByStatus = error => {
    const messageSetter = {
      409: () => {
        setErrorMessage(
          'Account name is already in use. Please try a different one.',
        );
        setSuggestions(error?.suggested_names);
      },
    };
    const setMessage = messageSetter[error?.status];
    setMessage
      ? setMessage()
      : setErrorMessage(`${error?.message ?? defaultErrorMessage}`);
  };

  return {
    useFormApi,
    errorMessage,
    suggestions,
    setErrorByStatus,
    clearFormError,
  };
};
