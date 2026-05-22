import { getTransitionDurationMs } from '../../utils/animation.js';

export class TaskClickHandler {
  constructor(state, selectors, stateClasses) {
    this.state = state;
    this.selectors = selectors;
    this.stateClasses = stateClasses;
  }

  handleDelete = (target) => {
    const itemElement = target.closest(this.selectors.item);
    if (!itemElement) return;
    const itemId = itemElement.dataset.itemId;
    itemElement.classList.add(this.stateClasses.isDisappearing);
    const duration = getTransitionDurationMs(itemElement);
    setTimeout(() => this.state.deleteItem(itemId), duration);
  }

  handleCheckbox = (target) => {
    const itemElement = target.closest(this.selectors.item);
    if (itemElement) {
      const itemId = itemElement.dataset.itemId;
      this.state.toggleCheckedState(itemId);
    }
  }

  handleDoubleClick = (target) => {
    const itemElement = target.closest(this.selectors.item);
    if (itemElement) {
      const itemId = itemElement.dataset.itemId;
      if (itemId) this.state.startEditing(itemId);
    }
  }
}