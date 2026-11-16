import express from 'express';
import initialFilms from './films.json' with { type: 'json' };
import type { Movie } from '../src/donnees/films.js';

const app = express();
const films: Movie[] = [...initialFilms];
let nextId = Math.max(...films.map((film) => film.id)) + 1;

app.use(express.json());

app.get('/api/films', (req, res) => {
  const { annee } = req.query;

  if (annee === undefined) {
    res.json(films);
    return;
  }

  if (typeof annee !== 'string' || !/^\d{4}$/.test(annee)) {
    res.status(400).json({ error: 'Le paramètre annee doit être une année valide.' });
    return;
  }

  res.json(films.filter((film) => film.year === Number(annee)));
});

app.get('/api/films/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: 'ID invalide' });
    return;
  }
  const film = films.find((f) => f.id === id);
  if (!film) {
    res.status(404).json({ error: 'Film introuvable' });
    return;
  }
  res.json(film);
});

app.post('/api/films', (req, res) => {
  const body: unknown = req.body;
  if (typeof body !== 'object' || body === null || !('title' in body) || !('year' in body)) {
    res.status(400).json({ error: 'Le titre et l’année sont obligatoires.' });
    return;
  }

  const { title, year } = body;
  const cleanTitle = typeof title === 'string' ? title.trim() : '';

  if (cleanTitle.length < 1 || cleanTitle.length > 80) {
    res.status(400).json({ error: 'Le titre doit contenir entre 1 et 80 caractères.' });
    return;
  }

  if (typeof year !== 'number' || !Number.isInteger(year) || year < 1888 || year > 2030) {
    res.status(400).json({ error: 'L’année doit être un entier entre 1888 et 2030.' });
    return;
  }

  const newFilm: Movie = {
    id: nextId++,
    title: cleanTitle,
    year,
    overview: '',
  };

  films.push(newFilm);
  res.status(201).json(newFilm);
});

app.listen(3000, () => {
  console.log('Serveur API disponible sur http://localhost:3000');
});