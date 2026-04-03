import { TodoStorage } from './modules/TodoStorage.js';
import { TodoRenderer } from './modules/TodoRenderer.js';
import { TodoState } from './modules/TodoState.js';
import { TodoEventHandlers } from './modules/TodoEventHandlers.js';

class Todo {
  selectors = {
    root: '[data-js-todo]',
    newTaskForm: '[data-js-todo-new-task-form]',
    newTaskInput: '[data-js-todo-new-task-input]',
    checkAllButton: '[data-js-todo-check-all-button]',
    info: '[data-js-todo-info]',
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

  constructor() {
    this.rootElement = document.querySelector(this.selectors.root);
    if (!this.rootElement) throw new Error('Root not found');

    this.elements = {
      root: this.rootElement,
      newTaskForm: this.rootElement.querySelector(this.selectors.newTaskForm),
      newTaskInput: this.rootElement.querySelector(this.selectors.newTaskInput),
      checkAllButton: this.rootElement.querySelector(this.selectors.checkAllButton),
      info:this.rootElement.querySelector(this.selectors.info),
      totalTasks: this.rootElement.querySelector(this.selectors.totalTasks),
      deleteButton: this.rootElement.querySelector(this.selectors.deleteButton),
      list: this.rootElement.querySelector(this.selectors.list),
      filterButtons: this.rootElement.querySelectorAll(this.selectors.filterButton),
      filterButtonsContainer: this.rootElement.querySelector(this.selectors.filterButtons),
    };

    const storage = new TodoStorage(this.localStorageKey);
    const renderer = new TodoRenderer(
      this.elements.list,
      this.elements.info,
      this.elements.totalTasks,
      this.elements.deleteButton,
      this.elements.checkAllButton,
      this.elements.filterButtonsContainer
    );

    const state = new TodoState(storage, this.filterTypes);
    const eventHandlers = new TodoEventHandlers(
      state,
      renderer,
      this.elements,
      this.selectors,
      this.stateClasses,
      this.filterTypes
    );

    this.state = state;
    this.eventHandlers = eventHandlers;
    this.state.setOnChange(() => this.eventHandlers.fullRender());

    this.eventHandlers.fullRender();
    this.eventHandlers.bindEvents();
  }
}

new Todo();