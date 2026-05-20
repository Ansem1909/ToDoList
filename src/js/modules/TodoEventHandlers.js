const DEFAULT_TRANSITION_DURATION_MS = 400;

export class TodoEventHandlers {
  constructor(state, renderer, elements, selectors, stateClasses, filterTypes) {
    this.state = state;
    this.renderer = renderer;
    this.elements = elements;
    this.selectors = selectors;
    this.stateClasses = stateClasses;
    this.filterTypes = filterTypes;

    this.onKeyDownBound = this.onKeyDown.bind(this);
    this.onBlurBound = this.onBlur.bind(this);
  }

  onNewTaskFormSubmit = (event) => {
    event.preventDefault();
    const newTodoItemTitle = this.elements.newTaskInput.value;
    if (newTodoItemTitle.trim().length > 0) {
      this.state.addItem(newTodoItemTitle);
      this.elements.newTaskInput.value = '';
      this.elements.newTaskInput.focus();
    }
  }

  onDeleteButtonClick = () => {
    this.state.clearCompleted();
  }

  getTransitionDurationMs(element) {
    const style = getComputedStyle(element);
    const durationStr = style.transitionDuration;
    const durations = durationStr.split(',').map(
      s => parseFloat(s)).filter(v => !isNaN(v)
    );
    if (durations.length === 0) return DEFAULT_TRANSITION_DURATION_MS;
    const maxSeconds = Math.max(...durations);
    return maxSeconds * 1000;
  }

  onClick = ({ target }) => {
    if (target.matches(this.selectors.itemDeleteButton)) {
      const itemElement = target.closest(this.selectors.item);
      if (!itemElement) return;
      const itemId = itemElement.dataset.itemId;

      itemElement.classList.add(this.stateClasses.isDisappearing);
      const duration = this.getTransitionDurationMs(itemElement);
      setTimeout(() => {
        this.state.deleteItem(itemId);
      }, duration);
    }
  }

  onDoubleClick = ({ target }) => {
    const itemElement = target.closest('[data-js-todo-item]');
    if (itemElement) {
      const itemId = itemElement.dataset.itemId;
      if (itemId) {
        this.state.startEditing(itemId);
      }
    }
  }

  onKeyDown = (event) => {
    if (this.state.editingItemId && event.key === 'Enter') {
      const input = this.elements.list.querySelector(
        `[data-item-id="${this.state.editingItemId}"] [data-js-todo-item-input]`
      );
      if (input) {
        this.state.saveEditing(this.state.editingItemId, input.value);
      }
      event.preventDefault();
    }
    else if (this.state.editingItemId && event.key === 'Escape') {
      this.state.cancelEditing();
    }
  }

  onBlur = (event) => {
    if (!this.state.editingItemId) return;
    if (!event.target.matches(this.selectors.itemInput)) return;

    const relatedTarget = event.relatedTarget;
    const isClickOnFilter = relatedTarget?.matches(this.selectors.filterButton);
    const isClickOnDelete = relatedTarget?.matches(this.selectors.itemDeleteButton);
    const isClickOutside = !relatedTarget || !this.elements.root.contains(relatedTarget);

    if (isClickOnFilter || isClickOnDelete || isClickOutside) {
      this.state.saveEditing(this.state.editingItemId, event.target.value);
    }
  }

  onChange = ({ target }) => {
    if (target.matches(this.selectors.itemCheckbox)) {
      const itemElement = target.closest(this.selectors.item);
      if (itemElement) {
        const itemId = itemElement.dataset.itemId;
        this.state.toggleCheckedState(itemId);
      }
    }
  }

  onFilterButtonClick = ({ target }) => {
    if (target.matches(this.selectors.filterButton)) {
      const filterType = target.dataset.filter;
      const { ALL, ACTIVE, COMPLETED } = this.filterTypes;

      if (filterType === ALL || filterType === ACTIVE || filterType === COMPLETED) {
        this.state.setFilter(filterType);
      }
    }
  }

  onCheckAllButtonClick = (event) => {
    event.preventDefault();
    this.state.toggleAllTasks();
  }

  fullRender() {
    const displayList = this.state.getDisplayList();

    this.renderer.updateUI(
      this.state.items,
      this.stateClasses
    );

    this.renderer.renderItems(
      displayList,
      this.state.editingItemId,
      this.stateClasses
    );

    this.renderer.focusEditingItem(
      this.state.editingItemId,
      this.elements.list
    );

    this.renderer.updateFilterButtons(
      this.elements.filterButtons,
      this.state.currentFilter,
      this.stateClasses
    );
  }

  bindEvents() {
    this.elements.newTaskForm.addEventListener('submit', this.onNewTaskFormSubmit);
    this.elements.checkAllButton.addEventListener('click', this.onCheckAllButtonClick);
    this.elements.deleteButton.addEventListener('click', this.onDeleteButtonClick);
    this.elements.list.addEventListener('click', this.onClick);
    this.elements.list.addEventListener('dblclick', this.onDoubleClick);
    this.elements.list.addEventListener('change', this.onChange);
    this.elements.list.addEventListener('blur', this.onBlurBound, true);
    this.elements.root.addEventListener('click', this.onFilterButtonClick);
    this.elements.root.addEventListener('keydown', this.onKeyDownBound);
  }
}