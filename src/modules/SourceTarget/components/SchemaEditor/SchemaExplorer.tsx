import {
  Center,
  ContainerSplitter,
  Flex,
  Grid,
  Icon,
  Image,
  RdsTools,
  Text,
} from 'components';
import SchemasLoaderGif from 'components/Icons/icons/schemaLoader.gif';
import { useToastComponent } from 'hooks/useToast';
import { useIsInNewS2TRiver } from 'modules/RiverRightBar';
import {
  IRiverExtractMethod,
  useGetSchemasQuery,
} from 'modules/SourceTarget/store';
import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useGetSchemaTableNameCaption } from '../../hooks';
import { useSttSource } from '../form';
import { InitialMigrationModal } from '../form/ExtractMethod/InitialMigrationModal';
import { SchemaList } from './SchemaList';
import { SchemaTables } from './SchemaTables';
import { useDebouncedValue } from './useDebouncedValue';

export function SchemaExplorer({
  schemaInView,
  onChange,
  error,
  errorMessage,
  warningMessage = '',
  reloadSchemas,
  loading,
  extractMethod,
}) {
  const showLoadingScreen = loading;
  const {
    value: searchValue,
    finalValue: schemaName,
    setQuery,
  } = useDebouncedValue();

  const source = useSttSource();
  const { noSchemaStructure } = useGetSchemaTableNameCaption();
  const isNewRiver = useIsInNewS2TRiver();
  const formApi = useFormContext();
  const riverId = useWatch({
    control: formApi.control,
    name: 'river.cross_id',
  });

  const args = {
    items_per_page: 500,
    connectionId: source?.connection_id,
    ...(schemaName && { schemaName }),
    ...(!isNewRiver && riverId && { riverId }),
  };

  const { data } = useGetSchemasQuery(args, {
    skip:
      !Boolean(source.connection_id) ||
      source.name === 'blueprint' ||
      noSchemaStructure,
  });
  const noSchemas = data?.items?.length === 0;
  const { error: errorToast, warning: warningToast } = useToastComponent();
  useEffect(() => {
    if (warningMessage) {
      warningToast({ title: 'Warning', description: warningMessage });
    } else if (error) {
      errorToast({
        title: 'Error loading metadata',
        duration: 30000,
        description:
          errorMessage?.message ??
          'For more information check you connection settings or contact support',
      });
    }
  }, [error, errorMessage, errorToast, warningMessage, warningToast]);

  return (
    <>
      {noSchemaStructure ? (
        <Flex
          direction="column"
          position="relative"
          overflow="hidden"
          height="full"
        >
          {showLoadingScreen && (
            <LoaderWrap
              showLoadingScreen={showLoadingScreen}
              error={error}
              noSchemas={noSchemas}
            />
          )}
          {!showLoadingScreen && <SchemaTables schema="no_schema" />}
        </Flex>
      ) : (
        <>
          <LoaderWrap
            showLoadingScreen={showLoadingScreen}
            error={error}
            noSchemas={noSchemas}
          />
          <ContainerSplitter
            {...((showLoadingScreen || (noSchemas && error)) && {
              visibility: 'hidden',
            })}
            orientation="vertical"
            firstChildProps={{
              size: 300,
              sx: {
                overflowX: 'auto !important',
                overflowY: 'hidden !important',
              },
            }}
            overflow="hidden"
            style={{
              height: showLoadingScreen || (noSchemas && error) ? 0 : '100%',
            }}
            w="full"
          >
            <Grid height="full" gridTemplateRows="auto 1fr">
              <SchemaList
                onChange={onChange}
                selectedSchema={schemaInView?.name}
                reloadSchemas={reloadSchemas}
                data={data}
                searchValue={searchValue}
                setQuery={setQuery}
              />
            </Grid>

            <Grid overflow="auto" height="full" gridTemplateRows="auto 1fr">
              <SchemaTables
                schema={schemaInView?.name}
                total={schemaInView?.tables_count}
              />
            </Grid>
          </ContainerSplitter>
        </>
      )}

      {extractMethod === IRiverExtractMethod.LOG && (
        <InitialMigrationModal extractMethod={extractMethod} />
      )}
    </>
  );
}

function LoadingSchemas() {
  const { schemasAndTablesTitle } = useGetSchemaTableNameCaption();

  return (
    <Center flexDir="column">
      <Image boxSize="55px" src={SchemasLoaderGif} alt="streaming" />
      <Text textStyle="R5">Loading {schemasAndTablesTitle}</Text>
    </Center>
  );
}

function ErrorSchemas() {
  const { schemaNameCaption } = useGetSchemaTableNameCaption();
  return (
    <Center flexDir="column" gap={2}>
      <Icon boxSize="55px" as={RdsTools} />
      <Text textAlign="center" textStyle="R5">
        Unable to load {schemaNameCaption}. <br />
        Please check your Connection settings.
      </Text>
    </Center>
  );
}

function LoaderWrap({ showLoadingScreen, error, noSchemas, ...props }) {
  return (
    <Center bg="white" h="100%" w="100%" {...props}>
      {showLoadingScreen ? (
        <LoadingSchemas />
      ) : error && noSchemas ? (
        <ErrorSchemas />
      ) : null}
    </Center>
  );
}
