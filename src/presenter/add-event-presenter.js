import { render, remove, RenderPosition } from '../framework/render.js';
import { UserAction, UpdateType } from '../const.js';
import AddEventView from '../view/add-event-view.js';

import { customAlphabet } from 'nanoid';
const nanoid = customAlphabet('1234567890', 10);

export default class AddEventPresenter {
  #destinations = null;
  #offersByType = null;
  #destroyCallback = null;

  #addEventComponent = null;
  #tripEventsListContainer = null;

  #changeData = null;

  constructor(tripEventsListContainer, changeData) {
    this.#tripEventsListContainer = tripEventsListContainer;
    this.#changeData = changeData;
  }

  init = (destinations, offersByType, destroyCallback) => {
    this.#destinations = destinations;
    this.#offersByType = offersByType;
    this.#destroyCallback = destroyCallback;

    if (this.#addEventComponent !== null) {
      return;
    }

    this.#addEventComponent = new AddEventView(destinations, offersByType);

    this.#addEventComponent.setOnCancelEventButtonClick(this.#onCancelButtonClick);//
    this.#addEventComponent.setOnSubmitEventForm(this.#onFormSubmit);

    render(this.#addEventComponent, this.#tripEventsListContainer, RenderPosition.AFTERBEGIN);

    document.addEventListener('keydown', this.#onEscKeyDown);
  };

  destroy = () => {
    if (this.#addEventComponent === null) {
      return;
    }

    this.#destroyCallback?.();

    remove(this.#addEventComponent);
    this.#addEventComponent = null;

    document.removeEventListener('keydown', this.#onEscKeyDown);
  };

  #onEscKeyDown = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      this.destroy();
    }
  };

  #onCancelButtonClick = () => {
    this.destroy();
  };

  #onFormSubmit = (event) => {
    this.#changeData(UserAction.ADD_EVENT, UpdateType.MINOR, {id: nanoid(), ...event});
    this.destroy();
  };
}
