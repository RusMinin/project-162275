import FormView from '../view/form-view.js';
import { render, remove, RenderPosition } from '../framework/render.js';
import { isKeyEscape } from '../utils.js';
import { UserAction, UpdateType } from '../const.js';

export default class NewEventPresenter {
  #container = null;

  #formComponent = null;

  #offersModel = null;
  #destinationsModel = null;

  #handleDataChange = null;
  #handleDestroyNewEvent = null;

  constructor({
    container,
    offersModel,
    destinationsModel,
    onDataChange,
    onDestroy,
  }) {
    this.#container = container;
    this.#offersModel = offersModel;
    this.#destinationsModel = destinationsModel;
    this.#handleDataChange = onDataChange;
    this.#handleDestroyNewEvent = onDestroy;
  }

  init() {
    this.#formComponent = new FormView({
      offers: this.#offersModel.offers,
      destinations: this.#destinationsModel.destinations,
      container: this.#container,
      onFormSubmit: this.#handleFormSubmit,
      onFormReset: () => this.destroy(),
      isNewEvent: true,
    });

    render(this.#formComponent, this.#container, RenderPosition.AFTERBEGIN);
    document.addEventListener('keydown', this.#escKeyDownHandler);
  }

  destroy() {
    if (!this.#formComponent) {
      return;
    }
    this.#handleDestroyNewEvent();
    remove(this.#formComponent);
    this.#formComponent = null;
    document.removeEventListener('keydown', this.#escKeyDownHandler);
  }

  setSaving() {
    this.#formComponent.updateElement({
      isSaving: true,
      isDisabled: true,
    });
  }

  setAbortion() {
    const resetFormState = () => {
      this.#formComponent.updateElement({
        isSaving: false,
        isDeleting: false,
        isDisabled: false,
      });
    };

    this.#formComponent.shake(resetFormState);
  }

  #escKeyDownHandler = (evt) => {
    if (!isKeyEscape(evt)) {
      return;
    }
    evt.preventDefault();
    this.destroy();
  };

  #handleFormSubmit = (newEvent) => {
    this.#handleDataChange(UserAction.ADD_EVENT, UpdateType.MINOR, newEvent);
  };
}
