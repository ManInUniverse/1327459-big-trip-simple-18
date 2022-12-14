import { formatEventDateTime } from '../utils/event-utils.js';
import AbstractView from '../framework/view/abstract-view.js';

const createOffersTemplate = (offersByType, type, offers) => {
  const offersByCurrentType = offersByType.find((element) => element.type === type).offers;
  const offersById = offersByCurrentType.filter((element) => offers.includes(element.id));

  return offersById.map((offer) => {
    const { title, price } = offer;
    return (
      `<li class="event__offer">
        <span class="event__offer-title">${title}</span>
        &plus;&euro;&nbsp;
        <span class="event__offer-price">${price}</span>
      </li>`
    );
  }).join('');
};

const createEventTemplate = (event, destinations, offersByType) => {
  const { basePrice, dateFrom, dateTo, destination, type, offers } = event;
  const destinationName = destinations.find((element) => element.id === destination).name;

  return (
    `<li class="trip-events__item">
      <div class="event">
        <time class="event__date" datetime="${formatEventDateTime(dateFrom, 'YYYY-MM-DD')}">${formatEventDateTime(dateFrom, 'MMM DD')}</time>
        <div class="event__type">
          <img class="event__type-icon" width="42" height="42" src="img/icons/${type}.png" alt="Event type icon">
        </div>
        <h3 class="event__title">${type} ${destinationName}</h3>
        <div class="event__schedule">
          <p class="event__time">
            <time class="event__start-time" datetime="${formatEventDateTime(dateFrom, 'YYYY-MM-DDTHH:mm')}">${formatEventDateTime(dateFrom, 'H:mm')}</time>
            &mdash;
            <time class="event__end-time" datetime="${formatEventDateTime(dateTo, 'YYYY-MM-DDTHH:mm')}">${formatEventDateTime(dateTo, 'H:mm')}</time>
          </p>
        </div>
        <p class="event__price">
          &euro;&nbsp;<span class="event__price-value">${basePrice}</span>
        </p>
        <h4 class="visually-hidden">Offers:</h4>
        <ul class="event__selected-offers">
          ${createOffersTemplate(offersByType, type, offers)}
        </ul>
        <button class="event__rollup-btn" type="button">
          <span class="visually-hidden">Open event</span>
        </button>
      </div>
    </li>`
  );
};

export default class EventView extends AbstractView {
  #event = null;
  #destinations = null;
  #offersByType = null;

  constructor(event, destinations, offersByType) {
    super();
    this.#event = event;
    this.#destinations = destinations;
    this.#offersByType = offersByType;
  }

  get template() {
    return createEventTemplate(this.#event, this.#destinations, this.#offersByType);
  }

  setOnEditEventButtonClick = (callback) => {
    this._callback.click = callback;
    this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#onEditEventButtonClick);
  };

  #onEditEventButtonClick = (evt) => {
    evt.preventDefault();
    this._callback.click();
  };
}
