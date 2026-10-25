import express from 'express';
import films from './films.json' with { type: 'json' }
const app = express();

app.use(express.json());

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
    const idParam = req.params.id;
    if (!/^\d+$/.test(idParam)) {
        res.status(400).json({ error: 'L\'identifiant doit être un nombre entier' });
        return;
    }

    const id = Number(idParam);
    if (!Number.isSafeInteger(id)) {
        res.status(400).json({ error: 'L\'identifiant doit être un nombre entier' });
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
    const body = req.body as { title?: unknown; year?: unknown };

    const title = typeof body?.title === 'string' ? body.title.trim() : '';
    const year = body?.year;

    if (title.length < 1 || title.length > 80) {
        res.status(400).json({
            error: 'Le titre doit contenir de 1 à 80 caractères.',
        });
        return;
    }

    if (
        typeof year !== 'number' ||
        !Number.isInteger(year) ||
        year < 1888 ||
        year > 2030
    ) {
        res.status(400).json({
            error: 'L’année doit être un nombre entier entre 1888 et 2030.',
        });
        return;
    }

    const id = films.reduce((maximum, film) => Math.max(maximum, film.id), 0) + 1;

    const nouveauFilm = {
        id,
        title,
        year,
        overview: '',
    };

    films.push(nouveauFilm);
    res.status(201).json(nouveauFilm);
});

app.listen(3000);