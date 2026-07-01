import { postBody } from 'api/api.proxy';
import { PlansIds } from 'api/types';
import { useCore, useCoreActions } from 'store/core/hooks';
import { isProdDomain } from 'utils/utils';
import { useToastComponent } from '../../hooks/useToast';

declare global {
  interface Window {
    Chargebee: any;
  }
}
export const Chargebee = {
  src: 'https://js.chargebee.com/v2/chargebee.js',
};

const getChargeBeeInstance = (chargebee = window.Chargebee) => {
  if (!window.Chargebee?.inited) {
    const site = isProdDomain()
      ? import.meta.env.VITE_BILLING_SITE
      : import.meta.env.VITE_BILLING_SITE + '-test';
    window.Chargebee.init({
      site,
    });
  }
  return chargebee.getInstance();
};

export function OpenChargebeeCheckout(
  tokenArgs,
  country,
  loginMultiAccount,
  plan = PlansIds.STARTER, // TODO remove legacy pricing - change to Base
  errorToast,
) {
  withChargeBee(chargebeeInstance => {
    chargebeeInstance.openCheckout({
      hostedPage() {
        try {
          return postBody('/subscription/checkout_page', {
            plan_key: plan,
            country: country,
          }).catch(error => {
            const errorMessage = error?.response?.data?.message;
            if (
              errorMessage &&
              errorMessage.includes('subscription already exists')
            ) {
              errorToast({
                duration: 30000,
                description:
                  'Your account already has an active subscription, to reactive your account, go to Manage Billing or contact support.',
              });
            }
          });
        } catch (error) {
          throw error;
        }
      },
      async success(hostedPageId) {
        loginMultiAccount(tokenArgs);
      },
    });
  });
}
export function openChargebeePortal(tokenArgs, loginMultiAccount) {
  withChargeBee(chargebeeInstance => {
    chargebeeInstance.createChargebeePortal().open({
      close: function () {
        loginMultiAccount(tokenArgs);
      },
    });
  });
}
function withChargeBee(func, times = 0) {
  if (window.Chargebee) {
    const chargebeeInstance = getChargeBeeInstance();
    func(chargebeeInstance);
  } else {
    if (times < 5) {
      setTimeout(() => withChargeBee(func, times + 1), 500);
    }
  }
}

export function useChargebeeModal({
  country = null,
  plan = PlansIds.STARTER, // TODO remove legacy pricing - change to Base
  isManage = false,
}) {
  const { selectedAccountId, envId, userId, refreshToken } = useCore();
  const { loginMultiAccount } = useCoreActions();
  const { error } = useToastComponent();
  withChargeBee(chargebeeInstance => {
    if (chargebeeInstance) {
      chargebeeInstance.setPortalSession(() => {
        return postBody('/subscription/portal_page', {});
      });
    }
  });
  const tokenArgs = {
    account_id: { $oid: selectedAccountId },
    env_id: envId,
    user_id: userId,
    refresh_token: refreshToken,
    refresh_subscription: true,
  };
  if (isManage)
    return {
      onManage: () => {
        openChargebeePortal(tokenArgs, loginMultiAccount);
      },
    };
  else
    return {
      onClose: () => {
        OpenChargebeeCheckout(
          tokenArgs,
          country,
          loginMultiAccount,
          plan,
          error,
        );
      },
    };
}
