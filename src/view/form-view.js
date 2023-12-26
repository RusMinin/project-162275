import he from 'he';
import { EVENTS_TYPES, EMPTY_EVENT, DateFormats } from '../const.js';
import {
  startStringWithCapital,
  transformDate,
  getChosenItemsMap,
} from '../utils.js';
import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import flatpickr from 'flatpickr';

import 'flatpickr/dist/flatpickr.min.css';

function createTypesListItemTemplate({ title, isSelected }) {
  return `<div class="event__type-item">
            <input id="event-type-${title}-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${title}" ${isSelected ? 'checked' : ''}>
            <label class="event__type-label  event__type-label--${title}" for="event-type-${title}-1">
              ${startStringWithCapital(title)}
            </label>
          </div>`;
}

function createPicturesListTemplate(pictures) {
  const listItemsTemplate = pictures
    .map(
      ({ src, description }) =>
        `<img class="event__photo" src="${src}" alt="${description}">`
    )
    .join('');

  return `<div class="event__photos-container">
            <div class="event__photos-tape">
              ${listItemsTemplate}
            </div>
          </div>`;
}

function createDestinationInfoTemplate(destination) {
  const { description, pictures } = destination;

  const picturesTemplate = pictures ? createPicturesListTemplate(pictures) : '';

  return `<section class="event__section  event__section--destination">
            <h3 class="event__section-title  event__section-title--destination">Destination</h3>
            <p class="event__destination-description">${description}</p>
            ${picturesTemplate}
          </section>`;
}

function createOffersItemTemplate({ offer, isSelected, isDisabled }) {
  const { title, price, id } = offer;
  const selectedAttribute = isSelected ? 'checked' : '';
  return `<div class="event__offer-selector">
            <input class="event__offer-checkbox  visually-hidden" id="event-offer-${id}-1" type="checkbox"
              name="event-offer-${id}" ${selectedAttribute} data-offer-id="${id}"
              ${isDisabled ? 'disabled' : ''}>
            <label class="event__offer-label" for="event-offer-${id}-1">
              <span class="event__offer-title">${title}</span>
              &plus;&euro;&nbsp;
              <span class="event__offer-price">${price}</span>
            </label>
          </div>`;
}

function createOffersTemplate({ typeOffers, offersSelection, isDisabled }) {
  let offersItemsTemplate = '';
  typeOffers.forEach((offer) => {
    offersItemsTemplate += createOffersItemTemplate({
      offer,
      isSelected: offersSelection.get(offer.id),
      isDisabled,
    });
  });

  return `<section class="event__section  event__section--offers">
            <h3 class="event__section-title  event__section-title--offers">Offers</h3>
            <div class="event__available-offers">${offersItemsTemplate}<div>
          </section>`;
}

function createDataListItemTemplate(title) {
  return `<option value='${title}'></option>`;
}

function getControls({ isNewEvent, isDisabled, isDeleting }) {
  return isNewEvent
    ? `<button class="event__reset-btn" type="reset"
         ${isDisabled ? 'disabled' : ''}>Cancel</button>`
    : `<button class="event__reset-btn" type="reset"
         ${isDisabled ? 'disabled' : ''}>
         ${isDeleting ? 'Deleting...' : 'Delete'}</button>
       <button class="event__rollup-btn" type="button"
         ${isDisabled ? 'disabled' : ''}>
         <span class="visually-hidden">Open event</span>
       </button>`;
}

