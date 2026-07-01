import { MetadataType } from 'api/endpoints/metadata.api';
import { CallType } from 'store/river/hooks/useRiverForMetadataCall';
import { getOId } from 'utils/api.sanitizer';

export const toMetaQueryConfig = (step: any) => {
  const id = getOId(step.content?.gConnection);
  const {
    content: { database },
  } = step;

  const databasesMetaConfig = {
    id,
    step,
    type: MetadataType.DATABASES,
    callType: CallType.LOGIC,
  };
  const schemaId = id && database && `${id}.${database}`;
  const schemasMetaConfig = {
    id: schemaId,
    step,
    type: MetadataType.SCHEMAS,
    callType: CallType.LOGIC,
  };

  return [databasesMetaConfig, schemasMetaConfig];
};
