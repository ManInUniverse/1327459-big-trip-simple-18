import { formatEventDateTime, isOfferChecked } from '../utils/event-utils.js';
import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

const createOffersTemplate = (type, offers, offersByType, isDisabled) => {
  const offersByCurrentType = offersByType.find((element) => element.type === type).offers;

  return offersByCurrentType.map(({ id, title, price }) =>
    `<div class="event__offer-selector" ${isDisabled ? 'disabled' : ''}>
      <input class="event__offer-checkbox  visually-hidden" id="event-offer-${title}-1" type="checkbox" name="event-offer-${title}" data-offer-id="${id}" ${isOfferChecked(offers, id) ? 'checked' : ''}>
      <label class="event__offer-label" for="event-offer-${title}-1">
        <span class="event__offer-title">${title}</span>
        &plus;&euro;&nbsp;
        <span class="event__offer-price">${price}</span>
      </label>
    </div>`
  ).join('');
};

const createDestinationListTemplate = (destinations, isDisabled) => destinations.map((element) => `<option value="${element.name}" ${isDisabled ? 'disabled' : ''}></option>`).join('');

const createEventTypeListTemplate = (offersByType, type, isDisabled) => {
  const eventTypes = offersByType.map((element) => element.type);

  return eventTypes.map((eventType) =>
    `<div class="event__type-item" ${isDisabled ? 'disabled' : ''}>
      <input id="event-type-${eventType}-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${eventType}" ${eventType === type ? 'checked' : ''}>
      <label class="event__type-label  event__type-label--${eventType}" for="event-type-${eventType}-1">${eventType}</label>
    </div>`
  ).join('');
};

const createEditEventTemplate = (event, destinations, offersByType) => {
  const { basePrice, dateFrom, dateTo, destination, type, offers, isDisabled, isSaving, isDeleting } = event;
  const currentDestination = destinations.find((element) => element.id === destination);

  return (
    `<li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type  event__type-btn" for="event-type-toggle-1">
              <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
            </label>
            <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox">

            <div class="event__type-list">
              <fieldset class="event__type-group">
                <legend class="visually-hidden">Event type</legend>
                ${createEventTypeListTemplate(offersByType, type, isDisabled)}
              </fieldset>
            </div>
          </div>

          <div class="event__field-group  event__field-group--destination">
            <label class="event__label  event__type-output" for="event-destination-1">
              ${type}
            </label>
            <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${currentDestination.name}" list="destination-list-1" required>
            <datalist id="destination-list-1">
              ${createDestinationListTemplate(destinations, isDisabled)}
            </datalist>
          </div>

          <div class="event__field-group  event__field-group--time">
            <label class="visually-hidden" for="event-start-time-1">From</label>
            <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${formatEventDateTime(dateFrom, 'DD/MM/YY HH:mm')}">
            &mdash;
            <label class="visually-hidden" for="event-end-time-1">To</label>
            <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${formatEventDateTime(dateTo, 'DD/MM/YY HH:mm')}">
          </div>

          <div class="event__field-group  event__field-group--price">
            <label class="event__label" for="event-price-1">
              <span class="visually-hidden">Price</span>
              &euro;
            </label>
            <input class="event__input  event__input--price" id="event-price-1" type="number" min="1" max="9999999" required name="event-price" value="${basePrice}">
          </div>

          <button class="event__save-btn  btn  btn--blue" type="submit" ${isDisabled ? 'disabled' : ''}>${isSaving ? 'Saving...' : 'Save'}</button>
          <button class="event__reset-btn" type="reset" ${isDisabled ? 'disabled' : ''}>${isDeleting ? 'Deleting...' : 'Delete'}</button>
          <button class="event__rollup-btn" type="button">
            <span class="visually-hidden">Open event</span>
          </button>
        </header>
        <section class="event__details">
          <section class="event__section  event__section--offers">
            <h3 class="event__section-title  event__section-title--offers">Offers</h3>

            <div class="event__available-offers">
              ${createOffersTemplate(type, offers, offersByType, isDisabled)}
            </div>
          </section>

          <section class="event__section  event__section--destination">
            <h3 class="event__section-title  event__section-title--destination">Destination</h3>
            <p class="event__destination-description">${currentDestination.description}</p>
          </section>
        </section>
      </form>
    </li>`
  );
};

export default class EditEventView extends AbstractStatefulView {
  #dateFromPicker = null;
  #dateToPicker = null;

  #destinations = null;
  #offersByType = null;

  constructor(event, destinations, offersByType) {
    super();
    this._state = EditEventView.parseEventToState(event);
    this.#destinations = destinations;
    this.#offersByType = offersByType;

    this.#setInnerHandlers();
    this.#setDatePickers();
  }

