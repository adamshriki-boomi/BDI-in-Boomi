import { Flex } from 'components';
import { KnowledgeBaseSelect } from 'containers/River/Targets/components/MetaQuery/KnowledgeBaseSelect';
import { RepositorySelect } from 'containers/River/Targets/components/MetaQuery/RepositorySelect';
import { useController, useFormContext } from 'react-hook-form';
import { useEffect, useMemo, useRef } from 'react';
import { useSearchParam } from 'react-use';
import { SettingsHeader } from './commonTargetSettings';

export function TargetKnowledgeHub() {
  const formApi = useFormContext();

  const { field: connectionIdField } = useController({
    name: 'river.properties.target.connection_id',
    control: formApi.control,
  });

  const repositoryId = formApi.watch('river.properties.target.repository_id');
  const knowledgeBaseId = formApi.watch(
    'river.properties.target.knowledge_base_id',
  );
  const prevRepoRef = useRef(repositoryId);

  const repositoryNameFromURL = useSearchParam('repository');
  const kbNameFromURL = useSearchParam('kb');

  const repositoryDefaultOption = useMemo(
    () =>
      repositoryNameFromURL && repositoryId
        ? { value: repositoryId, label: repositoryNameFromURL }
        : null,
    [repositoryNameFromURL, repositoryId],
  );
  const kbDefaultOption = useMemo(
    () =>
      kbNameFromURL && knowledgeBaseId
        ? { value: knowledgeBaseId, label: kbNameFromURL }
        : null,
    [kbNameFromURL, knowledgeBaseId],
  );

  // Clear KB selection when repository changes
  useEffect(() => {
    if (prevRepoRef.current && prevRepoRef.current !== repositoryId) {
      formApi.setValue('river.properties.target.knowledge_base_id', null, {
        shouldDirty: true,
      });
    }
    prevRepoRef.current = repositoryId;
  }, [repositoryId, formApi]);

  return (
    <>
      <SettingsHeader />
      <Flex flexDir="column" gap="4" w="450px">
        <RepositorySelect
          connectionId={connectionIdField.value}
          name="river.properties.target.repository_id"
          required="Repository is required"
          defaultOption={repositoryDefaultOption}
        />
        <KnowledgeBaseSelect
          connectionId={connectionIdField.value}
          repositoryId={repositoryId}
          name="river.properties.target.knowledge_base_id"
          required="Knowledge Base is required"
          defaultOption={kbDefaultOption}
        />
      </Flex>
    </>
  );
}
