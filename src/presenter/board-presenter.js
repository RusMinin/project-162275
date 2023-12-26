import EventsListView from '../view/events-list-view.js';
import NoEventsView from '../view/no-events-view.js';
import SortingView from '../view/sorting-view.js';
import EventPresenter from './event-presenter.js';
import NewEventPresenter from './new-event-presenter.js';
import { render, remove } from '../framework/render.js';
import UiBlocker from '../framework/ui-blocker/ui-blocker.js';
import {
  SortingNames,
  FiltersNames,
  UpdateType,
  UserAction,
  NoEventsMessages,
  UiBlockerTimeLimits,
} from '../const.js';
import { filtersFunctions, sortByTime, sortByPrice } from '../utils.js';

export default class BoardPresenter {
  #container = null;

  #eventsListComponent = new EventsListView();
  #sortingComponent = null;
  #noEventsComponent = null;

  #eventsModel = null;
  #offersModel = null;
  #destinationsModel = null;
  #filterModel = null;

  #eventsPresenters = new Map();
  #newEventPresenter = null;

  #currentSorting = SortingNames.DAY;

  #isLoading = true;

  #handleOnReady = null;
  #onNewEventDestroyHandler = null;

  #showingEventsNumber = 0;

  #uiBlocker = new UiBlocker({
    lowerLimit: UiBlockerTimeLimits.LOWER_LIMIT,
    upperLimit: UiBlockerTimeLimits.UPPER_LIMIT
  });

  constructor({
    container,
    eventsModel,
    offersModel,
    destinationsModel,
    filterModel,
    onNewEventDestroy,
    onReady,
  }) {
    this.#container = container;
    this.#eventsModel = eventsModel;
    this.#offersModel = offersModel;
    this.#destinationsModel = destinationsModel;
    this.#filterModel = filterModel;

    this.#onNewEventDestroyHandler = onNewEventDestroy;
    this.#handleOnReady = onReady;

    this.#eventsModel.addObserver(this.#handleModelEvent);
    this.#offersModel.addObserver(this.#handleModelEvent);
    this.#destinationsModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);
  }

  get events() {
    const filter = this.#filterModel.filter;
    const filteredEvents = filtersFunctions[filter](this.#eventsModel.events);
    this.#showingEventsNumber = filteredEvents.length;

    switch (this.#currentSorting) {
      case SortingNames.TIME:
        return filteredEvents.sort(sortByTime);
      case SortingNames.PRICE:
        return filteredEvents.sort(sortByPrice);
    }

    return filteredEvents;
  }

  init() {
    this.#renderBoard();
  }

  #renderBoard() {
    if (this.#isLoading) {
      this.#renderNoEvents({
        message: NoEventsMessages.LOADING,
      });
      return;
    }

    if (!this.events.length) {
      this.#renderNoEvents({
        message: NoEventsMessages[this.#filterModel.filter],
      });
      return;
    }

    this.#renderSorting();
    this.#renderEventsList();
  }

  #clearBoard() {
    if (this.#noEventsComponent) {
      remove(this.#noEventsComponent);
      this.#noEventsComponent = null;
    }
    if (this.#sortingComponent) {
      remove(this.#sortingComponent);
      this.#sortingComponent = null;
    }

    if (this.#eventsPresenters.size) {
      this.#clearEventsList();
    }
    this.#currentSorting = SortingNames.DAY;
  }

  #renderNoEvents({ message }) {
    if (this.#noEventsComponent) {
      remove(this.#noEventsComponent);
    }
    this.#noEventsComponent = new NoEventsView(message);
    render(this.#noEventsComponent, this.#container);
  }

  #renderSorting() {
    this.#sortingComponent = new SortingView({
      defaultSorting: this.#currentSorting,
      onSortingClick: this.#handleSortingClick,
    });
    render(this.#sortingComponent, this.#container);
  }

  #renderEventsList() {
    render(this.#eventsListComponent, this.#container);
    this.#renderEvents();
  }

  #clearEventsList() {
    if (this.#newEventPresenter) {
      this.#newEventPresenter.destroy();
    }
    this.#eventsPresenters.forEach((presenter) => presenter.destroy());
    this.#eventsPresenters.clear();
  }

  #renderEvents() {
    this.events.forEach((event) => this.#renderEvent(event));
  }

  #renderEvent(event) {
    const eventPresenter = new EventPresenter({
      container: this.#eventsListComponent.element,
      offersModel: this.#offersModel,
      destinationsModel: this.#destinationsModel,
      onEventChange: this.#handleViewAction,
      onModeChange: this.#handleModeChange,
      isOnlyOneShowing: this.#showingEventsNumber > 1,
    });
    eventPresenter.init(event);
    this.#eventsPresenters.set(event.id, eventPresenter);
  }

  createEvent() {
    this.#currentSorting = SortingNames.DAY;
    this.#filterModel.setFilter(UpdateType.MAJOR, FiltersNames.ALL);
    if (this.#noEventsComponent) {
      remove(this.#noEventsComponent);
      this.#noEventsComponent = null;
      this.#renderEventsList();
    }
    this.#newEventPresenter = new NewEventPresenter({
      container: this.#eventsListComponent.element,
      offersModel: this.#offersModel,
      destinationsModel: this.#destinationsModel,
      onDataChange: this.#handleViewAction,
      onDestroy: this.#handleNewEventDestroy,
    });
    this.#newEventPresenter.init();
  }

  #handleNewEventDestroy = () => {
    if (!this.events.length) {
      remove(this.#eventsListComponent);
      this.#renderNoEvents({
        message: NoEventsMessages[this.#filterModel.filter],
      });
    }
    this.#onNewEventDestroyHandler();
    this.#newEventPresenter = null;
  };

  #handleSortingClick = (sortType) => {
    if (sortType === this.#currentSorting) {
      return;
    }
    this.#currentSorting = sortType;
    this.#clearEventsList();
    this.#renderEvents();
  };

  #handleModeChange = () => {
    if (this.#newEventPresenter) {
      this.#newEventPresenter.destroy();
    }
    this.#eventsPresenters.forEach((presenter) => presenter.resetView());
  };

  #handleViewAction = async (actionType, updateType, update) => {
    this.#uiBlocker.block();
    switch (actionType) {
      case UserAction.UPDATE_EVENT:
        this.#eventsPresenters.get(update.id).setSaving();
        try {
          await this.#eventsModel.updateEvent(updateType, update);
        } catch (err) {
          this.#eventsPresenters.get(update.id).setAbortion();
        }
        break;
      case UserAction.ADD_EVENT:
        this.#newEventPresenter.setSaving();
        try {
          await this.#eventsModel.addEvent(updateType, update);
        } catch (err) {
          this.#newEventPresenter.get(update.id).setAbortion();
        }
        break;
      case UserAction.DELETE_EVENT:
        this.#eventsPresenters.get(update.id).setDeleting();
        try {
          await this.#eventsModel.removeEvent(updateType, update);
        } catch (err) {
          this.#eventsPresenters.get(update.id).setAbortion();
        }
        break;
    }
    this.#uiBlocker.unblock();
  };

  #handleModelEvent = (updateType, update) => {
    switch (updateType) {
      case UpdateType.PATCH:
        this.#eventsPresenters.get(update.id).init(update);
        break;
      case UpdateType.MINOR:
        this.#clearEventsList();
        this.#renderEvents();
        break;
      case UpdateType.MAJOR:
        this.#clearBoard();
        this.#renderBoard();
        break;
      case UpdateType.INIT:
        this.#isLoading = false;
        this.#clearBoard();
        this.#renderBoard();
        this.#handleOnReady();
        break;
    }
  };
}
