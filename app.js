const filterButtons = document.querySelectorAll('[data-filter]');
const courseList = document.querySelector('#course-list');
const courseStatus = document.querySelector('#course-status');
const FILTER_KEY = 'ajokaista-filter';

if (filterButtons.length > 0 && courseList) {
  const applyFilter = (filter) => {
    for (const button of filterButtons) {
      button.setAttribute('aria-pressed', String(button.dataset.filter === filter));
    }

    const cards = courseList.querySelectorAll('article');
    let visibleCount = 0;

    for (const card of cards) {
      const matches = filter === 'all' || card.dataset.class === filter;
      card.hidden = !matches;
      if (matches) {
        visibleCount += 1;
      }
    }

    if (courseStatus) {
      courseStatus.textContent = `Näytetään ${visibleCount} / ${cards.length} kurssia`;
    }

    localStorage.setItem(FILTER_KEY, filter);
  };

  for (const button of filterButtons) {
    button.addEventListener('click', () => {
      applyFilter(button.dataset.filter);
    });
  }

  const savedFilter = localStorage.getItem(FILTER_KEY) || 'all';
  applyFilter(savedFilter);
}