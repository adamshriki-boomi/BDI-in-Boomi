import { api } from 'api/api.proxy';

export const withHeaderAuthorization =
  (isBearer = false) =>
  (headers: Headers, { getState }) => {
    if (!headers.get('authorization')) {
      const authToken = api.defaults.headers.authorization as string; // Type assertion
      // Or use type guard:
      if (typeof authToken === 'string') {
        const prefix =
          isBearer && !authToken.startsWith('Bearer') ? 'Bearer ' : '';
        headers.set('authorization', `${prefix}${authToken}`);
      }
    }
    return headers;
  };
