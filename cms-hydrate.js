/**
 * cms-hydrate.js — Hydratation CMS pour les pages statiques
 * Se connecte à Firebase via cms.js et met à jour le contenu visible.
 * Le contenu statique sert de fallback si Firebase est inaccessible.
 */
(async function () {
  await loadAllCMS();
  const cfg = CMS.config || {};

  // ── Topbar : tel, email, adresse ──────────────────────────────
  const elTel  = document.getElementById('cms-tel');
  const elMail = document.getElementById('cms-email');
  const elAddr = document.getElementById('cms-addr');
  if (elTel  && cfg.tel)     elTel.textContent  = '📞 ' + cfg.tel;
  if (elMail && cfg.email)   elMail.textContent  = '✉ '  + cfg.email;
  if (elAddr && cfg.address) elAddr.textContent  = '📍 ' + cfg.address;

  // ── Logo ──────────────────────────────────────────────────────
  if (cfg.logo) {
    document.querySelectorAll('.cms-logo').forEach(img => { img.src = cfg.logo; });
  }

  // ── Page ÉVÉNEMENTS ───────────────────────────────────────────
  const evGrid = document.getElementById('cms-events-grid');
  if (evGrid && CMS.events && CMS.events.length) {
    const MOIS = { janvier:0,février:1,fevrier:1,mars:2,avril:3,mai:4,juin:5,
                   juillet:6,août:7,aout:7,septembre:8,octobre:9,novembre:10,décembre:11,decembre:11 };
    function parseEventDate(str) {
      if (!str) return 0;
      const s = str.toLowerCase().trim();
      // "21 juin 2025" ou "juin 2025" ou "2025"
      const full = s.match(/(\d{1,2})?\s*([a-zéûô]+)?\s*(\d{4})/);
      if (!full) return 0;
      const year  = parseInt(full[3]) || 0;
      const month = full[2] ? (MOIS[full[2]] ?? 0) : 0;
      const day   = parseInt(full[1]) || 1;
      return year * 10000 + month * 100 + day;
    }
    const sorted = [...CMS.events].sort((a, b) => parseEventDate(b.date) - parseEventDate(a.date));
    evGrid.innerHTML = sorted.map(ev => `
      <article class="ev-card">
        <img src="${ev.img}" alt="${ev.title}" loading="lazy">
        <div class="ev-card-body">
          <div class="ev-card-date">${ev.date}</div>
          <h2 class="ev-card-title">${ev.title}</h2>
          <p class="ev-card-text">${ev.text}</p>
          <span class="ev-card-tag">${ev.tag || 'Actualité'}</span>
        </div>
      </article>
    `).join('');
  }

  // ── Page CONTACT : coordonnées ────────────────────────────────
  const ciTel  = document.getElementById('cms-ci-tel');
  const ciMail = document.getElementById('cms-ci-email');
  const ciAddr = document.getElementById('cms-ci-addr');
  if (ciTel  && cfg.tel)     { ciTel.textContent  = cfg.tel;     ciTel.href  = 'tel:' + cfg.tel.replace(/\s/g,''); }
  if (ciMail && cfg.email)   { ciMail.textContent = cfg.email;   ciMail.href = 'mailto:' + cfg.email; }
  if (ciAddr && cfg.address) { ciAddr.textContent = cfg.address; }

  // ── Page GROUPE SCOLAIRE : stats (si présents) ────────────────
  const statEls = document.querySelectorAll('[data-cms-stat]');
  statEls.forEach(el => {
    const key = el.dataset.cmsStat;
    if (cfg[key] !== undefined) el.textContent = cfg[key];
  });

  // ── Page GROUPE SCOLAIRE : taux de réussite au BAC ───────────
  const bacRate = document.getElementById('cms-bac-rate');
  const bacYear = document.getElementById('cms-bac-year');
  if ((bacRate || bacYear) && CMS.palmares && CMS.palmares.bac) {
    const bac = CMS.palmares.bac;
    if (bacRate && bac.rate) bacRate.textContent = bac.rate;
    if (bacYear && bac.year) bacYear.textContent = 'Session ' + bac.year;
  }

  // ── Page ADMINISTRATION : pages CMS ──────────────────────────
  const adminContent = document.getElementById('cms-admin-content');
  if (adminContent && CMS.pages) {
    const page = adminContent.dataset.cmsPage;
    const p = CMS.pages[page];
    if (p) {
      const h2 = adminContent.querySelector('h2');
      const ps = adminContent.querySelectorAll('p');
      if (h2 && p.title) h2.textContent = p.title;
      if (ps[0] && p.content) ps[0].style.whiteSpace = 'pre-line', ps[0].textContent = p.content;
    }
  }

  // ── Page PARENTS : notes ─────────────────────────────────────
  const noteList = document.getElementById('cms-notes-parents');
  if (noteList && CMS.notes_parents && CMS.notes_parents.length) {
    noteList.innerHTML = CMS.notes_parents.map(n => `
      <a href="${n.pdf || '#'}" target="${n.pdf ? '_blank' : '_self'}" class="note-item">
        <div class="note-item-left">
          <div class="note-dot"></div>
          <div>
            <div class="note-title">${n.title}</div>
            <div style="font-size:.8rem;color:var(--md);margin-top:.2rem;">${n.date}</div>
          </div>
        </div>
        <span class="note-arr">→</span>
      </a>
    `).join('');
  }

  // ── Page VIE SCOLAIRE : clubs ─────────────────────────────────
  const clubsGrid = document.getElementById('cms-clubs-grid');
  if (clubsGrid && CMS.clubs && CMS.clubs.length) {
    clubsGrid.innerHTML = CMS.clubs.map(c => `
      <div class="club-card">
        ${c.img ? `<img src="${c.img}" alt="${c.name}" loading="lazy" style="width:100%;height:160px;object-fit:cover;border-radius:4px;margin-bottom:1rem;">` : `<div class="club-icon">🎓</div>`}
        <div class="club-name">${c.name}</div>
        <p class="club-desc">${c.desc}</p>
        ${c.resp ? `<p style="font-size:.8rem;color:var(--tr);font-weight:700;margin-top:.8rem;">Responsable : ${c.resp}</p>` : ''}
      </div>
    `).join('');
  }

  // ── Page ENSEIGNANTS : liste ──────────────────────────────────
  const teachersList = document.getElementById('cms-teachers-list');
  if (teachersList && CMS.teachers && CMS.teachers.length) {
    teachersList.innerHTML = `
      <table class="levels-table" style="margin-top:0;">
        <thead><tr><th>Nom</th><th>Matière</th><th>Cycle</th></tr></thead>
        <tbody>
          ${CMS.teachers.map(t => `
            <tr><td>${t.name}</td><td>${t.subj}</td><td>${t.cycle}</td></tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  // ── Année scolaire partout ────────────────────────────────────
  if (cfg.year) {
    document.querySelectorAll('.cms-year').forEach(el => { el.textContent = cfg.year; });
  }
})();
