import express from 'express';
import films from './films.json' with { type: 'json' };

const app = express();

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

app.listen(3000);