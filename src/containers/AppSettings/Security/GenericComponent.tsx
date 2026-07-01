import { PlansIds } from 'api/types';
import {
  Box,
  Crown,
  Flex,
  HStack,
  Icon,
  RenderGuard,
  RiveryButton,
  Text,
} from 'components';
import { EnableFeatureModal } from 'containers/Login/components/EnableFeatureModal';
import { OpenSupport } from 'modules/ModalForm/OpenSupport';
import { useToggle } from 'react-use';
import { useCore } from 'store/core';

export default function GenericComponent({
  icon,
  title,
  text,
  href,
  showContactUs,
  contactText = 'Contact Us',
  component = null,
}) {
  const { plan } = useCore();
  const enterprise = [PlansIds.ENTERPRISE, PlansIds.ENTERPRISE_2025].includes(
    plan,
  ); // TODO remove legacy pricing - keep only enterprise 2025
  return (
    <HStack gap={6} alignItems="start">
      <Icon as={icon} boxSize="50px" />

      <Flex flexDir="column" w="400px">
        <Text color="primary">{title}</Text>
        <Box>
          <Text display="inline">{text}. </Text>
          <RiveryButton
            label="Learn more"
            variant="link"
            href={href}
            target="_blank"
          />
        </Box>
        <RenderGuard condition={showContactUs}>
          <Box pt={2}>
            <RenderGuard condition={enterprise} fallback={<SecurityPLG />}>
              <OpenSupport variant="primary" label={contactText} />
            </RenderGuard>
          </Box>
        </RenderGuard>
        <RenderGuard condition={component}>
          {enterprise ? component : <SecurityPLG pt={2} />}
        </RenderGuard>
      </Flex>
    </HStack>
  );
}

function SecurityPLG({ ...props }) {
  const [openUpgradeModal, toggleUpgradeModal] = useToggle(false);
  return (
    <Box {...props}>
      <RiveryButton
        variant="primary"
        width="max-content"
        label="Upgrade"
        leftIcon={<Icon as={Crown} w={5} h={5} color="coral" />}
        onClick={toggleUpgradeModal}
      />
      <EnableFeatureModal
        feature="security"
        show={openUpgradeModal}
        toggle={toggleUpgradeModal}
      />
    </Box>
  );
}
