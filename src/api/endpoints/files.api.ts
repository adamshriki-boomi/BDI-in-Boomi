import { getDataV1, postBody, put } from 'api/api.proxy';
import { OID } from 'api/types';
import { getCrossId } from 'utils/api.sanitizer';

export enum PollingStatus {
  COMPLETED = 'completed',
  EMPTY = 'empty',
  FAILED = 'failed',
}

type CreateJarFileResponse = {
  cross_id: OID;
  presigned_url: string;
};

export const getCreateFnFile =
  (fileType = null) =>
  (params: FormData): Promise<CreateJarFileResponse> => {
    const file = params.get('file') as File;
    return postBody('/files/upload_presigned/file', {
      file_name: file.name,
      ...(fileType ? { file_type: fileType } : {}),
    })
      .then((data: any) => ({
        file_cross_id: getCrossId(data),
        presigned_url: data.presigned_url,
      }))
      .then(response => uploadToSignedUrl(response, file));
  };

const stripHeaders = headers => {
  delete headers['authorization'];
  headers.Accept = 'application/json, text/plain, */*';
};

type SignedFileConfig = {
  file_cross_id: string;
  presigned_url: string;
};
export type JarFileUploadResponse = {
  file_cross_id: string;
  file_name: string;
};
const uploadToSignedUrl = async (
  response: SignedFileConfig,
  file: File,
): Promise<JarFileUploadResponse> => {
  const targetUploadUrl = response?.presigned_url;
  if (Boolean(targetUploadUrl)) {
    await put(targetUploadUrl, file, {
      transformRequest: (data, headers) => {
        stripHeaders(headers);
        return data;
      },
    });
    return {
      file_cross_id: response.file_cross_id,
      file_name: file.name,
    };
  }
};

export function getSignedFileName(url, updateContent) {
  getDataV1(true, url)
    .then(data => updateContent({ file_name: data?.filename }))
    .catch(e => {
      throw e;
    });
}

export function getSignedFile(url, isFull = false) {
  return getDataV1(isFull, url).then(data => {
    return data?.url
      ? fetch(data?.url).then(v => v.text())
      : Promise.reject(data);
  });
}

export function downloadUrl(url, filename) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  link.click();
}

function recurse(list, index, onComplete) {
  setTimeout(() => {
    if (list.length <= index) {
      onComplete(PollingStatus.COMPLETED);
      return;
    } else {
      downloadUrl(list[index], '');
      recurse(list, index + 1, onComplete);
    }
  }, 2000);
}

function downloadListOfURLs(urlList, onComplete) {
  recurse(urlList, 0, onComplete);
}

export function downloadPreSignedURLs(operationId, onComplete) {
  return getDataV1(true, `/operations/${operationId}`)
    .then(data => {
      if (data?.status === 'W' || data?.status === 'R') {
        setTimeout(() => downloadPreSignedURLs(operationId, onComplete), 2000);
        return;
      }
      if (data?.status === 'D') {
        if (data?.result.length === 0 || !Array.isArray(data?.result)) {
          onComplete(PollingStatus.EMPTY);
        } else downloadListOfURLs(data?.result, onComplete);
      }
    })
    .catch(() => onComplete(PollingStatus.FAILED));
}

export function exportToFile(content, fileName) {
  const file = new File([content], fileName, {
    type: 'text/plain',
  });
  const url = window.URL.createObjectURL(file);
  downloadUrl(url, fileName);
  window.URL.revokeObjectURL(url);
}
