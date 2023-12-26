import EventView from '../view/event-view.js';
import FormView from '../view/form-view.js';
import { render, replace, remove } from '../framework/render.js';
import { isKeyEscape, isDatesEqual, getDuration } from '../utils.js';
import { UserAction, UpdateType } from '../const.js';

const Mode = {
  DEFAULT: 'DEFAULT',
  EDITING: 'EDITING',
};

export default class EventPresenter {
  #container = null;

  #event = null;
  #mode = Mode.DEFAULT;

  #eventComponent = null;
  #formComponent = null;

  #offersModel = null;
  #destinationsModel = null;

  #handleEventChange = null;
  #handleModeChange = null;

  #isOnlyOneShowing = null;

  constructor({
    container,
    offersModel,
    destinationsModel,
    onEventChange,
    onModeChange,
    isOnlyOneShowing,
  }) {
    this.#container = container;
    this.#offersModel = offersModel;
    this.#destinationsModel = destinationsModel;
    this.#handleEventChange = onEventChange;
    this.#handleModeChange = onModeChange;
    this.#isOnlyOneShowing = isOnlyOneShowing;
  }

  init(event) {
    this.#event = event;
    const typeOffers = this.#offersModel.offers.get(event.type);
    const destinationName = this.#destinationsModel.destinations.get(
      event.destination
    ).name;

    const prevEventComponent = this.#eventComponent;
    const prevFormComponent = this.#formComponent;

    this.#eventComponent = new EventView({
      event: this.#event,
      typeOffers,
      destinationName,
      onFormOpen: this.#handleFormOpen,
      onFavoriteClick: this.#handleFavoriteClick,
    });

    this.#formComponent = new FormView({
      event: this.#event,
      offers: this.#offersModel.offers,
      destinations: this.#destinationsModel.destinations,
      container: this.#container,
      onFormSubmit: this.#handleFormSubmit,
      onFormReset: this.#handleFormReset,
      onDelete: this.#handleEventDelete,
    });

    if (prevEventComponent === null || prevFormComponent === null) {
      render(this.#eventComponent, this.#container);
      return;
    }

    if (this.#mode === Mode.DEFAULT) {
      replace(this.#eventComponent, prevEventComponent);
    }

    if (this.#mode === Mode.EDITING) {
      replace(this.#eventComponent, prevFormComponent);
      this.#mode = Mode.DEFAULT;
    }

    remove(prevEventComponent);
    remove(prevFormComponent);
  }

  destroy() {
    remove(this.#eventComponent);
    remove(this.#formComponent);
    document.removeEventListener('keydown', this.#escKeyDownHandler);
  }

  resetView() {
    if (this.#mode !== Mode.DEFAULT) {
      this.#handleFormReset();
    }
  }

  setSaving() {
    if (this.#mode === Mode.EDITING) {
      this.#formComponent.updateElement({
        isSaving: true,
        isDisabled: true,
      });
    }
  }

  setDeleting() {
    if (this.#mode === Mode.EDITING) {
      this.#formComponent.updateElement({
        isDeleting: true,
        isDisabled: true,
      });
    }
  }

  setAbortion() {
    if (this.#mode === Mode.DEFAULT) {
      this.#eventComponent.shake();
      return;
    }

    const resetFormState = () => {
      this.#formComponent.updateElement({
        isSaving: false,
        isDeleting: false,
        isDisabled: false,
      });
    };

    this.#formComponent.shake(resetFormState);
  }

  #switchEventToForm() {
    replace(this.#formComponent, this.#eventComponent);
    this.#handleModeChange();
    this.#mode = Mode.EDITING;
  }

  #switchFormToEvent() {
    replace(this.#eventComponent, this.#formComponent);
    this.#mode = Mode.DEFAULT;
  }

  #escKeyDownHandler = (evt) => {
    if (!isKeyEscape(evt)) {
      return;
    }
    evt.preventDefault();
    this.#handleFormReset();
  };

  #handleFormOpen = () => {
    this.#switchEventToForm();
    document.addEventListener('keydown', this.#escKeyDownHandler);
  };

  #handleFormClose = () => {
    this.#switchFormToEvent();
    document.removeEventListener('keydown', this.#escKeyDownHandler);
  };

  #handleFormSubmit = (changedEvent) => {
    const isMinorUpdate =
      !isDatesEqual(this.#event.dateFrom, changedEvent.dateFrom) ||
      this.#event.basePrice !== changedEvent.basePrice ||
      getDuration(this.#event.dateFrom, this.#event.dateTo) !==
        getDuration(changedEvent.dateFrom, changedEvent.dateTo);

    this.#handleEventChange(
      UserAction.UPDATE_EVENT,
      isMinorUpdate ? UpdateType.MINOR : UpdateType.PATCH,
      changedEvent
    );
    document.removeEventListener('keydown', this.#escKeyDownHandler);
  };

  #handleEventDelete = () => {
    this.#handleEventChange(
      UserAction.DELETE_EVENT,
      this.#isOnlyOneShowing ? UpdateType.MINOR : UpdateType.MAJOR,
      this.#event
    );
  };

  #handleFormReset = () => {
    this.#formComponent.reset(this.#event);
    this.#handleFormClose();
  };

  #handleFavoriteClick = () => {
    this.#handleEventChange(UserAction.UPDATE_EVENT, UpdateType.PATCH, {
      ...this.#event,
      isFavorite: !this.#event.isFavorite,
    });
  };
}
