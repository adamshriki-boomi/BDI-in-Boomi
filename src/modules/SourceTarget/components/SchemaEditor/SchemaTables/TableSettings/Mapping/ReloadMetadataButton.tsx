import { Button, forwardRef, useStyleConfig } from '@chakra-ui/react';
import { ChevronDown, Flex, Icon, RefreshIcon } from 'components';
import RiveryDropdown from 'containers/River/RiverLogic/Logic/components/RiveryChakraMenu';
import { useVersionController } from 'modules/Versions/hooks';

const ReloadMetadataMenuButton = forwardRef((props, ref) => {
  const { border, ...rest } = props;
  const buttonStyles = useStyleConfig('Button', {
    variant: 'default',
    size: 'base',
  });
  return (
    <Button
      ref={ref}
      {...rest}
      __css={buttonStyles}
      borderRadius={4}
      p={2}
      aria-label="Reload Metadata"
    >
      <Flex alignItems="center" gap={2}>
        <Icon as={RefreshIcon} />
        Reload Metadata
        <Icon as={ChevronDown} boxSize={4} />
      </Flex>
    </Button>
  );
});

export function ReloadMetadataDropdown({
  schemaInView,
  reloadSchemas,
  setViewingSchema,
}) {
  const { version } = useVersionController();
  const items = [
    {
      value: 'Reload Metadata for Selected Schema',
      onClick: () => reloadSchemas(true),
      isDisabled: Boolean(version) || !schemaInView,
    },
    {
      value: 'Reload Metadata for All Schemas',
      isDisabled: Boolean(version),
      onClick: () => {
        setViewingSchema(null);
        reloadSchemas(false);
      },
    },
  ];

  return (
    <RiveryDropdown
      menuItems={items}
      customMenuButton={ReloadMetadataMenuButton}
      menuListStyle={{
        p: '0px!important',
        boxShadow: '0px 6px 16px 0px rgba(0, 0, 0, 0.12)',
      }}
    />
  );
}
