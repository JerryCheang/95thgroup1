(() => {
  const progress = document.getElementById('g1-progress-bar');
  const revealItems = document.querySelectorAll('.reveal');
  const menuHost = document.getElementById('page-menu');
  const menuToggle = document.getElementById('menu-toggle');
  const menuCurrentLabel = document.getElementById('menu-current-label');
  const lightbox = document.getElementById('g1-lightbox');
  const lightboxImage = document.getElementById('g1-lightbox-image');
  const lightboxClose = document.getElementById('g1-lightbox-close');
  const backToTopButton = document.getElementById('g1-back-to-top');

  const sectionIds = [
    'hero',
    'summary',
    'concept',
    'layout',
    'features',
    'insights',
    'team',
    'media',
    'references'
  ];

  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const labelById = sections.reduce((acc, section) => {
    acc[section.id] = section.id === 'hero' ? 'Home' : (section.dataset.title || section.id);
    return acc;
  }, {});

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('on');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));

  const buildNavLinks = (host, options = {}) => {
    if (!host || !sections.length) return;
    const { withHome = false } = options;

    const links = sections
      .filter((section) => !(withHome && section.id === 'hero'))
      .map((section) => {
        const label = section.dataset.title || section.id;
        return { id: section.id, label };
      });

    if (withHome) {
      links.unshift({ id: 'hero', label: 'Home' });
    }

    host.innerHTML = links
      .map((item) => `<a href="#${item.id}" data-target="${item.id}">${item.label}</a>`)
      .join('');
  };

  const activateNav = (id) => {
    document.querySelectorAll('[data-target]').forEach((link) => {
      link.classList.toggle('active', link.dataset.target === id);
    });
    if (menuCurrentLabel && labelById[id]) {
      menuCurrentLabel.textContent = labelById[id];
    }
  };

  const updateActiveSectionByScroll = () => {
    if (!sections.length) return;
    const marker = window.scrollY + window.innerHeight * 0.35;
    let currentId = sections[0].id;

    sections.forEach((section) => {
      const top = section.offsetTop;
      if (top <= marker) currentId = section.id;
    });

    activateNav(currentId);
  };

  const updateProgress = () => {
    const scrollTop = window.scrollY;
    const full = document.documentElement.scrollHeight - window.innerHeight;
    const percent = full <= 0 ? 0 : Math.min((scrollTop / full) * 100, 100);
    if (progress) progress.style.width = `${percent.toFixed(2)}%`;
  };

  const updateBackToTop = () => {
    if (!backToTopButton) return;
    backToTopButton.classList.toggle('show', window.scrollY > 360);
  };

  window.addEventListener(
    'scroll',
    () => {
      updateProgress();
      updateActiveSectionByScroll();
      updateBackToTop();
    },
    { passive: true }
  );
  window.addEventListener('resize', () => {
    updateProgress();
    updateActiveSectionByScroll();
    updateBackToTop();
  });

  buildNavLinks(menuHost, { withHome: true });

  if (menuToggle && menuHost) {
    menuToggle.addEventListener('click', () => {
      const willOpen = !menuHost.classList.contains('open');
      menuHost.classList.toggle('open', willOpen);
      menuToggle.setAttribute('aria-expanded', String(willOpen));
      menuToggle.textContent = willOpen ? 'Close Section List' : 'Open Section List';
    });

    menuHost.addEventListener('click', (event) => {
      const target = event.target;
      if (window.innerWidth > 560 || !(target instanceof HTMLElement)) return;
      if (!target.closest('a')) return;
      menuHost.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.textContent = 'Open Section List';
    });
  }

  if (lightbox && lightboxImage && lightboxClose) {
    const zoomableImages = document.querySelectorAll('.g1-floor-shot img, .g1-data-shot img, .g1-embed-wrap.poster img, .g1-hero-image');

    const closeLightbox = () => {
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden', 'true');
      lightboxImage.src = '';
      lightboxImage.alt = '';
      document.body.style.overflow = '';
    };

    zoomableImages.forEach((image) => {
      image.addEventListener('click', () => {
        lightboxImage.src = image.src;
        lightboxImage.alt = image.alt || 'Enlarged image';
        lightbox.classList.add('open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      });
    });

    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && lightbox.classList.contains('open')) {
        closeLightbox();
      }
    });
  }

  if (backToTopButton) {
    backToTopButton.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  updateActiveSectionByScroll();
  updateProgress();
  updateBackToTop();
})();