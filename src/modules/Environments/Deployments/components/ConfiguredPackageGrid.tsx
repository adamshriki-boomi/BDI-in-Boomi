import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Center,
  Divider,
  Flex,
  HStack,
  Icon,
  Text,
} from '@chakra-ui/react';
import { Box, EnvironmentsIcon, SmallConfetti, SortRight } from 'components';
import RiveryAlert from 'components/Alert/Alert';
import { RiverCheckboxProps, RiveryCheckbox } from 'components/Form';
import { PageOverlaySpinner } from 'components/Loaders/Loader';
import {
  useGetEnvironmentsQuery,
  useLazyGetEnvironmentsTotalsQuery,
} from 'modules/Environments/environments.query';
import { useCallback, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useCore } from 'store/core';
import { getOId } from 'utils/api.sanitizer';
import { compare } from 'utils/array.utils';
import { useGetFormValues } from './helpers';

enum NormalizedName {
  river_groups = 'Groups',
  groups = 'Groups',
  templates = 'Kits',
  files = 'Files',
  rivers = 'Data Flows',
  variables = 'Variables',
  connections = 'Connections',
  dataframes = 'Dataframes',
  recipes = 'Blueprints',
  recipe_files = 'Blueprint Files',
}

export function ConfiguredPackageGrid({ packageConfig }) {
  const { selectedAccountId } = useCore();
  const { control } = useFormContext();
  const { isNew } = packageConfig;
  const { name, sourceEnv, targetEnv } = useGetFormValues(control);

  const [getEnvironmentTotals] = useLazyGetEnvironmentsTotalsQuery();
  const [totals, setTotals] = useState(null);
  const fetchTotals = useCallback(async () => {
    const res: any = await getEnvironmentTotals({
      envId: sourceEnv,
      selectedAccountId,
    });
    setTotals(res?.data);
  }, [getEnvironmentTotals, selectedAccountId, sourceEnv]);

  useEffect(() => {
    if (sourceEnv && !totals) {
      fetchTotals();
    }
  }, [fetchTotals, getEnvironmentTotals, sourceEnv, totals]);

  return (
    <Center pt={12} px={12} alignItems="start" gap={6}>
      <Flex direction="column" gap={3} px={8} w="50%" maxWidth={600}>
        <Header isNew={isNew} />
        <Box>
          <PackageDescription name="Package Name" value={name} icon={false} />
          <PackageDescription name="Source Environment" value={sourceEnv} />
          <PackageDescription name="Target Environment" value={targetEnv} />
          <PackageEntities packageConfig={packageConfig} totals={totals} />
        </Box>
      </Flex>
      <Center height="70vh">
        <Divider orientation="vertical" />
      </Center>
      <Flex
        maxWidth={600}
        w="50%"
        direction="column"
        gap={3}
        fontSize="sm"
        color="font-secondary"
        px={8}
      >
        <Flex direction="column" gap={2}>
          <Text textStyle="M6" color="primary">
            What else is included...
          </Text>
          <Text>
            The following objects are linked to your selected objects and will
            be included in your package. To exclude any of them, deselect the
            corresponding checkboxes.
          </Text>
          <RiveryAlert
            variant="warning-light"
            description="Note that excluding items may prevent other processes from running"
          />
        </Flex>
        <Entities packageConfig={packageConfig} />
      </Flex>
    </Center>
  );
}

function Header({ isNew }) {
  return isNew ? (
    <Flex textStyle="B3" color="primary" direction="column">
      <HStack>
        <Text>Congrats!</Text>
        <Icon as={SmallConfetti} />
      </HStack>
      <Text>You have a new package</Text>
    </Flex>
  ) : (
    <Flex fontSize="xl" fontWeight="bold" color="primary" direction="column">
      <HStack>
        <Text>Package was configured.</Text>
      </HStack>
      <Text>Deploy or save to apply changes.</Text>
    </Flex>
  );
}

function PackageDescription({ name, value, icon = true }) {
  const { data: environmentsArray } = useGetEnvironmentsQuery('');
  const environment = environmentsArray.find(compare('_id', value));

  const envName = environment?.environment_name;
  const color = environment?.color;

  return (
    <HStack
      py={3}
      justify="space-between"
      fontSize="sm"
      color="font"
      borderBottom="1px solid"
      borderBottomColor="gray.300"
    >
      <Text>{name}</Text>
      <HStack w="calc(100% - 150px)">
        {icon ? <Icon ml="auto" as={EnvironmentsIcon} color={color} /> : null}
        <Text
          textStyle="M7"
          whiteSpace="nowrap"
          overflow="hidden"
          textOverflow="ellipsis"
          ml="auto"
        >
          {envName ?? value}
        </Text>
      </HStack>
    </HStack>
  );
}

