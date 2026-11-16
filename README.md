# PateParty

Application de gestion de films (TD) : liste de films affichée dans une interface React, avec ajout, modification du statut « vu » et suppression. Les données sont stockées dans une base SQLite côté serveur, initialisée à partir de `server/films.json`.

## Structure

- `server/` : API REST Express/`node:http` sur le port 3000 (`/api/films`), base `films.db` créée automatiquement.
- `films-app/` : interface React + TypeScript + Vite.

## Lancer le projet

Prérequis : Node.js 22.5 ou plus récent (module `node:sqlite`).

1. Installer les dépendances de l'interface :
   ```bash
   cd films-app && npm install && cd ..
   ```
2. Lancer le serveur (dans un terminal) :
   ```bash
   cd server && npm start
   ```
3. Lancer l'interface (dans un autre terminal) :
   ```bash
   cd films-app && npm run dev
   ```
4. Ouvrir l'URL affichée par Vite (en général http://localhost:5173).

Pour réinitialiser les données, supprimer `server/films.db` puis relancer le serveur.