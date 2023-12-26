import { SortingNames, EVENT_ITEMS } from '../const.js';
import AbstractView from '../framework/view/abstract-view.js';

function createSortingItemTemplate(name, defaultSorting) {
  const isActiveSorting = SortingNames[name.toUpperCase()];
  const attribute = isActiveSorting
    ? `data-sort-type=${isActiveSorting}`
    : 'disabled';
  const isDefaultSorting = isActiveSorting === defaultSorting
    ? 'checked'
    : '';

  return `<div class="trip-sort__item  trip-sort__item--${name}">
            <input id="sort-${name}" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="sort-${name}" ${attribute} ${isDefaultSorting}>
            <label class="trip-sort__btn" for="sort-${name}">${name}</label>
          </div>`;
}

function createSortingTemplate(defaultSorting) {
  const sortingItemsTemplate = EVENT_ITEMS.map((item) =>
    createSortingItemTemplate(item, defaultSorting)
  ).join('');

  return `<form class="trip-events__trip-sort  trip-sort" action="#" method="get">${sortingItemsTemplate}</form>`;
}

export default class SortingView extends AbstractView {
  #handleSortingClick = null;
  #defaultSorting = null;

  constructor({ defaultSorting, onSortingClick }) {
    super();
    this.#defaultSorting = defaultSorting;
    this.#handleSortingClick = onSortingClick;
    this.element
      .addEventListener('click', this.#sortingClickHandler);
  }

  get template() {
    return createSortingTemplate(this.#defaultSorting);
  }

  #sortingClickHandler = (evt) => {
    if (!evt.target.dataset.sortType) {
      return;
    }
    this.#handleSortingClick(evt.target.dataset.sortType);
  };
}
