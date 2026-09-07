((Drupal) => {
  Drupal.behaviors.dublin2029StickyHeader = {
    attach(context) {
      const masthead = context.querySelector?.('[data-sticky-nav]') ?? document.querySelector('[data-sticky-nav]');
      const sentinel = document.querySelector('[data-sticky-sentinel]');
      if (masthead && sentinel && !masthead.dataset.stickyObserved) {
        masthead.dataset.stickyObserved = 'true';
        if (masthead.classList.contains('site-masthead--overlay')) {
          // Switch to "stuck" as soon as the masthead's own height has
          // scrolled past, not the whole hero image.
          sentinel.style.top = `${masthead.offsetHeight}px`;
        }
        const observer = new IntersectionObserver(
          ([entry]) => masthead.classList.toggle('is-stuck', !entry.isIntersecting),
          { threshold: 0 },
        );
        observer.observe(sentinel);
      }

      const nav = context.querySelector?.('.site-masthead__nav') ?? document.querySelector('.site-masthead__nav');
      const toggle = context.querySelector?.('.site-nav__toggle') ?? document.querySelector('.site-nav__toggle');
      const closeButton = context.querySelector?.('.site-nav__close') ?? document.querySelector('.site-nav__close');
      const backdrop = context.querySelector?.('[data-nav-backdrop]') ?? document.querySelector('[data-nav-backdrop]');

      if (nav && toggle && !toggle.dataset.toggleBound) {
        toggle.dataset.toggleBound = 'true';

        const closeMenu = () => {
          nav.classList.remove('is-open');
          toggle.setAttribute('aria-expanded', 'false');
          document.body.classList.remove('nav-open');
        };
        const openMenu = () => {
          nav.classList.add('is-open');
          toggle.setAttribute('aria-expanded', 'true');
          document.body.classList.add('nav-open');
        };

        toggle.addEventListener('click', () => {
          if (nav.classList.contains('is-open')) {
            closeMenu();
          } else {
            openMenu();
          }
        });
        closeButton?.addEventListener('click', closeMenu);
        backdrop?.addEventListener('click', closeMenu);
        document.addEventListener('keydown', (event) => {
          if (event.key === 'Escape') {
            closeMenu();
          }
        });
      }
    },
  };
})(Drupal);
