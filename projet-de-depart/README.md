# Projet de départ — lundi 9 novembre 2026

Le corrigé des TD 8 à 10 : le site des TD React, un serveur Express qui donne les films, et la grille du TD 7 qui lit ce serveur.

1. Dans ce dossier : `npm ci`.
2. Terminal 1 : `npm run server`, le serveur, sur http://localhost:3000/api/films.
3. Terminal 2 : `npm run dev`, le site, sur http://localhost:5173. La page « TD 7 · Affiches » charge les films du serveur (TD 10).

- `server/index.ts` : le serveur (TD 9). `server/films.ts` : ses films.
- `vite.config.ts` : le proxy, qui transmet `/api` au serveur (TD 10).
- `src/td7-affiches/Td7.tsx` : la grille, qui charge `/api/films` (TD 10).
- `npm run build` vérifie les types du site et du serveur, puis construit le site.

Tu as déjà un dépôt GitHub ? Copie ces fichiers dans ton dossier, à la place des tiens (garde le dossier caché `.git`), puis `npm install`, un commit et `git push`.
