import { createRiveryApiV1 } from 'store/createRiveryApi';

const ENDPOINT = 'notifications';

export interface INotification {
  _id: string;
  trigger_timeframe: string;
  trigger_type: string;
  trigger_value: string;
  recipients: string[];
  type?: string;
  updated_at?: string;
  updated_by?: string;
  triggered?: string;
}

export interface IAddNotificationPayload {
  account: string;
  trigger_timeframe: string;
  trigger_type: string;
  trigger_value: string;
  recipients: string[];
  type: string;
}

export interface IPatchNotificationPayload {
  account: string;
  notification_id: string;
  trigger_timeframe?: string;
  trigger_type?: string;
  trigger_value?: string;
  recipients?: string[];
  type: string;
}

export interface IDeleteNotificationPayload {
  account: string;
  notification_id: string;
}

export const notificationsApi = createRiveryApiV1
  .enhanceEndpoints({
    addTagTypes: ['AccountNotifications'],
  })
  .injectEndpoints({
    endpoints: builder => ({
      getNotifications: builder.query<INotification[], { account: string }>({
        providesTags: ['AccountNotifications'],
        query: ({ account }) => ({
          url: `/accounts/${account}/${ENDPOINT}`,
        }),
        transformResponse: (response: any) => {
          // Handle different possible response formats
          if (Array.isArray(response)) {
            return response;
          }
          if (response?.items && Array.isArray(response.items)) {
            return response.items;
          }
          if (response?.data && Array.isArray(response.data)) {
            return response.data;
          }
          if (
            response?.notifications &&
            Array.isArray(response.notifications)
          ) {
            return response.notifications;
          }
          // If response is an object but not an array, return empty array
          return [];
        },
      }),
      addNotification: builder.mutation<INotification, IAddNotificationPayload>(
        {
          query: ({ account, ...body }) => ({
            url: `accounts/${account}/${ENDPOINT}`,
            method: 'POST',
            body,
          }),
          invalidatesTags: ['AccountNotifications'],
        },
      ),
      patchNotification: builder.mutation<
        INotification,
        IPatchNotificationPayload
      >({
        query: ({ account, notification_id, ...body }) => ({
          url: `accounts/${account}/${ENDPOINT}/${notification_id}`,
          method: 'PATCH',
          body: {
            ...body,
          },
        }),
        invalidatesTags: ['AccountNotifications'],
      }),
      deleteNotification: builder.mutation<void, IDeleteNotificationPayload>({
        query: ({ account, notification_id }) => ({
          url: `accounts/${account}/${ENDPOINT}/${notification_id}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['AccountNotifications'],
      }),
    }),
  });

export const {
  useGetNotificationsQuery,
  useAddNotificationMutation,
  usePatchNotificationMutation,
  useDeleteNotificationMutation,
} = notificationsApi;
