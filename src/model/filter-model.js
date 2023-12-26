import Observable from '../framework/observable.js';
import { FiltersNames } from '../const.js';

export default class FilterModel extends Observable {
  #filter = FiltersNames.ALL;

  get filter() {
    return this.#filter;
  }

  setFilter(updateType, filter) {
    this.#filter = filter;
    this._notify(updateType, filter);
  }
}
