import {
  BgVideos,
  Box,
  Center,
  Icon,
  Image,
  Play,
  RenderGuard,
  RiveryModal,
} from 'components';
import { EventTypes } from 'containers/Connections';
import { videos } from 'layout/Sidebar/ResourceCenter/components/DemoVideos';
import { useCallback, useEffect } from 'react';
import { useToggle } from 'react-use';
import { imageSrc } from '../consts';

export enum Sizes {
  LARGE = 'LARGE',
  MEDIUM = 'MEDIUM',
  SMALL = 'SMALL',
  PLG = 'PLG',
}

export const ImageSize = {
  MODAL: { w: '640px', h: '365px' },
  LARGE: { w: '477px', h: '270px' },
  MEDIUM: { w: '225px', h: '130px' },
  PLG: { w: '200px', h: '113px' },
  SMALL: { w: '152px', h: '85px' },
};

export const VideoById = ({ id, size = Sizes.LARGE, ...rest }) => {
  const video = videos.find(({ id: videoId }) => videoId === id);
  return (
    <VideoModal
      title={video.description}
      videoImage={video.id}
      brightcoveVideoId={video.brightcoveVideoId}
      size={Sizes.PLG}
      {...rest}
    />
  );
};

export const ModalVideoDisplay = ({
  show,
  toggle,
  setWatchVideo,
  title,
  brightcoveVideoId,
}) => {
  return (
    <RiveryModal
      show={show}
      headerLess={!title}
      onClose={() => {
        toggle(false);
        setWatchVideo && setWatchVideo(false);
      }}
      title={title}
      style={{
        content: { maxW: ImageSize.MODAL.w },
        header: { py: 2 },
      }}
    >
      <Box
        m="auto"
        height={ImageSize.MODAL.h}
        width={ImageSize.MODAL.w}
        overflow="hidden"
      >
        <iframe
          title="brightcove-video-player"
          src={`https://players.brightcove.net/6261520393001/default_default/index.html?videoId=${brightcoveVideoId}`}
          allowFullScreen={true}
          allow="encrypted-media"
          width="650"
          height="370"
        ></iframe>
      </Box>
    </RiveryModal>
  );
};
VideoModal.VideoImageSizes = Sizes;
export default function VideoModal({
  videoImage,
  title,
  size = Sizes.MEDIUM,
  updateStep = null,
  activatedFromButton = false,
  videoBgColor = '',
  setWatchVideo = null,
  brightcoveVideoId,
  // Add configuration for inner component detection
  preventInnerModal = true,
  ...rest
}) {
  const [show, toggle] = useToggle(false);

  // Enhanced iframe detection to distinguish between outer and inner React components
  const isInsideIframe = window.parent !== window.top;

  const onUpdateStep = useCallback(() => {
    if (updateStep) {
      updateStep();
    }
  }, [updateStep]);

  // Check if we're in the inner React component (nested inside Angular iframe)
  const isInnerReactComponent = useCallback(() => {
    // If preventInnerModal is false, always allow modal
    if (!preventInnerModal) {
      return false;
    }

    // Simple check: if current URL contains "plg", we're in the inner React component
    const currentLocation = window.location.href;
    const isInnerComponent = currentLocation.includes('plg');

    return isInnerComponent;
  }, [preventInnerModal]);

  const play = useCallback(() => {
    // Only open modal if we're NOT in the inner React component
    if (isInnerReactComponent()) {
      // We're in the inner React component, don't open modal here
      // Instead, send message to parent to handle the video modal
      if (isInsideIframe) {
        // Try sending to window.top to reach the outer component
        try {
          window?.top?.postMessage(
            {
              type: EventTypes.MODAL_VIDEO,
              data: { title, brightcoveVideoId },
            },
            '*',
          );
        } catch (error) {
          // Fallback to window.parent if window.top fails
          window?.parent?.postMessage(
            {
              type: EventTypes.MODAL_VIDEO,
              data: { title, brightcoveVideoId },
            },
            '*',
          );
        }
      }
      return;
    }

    // We're in the outer React component, proceed normally
    if (isInsideIframe) {
      window?.parent?.parent?.postMessage({
        type: EventTypes.MODAL_VIDEO,
        data: { title, brightcoveVideoId },
      });
    }
    onUpdateStep();
    toggle(true);
  }, [
    isInnerReactComponent,
    isInsideIframe,
    onUpdateStep,
    toggle,
    title,
    brightcoveVideoId,
  ]);

  useEffect(() => {
    if (activatedFromButton) {
      play();
    }
  }, [activatedFromButton, play]);

  const exoTheme = import.meta.env.VITE_EXO_THEME === 'true';

  return (
    <Center position="relative">
      {size === Sizes.MEDIUM && (
        <RenderGuard condition={!exoTheme}>
          <Icon
            as={BgVideos}
            w="330px"
            h="200px"
            color={videoBgColor}
            position="absolute"
          />
        </RenderGuard>
      )}
      <Image
        objectFit="cover"
        aria-label={videoImage}
        src={imageSrc(videoImage)}
        height={ImageSize[size].h}
        width={ImageSize[size].w}
        borderRadius={size === Sizes.PLG ? '3px' : exoTheme ? '4px' : null}
        role="button"
        onClick={play}
        m="auto"
        {...rest}
        sx={{
          ...(Boolean(videoBgColor) && {
            '&': {
              top: '5px',
              left: 'auto',
              position: 'relative',
            },
          }),
        }}
      />
      <Icon
        as={Play}
        position="absolute"
        boxSize="24px"
        role="button"
        onClick={play}
      />
      <ModalVideoDisplay
        show={show}
        toggle={toggle}
        setWatchVideo={setWatchVideo}
        title={title}
        brightcoveVideoId={brightcoveVideoId}
      />
    </Center>
  );
}
