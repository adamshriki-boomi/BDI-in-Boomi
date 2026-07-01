/**
 * extracts a prop name from an item
 * @param propName a prop name to be extracted from an item
 */
export function pluck<T, ReturnType extends unknown>(propName: keyof T) {
  return (item: T) => item?.[propName] as ReturnType;
}

/**
 * compares "value" to "item[prop]"
 * @param propName a prop name to be extracted from an item and compared to value
 * @param transformFunction invokes the function with the item[propName] to return a nested value if required
 * .i.e compare('cross_id', someId, getOId) => performs: getOId(item.cross_id) === someID
 */
export function compare<T>(
  propName: keyof T,
  value: any,
  transformFunction?: (prop: any) => any,
  equal = true,
) {
  const getPropValue = propValue =>
    transformFunction ? transformFunction(propValue) : propValue;
  return (item: T): boolean => {
    return equal
      ? getPropValue(item?.[propName]) === value
      : getPropValue(item?.[propName]) !== value;
  };
}

/**
 * merge item with props
 * @example
 * const item = { id: 'abc' };
 * const props = { active: true }
 * const merge = merge(props)
 * merge(item)
 * returns - { id: 'abc', active: true }
 * @param condition - {function(item)} (optional, default: true) - if true will perform the merge, otherwise, returns original item
 */
export function merge<T, ReturnType extends unknown>(
  props: Record<string, any>,
  condition: (item: T) => boolean = () => true,
) {
  return (item: T) =>
    condition(item) ? ({ ...item, ...props } as ReturnType) : item;
}

/**
 * omit keys from object
 * @examples
 * omitFromObject({ id: 'abc', active: true },['active'])
 * returns - { id: 'abc' }
 *
 * omitFromObject({ id: 'abc', active: true },{ active: true })
 * returns - { id: 'abc' }
 *
 * @param src - Object
 * @param toRemove - Object with keys to remove or Array of strings
 */
export function omitFromObject(
  src: Record<string, any>,
  toRemove: Record<string, any> | string[],
) {
  if (toRemove && src) {
    const removeKeysArr =
      typeof toRemove === 'object' ? Object.keys(toRemove) : toRemove;
    return Object.fromEntries(
      Object.entries(src).filter(([key]) => !removeKeysArr.includes(key)),
    );
  } else {
    return src;
  }
}
/**
 * omits keys that are empty object in "src"
 * @example
 * omitEmptyKeys({ name: 'winery dogs', albums: {} }, ['albums'])
 * returns - { name: 'winery dogs' }
 */
export function omitEmptyKeys<TSrcKey>(
  src: Record<string, any>,
  keysToRemove: Array<keyof TSrcKey | string>,
) {
  return Object.fromEntries(
    Object.entries(src).filter(([key, value]) => {
      const shouldRemove =
        typeof value === 'object' &&
        keysToRemove.includes(key) &&
        isObjectEmpty(value);
      return !shouldRemove;
    }),
  );
}
/**
 * returns true if "data" doesn't include any keys
 * @param data a json objecy
 */
export function isObjectEmpty(data: Record<string, any>) {
  return data && Object.keys(data).length === 0;
}

export function convertArrayToObject(arr: any[], key: string) {
  return arr.reduce((obj, { details }) => {
    obj[details[key]] = details;
    return obj;
  }, {});
}

export const compareNumericItems = (a, b) => {
  return String(a)?.localeCompare(b, undefined, {
    numeric: true,
  });
};
