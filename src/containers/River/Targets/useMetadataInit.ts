import { useEnableEdit } from 'hooks/useEnableEdit';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import metadataApi from 'store/metadata';

export default function useMetadataInit(query: any | any[]) {
  const dispatch = useDispatch();
  const { enableEdit } = useEnableEdit();
  useEffect(() => {
    if (enableEdit) {
      [query]
        .flat()
        .map(item => metadataApi.endpoints.getMetadata.initiate(item))
        .forEach(dispatch as any);
    }
  }, [query, dispatch, enableEdit]);
}
