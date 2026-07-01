import SvgConnectivity from 'components/Icons/components/Connectivity';
import GenericComponent from './GenericComponent';

export default function PrivateLink() {
  return (
    <GenericComponent
      icon={SvgConnectivity}
      title="Private Link"
      text="Connect via AWS/Azure Private Link or Google Private Service Connect"
      href="https://help.boomi.com/docs/Atomsphere/Data_Integration/Security/RemoteAccess/AccessMethods/create-aws-privatelink"
      showContactUs={false}
    />
  );
}
