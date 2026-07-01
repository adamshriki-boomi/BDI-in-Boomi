import { Box, ButtonCreate, Flex, Grid, Slide, Text } from 'components';
import { LoginRoutes } from 'containers/Login/LoginRoutes';
import { AccountPicker } from 'modules';
import { SuperAdminEnabler } from 'modules/FeatureEnabler/SuperAdminEnabler';

export function AccountDrawerContent() {
  return (
    <Slide
      direction="right"
      in={true}
      style={{ height: 'full', position: 'relative' }}
    >
      <Grid templateRows="1fr auto" px={4} h="full">
        <Flex overflowY="hidden" flexDir="column">
          <Text textStyle="R8" color="primaryLighter">
            Accounts
          </Text>
          <AccountPicker mode={AccountPicker.Modes.MINIMAL} />
        </Flex>
        <SuperAdminEnabler>
          <Flex
            flexDir="column"
            justify="center"
            borderTop="1px"
            borderColor="gray.300"
            py={4}
          >
            <Box ml="auto">
              <ButtonCreate
                size="small"
                variant="outlined-primary"
                href={LoginRoutes.CREATE_ACCOUNT}
              >
                Add Account
              </ButtonCreate>
            </Box>
          </Flex>
        </SuperAdminEnabler>
      </Grid>
    </Slide>
  );
}
