import { AppRoutes } from 'app/routes';
import {
  ButtonCreate,
  Divider,
  Flex,
  HStack,
  RenderGuard,
  RiveryButton,
  Text,
} from 'components';
import { AccountPicker } from 'modules/AccountPicker/AccountPicker';
import { SuperAdminEnabler } from 'modules/FeatureEnabler/SuperAdminEnabler';
import React, { useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useCore } from 'store/core';
import { useLogout } from '../hooks/useLogout';
import { LoginRoutes } from '../LoginRoutes';
import { ContactSupportWrap, NewLoginBox } from './NewLoginBox';

export function NewAccounts({ exoTheme }) {
  const history = useHistory();
  const { hasMultipleAccounts } = useCore();

  const onCreateNewAccount = () => {
    history.push(LoginRoutes.CREATE_ACCOUNT);
  };

  useEffect(() => {
    if (!hasMultipleAccounts) {
      history.push(AppRoutes.ROOT);
      return;
    }
  }, [hasMultipleAccounts, history]);

  return (
    <NewLoginBox
      header={null}
      overflow="hidden"
      sx={{
        '& [aria-label="accounts list"]': {
          h: '370px!important',
        },
      }}
      pt={12}
      {...(!exoTheme && {
        border: '2px',
        borderColor: 'purple.200',
        shadow: 'md',
      })}
    >
      <Flex flexDir="column" gap={3}>
        <Text textStyle="M5" color="primary">
          Select an account
        </Text>
        <AccountPicker
          headerChildren={
            <SuperAdminEnabler>
              <ButtonCreate
                aria-label="create new account"
                onClick={onCreateNewAccount}
              >
                Create New Account
              </ButtonCreate>
            </SuperAdminEnabler>
          }
        />
      </Flex>
    </NewLoginBox>
  );
}

export function NewAccountsHeaderActions() {
  const logout = useLogout();
  const { hasMultipleAccounts, userEmail } = useCore();
  return (
    <ContactSupportWrap flexDir="row-reverse">
      <RenderGuard condition={hasMultipleAccounts}>
        <HStack textStyle="R7" pl={2}>
          <Text>{userEmail}</Text>
          <RiveryButton
            label="Logout"
            variant="link"
            onClick={logout}
            as={Link}
            to={LoginRoutes.LOGIN_ROOT}
          />
        </HStack>
        <Divider orientation="vertical" h="14px" borderColor="purple.100" />
      </RenderGuard>
    </ContactSupportWrap>
  );
}
