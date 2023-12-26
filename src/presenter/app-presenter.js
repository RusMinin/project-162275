import EventsApiService from '../service/events-api-service.js';
import OffersApiService from '../service/offers-api-service.js';
import DestinationsApiService from '../service/destinations-api-service.js';
import EventsModel from '../model/events-model.js';
import OffersModel from '../model/offers-model.js';
import DestinationsModel from '../model/destinations-model.js';
import FilterModel from '../model/filter-model.js';
import NewEventButtonView from '../view/new-event-button-view.js';
import TripInfoPresenter from './trip-info-presenter.js';
import FiltersPresenter from './filters-presenter.js';
import BoardPresenter from './board-presenter.js';
import ErrorMessageView from '../view/error/error-message-view.js';
import { render, remove, RenderPosition } from '../framework/render.js';
import { ERROR_TIME_SHOWING, NoEventsMessages } from '../const.js';

export default class AppPresenter {
  #tripMainElement = null;
  #filtersElement = null;
  #siteMainElement = null;

  #tripInfoPresenter = null;
  #filtersPresenter = null;
  #boardPresenter = null;
  #newEventButtonComponent = null;

  #eventsModel = null;
  #offersModel = null;
  #destinationsModel = null;
  #filterModel = new FilterModel();

  constructor({
    tripMainElement,
    filtersElement,
    siteMainElement,
    authorization,
    endPoint,
  }) {
    this.#tripMainElement = tripMainElement;
    this.#filtersElement = filtersElement;
    this.#siteMainElement = siteMainElement;
    this.#eventsModel = new EventsModel({
      apiService: new EventsApiService(endPoint, authorization),
    });
    this.#offersModel = new OffersModel({
      apiService: new OffersApiService(endPoint, authorization),
    });
    this.#destinationsModel = new DestinationsModel({
      apiService: new DestinationsApiService(endPoint, authorization),
    });
    this.#tripInfoPresenter = new TripInfoPresenter({
      container: tripMainElement,
      eventsModel: this.#eventsModel,
      offersModel: this.#offersModel,
      destinationsModel: this.#destinationsModel,
    });
  }

  init() {
    this.#tripInfoPresenter.init();
    this.#renderFilters();
    this.#renderBoard();
    this.#initModels();
  }

  async #initModels() {
    try {
      await Promise.all([
        this.#offersModel.init(),
        this.#destinationsModel.init(),
      ]);
      this.#eventsModel.init();
    } catch {
      this.#showDataErrorMessage();
    }
  }

  #showDataErrorMessage() {
    const errorMessageComponent = new ErrorMessageView({
      message: NoEventsMessages.ERROR,
    });
    render(
      errorMessageComponent,
      this.#siteMainElement,
      RenderPosition.AFTERBEGIN
    );
    setTimeout(() => remove(errorMessageComponent), ERROR_TIME_SHOWING);
  }

  #renderFilters() {
    this.#filtersPresenter = new FiltersPresenter({
      container: this.#filtersElement,
      filterModel: this.#filterModel,
      eventsModel: this.#eventsModel,
    });
    this.#filtersPresenter.init();
  }

  #renderBoard() {
    this.#boardPresenter = new BoardPresenter({
      container: this.#siteMainElement,
      eventsModel: this.#eventsModel,
      offersModel: this.#offersModel,
      destinationsModel: this.#destinationsModel,
      filterModel: this.#filterModel,
      onNewEventDestroy: this.#handleNewEventFormClose,
      onReady: this.#renderNewEventButton,
    });
    this.#boardPresenter.init();
  }

  #renderNewEventButton = () => {
    this.#newEventButtonComponent = new NewEventButtonView({
      onClick: this.#handleNewEventButtonClick,
    });
    render(this.#newEventButtonComponent, this.#tripMainElement);
  };

  #handleNewEventFormClose = () => {
    this.#newEventButtonComponent.element.disabled = false;
  };

  #handleNewEventButtonClick = () => {
    this.#boardPresenter.createEvent();
    this.#newEventButtonComponent.element.disabled = true;
  };
}
