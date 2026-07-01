const PREFIX = 'rivery_';
const createPrefixedKey = (key: string) => `${PREFIX}${key}`;

export const Storage = {
  Keys: {
    TOKEN: 'token',
    LOGIN: 'login',
    GOOGLE_TOKEN: 'google_token',
    ENV: 'env',
    SHOW_ONBOARDING_KEY: 'showOnboardingKey',
    HIDE_ONBOARDING_KEY: 'hideOnboardingPopup',
    STARTER_LIMITATIONS_KEY: 'show-starter-limitations',
    BASE_LIMITATIONS_KEY: 'show-base-limitations',
    ACTIVE_RIVER_DISCLAIMER: 'active-river-disclaimer',
  },
  /**
   * store data in local storge with rivery prefix
   * @param key storage key
   * @param data any type of data
   * @param stringify (false) - if true, would be stringified as json
   */
  store(key: string, data: any, stringify = false) {
    const parsedData = stringify ? JSON.stringify(data) : data;
    localStorage.setItem(createPrefixedKey(key), parsedData);
  },

  /**
   * get data in local storge with rivery prefix
   * @param key storage key
   * @param parse (false) - if true, would be parsed by as json
   */
  getData(key: string, parse = false) {
    const data = localStorage.getItem(createPrefixedKey(key));
    return parse ? JSON.parse(data) : data;
  },

  clear() {
    Object.values(Storage.Keys).forEach(key =>
      localStorage.removeItem(createPrefixedKey(key)),
    );
  },
};
