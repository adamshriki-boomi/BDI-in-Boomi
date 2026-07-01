import {
  ButtonFlavor,
  ButtonType,
  ExButton,
} from '@boomi/exosphere/dist/react/button';
import { Flex } from 'components';
import { ExoText } from 'components/Exosphere/ExoText';
import { useEffect, useMemo, useState } from 'react';
import { useCore } from 'store/core';
import { useGetUsersQuery } from 'containers/Settings/Users/users.query';
import { useGetEnvironmentsQuery } from 'modules/Environments/environments.query';
import { SuspendedVariableDrawer } from './SuspendedVariableDrawer';

const VARIABLE_NAME = 'Suspended_Rivers_Alert_Group';

export default function SuspendedRiversNotifications() {
  const [emails, setEmails] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { envId } = useCore();

  // Fetch environments to get variables
  const { data: environmentsArray = [], refetch: refetchEnvironments } =
    useGetEnvironmentsQuery('');

  // Fetch users for recipients dropdown
  const { data: users = [] } = useGetUsersQuery(null);

  // Transform users to combobox options
  const userOptions = useMemo(() => {
    return users
      .filter(user => user.user_email)
      .map(user => ({
        value: user.user_email,
        label: user.user_email,
      }));
  }, [users]);

  // Get the current environment's variables
  const currentEnvironment = useMemo(
    () =>
      environmentsArray.find(
        env => env.cross_id === envId || env._id === envId,
      ),
    [environmentsArray, envId],
  );

  const envVariables = currentEnvironment?.variables;

  // Load the variable value when the component mounts or when environment changes
  useEffect(() => {
    if (envVariables && envVariables[VARIABLE_NAME]) {
      // Remove brackets if they exist
      const value = envVariables[VARIABLE_NAME];
      const cleanValue =
        value.startsWith('[') && value.endsWith(']')
          ? value.slice(1, -1)
          : value;
      setEmails(cleanValue);
    } else {
      setEmails('');
    }
  }, [envVariables]);

  const handleOpenDrawer = () => {
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  // Check if there are recipients already configured
  const hasRecipients = emails.trim().length > 0;

  return (
    <Flex flexDir="column" gap={4}>
      <Flex flexDir="column" gap={0.5}>
        <ExoText styleName="Subhead 2 Bold" color="var(--exo-color-font)">
          Suspended Data Flows Notifications
        </ExoText>
        <ExoText
          styleName="Body Small 1"
          color="var(--exo-color-font-secondary)"
        >
          Get notified when Data Flows are automatically suspended due to
          repeated failures.
        </ExoText>
      </Flex>

      <Flex w="fit-content">
        <ExButton
          onClick={handleOpenDrawer}
          type={ButtonType.PRIMARY}
          flavor={ButtonFlavor.BASE}
        >
          {hasRecipients ? 'Edit Recipients' : 'Add Recipients'}
        </ExButton>
      </Flex>

      <SuspendedVariableDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        initialEmails={emails}
        envVariables={envVariables}
        refetchEnvironments={refetchEnvironments}
        userOptions={userOptions}
      />
    </Flex>
  );
}
