import { RenderGuard } from 'components';
import { useFormContext } from 'react-hook-form';
import {
  FileFormatSettings,
  useConvertFileAllowed,
} from './commonTargetDefinitions';

export function TargetAzureBlob() {
  const formApi = useFormContext();
  const { isAllowed: convertFileAllowed, currentFileType } =
    useConvertFileAllowed();

  return (
    <RenderGuard condition={convertFileAllowed}>
      <FileFormatSettings formApi={formApi} currentFileType={currentFileType} />
    </RenderGuard>
  );
}
