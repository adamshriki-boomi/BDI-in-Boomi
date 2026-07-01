import { ExLoader, LoaderSize } from '@boomi/exosphere';
import {
  ButtonFlavor,
  ButtonType,
  ExButton,
} from '@boomi/exosphere/dist/react/button';
import {
  Box,
  ConfirmationModal,
  Flex,
  HStack,
  RenderGuard,
  RiveryButton,
} from 'components';
import RiveryExoTable from 'components/Exosphere/ExoTable';
import { ExoText } from 'components/Exosphere/ExoText';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useCore } from 'store/core/hooks/useCore';
import { NotificationRow, transformApiToUI } from '../types';
import { createNotificationActionsRenderer } from './NotificationActionsCell';
import { NotificationDrawer } from './NotificationDrawer';
import { useNotificationGridColumns } from './NotificationGridColumns';
import { useGetNotificationsQuery } from './notifications.query';
import { useHandleDeleteNotification } from './NotificationsGridActions';
import { NotificationsEmptyState } from './NotificationsGridEmptyState';
import { SettingsNotificationsTags } from 'utils/tracking.tags';
import { Tagger } from 'components/Tracking/Tagger';

export default function UsageNotifications() {
  const { selectedAccountId, subscriptionMetadata } = useCore();

  const { data: apiNotifications = [], isLoading: isInitialLoading } =
    useGetNotificationsQuery(
      { account: selectedAccountId },
      { skip: !selectedAccountId },
    );

  // Transform API data to UI format
  const userNotifications = useMemo(() => {
    const notifications = apiNotifications.map(notification =>
      transformApiToUI(notification, subscriptionMetadata?.start),
    );

    // Sort: preset rows first, then non-preset rows
    return notifications.sort((a, b) => {
      if (a.isPreset && !b.isPreset) return -1;
      if (!a.isPreset && b.isPreset) return 1;
      return 0;
    });
  }, [apiNotifications, subscriptionMetadata?.start]);

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<NotificationRow | null>(null);
  const [isAddMode, setIsAddMode] = useState(false);

  const { columns, isPayg } = useNotificationGridColumns();

  const {
    handleRowDelete,
    handleConfirmDelete,
    handleCancelDelete,
    showDeleteModal,
    isDeleteInProgress,
  } = useHandleDeleteNotification(userNotifications);

  const handleAddNotification = useCallback(() => {
    setSelectedNotification(null);
    setIsAddMode(true);
    setIsDrawerOpen(true);
  }, []);

  const handleEditNotification = useCallback(
    (notification: NotificationRow) => {
      // Find the current notification from userNotifications to ensure we have the latest data
      const currentNotification = userNotifications.find(
        n => n.id === notification.id,
      );
      setSelectedNotification(currentNotification || notification);
      setIsAddMode(false);
      setIsDrawerOpen(true);
    },
    [userNotifications],
  );

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setSelectedNotification(null);
    setIsAddMode(false);
  }, []);

  // Update selectedNotification when userNotifications changes (e.g., after save)
  useEffect(() => {
    if (selectedNotification && !isAddMode) {
      const updatedNotification = userNotifications.find(
        n => n.id === selectedNotification.id,
      );
      if (updatedNotification) {
        setSelectedNotification(updatedNotification);
      }
    }
  }, [userNotifications, selectedNotification, isAddMode]);

  // Add action column to the columns
  const columnsWithActions = useMemo(() => {
    return [
      ...columns,
      {
        field: 'actions',
        header: 'Actions',
        editable: false,
        width: 90,
        sortable: false,
        filter: false,
        resizable: false,
        suppressMenu: true,
        suppressNavigable: true,
        suppressHeaderMenuButton: true,
        cellStyle: {
          overflow: 'visible',
          justifyContent: 'flex-end',
          paddingTop: '0px',
        },
        cellRenderer: createNotificationActionsRenderer(
          handleEditNotification,
          handleRowDelete,
          'id',
        ),
      },
    ];
  }, [columns, handleEditNotification, handleRowDelete]);

  if (isInitialLoading) {
    return (
      <Flex
        flexDir="column"
        height="100%"
        justifyContent="center"
        alignItems="center"
      >
        <ExLoader size={LoaderSize.MEDIUM} />
      </Flex>
    );
  }

  return (
    <Flex flexDir="column" gap={4} position="relative">
      {isDeleteInProgress && (
        <Flex
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          justifyContent="center"
          alignItems="center"
          backgroundColor="rgba(255, 255, 255, 0.8)"
          zIndex={1000}
        >
          <ExLoader size={LoaderSize.MEDIUM} />
        </Flex>
      )}

      <Flex flexDir="column" gap={0.5}>
        <ExoText styleName="Subhead 2 Bold" color="var(--exo-color-font)">
          Consumption Notifications
        </ExoText>
        <HStack>
          <ExoText
            styleName="Body Small 1"
            color="var(--exo-color-font-secondary)"
          >
            Get notifications when your account usage exceeds defined
            thresholds.
          </ExoText>
          <Tagger tags={SettingsNotificationsTags.LEARN_MORE_LINK}>
            <RiveryButton
              label="Learn More"
              href="https://help.boomi.com/docs/Atomsphere/Data_Integration/Administration/consumptions-notifications"
              variant="link"
              target="_blank"
              pl={1}
            />
          </Tagger>
        </HStack>
      </Flex>
      <Box w="fit-content">
        <ExButton
          onClick={handleAddNotification}
          type={ButtonType.PRIMARY}
          flavor={ButtonFlavor.BASE}
          disabled={isDeleteInProgress}
          data-pendo-id={SettingsNotificationsTags.ADD_BUTTON}
        >
          Add Notification
        </ExButton>
      </Box>
      <RenderGuard condition={userNotifications.length > 0}>
        <RiveryExoTable
          columns={columnsWithActions}
          data={userNotifications}
          rowIdField="id"
          noRowsMessage={NotificationsEmptyState()}
        />
      </RenderGuard>
      <ConfirmationModal
        variant="warning"
        title="Delete Notification?"
        description="This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onClose={handleCancelDelete}
        show={showDeleteModal}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />

      <NotificationDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        notification={selectedNotification}
        isAddMode={isAddMode}
        isPayg={isPayg}
      />
    </Flex>
  );
}
