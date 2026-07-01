export const formatDate = (date: string) => {
  const isDateValid = Boolean(date);
  const dateObj = isDateValid ? new Date(date) : new Date();
  return dateObj
    ? {
        time: new Intl.DateTimeFormat('default', {
          hour: 'numeric',
          minute: 'numeric',
        }).format(dateObj),
        display: new Intl.DateTimeFormat('default', {
          month: 'short',
          day: 'numeric',
        }).format(dateObj),
      }
    : {
        time: null,
        display: null,
      };
};
