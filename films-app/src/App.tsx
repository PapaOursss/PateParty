import { useEffect, useState } from 'react'
import './App.css'
import Cpt from './Cpt'
import FilmCard, { type Film } from './FilmCard'
import Minuteur from './Minuteur'
import Prenom from './Prenom'

type FilmStatus = 'loading' | 'success' | 'error'

let filmsRequest: Promise<Film[]> | null = null

function isFilmList(value: unknown): value is Film[] {
  return Array.isArray(value) && value.every((film: unknown) => (
    typeof film === 'object'
    && film !== null
    && 'titre' in film
    && typeof film.titre === 'string'
    && 'annee' in film
    && typeof film.annee === 'number'
    && 'resume' in film
    && typeof film.resume === 'string'
    && 'affiche' in film
    && typeof film.affiche === 'string'
  ))
}

function chargerFilms() {
  if (!filmsRequest) {
    filmsRequest = fetch('/api/films')
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Le serveur ne répond pas (HTTP ${response.status}). Vérifie qu’il est lancé (npm start dans le dossier server).`)
        }

        const data: unknown = await response.json()
        if (!isFilmList(data)) {
          throw new Error('Le serveur a renvoyé une liste de films invalide.')
        }
        return data
      })
      .catch((error: unknown) => {
        filmsRequest = null
        throw error
      })
  }
  return filmsRequest
}

function App() {
  const [films, setFilms] = useState<Film[]>([])
  const [statutFilms, setStatutFilms] = useState<FilmStatus>('loading')
  const [erreurFilms, setErreurFilms] = useState('')
  const [recherche, setRecherche] = useState('')
  const [anneeSelectionnee, setAnneeSelectionnee] = useState('')
  const [tri, setTri] = useState<'titre' | 'annee'>('titre')
  const [filmsSelectionnes, setFilmsSelectionnes] = useState<string[]>([])

  useEffect(() => {
    let actif = true
    chargerFilms()
      .then((filmsCharges) => {
        if (actif) {
          setFilms(filmsCharges)
          setStatutFilms('success')
        }
      })
      .catch((error: unknown) => {
        if (actif) {
          setErreurFilms(
            error instanceof Error
              ? `Impossible de charger les films. ${error.message}`
              : 'Impossible de charger les films à cause d’une erreur inconnue.',
          )
          setStatutFilms('error')
        }
      })

    return () => {
      actif = false
    }
  }, [])

  const texte = recherche.trim().toLowerCase()
  const annees = [...new Set(films.map((film) => film.annee))].sort((a, b) => b - a)
  const filtres = films
    .filter((film) => (
      film.titre.toLowerCase().includes(texte)
      && (anneeSelectionnee === '' || film.annee === Number(anneeSelectionnee))
    ))
    .sort((a, b) => (
      tri === 'titre'
        ? a.titre.localeCompare(b.titre, 'fr')
        : a.annee - b.annee || a.titre.localeCompare(b.titre, 'fr')
    ))

  function basculerSelection(titre: string) {
    setFilmsSelectionnes((selection) => (
      selection.includes(titre)
        ? selection.filter((filmTitre) => filmTitre !== titre)
        : [...selection, titre]
    ))
  }

  return (
    <main className="page">
      <h1 className="page-title">TD 1 — Mes films</h1>
      <Cpt />
      <Minuteur />
      <Prenom />
      {statutFilms === 'loading' && (
        <p className="search-status" role="status">Chargement des films…</p>
      )}
      {statutFilms === 'error' && (
        <p className="search-error" role="alert">{erreurFilms}</p>
      )}
      {statutFilms === 'success' && (
        <>
          <div className="search">
            <div className="search-fields">
              <div>
                <label htmlFor="search-input" className="prenom-label">Rechercher un film</label>
                <input
                  id="search-input"
                  type="search"
                  className="prenom-input"
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="year-filter" className="prenom-label">Filtrer par année</label>
                <select
                  id="year-filter"
                  className="prenom-input"
                  value={anneeSelectionnee}
                  onChange={(e) => setAnneeSelectionnee(e.target.value)}
                >
                  <option value="">Toutes les années</option>
                  {annees.map((annee) => (
                    <option key={annee} value={annee}>{annee}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="sort-films" className="prenom-label">Trier par</label>
                <select
                  id="sort-films"
                  className="prenom-input"
                  value={tri}
                  onChange={(e) => setTri(e.target.value as 'titre' | 'annee')}
                >
                  <option value="titre">Titre</option>
                  <option value="annee">Année</option>
                </select>
              </div>
            </div>
            <p className="search-count">
              {filtres.length} résultat{filtres.length > 1 ? 's' : ''}
            </p>
            <p className="selected-count" aria-live="polite">
              {filmsSelectionnes.length} film{filmsSelectionnes.length > 1 ? 's' : ''} sélectionné{filmsSelectionnes.length > 1 ? 's' : ''}
            </p>
          </div>
          {filtres.length === 0 ? (
            <p className="search-empty">Aucun film ne correspond à ta recherche.</p>
          ) : (
            <section className="film-grid">
              {filtres.map((film) => (
                <FilmCard
                  key={film.titre}
                  film={film}
                  selected={filmsSelectionnes.includes(film.titre)}
                  onToggleSelected={() => basculerSelection(film.titre)}
                />
              ))}
            </section>
          )}
        </>
      )}
    </main>
  )
}

export default App
