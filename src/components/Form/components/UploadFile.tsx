import { ExLoader, LoaderSize } from '@boomi/exosphere';
import { chakra } from '@chakra-ui/react';
import { API } from 'api';
import { BlockTypes, ConnectionTypes } from 'api/types';
import { Box, Flex, FormLabel, RiveryButton, Text } from 'components';
import { FailStatus, SuccessStatus } from 'modules/Status';
import React from 'react';
import { Controller } from 'react-hook-form';
import { useAsyncFn } from 'react-use';
import { ControlFeedback } from './ControlFeedback';
import { Input, InputLabel, InputTypes } from './Input';

type UploadFileProps = {
  name: string;
  label: string;
  display_name?: string;
  file_type?: string;
  api: any;
  placeholder?: string;
  /** displays the full uploaded file path (default: false) */
  fullPath?: boolean;
  onBeforeUpload?: (api?: any) => void;
  onBeforeChange?: (api?: any) => string;
  children?: any;
};

export function UploadFile({
  api,
  file_type,
  onBeforeUpload,
  onBeforeChange,
  ...props
}: UploadFileProps) {
  return (
    <Controller
      name={props.name}
      control={api.control}
      render={({ field: { value, onChange } }) => {
        return (
          <Flex flexDir="column" w="full" gap={2}>
            <InputLabel
              label={props.display_name || props.label}
              htmlFor={props.name}
            />
            <FileInput
              fileType={file_type}
              {...props}
              value={value}
              onChange={async files => {
                if (files === null) {
                  onChange(null);
                  return null;
                }
                if (onBeforeUpload) {
                  onBeforeUpload(files);
                }
                const [file] = files;
                const connectionType = api.getValues()?.connection_type;
                const response = await uploadFile(file, connectionType);
                if (response) {
                  const payload = onBeforeChange
                    ? onBeforeChange(response)
                    : response;
                  onChange(payload);
                  return payload;
                }
              }}
            />
            <ControlFeedback api={api} name={props.name} />
          </Flex>
        );
      }}
    />
  );
}

export function importFile(
  onChange: (text: string, name: string) => void,
  accept: string = '',
) {
  const fileSelector = document.createElement('input');
  fileSelector.setAttribute('type', 'file');
  fileSelector.setAttribute('accept', accept);
  fileSelector.onchange = e => {
    const target = e.target as HTMLInputElement;
    if (target?.files?.length) {
      return new Response(target.files[0])
        .text()
        .then(text => onChange(text, target.files[0].name));
    }
  };
  fileSelector.click();
}

type UploadLocalFileProps = {
  onChange: (content: any, fileName?: string) => any;
  fileType: string;
  label: string;
};

export function UploadLocalFile({
  onChange,
  fileType,
  label = 'Open',
}: UploadLocalFileProps) {
  return (
    <FormLabel bgColor="brand" cursor="pointer" p="2">
      {label}
      <Input
        aria-label={`import ${fileType} file`}
        type="file"
        display="none"
        accept={`.${fileType}`}
        onChange={({ target }) => {
          if (target?.files?.length) {
            return new Response(target.files[0])
              .text()
              .then(text => onChange(text, target.files[0].name));
          }
        }}
      />
    </FormLabel>
  );
}

type FileInputConfig = {
  value: string;
  fileType: string;
  children?: any;
  onChange: (files: FileList) => Promise<any>;
};
const regexExtractFileName = /\{.*\}\/[a-z0-9]+\/.*?\/.*?/g;
const getFileName = str => {
  return str?.split(str.match(regexExtractFileName))?.pop() ?? str;
};

