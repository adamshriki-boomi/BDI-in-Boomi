import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { BlockTypes, ILogicStep } from 'api/types';
import { Box, Flex } from 'components';
import { closestYCenter } from 'components/DragAndDrop';
import { Plg } from 'components/PLG/Plg';
import { Tagger } from 'components/Tracking/Tagger';
import { useIsRiverButtonsDisabled } from 'containers/River/components/RiverFooter';
import {
  ComponentsTypes,
  SelectedTarget,
} from 'containers/River/Targets/SelectedTarget';
import { useStepTypeByTargetType } from 'modules/Datasources/useLogicTargets';
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useEffectOnce } from 'react-use';
import { useCore } from 'store/core';
import { useGroupsLoader } from 'store/groups';
import {
  isRiverDraft,
  useRiver,
  useRiverActions,
  useRiverRun,
} from 'store/river';
import { findStepByHash } from 'store/river/utils/steps.builder';
import { useRivers, useRiversLoader } from 'store/rivers';
import { templatesApi } from 'store/templates';
import { getHashKey, getOId } from 'utils/api.sanitizer';
import { AddStepButton, DropZone } from './components/BlockAction';
import { EmptyRiver } from './components/EmptyRiver';
import { useStepActions } from './components/hooks/useStepActions';
import { DraggableTreeNode, TreeNode } from './components/TreeNode';
import './Logic.scss';

const useFirstRiverCreation = (onAddStep: (stepIndex: number) => void) => {
  const { location } = useHistory<any>();
  const isFirstRiver = location?.state?.firstRiver;
  const { selectedLogicSteps } = useRiver();
  const { riversArray } = useRivers();
  const { updateContent: updateFirstStepLogic } = useStepActions(
    selectedLogicSteps[0]?.hash_key_init,
  );
  useEffectOnce(() => {
    if (isFirstRiver) {
      onAddStep(0);
    }
  });

  useEffect(() => {
    if (isFirstRiver && riversArray) {
      updateFirstStepLogic({
        block_primary_type: BlockTypes.RIVER,
        block_type: BlockTypes.RIVER,
        river_id: riversArray[0]?.cross_id,
      });
    }
  }, [isFirstRiver, riversArray, updateFirstStepLogic]);
};

export function useIsRiverRunning() {
  const { hasDetails } = useRiverRun();
  const { isRunDone } = useIsRiverButtonsDisabled();
  return hasDetails && !isRunDone;
}

export const Logic = React.memo(LogicComponent);
export function LogicComponent() {
  // This is the root level of the new app. We add a subscription to the templates service here
  // so it will be fetched once and not removed from the store
  templatesApi.endpoints.getTemplates.useQuerySubscription();

  const { userMainTarget, envId } = useCore();
  const logicMainTarget = useStepTypeByTargetType(userMainTarget);
  const isRiverRunning = useIsRiverRunning();
  const { selectedLogicSteps, isVersionMode, selectedRiverCrossId } =
    useRiver();
  const { addLogicStep, moveStepByTargetHash, moveStep } = useRiverActions();
  const defaultFields =
    SelectedTarget[logicMainTarget]?.[ComponentsTypes.DEFAULT_FIELDS];

  useRiversLoader(envId);
  useGroupsLoader(envId);

  const handleOnAddLogicStep = useCallback(
    stepIndex => {
      addLogicStep({
        userMainTarget: logicMainTarget,
        stepIndex,
        defaultFields,
      });
    },
    [addLogicStep, logicMainTarget, defaultFields],
  );

  useFirstRiverCreation(handleOnAddLogicStep);

  const [draggedStep, setDraggedStep] = useState<ILogicStep | null>(null);

  const moveHandler = useCallback(
    (sourceId, direction, outside = false) =>
      moveStep({
        sourceId,
        direction,
        outside,
      }),
    [moveStep],
  );
  const isEmptyRiver = selectedLogicSteps?.length === 0;
  const sensors = useSensors(useSensor(PointerSensor));
  const dropZoneId =
    selectedLogicSteps?.[0] && `${getHashKey(selectedLogicSteps?.[0])}.before`;
  return (
    <Box as="fieldset" minW={0} disabled={isVersionMode || isRiverRunning}>
      {!isVersionMode && (
        <Plg
          page="logic"
          style={{ right: '10px', top: '10px' }}
          defaultHiddenPlg={!isRiverDraft(getOId(selectedRiverCrossId))}
        />
      )}
      <Flex flexDir="column" py={4} px={3}>
        {isEmptyRiver ? (
          <EmptyRiver onAddStep={() => handleOnAddLogicStep(0)} />
        ) : null}
        <DndContext
          sensors={sensors}
          collisionDetection={closestYCenter}
          onDragStart={ev => {
            setDraggedStep(
              findStepByHash(selectedLogicSteps, ev.active.id.split('.')[0]),
            );
          }}
          // onDragOver={ev => {
          // add code here for more advanced activation
          // }}
          onDragCancel={() => setDraggedStep(undefined)}
          onDragEnd={ev => {
            setDraggedStep(undefined);
            if (!ev?.over?.id) {
              return;
            }
            const [activeId] = ev.active.id.split('.');
            const [overId, dropPosition] = ev.over.id.split('.');
            if (activeId === overId) {
              return;
            }
            moveStepByTargetHash({
              sourceId: activeId,
              targetId: overId,
              mode: dropPosition,
            });
          }}
        >
          <DropZone hashKey={dropZoneId} />

          {selectedLogicSteps?.map((step, stepIndex) => {
            const isLast = selectedLogicSteps.length - 1 === stepIndex;
            return (
              <div key={getHashKey(step)}>
                <DraggableTreeNode
                  node={step}
                  moveHandler={
                    (!isVersionMode || !isRiverRunning) && moveHandler
                  }
                  depth={0}
                  index={`0.${stepIndex}`}
                  stepsLength={selectedLogicSteps?.length}
                />
                <Tagger tags={{ 'add-logic-step': isLast ? 'end' : 'inner' }}>
                  <AddStepButton
                    hashKey={getHashKey(step)}
                    stepIndex={stepIndex + 1}
                    isLast={isLast}
                    disabled={isVersionMode || isRiverRunning}
                    label={isLast ? 'Add Logic Step' : 'Add Inner Logic Step'}
                    handleOnAddLogicStep={handleOnAddLogicStep}
                  />
                </Tagger>
              </div>
            );
          })}
          <DragOverlay>
            {draggedStep && (
              <TreeNode
                node={draggedStep}
                collapsed={true}
                boxProps={{ opacity: 0.8, bgColor: 'white', boxShadow: 'lg' }}
                className="skeleton-box"
                depth={0}
                index="0"
                stepsLength={selectedLogicSteps?.length}
              />
            )}
          </DragOverlay>
        </DndContext>
      </Flex>
    </Box>
  );
}
