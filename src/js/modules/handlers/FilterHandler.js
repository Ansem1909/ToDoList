export class FilterHandler {
  constructor(state, selectors, filterTypes) {
    this.state = state;
    this.selectors = selectors;
    this.filterTypes = filterTypes;
  }

  handleFilterClick = ({ target }) => {
    if (target.matches(this.selectors.filterButton)) {
      const filterType = target.dataset.filter;
      const { ALL, ACTIVE, COMPLETED } = this.filterTypes;
      if (filterType === ALL || filterType === ACTIVE || filterType === COMPLETED) {
        this.state.setFilter(filterType);
      }
    }
  }
}