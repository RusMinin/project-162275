import FiltersView from '../view/filters-view.js';
import { filtersFunctions } from '../utils.js';
import { UpdateType } from '../const.js';
import { render, replace, remove } from '../framework/render.js';

export default class FiltersPresenter {
  #container = null;

  #filterModel = null;
  #eventsModel = null;

  #filtersComponent = null;

  constructor({ container, filterModel, eventsModel }) {
    this.#container = container;
    this.#filterModel = filterModel;
    this.#eventsModel = eventsModel;

    this.#filterModel.addObserver(this.#handleModelEvent);
    this.#eventsModel.addObserver(this.#handleModelEvent);
  }

  get filters() {
    return Object.entries(filtersFunctions).map(([name, filterFn]) => ({
      name,
      isActive: Boolean(filterFn(this.#eventsModel.events).length),
    }));
  }

  init() {
    const prevFiltersComponent = this.#filtersComponent;

    this.#filtersComponent = new FiltersView({
      filters: this.filters,
      currentFilter: this.#filterModel.filter,
      onFilterChange: this.#handleFilterChange,
    });

    if (!prevFiltersComponent) {
      render(this.#filtersComponent, this.#container);
      return;
    }

    replace(this.#filtersComponent, prevFiltersComponent);
    remove(prevFiltersComponent);
  }

  #handleModelEvent = () => {
    this.init();
  };

  #handleFilterChange = (newFilter) => {
    if (this.#filterModel.filter === newFilter) {
      return;
    }
    this.#filterModel.setFilter(UpdateType.MAJOR, newFilter);
  };
}
