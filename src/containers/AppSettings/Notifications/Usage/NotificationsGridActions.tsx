import { useCallback, useRef, useState } from 'react';
import { NotificationRow } from '../types';
import { useDeleteNotificationMutation } from './notifications.query';
import { useCore } from 'store/core';
import { useToastComponent } from 'hooks/useToast';

const parseApiError = (err: any): string => {
  if (err?.data?.detail && Array.isArray(err.data.detail)) {
    return err.data.detail.map((e: any) => e.msg || e.message).join(', ');
  }
  if (err?.data?.detail && typeof err.data.detail === 'string') {
    return err.data.detail;
  }
  return 'An unexpected error occurred. Please try again.';
};

export const useHandleDeleteNotification = (
  userNotifications: NotificationRow[],
) => {
  const { selectedAccountId } = useCore();
  const { success, error } = useToastComponent();
  const [deleteNotification] = useDeleteNotificationMutation();
  const [isDeleteInProgress, setIsDeleteInProgress] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const rowToDeleteRef = useRef<string | null>(null);

  const performDelete = useCallback(
    async (rowId: string) => {
      setIsDeleteInProgress(true);
      try {
        await deleteNotification({
          account: selectedAccountId,
          notification_id: rowId,
        }).unwrap();
        success({ description: 'Notification successfully deleted' });
        return true;
      } catch (err) {
        error({
          title: 'Failed to delete notification',
          duration: 30000,
          description: parseApiError(err),
        });
        return false;
      } finally {
        setIsDeleteInProgress(false);
      }
    },
    [selectedAccountId, deleteNotification, success, error],
  );

  const handleRowDelete = useCallback((rowId: string) => {
    // Show confirmation modal for all rows
    rowToDeleteRef.current = rowId;
    setShowDeleteModal(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    const rowId = rowToDeleteRef.current;
    if (!rowId) return;

    await performDelete(rowId);
    setShowDeleteModal(false);
    rowToDeleteRef.current = null;
  }, [performDelete]);

  const handleCancelDelete = useCallback(() => {
    setShowDeleteModal(false);
    rowToDeleteRef.current = null;
  }, []);

  return {
    handleRowDelete,
    handleConfirmDelete,
    handleCancelDelete,
    showDeleteModal,
    isDeleteInProgress,
  };
};