function createFormTemplate({ event, destinationsNames, isNewEvent }) {
  const {
    type,
    dateFrom,
    dateTo,
    basePrice,
    typeOffers,
    offersSelection,
    destinationInfo,
    destinationName,
    isSaving,
    isDeleting,
    isDisabled,
  } = event;

  const dataListTemplate = Array.from(destinationsNames.keys())
    .map((name) => createDataListItemTemplate(name))
    .join('');

  const destinationInputPattern = `(${Array.from(destinationsNames.keys()).join(
    ')|('
  )})`;

  const typesListTemplate = EVENTS_TYPES.map((title) =>
    createTypesListItemTemplate({ title, isSelected: type === title })
  ).join('');

  const offersTemplate = typeOffers.size
    ? createOffersTemplate({ typeOffers, offersSelection, isDisabled })
    : '';

  const destinationInfoTemplate = destinationInfo
    ? createDestinationInfoTemplate(destinationInfo)
    : '';

  const controls = getControls({ isNewEvent, isDisabled, isDeleting });

  return `<li class="trip-events__item">
            <form class="event event--edit" action="#" method="post" autocomplete="off">
              <header class="event__header">
                <div class="event__type-wrapper">
                  <label class="event__type  event__type-btn" for="event-type-toggle-1">
                    <span class="visually-hidden">Choose event type</span>
                    <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
                  </label>
                  <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox"
                    ${isDisabled ? 'disabled' : ''}>
                  <div class="event__type-list">
                    <fieldset class="event__type-group">
                      <legend class="visually-hidden">Event type</legend>
                      ${typesListTemplate}
                    </fieldset>
                  </div>
                </div>
                <div class="event__field-group  event__field-group--destination">
                  <label class="event__label  event__type-output" for="event-destination-1">
                    ${startStringWithCapital(type)}
                  </label>
                  <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination"
                    value="${destinationName ? he.encode(destinationName) : ''}"
                    list="destination-list-1"
                    pattern="${destinationInputPattern}"
                    oninvalid="this.setCustomValidity('Пожалуйста, выберите пункт назначения из предложенного списка')" onchange="this.setCustomValidity('')"
                    required ${isDisabled ? 'disabled' : ''}>
                  <datalist id="destination-list-1">${dataListTemplate}</datalist>
                </div>

                <div class="event__field-group  event__field-group--time">
                  <label class="visually-hidden" for="event-start-time-1">From</label>
                  <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time"
                    value="${dateFrom ? transformDate(dateFrom, DateFormats.FOR_FORM) : ''}"
                    required ${isDisabled ? 'disabled' : ''}>
                  &mdash;
                  <label class="visually-hidden" for="event-end-time-1">To</label>
                  <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time"
                    value="${dateTo ? transformDate(dateTo, DateFormats.FOR_FORM) : ''}"
                    required ${isDisabled ? 'disabled' : ''}>
                </div>

                <div class="event__field-group  event__field-group--price">
                  <label class="event__label" for="event-price-1">
                    <span class="visually-hidden">Price</span>
                    &euro;
                  </label>
                  <input class="event__input  event__input--price" id="event-price-1" type="text" name="event-price"
                    value="${he.encode(String(basePrice))}"
                    pattern="^[1-9]&bsol;d*$" required
                    oninvalid="this.setCustomValidity('Пожалуйста, введите целое положительное число')" onchange="this.setCustomValidity('')"
                    ${isDisabled ? 'disabled' : ''}>
                </div>

                <button class="event__save-btn  btn  btn--blue" type="submit"
                  ${isDisabled ? 'disabled' : ''}>
                    ${isSaving ? 'Saving...' : 'Save'}
                </button>
                  ${controls}
              </header>
              <section class="event__details">
                ${offersTemplate}
                ${destinationInfoTemplate}
              </section>
            </form>
          </li>`;
}

export default class FormView extends AbstractStatefulView {
  #offers = null;
  #destinations = null;
  #destinationsNames = null;

  #handleFormSubmit = null;
  #handleFormReset = null;
  #handleResetButton = null;

  #datepickerFrom = null;
  #datepickerTo = null;

  #isNewEvent = false;

  #saveButtonElement = null;

  constructor({
    event = EMPTY_EVENT,
    offers,
    destinations,
    onFormSubmit,
    onFormReset,
    onDelete = null,
    isNewEvent = false,
  }) {
    super();
    this.#offers = offers;
    this.#destinations = destinations;
    this.#destinationsNames = new Map(
      Array.from(this.#destinations.values()).map(({ id, name }) => [name, id])
    );
    this._setState(
      FormView.parseEventToState({
        event,
        offers: this.#offers,
        destinations: this.#destinations,
      })
    );
    this.#handleFormSubmit = onFormSubmit;
    this.#handleFormReset = onFormReset;
    this.#handleResetButton = onDelete ?? this.#handleFormReset;
    this.#isNewEvent = isNewEvent;
    this._restoreHandlers();
  }

  get template() {
    return createFormTemplate({
      event: this._state,
      destinationsNames: this.#destinationsNames,
      isNewEvent: this.#isNewEvent,
    });
  }

  removeElement() {
    super.removeElement();

    if (this.#datepickerFrom) {
      this.#datepickerFrom.destroy();
      this.#datepickerFrom = null;
    }
    if (this.#datepickerTo) {
      this.#datepickerTo.destroy();
      this.#datepickerTo = null;
    }
  }

