import { useBoolean } from '@chakra-ui/react';
import { exportToFile, getSignedFileName } from 'api/endpoints/files.api';
import { ILogicStep } from 'api/types';
import {
  Box,
  Center,
  ConfirmationModal,
  GridBox,
  ListItem,
  RiveryInfoTooltip,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  UnorderedList,
} from 'components';
import RiveryButton from 'components/Buttons/RiveryButton';
import { importFile } from 'components/Form';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  generateDraftId,
  remoteFileApi,
  useGetRemoteFileByIdQuery,
  useUpdateRemoteFileDraftByIdMutation,
} from 'store/remoteFiles';
import { useGetRequirementsQuery } from 'store/requirements';
import { useGetResourcesQuery } from 'store/resources';
import { useGetTemplatesQuery } from 'store/templates';
import { useStepActions } from './hooks/useStepActions';
import { useStepContentForm } from './hooks/useStepContentForm';
import { PackagesSelector } from './PackagesSelector';
import { ResourceSelector } from './ResourceSelector';
import { CodeEditor } from './ScriptEditor/CodeEditor';

const PythonEditor = React.memo(CodeEditor);
type BlockPythonProps = {
  node: ILogicStep;
};

enum PanelTabs {
  SCRIPT,
  PACKAGES,
}

export function normalizeFileName(fileName: string, replaceWith = '_') {
  return fileName.replace(/[-[/\]{}()*+?,\\^$|#\s]/g, replaceWith);
}

export function BlockPython({ node }: BlockPythonProps) {
  const { data: requirements } = useGetRequirementsQuery();
  const { data: template } = useGetTemplatesQuery();
  const { data: responseResources } = useGetResourcesQuery();
  const resources = responseResources?.logicode || [];
  const { content, hash_key_init, step_name } = node;
  const { onSubmitHandler } = useStepContentForm(node);
  const [activeTab, setActiveTab] = useState(PanelTabs.SCRIPT);
  const { updateContent } = useStepActions(hash_key_init);
  useLogicodeUpdater({
    updateContent,
    resourceId: resources?.[0]?._id,
    logicodeResource: content?.logicode_resource,
    hasResources: resources?.length > 0,
  });

  const file_cross_id = content?.file_cross_id;
  const {
    isLoading: scriptLoading,
    data: { content: scriptContent } = {
      content: '',
    },
  } = useGetRemoteFileByIdQuery(file_cross_id, {
    skip: !file_cross_id,
  });

  const [updateFile] = useUpdateRemoteFileDraftByIdMutation();
  const [confirm, toggleConfirm] = useBoolean(false);
  const fileName = normalizeFileName(step_name);
  const onContentReset = useDraftHandler(
    updateContent,
    `${fileName}_script.py`,
  );

  useEffect(() => {
    if (!file_cross_id && template) {
      onContentReset(template);
    }
  }, [file_cross_id, onContentReset, template]);
  const updatFileName = useCallback(
    async id => {
      await getSignedFileName(`/logicode_file/${id}`, updateContent);
    },
    [updateContent],
  );

  useEffect(() => {
    if (file_cross_id && Boolean(!content.file_name)) {
      updatFileName(file_cross_id);
    }
  }, [content.file_name, file_cross_id, updatFileName]);

  const importPythonFile = useCallback(
    () => importFile(onContentReset, '.py'),
    [onContentReset],
  );

  // Code Editor Handlers
  const onCodeChange = useCallback(
    newContent => {
      updateFile({
        id: file_cross_id,
        content: newContent,
      });
    },
    [file_cross_id, updateFile],
  );
  const onContentChange = file_cross_id ? onCodeChange : onContentReset;

  return (
    <Box as="form" onSubmit={onSubmitHandler} p="3">
      <GridBox h="full" position="relative">
        <Tabs
          isLazy
          index={activeTab}
          onChange={setActiveTab}
          id={`python-${hash_key_init}`}
        >
          <TabList>
            <Tab>Script</Tab>
            <Tab>Packages</Tab>

            <ResourceSelector
              resources={resources}
              onSelect={({ _id: logicode_resource }) =>
                updateContent({ logicode_resource })
              }
              selected={content?.logicode_resource}
            />
          </TabList>
          <TabPanels>
            <TabPanel px="0">
              {confirm ? (
                <ConfirmationModal
                  show
                  title="Overwrite Python Script?"
                  variant="error"
                  onConfirm={() => {
                    toggleConfirm.off();
                    importPythonFile();
                  }}
                  onClose={toggleConfirm.off}
                  confirmLabel="Yes, Overwrite"
                  cancelLabel="Cancel"
                >
                  <Center>You won't be able to undo.</Center>
                  <Center>
                    <RiveryButton
                      variant="link"
                      label="Click to download"
                      p={0}
                      mr={1}
                      onClick={() =>
                        exportToFile(scriptContent, content.file_name)
                      }
                    />
                    for backup (recommended).
                  </Center>
                </ConfirmationModal>
              ) : null}
              <GridBox>
                <PythonEditor
                  title="Python Script"
                  titleOverlay={
                    <RiveryInfoTooltip
                      description={
                        <UnorderedList pl={3} mt={3}>
                          <ListItem>
                            The Python script is not encrypted in any way.
                            Please avoid using credentials in the script.
                          </ListItem>
                          <ListItem>
                            The Python script runs according to user
                            configurations. Users are responsible for any
                            changes to the table, schema, or data that occur due
                            to the script.
                          </ListItem>
                        </UnorderedList>
                      }
                    />
                  }
                  titleModal={`Python script - ${step_name}`}
                  fileName={content.file_name ?? `${step_name}.py`}
                  value={scriptContent}
                  type="Python"
                  hash={hash_key_init}
                  controls={
                    <RiveryButton
                      label="Import file"
                      aria-label={`import script to ${step_name}`}
                      variant="primary"
                      size="small"
                      ml="auto"
                      onClick={
                        file_cross_id && scriptContent !== template
                          ? toggleConfirm.toggle
                          : importPythonFile
                      }
                    />
                  }
                  path={
                    content?.file_name &&
                    `${hash_key_init}-${content.file_name}`
                  }
                  language="python"
                  readOnly={scriptLoading}
                  onChange={onCodeChange}
                  onContentChange={onContentChange}
                  isLoadingContent={scriptLoading}
                  maxLines={5}
                />
              </GridBox>
            </TabPanel>
            <TabPanel px="0">
              <PackagesSelector
                requirements={requirements}
                onChange={additional_packages =>
                  updateContent({ additional_packages })
                }
                userRequirements={content.additional_packages ?? ''}
                step={step_name}
                mt={3}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </GridBox>
    </Box>
  );
}

function useDraftHandler(
  updateContent,
  defaultFileName = 'script.py',
): (content: string, fileName?: string) => void {
  const dispatch = useDispatch();
  const [updateFile] = useUpdateRemoteFileDraftByIdMutation();

  return useCallback(
    async (content, fileName = defaultFileName) => {
      const file_cross_id = generateDraftId();

      await dispatch(
        remoteFileApi.endpoints.getRemoteFileById.initiate(
          file_cross_id,
        ) as any,
      );
      return updateFile({ id: file_cross_id, content }).then(() => {
        updateContent({
          file_cross_id,
          file_name: normalizeFileName(fileName),
        });
      });
    },
    [updateContent, defaultFileName, updateFile, dispatch],
  );
}

function useLogicodeUpdater({
  updateContent,
  resourceId,
  logicodeResource,
  hasResources,
}) {
  const isSameResource = Boolean(String(resourceId) === logicodeResource);
  const shouldUpdateContent =
    logicodeResource === undefined && hasResources && !isSameResource;

  useEffect(() => {
    if (shouldUpdateContent) {
      updateContent({ logicode_resource: resourceId });
    }
  }, [resourceId, shouldUpdateContent, updateContent]);
}
