import {
  Flex,
  HStack,
  Icon,
  InfoTooltip,
  RiveryInfoTooltip,
  Text,
} from 'components';
import { NarrowRow } from 'components/Drawer/DrawerStatusRow';

export const PRICING_CATEGORY_MAPPING = {
  api: 'API',
  files: 'Files',
  rdbms: 'Database',
  actions: 'Actions',
  cdc: 'Change Data Capture',
  webhook: 'Webhook',
};

export const RunCostSection = ({ data }) => {
  const pricingCategory = data?.pricing_category;
  const rpu = data?.rpu;

  // Handle high frequency suffix
  let displayValue;
  if (pricingCategory?.endsWith('-high-frequency')) {
    const baseCategory = pricingCategory.replace('-high-frequency', '');
    const baseName = PRICING_CATEGORY_MAPPING[baseCategory];
    displayValue = baseName ? `${baseName} - High Frequency` : null;
  } else {
    displayValue = PRICING_CATEGORY_MAPPING[pricingCategory];
  }

  // Don't render the section if pricing category is not in the mapping or rpu is missing
  if (!displayValue || rpu == null) {
    return null;
  }

  const bduCount = Number(rpu).toFixed(6);

  return (
    <Flex flexDir="column">
      <HStack
        bgColor="background-secondary"
        p={2}
        mb={4}
        borderBottom="1px"
        borderBottomColor="gray.300"
        alignItems="center"
      >
        <Text fontWeight="medium">Run Cost</Text>
      </HStack>

      <NarrowRow name="Pricing Category" value={displayValue} />

      <NarrowRow
        name={
          <HStack h={5}>
            <Text>BDU Count</Text>
            <RiveryInfoTooltip
              extraProps={{ placement: 'right' }}
              buttonProps={{ minW: 0 }}
              icon={<Icon as={InfoTooltip} boxSize="14px" />}
              description="BDU credits (also known as Rivery Pricing Unit / RPU credits) are charged based on platform usage, allowing you to scale cost effectively."
            />
          </HStack>
        }
        value={bduCount}
      />
    </Flex>
  );
};
