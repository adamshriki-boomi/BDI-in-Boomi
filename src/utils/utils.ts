export const enum Regions {
  US = 'us',
}
export function isProdDomain(region = null) {
  const domainList = import.meta.env.VITE_ENABLED_DOMAINS?.split(',');
  const allowedDomains = region === Regions.US ? [domainList[0]] : domainList;
  const domain = window.location.host;
  return allowedDomains.includes(domain);
}
export const compareObjects = (obj1, obj2) =>
  JSON.stringify(obj1) === JSON.stringify(obj2);

export function toErrorString(err: any): string | undefined {
  if (!err) return undefined;
  if (typeof err === 'string') return err;
  return err?.msg ?? JSON.stringify(err);
}
