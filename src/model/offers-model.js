import Observable from '../framework/observable.js';

export default class OffersModel extends Observable {
  #offers = new Map();
  #apiService = null;

  constructor({ apiService }) {
    super();
    this.#apiService = apiService;
  }

  get offers() {
    return this.#offers;
  }

  async init() {
    try {
      const data = await this.#apiService.offers;
      this.#offers = new Map(
        data.map(({ type, offers }) => [
          type,
          new Map(offers.map((offer) => [offer.id, offer])),
        ]));
    } catch (err) {
      throw new Error('Could\'t down load offers information');
    }
  }
}
