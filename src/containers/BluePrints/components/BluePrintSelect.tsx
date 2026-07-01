import {
  BlueprintBuildHover,
  BlueprintList,
  BlueprintListHover,
  BlueprintYaml,
  Center,
  Drawer,
  DrawerOverlay,
  Grid,
  RenderGuard,
  Text,
} from 'components';
import { SelectionBox } from 'components/SelectionBox';
import { ActionSelectorTags } from 'utils/tracking.tags';
import { getQueryParams } from 'hooks/router';
import {
  useIsBlueprintSelected,
  useSttSource,
} from 'modules/SourceTarget/components/form/form.hooks';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useEffectOnce } from 'react-use';
import { AddBlueprintContent, BlueprintBody } from './AddBlueprint';
import SelectBlueprint from './SelectRecipeDropdown';

enum ViewTypes {
  DEFAULT = 'default',
  COPILOT = 'copilot',
  BLUEPRINT = 'blueprint',
  YAML = 'yaml',
}

const viewTypes = {
  [ViewTypes.COPILOT]: BlueprintBody,
  [ViewTypes.BLUEPRINT]: SelectBlueprint,
  [ViewTypes.YAML]: SelectBlueprint,
  [ViewTypes.DEFAULT]: DefaultView,
};

export default function BluePrintSelect() {
  const [view, setView] = useState(null);
  const source = useSttSource();
  const hasBlueprintId = useIsBlueprintSelected();

  const Component = viewTypes?.[view];
  const { selected_source, chat_id, blueprint_id } = getQueryParams([
    'selected_source',
    'chat_id',
    'blueprint_id',
  ]);

  const { state }: any = useLocation();

  useEffectOnce(() => {
    if (source.name) {
      if (hasBlueprintId || blueprint_id || state?.select_blueprint) {
        setView(ViewTypes.BLUEPRINT);
      } else if ((selected_source && chat_id) || state?.show_copilot) {
        setView(ViewTypes.COPILOT);
      } else if (state?.show_yaml) {
        setView(ViewTypes.YAML);
      } else {
        setView(ViewTypes.DEFAULT);
      }
    }
  });
  return (
    <RenderGuard condition={view}>
      <Component
        s2t={view === ViewTypes.COPILOT}
        setView={setView}
        chatId={chat_id}
      />
      <Drawer
        variant="semifull"
        isOpen={view === ViewTypes.YAML}
        placement="right"
        onClose={() => setView(ViewTypes.BLUEPRINT)}
      >
        <DrawerOverlay />
        <AddBlueprintContent
          selectedBlueprint={null}
          toggle={() => setView(ViewTypes.BLUEPRINT)}
          setSelectedBlueprint={() => setView(ViewTypes.BLUEPRINT)}
          showRedirectToRiver={false}
        />
      </Drawer>
    </RenderGuard>
  );
}

function DefaultView({ setView }) {
  return (
    <Center flexDir="column" pt={20}>
      <Text textStyle="M4" color="primary">
        How do you want to set up your Data Source?
      </Text>
      <Text color="font-secondary">
        Select one of the options below as a first step on creating a Data Flow
      </Text>
      <Grid mt={6} templateColumns="repeat(2, 1fr)" gap={4}>
        <SelectionBox
          icon={BlueprintList}
          hoveredIcon={BlueprintListHover}
          title="Select Existing Blueprint"
          text="Select a blueprint from a pre-existing list, and use it to create your Data Flow"
          onClick={() => setView(ViewTypes.BLUEPRINT)}
          data-pendo-id={ActionSelectorTags.SELECT_EXISTING_CARD}
        />
        <SelectionBox
          icon={BlueprintYaml}
          hoveredIcon={BlueprintBuildHover}
          title="Build From Scratch"
          text="Create your blueprint from the beginning and tailor it to your needs"
          onClick={() => setView(ViewTypes.YAML)}
          data-pendo-id={ActionSelectorTags.BUILD_FROM_SCRATCH_CARD}
        />
      </Grid>
    </Center>
  );
}
