import express from 'express';
import films from './films.json' with { type: 'json' }
const app = express();

app.get('/api/films', (req, res, next) => {
    const year = req.query.annee;
    if (year === undefined) {
        next();
        return;
    }

    if (typeof year !== 'string' || !Number.isInteger(Number(year))) {
        res.status(400).json({ error: 'Invalid year' });
        return;
    }

    const filteredFilms = films.filter((film) => film.year === Number(year));
    res.json(filteredFilms);
});

app.get('/api/films', (req, res) => {
    res.json(films);
});

app.get('/api/films/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
        res.status(400).json({ error: 'Invalid film ID' });
        return;
    }
    const film = films.find((f) => f.id === id);
    if (!film) {
        res.status(404).json({ error: 'Film not found' });
        return;
    }
    res.json(film);
});

app.listen(3000);