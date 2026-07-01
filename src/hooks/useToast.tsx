import {
  HStack,
  Spinner,
  Text,
  ToastPositionWithLogical,
  useToast,
  UseToastOptions,
} from '@chakra-ui/react';
import { useCallback, useMemo } from 'react';

const DEFAULT_DURATION = 3000;
interface CommonProps extends UseToastOptions {
  title?: any;
  [key: string]: any;
}
const commonToastFeatures = ({
  title,
  description,
  duration,
  render,
}: CommonProps) => ({
  title,
  description,
  duration,
  isClosable: true,
  variant: 'solid',
  position: 'top' as ToastPositionWithLogical,
  render,
  // containerStyle: {
  //   '& .chakra-alert': {
  //     borderRadius: '4px 4px 0px 0px !important',
  //   },
  // },
});

export const useToastComponent = () => {
  const toast = useToast();

  const api = useMemo(() => {
    const createToaster =
      status =>
      ({ duration, ...options }: UseToastOptions) =>
        runToast({
          status,
          toast,
          options,
          duration,
        });
    //  NOTE: keeping this repeating functions to have typing support for 'api'
    return {
      success: createToaster('success'),
      info: createToaster('info'),
      error: createToaster('error'),
      warning: createToaster('warning'),
      toast,
    };
  }, [toast]);

  return api;
};

function runUniqueToast({ callback, options, toast }) {
  const id = options?.description as string;
  const isCurrentMessageActive = toast.isActive(id);
  return isCurrentMessageActive ? null : callback(id);
}

function runToast({ status, toast, duration = DEFAULT_DURATION, options }) {
  return runUniqueToast({
    toast,
    options,
    callback: id =>
      toast({
        status,
        ...(id ? { id } : {}),
        ...commonToastFeatures({ duration, ...options }),
      }),
  });
}

export function CreateLoadingToast(toast, description, id = null) {
  return toast({
    description: (
      <HStack>
        <Spinner boxSize={4} />
        <Text>{description}</Text>
      </HStack>
    ),
    isClosable: false,
    position: 'top' as ToastPositionWithLogical,
    duration: 300000,
    status: 'info',
    id,
    // containerStyle: {
    //   '& .chakra-alert': {
    //     borderRadius: '4px 4px 0px 0px !important',
    //   },
    // },
  });
}

export const useToastUpdater = id => {
  const toast = useToast({ id });

  const addToast = useCallback(
    description => {
      if (toast.isActive(id)) {
        return null;
      }
      CreateLoadingToast(toast, description, id);
    },
    [id, toast],
  );

  const updateToast = useCallback(
    (status, description, duration = 3000) => {
      toast.update(id, {
        isClosable: true,
        title: null,
        status,
        description,
        duration,
      });
    },
    [id, toast],
  );
  return { updateToast, addToast, toast };
};
