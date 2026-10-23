import { createServer } from 'node:http'
import films from './films.json' with { type: 'json' }

const PORT = 3000

const server = createServer((request, response) => {
  const url = new URL(request.url ?? '/', `http://localhost:${PORT}`)

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

  response.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' })
  response.end(JSON.stringify({ erreur: 'Route introuvable' }))
})

server.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}/api/films`)
})
