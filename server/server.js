import { createServer } from 'node:http'
import { DatabaseSync } from 'node:sqlite'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import filmsInitiaux from './films.json' with { type: 'json' }

const PORT = 3000

const base = new DatabaseSync(join(dirname(fileURLToPath(import.meta.url)), 'films.db'))
base.exec(`
  CREATE TABLE IF NOT EXISTS films (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titre TEXT NOT NULL,
    annee INTEGER NOT NULL,
    resume TEXT NOT NULL DEFAULT '',
    affiche TEXT NOT NULL DEFAULT '',
    vu INTEGER NOT NULL DEFAULT 0
  )
`)

if (base.prepare('SELECT COUNT(*) AS nombre FROM films').get().nombre === 0) {
  const insererInitial = base.prepare('INSERT INTO films (id, titre, annee, resume, affiche) VALUES (?, ?, ?, ?, ?)')
  for (const film of filmsInitiaux) {
    insererInitial.run(film.id, film.titre, film.annee, film.resume, film.affiche)
  }
}

const COLONNES = 'id, titre, annee, resume, affiche, vu'
const requetes = {
  tous: base.prepare(`SELECT ${COLONNES} FROM films ORDER BY id`),
  parAnnee: base.prepare(`SELECT ${COLONNES} FROM films WHERE annee = ? ORDER BY id`),
  parId: base.prepare(`SELECT ${COLONNES} FROM films WHERE id = ?`),
  ajouter: base.prepare('INSERT INTO films (titre, annee, resume, affiche) VALUES (?, ?, ?, ?)'),
  modifierVu: base.prepare('UPDATE films SET vu = ? WHERE id = ?'),
  supprimer: base.prepare('DELETE FROM films WHERE id = ?'),
}

function lireFilm(ligne) {
  return ligne ? { ...ligne, vu: ligne.vu === 1 } : undefined
}

function envoyerJson(response, statut, donnees) {
  response.writeHead(statut, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
  })
  response.end(JSON.stringify(donnees))
}

async function lireCorps(request) {
  let corps = ''
  for await (const morceau of request) {
    corps += morceau
  }
  return corps
}

async function ajouterFilm(request, response) {
  let donnees
  try {
    donnees = JSON.parse(await lireCorps(request))
  } catch {
    envoyerJson(response, 400, { erreur: 'Le corps de la requête doit être du JSON valide' })
    return
  }

  const titre = typeof donnees?.titre === 'string' ? donnees.titre.trim() : ''
  if (titre.length < 1 || titre.length > 80) {
    envoyerJson(response, 400, { erreur: 'Le titre doit faire entre 1 et 80 caractères' })
    return
  }

  const annee = Number(donnees?.annee)
  if (!Number.isInteger(annee) || annee < 1888 || annee > 2030) {
    envoyerJson(response, 400, { erreur: "L'année doit être un nombre entier entre 1888 et 2030" })
    return
  }

  const resultat = requetes.ajouter.run(titre, annee, '', '')
  envoyerJson(response, 201, lireFilm(requetes.parId.get(resultat.lastInsertRowid)))
}

async function modifierFilm(request, response, id) {
  let donnees
  try {
    donnees = JSON.parse(await lireCorps(request))
  } catch {
    envoyerJson(response, 400, { erreur: 'Le corps de la requête doit être du JSON valide' })
    return
  }

  if (typeof donnees?.vu !== 'boolean') {
    envoyerJson(response, 400, { erreur: 'Le champ vu doit valoir true ou false' })
    return
  }

  requetes.modifierVu.run(donnees.vu ? 1 : 0, id)
  envoyerJson(response, 200, lireFilm(requetes.parId.get(id)))
}

const URL_AFFICHE = 'https://image.tmdb.org/t/p/w500'

async function rechercherFilms(response, titre) {
  if (titre.length === 0) {
    envoyerJson(response, 400, { erreur: 'Le titre à chercher ne doit pas être vide' })
    return
  }

  const adresse = new URL('https://api.themoviedb.org/3/search/movie')
  adresse.searchParams.set('query', titre)
  adresse.searchParams.set('language', 'fr-FR')

  let reponseTmdb
  try {
    reponseTmdb = await fetch(adresse, {
      headers: { Authorization: `Bearer ${process.env.TMDB_TOKEN ?? ''}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    })
  } catch (erreur) {
    console.error('TMDB ne répond pas :', erreur.message)
    envoyerJson(response, 502, { erreur: 'TMDB ne répond pas, réessaie plus tard' })
    return
  }

  if (!reponseTmdb.ok) {
    console.error(`TMDB a refusé la recherche (statut ${reponseTmdb.status}) : vérifie TMDB_TOKEN dans server/.env`)
    envoyerJson(response, 502, { erreur: 'TMDB a refusé la recherche' })
    return
  }

  let donnees
  try {
    donnees = await reponseTmdb.json()
  } catch {
    console.error('TMDB a répondu sans JSON valide')
    envoyerJson(response, 502, { erreur: 'TMDB a répondu de façon inattendue' })
    return
  }
  const films = donnees.results.map((film) => ({
    id: film.id,
    titre: film.title,
    annee: film.release_date ? Number(film.release_date.slice(0, 4)) : null,
    affiche: film.poster_path ? `${URL_AFFICHE}${film.poster_path}` : null,
  }))
  envoyerJson(response, 200, films)
}

const server = createServer((request, response) => {
  const url = new URL(request.url ?? '/', `http://localhost:${PORT}`)

  if (request.method === 'GET' && url.pathname === '/api/sante') {
    envoyerJson(response, 200, { tmdb: process.env.TMDB_TOKEN ? 'présent' : 'absent' })
    return
  }

  if (request.method === 'GET' && url.pathname === '/api/recherche') {
    rechercherFilms(response, (url.searchParams.get('titre') ?? '').trim())
    return
  }

  if (request.method === 'POST' && url.pathname === '/api/films') {
    ajouterFilm(request, response)
    return
  }

  if (request.method === 'GET' && url.pathname === '/api/films') {
    response.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
    })
    const annee = url.searchParams.get('annee')
    const lignes = annee === null
      ? requetes.tous.all()
      : requetes.parAnnee.all(Number(annee))
    response.end(JSON.stringify(lignes.map(lireFilm)))
    return
  }

  const correspondanceFilm = url.pathname.match(/^\/api\/films\/([^/]+)$/)
  if (correspondanceFilm && ['GET', 'PATCH', 'DELETE'].includes(request.method)) {
    const identifiant = correspondanceFilm[1]
    if (!/^\d+$/.test(identifiant)) {
      response.writeHead(400, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      })
      response.end(JSON.stringify({ erreur: "L'identifiant doit être un nombre entier" }))
      return
    }

    const film = lireFilm(requetes.parId.get(Number(identifiant)))
    if (!film) {
      envoyerJson(response, 404, { erreur: 'Film introuvable' })
      return
    }

    if (request.method === 'DELETE') {
      requetes.supprimer.run(film.id)
      response.writeHead(204, { 'Access-Control-Allow-Origin': '*' })
      response.end()
      return
    }

    if (request.method === 'PATCH') {
      modifierFilm(request, response, film.id)
      return
    }

    envoyerJson(response, 200, film)
    return
  }

  response.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' })
  response.end(JSON.stringify({ erreur: 'Route introuvable' }))
})

server.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}/api/films`)
})
