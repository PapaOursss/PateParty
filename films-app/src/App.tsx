import { useEffect, useState } from "react";
import "./App.css";

type Film = {
  id: number;
  title: string;
  year: number;
  overview: string;
};

function App() {
  const [films, setFilms] = useState<Film[]>([]);
  const [recherche, setRecherche] = useState("");
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    fetch("/api/films")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Erreur HTTP ${response.status}`);
        }
        return response.json() as Promise<Film[]>;
      })
      .then(setFilms)
      .catch(() => setErreur("Impossible de charger les films. Vérifie que le serveur fonctionne."))
      .finally(() => setChargement(false));
  }, []);

  const filmsFiltres = films.filter((film) =>
    film.title.toLowerCase().includes(recherche.toLowerCase()),
  );

  if (chargement) return <p>Chargement des films…</p>;
  if (erreur) return <p>{erreur}</p>;

  return (
    <main>
      <h1>TD 10 — React lit ton API</h1>

      <label htmlFor="recherche">Rechercher un film</label>
      <br />
      <input
        id="recherche"
        value={recherche}
        onChange={(event) => setRecherche(event.target.value)}
      />

      <p>{filmsFiltres.length} film(s)</p>

      <div className="grille-films">
        {filmsFiltres.map((film) => (
          <article key={film.id}>
            <h2>{film.title}</h2>
            <p>{film.year}</p>
            <p>{film.overview}</p>
          </article>
        ))}
      </div>
    </main>
  );
}

export default App;