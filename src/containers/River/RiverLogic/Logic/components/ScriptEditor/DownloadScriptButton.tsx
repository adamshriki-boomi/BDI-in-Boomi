import { exportToFile } from 'api/endpoints/files.api';
import { DownloadIcon, Icon } from 'components';
import { TooltipIconButton } from 'components/Buttons/RiveryButton';
import React from 'react';

type DownloadScriptButtonProps = {
  fileName: string;
  script: string;
  type: string;
};
export function DownloadScriptButton({
  fileName,
  script,
  type,
}: DownloadScriptButtonProps) {
  return (
    <TooltipIconButton
      aria-label={`download ${type} script`}
      tooltip={`Download ${type} Script`}
      variant="text-link"
      onClick={() => {
        exportToFile(script, fileName);
      }}
      icon={<Icon as={DownloadIcon} boxSize={6} />}
      boxSize="8"
      minW="unset"
    />
  );
}
