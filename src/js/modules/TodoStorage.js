export class TodoStorage {
  constructor(localStorageKey) {
    this.localStorageKey = localStorageKey;
  }

  getItems() {
    const rawData = localStorage.getItem(this.localStorageKey);

    if (!rawData) {
      return [];
    }

    try {
      const parsedData = JSON.parse(rawData);
      return Array.isArray(parsedData) ? parsedData : [];
    } catch {
      console.error('Todo items parse error');
      return [];
    }
  }

  saveItems(items) {
    localStorage.setItem(this.localStorageKey, JSON.stringify(items));
  }
}