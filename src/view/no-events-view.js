import AbstractView from '../framework/view/abstract-view.js';

function createNoEventsTemplate(message) {
  return `<p class="trip-events__msg">${message}</p>`;
}

export default class NoEventsView extends AbstractView {
  #message = '';

  constructor(message) {
    super();
    this.#message = message;
  }

  get template() {
    return createNoEventsTemplate(this.#message);
  }
}
