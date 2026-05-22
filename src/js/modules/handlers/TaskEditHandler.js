export class TaskEditHandler {
  constructor(state, elements, selectors) {
    this.state = state;
    this.elements = elements;
    this.selectors = selectors;
  }

  handleKeyDown = (event) => {
    if (!this.state.editingItemId) return;
    if (event.key === 'Enter') {
      const input = this.elements.list.querySelector(
        `[data-item-id="${this.state.editingItemId}"] [data-js-todo-item-input]`
      );
      if (input) this.state.saveEditing(this.state.editingItemId, input.value);
      event.preventDefault();
    } else if (event.key === 'Escape') {
      this.state.cancelEditing();
    }
  }

  handleBlur = (event) => {
    if (!this.state.editingItemId) return;
    if (!event.target.matches(this.selectors.itemInput)) return;
    this.state.saveEditing(this.state.editingItemId, event.target.value);
  }
}