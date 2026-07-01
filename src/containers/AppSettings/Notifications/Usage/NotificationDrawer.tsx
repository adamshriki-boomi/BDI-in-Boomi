import { ExoSideDrawer } from 'components/Exosphere/ExoSideDrawer';
import { NotificationRow, transformUIToApi } from '../types';
import { NotificationForm, NotificationFormData } from './NotificationForm';
import { useCallback, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useCore } from 'store/core';
import { useToastComponent } from 'hooks/useToast';
import {
  useAddNotificationMutation,
  usePatchNotificationMutation,
} from './notifications.query';
import { Bell, Box, Flex, HStack, Icon, Text } from 'components';
import { displayDate, patternDate } from 'utils/date.utils';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notification: NotificationRow | null;
  isAddMode: boolean;
  isPayg: boolean;
}

const defaultValues: NotificationFormData = {
  timeframe: 'Daily',
  thresholdType: 'Absolute',
  thresholdValue: 1,
  recipients: [],
};

const parseApiError = (err: any): string => {
  if (err?.data?.detail && Array.isArray(err.data.detail)) {
    return err.data.detail.map((e: any) => e.msg || e.message).join(', ');
  }
  if (err?.data?.detail && typeof err.data.detail === 'string') {
    return err.data.detail;
  }
  return 'An unexpected error occurred. Please try again.';
};

export function NotificationDrawer({
  isOpen,
  onClose,
  notification,
  isAddMode,
  isPayg,
}: NotificationDrawerProps) {
  const { selectedAccountId } = useCore();
  const { success, error } = useToastComponent();
  const [isSaving, setIsSaving] = useState(false);

  const [addNotification] = useAddNotificationMutation();
  const [patchNotification] = usePatchNotificationMutation();

  const isPreset = notification?.isPreset ?? false;

  const form = useForm<NotificationFormData>({
    defaultValues: notification
      ? {
          timeframe: notification.timeframe,
          thresholdType: notification.thresholdType,
          thresholdValue: Number(notification.thresholdValue),
          recipients: notification.recipients,
        }
      : defaultValues,
  });

  // Reset form when drawer opens with new notification data
  useEffect(() => {
    if (isOpen) {
      if (notification) {
        form.reset({
          timeframe: notification.timeframe,
          thresholdType: notification.thresholdType,
          thresholdValue: Number(notification.thresholdValue),
          recipients: notification.recipients,
        });
      } else {
        form.reset(defaultValues);
      }
    }
  }, [isOpen, notification, form]);

  const handleSave = useCallback(async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    const formData = form.getValues();
    setIsSaving(true);

    try {
      const notificationData: NotificationRow = {
        id: notification?.id ?? '',
        timeframe: formData.timeframe,
        thresholdType: formData.thresholdType,
        thresholdValue: formData.thresholdValue,
        recipients: formData.recipients,
        isPreset: isPreset,
      };

      const apiPayload = transformUIToApi(notificationData);

      if (isAddMode) {
        await addNotification({
          account: selectedAccountId,
          ...apiPayload,
        }).unwrap();
        success({ description: 'Notification saved' });
      } else {
        await patchNotification({
          account: selectedAccountId,
          notification_id: notification!.id,
          ...apiPayload,
        }).unwrap();
        success({ description: 'Notification updated' });
      }
      onClose();
    } catch (err) {
      error({
        title: isAddMode
          ? 'Failed to add notification'
          : 'Failed to update notification',
        duration: 30000,
        description: parseApiError(err),
      });
    } finally {
      setIsSaving(false);
    }
  }, [
    form,
    notification,
    isPreset,
    isAddMode,
    onClose,
    addNotification,
    selectedAccountId,
    success,
    patchNotification,
    error,
  ]);

  const handleClose = useCallback(() => {
    form.reset();
    onClose();
  }, [form, onClose]);

  return (
    <ExoSideDrawer
      isOpen={isOpen}
      onClose={handleClose}
      title={isAddMode ? 'Add Notification' : 'Edit Notification'}
      onSave={handleSave}
      saveDisabled={isSaving}
      isLoading={isSaving}
      saveLabel={isAddMode ? 'Add Notification' : 'Save'}
      cancelLabel="Cancel"
    >
      <FormProvider {...form}>
        <NotificationDrawerContent
          isPreset={isPreset}
          isPayg={isPayg}
          notification={notification}
          isAddMode={isAddMode}
        />
      </FormProvider>
    </ExoSideDrawer>
  );
}

function NotificationDrawerContent({
  isPreset,
  isPayg,
  notification,
  isAddMode,
}: {
  isPreset: boolean;
  isPayg: boolean;
  notification: NotificationRow | null;
  isAddMode: boolean;
}) {
  const wasTriggered = !isAddMode && notification?.triggered;
  const { totalAcquiredRPU } = useCore();

  const formatTriggeredDate = (triggeredDate: string | undefined): string => {
    if (!triggeredDate) return '';
    try {
      if (typeof triggeredDate === 'string') {
        const localDate = new Date(triggeredDate + 'Z'); // Adding 'Z' ensures it's treated as UTC
        const localTimeString = localDate.toLocaleString();
        return displayDate(localTimeString, patternDate);
      }
      return displayDate(triggeredDate, patternDate);
    } catch {
      return triggeredDate;
    }
  };

  const triggeredDateFormatted = wasTriggered
    ? formatTriggeredDate(notification?.triggered)
    : '';

  return (
    <Flex
      flexDirection="column"
      height="100%"
      width="100%"
      justifyContent="space-between"
    >
      <Box flex="1" overflowY="auto">
        <NotificationForm
          isPreset={isPreset}
          isPayg={isPayg || totalAcquiredRPU === 0}
        />
      </Box>
      {wasTriggered && (
        <Box
          mt={4}
          pt={4}
          borderTop="1px solid"
          borderColor="border"
          width="100%"
          color="font-secondary"
        >
          <HStack>
            <Icon as={Bell} color="font-secondary" boxSize={4} />
            <Text textStyle="R7">
              This notification was previously triggered
              {triggeredDateFormatted && ` on ${triggeredDateFormatted}`}.{' '}
            </Text>
          </HStack>
          <Text>Editing this notification will reset the trigger.</Text>
        </Box>
      )}
    </Flex>
  );
}
