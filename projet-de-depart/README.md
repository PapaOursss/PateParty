# Corrigé des TD React — lundi 19 octobre 2026

Une solution possible des TD 1 à 7. Tu peux la lire, la comparer à ton code, ou t'en servir comme projet de départ pour les TD suivants.

1. Dans ce dossier : `npm ci`, puis `npm run dev`.
2. Ouvre http://localhost:5173. Le menu en haut de la page ouvre le corrigé de chaque TD.

`npm run build` vérifie les types, puis construit le site.

Pour lancer le serveur du TD 9 dans un second terminal : `npm run server`. Il se relance automatiquement quand tu modifies ses fichiers. Les films sont disponibles en JSON sur http://localhost:3000/api/films ; ajoute `?annee=2025` pour filtrer par année. `npm run build` vérifie aussi les types du serveur.

Pour le TD 10 : la grille du TD 7 charge les films depuis `/api/films`. Vite transmet cette requête au serveur Express sur le port 3000 ; garde les deux terminaux ouverts (`npm run dev` et `npm run server`). Les données de l'API sont dans `server/films.json`. Si le serveur ne répond pas, la page affiche un message avec un bouton pour réessayer.
