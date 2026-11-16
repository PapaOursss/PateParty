import { useState, type FormEvent } from 'react'

type FilmTmdb = {
  id: number
  titre: string
  annee: number | null
  affiche: string | null
}

function isFilmTmdb(value: unknown): value is FilmTmdb {
  return typeof value === 'object'
    && value !== null
    && 'id' in value
    && typeof value.id === 'number'
    && 'titre' in value
    && typeof value.titre === 'string'
    && 'annee' in value
    && (typeof value.annee === 'number' || value.annee === null)
    && 'affiche' in value
    && (typeof value.affiche === 'string' || value.affiche === null)
}

function messageErreur(data: unknown, statut: number) {
  return typeof data === 'object' && data !== null && 'erreur' in data && typeof data.erreur === 'string'
    ? data.erreur
    : `Le serveur a répondu HTTP ${statut}.`
}

function RechercheTmdb() {
  const [titre, setTitre] = useState('')
  const [films, setFilms] = useState<FilmTmdb[]>([])
  const [recherchee, setRecherchee] = useState(false)
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState('')

  async function rechercher(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setEnCours(true)
    setErreur('')
    try {
      const response = await fetch(`/api/recherche?titre=${encodeURIComponent(titre)}`)
      const data: unknown = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(messageErreur(data, response.status))
      }
      if (!Array.isArray(data) || !data.every(isFilmTmdb)) {
        throw new Error('Le serveur a renvoyé une réponse invalide.')
      }
      setFilms(data)
      setRecherchee(true)
    } catch (error: unknown) {
      setFilms([])
      setRecherchee(false)
      setErreur(error instanceof Error ? error.message : 'Impossible de faire la recherche.')
    } finally {
      setEnCours(false)
    }
  }

  return (
    <section className="search">
      <form onSubmit={rechercher}>
        <div className="search-fields">
          <div>
            <label htmlFor="recherche-tmdb" className="prenom-label">Chercher un film sur TMDB</label>
            <input
              id="recherche-tmdb"
              type="text"
              className="prenom-input"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
            />
          </div>
          <div>
            <button type="submit" className="film-select" disabled={enCours}>
              {enCours ? 'Recherche…' : 'Chercher'}
            </button>
          </div>
        </div>
      </form>

      {erreur && <p className="search-error" role="alert">{erreur}</p>}
      {recherchee && films.length === 0 && !erreur && (
        <p className="search-empty">Aucun film trouvé pour cette recherche.</p>
      )}
      {films.length > 0 && (
        <>
          <p className="search-count">{films.length} résultat{films.length > 1 ? 's' : ''}</p>
          <section className="film-grid">
            {films.map((film) => (
              <article key={film.id} className="film-card">
                <div className="film-poster">
                  {film.affiche
                    ? <img src={film.affiche} alt={`Affiche de ${film.titre}`} className="film-poster-image" />
                    : <p className="film-summary">Pas d’affiche</p>}
                </div>
                <div className="film-details">
                  <h2 className="film-title">{film.titre}</h2>
                  <p className="film-year">{film.annee ?? 'Année inconnue'}</p>
                </div>
              </article>
            ))}
          </section>
        </>
      )}

      <footer className="tmdb-attribution">
        <img src="/tmdb-logo.svg" alt="Logo TMDB" width="80" />
        <p>This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
      </footer>
    </section>
  )
}

export default RechercheTmdb