function PackageEntities({ packageConfig, totals }) {
  if (totals) {
    return (
      <Box py={2}>
        {Object.entries(totals).map(([key, value], idx) => {
          const name = NormalizedName?.[key] ?? key;
          const nameInPackage = key === 'groups' ? 'river_groups' : key;
          return name ? (
            <HStack
              fontSize="sm"
              color="font"
              justify="space-between"
              py={2}
              key={idx}
            >
              <Text textTransform="capitalize">{name}</Text>
              <HStack>
                <Text textStyle="M7">
                  {packageConfig?.totals?.[nameInPackage] ?? 0}
                </Text>
                <Text
                  {...{ marginInlineStart: '0.2rem!important' }}
                  color="font-secondary"
                >
                  <>/ {value}</>
                </Text>
              </HStack>
            </HStack>
          ) : null;
        })}
      </Box>
    );
  }
  return <PageOverlaySpinner />;
}

function Entities({ packageConfig }) {
  const formApi = useFormContext();

  const onExcludeAll = useCallback(
    (target, entity) => {
      const mapAllExcluded = Object.assign(
        {},
        ...(Object.entries(packageConfig[entity]) as any).map(
          ([id, { related_type }]) => {
            if (related_type !== 'original')
              return {
                [id]: target.checked,
              };
            return null;
          },
        ),
      );
      formApi?.setValue(
        'excluded_entities',
        { [entity]: mapAllExcluded },
        { shouldDirty: true },
      );
    },
    [packageConfig, formApi],
  );
  if (
    packageConfig &&
    packageConfig?.totals_related &&
    Boolean(Object.values(packageConfig.totals_related)?.length)
  ) {
    return (
      <Box
        overflow="auto"
        maxHeight="50vh"
        border="1px"
        borderColor="gray.200"
        p={4}
        borderRadius="4px"
      >
        {Object.keys(packageConfig.totals_related)?.map((entity, idx) => {
          const name = NormalizedName[entity] ?? entity;
          const details: any = packageConfig[entity];
          const count = (Object.entries(details) as any).filter(
            ([_, { related_type }]) => related_type !== 'original',
          )?.length;
          return count > 0 ? (
            <Accordion key={idx} allowMultiple allowToggle>
              <AccordionItem border="none">
                {({ isExpanded }) => (
                  <>
                    <ActionToggle
                      label={`${count} ${name}`}
                      name={name}
                      onChange={({ target }) => onExcludeAll(target, entity)}
                      isExpanded={isExpanded}
                    />
                    <AccordionPanel {...{ pt: '0!important' }}>
                      {(Object.entries(details) as any).map(
                        ([
                          id,
                          {
                            entity_name,
                            related_type,
                            related_list,
                            related_id,
                          },
                        ]) => {
                          const notOriginal = related_type !== 'original';
                          return notOriginal ? (
                            <Accordion key={id} allowMultiple allowToggle>
                              <AccordionItem border="none">
                                {({ isExpanded: isChildExpanded }) => (
                                  <>
                                    <ActionToggle
                                      label={entity_name ?? id}
                                      name={`excluded_entities.${entity}.${id}`}
                                      api={formApi}
                                      isExpanded={isChildExpanded}
                                    />
                                    <AccordionPanel {...{ pt: '0!important' }}>
                                      <Text
                                        fontSize="xs"
                                        color="font-secondary"
                                      >
                                        Related to:
                                      </Text>
                                      {related_list ? (
                                        related_list?.map(
                                          ({
                                            related_id: id,
                                            related_type,
                                          }) => {
                                            return (
                                              <Related
                                                key={id}
                                                id={id}
                                                packageConfig={packageConfig}
                                                relatedType={related_type}
                                              />
                                            );
                                          },
                                        )
                                      ) : (
                                        <Related
                                          id={related_id}
                                          packageConfig={packageConfig}
                                          relatedType={related_type}
                                        />
                                      )}
                                    </AccordionPanel>
                                  </>
                                )}
                              </AccordionItem>
                            </Accordion>
                          ) : null;
                        },
                      )}
                    </AccordionPanel>
                  </>
                )}
              </AccordionItem>
            </Accordion>
          ) : null;
        })}
      </Box>
    );
  }
  return null;
}

function Related({ id, packageConfig, relatedType }) {
  const entitId = typeof id == 'string' ? id : getOId(id);
  const name = packageConfig?.[relatedType]?.[entitId]?.entity_name ?? entitId;
  return (
    <Text key={id} fontSize="xs" color="font-secondary">
      {name}
    </Text>
  );
}

function ActionToggle({
  label,
  name,
  isExpanded = false,
  ...rest
}: RiverCheckboxProps & { isExpanded?: boolean }) {
  return (
    <AccordionButton _focus={{ boxShadow: 'none' }} pl={0}>
      <HStack>
        <Icon
          as={SortRight}
          w={3}
          h={3}
          transform={isExpanded && 'rotate(90deg)'}
        />
        <RiveryCheckbox
          textTransform="capitalize"
          defaultChecked
          label={label}
          labelColor="font"
          name={name}
          {...rest}
        />
      </HStack>
    </AccordionButton>
  );
}