  get template() {
    return createEditEventTemplate(this._state, this.#destinations, this.#offersByType);
  }

  _restoreHandlers = () => {
    this.#setInnerHandlers();

    this.setOnSubmitEventForm(this._callback.submitEventForm);
    this.setOnCloseEditEventButtonClick(this._callback.closeClick);
    this.setOnDeleteEventButtonClick(this._callback.deleteClick);

    this.#setDatePickers();
  };

  removeElement = () => {
    super.removeElement();

    if (this.#dateFromPicker || this.#dateToPicker) {
      this.#dateFromPicker.destroy();
      this.#dateToPicker.destroy();
      this.#dateFromPicker = null;
      this.#dateToPicker = null;
    }
  };

  reset = (event) => {
    this.updateElement(EditEventView.parseEventToState(event));
  };

  setOnCloseEditEventButtonClick = (callback) => {
    this._callback.closeClick = callback;
    this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#onCloseEditEventButtonClick);
  };

  setOnSubmitEventForm = (callback) => {
    this._callback.submitEventForm = callback;
    this.element.querySelector('form').addEventListener('submit', this.#onSubmitEventForm);
  };

  setOnDeleteEventButtonClick = (callback) => {
    this._callback.deleteClick = callback;
    this.element.querySelector('.event__reset-btn').addEventListener('click', this.#onDeleteEventButtonClick);
  };

  #setInnerHandlers = () => {
    this.element.addEventListener('change', this.#onOfferChange);
    this.element.addEventListener('change', this.#onEventTypeChange);
    this.element.addEventListener('change', this.#onDestinationChange);
    this.element.addEventListener('change', this.#onPriceChange);
  };

  #setDatePickers = () => {
    this.#dateFromPicker = flatpickr(this.element.querySelector('input[name="event-start-time"].event__input--time'), {
      enableTime: true,
      dateFormat: 'd/m/y H:i',
      defaultDate: this._state.dateFrom,
      onChange: this.#onDateFromChange
    });
    this.#dateToPicker = flatpickr(this.element.querySelector('input[name="event-end-time"].event__input--time'), {
      enableTime: true,
      dateFormat: 'd/m/y  H:i',
      defaultDate: this._state.dateTo,
      onChange: this.#onDateToChange
    });
  };

  #onCloseEditEventButtonClick = (evt) => {
    evt.preventDefault();
    this._callback.closeClick();
  };

  #onSubmitEventForm = (evt) => {
    evt.preventDefault();
    if (this._state.dateFrom > this._state.dateTo) {
      return;
    }
    this._callback.submitEventForm(EditEventView.parseStateToEvent(this._state), this.#destinations, this.#offersByType);
  };

  #onDeleteEventButtonClick = (evt) => {
    evt.preventDefault();
    this._callback.deleteClick(EditEventView.parseStateToEvent(this._state));
  };

  #onOfferChange = (evt) => {
    if (!evt.target.closest('input[type="checkbox"].event__offer-checkbox')) {
      return;
    }

    evt.preventDefault();
    const checkedOffers = [...this._state.offers];
    if (evt.target.checked) {
      checkedOffers.push(Number(evt.target.dataset.offerId));
    } else {
      const idIndex = checkedOffers.indexOf(Number(evt.target.dataset.offerId));
      checkedOffers.splice(idIndex, 1);
    }

    this.updateElement({
      offers: checkedOffers
    });
  };

  #onEventTypeChange = (evt) => {
    if (!evt.target.closest('input[type="radio"].event__type-input')) {
      return;
    }

    evt.preventDefault();
    this.updateElement({
      type: evt.target.value,
      offers: []
    });
  };

  #onDestinationChange = (evt) => {
    if (!evt.target.closest('input[type="text"].event__input--destination')) {
      return;
    }

    evt.preventDefault();

    let optionFound = false;
    const datalist = evt.target.list;
    for (let i = 0; i < datalist.options.length; i++) {
      if (evt.target.value === datalist.options[i].value) {
        optionFound = true;
        break;
      }
    }

    if (optionFound) {
      evt.target.setCustomValidity('');
    } else {
      evt.target.setCustomValidity('Please select a destination from list');
    }


    const newDestination = this.#destinations.find((destination) => destination.name === evt.target.value).id;
    this.updateElement({
      destination: newDestination
    });
  };

  #onPriceChange = (evt) => {
    if (!evt.target.closest('input[type="number"].event__input--price')) {
      return;
    }

    evt.preventDefault();
    this.updateElement({
      basePrice: evt.target.value
    });
  };

  #onDateFromChange = ([userDate]) => {
    this.updateElement({
      dateFrom: userDate
    });
  };

  #onDateToChange = ([userDate]) => {
    this.updateElement({
      dateTo: userDate
    });
  };

  static parseEventToState = (event) => ({...event,
    isDisabled: false,
    isSaving: false,
    isDeleting: false,
  });

  static parseStateToEvent = (state) => {
    const event = {...state};

    delete event.isDisabled;
    delete event.isSaving;
    delete event.isDeleting;

    return event;
  };
}
