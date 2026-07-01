import { RiveryButton } from 'components';
import { useCore } from 'store/core';

export function OpenSupport({ ...buttonProps }) {
  const { isAccountInTrial } = useCore();

  return (
    <RiveryButton
      label="Contact Us"
      onClick={() =>
        window.open(
          isAccountInTrial
            ? 'https://rivery.io/contact-us/'
            : 'https://community.boomi.com/s/support',
          '_blank',
        )
      }
      {...buttonProps}
    />
  );
}
