class Todo {
  selectors = {
    root: '[data-js-todo]',
    newTaskForm: '[data-js-todo-new-task-form]',
    newTaskInput: '[data-js-todo-new-task-input]',
    checkAllButton: '[data-js-todo-check-all-button]',
    totalTasks: '[data-js-todo-total-tasks]',
    filterButtons: '[data-js-todo-filter-buttons]',
    filterButton: '[data-js-todo-filter-button]',
    deleteButton: '[data-js-todo-delete-button]',
    list: '[data-js-todo-list]',
    item: '[data-js-todo-item]',
    itemCheckbox: '[data-js-todo-item-checkbox]',
    itemLabel: '[data-js-todo-item-label]',
    itemDeleteButton: '[data-js-todo-item-delete-button]',
    itemInput: '[data-js-todo-item-input]',
  }

  stateClasses = {
    isVisible: 'is-visible',
    isDisappearing: 'is-disappearing',
    isEditing: 'is-editing',
    isActive: 'is-active',
  }

  filterTypes = {
    ALL: 'all',
    ACTIVE: 'active',
    COMPLETED: 'completed',
  }

  localStorageKey = 'todo-items';

  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  constructor() {
    this.rootElement = document.querySelector(this.selectors.root);

    if (!this.rootElement) {
      throw new Error(`Root element ${this.selectors.root} not found`);
    }

    this.newTaskFormElement = this.rootElement.querySelector(this.selectors.newTaskForm);
    this.newTaskInputElement = this.rootElement.querySelector(this.selectors.newTaskInput);
    this.checkAllButtonElement = this.rootElement.querySelector(this.selectors.checkAllButton);
    this.totalTasksElement = this.rootElement.querySelector(this.selectors.totalTasks);
    this.filterButtonElements = this.rootElement.querySelectorAll(this.selectors.filterButton);
    this.deleteButtonElement = this.rootElement.querySelector(this.selectors.deleteButton);
    this.listElement = this.rootElement.querySelector(this.selectors.list);

    if (!this.newTaskFormElement || !this.newTaskInputElement || !this.listElement) {
      throw new Error('Critical Todo elements not found');
    }

    this.state = {
      items: this.getItemsInfoFromLocalStorage(),
      filteredItems: null,
      currentFilter: this.filterTypes.ALL,
    }

    this.editingItemId = null;

    this.onKeyDownBound = this.onKeyDown.bind(this);
    this.onBlurBound = this.onBlur.bind(this);

    this.render();
    this.bindEvents();
    this.setFilterFromFilterPanel('all');
  }

  getItemsInfoFromLocalStorage() {
    const rawDada = localStorage.getItem(this.localStorageKey);

    if(!rawDada) {
      return [];
    }

    try {
      const parsedData = JSON.parse(rawDada);

      return Array.isArray(parsedData) ? parsedData : [];
    } catch {
      console.error('Todo items parse error');
      return [];
    }
  }

  saveItemsToLocalStorage() {
    localStorage.setItem(this.localStorageKey, JSON.stringify(this.state.items));
  }

  updateUI() {
    this.totalTasksElement.textContent = this.state.items.length;

    const hasTasks = this.state.items.length > 0;
    const hasCompletedTasks = this.state.items.some(item => item.isChecked);

    this.deleteButtonElement.classList.toggle(this.stateClasses.isVisible, hasTasks);
    this.checkAllButtonElement.classList.toggle(this.stateClasses.isVisible, hasTasks);

    this.deleteButtonElement.classList.toggle('is-inactive', !hasCompletedTasks);

    const filterContainer = this.rootElement.querySelector(this.selectors.filterButtons);
    if (filterContainer) {
      filterContainer.classList.toggle(this.stateClasses.isVisible, hasTasks);
    }
  }

  renderItems() {
    const items = this.state.filteredItems ?? this.state.items;
    const sortedItems = [...items].reverse();

    this.listElement.innerHTML = sortedItems.map(({ id, title, isChecked }) => {
      const isEditing = this.editingItemId === id;
      const escapedTitle = this.escapeHtml(title);
      return `
    <li class="todo__item todo-item ${isEditing ? this.stateClasses.isEditing : ''}" 
        data-js-todo-item
        data-item-id="${id}">
      <input
          class="todo-item__checkbox"
          id="${id}"
          type="checkbox"
          ${isChecked ? 'checked' : ''}
          ${isEditing ? 'disabled' : ''}
          data-js-todo-item-checkbox
      />
      <label
          class="todo-item__label"
          for="${id}"
          data-js-todo-item-label
      >
        ${escapedTitle}
      </label>
      <input
          class="todo-item__input"
          type="text"
          value="${escapedTitle}"
          data-js-todo-item-input
      />
      <button
          class="todo-item__delete-button"
          data-js-todo-item-delete-button
          aria-label="Delete"
          title="Delete"
          ${isEditing ? 'disabled' : ''}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 5L5 15M5 5L15 15" stroke="#757575" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </li>
    `;
    }).join(' ');
  }

  focusEditingItem() {
    if (!this.editingItemId) return;

    const input = this.listElement.querySelector(
      `[data-item-id="${this.editingItemId}"] [data-js-todo-item-input]`
    );

    if (input) {
      input.focus();
      input.select();
    }
  }

  render() {
    this.updateUI();
    this.renderItems();
    this.focusEditingItem();
  }

  addItem(title) {
    const escapedTitle = this.escapeHtml(title.trim());

    if (escapedTitle === '') return;

    this.state.items = [
      ...this.state.items,
      {
        id: crypto?.randomUUID() ?? Date.now().toString(),
        title: escapedTitle,
        isChecked: false,
      }
    ];

    this.updateStateAndRender();
  }

