import express from 'express';
import films from './films.json' with { type: 'json' }
import { DatabaseSync } from 'node:sqlite';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const cheminBase = join(
    dirname(fileURLToPath(import.meta.url)),
    'films.db',
);
const db = new DatabaseSync(cheminBase);
db.exec(`
    CREATE TABLE IF NOT EXISTS films (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        year INTEGER NOT NULL,
        overview TEXT NOT NULL DEFAULT '',
        watched INTEGER NOT NULL DEFAULT 0
            CHECK (watched IN (0, 1))
    )
`);

const resultat = db.prepare('SELECT COUNT(*) AS total FROM films').get() as {
    total: number;
};

if (resultat.total === 0) {
    const insererFilm = db.prepare(`
        INSERT INTO films (id, title, year, overview, watched)
        VALUES (?, ?, ?, ?, ?)
    `);

    for (const film of films) {
        insererFilm.run(
            film.id,
            film.title,
            film.year,
            film.overview,
            film.watched ? 1 : 0,
        );
    }
}

function convertirFilm(row: Record<string, unknown>) {
    if (
        typeof row.id !== 'number' ||
        typeof row.title !== 'string' ||
        typeof row.year !== 'number' ||
        typeof row.overview !== 'string' ||
        typeof row.watched !== 'number'
    ) {
        throw new Error('Données de film invalides dans la base.');
    }

    return {
        id: row.id,
        title: row.title,
        year: row.year,
        overview: row.overview,
        watched: row.watched === 1,
    };
}

const app = express();
app.use(express.json());

app.get('/api/films', (req, res) => {
    const year = req.query.annee;

    if (year === undefined) {
        const lignes = db.prepare(
            'SELECT id, title, year, overview, watched FROM films ORDER BY id',
        ).all();

        res.json(lignes.map(convertirFilm));
        return;
    }

    if (typeof year !== 'string' || !Number.isInteger(Number(year))) {
        res.status(400).json({ error: 'Invalid year' });
        return;
    }

    const lignes = db.prepare(
        'SELECT id, title, year, overview, watched FROM films WHERE year = ? ORDER BY id',
    ).all(Number(year));

    res.json(lignes.map(convertirFilm));
});

app.get('/api/films/:id', (req, res) => {
    const idParam = req.params.id;

    if (!/^\d+$/.test(idParam)) {
        res.status(400).json({ error: "L'identifiant doit être un nombre entier" });
        return;
    }

    const id = Number(idParam);

    if (!Number.isSafeInteger(id)) {
        res.status(400).json({ error: "L'identifiant doit être un nombre entier" });
        return;
    }

    const ligne = db.prepare(
        'SELECT id, title, year, overview, watched FROM films WHERE id = ?',
    ).get(id);

    if (!ligne) {
        res.status(404).json({ error: 'Film introuvable' });
        return;
    }

    res.json(convertirFilm(ligne));
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

    const resultat = db.prepare(
        'INSERT INTO films (title, year, overview, watched) VALUES (?, ?, ?, ?)',
    ).run(title, year, '', 0);

    const ligne = db.prepare(
        'SELECT id, title, year, overview, watched FROM films WHERE id = ?',
    ).get(resultat.lastInsertRowid);

    if (!ligne) {
        throw new Error('Impossible de relire le film ajouté.');
    }

    res.status(201).json(convertirFilm(ligne));
});

app.patch('/api/films/:id', (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id)) {
        res.status(404).json({ error: 'Film introuvable' });
        return;
    }

    if (typeof req.body?.watched !== 'boolean') {
        res.status(400).json({ error: 'Le statut watched doit être un booléen' });
        return;
    }

    const resultat = db.prepare(
        'UPDATE films SET watched = ? WHERE id = ?',
    ).run(req.body.watched ? 1 : 0, id);

    if (Number(resultat.changes) === 0) {
        res.status(404).json({ error: 'Film introuvable' });
        return;
    }

    const ligne = db.prepare(
        'SELECT id, title, year, overview, watched FROM films WHERE id = ?',
    ).get(id);

    if (!ligne) {
        throw new Error('Impossible de relire le film modifié.');
    }

    res.json(convertirFilm(ligne));
});

app.delete('/api/films/:id', (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id)) {
        res.status(404).json({ error: 'Film introuvable' });
        return;
    }

    const resultat = db.prepare(
        'DELETE FROM films WHERE id = ?',
    ).run(id);

    if (Number(resultat.changes) === 0) {
        res.status(404).json({ error: 'Film introuvable' });
        return;
    }

    res.status(204).end();
});

app.listen(3000);