export const FileInput = React.forwardRef(function FileInput(
  {
    onChange,
    value,
    fileType = 'json',
    fullPath = false,
    children,
    ...props
  }: FileInputConfig & Omit<UploadFileProps, 'api'>,
  ref,
) {
  const [state, invokeOnChange] = useAsyncFn(onChange);
  const uploading = state.loading;
  const showSuccess = !uploading && Boolean(state?.value);
  const showError = Boolean(state.error);
  const onFileInputChange = ({ target, dataTransfer }) => {
    const files = target?.files ?? dataTransfer?.files;
    files && invokeOnChange(files);
  };
  const filePath = fullPath ? value : getFileName(value);

  if (filePath) {
    return (
      <Flex alignItems="center">
        <SuccessStatus
          mr="2"
          text={
            showSuccess ? (
              <span>
                <Text fontWeight="bold" mr="1">
                  {filePath ?? ''}
                </Text>
                uploaded successfully
              </span>
            ) : (
              <Text fontWeight="bold">{filePath ?? ''}</Text>
            )
          }
        />
        {Boolean(showSuccess || filePath) ? (
          <RiveryButton
            _focus={{ boxShadow: 'none' }}
            fontWeight="normal"
            variant="link"
            onClick={() => onChange(null)}
            aria-label="Remove File"
            label="Remove"
            ml={2}
          />
        ) : null}
        {children}
      </Flex>
    );
  }

  return (
    <Flex flexDir="column" flex="auto">
      <Box
        onDrop={e => {
          e.preventDefault();
          onFileInputChange(e);
        }}
        onDragOver={e => {
          e.preventDefault();
        }}
        position="relative"
        flexGrow="1"
      >
        <Input
          accept={`.${fileType}`}
          ref={ref}
          {...props}
          h="auto"
          id={`customFile_${props.name}`}
          type={InputTypes.FILE}
          hideLabel
          onChange={onFileInputChange}
          opacity="0"
          position="absolute"
          mt="2"
        />
        <DropFilePath
          loading={uploading}
          name={props.name}
          label={`Drag and drop your file.${fileType} here`}
        />
      </Box>
      {showError && <FailStatus text="File is not valid" />}
    </Flex>
  );
});

const LabelForDrag = chakra('label');
function DropFilePath({ loading, label, name }) {
  return (
    <LabelForDrag
      as="label"
      htmlFor={`customFile_${name}`}
      onDragEnter={e => {
        e.currentTarget.classList.add('on-drag');
      }}
      onDragLeave={e => {
        e.currentTarget.classList.remove('on-drag');
      }}
      sx={{
        '&.on-drag': {
          bgColor: 'gray.200',
          cursor: 'move',
        },
      }}
      display="flex"
      flexDir="column"
      position="relative"
      alignItems="center"
      border="1px"
      borderStyle="dashed"
      borderColor="gray.200"
      borderWidth="1px"
      borderRadius="base"
      overflow="auto"
      cursor="pointer"
      p="3"
      _hover={{
        bgColor: 'gray.200',
      }}
      pointerEvents={loading ? 'none' : 'all'}
    >
      {label}
      <Flex pointerEvents="none" gap="1">
        or
        <Text color="font-link" textDecoration="underline">
          Browse for a file
        </Text>
      </Flex>
      {loading ? (
        <>
          <Overlay opacity="0.5" bgColor="gray.200" />
          <Overlay as={Flex} justifyContent="center" alignItems="center">
            <ExLoader size={LoaderSize.MEDIUM} />
          </Overlay>
        </>
      ) : null}
    </LabelForDrag>
  );
}
function Overlay(props) {
  return (
    <Box position="absolute" top="0" right="0" h="full" w="full" {...props} />
  );
}
export enum FileTypes {
  PYTHON = 'python_script',
  POSTGRES = 'postgres',
}

// there are few api's for uploading files
const uploadApiByConnectionType = {
  [ConnectionTypes.GCLOUD]: API.connections.createFile,
  [BlockTypes.PYTHON]: API.files.getCreateFnFile(FileTypes.PYTHON),
};

// upload api's
export async function uploadFile(
  file: File,
  fileType: BlockTypes | ConnectionTypes,
) {
  const fileData = new FormData();
  const params =
    fileType === BlockTypes.PYTHON
      ? {
          file,
          fileType,
        }
      : {
          file,
          connection_type: fileType,
        };
  Object.entries(params)
    .filter(([, value]) => Boolean(value))
    .forEach(([key, value]) => {
      fileData.append(key, value);
    });
  return (uploadApiByConnectionType?.[fileType] || API.connections.createFile)(
    fileData,
  );
}
