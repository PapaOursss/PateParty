import { useState, type FormEvent } from 'react';
import type { Movie } from '../donnees/films';

function isMovie(value: unknown): value is Movie {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'number' &&
    'title' in value &&
    typeof value.title === 'string' &&
    'year' in value &&
    typeof value.year === 'number' &&
    'overview' in value &&
    typeof value.overview === 'string'
  );
}

export function AjoutFilm({ onAdded }: { onAdded: (movie: Movie) => void }) {
  const [title, setTitle] = useState('');
  const [year, setYear] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setError(null);

    try {
      const response = await fetch('/api/films', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, year: Number(year) }),
      });
      const data: unknown = await response.json();

      if (!response.ok) {
        const message =
          typeof data === 'object' && data !== null && 'error' in data && typeof data.error === 'string'
            ? data.error
            : `Erreur HTTP ${response.status}`;
        setError(message);
        return;
      }

      if (!isMovie(data)) {
        setError('Le serveur a renvoyé un film dans un format inattendu.');
        return;
      }

      onAdded(data);
      setTitle('');
      setYear('');
    } catch {
      setError('Impossible de joindre le serveur ou de lire sa réponse.');
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Ajouter un film</h2>
      <label htmlFor="new-film-title">Titre</label>
      <input
        id="new-film-title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />
      <label htmlFor="new-film-year">Année</label>
      <input
        id="new-film-year"
        type="number"
        step="any"
        value={year}
        onChange={(event) => setYear(event.target.value)}
      />
      <p>
        <button type="submit" disabled={sending}>
          {sending ? 'Envoi…' : 'Ajouter'}
        </button>
      </p>
      {error && <p className="error" role="alert">{error}</p>}
    </form>
  );
}
