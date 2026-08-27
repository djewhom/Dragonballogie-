/* ============================================================
   INTERACTIONS — apparition au scroll, sommaire flottant, glossaire
   Ce fichier est partagé par toutes les pages d'article.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  initTOC();
  initGlossary();
});

/* ---------- 1. Apparition en douceur au scroll ---------- */
function initReveal() {
  const targets = document.querySelectorAll('.article-body p, .article-body figure, .article-body blockquote, .article-body h2');
  if (!targets.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(el => {
    el.classList.add('reveal');
    io.observe(el);
  });
}

/* ---------- 2. Sommaire flottant (généré depuis les h2) ---------- */
function initTOC() {
  const headings = document.querySelectorAll('.article-body h2');
  if (headings.length < 2) return; // pas utile sur un article court

  headings.forEach((h, i) => {
    if (!h.id) h.id = 'section-' + (i + 1);
  });

  const toggle = document.createElement('button');
  toggle.className = 'toc-toggle';
  toggle.setAttribute('aria-label', 'Ouvrir le sommaire de l\'article');
  toggle.innerHTML = '☰';

  const panel = document.createElement('nav');
  panel.className = 'toc-panel';
  panel.innerHTML = '<p class="toc-title">Dans cet article</p>';

  const list = document.createElement('ul');
  headings.forEach(h => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = '#' + h.id;
    a.textContent = h.textContent;
    a.dataset.tocLink = h.id;
    li.appendChild(a);
    list.appendChild(li);
  });
  panel.appendChild(list);

  document.body.appendChild(toggle);
  document.body.appendChild(panel);

  toggle.addEventListener('click', () => {
    panel.classList.toggle('open');
    toggle.classList.toggle('open');
  });

  panel.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      panel.classList.remove('open');
      toggle.classList.remove('open');
    });
  });

  // Surligne la section active pendant le scroll
  const links = panel.querySelectorAll('a');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const link = panel.querySelector(`a[data-toc-link="${entry.target.id}"]`);
      if (!link) return;
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px' });

  headings.forEach(h => io.observe(h));
}

/* ---------- 3. Glossaire cliquable ---------- */
function initGlossary() {
  const terms = document.querySelectorAll('.term');
  if (!terms.length) return;

  let openTooltip = null;

  function closeTooltip() {
    if (openTooltip) { openTooltip.remove(); openTooltip = null; }
  }

  terms.forEach(term => {
    term.setAttribute('tabindex', '0');
    term.addEventListener('click', (e) => {
      e.stopPropagation();
      const wasOpenOnThis = openTooltip && openTooltip.dataset.owner === term.dataset.termId;
      closeTooltip();
      if (wasOpenOnThis) return;

      const tip = document.createElement('span');
      tip.className = 'term-tooltip';
      tip.textContent = term.dataset.def;
      tip.dataset.owner = term.dataset.termId || term.textContent;
      term.appendChild(tip);
      openTooltip = tip;

      // Repositionne si ça dépasse à droite de l'écran
      requestAnimationFrame(() => {
        const rect = tip.getBoundingClientRect();
        if (rect.right > window.innerWidth - 12) {
          tip.style.left = 'auto';
          tip.style.right = '0';
          tip.style.transform = 'none';
        }
      });
    });
  });

  document.addEventListener('click', closeTooltip);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeTooltip(); });
}
