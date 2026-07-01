export const isFailureStatus = (value?: string | null): boolean => {
  if (!value) return false;
  const v = value.toLowerCase();
  return v.includes('fail') || v.includes('error');
};
