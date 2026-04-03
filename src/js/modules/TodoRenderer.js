import { escapeHtml } from '../utils/escapeHtml.js';

export class TodoRenderer {
  constructor(listElement, totalTasksElement, deleteButtonElement, checkAllButtonElement, filterButtonsContainer) {
    this.listElement = listElement;
    this.totalTasksElement = totalTasksElement;
    this.deleteButtonElement = deleteButtonElement;
    this.checkAllButtonElement = checkAllButtonElement;
    this.filterButtonsContainer = filterButtonsContainer;
  }

  updateUI(items, stateClasses) {
    const activeTasksCount = items.filter(item => !item.isChecked).length;
    const taskWord = activeTasksCount === 1 ? 'task' : 'tasks';
    this.totalTasksElement.textContent = `${activeTasksCount} ${taskWord} left`;

    const hasTasks = items.length > 0;
    const hasCompletedTasks = items.some(item => item.isChecked);

    this.deleteButtonElement.classList.toggle(stateClasses.isVisible, hasCompletedTasks);
    this.checkAllButtonElement.classList.toggle(stateClasses.isVisible, hasTasks);

    if (this.filterButtonsContainer) {
      this.filterButtonsContainer.classList.toggle(stateClasses.isVisible, hasTasks);
    }
  }

  generateItemHTML(item, isEditing, stateClasses) {
    const escapedTitle = escapeHtml(item.title);
    return `
      <li class="todo__item todo-item ${isEditing ? stateClasses.isEditing : ''}" 
          data-js-todo-item
          data-item-id="${item.id}">
        <input
            class="todo-item__checkbox"
            id="${item.id}"
            type="checkbox"
            ${item.isChecked ? 'checked' : ''}
            ${isEditing ? 'disabled' : ''}
            data-js-todo-item-checkbox
        />
        <label
            class="todo-item__label"
            for="${item.id}"
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
  }

  renderItems(items, editingItemId, filterType, filterTypes, stateClasses) {
    let filteredItems = items;
    if (filterType === filterTypes.ACTIVE) {
      filteredItems = items.filter(item => !item.isChecked);
    } else if (filterType === filterTypes.COMPLETED) {
      filteredItems = items.filter(item => item.isChecked);
    }

    const sortedItems = [...filteredItems].reverse();

    this.listElement.innerHTML = sortedItems.map(item => {
      const isEditing = editingItemId === item.id;
      return this.generateItemHTML(item, isEditing, stateClasses);
    }).join('');
  }

  focusEditingItem(editingItemId, listElement) {
    if (!editingItemId) return;

    const input = listElement.querySelector(
      `[data-item-id="${editingItemId}"] [data-js-todo-item-input]`
    );

    if (input) {
      input.focus();
      input.select();
    }
  }

  updateFilterButtons(filterButtons, currentFilter, stateClasses) {
    filterButtons.forEach(button => {
      const shouldBeActive = button.dataset.filter === currentFilter;
      button.classList.toggle(stateClasses.isActive, shouldBeActive);
      button.setAttribute('aria-pressed', shouldBeActive);
    });
  }
}
