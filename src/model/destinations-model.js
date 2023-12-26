import Observable from '../framework/observable.js';

export default class DestinationsModel extends Observable {
  #destinations = new Map();
  #apiService = null;

  constructor({ apiService }) {
    super();
    this.#apiService = apiService;
  }

  get destinations() {
    return this.#destinations;
  }

  async init() {
    try {
      const data = await this.#apiService.destinations;
      this.#destinations = new Map(
        data.map((destination) => [destination.id, destination])
      );
    } catch (err) {
      throw new Error('Could\'t down load destinations information');
    }
  }
}
