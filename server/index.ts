// Corrigé — TD 9 — Ton premier serveur : les films en JSON sur /api/films, port 3000.
// Lancement : npm run server. Node 22.18 ou plus lance ce fichier .ts sans autre outil, et --watch le relance à chaque sauvegarde.
import express from 'express';
import { films } from './films.ts';

const app = express();

// TD 9 : tous les films. Si tu as fini : /api/films?annee=2025 renvoie seulement les films de 2025.
app.get('/api/films', (req, res) => {
  if (req.query.annee === undefined) {
    res.json(films);
    return;
  }
  res.json(films.filter((film) => film.year === Number(req.query.annee)));
});

app.listen(3000, () => console.log('API des films : http://localhost:3000/api/films'));
