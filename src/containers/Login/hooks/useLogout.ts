import {
  sendAllTabsEvent,
  TabsEvents,
} from 'containers/Login/AllTabsCommunication';
import { LoginRoutes } from 'containers/Login/LoginRoutes';
import { useHistory } from 'react-router-dom';
import { useCoreActions } from 'store/core';

export const useLogout = (with_redirect_to_login = false) => {
  const { signOut } = useCoreActions();
  const { push } = useHistory();
  return () => {
    signOut();
    if (with_redirect_to_login) {
      push(LoginRoutes.LOGIN_ROOT);
    }
    sendAllTabsEvent(TabsEvents.LOGOUT);
  };
};
