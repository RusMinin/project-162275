import { DurationFormats, FiltersNames } from './const.js';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(duration);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

function transformDate(date, format) {
  return dayjs(date).format(format);
}

function isDatesEqual(dateA, dateB) {
  return dayjs(dateA).isSame(dateB, 'day');
}

function calculateDuration(timeFrom, timeTo) {
  return dayjs.duration(dayjs(timeTo).diff(timeFrom));
}

function getDuration(timeFrom, timeTo) {
  const timeDuration = calculateDuration(timeFrom, timeTo);

  const isDaysLong = Boolean(timeDuration.days());
  const isHoursLong = Boolean(timeDuration.hours());

  let format;

  switch (true) {
    case isDaysLong:
      format = DurationFormats.DAYS;
      break;
    case isHoursLong:
      format = DurationFormats.HOURS;
      break;
    default:
      format = DurationFormats.MINUTES;
  }

  return timeDuration.format(format);
}

function startStringWithCapital(str) {
  return str[0].toUpperCase() + str.substring(1);
}

function isKeyEscape(evt) {
  return evt.key === 'Escape';
}

const filtersFunctions = {
  [FiltersNames.ALL]: (events) => events,
  [FiltersNames.FUTURE]: (events) =>
    events.filter(({ dateFrom }) => dayjs(dateFrom).isAfter(dayjs(), 'day')),
  [FiltersNames.PRESENT]: (events) =>
    events.filter(
      ({ dateFrom, dateTo }) =>
        dayjs(dateFrom).isSameOrBefore(dayjs(), 'day') &&
        dayjs(dateTo).isSameOrAfter(dayjs(), 'day')
    ),
  [FiltersNames.PAST]: (events) =>
    events.filter(({ dateTo }) => dayjs(dateTo).isBefore(dayjs(), 'day')),
};

function sortByTime(itemA, itemB) {
  const timeA = calculateDuration(itemA.dateFrom, itemA.dateTo).asMinutes();
  const timeB = calculateDuration(itemB.dateFrom, itemB.dateTo).asMinutes();
  return timeB - timeA;
}

function sortByPrice(itemA, itemB) {
  return itemB.basePrice - itemA.basePrice;
}

function sortByDate(itemA, itemB) {
  const byDateFrom = dayjs(itemA.dateFrom).diff(itemB.dateFrom, 'day');
  if (byDateFrom !== 0) {
    return byDateFrom;
  }
  return dayjs(itemA.dateTo).diff(itemB.dateTo);
}

function getChosenItemsMap(items, chosenItems = []) {
  if (!items.length) {
    return new Map();
  }

  const map = new Map();
  items.forEach((item) => {
    map.set(item, chosenItems.includes(item));
  });
  return map;
}

export {
  transformDate,
  isDatesEqual,
  getDuration,
  startStringWithCapital,
  isKeyEscape,
  filtersFunctions,
  sortByTime,
  sortByPrice,
  sortByDate,
  getChosenItemsMap,
};
