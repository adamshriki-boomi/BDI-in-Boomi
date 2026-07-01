import SvgVpn from 'components/Icons/components/Vpn';
import GenericComponent from './GenericComponent';

export default function VPN() {
  return (
    <GenericComponent
      icon={SvgVpn}
      title="VPN"
      text="Connect securely to via Virtual Private Network (VPN)"
      href="https://help.boomi.com/docs/Atomsphere/Data_Integration/Security/RemoteAccess/AccessMethods/integrating-data-integration-with-vpn"
      showContactUs={false}
    />
  );
}
