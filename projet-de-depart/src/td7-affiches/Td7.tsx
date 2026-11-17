// Corrigé — TD 7 — Les affiches : la liste chargée avec fetch, avec la recherche.
// TD 10 : la grille charge /api/films, depuis le serveur ; le proxy de Vite transmet la requête au port 3000.
// « Aller plus loin » du TD 7 (sélection, filtre par année, tri, résumé au clic) : Td7-plus-loin.tsx.
import { useEffect, useState } from 'react';
import type { Movie } from '../donnees/films';
import { AjoutFilm } from './AjoutFilm';

export function Td7() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<{ id: number; message: string } | null>(null);

  async function updateFilm(movie: Movie, method: 'PATCH' | 'DELETE') {
    setPendingId(movie.id);
    setActionError(null);
    try {
      const response = await fetch(`/api/films/${movie.id}`, {
        method,
        ...(method === 'PATCH' && {
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ watched: !movie.watched }),
        }),
      });
      if (!response.ok) {
        throw new Error(
          response.status === 404
            ? 'Ce film est introuvable sur le serveur.'
            : `Le serveur a refusé la demande (HTTP ${response.status}).`,
        );
      }

      if (method === 'DELETE') {
        if (response.status !== 204) throw new Error(`Erreur HTTP ${response.status}`);
        setMovies((current) => current.filter((film) => film.id !== movie.id));
      } else {
        const updated: Movie = await response.json();
        setMovies((current) => current.map((film) => (film.id === movie.id ? updated : film)));
      }
    } catch (error) {
      setActionError({
        id: movie.id,
        message: error instanceof Error ? error.message : 'Impossible de joindre le serveur.',
      });
    } finally {
      setPendingId(null);
    }
  }

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch('/api/films');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data: Movie[] = await response.json();
        setMovies(data);
      } catch {
        setError('Le serveur ne répond pas. Est-il lancé (npm run server) ?');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const visible = movies.filter((m) => m.title.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <main>
      <h1>TD 7 — Les affiches</h1>
      <AjoutFilm onAdded={(movie) => setMovies((current) => [...current, movie])} />
      <label htmlFor="query">Rechercher un film</label>
      <input id="query" value={query} onChange={(e) => setQuery(e.target.value)} />
      {loading && <p>Chargement des films…</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && (
        <>
          <p>{visible.length} film(s)</p>
          {visible.length === 0 && <p>Aucun film ne correspond.</p>}
          <div className="catalog">
            {visible.map((movie) => (
              <article className="movie" key={movie.id}>
                <div className={`poster tone-${movie.id % 6}`}>
                  <span>{movie.watched ? 'Déjà vu' : 'À voir'}</span>
                  <strong>{movie.title}</strong>
                  <span>{movie.year}</span>
                </div>
                <h3>{movie.title}</h3>
                <p className="year">{movie.year}</p>
                <button disabled={pendingId !== null} onClick={() => void updateFilm(movie, 'PATCH')}>
                  {movie.watched ? 'À voir' : 'Vu'}
                </button>{' '}
                <button
                  className="delete-button"
                  disabled={pendingId !== null}
                  onClick={() => {
                    if (window.confirm(`Confirmer la suppression de « ${movie.title} » ?`)) {
                      void updateFilm(movie, 'DELETE');
                    }
                  }}
                >
                  Supprimer
                </button>
                {actionError?.id === movie.id && (
                  <p className="error" role="alert">{actionError.message}</p>
                )}
              </article>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
