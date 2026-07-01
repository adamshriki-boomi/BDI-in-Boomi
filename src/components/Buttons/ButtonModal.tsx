import { RiveryModal, RiveryModalProps } from 'components';
import React from 'react';
import { useToggle } from 'react-use';

type Props = {
  header: string;
  button: JSX.Element;
};
export function ButtonModal({
  header,
  button,
  ...rest
}: Props & Partial<RiveryModalProps>) {
  const [show, toggle] = useToggle(false);

  const onOpen = (data: any) => {
    toggle(true);
  };

  return (
    <>
      {React.cloneElement(button, { onClick: onOpen })}
      <RiveryModal
        show={show}
        toggle={toggle}
        ariaLabel="Logic step Error"
        title={header}
        {...rest}
      />
    </>
  );
}
