import ApiService from '../framework/api-service';

const Methods = {
  GET: 'GET',
  PUT: 'PUT',
  POST: 'POST',
  DELETE: 'DELETE',
};

export default class EventsApiService extends ApiService {
  get events() {
    return this._load({ url: 'points' }).then(ApiService.parseResponse);
  }

  async updateEvent(event) {
    const response = await this._load({
      url: `points/${event.id}`,
      method: Methods.PUT,
      body: JSON.stringify(this.#adaptToServer(event)),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });
    const parseResponse = await ApiService.parseResponse(response);
    return parseResponse;
  }

  async addEvent(event) {
    const response = await this._load({
      url: 'points',
      method: Methods.POST,
      body: JSON.stringify(this.#adaptToServer(event)),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });
    const parseResponse = await ApiService.parseResponse(response);
    return parseResponse;
  }

  async deleteEvent(event) {
    const response = await this._load({
      url: `points/${event.id}`,
      method: Methods.DELETE,
    });
    return response;
  }

  adaptToClient(event) {
    const adaptedEvent = {
      ...event,
      basePrice: event['base_price'],
      dateFrom: event['date_from'],
      dateTo: event['date_to'],
      isFavorite: event['is_favorite'],
    };

    delete adaptedEvent['base_price'];
    delete adaptedEvent['date_from'];
    delete adaptedEvent['date_to'];
    delete adaptedEvent['is_favorite'];

    return adaptedEvent;
  }

  #adaptToServer(event) {
    const adaptedEvent = {
      ...event,
      'base_price': event.basePrice,
      'date_from': event.dateFrom,
      'date_to': event.dateTo,
      'is_favorite': event.isFavorite,
    };

    delete adaptedEvent.basePrice;
    delete adaptedEvent.dateFrom;
    delete adaptedEvent.dateTo;
    delete adaptedEvent.isFavorite;

    return adaptedEvent;
  }
}
