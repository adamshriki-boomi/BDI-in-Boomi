import { useBoolean } from '@chakra-ui/react';
import { Divider, Grid, RiveryButton, Text } from 'components';
import { AccountDrawerContent } from './AccountView';
import { ActiveAccountName, EnvSelection } from './EnvironmentsView';
import { ChevronLeftIcon, ChevronRightIcon } from './SubComponents';

export function AccountEnvSelection({ setDrawer }) {
  const [showAccount, { toggle }] = useBoolean();

  return (
    <Grid height="full" {...(!showAccount && { gridTemplateRows: 'auto 1fr' })}>
      {showAccount ? (
        <AccountPicker onBack={toggle} />
      ) : (
        <EnvPicker onBack={toggle} onCreate={setDrawer} />
      )}
    </Grid>
  );
}

const AccountPicker = ({ onBack }) => (
  <>
    <RiveryButton
      label="Back To Environments"
      variant="transparent"
      leftIcon={<ChevronLeftIcon />}
      onClick={onBack}
      display="flex"
      borderRadius={0}
      py="17px"
      px={5}
      h="auto"
      bgColor="gray.200"
      borderBottom="1px"
      borderBottomColor="gray.300"
      justifyContent="flex-start"
      _hover={{ bgColor: 'gray.300' }}
    />
    <Divider color="gray.300" />
    <AccountDrawerContent />
  </>
);
const EnvPicker = ({ onBack, onCreate }) => (
  <>
    <RiveryButton
      px={6}
      display="grid"
      borderRadius={0}
      py={3}
      h="auto"
      variant="transparent"
      justifyContent="space-between"
      bgColor="gray.200"
      _hover={{ bgColor: 'gray.300' }}
      borderBottom="1px"
      borderBottomColor="gray.300"
      onClick={onBack}
      aria-label="change account"
      label={
        <>
          <Text textStyle="R8" gridRow={1} gridColumn={'1/1'} textAlign="left">
            Account
          </Text>
          <ActiveAccountName textStyle="M6" gridRow={2} gridColumn={'1/1'} />
          <ChevronRightIcon
            gridColumn={2}
            gridRow={'2 / 3'}
            alignSelf="center"
          />
        </>
      }
    />
    <EnvSelection setDrawer={onCreate} />
  </>
);
