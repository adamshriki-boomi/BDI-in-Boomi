import { API } from 'api';
import {
  ConfirmationModal,
  EditableText,
  Flex,
  GridBox,
  Icon,
  IconButton,
  keyframes,
  Text,
} from 'components';
import { getQueryParams } from 'hooks/router';
import React, { useCallback, useEffect, useMemo } from 'react';
import { MdBookmark, MdBookmarkBorder, MdHistory } from 'react-icons/md';
import { useHistory } from 'react-router-dom';
import { useAsyncFn, useToggle } from 'react-use';
import { useRiverActions } from 'store/river';
import { useVersionController } from '../hooks';
import { useGetRiverVersionQuery } from '../hooks/versions.query';
import { IRiverVersion } from '../hooks/versions.types';
import { formatDate } from './formatDate';
import { VersionSkeleton } from './Skeleton';
import { StringColorizer } from './StringColorizer';

export const bookmarkEmpty = (
  <Icon as={MdBookmarkBorder} boxSize="5" color="background-action" />
);
export const bookmarkFill = (
  <Icon as={MdBookmark} boxSize="5" color="background-selected" />
);

export const VERSION_PARAM = 'version';
interface RiverVersionProps extends IRiverVersion {
  /**
   * currently displayed
   */
  active: boolean;
  latest: boolean;
  loading?: boolean;
  onAddBookmark: (versionId: string) => any;
  onRemoveBookmark: (versionId: string) => any;
  onNameChange: (versionName: string, versionId: string) => any;
  isAngular?: boolean;
  /**
   * if true, should use api v1 to fetch version when selected
   */
  enableApiV1: boolean;
}

export function RiverVersion({
  user_info,
  insert_date,
  river_id: riverId,
  version_id,
  active,
  latest,
  loading = false,
  onAddBookmark,
  onRemoveBookmark,
  onNameChange,
  isAngular,
  enableApiV1,
  ...rest
}: Partial<RiverVersionProps>) {
  const [showConfirmation, toggleConfirmationModal] = useToggle(false);
  const versionName = rest?.name;
  const versionId = version_id;
  const userName = user_info?.user_name;
  const { versionLoading, viewVersion } = useVersionViewer({
    riverId,
    versionId,
    latest,
    enableApiV1,
  });

  const { version } = getQueryParams(['version']);

  const isVersionActive = useMemo(
    () => (version ? window.location.search.includes(versionId) : active),
    [active, version, versionId],
  );

  const history = useHistory();
  const viewActive = useCallback(() => {
    if (!isAngular) {
      viewVersion();
    }
    if (latest) {
      history.replace({ search: '' });
      return;
    }
    // setTimeout(() => {
    //   history.replace({ search: upsertSearchParam(VERSION_PARAM, versionId) });
    // }, 500);
    setTimeout(() => {
      history.replace({ search: `${VERSION_PARAM}=${versionId}` });
    }, 500);
  }, [history, isAngular, latest, versionId, viewVersion]);

  const isVersionSelected = useMemo(
    () => (isAngular && isVersionActive) || (!isAngular && active),
    [active, isAngular, isVersionActive],
  );

  return (
    <GridBox
      aria-label={loading ? null : 'select version'}
      role="button"
      cursor="pointer"
      onClick={() => (latest ? viewActive() : toggleConfirmationModal(true))}
    >
      <GridBox
        aria-selected={isVersionSelected}
        aria-label="version-box"
        bgColor={isVersionSelected ? 'background-selected-weak' : 'unset'}
        gridTemplateColumns="1fr auto"
        p="4"
        alignItems="flex-start"
        borderBottom="1px"
        borderColor="gray.200"
        _hover={{
          bgColor: 'gray.200',
        }}
      >
        <GridBox>
          <Flex alignItems="center" overflow="hidden">
            {versionLoading ? (
              <Icon
                as={MdHistory}
                animation={`${pulsateForward} 0.5s ease-in-out infinite both`}
              />
            ) : null}
            <VersionTitle
              date={insert_date}
              name={versionName}
              loading={loading}
              versionId={versionId}
              onChange={onNameChange}
              isVersionSelected={isVersionSelected}
            />
          </Flex>
          <GridBox gap={0.5}>
            {latest ? <Text fontSize="xs">Latest Version</Text> : null}
            <VersionSkeleton
              as={Flex}
              alignItems="center"
              loading={loading}
              width="50%"
              my={loading && 1}
              h={loading ? '10px' : 'auto'}
            >
              <StringColorizer value={userName} />
              <Text fontSize="xs">{userName}</Text>
            </VersionSkeleton>
          </GridBox>
        </GridBox>
        <BookmarkButton
          loading={loading}
          versionId={versionId}
          isBookmarked={Boolean(rest?.bookmarked)}
          onAddBookmark={onAddBookmark}
          onRemoveBookmark={onRemoveBookmark}
        />
      </GridBox>
      <ConfirmationModal
        show={showConfirmation}
        onClose={toggleConfirmationModal}
        onConfirm={viewActive}
        title="Any unsaved changes will be lost"
        description="Save your progress before switching to version view"
        confirmLabel="View Version"
        variant="info"
      />
    </GridBox>
  );
}

