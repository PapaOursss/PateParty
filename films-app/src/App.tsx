import { useEffect, useState, type FormEvent } from 'react'
import './App.css'
import Cpt from './Cpt'
import FilmCard, { type Film } from './FilmCard'
import Minuteur from './Minuteur'
import Prenom from './Prenom'

type FilmStatus = 'loading' | 'success' | 'error'

let filmsRequest: Promise<Film[]> | null = null

function isFilm(value: unknown): value is Film {
  return typeof value === 'object'
    && value !== null
    && 'titre' in value
    && typeof value.titre === 'string'
    && 'annee' in value
    && typeof value.annee === 'number'
    && 'resume' in value
    && typeof value.resume === 'string'
    && 'affiche' in value
    && typeof value.affiche === 'string'
    && 'vu' in value
    && typeof value.vu === 'boolean'
}

function isFilmList(value: unknown): value is Film[] {
  return Array.isArray(value) && value.every(isFilm)
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
  const [nouveauTitre, setNouveauTitre] = useState('')
  const [nouvelleAnnee, setNouvelleAnnee] = useState('')
  const [erreurAjout, setErreurAjout] = useState('')
  const [ajoutEnCours, setAjoutEnCours] = useState(false)
  const [erreurCarte, setErreurCarte] = useState('')

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

  async function ajouterFilm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAjoutEnCours(true)
    setErreurAjout('')
    try {
      const response = await fetch('/api/films', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titre: nouveauTitre, annee: nouvelleAnnee }),
      })
      const data: unknown = await response.json()
      if (!response.ok) {
        const message = typeof data === 'object' && data !== null && 'erreur' in data && typeof data.erreur === 'string'
          ? data.erreur
          : `Le serveur a répondu HTTP ${response.status}.`
        throw new Error(message)
      }
      if (!isFilm(data)) {
        throw new Error('Le serveur a renvoyé un film invalide.')
      }
      setFilms((listeActuelle) => [...listeActuelle, data])
      setNouveauTitre('')
      setNouvelleAnnee('')
    } catch (error: unknown) {
      setErreurAjout(error instanceof Error ? error.message : 'Impossible d’ajouter le film.')
    } finally {
      setAjoutEnCours(false)
    }
  }

  async function basculerVu(film: Film) {
    setErreurCarte('')
    try {
      const response = await fetch(`/api/films/${film.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vu: !film.vu }),
      })
      if (!response.ok) {
        throw new Error(`Le serveur a répondu HTTP ${response.status}.`)
      }
      const data: unknown = await response.json()
      if (!isFilm(data)) {
        throw new Error('Le serveur a renvoyé un film invalide.')
      }
      setFilms((listeActuelle) => listeActuelle.map((f) => (f.id === film.id ? data : f)))
    } catch {
      setErreurCarte('Impossible de mettre à jour le film. Vérifie que le serveur est lancé.')
    }
  }

  async function supprimerFilm(film: Film) {
    setErreurCarte('')
    try {
      const response = await fetch(`/api/films/${film.id}`, { method: 'DELETE' })
      if (!response.ok) {
        throw new Error(`Le serveur a répondu HTTP ${response.status}.`)
      }
      setFilms((listeActuelle) => listeActuelle.filter((f) => f.id !== film.id))
      setFilmsSelectionnes((selection) => selection.filter((filmTitre) => filmTitre !== film.titre))
    } catch {
      setErreurCarte('Impossible de supprimer le film. Vérifie que le serveur est lancé.')
    }
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
          <form className="search" onSubmit={ajouterFilm}>
            <div className="search-fields">
              <div>
                <label htmlFor="nouveau-titre" className="prenom-label">Titre du film</label>
                <input
                  id="nouveau-titre"
                  type="text"
                  className="prenom-input"
                  value={nouveauTitre}
                  onChange={(e) => setNouveauTitre(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="nouvelle-annee" className="prenom-label">Année</label>
                <input
                  id="nouvelle-annee"
                  type="number"
                  className="prenom-input"
                  value={nouvelleAnnee}
                  onChange={(e) => setNouvelleAnnee(e.target.value)}
                />
              </div>
              <div>
                <button type="submit" className="film-select" disabled={ajoutEnCours}>
                  {ajoutEnCours ? 'Ajout…' : 'Ajouter le film'}
                </button>
              </div>
            </div>
            {erreurAjout && (
              <p className="search-error" role="alert">{erreurAjout}</p>
            )}
          </form>
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
          {erreurCarte && (
            <p className="search-error" role="alert">{erreurCarte}</p>
          )}
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
                  onToggleVu={() => basculerVu(film)}
                  onDelete={() => supprimerFilm(film)}
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
