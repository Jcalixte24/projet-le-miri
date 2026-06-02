# Guide de déploiement complet
## Groupe Scolaire Le Miri — Site web + CMS
### Netlify + Firebase Realtime Database

> **Durée totale : 25 minutes**
> Pas besoin d'être développeur. Suivez chaque étape dans l'ordre.

---

## Ce que vous allez faire

```
ÉTAPE 1 → Créer la base de données Firebase (Google) — 10 min
ÉTAPE 2 → Renseigner l'adresse Firebase dans le fichier cms.js — 2 min
ÉTAPE 3 → Mettre en ligne sur Netlify — 5 min
ÉTAPE 4 → Tester que tout fonctionne — 3 min
ÉTAPE 5 → (Optionnel) Ajouter votre nom de domaine — 5 min
```

---

## ÉTAPE 1 — Créer la base de données Firebase

Firebase est un service gratuit de Google qui stocke les données de votre site
(actualités, slides, ticker, notes, etc.). C'est lui qui remplace le CMS.

### 1.1 — Créer un compte / se connecter

1. Ouvrez votre navigateur et allez sur :
   **https://console.firebase.google.com**

2. Connectez-vous avec un compte Google (Gmail).
   Si vous n'en avez pas, créez-en un gratuitement sur gmail.com d'abord.

### 1.2 — Créer le projet

1. Sur la page d'accueil Firebase, cliquez **"Ajouter un projet"**
   (ou "Create a project" si l'interface est en anglais)

2. **Nom du projet** : tapez `lemiri-cms`
   (vous pouvez mettre autre chose, peu importe)

3. Cliquez **"Continuer"**

4. Sur l'écran "Google Analytics" : **désactivez le bouton** (on n'en a pas besoin)

5. Cliquez **"Créer le projet"**

6. Attendez environ 30 secondes que Firebase prépare le projet.
   Une animation tourne, puis un message "Votre projet est prêt" apparaît.

7. Cliquez **"Continuer"**

### 1.3 — Créer la base de données

Vous êtes maintenant dans votre projet Firebase.

1. Dans le **menu à gauche**, cherchez la section **"Création"** et cliquez sur
   **"Realtime Database"**
   (si vous ne voyez pas ce menu, cliquez l'icône ☰ en haut à gauche pour l'ouvrir)

2. Cliquez le bouton **"Créer une base de données"**

3. **Choisir l'emplacement** :
   Dans la liste déroulante, sélectionnez **"europe-west1 (Belgique)"**
   C'est le serveur le plus proche de la Côte d'Ivoire.
   → Cliquez **"Suivant"**

4. **Mode de démarrage** :
   Sélectionnez **"Démarrer en mode test"**
   → Cliquez **"Activer"**

5. Attendez quelques secondes. La base de données est créée.

### 1.4 — Copier votre URL Firebase ← IMPORTANT

Après la création, vous voyez une page avec votre base de données.
En haut de cette page, il y a une adresse en gris qui ressemble à :

```
https://lemiri-cms-abc12-default-rtdb.firebaseio.com
```

**Copiez cette adresse** (sélectionnez-la et faites Ctrl+C).
Vous en aurez besoin à l'étape 2.

> ⚠️ Cette adresse est unique pour votre projet.
> Elle ne ressemblera pas exactement à l'exemple ci-dessus — c'est normal.

### 1.5 — Configurer les règles de sécurité

Toujours dans Firebase → Realtime Database :

1. Cliquez sur l'onglet **"Règles"** (en haut, à côté de "Données")

2. Vous voyez du texte. **Effacez tout** et remplacez par ceci :

```json
{
  "rules": {
    "cms": {
      ".read": true,
      ".write": true
    },
    "admin": {
      ".read": false,
      ".write": true
    }
  }
}
```

3. Cliquez **"Publier"**

