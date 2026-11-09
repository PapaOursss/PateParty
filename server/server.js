import { createServer } from 'node:http'
import films from './films.json' with { type: 'json' }

const PORT = 3000

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

  const film = {
    id: Math.max(0, ...films.map((f) => f.id)) + 1,
    titre,
    annee,
    resume: '',
    affiche: '',
  }
  films.push(film)
  envoyerJson(response, 201, film)
}

const server = createServer((request, response) => {
  const url = new URL(request.url ?? '/', `http://localhost:${PORT}`)

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
    const resultat = annee === null
      ? films
      : films.filter((film) => film.annee === Number(annee))
    response.end(JSON.stringify(resultat))
    return
  }

  const correspondanceFilm = url.pathname.match(/^\/api\/films\/([^/]+)$/)
  if (request.method === 'GET' && correspondanceFilm) {
    const identifiant = correspondanceFilm[1]
    if (!/^\d+$/.test(identifiant)) {
      response.writeHead(400, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      })
      response.end(JSON.stringify({ erreur: "L'identifiant doit être un nombre entier" }))
      return
    }

    const film = films.find((f) => f.id === Number(identifiant))
    if (film === undefined) {
      response.writeHead(404, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      })
      response.end(JSON.stringify({ erreur: 'Film introuvable' }))
      return
    }

    response.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
    })
    response.end(JSON.stringify(film))
    return
  }

  response.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' })
  response.end(JSON.stringify({ erreur: 'Route introuvable' }))
})

server.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}/api/films`)
})
