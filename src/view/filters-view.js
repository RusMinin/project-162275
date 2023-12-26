import AbstractView from '../framework/view/abstract-view.js';

function createFiltersItemTemplate({ name, isActive }, currentFilter) {
  const isCheckedAttribute = currentFilter === name ? 'checked' : '';
  const isActiveAttribute = isActive ? '' : 'disabled';
  return `<div class="trip-filters__filter">
            <input id="filter-${name}" class="trip-filters__filter-input  visually-hidden" type="radio" name="trip-filter" value="${name}" ${isCheckedAttribute} ${isActiveAttribute}>
            <label class="trip-filters__filter-label" for="filter-${name}">${name}</label>
          </div>`;
}

function createFiltersTemplate({ filters, currentFilter }) {
  const filtersItemsTemplate = filters
    .map((filter) => createFiltersItemTemplate(filter, currentFilter))
    .join('');

  return `<form class="trip-filters" action="#" method="get">
            <button class="visually-hidden" type="submit">Accept filter</button>
            ${filtersItemsTemplate}
          </form>`;
}

export default class FiltersView extends AbstractView {
  #filters = null;
  #currentFilter = null;
  #handleFilterChange = null;

  constructor({ filters, currentFilter, onFilterChange }) {
    super();
    this.#filters = filters;
    this.#currentFilter = currentFilter;
    this.#handleFilterChange = onFilterChange;
    this.element.addEventListener('change', this.#filterChangeHandler);
  }

  get template() {
    return createFiltersTemplate({
      filters: this.#filters,
      currentFilter: this.#currentFilter,
    });
  }

  #filterChangeHandler = (evt) => {
    evt.preventDefault();
    this.#handleFilterChange (evt.target.value);
  };
}
