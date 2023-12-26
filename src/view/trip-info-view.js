import AbstractView from '../framework/view/abstract-view.js';
import dayjs from 'dayjs';
import { DateFormats } from '../const.js';

function createTitle(destinations) {
  return `${destinations.start}${destinations.middle ? ` &mdash; ${destinations.middle}` : ''}${destinations.end ? ` &mdash; ${destinations.end}` : ''}`;
}

function createDates(dates) {
  const startDate = dayjs(dates.start).format(DateFormats.DAY_HUMAN);
  if (!dates.end) {
    return startDate;
  }
  const endDate = !dayjs(dates.end).isSame(dates.start, 'month') ? `&nbsp;&mdash;&nbsp;${dayjs(dates.end).format(DateFormats.DAY_HUMAN)}` : `&nbsp;&mdash;&nbsp;${dayjs(dates.end).format(DateFormats.DAY)}`;
  return startDate + endDate;
}

function createTripInfoTemplate({ destinations, cost, dates }) {
  const title = destinations ? createTitle(destinations) : '...';
  const tripDates = dates ? createDates(dates) : '...';
  return `<section class="trip-main__trip-info  trip-info">
            <div class="trip-info__main">
              <h1 class="trip-info__title">
                ${title}
              </h1>

              <p class="trip-info__dates">
                ${tripDates}
              </p>
            </div>

            <p class="trip-info__cost">
              Total: &euro;&nbsp;
              <span class="trip-info__cost-value">
                ${cost ?? '0'}
              </span>
            </p>
          </section>`;
}

export default class TripInfoView extends AbstractView {
  #destinations = null;
  #cost = null;
  #dates = null;

  constructor({ destinations = null, cost = null, dates = null }) {
    super();
    this.#destinations = destinations;
    this.#cost = cost;
    this.#dates = dates;
  }

  get template() {
    return createTripInfoTemplate({
      destinations: this.#destinations,
      cost: this.#cost,
      dates: this.#dates,
    });
  }
}
