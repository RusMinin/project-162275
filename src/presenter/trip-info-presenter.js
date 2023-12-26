import TripInfoView from '../view/trip-info-view.js';
import { render, replace, RenderPosition } from '../framework/render.js';
import { isDatesEqual } from '../utils.js';

const MAX_DESTINATIONS_IN_TITLE = 3;

export default class TripInfoPresenter {
  #container = null;

  #eventsModel = null;
  #offersModel = null;
  #destinationsModel = null;

  #tripInfoComponent = null;

  constructor({ container, eventsModel, destinationsModel, offersModel }) {
    this.#container = container;
    this.#eventsModel = eventsModel;
    this.#offersModel = offersModel;
    this.#destinationsModel = destinationsModel;

    this.#eventsModel.addObserver(this.#handleModelEvent);
  }

  get events() {
    return this.#eventsModel.events;
  }

  get destinations() {
    return this.events.length
      ? this.events.map((event) => event.destination)
      : null;
  }

  get dates() {
    return this.events.length ? this.events
      .map((event) => ({
        dateFrom: event.dateFrom,
        dateTo: event.dateTo,
      }))
      : null;
  }

  init() {
    const prevTripInfoComponent = this.#tripInfoComponent;
    this.#tripInfoComponent = new TripInfoView({
      destinations: this.#getTripDestinations(),
      cost: this.#getTripCost(),
      dates: this.#getTripDates(),
    });

    if (!prevTripInfoComponent) {
      render(
        this.#tripInfoComponent,
        this.#container,
        RenderPosition.AFTERBEGIN
      );
      return;
    }

    replace(this.#tripInfoComponent, prevTripInfoComponent);
  }

  #getDestinationName(id) {
    return this.#destinationsModel.destinations.get(id).name;
  }

  #getTripDestinations() {
    const destinations = this.destinations;
    if (!destinations) {
      return null;
    }
    const result = { start: this.#getDestinationName(destinations[0]) };

    if (destinations.length === 1 && new Set(destinations).size === 1) {
      return result;
    }

    for (let i = 1; i < destinations.length; i++) {
      if (destinations[i] === destinations[i - 1]) {
        destinations.splice(i, 1);
        i--;
      }
    }

    result.end = this.#getDestinationName(destinations.at(-1));
    if (destinations.length >= MAX_DESTINATIONS_IN_TITLE) {
      result.middle =
        destinations.length === MAX_DESTINATIONS_IN_TITLE
          ? this.#getDestinationName(destinations[1])
          : '...';
    }

    return result;
  }

  #getOffersByType(type) {
    return new Map(this.#offersModel.offers.get(type));
  }

  #getEventCost({ basePrice, offers, type }) {
    if (!offers.length) {
      return basePrice;
    }
    const initialValue = 0;
    const typeOffers = this.#getOffersByType(type);
    const offersCost = offers.reduce(
      (accumulator, offerId) => accumulator + typeOffers.get(offerId).price,
      initialValue
    );
    return basePrice + offersCost;
  }

  #getTripCost() {
    const events = this.events;
    if (!events) {
      return null;
    }
    const initialValue = 0;
    return events.reduce(
      (accumulator, event) => accumulator + this.#getEventCost(event),
      initialValue
    );
  }

  #getTripDates() {
    const dates = this.dates;
    if (!dates) {
      return null;
    }

    const result = { start: dates[0].dateFrom };
    if (dates.length === 1) {
      if (!isDatesEqual(dates[0].dateFrom, dates[0].dateTo)) {
        result.end = dates[0].dateTo;
      }
      return result;
    }

    if (isDatesEqual(dates[0].dateFrom, dates.at(-1).dateTo)) {
      return result;
    }
    result.end = dates.at(-1).dateTo;
    return result;
  }

  #handleModelEvent = () => {
    this.init();
  };
}
