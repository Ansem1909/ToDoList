import { TaskClickHandler } from './handlers/TaskClickHandler.js';
import { TaskEditHandler } from './handlers/TaskEditHandler.js';
import { AppBarHandler } from './handlers/AppBarHandler.js';
import { FilterHandler } from './handlers/FilterHandler.js';

export class TodoEventHandlers {
  constructor(state, renderer, elements, selectors, stateClasses, filterTypes) {
    this.state = state;
    this.renderer = renderer;
    this.elements = elements;
    this.stateClasses = stateClasses;

    this.clickHandler = new TaskClickHandler(state, selectors, stateClasses);
    this.editHandler = new TaskEditHandler(state, elements, selectors);
    this.appBarHandler = new AppBarHandler(state, elements);
    this.filterHandler = new FilterHandler(state, selectors, filterTypes);

    this.onClick = (event) => {
      const { target } = event;
      if (target.matches(selectors.itemDeleteButton)) {
        this.clickHandler.handleDelete(target);
      }
    };

    this.onChange = (event) => {
      if (event.target.matches(selectors.itemCheckbox)) {
        this.clickHandler.handleCheckbox(event.target);
      }
    };

    this.onDoubleClick = (event) => {
      this.clickHandler.handleDoubleClick(event.target);
    };

    this.onKeyDown = this.editHandler.handleKeyDown.bind(this.editHandler);
    this.onBlur = this.editHandler.handleBlur.bind(this.editHandler);
    this.onNewTaskFormSubmit = this.appBarHandler.handleSubmit.bind(this.appBarHandler);
    this.onDeleteButtonClick = this.appBarHandler.handleClearCompleted.bind(this.appBarHandler);
    this.onCheckAllButtonClick = this.appBarHandler.handleToggleAll.bind(this.appBarHandler);
    this.onFilterButtonClick = this.filterHandler.handleFilterClick.bind(this.filterHandler);

    this.onKeyDownBound = this.onKeyDown.bind(this);
    this.onBlurBound = this.onBlur.bind(this);
  }

  fullRender() {
    const displayList = this.state.getDisplayList();
    this.renderer.updateUI(this.state.items, this.stateClasses);
    this.renderer.renderItems(displayList, this.state.editingItemId, this.stateClasses);
    this.renderer.focusEditingItem(this.state.editingItemId, this.elements.list);
    this.renderer.updateFilterButtons(this.elements.filterButtons, this.state.currentFilter, this.stateClasses);
  }

  bindEvents() {
    this.elements.newTaskForm?.addEventListener('submit', this.onNewTaskFormSubmit);
    this.elements.checkAllButton?.addEventListener('click', this.onCheckAllButtonClick);
    this.elements.deleteButton?.addEventListener('click', this.onDeleteButtonClick);
    this.elements.list?.addEventListener('click', this.onClick);
    this.elements.list?.addEventListener('dblclick', this.onDoubleClick);
    this.elements.list?.addEventListener('change', this.onChange);
    this.elements.list?.addEventListener('blur', this.onBlurBound, true);
    this.elements.root?.addEventListener('click', this.onFilterButtonClick);
    this.elements.root?.addEventListener('keydown', this.onKeyDownBound);
  }
}