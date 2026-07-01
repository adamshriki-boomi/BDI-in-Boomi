import SvgReverseSsh from 'components/Icons/components/ReverseSsh';
import GenericComponent from './GenericComponent';

export default function ReverseSSH() {
  return (
    <GenericComponent
      icon={SvgReverseSsh}
      title="Reverse SSH"
      text="Connect through reverse SSH tunnel"
      href="https://help.boomi.com/docs/Atomsphere/Data_Integration/Security/RemoteAccess/AccessMethods/reverse-ssh-tunnel"
      showContactUs
      contactText="Request Setup"
    />
  );
}
