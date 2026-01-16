class Todo {
  selectors = {
    root: '[data-js-todo]',
    newTaskForm: '[data-js-todo-new-task-form]',
    newTaskInput: '[data-js-todo-new-task-input]',
    checkAllButton: '[data-js-todo-check-all-button]',
    totalTasks: '[data-js-todo-total-tasks]',
    filterButtons: '[data-js-todo-filter-buttons]',
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
  }

  localStorageKey = 'todo-items';


  constructor() {
    this.rootElement = document.querySelector(this.selectors.root);
    this.newTaskFormElement = this.rootElement.querySelector(this.selectors.newTaskForm);
    this.newTaskInputElement = this.rootElement.querySelector(this.selectors.newTaskInput);
    this.checkAllButtonElement = this.rootElement.querySelector(this.selectors.checkAllButton);
    this.totalTasksElement = this.rootElement.querySelector(this.selectors.totalTasks);
    this.filterButtonsElements = this.rootElement.querySelectorAll(this.selectors.filterButtons);
    this.deleteButtonElement = this.rootElement.querySelector(this.selectors.deleteButton);
    this.listElement = this.rootElement.querySelector(this.selectors.list);

    this.state = {
      items: this.getItemsInfoFromLocalStorage(),
      filteredItems: null,
      currentFilter: 'all',
    }

    this.editingItemId = null;

    this.render();
    this.bindEvents()
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

  render() {
    this.totalTasksElement.textContent = this.state.items.length;

    const hasTasks = this.state.items.length > 0;

    this.deleteButtonElement.classList.toggle(this.stateClasses.isVisible, this.state.items.length > 0);
    this.checkAllButtonElement.classList.toggle(this.stateClasses.isVisible, hasTasks);

    this.filterButtonsElements.forEach(element => {
      element.classList.toggle(this.stateClasses.isVisible, this.state.items.length > 0);
    });

    const items = this.state.filteredItems ?? this.state.items;

    this.listElement.innerHTML = items.map(({ id, title, isChecked }) => {
      const isEditing = this.editingItemId === id;
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
        ${title}
      </label>
      <input
          class="todo-item__input"
          type="text"
          value="${title}"
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

    if (this.editingItemId) {
      setTimeout(() => {
        const input = this.listElement.querySelector(
          `[data-item-id="${this.editingItemId}"] [data-js-todo-item-input]`
        );
        if (input) {
          input.focus();
          input.select();
        }
      }, 0);
    }
  }

  addItem(title) {
    this.state.items.push({
      id: crypto?.randomUUID() ?? Date.now().toString(),
      title: title,
      isChecked: false,
    });

    this.setFilterFromFilterPanel(this.state.currentFilter);
    this.saveItemsToLocalStorage();
    this.render();
  }

  deleteItem(id) {
    this.state.items = this.state.items.filter((item) => item.id !== id);

    this.setFilterFromFilterPanel(this.state.currentFilter);
    this.saveItemsToLocalStorage();
    this.render();
  }

  startEditing(id) {
    this.editingItemId = id;
    this.render();

    setTimeout(() => {
      const input = this.listElement.querySelector(
        `[data-item-id="${id}"] [data-js-todo-item-input]`
      );
      if (input) {
        input.focus();
        input.select();
      }
    }, 0);
  }

  saveEditing(id, newTitle) {
    if (newTitle.trim() === '') {
      this.deleteItem(id);
    } else {
      this.state.items = this.state.items.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            title: newTitle.trim(),
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

    this.setFilterFromFilterPanel(this.state.currentFilter);
    this.saveItemsToLocalStorage();
    this.render();
  }

  setFilterFromFilterPanel(filterType) {
    this.state.currentFilter = filterType;

    const allFilterButtons = this.rootElement.querySelectorAll('.todo__filter-button');

    allFilterButtons.forEach(button => {
      button.classList.remove('active');
    });

    const activeButtons = this.rootElement.querySelectorAll(`[data-filter="${filterType}"]`);
    activeButtons.forEach(button => {
      button.classList.add('active');
    });

    switch(filterType) {
      case 'all':
        this.state.filteredItems = null;
        break;
      case 'active':
        this.state.filteredItems = this.state.items.filter(item => !item.isChecked);
        break;
      case 'completed':
        this.state.filteredItems = this.state.items.filter(item => item.isChecked);
        break;
    }

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
    const isConfirmed = confirm('Are you sure that you want delete it?');

    if (isConfirmed) {
      this.state.items = this.state.items.filter((item) => !item.isChecked);

      this.setFilterFromFilterPanel(this.state.currentFilter);
      this.saveItemsToLocalStorage();
      this.render();
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
    if (this.editingItemId && event.target.matches(this.selectors.itemInput)) {
      setTimeout(() => {
        if (this.editingItemId) {
          const input = this.listElement.querySelector(
            `[data-item-id="${this.editingItemId}"] [data-js-todo-item-input]`
          );
          if (input) {
            this.saveEditing(this.editingItemId, input.value);
          }
        }
      }, 100);
    }
  }

  onChange = ({ target }) => {
    if (target.matches(this.selectors.itemCheckbox)) {
      this.toggleCheckedState(target.id);
    }
  }

  onFilterButtonClick = ({ target }) => {
    if (target.classList.contains('todo__filter-button')) {
      const filterType = target.dataset.filter;

      if (filterType === 'all' || filterType === 'active' || filterType === 'completed') {
        this.setFilterFromFilterPanel(filterType);
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

    this.setFilterFromFilterPanel(this.state.currentFilter);
    this.saveItemsToLocalStorage();
    this.render();
  }

  bindEvents() {
    this.newTaskFormElement.addEventListener('submit', this.onNewTaskFormSubmit);
    this.checkAllButtonElement.addEventListener('click', this.onCheckAllButtonClick);
    this.deleteButtonElement.addEventListener('click', this.onDeleteButtonClick);
    this.listElement.addEventListener('click', this.onClick);
    this.listElement.addEventListener('dblclick', this.onDoubleClick);
    this.listElement.addEventListener('change', this.onChange);
    this.rootElement.addEventListener('click', this.onFilterButtonClick);
    document.addEventListener('keydown', this.onKeyDown.bind(this));
    document.addEventListener('blur', this.onBlur.bind(this), true);
  }
}

new Todo();