import { PlansIds } from 'api/types';
import SvgAuthentication from 'components/Icons/components/Authentication';
import { useGetIsAccountThatIsManagedByBoomi } from 'containers/Settings/Users/users.helpers';
import { useCore } from 'store/core';
import GenericComponent from './GenericComponent';

export default function SSO() {
  const isManagedByBoomi = useGetIsAccountThatIsManagedByBoomi();
  const { plan } = useCore();
  const showContactUs = !(isManagedByBoomi && plan !== PlansIds.BASE_2025);

  return (
    <GenericComponent
      icon={SvgAuthentication}
      title="Single Sign On (SSO)"
      text="Setup SAML Single Sign-On (SSO) by authenticating through your organization’s identity provider"
      href="https://help.boomi.com/docs/Atomsphere/Platform/c-atm-Single_sign-on_with_SAML_authentication_71c031d5-5912-4255-bb8e-61a129afabc1"
      showContactUs={showContactUs}
      contactText="Request SSO Setup"
    />
  );
}
