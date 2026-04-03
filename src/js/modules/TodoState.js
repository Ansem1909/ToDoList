import { escapeHtml } from '../utils/escapeHtml.js';

export class TodoState {
  constructor(storage, filterTypes) {
    this.storage = storage;
    this.filterTypes = filterTypes;
    this.items = this.storage.getItems();
    this.currentFilter = this.filterTypes.ALL;
    this.editingItemId = null;
    this.onChangeCallback = null;
  }

  addItem(title) {
    const escapedTitle = escapeHtml(title.trim());
    if (escapedTitle === '') return;

    this.items = [
      ...this.items,
      {
        id: crypto?.randomUUID?.() ?? Date.now().toString(),
        title: escapedTitle,
        isChecked: false,
      }
    ];
    this.saveAndNotify();
  }

  deleteItem(id) {
    this.items = this.items.filter((item) => item.id !== id);
    this.saveAndNotify();
  }

  startEditing(id) {
    this.editingItemId = id;
    this.notify();
  }

  saveEditing(id, newTitle) {
    const escapedTitle = escapeHtml(newTitle.trim());

    if (escapedTitle === '') {
      this.deleteItem(id);
    } else {
      this.items = this.items.map((item) => {
        if (item.id === id) {
          return { ...item, title: escapedTitle };
        }
        return item;
      });
      this.saveItemsToStorage();
    }

    this.editingItemId = null;
    this.notify();
  }

  cancelEditing() {
    this.editingItemId = null;
    this.notify();
  }

  toggleCheckedState(id) {
    this.items = this.items.map((item) => {
      if (item.id === id) {
        return { ...item, isChecked: !item.isChecked };
      }
      return item;
    });
    this.saveAndNotify();
  }

  toggleAllTasks() {
    if (this.items.length === 0) return;
    const allChecked = this.items.every(item => item.isChecked);
    this.items = this.items.map(item => ({ ...item, isChecked: !allChecked }));
    this.saveAndNotify();
  }

  clearCompleted() {
    const hasCompletedTasks = this.items.some(item => item.isChecked);
    if (!hasCompletedTasks) return;
    this.items = this.items.filter((item) => !item.isChecked);
    this.saveAndNotify();
  }

  setFilter(filterType) {
    this.currentFilter = filterType;
    this.notify();
  }

  saveItemsToStorage() {
    this.storage.saveItems(this.items);
  }

  saveAndNotify() {
    this.saveItemsToStorage();
    this.notify();
  }

  notify() {
    if (this.onChangeCallback) {
      this.onChangeCallback();
    }
  }

  setOnChange(callback) {
    this.onChangeCallback = callback;
  }
}