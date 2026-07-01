import { Switch, Tooltip } from '@chakra-ui/react';
import {
  ExternalLink,
  Flex,
  GridBox,
  HStack,
  RiveryInfoTooltip,
  Text,
  VStack,
} from 'components';
import { CloseIconButton } from 'components/Buttons/RiveryButton';
import { formatDistance } from 'date-fns';
import { RiverRightBar } from 'modules/RiverRightBar';
import * as React from 'react';
import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useRiverActions } from 'store/river';
import { removeParams } from 'utils/searchParams';
import { RiverVersion } from './components';
import { useVersionController, useVersions } from './hooks';
import { useIsRiverSttV1 } from './useIsRiverSttV1';

type VersionsProps = {
  versionId: string;
  angular?: boolean;
};

export function Versions({ versionId, angular = false }: VersionsProps) {
  const {
    stats,
    loading,
    toggleBookmarkFilter,
    versions,
    total,
    bookmarkOnly,
    addBookmark,
    removeBookmark,
    isActiveVersion,
    isFirst,
    updateBookmarkName,
  } = useVersions(true);

  const isRiverSttV1 = useIsRiverSttV1();
  const totalBookmarked = stats?.bookmarked_versions;
  const bookmarkedLimit = stats?.bookmarks_allowed;
  const versionsLimit = stats?.versions_allowed;
  const { isDateRegistered, formatDate } = useDateRegistry();

  return (
    <Flex
      direction="column"
      maxHeight="full"
      aria-label="version history"
      role="widget"
      alignItems="stretch"
    >
      <Flex direction="column" flexShrink="1" alignItems="stretch">
        <CloseVersions isAngular={angular} />
        <HStack
          borderBottom="1px"
          borderColor="gray.200"
          px="3"
          pb="1"
          justifyContent="space-between"
        >
          <HStack>
            <Text textStyle="M4">Version History</Text>
            <RiveryInfoTooltip
              ariaLabel="Version History Help"
              description={VersionsInfo}
              extraProps={{
                contentProps: {
                  transform: 'translate(-150px, 0px)!important',
                  sx: {
                    '& .chakra-popover__arrow-positioner': {
                      left: '75px!important',
                    },
                  },
                },
              }}
            />
          </HStack>
          <HStack gridGap="1">
            <StatOverlay
              label="limit of versions"
              value={total}
              description={`${
                total ?? 0
              } versions, limited to ${versionsLimit} versions per data flow.`}
            />
            <StatOverlay
              label="limit of bookmarks"
              value={totalBookmarked}
              description={`${
                totalBookmarked ?? 0
              } bookmarked versions, limited to ${bookmarkedLimit} versions per data flow.`}
              variant="primary"
              textVariant="white"
            />
          </HStack>
        </HStack>
        <HStack
          p={4}
          borderBottom="1px solid"
          borderColor="gray.300"
          justifyContent="space-between"
        >
          <Text
            fontSize="small"
            color={bookmarkOnly ? 'font' : 'font-secondary'}
          >
            Only show bookmarked versions
          </Text>
          <Switch
            size="sm"
            aria-label="Only show bookmarked versions"
            name="only_show_bookmarked_versions"
            isChecked={bookmarkOnly}
            onChange={toggleBookmarkFilter}
          />
        </HStack>
      </Flex>
      <Flex direction="column" overflow="auto">
        {loading && !Boolean(versions?.length) ? (
          <VersionsLoader />
        ) : (
          versions?.map((version, index) => (
            <React.Fragment key={version.version_id}>
              {isDateRegistered(version.insert_date) ? (
                <DateHeader date={formatDate(version.insert_date)} />
              ) : null}
              <RiverVersion
                {...version}
                isAngular={angular}
                active={isActiveVersion(version, versionId, index)}
                latest={isFirst(index)}
                onAddBookmark={addBookmark}
                onRemoveBookmark={removeBookmark}
                onNameChange={updateBookmarkName}
                enableApiV1={isRiverSttV1}
              />
            </React.Fragment>
          ))
        )}
        {!loading && versions?.length === 0 && (
          <VStack p="3" mt="24" alignItems="center" justifyItems="center">
            <Text fontWeight="medium">No bookmarked versions yet</Text>
          </VStack>
        )}
      </Flex>
    </Flex>
  );
}

const VersionsInfo = (
  <VStack gap={2} alignItems="flex-start">
    <Text mt={1}>What Are Versions?</Text>
    <Text>
      Versions enable you to review past activity <br />
      and changes made on your data flows.
      <br />
      Latest 70 versions are saved automatically
      <br />
      and you can also bookmark the most important versions (up to 30 versions).
    </Text>
    <ExternalLink
      url="https://help.boomi.com/docs/Atomsphere/Data_Integration/GettingStarted/versions-version-history"
      label="Read More..."
      color="font-inverse"
    ></ExternalLink>
  </VStack>
);

const VersionsLoader = () => {
  return (
    <>
      <RiverVersion loading={true} />
      <RiverVersion loading={true} />
      <RiverVersion loading={true} />
    </>
  );
};

function StatOverlay({
  label,
  value,
  description,
  variant = 'purple.50',
  textVariant = 'font',
}) {
  return (
    <Tooltip
      shouldWrapChildren
      hasArrow
      label={<Text p={1}>{description}</Text>}
      bg="background-action-inverse"
      fontWeight="normal"
      borderRadius={4}
      placement="left"
    >
      <GridBox
        alignContent="center"
        justifyContent="center"
        cursor="help"
        boxSize={5}
        fontSize="xs"
        borderRadius="full"
        bgColor={variant}
        color={textVariant}
        aria-label={label}
      >
        {value}
      </GridBox>
    </Tooltip>
  );
}

function CloseVersions({ isAngular }) {
  const { restoreRiverBackup } = useRiverActions();
  const { toggleOff } = useVersionController();
  const onCloseVersions = useCallback(() => {
    restoreRiverBackup();
  }, [restoreRiverBackup]);
  return (
    <Link
      replace
      to={{
        search: isAngular
          ? removeParams(window.location.search, [RiverRightBar.DrawerParam])
          : toggleOff(),
      }}
    >
      <CloseIconButton
        onClick={onCloseVersions}
        aria-label="close versions"
        variant="unstyled"
        ml="auto"
        mr={1}
        mt={1}
        display="flex"
        px="0.5"
        py="0.5"
        size="sm"
        borderRadius="full"
      />
    </Link>
  );
}

const useDateRegistry = () => {
  const headers = new Set();
  const formatDate = (date: string) => {
    return formatDistance(new Date(date), new Date(), {
      addSuffix: true,
    });
  };
  const isDateRegistered = (date: string) => {
    const dateDisplay = formatDate(date);
    if (headers.has(dateDisplay)) {
      return null;
    }
    headers.add(dateDisplay);
    return dateDisplay;
  };
  return { formatDate, isDateRegistered };
};

function DateHeader({ date }) {
  return (
    <Text
      px="3"
      py="2"
      borderBottom="1px"
      borderColor="background-secondary"
      textStyle="M8"
      textTransform="capitalize"
    >
      {date}
    </Text>
  );
}