interface useVersionViewerProps {
  riverId: string;
  versionId: string;
  latest: boolean;
  enableApiV1: boolean;
}
const useVersionViewer = ({
  riverId,
  versionId,
  latest,
  enableApiV1,
}: useVersionViewerProps) => {
  const { selectVersion } = useRiverActions();
  const { view, viewLatest } = useVersionController();
  const { version: versionIdParam } = useVersionController();

  const viewVersion = useCallback(() => {
    return latest ? viewLatest() : view(versionId);
  }, [latest, viewLatest, view, versionId]);

  // fetch version with API v1 - might not needed here
  useGetRiverVersionQuery(
    { crossId: riverId, versionId },
    {
      skip:
        !enableApiV1 ||
        versionId !== versionIdParam ||
        ![riverId, versionId].every(Boolean),
    },
  );

  const [{ loading: versionLoading }, fetchVersion] = useAsyncFn(async () => {
    return API.versions
      .getVersionDetails(riverId, versionId)
      .then(selectVersion);
  }, [versionId, riverId]);

  useEffect(() => {
    if (!enableApiV1 && versionId === versionIdParam) {
      fetchVersion();
    }
  }, [versionId, versionIdParam, fetchVersion, enableApiV1]);

  return { versionLoading, viewVersion };
};

function BookmarkButton({
  loading,
  versionId,
  onAddBookmark,
  onRemoveBookmark,
  isBookmarked,
}) {
  const [bookmarked, toggleBookmark] = useToggle(isBookmarked);
  const handleOnBookmark = useCallback(
    async (ev: React.MouseEvent) => {
      ev.stopPropagation();
      toggleBookmark(!bookmarked);
      return await (bookmarked ? onRemoveBookmark : onAddBookmark)(versionId);
    },
    [toggleBookmark, bookmarked, onRemoveBookmark, onAddBookmark, versionId],
  );

  return (
    <VersionSkeleton
      as={IconButton}
      variant="unstyled"
      paddingX="0"
      paddingY="0"
      height="auto"
      minWidth="auto"
      display="flex"
      alignItems="flex-start"
      loading={loading}
      onClick={handleOnBookmark}
      _active={{
        color: 'red.200',
      }}
      aria-label={`${
        loading ? null : bookmarked ? 'bookmark' : 'unbookmark'
      } version`}
    >
      {bookmarked ? bookmarkFill : bookmarkEmpty}
    </VersionSkeleton>
  );
}

type VersionTitleProps = {
  date: string;
  name: string;
  versionId: string;
  loading: boolean;
  onChange: (value: string, versionId: string) => any;
  isVersionSelected: boolean;
};
function VersionTitle({
  date,
  name,
  versionId,
  loading,
  onChange,
  isVersionSelected,
}: VersionTitleProps) {
  const [{ loading: nameLoading }, handleOnNameChange] = useAsyncFn(
    async value => {
      return await onChange(value, versionId);
    },
    [versionId],
  );
  const isAsyncInProgress = loading || nameLoading;
  const { time, display } = formatDate(date);
  const text = name || `${display}, ${time}`;

  return isAsyncInProgress ? (
    <VersionSkeleton as="h5" loading={true} width="75%" mb="2">
      loading
    </VersionSkeleton>
  ) : (
    <EditableText
      textStyle={{
        fontWeight: isVersionSelected ? 'medium' : 'normal',
        display: 'block',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
      }}
      textColor={isVersionSelected ? 'background-selected' : 'font'}
      iconColor="icon"
      text={text}
      onChange={handleOnNameChange}
    />
  );
}

const pulsateForward = keyframes`
0% {
  transform: scale(1);
}

50% {
  transform: scale(1.1);
}

100% {
  transform: scale(1);
}`;
