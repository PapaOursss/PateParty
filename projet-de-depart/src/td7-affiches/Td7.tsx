// Corrigé — TD 7 — Les affiches : la liste chargée avec fetch, avec la recherche.
// « Aller plus loin » (sélection, filtre par année, tri, résumé au clic) : Td7-plus-loin.tsx.
import { useEffect, useState } from 'react';
import type { Movie } from '../donnees/films';

function FilmCard({ movie }: { movie: Movie }) {
  return (
    <article className="movie">
      <div className={`poster tone-${movie.id % 6}`}>
        <span>Au cinéma</span>
        <strong>{movie.title}</strong>
        <span>{movie.year}</span>
      </div>
      <h3>{movie.title}</h3>
      <p className="year">{movie.year}</p>
    </article>
  );
}

export function Td7() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/films');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data: Movie[] = await response.json();
        if (cancelled) return;
        setMovies(data);
      } catch {
        if (!cancelled) {
          setError('Impossible de charger les films. Vérifie que le serveur est lancé.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [retryCount]);

  function retryLoading() {
    setLoading(true);
    setError(null);
    setRetryCount((count) => count + 1);
  }

  const visible = movies.filter((m) => m.title.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <main>
      <h1>TD 7 — Les affiches</h1>
      <label htmlFor="query">Rechercher un film</label>
      <input id="query" value={query} onChange={(e) => setQuery(e.target.value)} />
      {loading && <p>Chargement des films…</p>}
      {error && (
        <div>
          <p className="error">{error}</p>
          <button onClick={retryLoading}>Réessayer</button>
        </div>
      )}
      {!loading && !error && (
        <>
          <p>{visible.length} film(s)</p>
          {visible.length === 0 && <p>Aucun film ne correspond.</p>}
          <div className="catalog">
            {visible.map((movie) => (
              <FilmCard key={movie.id} movie={movie} />
            ))}
          </div>
        </>
      )}
    </main>
  );
}
