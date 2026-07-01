import { Box, StackProps } from '@chakra-ui/react';
import {
  Center,
  Flex,
  HStack,
  List,
  ListIcon,
  ListItem,
  OutlinedSuccess,
  RenderGuard,
  RiveryInfoTooltip,
  Text,
} from 'components';
import RiveryAlert from 'components/Alert/Alert';
import RiveryButton from 'components/Buttons/RiveryButton';
import { Input, InputTypes } from 'components/Form';
import { OpenSupport } from 'modules/ModalForm/OpenSupport';
import { useEffect } from 'react';
import { useWatch } from 'react-hook-form';
import { Link, useLocation } from 'react-router-dom';
import { useToggle } from 'react-use';
import { useCoreActions } from 'store/core';
import { emailValidation, passwordRegex } from 'utils/validations';
import { LoginRoutes } from '../LoginRoutes';

const ExternalLink = ({ href, children }) => (
  <RiveryButton
    label={children}
    href={href}
    target="_blank"
    variant="link"
    fontSize="sm"
    size="small"
  />
);

export const BoomiTerms = () => (
  <>
    <ExternalLink href="https://boomi.com/privacy/">
      Boomi's privacy policy
    </ExternalLink>
  </>
);

export const Terms = () => (
  <>
    <ExternalLink href="https://rivery.io/terms-of-use/">
      Terms of Use
    </ExternalLink>
    <Text mx={1} display="inline">
      and
    </Text>
    <ExternalLink href="https://rivery.io/privacy-policy/">
      Privacy Policy
    </ExternalLink>
  </>
);

function useBoomiAccountID() {
  const { setBoomiAccountId } = useCoreActions();
  const { state } = useLocation<{ data: any }>();
  const details = state?.data?.boomi_account_id;
  if (details) {
    setBoomiAccountId(details);
  }
}
export function NewLoginBox({
  children,
  header,
  subHeader = null,
  footer = null,
  ...flexProps
}) {
  useBoomiAccountID();
  return (
    <Flex
      bg="white"
      w="570px"
      minH="720px"
      height="fit-content"
      justifyContent="center"
      border="1px"
      borderColor="background-secondary"
      borderRadius={10}
      flexDir="column"
      gap={4}
      p={16}
      boxShadow="0px 10px 15px -3px rgba(0, 0, 0, 0.10), 0px -1px 6px 0px rgba(0, 0, 0, 0.05)"
      {...flexProps}
    >
      <Center flexDir="column" gap={2} w="full">
        <Text className="brand-title" color="background-brand" textStyle="B2">
          {header}
        </Text>
        {subHeader}
      </Center>
      {children}
      <RenderGuard condition={Boolean(footer)}>
        <Flex alignItems="start" gap={2} mb={2}>
          <Box color="font-secondary" display="inline">
            <Text display="inline">{footer}</Text> <Terms />
          </Box>
        </Flex>
      </RenderGuard>
    </Flex>
  );
}

const validateLength = val => new RegExp('.{8,}$').test(val);
const validateLower = val => new RegExp('[a-z]|(?<=[a-z])').test(val);
const validateUpper = val => new RegExp('(?<=[A-Z])|[A-Z]').test(val);
const validateDigit = val => new RegExp('.*[0-9].*').test(val);
const validateSpecial = val => new RegExp('[-+_!@#$%^&*.,?]').test(val);

export function EmailAndPassword({
  formHookApi,
  forgotPassword = false,
  login = true,
  emailOnly = false,
  passwordOnly = false,
  withValidation = false,
}) {
  const password = useWatch({ control: formHookApi.control, name: 'password' });
  const color = isFullfiled =>
    Boolean(formHookApi?.watch('password')) && isFullfiled
      ? 'green.200'
      : 'icon-disabled';
  const [showValidation, setShowValidation] = useToggle(false);

  const shouldShowValidation =
    Boolean(formHookApi?.watch('password')) &&
    !passwordRegex.test(formHookApi?.watch('password'));

  useEffect(() => {
    if (shouldShowValidation) {
      setShowValidation(true);
    }
    if (passwordRegex.test(formHookApi?.watch('password'))) {
      setShowValidation(false);
    }
  }, [formHookApi, setShowValidation, shouldShowValidation]);

  return (
    <>
      <RenderGuard condition={!passwordOnly}>
        <Input
          label="Email"
          hideLabel
          placeholder="name@company.com"
          required="Please enter a valid email address"
          pattern={emailValidation}
          name="user_email"
          api={formHookApi}
          chakra
          absoluteErrorPosition
        />
      </RenderGuard>
      <RenderGuard condition={!emailOnly}>
        <Flex flexDir="column" gap={1}>
          <RenderGuard condition={forgotPassword}>
            <HStack justifyContent="flex-end">
              <RiveryButton
                label="Forgot Password?"
                to={LoginRoutes.FORGOT_PASSWORD}
                as={Link}
                variant="link"
                fontSize="xs"
              />
            </HStack>
          </RenderGuard>
          <PasswordWrap
            password={password}
            color={color}
            useValidate={withValidation}
            shouldShowValidation={showValidation}
          >
            <Input
              label="Password"
              hideLabel
              type={InputTypes.PASSWORD}
              name="password"
              required="Password does not meet requirements"
              api={formHookApi}
              chakra
              absoluteErrorPosition
              onFocus={() => setShowValidation(true)}
              {...(!login && { pattern: passwordRegex })}
            />
          </PasswordWrap>
        </Flex>
      </RenderGuard>
    </>
  );
}

const passwordConditions = [
  { text: 'Minimum 8 characters', validation: validateLength },
  {
    text: 'At least one lowercase',
    validation: validateLower,
  },
  {
    text: 'At least one uppercase character',
    validation: validateUpper,
  },
  { text: 'At least one digit', validation: validateDigit },
  { text: 'At least one special character', validation: validateSpecial },
];

function PasswordWrap({
  children,
  useValidate,
  shouldShowValidation,
  password,
  color,
}) {
  return useValidate ? (
    <RiveryInfoTooltip
      buttonProps={{ display: 'block' }}
      extraProps={{
        contentProps: { w: '280px' },
        placement: 'end',
        isOpen: shouldShowValidation,
      }}
      description={
        <Flex flexDir="column">
          <Text textStyle="M7">Password must include:</Text>
          <List>
            {passwordConditions.map(({ text, validation }, idx) => (
              <ListItem key={idx}>
                <ListIcon
                  as={OutlinedSuccess}
                  color={color(validation(password))}
                />
                {text}
              </ListItem>
            ))}
          </List>
        </Flex>
      }
      icon={children}
    />
  ) : (
    children
  );
}

export function ErrorBox({ children }) {
  return (
    <RiveryAlert
      variant="error-light"
      description={children}
      sx={{ '& .chakra-alert__desc': { whiteSpace: 'normal' } }}
    />
  );
}

export function ContactSupportWrap({
  children,
  isSignup,
  ...props
}: StackProps & { linkColor?: string; isSignup?: boolean }) {
  const exoTheme = import.meta.env.VITE_EXO_THEME === 'true';

  return (
    <HStack
      textStyle="R7"
      color={exoTheme || !isSignup ? 'font' : 'purple.50'}
      {...props}
    >
      {children}
      <HStack>
        <OpenSupport
          variant="link"
          label="Need Help?"
          {...(!exoTheme && isSignup && { color: 'yellow.300' })}
        />
      </HStack>
    </HStack>
  );
}

export function Contact() {
  return (
    <Text>
      If you didn’t receive any email, check your
      <br /> spam/promotions folder, otherwise <OpenSupport variant="link" />.
    </Text>
  );
}
