import { INotification } from './Usage/notifications.query';

export interface NotificationRow {
  id: string;
  timeframe: string;
  thresholdType: string;
  thresholdValue: number | string;
  recipients: string[];
  updated_at?: string;
  updated_by?: string;
  isPreset?: boolean;
  isNew?: boolean;
  triggered?: string;
}

// Helper to capitalize first letter
const capitalize = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Helper to lowercase
const lowercase = (str: string): string => {
  if (!str) return str;
  return str.toLowerCase();
};

// Helper function to transform API notification to UI format
export const transformApiToUI = (
  notification: INotification,
  subscriptionStartDate,
): NotificationRow => ({
  id: notification._id,
  timeframe:
    notification.trigger_timeframe === 'system_default'
      ? 'Total'
      : capitalize(notification.trigger_timeframe),
  thresholdType: capitalize(notification.trigger_type),
  thresholdValue: notification.trigger_value,
  recipients: notification.recipients,
  updated_at:
    notification.trigger_timeframe === 'system_default' &&
    !notification.updated_at
      ? subscriptionStartDate
      : notification.updated_at,
  updated_by:
    notification.trigger_timeframe === 'system_default'
      ? 'System Automation'
      : notification.updated_by,
  triggered: notification.triggered,
  isPreset: notification.trigger_timeframe === 'system_default',
});

// Helper function to transform UI notification to API format
// Note: updated_at and updated_by are server-managed and should not be sent
export const transformUIToApi = (notification: NotificationRow) => {
  return {
    trigger_timeframe: notification?.isPreset
      ? 'system_default'
      : lowercase(notification.timeframe),
    trigger_type: lowercase(notification.thresholdType),
    trigger_value: String(notification.thresholdValue),
    recipients: notification.recipients,
    type: 'usage',
  };
};
