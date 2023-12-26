import AbstractView from '../../framework/view/abstract-view.js';
import './error-style.css';

function createErrorMessageTemplate(message) {
  return `<div class="default__error">${message}</div>`;
}

export default class ErrorMessageView extends AbstractView {
  #message = '';

  constructor({ message }) {
    super();
    this.#message = message;
  }

  get template() {
    return createErrorMessageTemplate(this.#message);
  }
}
