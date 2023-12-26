import Observable from '../framework/observable.js';
import { UpdateType } from '../const.js';
import { sortByDate } from '../utils.js';

export default class EventsModel extends Observable {
  #apiService = null;
  #events = new Map();

  constructor({ apiService }) {
    super();
    this.#apiService = apiService;
  }

  get events() {
    return Array.from(this.#events.values()).sort(sortByDate);
  }

  async init() {
    try {
      const data = await this.#apiService.events;
      this.#events = new Map(
        data.map((event) => [event.id, this.#apiService.adaptToClient(event)])
      );
    } catch (err) {
      this.#events = new Map();
    }
    this._notify(UpdateType.INIT);
  }

  async updateEvent(updateType, update) {
    if (!this.#events.has(update.id)) {
      throw new Error('Can\'t update nonexisting task');
    }

    try {
      const response = await this.#apiService.updateEvent(update);
      const updatedEvent = this.#apiService.adaptToClient(response);
      this.#events.set(updatedEvent.id, updatedEvent);
      this._notify(updateType, updatedEvent);
    } catch (err) {
      throw new Error('Can\'t update event');
    }
  }

  async addEvent(updateType, update) {
    try {
      const response = await this.#apiService.addEvent(update);
      const newEvent = this.#apiService.adaptToClient(response);
      this.#events.set(newEvent.id, newEvent);
      this._notify(updateType, newEvent);
    } catch (err) {
      throw new Error('Can\'t add new event');
    }
  }

  async removeEvent(updateType, update) {
    if (!this.#events.has(update.id)) {
      throw new Error('Can\'t delete nonexisting task');
    }
    try {
      await this.#apiService.deleteEvent(update);
      this.#events.delete(update.id);
      this._notify(updateType, update);
    } catch (err) {
      throw new Error('Can\'t delete event');
    }
  }
}
