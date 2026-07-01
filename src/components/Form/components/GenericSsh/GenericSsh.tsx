import { Box, Text, VStack } from '@chakra-ui/react';
import { ControlList } from 'api/types';
import { FormControls, Radio, RiverySwitch, UploadFile } from 'components/Form';
import { VariableList } from 'components/VariableList';
import * as React from 'react';
import { Controller, UseFormReturn } from 'react-hook-form';
import { Secret } from '../Secret';
import RiveryAlert from 'components/Alert/Alert';
import { OpenSupport } from 'modules/ModalForm/OpenSupport';

export type GenericSshProps = {
  name: string;
  api: Partial<UseFormReturn>;
};

export function GenericSsh({ api }: GenericSshProps) {
  const showAutoGenerate = api.watch('ssh_auto_generate');
  const connectionType = api.watch('connection_type');
  const isSSH = api.watch('is_ssh_tunnel');
  // const showPemPassword = Boolean(api.watch('ssh_remote_password_exists'));
  const checkedValue = showAutoGenerate ? 'auto_generate' : 'upload_pem';
  return (
    <>
      <Box mt={2}>
        <RiverySwitch name="is_ssh_tunnel" label="SSH Tunnel" api={api} />
      </Box>
      {isSSH && (
        <Box m={2} gap="2" display="flex" flexDir="column">
          <Text textStyle="M6">SSH Credentials</Text>
          <FormControls
            controls={sshControls}
            api={api}
            flexDir="column"
            gap={5}
          />
          <Text textStyle="M6" mt="4">
            SSH Tunnel
          </Text>
          <section>
            <Radio
              api={api}
              label="ssh auto generate"
              name="ssh_auto_generate"
              values={sshTunnelValues}
              onChange={v => {
                api.setValue('ssh_auto_generate', v === 'auto_generate');
              }}
              checked={checkedValue}
            />
            {showAutoGenerate ? (
              <Controller
                name="ssh_pkey_file_path"
                control={api.control}
                render={({ field: { value, onChange } }) => (
                  <VariableList
                    value={value}
                    onChange={onChange}
                    connectionType={connectionType}
                  />
                )}
              />
            ) : (
              <VStack alignItems="start" my={3} gap={2}>
                <UploadFile
                  api={api}
                  placeholder="Choose"
                  name="ssh_pkey_file_path"
                  file_type="pem"
                  display_name="SSH Connection Key File (Pub/Pem)"
                  label="SSH Connection Key File (Pub/Pem)"
                />
                <Secret
                  name="ssh_pkey_file_pwd"
                  api={api}
                  label="SSH KEY File Password"
                />
              </VStack>
            )}
          </section>
        </Box>
      )}
      <RiveryAlert
        mt={4}
        description={
          <>
            <Text display="inline" pr={1}>
              Looking to use other security connection methods such as Private
              Link/Private Service Connect, Reverse SSH or VPN?
            </Text>
            <OpenSupport variant="link" label="Click here" />.
          </>
        }
        variant="secondary"
      />
    </>
  );
}

const sshControls: any = [
  {
    type: ControlList.INPUT_NUMBER,
    name: 'ssh_remote_port',
    display_name: 'SSH Port',
  },
  {
    type: ControlList.INPUT_TEXT,
    name: 'ssh_remote_host',
    display_name: 'SSH Hostname',
  },

  {
    type: ControlList.INPUT_TEXT,
    name: 'ssh_remote_user',
    display_name: 'SSH Remote User Name',
  },
];

const sshTunnelValues = [
  {
    label: 'Upload PEM',
    value: 'upload_pem',
  },
  {
    label: 'Auto Generated',
    value: 'auto_generate',
  },
];