> **Ce que ça fait** :
> - `cms` → tout le monde peut lire (le site public affiche les données)
> - `admin` → personne ne peut lire (le mot de passe admin est protégé)
> - Les deux → écriture autorisée (l'admin peut modifier le contenu)

---

## ÉTAPE 2 — Renseigner l'adresse Firebase dans cms.js

Maintenant que vous avez votre URL Firebase, vous devez la coller dans le fichier `cms.js`.

### 2.1 — Ouvrir le fichier cms.js

1. Sur votre ordinateur, trouvez le dossier `lemiri-prod` que vous avez téléchargé.

2. Ouvrez le fichier **`cms.js`** avec un éditeur de texte :
   - **Windows** : clic droit sur le fichier → "Ouvrir avec" → Notepad (Bloc-notes)
   - **Mac** : double-clic → s'ouvre avec TextEdit
   - **Mieux** : utilisez Notepad++ (Windows) ou VS Code (gratuit, tous systèmes)

### 2.2 — Trouver la ligne à modifier

Dans le fichier `cms.js`, cherchez (Ctrl+F) cette ligne :

```
const FIREBASE_URL = 'https://VOTRE-PROJET-default-rtdb.firebaseio.com';
```

Elle se trouve vers la **ligne 16** du fichier.

### 2.3 — Remplacer par votre URL

Remplacez `https://VOTRE-PROJET-default-rtdb.firebaseio.com`
par l'adresse que vous avez copiée à l'étape 1.4.

**Avant :**
```javascript
const FIREBASE_URL = 'https://VOTRE-PROJET-default-rtdb.firebaseio.com';
```

**Après (exemple) :**
```javascript
const FIREBASE_URL = 'https://lemiri-cms-abc12-default-rtdb.firebaseio.com';
```

> ⚠️ Points importants :
> - Gardez les guillemets `'...'` autour de l'URL
> - Pas d'espace avant ou après l'URL
> - Pas de `/` à la fin de l'URL
> - Ne modifiez rien d'autre dans ce fichier

### 2.4 — Enregistrer le fichier

Faites **Ctrl+S** (ou Fichier → Enregistrer).

---

## ÉTAPE 3 — Mettre en ligne sur Netlify

Netlify est un service gratuit qui héberge votre site web.

### 3.1 — Créer un compte Netlify

1. Allez sur **https://app.netlify.com**

2. Cliquez **"Sign up"** (inscription)

3. Cliquez **"Sign up with Email"** et créez un compte avec votre email
   (ou connectez-vous avec Google/GitHub si vous avez déjà un compte)

4. Vérifiez votre email si Netlify vous envoie un lien de confirmation.

### 3.2 — Mettre le site en ligne (Drag & Drop)

C'est la méthode la plus simple — aucune commande, juste glisser-déposer.

1. Sur la page d'accueil de Netlify, faites défiler vers le bas jusqu'à voir :
   **"Want to deploy a new site without connecting to Git?"**
   Sous ce texte, il y a une zone avec un contour en pointillés.

2. Ouvrez le dossier `lemiri-prod` sur votre ordinateur (mais ne l'ouvrez pas dans Netlify encore).

3. **Glissez le dossier `lemiri-prod` entier** et déposez-le dans la zone pointillée de Netlify.

   > Si vous ne pouvez pas glisser un dossier, glissez **tous les fichiers** du dossier
   > (index.html, cms.js, netlify.toml, _redirects, robots.txt, GUIDE_DEPLOIEMENT.md)
   > ET le sous-dossier `admin` avec son `index.html`.

4. Netlify charge les fichiers et affiche une barre de progression.
   Attendez 20 à 40 secondes.

5. ✅ Votre site est en ligne ! Netlify vous donne une URL du type :
   ```
   https://magical-name-123456.netlify.app
   ```
   Notez cette adresse — c'est votre site.

---

## ÉTAPE 4 — Tester que tout fonctionne

### 4.1 — Tester le site public

1. Ouvrez l'URL Netlify dans votre navigateur (ex: `https://magical-name-123456.netlify.app`)
2. Vérifiez que la page d'accueil s'affiche correctement avec le logo, le menu, les actualités.
3. Naviguez dans les différentes sections (Parents, Enseignants, Vie scolaire, etc.)

### 4.2 — Tester l'interface admin

1. Ajoutez `/admin` à la fin de votre URL :
   `https://magical-name-123456.netlify.app/admin`

2. La page de connexion apparaît. Entrez :
   - **Identifiant** : `admin`
   - **Mot de passe** : `lemiri2025`

3. Cliquez **"Accéder au panneau"**

4. Vous êtes dans l'interface d'administration. ✅

### 4.3 — Tester que le CMS fonctionne (test de bout en bout)

1. Dans l'admin, cliquez **"Bandeau défilant"** dans le menu gauche
2. Modifiez un message (par exemple ajoutez "TEST" au début)
3. Cliquez **"Enregistrer le bandeau"**
4. Ouvrez la page principale dans un autre onglet
5. Actualisez (F5) → le bandeau doit afficher votre message modifié ✅

Si le bandeau est mis à jour → **tout fonctionne parfaitement**.

### 4.4 — Changer le mot de passe admin (recommandé)

1. Dans l'admin → menu gauche → **"Sécurité"**
2. Entrez un nouvel identifiant et un nouveau mot de passe
3. Cliquez **"Mettre à jour"**
4. Notez ce mot de passe en lieu sûr — si vous l'oubliez, il faudra réinitialiser Firebase.

---

## ÉTAPE 5 — Ajouter votre nom de domaine (optionnel)

Si vous avez un nom de domaine (ex: `groupescolairelemiri.ci` ou `.com`),
vous pouvez le connecter à votre site Netlify gratuitement.

### 5.1 — Dans Netlify

1. Dans votre site Netlify → cliquez **"Domain settings"**
2. Cliquez **"Add custom domain"**
3. Tapez votre nom de domaine (ex: `groupescolairelemiri.com`)
4. Cliquez **"Verify"** puis **"Add domain"**
5. Netlify vous affiche des **enregistrements DNS** à configurer.

### 5.2 — Chez votre registrar (là où vous avez acheté le domaine)

Connectez-vous à votre registrar (OVH, Gandi, Namecheap, etc.) et ajoutez
les enregistrements DNS que Netlify vous a donnés.
En général il s'agit de modifier les **nameservers** pour pointer vers Netlify.

> Cette étape varie selon votre registrar.
> Cherchez "changer nameservers [nom de votre registrar]" si vous bloquez.

### 5.3 — HTTPS automatique

Netlify active automatiquement le **HTTPS** (cadenas vert) une fois le domaine configuré.
Cela peut prendre quelques heures après la configuration DNS.

---

## Résumé des identifiants à conserver

| Service | URL de connexion | Identifiants |
|---------|-----------------|--------------|
| Firebase Console | console.firebase.google.com | Compte Google |
| Netlify | app.netlify.com | Email + mot de passe Netlify |
| Admin du site | votre-site.netlify.app/admin | admin / lemiri2025 (à changer) |

---

## Résolution des problèmes fréquents

### ❌ La page principale s'affiche mais les données ne chargent pas
**Cause** : L'URL Firebase dans `cms.js` est incorrecte ou vide.
**Solution** : Rouvrez `cms.js`, vérifiez la ligne `FIREBASE_URL`, corrigez et re-uploadez sur Netlify.

### ❌ L'admin répond "Identifiant ou mot de passe incorrect"
**Cause** : Première connexion avant que Firebase ne soit initialisé.
**Solution** : Les identifiants par défaut sont `admin` / `lemiri2025`. Si ça ne marche toujours pas, ouvrez la console Firebase → Realtime Database → Données → cherchez le nœud `admin` → vérifiez qu'il y a un objet `admin_credentials`.

### ❌ Le site affiche "Page introuvable" sur /admin
**Cause** : Le fichier `_redirects` n'a pas été uploadé.
**Solution** : Vérifiez que `_redirects` est bien dans le dossier uploadé et re-déployez.

### ❌ Erreur "Failed to fetch" dans la console du navigateur
**Cause** : L'URL Firebase est incorrecte ou les règles Firebase bloquent.
**Solution** :
1. Vérifiez l'URL Firebase dans `cms.js` (pas d'espace, pas de `/` final)
2. Vérifiez les règles Firebase (étape 1.5) — elles doivent être publiées

### ❌ Les modifications admin ne s'affichent pas sur le site
**Cause** : Cache navigateur ou Firebase pas encore synchronisé.
**Solution** : Actualisez avec **Ctrl+Shift+R** (vidage du cache) sur la page principale.

### ❌ Netlify affiche "Build failed"
**Cause** : Rare avec un site HTML pur. Vérifiez que `netlify.toml` est présent.
**Solution** : Supprimez `netlify.toml` et uploadez seulement les fichiers HTML, `cms.js`, `_redirects` et `robots.txt`.

---

## Coût total

| Service | Plan utilisé | Prix |
|---------|-------------|------|
| Firebase Realtime Database | Spark (gratuit) | **0 €/mois** |
| Netlify | Starter (gratuit) | **0 €/mois** |
| Nom de domaine (optionnel) | Variable | ~10-15 €/an |

**Le site complet coûte 0 € par mois** avec les plans gratuits.
Les limites gratuites (1 GB Firebase, 100 GB Netlify/mois) sont très largement
suffisantes pour un site d'école.

---

*Guide rédigé pour le Groupe Scolaire Le Miri — mars 2026*
