/**
 * cms.js — CMS Production (Firebase Realtime Database)
 * Groupe Scolaire Le Miri
 *
 * ⚙️  CONFIGURATION : Remplacez FIREBASE_URL par votre URL Firebase
 *     (voir GUIDE_DEPLOIEMENT.md étape 2)
 *
 * Cette version fonctionne sur Netlify, OVH, cPanel, ou tout hébergeur web.
 * Elle remplace window.storage (Claude uniquement) par Firebase (partout).
 */

/* ════════════════════════════════════════════
   ⚙️  VOTRE CONFIGURATION FIREBASE ICI
   ════════════════════════════════════════════ */
const FIREBASE_URL = 'https://lemiri-cms-default-rtdb.europe-west1.firebasedatabase.app';//             

/* ════════════════════════════════════════════
   COUCHE FIREBASE — lecture / écriture
   Règles Firebase à appliquer (Firebase Console → Realtime Database → Règles) :
   {
     "rules": {
       "cms": {
         ".read": true,
         ".write": "auth != null"
       },
       "admin": {
         ".read": "auth != null",
         ".write": "auth != null"
       }
     }
   }
   → cms/   : lecture publique (site), écriture réservée aux admins authentifiés
   → admin/ : lecture ET écriture réservées aux admins authentifiés (credentials protégés)
   ════════════════════════════════════════════ */

/* ════════════════════════════════════════════
   COUCHE FIREBASE — lecture / écriture
   ════════════════════════════════════════════ */