  _restoreHandlers() {
    this.#saveButtonElement = this.element.querySelector('.event__save-btn');
    this.#saveButtonElement.disabled = !this.#isSavingAvailable();
    this.element
      .querySelector('form')
      .addEventListener('submit', this.#formSubmitHandler);
    this.element
      .querySelector('.event__reset-btn')
      .addEventListener('click', this.#resetBtnClickHandler);
    if (!this.#isNewEvent) {
      this.element
        .querySelector('.event__rollup-btn')
        .addEventListener('click', this.#closeBtnClickHandler);
    }
    this.element
      .querySelector('.event__input--destination')
      .addEventListener('change', this.#destinationChangeHandler);
    this.element
      .querySelector('.event__type-group')
      .addEventListener('change', this.#typeChangeHandler);
    if (this._state.typeOffers.size) {
      this.element
        .querySelector('.event__available-offers')
        .addEventListener('change', this.#offersChangeHandler);
    }
    this.element
      .querySelector('.event__input--price')
      .addEventListener('change', this.#priceChangeHandler);
    this.#setDatepickers();
  }

  reset(event) {
    this.updateElement(
      FormView.parseEventToState({
        event,
        offers: this.#offers,
        destinations: this.#destinations,
      })
    );
  }

  #isSavingAvailable() {
    return (
      this._state.destinationInfo &&
      Number(this._state.basePrice) &&
      this._state.dateFrom &&
      this._state.dateTo
    );
  }

  #setDatepickers() {
    const config = {
      dateFormat: DateFormats.FLATPICKR,
      enableTime: true,
      'time_24hr': true,
    };
    this.#datepickerFrom = flatpickr(
      this.element.querySelector('#event-start-time-1'),
      {
        ...config,
        defaultDate: this._state.dateFrom,
        maxDate: this._state.dateTo ?? null,
        onClose: ([date]) => {
          this._setState({ dateFrom: date ?? null });
          this.#datepickerTo.config.minDate = date ?? null;
          this.#saveButtonElement.disabled = !this.#isSavingAvailable();
        },
      }
    );
    this.#datepickerTo = flatpickr(
      this.element.querySelector('#event-end-time-1'),
      {
        ...config,
        defaultDate: this._state.dateTo,
        minDate: this._state.dateFrom ?? null,
        onClose: ([date]) => {
          this._setState({ dateTo: date ?? null });
          this.#datepickerFrom.config.maxDate = date ?? null;
          this.#saveButtonElement.disabled = !this.#isSavingAvailable();
        },
      }
    );
  }

  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    this.#handleFormSubmit(FormView.parseStateToEvent(this._state));
  };

  #resetBtnClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleResetButton();
  };

  #closeBtnClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleFormReset();
  };

  #destinationChangeHandler = (evt) => {
    evt.preventDefault();
    this.updateElement({
      destinationName: evt.target.value,
      destinationInfo: this.#destinationsNames.has(evt.target.value)
        ? this.#destinations.get(this.#destinationsNames.get(evt.target.value))
        : null,
    });
  };

  #typeChangeHandler = (evt) => {
    evt.preventDefault();
    if (evt.target.value === this._state.type) {
      return;
    }
    this.updateElement({
      type: evt.target.value,
      typeOffers: this.#offers.get(evt.target.value),
      offersSelection: getChosenItemsMap(
        Array.from(this._state.typeOffers.keys())
      ),
    });
  };

  #priceChangeHandler = (evt) => {
    evt.preventDefault();
    this._setState({
      basePrice: evt.target.value,
    });
    this.#saveButtonElement.disabled = !this.#isSavingAvailable();
  };

  #offersChangeHandler = (evt) => {
    evt.preventDefault();
    const offerId = evt.target.dataset.offerId;
    this._setState({
      offersSelection: this._state.offersSelection.set(
        offerId,
        !this._state.offersSelection.get(offerId)
      ),
    });
  };

  static parseEventToState({ event, offers, destinations }) {
    const state = { ...event };
    state.typeOffers = new Map(offers.get(state.type));
    state.offersSelection = state.offers.length
      ? getChosenItemsMap(Array.from(state.typeOffers.keys()), state.offers)
      : new Map();
    state.destinationInfo = state.destination
      ? destinations.get(state.destination)
      : null;
    state.destinationName = state.destinationInfo
      ? state.destinationInfo.name
      : null;

    state.isSaving = false;
    state.isDeleting = false;
    state.isDisabled = false;

    return state;
  }

  static parseStateToEvent(state) {
    const event = { ...state };
    event.destination = event.destinationInfo.id;
    event.offers = [];
    event.offersSelection.forEach((value, id) => {
      if (value) {
        event.offers.push(id);
      }
    });
    event.basePrice = Number(event.basePrice);

    delete event.typeOffers;
    delete event.offersSelection;
    delete event.destinationInfo;
    delete event.destinationName;
    delete event.isSaving;
    delete event.isDeleting;
    delete event.isDisabled;

    return event;
  }
}
