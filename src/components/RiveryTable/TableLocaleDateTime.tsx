export const TableLocaleDateTime = ({ value }) => {
  if (!value) {
    return null;
  }

  return new Date(value).toDateString();
};
