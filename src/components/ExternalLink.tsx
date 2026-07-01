import { RiveryButton, RiveryButtonProps } from 'components';

export const ExternalLink = ({
  icon = null,
  url,
  ...rest
}: RiveryButtonProps & { icon?; url }) => {
  return (
    <RiveryButton
      leftIcon={icon}
      href={url}
      target="_blank"
      variant="link"
      fontStyle="R8"
      fontWeight="normal"
      {...rest}
    />
  );
};
