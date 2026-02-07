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


const backgroundMusic = document.querySelector('#bg-music');
const musicToggle = document.querySelector('#music-toggle');
const DEFAULT_MUSIC_VOLUME = 0.3;
let musicUnlocked = false;
let audioSourcesLogged = false;

if (backgroundMusic) {
  backgroundMusic.volume = DEFAULT_MUSIC_VOLUME;
  backgroundMusic.muted = true;
  console.info('[BGM] Audio element initialized with volume:', backgroundMusic.volume);
}

const updateMusicToggle = () => {
  if (!musicToggle || !backgroundMusic) {
    return;
  }

  const isPlaying = !backgroundMusic.muted && !backgroundMusic.paused;
  const musicIcon = musicToggle.querySelector('.music-icon');
  if (musicIcon) {
    musicIcon.textContent = isPlaying ? '🔊' : '🔇';
  }
  musicToggle.setAttribute('aria-pressed', String(isPlaying));
  musicToggle.setAttribute(
    'aria-label',
    isPlaying ? 'Wycisz muzykę w tle' : 'Włącz muzykę w tle'
  );
};

const startBackgroundMusic = async () => {
  if (!backgroundMusic || musicUnlocked) {
    return;
  }

  musicUnlocked = true;
  backgroundMusic.muted = false;

  if (!audioSourcesLogged) {
    audioSourcesLogged = true;
    const sourceList = Array.from(backgroundMusic.querySelectorAll('source'));
    sourceList.forEach((source, index) => {
      const sourcePath = source.getAttribute('src') || '(missing src)';
      console.info(`[BGM] Source ${index + 1}:`, sourcePath);
    });
  }

  try {
    await backgroundMusic.play();
    console.info('[BGM] Playback started after user interaction.');
  } catch {
    musicUnlocked = false;
    backgroundMusic.muted = true;
    console.error('[BGM] Playback blocked. Waiting for another user interaction.');
  }

  updateMusicToggle();
};

document.addEventListener('pointerdown', startBackgroundMusic, { once: true, passive: true });
document.addEventListener('touchstart', startBackgroundMusic, { once: true, passive: true });
document.addEventListener('keydown', startBackgroundMusic, { once: true });

musicToggle?.addEventListener('click', async () => {
  if (!backgroundMusic) {
    return;
  }

  if (!musicUnlocked) {
    await startBackgroundMusic();
    return;
  }

  if (backgroundMusic.muted) {
    backgroundMusic.muted = false;

    if (backgroundMusic.paused) {
      try {
        await backgroundMusic.play();
        console.info('[BGM] Playback resumed from toggle.');
      } catch {
        backgroundMusic.muted = true;
        console.error('[BGM] Unable to resume playback from toggle.');
      }
    }
  } else {
    backgroundMusic.muted = true;
    console.info('[BGM] Playback muted from toggle.');
  }

  updateMusicToggle();
});

backgroundMusic?.addEventListener('ended', () => {
  backgroundMusic.currentTime = 0;
});

backgroundMusic?.addEventListener('loadeddata', () => {
  const activeSource = backgroundMusic.currentSrc || '(unknown source)';
  console.info('[BGM] Audio loaded:', activeSource);
});

backgroundMusic?.addEventListener('error', () => {
  const errorCode = backgroundMusic.error?.code;
  const activeSource = backgroundMusic.currentSrc || '(source not resolved)';
  console.error('[BGM] Failed to load audio.', {
    errorCode,
    activeSource,
    expectedSources: ['assets/audio/synth.mp3', 'assets/audio/synth.ogg'],
  });
});

backgroundMusic?.addEventListener('play', () => {
  console.info('[BGM] Play event fired.');
});

backgroundMusic?.addEventListener('pause', () => {
  if (!backgroundMusic.muted) {
    console.warn('[BGM] Audio paused while not muted.');
  }
});

updateMusicToggle();