  deleteItem(id) {
    this.state.items = this.state.items.filter((item) => item.id !== id);

    this.updateStateAndRender();
  }

  startEditing(id) {
    this.editingItemId = id;
    this.render();
  }

  saveEditing(id, newTitle) {
    const escapedTitle = this.escapeHtml(newTitle.trim());

    if (escapedTitle === '') {
      this.deleteItem(id);
    } else {
      this.state.items = this.state.items.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            title: escapedTitle,
          };
        }
        return item;
      });

      this.saveItemsToLocalStorage();
    }

    this.editingItemId = null;
    this.render();
  }

  cancelEditing() {
    this.editingItemId = null;
    this.render();
  }

  toggleCheckedState(id) {
    this.state.items = this.state.items.map((item) => {
      if (item.id === id) {
        return{
          ...item,
          isChecked: !item.isChecked,
        }
      }

      return item;
    })

    this.updateStateAndRender();
  }

  setFilterFromFilterPanel(filterType) {
    this.state.currentFilter = filterType;

    this.filterButtonElements.forEach(button => {
      const shouldBeActive = button.dataset.filter === filterType;
      button.classList.toggle(this.stateClasses.isActive, shouldBeActive);
    });

    switch(filterType) {
      case this.filterTypes.ALL:
        this.state.filteredItems = null;
        break;
      case this.filterTypes.ACTIVE:
        this.state.filteredItems = this.state.items.filter(item => !item.isChecked);
        break;
      case this.filterTypes.COMPLETED:
        this.state.filteredItems = this.state.items.filter(item => item.isChecked);
        break;
    }
  }

  updateStateAndRender() {
    this.setFilterFromFilterPanel(this.state.currentFilter);
    this.saveItemsToLocalStorage();
    this.render();
  }

  onNewTaskFormSubmit = (event) => {
    event.preventDefault();

    const newTodoItemTitle = this.newTaskInputElement.value;

    if (newTodoItemTitle.trim().length > 0) {
      this.addItem(newTodoItemTitle);
      this.newTaskInputElement.value = '';
      this.newTaskInputElement.focus();
    }
  }

  onDeleteButtonClick = () => {
    const hasCompletedTasks = this.state.items.some(item => item.isChecked);

    if (!hasCompletedTasks) {
      return;
    }

    if (confirm('Are you sure you want to delete all completed tasks??')) {
      this.state.items = this.state.items.filter((item) => !item.isChecked);
      this.updateStateAndRender();
    }
  }

  onClick = ({ target }) => {
    if (target.matches(this.selectors.itemDeleteButton)) {
      const itemElement = target.closest(this.selectors.item);
      const itemCheckboxElement = itemElement.querySelector(this.selectors.itemCheckbox);

      itemElement.classList.add(this.stateClasses.isDisappearing);

      setTimeout(() => {
        this.deleteItem(itemCheckboxElement.id);
      }, 400);
    }
  }

  onDoubleClick = ({ target }) => {
    const itemElement = target.closest('[data-js-todo-item]');

    if (itemElement) {
      const itemId = itemElement.dataset.itemId;
      if (itemId) {
        this.startEditing(itemId);
      }
    }
  }

  onKeyDown = (event) => {
    if (this.editingItemId && event.key === 'Enter') {
      const input = this.listElement.querySelector(
        `[data-item-id="${this.editingItemId}"] [data-js-todo-item-input]`
      );
      if (input) {
        this.saveEditing(this.editingItemId, input.value);
      }
      event.preventDefault();
    }
    else if (this.editingItemId && event.key === 'Escape') {
      this.cancelEditing();
    }
  }

  onBlur = (event) => {
    if (!this.editingItemId) return;
    if (!event.target.matches(this.selectors.itemInput)) return;

    const relatedTarget = event.relatedTarget;

    const isClickOnFilter = relatedTarget?.matches(this.selectors.filterButton);
    const isClickOnDelete = relatedTarget?.matches(this.selectors.itemDeleteButton);
    const isClickOutside = !relatedTarget || !this.rootElement.contains(relatedTarget);

    if (isClickOnFilter || isClickOnDelete || isClickOutside) {
      this.saveEditing(this.editingItemId, event.target.value);
    }
  }

  onChange = ({ target }) => {
    if (target.matches(this.selectors.itemCheckbox)) {
      this.toggleCheckedState(target.id);
    }
  }

  onFilterButtonClick = ({ target }) => {
    if (target.matches(this.selectors.filterButton)) {
      const filterType = target.dataset.filter;
      const { ALL, ACTIVE, COMPLETED } = this.filterTypes;

      if (filterType === ALL || filterType === ACTIVE || filterType === COMPLETED) {
        this.setFilterFromFilterPanel(filterType);
        this.render();
      }
    }
  }

  onCheckAllButtonClick = (event) => {
    event.preventDefault();

    if (this.state.items.length === 0) {
      return;
    }

    const allChecked = this.state.items.every(item => item.isChecked);

    this.state.items = this.state.items.map(item => ({
      ...item,
      isChecked: !allChecked
    }));

    this.updateStateAndRender();
  }

  bindEvents() {
    this.newTaskFormElement.addEventListener('submit', this.onNewTaskFormSubmit);
    this.checkAllButtonElement.addEventListener('click', this.onCheckAllButtonClick);
    this.deleteButtonElement.addEventListener('click', this.onDeleteButtonClick);
    this.listElement.addEventListener('click', this.onClick);
    this.listElement.addEventListener('dblclick', this.onDoubleClick);
    this.listElement.addEventListener('change', this.onChange);
    this.rootElement.addEventListener('click', this.onFilterButtonClick);
    this.rootElement.addEventListener('keydown', this.onKeyDownBound);

    document.addEventListener('blur', this.onBlurBound, true);
  }
}

new Todo();