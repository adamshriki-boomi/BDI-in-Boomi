import {
  Center,
  Divider,
  Grid,
  RenderGuard,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from 'components';

export function Wizard({
  active,
  onChange,
  isValidStep,
  steps,
  isLazy = true,
  lineLength = 130,
}) {
  return (
    <Tabs
      index={active}
      onChange={onChange}
      isLazy={isLazy}
      isManual
      variant="wizard"
    >
      <RenderGuard condition={active !== 4}>
        <TabList py={2} alignItems="center">
          {steps.map(([tab], index) => {
            const selected = index === active;
            const isLastStep = index === steps.length - 1;
            return (
              <RenderGuard key={`tab-list-item-${tab}`} condition={index !== 4}>
                <Grid
                  alignItems="center"
                  templateColumns={
                    isLastStep
                      ? 'msx-content 0px'
                      : `max-content minmax(50px, ${lineLength}px)`
                  }
                >
                  <Tab
                    cursor={isValidStep[index] ? 'pointer' : 'default'}
                    isSelected={selected}
                    isDisabled={!isValidStep[index]}
                    aria-label={tab}
                  >
                    <StepTab name={tab} index={index} />
                  </Tab>
                  {!isLastStep && (
                    <Divider
                      w="full"
                      ml="auto"
                      className={`tab-line${selected ? '-selected' : ''}`}
                    />
                  )}
                </Grid>
              </RenderGuard>
            );
          })}
        </TabList>
      </RenderGuard>

      <TabPanels>
        {steps.map(([tab, TabComponent]) => (
          <TabPanel key={`tab-panels-step-${tab}`}>
            <TabComponent />
          </TabPanel>
        ))}
      </TabPanels>
    </Tabs>
  );
}

function StepTab({ index, name }) {
  return (
    <Center gap={2}>
      <Center
        boxSize={6}
        borderRadius={50}
        borderWidth="1px"
        fontSize="sm"
        className="tab-index"
      >
        {index + 1}
      </Center>
      <Text fontSize="sm">{name}</Text>
    </Center>
  );
}
