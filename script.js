const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');

menuToggle?.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Zamknij menu' : 'Otwórz menu');
});

const filterButtons = document.querySelectorAll('.filter-btn');
const searchInput = document.querySelector('#search-input');
const gameCards = document.querySelectorAll('.game-card');

let activeFilter = 'all';

const applyFilters = () => {
  const query = searchInput.value.trim().toLowerCase();

  gameCards.forEach((card) => {
    const tag = card.dataset.tag;
    const title = card.dataset.title.toLowerCase();
    const matchesTag = activeFilter === 'all' || tag === activeFilter;
    const matchesSearch = title.includes(query);

    card.hidden = !(matchesTag && matchesSearch);
  });
};

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    filterButtons.forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');
    activeFilter = button.dataset.filter;
    applyFilters();
  });
});

searchInput?.addEventListener('input', applyFilters);

const modal = document.querySelector('#gallery-modal');
const modalImage = document.querySelector('#modal-image');
const modalTitle = document.querySelector('#modal-title');
const closeModalButton = document.querySelector('.modal-close');
const thumbs = document.querySelectorAll('.thumb');
let lastFocusedElement = null;

const openModal = (label, className) => {
  lastFocusedElement = document.activeElement;
  modal.hidden = false;
  modalImage.className = `modal-image ${className}`;
  modalImage.setAttribute('aria-label', label);
  modalTitle.textContent = label;
  closeModalButton.focus();
};

const closeModal = () => {
  modal.hidden = true;
  modalImage.className = 'modal-image';
  if (lastFocusedElement) {
    lastFocusedElement.focus();
  }
};

thumbs.forEach((thumb) => {
  thumb.addEventListener('click', () => {
    const label = thumb.dataset.full;
    const className = thumb.className
      .split(' ')
      .find((name) => name.startsWith('thumb-'));

    openModal(label, className || '');
  });
});

closeModalButton?.addEventListener('click', closeModal);

modal?.addEventListener('click', (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !modal.hidden) {
    closeModal();
  }
});
