export class AppBarHandler {
  constructor(state, elements) {
    this.state = state;
    this.elements = elements;
  }

  handleSubmit = (event) => {
    event.preventDefault();
    const newTitle = this.elements.newTaskInput.value;
    if (newTitle.trim().length > 0) {
      this.state.addItem(newTitle);
      this.elements.newTaskInput.value = '';
      this.elements.newTaskInput.focus();
    }
  }

  handleClearCompleted = () => {
    this.state.clearCompleted();
  }

  handleToggleAll = (event) => {
    event.preventDefault();
    this.state.toggleAllTasks();
  }
}