// Convertit "site:events" → "site_events" (Firebase n'accepte pas les deux-points)
function toFirebaseKey(key) {
  return key.replace(/:/g, '_').replace(/[.#$\[\]]/g, '_');
}

// Token Firebase — toujours lu/écrit via window pour être partagé avec admin/index.html
window.FIREBASE_ID_TOKEN = window.FIREBASE_ID_TOKEN || null;

// Choisit le bon chemin Firebase selon la clé et ajoute le token si disponible
// La Realtime Database REST API exige ?auth= (Authorization: Bearer n'est pas supporté)
// On lit toujours depuis window.FIREBASE_ID_TOKEN (partagé avec admin/index.html)
function getFirebasePath(key) {
  let url;
  if (key.startsWith('admin:')) {
    url = `${FIREBASE_URL}/admin/${toFirebaseKey(key)}.json`;
  } else {
    url = `${FIREBASE_URL}/cms/${toFirebaseKey(key)}.json`;
  }
  const token = window.FIREBASE_ID_TOKEN || FIREBASE_ID_TOKEN;
  if (token) {
    url += `?auth=${token}`;
  }
  return url;
}

// Lecture depuis Firebase
async function cmsGet(key) {
  try {
    const res = await fetch(getFirebasePath(key), {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch (e) {
    console.warn(`[CMS] Erreur lecture "${key}":`, e.message);
    return null;
  }
}

// Écriture dans Firebase
async function cmsSet(key, value) {
  try {
    const res = await fetch(getFirebasePath(key), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(value)
    });
    return res.ok;
  } catch (e) {
    console.warn(`[CMS] Erreur écriture "${key}":`, e.message);
    return false;
  }
}

// Suppression dans Firebase
async function cmsDel(key) {
  try {
    const res = await fetch(getFirebasePath(key), {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' }
    });
    return res.ok;
  } catch (e) {
    console.warn(`[CMS] Erreur suppression "${key}":`, e.message);
    return false;
  }
}

/* ════════════════════════════════════════════
   DONNÉES PAR DÉFAUT
   (affichées si Firebase est vide ou inaccessible)
   ════════════════════════════════════════════ */
const CMS_DEFAULTS = {
  'site:config': {
    name: 'Groupe Scolaire Le Miri',
    code: '041604',
    tel: '+225 27 22 52 79 00',
    email: 'lemiri2015ac@gmail.com',
    address: 'Bingerville, Abidjan 01',
    year: '2026-2027',
    logo: 'https://static.wixstatic.com/media/568692_f9b4440e8b2e4586bd61ffab50a3f1d2~mv2.jpg',
    s1: 542, s2: 105, s3: 77, s4: 78, s5: 95,
    dname: 'M. LAWSON Silvere',
    dtitle: 'Directeur des Études',
    dphoto: 'https://static.wixstatic.com/media/568692_3e5e5748f7054e3bb0d5a3576f283e20~mv2.jpeg',
    dmsg: "Chers parents, chers élèves,\n\nC'est avec une immense fierté que je vous souhaite la bienvenue au Groupe Scolaire Le Miri.",
    fichesPdf: '',
    paiementPdf: '',
    reglementPdf: '',
    surveillancePdf: '',
    heroT1: 'Élever chaque<br>esprit,',
    heroT2: "construire<br>l'avenir.",
    heroDesc: "Du préscolaire au Baccalauréat, le Groupe Scolaire Le Miri cultive l'excellence, la créativité et les valeurs humaines.",
    heroBtn: 'https://www.expertpro-ci.net/accueilpreinscription.php',
  },
  'site:slides': [
    { img: 'https://static.wixstatic.com/media/568692_e74ddedabe33488d96e4e1f158cd0e2e~mv2.jpeg', tag: 'Vie scolaire · Mars 2026', title: "Journée internationale des droits des femmes" },
    { img: 'https://static.wixstatic.com/media/568692_5872756807264897800571835c6aa93e~mv2.jpeg', tag: 'Excellence · Juin 2025', title: "Journée du mérite et de l'excellence" },
    { img: 'https://static.wixstatic.com/media/568692_4e332bbf1a0b463b88aca254efd3e71b~mv2.jpeg', tag: 'Prix · Mai 2025', title: "Prix d'excellence — Meilleur élève de Bingerville" },
    { img: 'https://static.wixstatic.com/media/568692_dc37e82b251f4539a2197bfce1bb7473~mv2.jpg',  tag: 'Sports · 2024', title: 'OISSU 2024 — Compétitions interscolaires' },
    { img: 'https://static.wixstatic.com/media/568692_1b54c000148f481cb510501377260cb5~mv2.jpg',  tag: 'Culture · 2024', title: 'Journée culturelle 2024 au Groupe Le Miri' },
    { img: 'https://static.wixstatic.com/media/568692_cf5e087dc01145bd9f1d4e17833baaf2~mv2.jpg',  tag: 'Sports · 2024', title: '52ème édition — Jeux culturels et sportifs EMPT' },
  ],
  'site:events': [
    { img: 'https://static.wixstatic.com/media/568692_e74ddedabe33488d96e4e1f158cd0e2e~mv2.jpeg', date: 'Mars 2026', title: "Journée internationale des droits des femmes", text: "Le Groupe scolaire le Miri a célébré la Journée internationale des droits des femmes.", tag: 'Vie scolaire' },
    { img: 'https://static.wixstatic.com/media/568692_5872756807264897800571835c6aa93e~mv2.jpeg', date: '21 Juin 2025', title: "Journée du mérite et de l'excellence 2024-2025", text: "Célébration et récompense de nos meilleurs élèves.", tag: 'Excellence' },
    { img: 'https://static.wixstatic.com/media/568692_4e332bbf1a0b463b88aca254efd3e71b~mv2.jpeg', date: 'Mai 2025', title: "Prix d'excellence — Meilleur élève de Bingerville", text: "L'élève BROU GRACE LYN (Tle A1) a reçu le prix d'excellence.", tag: 'Prix' },
    { img: 'https://static.wixstatic.com/media/568692_54db957d77394b61a594f9e1e70a819d~mv2.jpeg', date: 'Mai 2025', title: "Concours national d'anglais", text: "L'élève BINTUNI JOËLLE (4ème) qualifiée pour la finale.", tag: 'Compétition' },
    { img: 'https://static.wixstatic.com/media/568692_f1345125c1c94672ae63069bc5a308bb~mv2.jpeg', date: 'Mai 2025', title: "Sortie au Salon du Livre 2025", text: "Les élèves du Miri ont visité le salon du livre.", tag: 'Culture' },
    { img: 'https://static.wixstatic.com/media/568692_dd39357cc7394d20a85fdaa74a437a45~mv2.jpeg', date: '2025', title: "Tableau d'art — Club Art visuel", text: "Remarquable travail du Club Art Visuel du MIRI.", tag: 'Arts' },
    { img: 'https://static.wixstatic.com/media/568692_66460a94c1e54198a62370b17eea46c0~mv2.jpeg', date: '2025', title: "Café littéraire avec l'écrivain Goli Bi Mathurin Irié", text: "Rencontre littéraire exceptionnelle.", tag: 'Littérature' },
    { img: 'https://static.wixstatic.com/media/568692_985f0dc45b2a4f4eb4c53032c4101f70~mv2.jpeg', date: '2024', title: "Reconnaissance et mérite", text: "Cérémonie de reconnaissance pour les élèves et personnels.", tag: 'Excellence' },
    { img: 'https://static.wixstatic.com/media/568692_1b54c000148f481cb510501377260cb5~mv2.jpg',  date: '2024', title: "Journée culturelle 2024", text: "Grande fête culturelle rassemblant toute la communauté scolaire.", tag: 'Culture' },
    { img: 'https://static.wixstatic.com/media/568692_dc37e82b251f4539a2197bfce1bb7473~mv2.jpg',  date: '2024', title: "OISSU 2024", text: "Participation aux compétitions inter-établissements.", tag: 'Sport' },
    { img: 'https://static.wixstatic.com/media/568692_cf5e087dc01145bd9f1d4e17833baaf2~mv2.jpg',  date: '2024', title: "52ème édition des jeux de l'EMPT", text: "Les élèves du MIRI ont participé à la 52ème édition.", tag: 'Sport' },
  ],
  'site:ticker': [
    '🔸 Ouverture de la piscine du Groupe Scolaire Le Miri 2026-2027',
    "🔸 Nouvelle tenue du lundi — consulter la note d'information",
    '🔸 Inscriptions 2026-2027 ouvertes — nouvel élève et réinscription',
    '🔸 Calendrier des examens blancs 2026-2027 disponible',
    "🔸 BROU GRACE LYN — Prix d'excellence meilleur élève de Bingerville",
    '🔸 BINTUNI JOËLLE (4ème) — Finaliste Concours national d\'anglais 2025',
    '🔸 BAC 2024 : 95% · BEPC 2024 : 92%',
  ],
  'site:notes_parents': [
    { date: '12 Septembre 2025', title: "Ouverture de la piscine — Note d'information", pdf: '' },
    { date: '05 Octobre 2025',   title: 'Nouvelle tenue du lundi', pdf: '' },
    { date: '18 Novembre 2025',  title: "Note d'information — Réunion parents", pdf: '' },
    { date: '10 Décembre 2025',  title: "Note d'information — Retrait des bulletins", pdf: '' },
    { date: '22 Février 2026',   title: "Note d'information — Kermesse", pdf: '' },
    { date: '05 Mars 2026',      title: 'Compte rendu de réunion', pdf: '' },
  ],
  'site:notes_service': [
    { date: '12 Septembre 2025', title: "Ouverture de la piscine — Note d'information", pdf: '' },
    { date: '05 Octobre 2025',   title: 'Nouvelle tenue du lundi', pdf: '' },
    { date: '05 Mars 2026',      title: 'Compte rendu de réunion', pdf: '' },
  ],
  'site:horaires': [
    { title: 'Horaire Maternelle 2026-2027',  date: 'Année 2026-2027', desc: 'Emploi du temps Maternelle',  img: '', pdf: '' },
    { title: 'Horaire Primaire 2026-2027',    date: 'Année 2026-2027', desc: 'Emploi du temps Primaire',    img: 'https://static.wixstatic.com/media/568692_ec9b0fbdfae54281af849d06ec158f78~mv2.jpg', pdf: '' },
    { title: 'Horaire Secondaire 2026-2027',  date: 'Année 2026-2027', desc: 'Emploi du temps Collège',     img: '', pdf: '' },
    { title: 'Horaire Lycée 2026-2027',       date: 'Année 2026-2027', desc: 'Emploi du temps Lycée',       img: '', pdf: '' },
  ],
  'site:examens': [
    { title: 'Calendrier examens blancs BEPC 2026', date: 'Mars 2026',     desc: 'Programme et salles BEPC', pdf: '' },
    { title: 'Calendrier examens blancs BAC 2026',  date: 'Mars 2026',     desc: 'Programme et salles BAC',  pdf: '' },
    { title: 'Sujets composés 1er trimestre',       date: 'Novembre 2025', desc: 'Énoncés des compositions', pdf: '' },
  ],
  'site:palmares': {
    cepe: { rate: '100%',   year: '2025', text: "Félicitations à tous nos élèves pour ce taux de réussite exceptionnel au CEPE 2025.", img: 'https://static.wixstatic.com/media/568692_ec3af11afc7a40a488d0ff31d17b873e~mv2.jpeg' },
    bepc: { rate: '82.19%', year: '2025', text: "Belle performance au BEPC 2025. Félicitations à nos candidats et au corps enseignant.", img: 'https://static.wixstatic.com/media/568692_a65331c5584f43638b715742c86f8512~mv2.jpeg' },
    bac:  { rate: '95%',    year: '2024', text: "Taux de réussite exceptionnel au Baccalauréat 2024.", img: '' },
  },
  'site:clubs': [
    { name: 'Club Art Visuel',        resp: 'Mme YAO Akissi',   desc: 'Peinture, dessin, sculpture et arts plastiques.', members: 18, img: 'https://static.wixstatic.com/media/568692_dd39357cc7394d20a85fdaa74a437a45~mv2.jpeg', pdf: '' },
    { name: 'Club Théâtre',           resp: 'M. KOUASSI Jean',  desc: 'Expression dramatique et représentation scénique.', members: 22, img: '', pdf: '' },
    { name: 'Club Lecture',           resp: 'Mme BAMBA Fatou',  desc: 'Cercle de lecture, cafés littéraires et ateliers écriture.', members: 15, img: 'https://static.wixstatic.com/media/568692_66460a94c1e54198a62370b17eea46c0~mv2.jpeg', pdf: '' },
    { name: 'Club Informatique',      resp: 'M. TOURE Ali',     desc: "Initiation à l'informatique et au codage.", members: 20, img: '', pdf: '' },
    { name: 'Club Sports Collectifs', resp: 'M. KONE Seydou',   desc: 'Football, basketball, handball et athlétisme.', members: 35, img: 'https://static.wixstatic.com/media/568692_dc37e82b251f4539a2197bfce1bb7473~mv2.jpg', pdf: '' },
    { name: 'Club Journalisme',       resp: 'Mme BAMBA Fatou',  desc: 'Journal scolaire, reportage et communication.', members: 12, img: '', pdf: '' },
  ],
  'site:gallery2': [
    { type: 'photo', src: 'https://static.wixstatic.com/media/568692_1b54c000148f481cb510501377260cb5~mv2.jpg',  caption: 'Journée culturelle 2024' },
    { type: 'photo', src: 'https://static.wixstatic.com/media/568692_e74ddedabe33488d96e4e1f158cd0e2e~mv2.jpeg', caption: 'Journée des droits des femmes 2026' },
    { type: 'photo', src: 'https://static.wixstatic.com/media/568692_cf5e087dc01145bd9f1d4e17833baaf2~mv2.jpg',  caption: 'Jeux culturels EMPT 2024' },
    { type: 'photo', src: 'https://static.wixstatic.com/media/568692_5872756807264897800571835c6aa93e~mv2.jpeg', caption: 'Journée du mérite 2025' },
    { type: 'photo', src: 'https://static.wixstatic.com/media/568692_dd39357cc7394d20a85fdaa74a437a45~mv2.jpeg', caption: 'Club Art Visuel 2025' },
    { type: 'photo', src: 'https://static.wixstatic.com/media/568692_dc37e82b251f4539a2197bfce1bb7473~mv2.jpg',  caption: 'OISSU 2024' },
    { type: 'photo', src: 'https://static.wixstatic.com/media/568692_66460a94c1e54198a62370b17eea46c0~mv2.jpeg', caption: 'Café littéraire 2025' },
    { type: 'photo', src: 'https://static.wixstatic.com/media/568692_54db957d77394b61a594f9e1e70a819d~mv2.jpeg', caption: 'Concours national anglais 2025' },
    { type: 'photo', src: 'https://static.wixstatic.com/media/568692_f1345125c1c94672ae63069bc5a308bb~mv2.jpeg', caption: 'Salon du livre 2025' },
    { type: 'photo', src: 'https://static.wixstatic.com/media/568692_4e332bbf1a0b463b88aca254efd3e71b~mv2.jpeg', caption: 'Prix excellence Bingerville' },
    { type: 'photo', src: 'https://static.wixstatic.com/media/568692_985f0dc45b2a4f4eb4c53032c4101f70~mv2.jpeg', caption: 'Cérémonie reconnaissance 2024' },
    { type: 'photo', src: 'https://static.wixstatic.com/media/568692_ec3af11afc7a40a488d0ff31d17b873e~mv2.jpeg', caption: 'Palmarès CEPE 2025' },
    { type: 'photo', src: 'https://static.wixstatic.com/media/568692_a65331c5584f43638b715742c86f8512~mv2.jpeg', caption: 'Palmarès BEPC 2025' },
  ],
  'site:conseil': {
    text: "Le Conseil Scolaire du Groupe Scolaire Le Miri est l'instance représentative des élèves. Il joue un rôle actif dans la vie de l'établissement, en relayant les propositions et préoccupations des élèves auprès de la direction.",
    pdf: ''
  },
  'site:teachers': [
    { name: 'M. KOUASSI Jean', subj: 'Mathématiques',   cycle: 'Secondaire & Lycée' },
    { name: 'Mme BAMBA Fatou', subj: 'Français',        cycle: 'Secondaire' },
    { name: 'M. KONE Seydou',  subj: 'Physique-Chimie', cycle: 'Lycée' },
    { name: 'Mme YAO Akissi',  subj: 'Titulaire (CM2)', cycle: 'Primaire' },
    { name: 'M. TOURE Ali',    subj: 'Anglais',         cycle: 'Secondaire & Lycée' },
  ],
  // 'site:eleves' supprimé — données confidentielles accessibles uniquement via admin: (chemin protégé par authentification Firebase)
  'admin:eleves': [
    { title: 'Liste élèves Maternelle 2026-2027',       date: 'Année 2026-2027', desc: 'Petite, Moyenne et Grande section', pdf: '' },
    { title: 'Liste élèves Primaire CP-CM2 2026-2027',  date: 'Année 2026-2027', desc: 'CP, CE1, CE2, CM1, CM2',           pdf: '' },
    { title: 'Liste élèves Secondaire 6e-3e 2026-2027', date: 'Année 2026-2027', desc: '6ème, 5ème, 4ème, 3ème',           pdf: '' },
    { title: 'Liste élèves Lycée 2026-2027',            date: 'Année 2026-2027', desc: '2nde, 1ère, Terminale',            pdf: '' },
  ],
  'site:principals': [
    { classe: '6ème A',      name: 'M. TOURE Ali',    contact: 'Poste 112' },
    { classe: '3ème B',      name: 'Mme BAMBA Fatou', contact: 'Poste 114' },
    { classe: 'Terminale D', name: 'M. KONE Seydou',  contact: 'Poste 118' },
  ],
  'site:surveillance': [
    { date: '12 Mars 2026', exam: 'Examen Blanc BEPC — Mathématiques', room: 'Salle 4 (M. KOUASSI)' },
    { date: '15 Mars 2026', exam: 'Examen Blanc BAC — Philosophie',    room: 'Salle 12 (Mme BAMBA)' },
  ],
  'site:visites': [
    { date: '20 Mars 2026', class: '6ème A', teacher: 'M. TOURE Ali', obs: 'Inspection régulière' },
  ],
  'site:ens_infos': [
    { title: 'Emploi du temps corps enseignant 2026-2027', date: 'Septembre 2025', desc: 'Répartition des heures et salles', img: '', pdf: '' },
    { title: 'Note de rentrée pédagogique', date: 'Septembre 2025', desc: 'Instructions pour le corps enseignant', img: '', pdf: '' },
  ],
  'site:activites': [],
  'site:conseils_ens': [],
  'site:pages': {
    historique:    { title: 'Historique — Le MIRI',           content: "Le Groupe Scolaire Le Miri est un établissement d'enseignement privé laïc situé à Bingerville, dans la commune d'Abidjan, en Côte d'Ivoire.\n\nDepuis sa création, le MIRI s'est imposé comme un acteur incontournable de l'éducation à Bingerville.\n\nCode Établissement : 041604." },
    reglement:     { title: 'Règlement Intérieur',             content: "Le règlement intérieur du Groupe Scolaire Le Miri définit les droits et les obligations de tous les membres de la communauté scolaire.", pdf: '' },
    organigramme:  { title: "Organigramme de l'établissement", content: "Direction Générale\nDirection des Études\nCorps enseignant (Maternelle, Primaire, Secondaire)\nService de la Vie Scolaire\nService Administratif et Comptable\nConseil Scolaire" },
    maternelle:    { title: 'La Maternelle du Miri',           content: "La maternelle offre un environnement chaleureux, ludique et sécurisé pour les tout-petits." },
    primaire:      { title: 'Le Primaire du Miri',             content: "Le cycle primaire construit des bases académiques solides en lecture, écriture, mathématiques et langues." },
    secondaire:    { title: 'Le Secondaire du Miri',           content: "Du collège jusqu'au Baccalauréat, nos équipes pédagogiques accompagnent chaque lycéen vers l'excellence." },
    intro_mission: { title: 'Notre mission (accueil)',          content: "Le Groupe Scolaire Le Miri est bien plus qu'une école. C'est un espace de vie, de croissance et d'ambition." },
  },
  // Le mot de passe est stocké sous forme de hash SHA-256 uniquement.
  // Pour changer le mot de passe : Admin → Sécurité
  'admin:credentials': {
    user: 'admin',
    passHash: '38a1fc99e044d13532611498ea8048e5839374e6b194176a95933f77e78c03ed'
  },
  'site:pageVisibility': {},
};

/* ════════════════════════════════════════════
   CHARGEMENT GLOBAL — utilisé par index.html
   ════════════════════════════════════════════ */
const CMS = {};

async function loadAllCMS() {
  const keys = [
    'site:config','site:slides','site:events','site:ticker',
    'site:notes_parents','site:notes_service',
    'site:horaires','site:examens','site:palmares',
    'site:clubs','site:gallery2','site:conseil',
    'site:teachers','site:principals','site:surveillance','site:visites',
    'site:pages','site:ens_infos',
    'site:activites','site:conseils_ens','site:surveillance_pdf',
    'site:pageVisibility',
  ];
  const results = await Promise.all(keys.map(k => cmsGet(k)));
  keys.forEach((k, i) => {
    const shortKey = k.replace('site:', '');
    CMS[shortKey] = (results[i] !== null && results[i] !== undefined)
      ? results[i]
      : CMS_DEFAULTS[k];
  });
  // Alias pratiques
  CMS.config         = CMS['config']         || CMS_DEFAULTS['site:config'];
  CMS.slides         = CMS['slides']         || CMS_DEFAULTS['site:slides'];
  CMS.events         = CMS['events']         || CMS_DEFAULTS['site:events'];
  CMS.ticker         = CMS['ticker']         || CMS_DEFAULTS['site:ticker'];
  CMS.pageVisibility = CMS['pageVisibility'] || CMS_DEFAULTS['site:pageVisibility'] || {};
}

// Exposer globalement
window.CMS         = CMS;
window.cmsGet      = cmsGet;
window.cmsSet      = cmsSet;
window.cmsDel      = cmsDel;
window.loadAllCMS  = loadAllCMS;
window.CMS_DEFAULTS = CMS_DEFAULTS;
