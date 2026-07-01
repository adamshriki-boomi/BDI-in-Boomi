import { format, isValid } from 'date-fns';
export const patternDate = 'dd-MMM-yy, HH:mm';
export const displayDate = (input, pattern = 'dd MMMM yyyy') => {
  const date = new Date(input?.$date || input);
  const isValidDate = isValid(date);
  return input && isValidDate ? format(date, pattern) : 'N/A';
};

export const durationFormat = timeArray => {
  const hours = timeArray[0] !== '0' ? `${timeArray[0]}h` : '';
  const minutes = `${timeArray[1]}m`;
  const seconds = `${timeArray[2]}s`;
  return `${hours} ${minutes} ${seconds}`;
};

export function durationFromMilSeconds(ms) {
  // Calculate total seconds from milliseconds
  const totalSeconds = Math.floor(ms / 1000);
  // Calculate hours, minutes, and seconds
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  // Pad single digits with leading zeros
  const paddedHours = String(hours).padStart(2, '0');
  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = String(seconds).padStart(2, '0');
  const timeArray = [paddedHours, paddedMinutes, paddedSeconds];
  // Return formatted time string
  return durationFormat(timeArray);
}

export const convertDateToISO = (date: number | Date) =>
  new Date(date).toISOString();

export function calculateTime(unit: 'H' | 'D' | 'C', amount) {
  const date = new Date();
  let current = date.getTime();
  let event_start_time;
  if (unit === 'C') {
    const midnight = new Date(date.setDate(date.getDate())).setHours(
      0,
      0,
      0,
      0,
    );
    event_start_time = midnight;
  }
  if (unit === 'H') {
    event_start_time = date.setHours(date.getHours() - amount);
  } else if (unit === 'D') {
    event_start_time = date.setDate(date.getDate() - amount);
  }
  return { event_start_time, event_end_time: current };
}

export const getTimeNow = () => {
  const { event_start_time: start_time, event_end_time: end_time } =
    calculateTime('C', 0);
  return {
    start_time,
    end_time,
  };
};

export function getDayPart() {
  const now = new Date();
  const hours = now.getHours();
  return hours < 12 ? 'Morning' : hours < 18 ? 'Afternoon' : 'Evening';
}

export function getTimeZone() {
  const offset = new Date().getTimezoneOffset(),
    o = Math.abs(offset);
  return (
    (offset < 0 ? '+ ' : '- ') +
    ('00' + Math.floor(o / 60)).slice(-2) +
    ':' +
    ('00' + (o % 60)).slice(-2)
  );
}
