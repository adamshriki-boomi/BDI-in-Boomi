import { useEffect } from 'react';
import { useCoreActions } from 'store/core';

export const enum TabsEvents {
  LOGOUT = 'logout',
  LOGIN = 'login',
}

const ChannelRivery = 'rivery_tabs';

export const sendAllTabsEvent = (event: TabsEvents) => {
  const channel = new BroadcastChannel(ChannelRivery);
  channel.postMessage(event);
  channel.close();
};

export const useTabsCommunication = () => {
  const { signOut } = useCoreActions();

  useEffect(() => {
    const handleMessage = message => {
      if (message.data === TabsEvents.LOGOUT) {
        signOut();
      }
      // else if (message.data === TabsEvents.LOGIN) {
      //   autoSignIn({});
      // }
    };
    const channel = new BroadcastChannel(ChannelRivery);
    channel.addEventListener('message', handleMessage);
    return () => {
      channel.removeEventListener('message', handleMessage);
      channel.close();
    };
  }, [signOut]);
};
