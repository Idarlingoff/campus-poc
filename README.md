# Campus POC – Initialisation du projet

## Objectif du projet

Ce projet est un **POC d’application web pour le campus de l'école**.
Il vise à démontrer rapidement la faisabilité technique d’une application moderne avec :

* un **backend Node.js**
* un **frontend Vue.js**
* une **base de données**
* une **base outillée propre** (Docker, Git, conventions)

L’objectif principal de cette phase est de **poser des fondations saines**, reproductibles et simples pour l’équipe.

---

## Stack technique

### Backend

* **Node.js** (v25.x)
* Framework backend : **NestJS**
* API REST
* Prévu pour être connecté à une base de données (PostgreSQL)

### Frontend

* **Vue.js 3**
* Initialisé avec **Vite**
* TypeScript activé

### Base de données

* **PostgreSQL**
* Lancement via Docker (à venir / en cours d’intégration)

---

## Organisation du projet (monorepo)

Le projet est organisé en **monorepo** avec **un seul dépôt Git** à la racine.

```text
campus-poc/
├─ apps/
│  ├─ api/        # Backend Node / NestJS
│  └─ web/        # Frontend Vue 3 / Vite
├─ .husky/        # Hooks Git (Husky)
├─ .gitignore
├─ package.json   # npm workspaces
├─ README.md
```

**Important** :
Il n’y a **qu’un seul dépôt Git** (à la racine).
Les dossiers `apps/api` et `apps/web` **ne sont pas des dépôts Git indépendants**.

---

## Gestion des dépendances

* Gestionnaire : **npm**
* Version npm : `11.x`
* Utilisation de **npm workspaces** pour gérer le monorepo

Le `package.json` racine déclare les workspaces :

```json
{
  "workspaces": ["apps/*"]
}
```

---

## Docker

Docker est utilisé pour :

* garantir un environnement cohérent entre développeurs
* préparer le projet à une exécution simple (API + DB)

Versions utilisées :

* Docker : `29.x`
* Docker Compose : `v2`

> Les fichiers Docker (Dockerfile / docker-compose) sont destinés à évoluer avec le projet.

---

## Git & conventions

### Dépôt Git

* Initialisé avec `git init`
* Lié manuellement à un dépôt GitHub distant
* Branche principale : `main`

---

## 🐶 Husky (Git hooks)

Le projet utilise **Husky (v9)** pour automatiser certaines règles Git.

### Pourquoi Husky ?

* Garantir une qualité minimale des commits
* Éviter les messages de commit non conformes
* Uniformiser les pratiques dans l’équipe

### Configuration choisie (volontairement minimale)

👉 **Un seul hook est utilisé** : `commit-msg`

* ❌ Pas de `pre-commit`
* ❌ Pas de lint automatique
* ❌ Pas de tests bloquants
* ✅ Juste une validation des messages de commit

### Hook actif

```text
.husky/commit-msg
```

Contenu :

```sh
npx commitlint --edit "$1"
```

---

## ✍Convention de commit (Conventional Commits)

Les messages de commit doivent respecter le format :

```text
<type>(<scope>): <description>
```

### Types autorisés (par défaut)

* `feat` : nouvelle fonctionnalité
* `fix` : correction de bug
* `chore` : configuration, outillage, nettoyage
* `docs` : documentation
* `refactor` : refactor sans changement fonctionnel
* `test` : tests
* `ci` : intégration continue

### Exemples valides

```text
chore(init): monorepo bootstrap
feat(api): add campus events endpoint
fix(web): fix login form validation
```

Tout message ne respectant pas ce format sera **refusé automatiquement**.

---

## `.gitignore`

Un fichier `.gitignore` est en place pour éviter de versionner :

* `node_modules`
* fichiers `.env`
* fichiers de build (`dist`, `build`)
* fichiers IDE (`.idea`, `.vscode`)
* fichiers système (`.DS_Store`)

---

## Démarrage du projet

### Prérequis

* Node.js ≥ 20 (25 recommandé)
* npm ≥ 9
* Docker + Docker Compose
* Git

### Installation

À la racine du projet :

```bash
npm install
```

### Lancer le projet (selon configuration Docker)

```bash
docker compose up
```